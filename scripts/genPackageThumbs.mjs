/*
 * Offline package-thumbnail generator.
 *
 * Renders a REAL snapshot of the 3D kitchen with each package's materials applied, at the
 * standard package view (View 1), same camera/lighting/crop/dimensions for all — the only
 * difference between thumbnails is the materials. Runs in a SEPARATE headful browser (real
 * GPU + the user's saved lighting), so the live user-facing model is never cycled. Writes
 * public/packages/<id>.jpg. Re-run whenever a package's materials/camera/render config change.
 *
 * Usage: node scripts/genPackageThumbs.mjs
 */
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
// Default to the dev server, but allow pointing at a static preview build (no HMR) via
// THUMB_URL — a dev-server HMR reload detaches the generator's page mid-run, so when the
// app source is being actively edited, build once and run against `vite preview`.
const URL = process.env.THUMB_URL || 'http://localhost:5173/'
// Write to a temp dir during generation — writing into public/ would trip Vite's file
// watcher and reload the page (detaching the frame). A shell step moves them into public/.
const OUT = '/tmp/pkgthumbs'
const ASPECT = 351 / 166 // card image aspect
const CROP_TOP = 0.34 // vertical bias of the landscape crop (0=top,1=bottom)

const lighting = fs.existsSync('/tmp/pkglighting.json')
  ? JSON.parse(fs.readFileSync('/tmp/pkglighting.json', 'utf8'))
  : {}

fs.mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function setup(page) {
  await page.goto(URL, { waitUntil: 'load' })
  // Inject the user's lighting so thumbnails match the app's look.
  await page.evaluate((l) => { for (const k in l) localStorage.setItem(k, l[k]) }, lighting)
  await page.reload({ waitUntil: 'load' })
  await sleep(4000)
  // Enter Design Center and wait for the scene to fully load.
  for (let i = 0; i < 12; i++) {
    const ok = await page.evaluate(() => !!document.querySelector('.scene-canvas canvas') && typeof window.__setKitchenConfig === 'function')
    if (ok) break
    await page.evaluate(() => { const x = [...document.querySelectorAll('.topbar__link')].find((e) => e.textContent.trim() === 'Design Center'); x && x.click() })
    await sleep(1500)
  }
  await sleep(18000) // let the model + textures fully load/render
  // Hide the floating UI overlays so captures are clean model only.
  await page.evaluate(() => {
    ['.layout__roomnav', '.layout__debug', '.studio-toggle', '.pose-readout', '.scene-loader', '.scene-canvas__placeholder']
      .forEach((s) => document.querySelectorAll(s).forEach((el) => (el.style.display = 'none')))
  })
}

async function cropBox(page) {
  return page.evaluate((aspect, cropTop) => {
    const c = document.querySelector('.scene-canvas')
    const r = c.getBoundingClientRect()
    const w = Math.round(r.width)
    const h = Math.round(w / aspect)
    const y = Math.round(r.y + (r.height - h) * cropTop)
    return { x: Math.round(r.x), y, width: w, height: h }
  }, ASPECT, CROP_TOP)
}

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  // Dedicated profile dir so this launches its OWN Chrome instance instead of deferring to
  // the user's already-running Chrome (which detaches puppeteer's frame mid-setup).
  userDataDir: '/tmp/pkgthumb-chrome',
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox', '--window-size=1512,982', '--window-position=2200,2200'],
})
const page = await b.newPage()
await page.setViewport({ width: 1512, height: 982, deviceScaleFactor: 2 })
page.setDefaultNavigationTimeout(120000)

await setup(page)
const allPackages = await page.evaluate(() => window.__PACKAGES)
// Optional package-id filter (e.g. `node scripts/genPackageThumbs.mjs summit`).
const only = process.argv[2]
const packages = only ? allPackages.filter((p) => p.id === only) : allPackages
console.log('packages:', packages.map((p) => p.id).join(', '))

for (const pkg of packages) {
  let ok = false
  for (let attempt = 0; attempt < 2 && !ok; attempt++) {
    try {
      const ready = await page.evaluate(() => typeof window.__setKitchenConfig === 'function')
      if (!ready) await setup(page)
      await page.evaluate((cfg) => window.__setKitchenConfig(cfg), pkg.config)
      // Longer for single-package runs: from a COLD cache one package's GLB+textures need
      // >13s to load+render, else the capture keeps the default scene. Env-tunable.
      await sleep(Number(process.env.THUMB_SETTLE_MS) || 13000)
      await page.evaluate(() => {
        ['.layout__roomnav', '.layout__debug', '.studio-toggle', '.pose-readout', '.scene-loader']
          .forEach((s) => document.querySelectorAll(s).forEach((el) => (el.style.display = 'none')))
      })
      const clip = await cropBox(page)
      await page.screenshot({ path: path.join(OUT, `${pkg.id}.jpg`), type: 'jpeg', quality: 86, clip })
      const sz = fs.statSync(path.join(OUT, `${pkg.id}.jpg`)).size
      console.log(`  ✓ ${pkg.id} (${Math.round(sz / 1024)} KB)`)
      ok = true
    } catch (e) {
      console.log(`  ! ${pkg.id} attempt ${attempt + 1} failed: ${String(e).split('\n')[0]}`)
      await setup(page).catch(() => {})
    }
  }
}

await b.close()
console.log('DONE')
