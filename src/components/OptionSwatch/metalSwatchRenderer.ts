/*
 * Offscreen renderer for metal-finish swatches — each hardware finish is shown as a real
 * reflective SPHERE (not a flat baked tile). One hidden WebGLRenderer + a PMREM'd
 * RoomEnvironment (studio reflections, so metals read as metal) rasterizes each finish to a
 * transparent PNG data-URL, cached by finish id. Mirrors the PullThumb pattern so any number
 * of finishes stays within the browser's WebGL-context limit.
 *
 * The finish's PBR maps live at /textures/metals/<id>/ (color/normal, plus metal/rough where
 * present per METAL_MAPS below). metalness/roughness scalars fall back to the option values.
 * Maps are loaded (awaited) BEFORE rendering — otherwise the sphere rasterizes bare and every
 * finish reads as identical chrome.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { METAL_FINISHES } from '../../three/materials'
import type { Option } from '../../types'

const RES = 256

// Which finishes ship metal/rough maps (matches KitchenScene's METAL_MAPS). Others fall back
// to the option's scalar metalness/roughness.
const METAL_MAPS: Record<string, { metal: boolean; rough: boolean }> = {
  copper: { metal: true, rough: true },
  silver: { metal: true, rough: true },
  brass: { metal: false, rough: false },
  steel: { metal: false, rough: true },
  'brushed-brass': { metal: true, rough: true },
  'matte-black': { metal: false, rough: false }, // ships color + normal only
}

const dataCache = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

let renderer: THREE.WebGLRenderer | null = null
let rScene: THREE.Scene
let camera: THREE.PerspectiveCamera
let sphere: THREE.Mesh
let envMap: THREE.Texture

function ensure() {
  if (renderer) return
  const canvas = document.createElement('canvas')
  canvas.width = RES
  canvas.height = RES
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(RES, RES, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  // Studio reflections so the metals read as metal (a sphere with no env is flat black).
  const pmrem = new THREE.PMREMGenerator(renderer)
  envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  rScene = new THREE.Scene()
  rScene.environment = envMap
  // A soft key from the top-left adds a crisp highlight over the ambient studio reflection so
  // the sphere reads round.
  const key = new THREE.DirectionalLight(0xffffff, 1.2)
  key.position.set(-3, 4, 3)
  rScene.add(key)

  camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
  camera.position.set(0, 0.15, 4.1)
  camera.lookAt(0, 0, 0)

  sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96))
  rScene.add(sphere)
}

const loader = new THREE.TextureLoader()
function loadTex(url: string, srgb: boolean): Promise<THREE.Texture> {
  return loader.loadAsync(url).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.anisotropy = 8
    return t
  })
}

// Build the finish material with all its maps loaded (awaited).
async function finishMaterial(opt: Option): Promise<THREE.MeshStandardMaterial> {
  const has = METAL_MAPS[opt.id] ?? { metal: true, rough: true }
  const base = `/textures/metals/${opt.id}`
  const [map, normalMap, metalnessMap, roughnessMap] = await Promise.all([
    loadTex(`${base}/color.jpg`, true),
    loadTex(`${base}/normal.jpg`, false),
    has.metal ? loadTex(`${base}/metal.jpg`, false).catch(() => null) : Promise.resolve(null),
    has.rough ? loadTex(`${base}/rough.jpg`, false).catch(() => null) : Promise.resolve(null),
  ])
  return new THREE.MeshStandardMaterial({
    map,
    normalMap,
    metalnessMap,
    roughnessMap,
    metalness: opt.metalness ?? 1,
    roughness: opt.roughness ?? 0.4,
    envMapIntensity: 1.35,
  })
}

/** Synchronously return an already-rendered sphere swatch (or undefined if not ready). */
export function peekMetalSwatch(id: string): string | undefined {
  return dataCache.get(id)
}

/** True for finish ids that have a sphere-swatch render (the textured hardware finishes). */
export function isMetalFinish(id: string): boolean {
  return METAL_FINISHES.some((o) => o.id === id && !!o.texture)
}

/** Render (or return cached) a transparent PNG data-URL of the finish as a reflective sphere. */
export function getMetalSwatch(id: string): Promise<string> {
  const hit = dataCache.get(id)
  if (hit) return Promise.resolve(hit)
  const inflight = pending.get(id)
  if (inflight) return inflight
  const opt = METAL_FINISHES.find((o) => o.id === id)
  if (!opt) return Promise.reject(new Error(`unknown finish ${id}`))
  const job = finishMaterial(opt).then((mat) => {
    ensure()
    sphere.material = mat
    renderer!.render(rScene, camera)
    const data = renderer!.domElement.toDataURL('image/png')
    dataCache.set(id, data)
    pending.delete(id)
    return data
  })
  pending.set(id, job)
  return job
}
