/*
 * Shared offscreen renderer for cabinet hardware / door thumbnails. Rendering each in its
 * own <Canvas> would blow past the browser's ~16 WebGL-context limit, so ONE hidden
 * WebGLRenderer rasterizes each to a PNG data-URL, cached by url. GLBs are loaded here
 * (async, cached) so the React component needs no Canvas/suspense.
 *
 * A url may carry a "#NodeName" fragment → render only that node from the GLB (used to
 * thumbnail the original authored pull/door straight out of the kitchen model). Kind
 * (pull vs door) is auto-detected from the url.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const NON_PULL_RE = /sumele|mixamo|avatar|body|hair|skin|dress|shoe|jewelry|person|figure/i
const FIT = 1.925 // pull target max-dimension (world units)
const RES = 256
const DOOR_W = 200 // portrait render = EXACT 4:5 (matches the tray tile so the door fills, no margin)
const DOOR_H = 250
const DOOR_FOV = 11
const DOOR_DIST = 12

// Per-pull thumbnail roll (radians about the normalized long axis) for models whose
// "handle up" side can't be inferred from the bounding box (keyed by GLB path).
const THUMB_ROLL_X: Record<string, number> = { '/pulls/alden.glb': -Math.PI / 2 }

const loader = new GLTFLoader()
const sceneCache = new Map<string, Promise<THREE.Object3D>>()
const dataCache = new Map<string, string>()

let renderer: THREE.WebGLRenderer | null = null
let rScene: THREE.Scene
let pullCamera: THREE.PerspectiveCamera
let doorCamera: THREE.PerspectiveCamera
let faucetCamera: THREE.PerspectiveCamera
let holder: THREE.Group

function loadGltfScene(path: string): Promise<THREE.Object3D> {
  let p = sceneCache.get(path)
  if (!p) { p = loader.loadAsync(path).then((g) => g.scene); sceneCache.set(path, p) }
  return p
}

function ensure() {
  if (renderer) return
  const canvas = document.createElement('canvas')
  canvas.width = RES
  canvas.height = RES
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(RES, RES, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace // ensure bright sRGB output (not flat/gray)
  renderer.toneMapping = THREE.NoToneMapping
  rScene = new THREE.Scene()
  // Pull camera: far + narrow FOV ≈ orthographic isometric.
  pullCamera = new THREE.PerspectiveCamera(11, 1, 1, 80)
  pullCamera.position.set(7.33, 6.05, 7.33)
  pullCamera.lookAt(0, 0, 0)
  // Door camera: straight head-on (panel/molding face the viewer), portrait aspect.
  doorCamera = new THREE.PerspectiveCamera(DOOR_FOV, DOOR_W / DOOR_H, 1, 120)
  doorCamera.position.set(0, 0, DOOR_DIST)
  doorCamera.lookAt(0, 0, 0)
  // Faucet camera: 3/4 view from front-left and slightly above (portrait aspect). Faucets
  // are oriented so their spout reaches +X, so a front-left camera shows the full arc.
  faucetCamera = new THREE.PerspectiveCamera(DOOR_FOV, DOOR_W / DOOR_H, 1, 200)
  faucetCamera.position.set(-0.5 * DOOR_DIST, 0.4 * DOOR_DIST, 1.0 * DOOR_DIST)
  faucetCamera.lookAt(0, 0, 0)
  // Key light rakes from the TOP-LEFT-front so door molding / inset panels cast subtle
  // light-and-shade and read with depth (not flat). Ambient is kept lowish and the key
  // pushed bright so lit faces read light/white while inset bevels stay in deeper shade →
  // brighter overall WITH more contrast.
  rScene.add(new THREE.AmbientLight(0xffffff, 0.95))
  const key = new THREE.DirectionalLight(0xffffff, 3.2)
  key.position.set(-7, 6, 3) // grazing top-left so inset bevels show light/shade
  rScene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.25)
  fill.position.set(5, -1, 5)
  rScene.add(fill)
  holder = new THREE.Group()
  rScene.add(holder)
}

// Bake every mesh's world matrix into its geometry, returning a flat group of meshes with
// identity transforms — so downstream orientation math is free of nested/baked transforms
// (works for standalone GLBs and for nodes extracted from the kitchen scene alike).
// applyWorld=true bakes each mesh's world matrix (needed for nodes extracted from the
// kitchen, e.g. a pull placed in the scene). applyWorld=false uses the raw authored
// geometry — for standalone door GLBs whose export node-matrices distort the panel; the
// meshes already assemble correctly in their own space, and buildDoor re-normalizes
// orientation/scale anyway.
function flatten(obj: THREE.Object3D, applyWorld = true): THREE.Group {
  obj.updateWorldMatrix(true, true)
  const g = new THREE.Group()
  obj.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || !m.geometry) return
    const geo = m.geometry.clone()
    if (applyWorld) geo.applyMatrix4(m.matrixWorld)
    const mesh = new THREE.Mesh(geo, m.material)
    mesh.name = m.name
    g.add(mesh)
  })
  return g
}

const unit = (i: number) => new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0)

// Door GLBs whose export node-matrices distort the panel when world-baked → build from the
// RAW authored geometry instead. (Default is world-baking, which most doors — incl.
// multi-part ones like Shaker — need to assemble correctly. Add a door here if its thumbnail
// renders edge-on / collapsed.)
const DOOR_RAW = new Set<string>([
  '/doors/raised_panel.glb',
  '/doors/beadboard_shaker.glb',
  '/doors/beadboard_smooth.glb',
  '/doors/glass_uppers.glb',
  '/doors/cathedral_raised_panel.glb',
  '/doors/applied_molding.glb',
])
// Doors whose detailed (molding) face points AWAY from the camera → flip 180° so it shows.
const DOOR_FLIP = new Set<string>(['/doors/applied_molding.glb'])
// Glass-upper doors: per-GLB config for turning pane geometry into translucent glass.
//  convert: material-name pattern to make glass; convertNoMat: make no-material meshes glass;
//  drop: material-name pattern to REMOVE (redundant/overlapping glass that would double up).
// convert = material-name pattern → uniform translucent glass; hide = pattern of meshes to
// make invisible (kept in the bbox so the crop never changes). Everything else → painted frame.
interface GlassCfg { convert: RegExp; hide?: RegExp }
const DOOR_GLASS: Record<string, GlassCfg> = {
  '/doors/thorsen_glass_uppers.glb': { convert: /color_007/i },
  // The full-coverage face that forms all 6 panes is "default_face_material" → make it the
  // glass; hide the partial actual glass mesh (it doesn't reach the top pane → uneven).
  // The 6 panes ARE the Translucent_Glass_Gray mesh (one material → all identical);
  // everything else (frame, muntins, default_face_material2 left board) = one paint colour.
  '/doors/glass_uppers.glb': { convert: /glass/i },
}

// Center `obj` at the origin and uniform-scale so its largest dimension == fit.
function centerAndScale(obj: THREE.Object3D, fit: number): THREE.Object3D {
  obj.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(obj)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  obj.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const outer = new THREE.Group()
  outer.add(obj)
  outer.scale.setScalar(fit / maxDim)
  return outer
}

// Pull: longest axis → X (horizontal), protrusion/handle (mid) → Y (up), thickness → Z.
function buildPull(sourceObj: THREE.Object3D): THREE.Object3D {
  const flat = flatten(sourceObj)
  const brass = new THREE.MeshStandardMaterial({ color: '#bb9456', metalness: 0.5, roughness: 0.4 })
  const drop: THREE.Object3D[] = []
  flat.children.slice().forEach((o) => {
    const m = o as THREE.Mesh
    const matName = (m.material && (m.material as THREE.Material).name) || ''
    if (NON_PULL_RE.test(matName) || NON_PULL_RE.test(m.name)) drop.push(m)
    else m.material = brass
  })
  drop.forEach((o) => flat.remove(o))
  const size = new THREE.Box3().setFromObject(flat).getSize(new THREE.Vector3())
  const s = [size.x, size.y, size.z]
  const axisLong = s.indexOf(Math.max(...s))
  const axisThin = s.indexOf(Math.min(...s))
  const axisDepth = 3 - axisLong - axisThin
  const sl = unit(axisLong), sd = unit(axisDepth)
  const st = new THREE.Vector3().crossVectors(sl, sd)
  const Bs = new THREE.Matrix4().makeBasis(sl, sd, st)
  const rotated = new THREE.Group()
  rotated.quaternion.setFromRotationMatrix(Bs.transpose())
  rotated.add(flat)
  return centerAndScale(rotated, FIT)
}

// Door: upright, face-on. width → X, height → Y, thin (face normal) → Z.
function buildDoor(sourceObj: THREE.Object3D, applyWorld: boolean, glass?: GlassCfg): THREE.Object3D {
  const flat = flatten(sourceObj, applyWorld)
  const paint = new THREE.MeshStandardMaterial({ color: '#fcfbf8', metalness: 0, roughness: 0.72 })
  for (const o of flat.children) {
    const m = o as THREE.Mesh
    if (!m.isMesh) continue
    const mat = m.material as THREE.Material | undefined
    const nm = mat?.name || ''
    // Hidden meshes stay in the bbox (crop unchanged) but don't render.
    if (glass?.hide && glass.hide.test(nm)) { m.visible = false; continue }
    if (glass && glass.convert.test(nm)) {
      // OPAQUE flat glass colour — the door's own backing geometry varies behind the panes
      // (the top-right pane has a different backer), so a translucent material reads a
      // different value per pane. Opaque + unlit makes every pane identical. Geometry is
      // untouched: the white muntins still render in front and divide it into 6 panes.
      m.material = new THREE.MeshBasicMaterial({ color: '#b3bdc2', side: THREE.DoubleSide })
    } else {
      m.material = paint // frame + everything else = one paint colour
    }
  }
  const size = new THREE.Box3().setFromObject(flat).getSize(new THREE.Vector3())
  const s = [size.x, size.y, size.z]
  const thinAxis = s.indexOf(Math.min(...s))
  const rest = [0, 1, 2].filter((a) => a !== thinAxis)
  // Height = the LONGER face dimension → every door renders portrait (taller than wide).
  const heightAxis = s[rest[0]] >= s[rest[1]] ? rest[0] : rest[1]
  const widthAxis = rest.find((a) => a !== heightAxis)!
  const Bs = new THREE.Matrix4().makeBasis(unit(widthAxis), unit(heightAxis), unit(thinAxis))
  const rotated = new THREE.Group()
  rotated.quaternion.setFromRotationMatrix(Bs.transpose())
  rotated.add(flat)
  // Center, then NON-uniformly scale so the door face exactly fills the render frame
  // (width→frame width, height→frame height) — every door fills edge-to-edge, same size,
  // no margins, regardless of its native aspect.
  rotated.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(rotated)
  const center = box.getCenter(new THREE.Vector3())
  const dsize = box.getSize(new THREE.Vector3())
  rotated.position.sub(center)
  const viewH = 2 * DOOR_DIST * Math.tan(THREE.MathUtils.degToRad(DOOR_FOV / 2))
  const viewW = viewH * (DOOR_W / DOOR_H)
  const sx = viewW / (dsize.x || 1)
  const sy = viewH / (dsize.y || 1)
  const outer = new THREE.Group()
  outer.add(rotated)
  outer.scale.set(sx, sy, sy) // x→width, y→height, z (thin) follows y (barely visible head-on)
  return outer
}

// Per-faucet "face-forward" yaw — MUST mirror FAUCET_TUNE.yaw in KitchenScene (which is
// applied to the same GLB's native orientation to make its spout face +X in the scene).
// Geometry-based auto-detection was unreliable for symmetric goosenecks (the top−base reach
// vector is near-zero → arbitrary fallback axis), so every faucet rendered at a slightly
// different yaw. Using the known scene yaws guarantees all thumbnails share ONE orientation.
const FAUCET_FORWARD_YAW: Record<string, number> = {
  '/faucets/single_handle_pulldown.glb': Math.PI / 2,
  '/faucets/square_gooseneck.glb': Math.PI / 2,
  '/faucets/essa_pulldown.glb': Math.PI / 2,
  '/faucets/st_claire.glb': Math.PI / 2,
  // high_arc_gooseneck, modern_tap: native front already faces +X → yaw 0 (default)
}

// Faucet thumbnail: upright (Y-up, base down), neutral brushed-metal, oriented so the spout
// faces +X (forwardYaw, matching the scene), then turned −60° for an identical 3/4 view from
// the faucetCamera. Unit-agnostic: fit-to-frame normalises cm/m models alike.
function buildFaucet(sourceObj: THREE.Object3D, forwardYaw: number): THREE.Object3D {
  const flat = flatten(sourceObj, true)
  const metal = new THREE.MeshStandardMaterial({ color: '#c4c7ca', metalness: 0.9, roughness: 0.3, envMapIntensity: 1.5 })
  for (const o of flat.children) { const m = o as THREE.Mesh; if (m.isMesh) m.material = metal }
  flat.updateWorldMatrix(true, true)
  const inner = new THREE.Group()
  inner.add(flat)
  // forwardYaw faces the spout +X (as in the scene); −60° turns its vertical arc plane toward
  // the faucetCamera (at −X/+Y/+Z) so the nozzle points RIGHT at a consistent 3/4 across all.
  inner.rotation.y = forwardYaw - Math.PI / 3
  inner.updateWorldMatrix(true, true)
  const box2 = new THREE.Box3().setFromObject(inner)
  const center = box2.getCenter(new THREE.Vector3())
  const size = box2.getSize(new THREE.Vector3())
  inner.position.sub(center)
  const viewH = 2 * DOOR_DIST * Math.tan(THREE.MathUtils.degToRad(DOOR_FOV / 2))
  const viewW = viewH * (DOOR_W / DOOR_H)
  const s = Math.min(viewH / (size.y || 1), viewW / (Math.max(size.x, size.z) || 1)) * 0.8
  const outer = new THREE.Group()
  outer.add(inner)
  outer.scale.setScalar(s)
  return outer
}

/** Synchronously return an already-rendered thumbnail (or undefined if not ready yet). */
export function peekPullThumb(url: string): string | undefined {
  return dataCache.get(url)
}

/** Render (or return cached) a PNG data-URL thumbnail for a pull/door. */
export async function getPullThumb(url: string): Promise<string> {
  const hit = dataCache.get(url)
  if (hit) return hit
  const [path, nodeName] = url.split('#')
  const gltfScene = await loadGltfScene(path)
  ensure()
  let source: THREE.Object3D = gltfScene
  if (nodeName) {
    gltfScene.updateWorldMatrix(true, true)
    const node = gltfScene.getObjectByName(nodeName)
    if (node) {
      source = node
    } else {
      console.warn(`[PullThumb] node "${nodeName}" not found in ${path}`)
      source = new THREE.Group()
    }
  }
  const isFaucet = /\/faucets\//.test(path)
  const isDoor = !isFaucet && (/\/doors\//.test(path) || /door/i.test(nodeName || ''))
  const obj = isFaucet ? buildFaucet(source, FAUCET_FORWARD_YAW[path] ?? 0) : isDoor ? buildDoor(source, !DOOR_RAW.has(path), DOOR_GLASS[path]) : buildPull(source)
  if (isDoor) {
    if (DOOR_FLIP.has(path)) obj.rotateY(Math.PI) // bring the molding face toward the camera
  } else if (!isFaucet) {
    const roll = THUMB_ROLL_X[path]
    if (roll) obj.rotateX(roll)
  }
  holder.add(obj)
  // Doors + faucets render into a portrait frame (fills the tray tile); pulls stay square.
  const portrait = isDoor || isFaucet
  if (portrait) renderer!.setSize(DOOR_W, DOOR_H, false)
  else renderer!.setSize(RES, RES, false)
  renderer!.render(rScene, isFaucet ? faucetCamera : portrait ? doorCamera : pullCamera)
  const data = renderer!.domElement.toDataURL('image/png')
  holder.remove(obj)
  dataCache.set(url, data)
  return data
}
