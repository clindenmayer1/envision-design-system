/*
 * useSceneLoad — owns ALL scene-loading state, decoupled from any visual progress bar.
 *
 * It runs the real byte preload (preloadAssets), gates the 3D scene's mount on the assets being
 * cached, listens for the scene's actual first-render signal, and manages the reveal/fade + error
 * handling. It exposes a plain progress number and a few booleans; the progress-bar component is
 * purely presentational and reads only those — so the bar can be swapped for any other graphic
 * without touching this logic, completion behaviour, or error handling.
 *
 * Progress semantics (no simulation, no timers driving the value):
 *  - `percent` is the real downloaded-byte fraction, monotonic, capped at 99.
 *  - It reaches 100 ONLY when the scene has genuinely rendered its first frames (onSceneReady).
 *  - Cached start → scene shows immediately, loader never appears.
 *  - Fatal asset failure → error state (never a stuck bar). A watchdog guarantees the overlay is
 *    never left up indefinitely even if the ready signal is somehow missed.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { preloadAssets, allAssetsCached } from './preloadAssets'

const GRACE_MS = 180 // don't flash the loader for fast/warm loads
const FADE_MS = 340 // opacity fade-out once ready
const WATCHDOG_MS = 20000 // hard cap: never leave the overlay up forever

export interface SceneLoadState {
  /** Real progress 0–100 for the bar. */
  percent: number
  /** Gate: mount the 3D scene only once its assets are cached (so useGLTF reads from cache). */
  mountScene: boolean
  /** Whether the loader overlay should exist in the DOM at all (false when warm/retired). */
  showLoader: boolean
  /** Overlay opacity toggle (grace-period reveal + fade-out). */
  visible: boolean
  /** An essential asset failed or the scene threw — show an error state, not a spinner. */
  error: boolean
  /** Wire to the in-scene ready detector; flips progress to 100 and dismisses the loader. */
  onSceneReady: () => void
  /** Wire to a scene error boundary; surfaces a fatal render error. */
  onSceneError: (err?: unknown) => void
}

export function useSceneLoad(): SceneLoadState {
  // Evaluated once: if the heavy assets are already cached (same-session re-entry), skip the
  // whole preloader and show the model on the first frame.
  const cached = useRef(allAssetsCached()).current

  const [bytePercent, setBytePercent] = useState(cached ? 100 : 0)
  const [mountScene, setMountScene] = useState(cached)
  const [sceneReady, setSceneReady] = useState(cached)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [retired, setRetired] = useState(cached)

  const onSceneReady = useCallback(() => setSceneReady(true), [])
  const onSceneError = useCallback((err?: unknown) => {
    console.error('[scene] failed to render:', err)
    setError(true)
  }, [])

  // Real byte preload. Resolves with a summary; a fatal (essential-asset) failure → error state,
  // otherwise mount the scene, which now reads every GLB straight from THREE.Cache.
  useEffect(() => {
    if (cached) return
    let cancelled = false
    preloadAssets((p) => {
      if (!cancelled) setBytePercent(p)
    }).then((result) => {
      if (cancelled) return
      if (result.fatal) setError(true)
      else setMountScene(true)
    })
    return () => {
      cancelled = true
    }
  }, [cached])

  // Reveal the loader only if we're still working after the grace period.
  useEffect(() => {
    if (retired || sceneReady || error) return
    const t = setTimeout(() => setVisible(true), GRACE_MS)
    return () => clearTimeout(t)
  }, [retired, sceneReady, error])

  // Scene painted for real → fade the overlay out, then remove it entirely so later material
  // swaps can never re-trigger it.
  useEffect(() => {
    if (!sceneReady || retired || error) return
    setVisible(false)
    const t = setTimeout(() => setRetired(true), FADE_MS + 40)
    return () => clearTimeout(t)
  }, [sceneReady, retired, error])

  // Error state stays visible (it shows a message); it must not fade or retire.
  useEffect(() => {
    if (error) setVisible(true)
  }, [error])

  // Watchdog: if the scene mounted but never signalled ready (e.g. an external env map stalls),
  // don't leave the user staring at a frozen bar — log it and reveal whatever rendered.
  useEffect(() => {
    if (!mountScene || sceneReady || error) return
    const t = setTimeout(() => {
      console.error('[scene] load watchdog tripped — no ready signal within', WATCHDOG_MS, 'ms; revealing scene anyway')
      setSceneReady(true)
    }, WATCHDOG_MS)
    return () => clearTimeout(t)
  }, [mountScene, sceneReady, error])

  // The bar is the true byte fraction until the scene actually renders, then exactly 100.
  const percent = sceneReady && !error ? 100 : Math.min(99, bytePercent)

  return {
    percent,
    mountScene,
    showLoader: !retired,
    visible,
    error,
    onSceneReady,
    onSceneError,
  }
}
