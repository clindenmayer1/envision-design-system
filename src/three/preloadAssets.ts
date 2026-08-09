/*
 * Byte-accurate asset preloader for the kitchen scene — the SINGLE source of real load progress.
 *
 * The scene blocks its first render on a fixed set of assets: the main kitchen GLB, every
 * pull/door/faucet/prop GLB (useGLTF), and every countertop / backsplash / floor texture plus
 * the window-garden image (useTexture — these all SUSPEND the scene until they resolve). We
 * stream-download that whole set here, summing REAL bytes so the progress bar maps to the true
 * download — never a simulated or timed animation.
 *
 * How the bar stays honest, moves immediately, AND never deadlocks:
 *   - Bodies stream through a BOUNDED worker pool. Browsers cap ~6 connections/host; a pool that
 *     reads each body to completion before starting the next request frees connections as it goes,
 *     so we never starve the connection pool (a fire-all-at-once approach does, and a HEAD pre-pass
 *     freezes the bar at 0 for seconds on slow links).
 *   - Each asset's byte size comes from its own GET response's Content-Length, so the first bytes
 *     move the bar right away. The total is extrapolated from the sizes seen so far (the big GLBs
 *     load first, so it's realistic within one round-trip), and the reported value is clamped to a
 *     running maximum — it only ever moves FORWARD on real byte arrival, never backward.
 *
 * GLB buffers are stashed in THREE.Cache so useGLTF's FileLoader reuses them (no second
 * download). Texture bodies are streamed for their bytes and left to the browser HTTP cache, so
 * the scene's TextureLoader/ImageLoader re-reads them from disk (no second network fetch).
 *
 * Failures never hang the loader: each failed asset is logged with its URL, dropped from the byte
 * total, and reported back. The caller decides whether a failure is fatal (an ESSENTIAL asset —
 * the model can't render) or nonessential (skip and carry on).
 */
import * as THREE from 'three'
import {
  CABINET_STYLES, HARDWARE_STYLES, FAUCET_STYLES,
  COUNTERTOP_MATERIALS, BACKSPLASH_MATERIALS,
} from './materials'

THREE.Cache.enabled = true

const STREAM_CONCURRENCY = 8

// ── The required-asset manifest ──────────────────────────────────────────────
// The main kitchen GLB is ESSENTIAL — if it fails the scene has nothing to render.
const MAIN_KITCHEN = '/envision_kitchen_clean_test.glb'
const PROP_GLBS = [MAIN_KITCHEN, '/Fiddle_leaf_fig.glb', '/6_Can_Light.glb']

const GLB_URLS: string[] = Array.from(
  new Set(
    [
      ...PROP_GLBS,
      ...HARDWARE_STYLES.map((o) => o.model),
      ...CABINET_STYLES.map((o) => o.model),
      ...FAUCET_STYLES.map((o) => o.model),
    ].filter((u): u is string => typeof u === 'string' && u.endsWith('.glb')),
  ),
)

// Textures the scene SUSPENDS on before it can display (mirrors KitchenScene's useTexture calls,
// derived from the same material constants so it stays in sync). 'calacatta' countertop and
// 'matching-stone' backsplash are authored into the GLB (no texture files) — excluded, exactly
// as the scene excludes them.
const COUNTERTOP_TEX_IDS = COUNTERTOP_MATERIALS.filter((o) => o.id !== 'calacatta').map((o) => o.id)
const BACKSPLASH_TEX_IDS = BACKSPLASH_MATERIALS.filter((o) => o.id !== 'matching-stone').map((o) => o.id)
const FLOOR_TEX_FILES = [
  'stone006_color', 'concrete_color', 'blondewood_color', 'checker_color',
  'charcoaltile_color', 'woodchevron_color', 'darkpine_color', 'terracottahex_color',
]

const TEXTURE_URLS: string[] = [
  ...COUNTERTOP_TEX_IDS.flatMap((id) => [
    `/textures/countertops/${id}_color.jpg`,
    `/textures/countertops/${id}_normal.jpg`,
  ]),
  ...BACKSPLASH_TEX_IDS.flatMap((id) => [
    `/textures/backsplash/${id}_color.jpg`,
    `/textures/backsplash/${id}_normal.jpg`,
    `/textures/backsplash/${id}_rough.jpg`,
  ]),
  ...FLOOR_TEX_FILES.map((f) => `/textures/floor/${f}.jpg`),
  '/garden.jpg',
]

interface Task {
  url: string
  /** GLB buffers are kept in THREE.Cache; texture bytes are streamed then discarded. */
  keep: boolean
  /** Failure of an essential asset means the scene cannot render. */
  essential: boolean
  /** Rough byte prior (order-of-magnitude) so the progress denominator is realistic from the very
   *  first frame, before any real Content-Length has arrived. Replaced by the true size per asset
   *  as its GET response comes in — the prior only shapes the bar in the first round-trip. */
  estBytes: number
}

// Priors from the actual asset footprint: ~76MB of GLBs over ~30 files, ~40MB of textures over
// ~90 files. Only used until each asset's real size is known.
const GLB_EST = 2_500_000
const TEX_EST = 450_000

const TASKS: Task[] = [
  ...GLB_URLS.map((url) => ({ url, keep: true, essential: url === MAIN_KITCHEN, estBytes: GLB_EST })),
  ...TEXTURE_URLS.map((url) => ({ url, keep: false, essential: false, estBytes: TEX_EST })),
]

/** Every URL the preloader is responsible for (model + textures). */
export const PRELOAD_URLS: string[] = TASKS.map((t) => t.url)

/** True once every GLB is already in THREE.Cache — the heavy assets are warm and the scene can
 *  be shown immediately with no preloader (e.g. re-entering the Design Center in a session). */
export function allAssetsCached(): boolean {
  return GLB_URLS.length > 0 && GLB_URLS.every((u) => THREE.Cache.get(u) !== undefined)
}

export interface PreloadResult {
  /** True if no essential asset failed (the scene can render). */
  ok: boolean
  /** URLs that failed to download (each logged as it fails). */
  failed: string[]
  /** True if an ESSENTIAL asset failed — the model cannot be rendered. */
  fatal: boolean
}

/** Run `worker` over `items` with at most `concurrency` in flight at once. Frees each slot as its
 *  worker settles, so we never hold more connections open than the browser allows. */
async function pool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  const runners = new Array(Math.min(concurrency, items.length)).fill(0).map(async () => {
    while (next < items.length) {
      const i = next++
      await worker(items[i])
    }
  })
  await Promise.all(runners)
}

/**
 * Stream every required asset, reporting real aggregate byte progress (0–100), and resolve with a
 * summary of what loaded and what failed. `onProgress` fires only on real byte arrival; it is
 * monotonic (never moves backward) and capped at 99 until the caller confirms the scene has
 * actually rendered. Always resolves — it never rejects or hangs.
 */
export async function preloadAssets(onProgress: (percent: number) => void): Promise<PreloadResult> {
  onProgress(0)

  const toStream = TASKS.filter((t) => !(t.keep && THREE.Cache.get(t.url)))
  if (toStream.length === 0) { onProgress(99); return { ok: true, failed: [], fatal: false } }

  const sizes = new Map<string, number>() // url → real Content-Length, once its GET starts
  const loaded = new Map<string, number>() // url → bytes read so far
  const dropped = new Set<string>() // urls that failed — removed from the total
  const failed: string[] = []
  let fatal = false
  let reportedMax = 0

  // Denominator = each asset's REAL size if known, else its byte prior. Stable and realistic from
  // t=0 (~105MB), refined per-asset as sizes arrive. Progress is real bytesLoaded / that total,
  // clamped to a running max so it only ever moves forward on real byte arrival.
  const report = () => {
    let denom = 0
    for (const t of toStream) {
      if (dropped.has(t.url)) continue
      denom += sizes.get(t.url) ?? t.estBytes
    }
    let done = 0
    for (const v of loaded.values()) done += v
    const pct = denom > 0 ? Math.min(99, (done / denom) * 100) : 0
    if (pct > reportedMax) { reportedMax = pct; onProgress(reportedMax) }
  }

  await pool(toStream, STREAM_CONCURRENCY, async (task) => {
    try {
      const res = await fetch(task.url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const len = Number(res.headers.get('content-length') || 0)
      if (len > 0) sizes.set(task.url, len)
      report() // refine the denominator as soon as this size is known

      if (!res.body) {
        const buf = await res.arrayBuffer()
        if (task.keep) THREE.Cache.add(task.url, buf)
        sizes.set(task.url, buf.byteLength)
        loaded.set(task.url, buf.byteLength)
        report()
        return
      }
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let count = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        count += value.length
        if (task.keep) chunks.push(value)
        loaded.set(task.url, len > 0 ? Math.min(count, len) : count)
        report()
      }
      if (task.keep) {
        const merged = new Uint8Array(count)
        let off = 0
        for (const c of chunks) { merged.set(c, off); off += c.length }
        THREE.Cache.add(task.url, merged.buffer)
      }
      sizes.set(task.url, count) // true size from the body (authoritative even if header lied)
      loaded.set(task.url, count)
      report()
    } catch (error) {
      console.error(`[preload] failed to load ${task.url}:`, error)
      failed.push(task.url)
      if (task.essential) fatal = true
      loaded.delete(task.url)
      sizes.delete(task.url)
      dropped.add(task.url)
      report()
    }
  })

  if (failed.length) {
    console.warn(
      `[preload] ${failed.length} asset(s) failed:`, failed,
      fatal ? '(FATAL — essential asset; model cannot render)' : '(nonessential — continuing)',
    )
  }
  // Byte phase done. Do NOT force 100 here — the caller advances to 100 only when the scene has
  // actually rendered. Report true byte completion (capped 99) so the bar sits honestly.
  report()
  return { ok: !fatal, failed, fatal }
}
