/*
 * KitchenScene — loads the GLB, builds name-based target sets, applies the live
 * cabinet-finish swaps, and frames the model at the SketchUp VIEW2 camera.
 *
 * Camera: the model is Z-up. We set the default camera to the VIEW2 preset
 * (eye + look target derived from the GLB scene node) ONCE on load — no
 * <Bounds>/auto-fit, so it does not zoom in when the model appears. The user
 * can still orbit/zoom freely afterward.
 *
 * Targeting (tags dropped on export — target by NODE NAME):
 *   Cabinet finish → the whole cabinet_style set (doors/fronts + panel-ready
 *   appliance fronts).
 */
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, useTexture, Clone, useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { Box3, Vector3 } from 'three'
import type { PerspectiveCamera } from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import ET, { type CategoryKey } from '../Envision/targeting'
import { applyFinish, woodFinishTone } from './materialSwaps'
import { CABINET_FINISHES, COUNTERTOP_MATERIALS, BACKSPLASH_MATERIALS, HARDWARE_STYLES, CABINET_STYLES, FAUCET_STYLES, METAL_FINISHES, optionById, wallColorHex } from './materials'
import { analyzePullSource, analyzePullTargets, makePullInstance, type PullSource, type PullTarget } from './pulls'
import { analyzeDoorSource, analyzeDoorTargets, makeDoorInstance, type DoorSource, type DoorTarget } from './doors'

/* Wraps a NONESSENTIAL scene subtree (e.g. the external env-map HDR): if it throws while loading,
 * we render nothing instead of letting the failure bubble up and error the whole scene. */
class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) { console.warn('[scene] optional asset failed, continuing without it:', error) }
  render() { return this.state.failed ? null : this.props.children }
}

// Countertop options that ship texture files (everything except the authored 'calacatta').
// The file prefix equals the option id: /textures/countertops/<id>_color.jpg + _normal.jpg.
const COUNTERTOP_TEX_IDS = COUNTERTOP_MATERIALS.filter((o) => o.id !== 'calacatta').map((o) => o.id)
// Backsplash tile options that ship texture sets (everything except 'matching-stone',
// which reuses the shared countertop marble). File prefix = option id.
const BACKSPLASH_TEX_IDS = BACKSPLASH_MATERIALS.filter((o) => o.id !== 'matching-stone').map((o) => o.id)
const BACKSPLASH_NODE_RE = /Backsplash_Perimeter/i

// World-space planar UVs per VERTEX (axis chosen by the vertex normal), keeping the
// geometry indexed so it can hold BOTH the authored marble UVs and these tile UVs and
// swap between them. A wall facing ±Z projects (x,y); a wall facing ±X projects (z,y) —
// so tiles stay square at a real-world scale instead of stretching with the authored UVs.
function makeWallTileUVs(geom: THREE.BufferGeometry, mesh: THREE.Mesh, scale: number) {
  const pos = geom.attributes.position
  const nor = geom.attributes.normal
  mesh.updateWorldMatrix(true, false)
  const mw = mesh.matrixWorld
  const nmat = new THREE.Matrix3().getNormalMatrix(mw)
  const v = new Vector3(), nv = new Vector3()
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mw)
    nv.fromBufferAttribute(nor, i).applyMatrix3(nmat)
    const ax = Math.abs(nv.x), ay = Math.abs(nv.y), az = Math.abs(nv.z)
    let u: number, w: number
    if (ay >= ax && ay >= az) { u = v.x; w = v.z }       // horizontal face → XZ
    else if (ax >= az) { u = v.z; w = v.y }              // X-facing wall → ZY
    else { u = v.x; w = v.y }                            // Z-facing wall → XY
    uv[i * 2] = u * scale
    uv[i * 2 + 1] = w * scale
  }
  return new THREE.BufferAttribute(uv, 2)
}
import { LightingRig, assemble, type CanConfig, type LightingState } from './lighting'
import type { KitchenConfig } from '../types'

// RectAreaLight needs its LTC lookup textures initialised once before first use.
RectAreaLightUniformsLib.init()

const MODEL_URL = '/envision_kitchen_clean_test.glb'
// This option keeps the original authored pulls (no swap); its thumbnail comes from the
// kitchen GLB itself, so it's excluded from the swap-loading list below.
const ORIGINAL_PULL_ID = 'modern-bar-pull'
// Hardware pull GLBs (swapped onto every original pull). Keyed by HARDWARE_STYLES id.
const PULL_URLS: Record<string, string> = Object.fromEntries(
  HARDWARE_STYLES.filter((o) => o.model && o.id !== ORIGINAL_PULL_ID).map((o) => [o.id, o.model as string]),
)
const PULL_IDS = Object.keys(PULL_URLS)
const PULL_URL_LIST = PULL_IDS.map((id) => PULL_URLS[id])
// Per-pull roll correction (radians about the pull's long axis) for models whose protrusion
// vs thickness can't be inferred from the bounding box alone.
const PULL_ROLL: Record<string, number> = { alden: -Math.PI / 2 }

// Hardware finish PBR maps: every finish ships /textures/metals/<id>/color.jpg + normal.jpg;
// metal/rough maps exist per this manifest (brass source is specular-only; steel has gloss
// only → inverted to roughness at build time). Materials are built once and cached.
const METAL_MAPS: Record<string, { metal: boolean; rough: boolean }> = {
  copper: { metal: true, rough: true },
  silver: { metal: true, rough: true },
  brass: { metal: false, rough: false },
  steel: { metal: false, rough: true },
  'brushed-brass': { metal: true, rough: true },
  'brushed-steel': { metal: true, rough: true },
}
// Per-finish brightness trims (the defaults below suit the darker metals that need lift;
// bright finishes get dialled back here). brushed-brass was reading too hot — cut its env
// reflection + emissive lift and tint the albedo slightly under white.
const METAL_TUNE: Record<string, { env?: number; emissive?: number; tint?: number; metalness?: number; roughness?: number }> = {
  'brushed-brass': { env: 2.3, emissive: 0.09, tint: 0xe4ddd0 },
  // "Matte Black" rendered as a SATIN black: soft sheen (mid roughness) + a little metallic
  // reflectivity so it catches gentle highlights — between flat matte and gloss.
  'matte-black': { metalness: 0.4, roughness: 0.5, env: 1.5, emissive: 0.04 },
}
const metalFinishCache = new Map<string, THREE.MeshStandardMaterial>()
function metalFinishMaterial(id: string): THREE.MeshStandardMaterial {
  const hit = metalFinishCache.get(id)
  if (hit) return hit
  const has = METAL_MAPS[id] ?? { metal: true, rough: true }
  const tune = METAL_TUNE[id] ?? {}
  const opt = optionById(METAL_FINISHES, id)
  const loader = new THREE.TextureLoader()
  const base = `/textures/metals/${id}`
  const tex = (f: string, srgb = false) => {
    const t = loader.load(`${base}/${f}`)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.anisotropy = 8
    return t
  }
  const color = tex('color.jpg', true)
  const mat = new THREE.MeshStandardMaterial({
    map: color,
    normalMap: tex('normal.jpg'),
    metalnessMap: has.metal ? tex('metal.jpg') : null,
    roughnessMap: has.rough ? tex('rough.jpg') : null,
    // metalness just under 1 lets a little of the (brightened) base colour read as diffuse so
    // darker metals (copper/steel) lift; low roughness = shiny; high envMapIntensity makes them
    // reflect the dim scene env brightly.
    metalness: tune.metalness ?? 0.88,
    roughness: tune.roughness ?? (has.rough ? 0.42 : (opt?.roughness ?? 0.4) * 0.6),
    envMapIntensity: tune.env ?? 4.2,
    // Low emissive floor (tinted by the metal's own colour) lifts the SHADOWED areas without
    // touching the bright reflections.
    emissive: 0xffffff,
    emissiveMap: color,
    emissiveIntensity: tune.emissive ?? 0.17,
  })
  if (tune.tint) mat.color.setHex(tune.tint) // multiplies the colour map → pulls albedo down
  metalFinishCache.set(id, mat)
  return mat
}

// Cabinet doors — analogous to pulls. 'shaker' keeps the authored doors (thumbnail from the
// kitchen GLB); any other option swaps a door GLB onto every cabinet door panel.
const ORIGINAL_DOOR_ID = 'shaker'
// These options swap ONLY the upper cabinet doors (lowers keep the original doors).
const UPPERS_ONLY_DOOR_IDS = new Set(['glass-upper-doors', 'thorsen-glass-uppers'])
// Doors whose world geometry mounts upside-down in the scene → flip 180° in-plane.
const DOOR_FLIP_SCENE = new Set(['cathedral-raised-panel'])
// Doors whose molded face points INTO the cabinet → flip 180° about height so it faces out.
const DOOR_FACE_FLIP_SCENE = new Set<string>([])
// Uppers doors: turn pane geometry into one translucent glass. convert = material-name to
// make glass; convertNoMat = make no-material meshes glass; drop = redundant overlapping glass
// to remove (so panes don't double up / mismatch).
const DOOR_GLASS: Record<string, { convert?: RegExp; convertNoMat?: boolean; drop?: RegExp }> = {
  'thorsen-glass-uppers': { convert: /color_007/i },
  // Convert the real pane material (Translucent_Glass_Gray) to translucent glass, exactly
  // like Thorsen — leave the frame alone (convertNoMat wrongly turned no-material FRAME
  // meshes into glass, which read as purple).
  'glass-upper-doors': { convert: /glass/i },
}
const DOOR_URLS: Record<string, string> = Object.fromEntries(
  CABINET_STYLES.filter((o) => o.model && o.id !== ORIGINAL_DOOR_ID).map((o) => [o.id, o.model as string]),
)
const DOOR_IDS = Object.keys(DOOR_URLS)
const DOOR_URL_LIST = DOOR_IDS.map((id) => DOOR_URLS[id])

// ── Faucets ────────────────────────────────────────────────────────────────
// Each faucet option is a GLB that REPLACES the authored sink faucet. Per-faucet tuning:
// scale (unit fix — high-arc is authored in cm), yaw (radians, to face the spout toward
// the room/+Z over the sink) and small base/offset nudges (metres). Defaults: scale 1,
// yaw 0. Tune by eye against a headless render.
const FAUCET_URLS: Record<string, string> = Object.fromEntries(
  FAUCET_STYLES.filter((o) => o.model).map((o) => [o.id, o.model as string]),
)
const FAUCET_IDS = Object.keys(FAUCET_URLS)
const FAUCET_URL_LIST = FAUCET_IDS.map((id) => FAUCET_URLS[id])
const FAUCET_TUNE: Record<string, { scale?: number; yaw?: number; dx?: number; dy?: number; dz?: number }> = {
  'high-arc-gooseneck': { scale: 0.01 }, // authored in centimetres
  'single-handle-pulldown': { yaw: Math.PI / 2 }, // native front faces +Z; +90° turns it to +X (forward, like the others)
  'square-gooseneck': { yaw: Math.PI / 2 }, // native front faces ~+Z; +90° → +X (forward)
  'modern-tap': { scale: 0.7 }, // shrink — it's the tallest of the set
  'essa-pulldown': { yaw: Math.PI / 2 }, // native front faces ~+Z; +90° → +X (forward)
  'modern-l-spout': { yaw: Math.PI / 2, dy: -0.096 }, // +90° → forward; dy tucks the below-deck shank into the counter
  // 'modern-low-profile' already faces +X (forward) → no tune
  'st-claire': { scale: 0.00075, yaw: Math.PI / 2 }, // authored in mm; native front ~+Z → +90°. 0.00075 (was 0.001) ≈ matches the other faucets' height
}

// ── Named camera views ────────────────────────────────────────────────────
// User-facing saved views (distinct from the raw SketchUp-derived VIEW1/2/3 in
// cameraPresets.ts, which are just the source camera nodes). Each view = a base
// preset + a lateral pan (m, along camera-right; +ve pans camera right → scene
// shifts left) + a fov (deg; lower = more zoomed). The look target is the live
// bbox center plus the same pan, so the pan shifts framing without changing the
// view direction/angle. Add more entries here (e.g. "View 2") to grow the set.
const KITCHEN_VIEWS = {
  // View 1 — 'pose': an exact camera pose captured in-app and committed here.
  'View 1': {
    kind: 'pose',
    position: [7.0733, 1.3046, 1.133],
    target: [3.8138, 1.1575, -1.1994],
    fov: 46,
    up: [0, 1, 0],
  },
  // View 2 — 'pose': an exact camera pose captured in-app and committed here.
  'View 2': {
    kind: 'pose',
    position: [5.364, 1.2333, -2.104],
    target: [3.383, 1.2588, -2.0848],
    fov: 50,
    up: [0, 1, 0],
  },
  // View 3 — 'pose': an exact camera pose captured in-app and committed here.
  'View 3': {
    kind: 'pose',
    position: [1.9468, 1.3113, 3.9739],
    target: [2.0716, 1.2784, -1.2078],
    fov: 46,
    up: [0, 1, 0],
  },
} as const
export type ViewName = keyof typeof KITCHEN_VIEWS
export const VIEW_NAMES = Object.keys(KITCHEN_VIEWS) as ViewName[]
const DEFAULT_VIEW: ViewName = 'View 1'

export type TargetCounts = Partial<Record<CategoryKey, number>>

interface Props {
  config: KitchenConfig
  onTargets?: (counts: TargetCounts) => void
  activeView?: ViewName
  /** Bumped on every view-button click so re-clicking the current view re-snaps the camera. */
  viewNonce?: number
  lighting: LightingState
  studio: boolean
  /** Countertop Materials tray open → glide to the countertop framing; closed → back. */
  countertopOpen?: boolean
  /** Backsplash Materials tray open → glide to the backsplash framing; closed → back. */
  backsplashOpen?: boolean
  /** Cabinet Hardware tray open → glide to the hardware framing; closed → back. */
  hardwareOpen?: boolean
  /** Faucet Style tray open → glide to the faucet framing; closed → back. */
  faucetOpen?: boolean
}

// Special framing used while the Countertop Materials tray is open — angled down at
// the island/counter run so the selected stone is front-and-centre.
const COUNTERTOP_POSE = {
  position: [6.9714, 1.3255, 1.2261] as [number, number, number],
  target: [3.7593, 0.5787, -1.0566] as [number, number, number],
  fov: 46,
  up: [0, 1, 0] as [number, number, number],
}

// Framing used while the Backsplash Materials tray is open.
const BACKSPLASH_POSE = {
  position: [4.6987, 1.1867, 1.3803] as [number, number, number],
  target: [2.9359, 1.1835, -0.2505] as [number, number, number],
  fov: 46,
  up: [0, 1, 0] as [number, number, number],
}

// Framing used while the Cabinet Hardware tray is open. The captured pose was degenerate
// (eye ≈ target ≈ scene centre), so the eye is kept and the target is pushed ~2 m out along
// the captured view direction so the camera/controls work.
const HARDWARE_POSE = {
  position: [3.8173, 1.1577, -1.1965] as [number, number, number],
  target: [2.2805, 1.0259, -2.4697] as [number, number, number],
  fov: 46,
  up: [0, 1, 0] as [number, number, number],
}

// Framing used while the Faucet Style tray is open (frames the sink faucet).
const FAUCET_POSE = {
  position: [2.063, 1.12, -0.5911] as [number, number, number],
  target: [1.6866, 1.1032, -0.7764] as [number, number, number],
  fov: 46,
  up: [0, 1, 0] as [number, number, number],
}

export default function KitchenScene({ config, onTargets, activeView = DEFAULT_VIEW, viewNonce = 0, lighting, studio, countertopOpen = false, backsplashOpen = false, hardwareOpen = false, faucetOpen = false }: Props) {
  const { scene } = useGLTF(MODEL_URL)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  // Identity-transform root — swapped pull instances carry world-space matrices, so they're
  // parented here rather than under the (possibly transformed) gltf scene.
  const sceneRoot = useThree((s) => s.scene)
  // drei OrbitControls instance (OrbitControlsImpl); typed loosely to avoid import friction.
  const controlsRef = useRef<any>(null)
  // Camera-glide animation state; null when settled. `from*` are captured on the
  // first frame (the live pose at switch time); `start` is the clock stamp.
  const animRef = useRef<{
    to: { pos: Vector3; target: Vector3; fov: number }
    start: number | null
    fromPos?: Vector3
    fromTarget?: Vector3
    fromFov?: number
  } | null>(null)
  const lastView = useRef<ViewName | null>(null)
  // The shared polished-marble material (built in the arch effect). Held in a ref so the
  // countertop-finish effect can swap its maps between Calacatta (GLB) and Marble012.
  const marbleRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  // Island slab gets its OWN marble material so its texture can use MirroredRepeat
  // (bookended tiling — adjacent repeats flip, hiding the seam) while every other
  // countertop keeps plain RepeatWrapping. Wrap mode is per-texture, so the island
  // needs independent map clones.
  const islandMarbleRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  // Marble012 texture set (the second countertop option). Configured once below.
  // All countertop stone texture sets (id → color + normal). 'calacatta' is the authored
  // GLB stone (no files) and is handled by restoring the stashed maps in the swap effect.
  const ctUrls = useMemo(() => {
    const o: Record<string, string> = {}
    for (const id of COUNTERTOP_TEX_IDS) {
      o[`${id}__m`] = `/textures/countertops/${id}_color.jpg`
      o[`${id}__n`] = `/textures/countertops/${id}_normal.jpg`
    }
    return o
  }, [])
  const ctTex = useTexture(ctUrls) as Record<string, THREE.Texture>
  // Non-wood floor maps (the 'stone-tile' / 'concrete-floor' options swap the floor's map
  // to these, instead of the wood plank map the four wood tones share).
  const floorStoneTex = useTexture('/textures/floor/stone006_color.jpg') as THREE.Texture
  const floorConcreteTex = useTexture('/textures/floor/concrete_color.jpg') as THREE.Texture
  const floorBlondeTex = useTexture('/textures/floor/blondewood_color.jpg') as THREE.Texture
  const floorCheckerTex = useTexture('/textures/floor/checker_color.jpg') as THREE.Texture
  const floorCharcoalTileTex = useTexture('/textures/floor/charcoaltile_color.jpg') as THREE.Texture
  const floorWoodChevronTex = useTexture('/textures/floor/woodchevron_color.jpg') as THREE.Texture
  const floorDarkPineTex = useTexture('/textures/floor/darkpine_color.jpg') as THREE.Texture
  const floorTerracottaHexTex = useTexture('/textures/floor/terracottahex_color.jpg') as THREE.Texture

  // Hardware pulls — load every pull GLB, analyze each into a swappable source. The active
  // pull (config.hardwareStyle) replaces every original "*Pull*" mesh in the kitchen.
  const pullGltfs = useGLTF(PULL_URL_LIST) as Array<{ scene: THREE.Object3D }>
  const pullKey = pullGltfs.map((g) => g.scene.uuid).join(',')
  const pullSources = useMemo(() => {
    const o: Record<string, PullSource> = {}
    PULL_IDS.forEach((id, i) => { o[id] = analyzePullSource(pullGltfs[i].scene) })
    return o
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullKey])
  const pullTargetsRef = useRef<PullTarget[]>([])
  const addedPullsRef = useRef<THREE.Object3D[]>([])
  // Fridge/freezer metal (the 'alu' body+handles mesh) — recoloured to match the selected
  // hardware finish so the appliance pulls track the cabinet pulls.
  const applianceMetalRef = useRef<THREE.Mesh[]>([])
  const pullMaterialRef = useRef<THREE.Material | null>(null)

  // Cabinet doors — load every door GLB into a swappable source. The active door
  // (config.cabinetStyle) replaces every cabinet door panel in the kitchen.
  const doorGltfs = useGLTF(DOOR_URL_LIST) as Array<{ scene: THREE.Object3D }>
  const doorKey = doorGltfs.map((g) => g.scene.uuid).join(',')
  const doorSources = useMemo(() => {
    const o: Record<string, DoorSource> = {}
    DOOR_IDS.forEach((id, i) => { o[id] = analyzeDoorSource(doorGltfs[i].scene) })
    return o
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doorKey])
  const doorTargetsRef = useRef<DoorTarget[]>([])
  const addedDoorsRef = useRef<THREE.Object3D[]>([])

  // Faucets — load every faucet GLB; the active one (config.faucetStyle) replaces the
  // authored sink faucet, recoloured to the selected faucet finish.
  const faucetGltfs = useGLTF(FAUCET_URL_LIST) as Array<{ scene: THREE.Object3D }>
  const faucetKey = faucetGltfs.map((g) => g.scene.uuid).join(',')
  const addedFaucetRef = useRef<THREE.Object3D[]>([])
  const originalFaucetMeshesRef = useRef<THREE.Mesh[]>([])
  const faucetAnchorRef = useRef<{ x: number; y: number; z: number } | null>(null)

  // Backsplash tile texture sets (id → color + normal + roughness). The backsplash mesh is
  // collected during the scene build; the backsplash effect swaps it between the shared
  // marble ('matching-stone') and the selected tile material, also swapping the geometry's
  // uv attribute (authored marble UVs ⇄ world tile UVs).
  const backsplashMeshesRef = useRef<THREE.Mesh[]>([])
  const bsUrls = useMemo(() => {
    const o: Record<string, string> = {}
    for (const id of BACKSPLASH_TEX_IDS) {
      o[`${id}__c`] = `/textures/backsplash/${id}_color.jpg`
      o[`${id}__n`] = `/textures/backsplash/${id}_normal.jpg`
      o[`${id}__r`] = `/textures/backsplash/${id}_rough.jpg`
    }
    return o
  }, [])
  const bsTex = useTexture(bsUrls) as Record<string, THREE.Texture>
  // Per-tile pattern scale-up: repeat scalar < 1 makes the tiles read BIGGER than the
  // shared backsplash UV scale (1 = default). Green/blue are scaled up ~2×.
  const BS_REPEAT: Record<string, number> = { green: 0.5, blue: 0.5, fluted: 1 / 3, whitechevron: 1 / 2, whitewoven: 1 / 2, stackedterracotta: 0.5, subwayvert: 0.5 }
  const bsMaterials = useMemo(() => {
    const out: Record<string, THREE.MeshStandardMaterial> = {}
    for (const id of BACKSPLASH_TEX_IDS) {
      const c = bsTex[`${id}__c`], n = bsTex[`${id}__n`], r = bsTex[`${id}__r`]
      const rep = BS_REPEAT[id] ?? 1
      for (const t of [c, n, r]) {
        if (!t) continue
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(rep, rep)
        t.needsUpdate = true
      }
      if (c) c.colorSpace = THREE.SRGBColorSpace
      for (const t of [n, r]) { if (t) t.colorSpace = THREE.NoColorSpace }
      out[id] = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: c ?? null, normalMap: n ?? null, roughnessMap: r ?? null,
        roughness: 1, metalness: 0, // roughnessMap carries the real gloss
        envMapIntensity: 0.35,
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bsTex])

  // Live lighting — the `lighting` state is owned by App + edited by the visible
  // StudioPanel; assembling it here drives the real lights, so panel changes hit
  // the scene immediately. Light helpers render while the panel (studio) is open.
  const { light, cans } = useMemo(() => assemble(lighting), [lighting])

  // Resolve a named view to a concrete pose (eye / look-target / fov / up).
  // 'pose' views are exact captured poses (used verbatim). 'computed' views aim
  // at the live bbox center + a lateral pan, so panning shifts framing without
  // changing the view direction (robust to model changes).
  const resolveView = (name: ViewName) => {
    const view = KITCHEN_VIEWS[name] ?? KITCHEN_VIEWS[DEFAULT_VIEW]
    if (view.kind === 'pose') {
      return {
        pos: new Vector3(...view.position),
        target: new Vector3(...view.target),
        fov: view.fov,
        up: view.up as unknown as [number, number, number],
      }
    }
    const center = new Box3().setFromObject(scene).getCenter(new Vector3())
    const scratch = new THREE.PerspectiveCamera()
    scratch.position.set(...view.preset.position)
    scratch.up.set(...view.preset.up)
    scratch.lookAt(center)
    const right = new Vector3(1, 0, 0).applyQuaternion(scratch.quaternion)
    right.y = 0
    right.normalize()
    const pan = right.multiplyScalar(view.pan)
    return {
      pos: new Vector3(...view.preset.position).add(pan),
      target: center.clone().add(pan),
      fov: view.fov,
      up: view.preset.up as [number, number, number],
    }
  }

  // Apply the active view. First application (load) snaps instantly; later view
  // switches hand off to the useFrame tween below so the camera glides over.
  useEffect(() => {
    if (!scene) return
    const { pos, target, fov, up } = resolveView(activeView)
    // First application (initial load) snaps instantly. Every later run — a view
    // SWITCH *or* re-clicking the CURRENT view (viewNonce bumped) — glides back to the
    // pose, so the button always returns the camera to that view's default position.
    const glide = lastView.current !== null
    lastView.current = activeView
    camera.up.set(...up)
    camera.near = 0.05
    camera.far = 2000
    if (glide) {
      animRef.current = { to: { pos, target, fov }, start: null }
    } else {
      animRef.current = null
      camera.position.copy(pos)
      camera.fov = fov
      camera.lookAt(target)
      camera.updateProjectionMatrix()
      if (controlsRef.current) {
        controlsRef.current.target.copy(target)
        controlsRef.current.update()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, viewNonce, camera, scene])

  // Countertop tray → glide to the countertop framing on open; glide back to the
  // active view on close. Skips the initial mount (the view effect above already
  // placed the camera) so first paint isn't disturbed.
  const ctTrayInit = useRef(false)
  useEffect(() => {
    if (!scene) return
    if (!ctTrayInit.current) { ctTrayInit.current = true; return }
    const { pos, target, fov, up } = countertopOpen
      ? {
          pos: new Vector3(...COUNTERTOP_POSE.position),
          target: new Vector3(...COUNTERTOP_POSE.target),
          fov: COUNTERTOP_POSE.fov,
          up: COUNTERTOP_POSE.up,
        }
      : resolveView(activeView)
    camera.up.set(...up)
    animRef.current = { to: { pos, target, fov }, start: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countertopOpen])

  // Backsplash tray → glide to the backsplash framing on open; glide back to the active
  // view on close. Same pattern as the countertop tray above.
  const bsTrayInit = useRef(false)
  useEffect(() => {
    if (!scene) return
    if (!bsTrayInit.current) { bsTrayInit.current = true; return }
    const { pos, target, fov, up } = backsplashOpen
      ? {
          pos: new Vector3(...BACKSPLASH_POSE.position),
          target: new Vector3(...BACKSPLASH_POSE.target),
          fov: BACKSPLASH_POSE.fov,
          up: BACKSPLASH_POSE.up,
        }
      : resolveView(activeView)
    camera.up.set(...up)
    animRef.current = { to: { pos, target, fov }, start: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backsplashOpen])

  // Hardware tray → glide to the hardware framing on open; glide back to the active view
  // on close. Same pattern as the trays above.
  const hwTrayInit = useRef(false)
  useEffect(() => {
    if (!scene) return
    if (!hwTrayInit.current) { hwTrayInit.current = true; return }
    const { pos, target, fov, up } = hardwareOpen
      ? {
          pos: new Vector3(...HARDWARE_POSE.position),
          target: new Vector3(...HARDWARE_POSE.target),
          fov: HARDWARE_POSE.fov,
          up: HARDWARE_POSE.up,
        }
      : resolveView(activeView)
    camera.up.set(...up)
    animRef.current = { to: { pos, target, fov }, start: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardwareOpen])

  // Faucet tray → glide to the faucet framing on open; glide back to the active view on close.
  const faucetTrayInit = useRef(false)
  useEffect(() => {
    if (!scene) return
    if (!faucetTrayInit.current) { faucetTrayInit.current = true; return }
    const { pos, target, fov, up } = faucetOpen
      ? {
          pos: new Vector3(...FAUCET_POSE.position),
          target: new Vector3(...FAUCET_POSE.target),
          fov: FAUCET_POSE.fov,
          up: FAUCET_POSE.up,
        }
      : resolveView(activeView)
    camera.up.set(...up)
    animRef.current = { to: { pos, target, fov }, start: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faucetOpen])

  // Smooth camera glide between views: fixed ~0.7 s, easeInOutQuad, time-based so
  // it's frame-rate-independent. Captures the start pose on the first frame, then
  // lerps eye/target/fov to the destination and clears (freeing manual orbit).
  useFrame((state) => {
    const a = animRef.current
    const controls = controlsRef.current
    if (!a || !controls) return
    if (a.start === null) {
      a.start = state.clock.elapsedTime
      a.fromPos = camera.position.clone()
      a.fromTarget = (controls.target as Vector3).clone()
      a.fromFov = camera.fov
    }
    const DURATION = 1.0
    let u = (state.clock.elapsedTime - a.start) / DURATION
    if (u > 1) u = 1
    // Time-warp the input (u^0.9) before smootherstep: a gentler warp than before so the
    // start ramps up more slowly (more ease-in) while still leaving a slightly extended
    // deceleration tail. smootherstep keeps zero velocity at both ends.
    const w = Math.pow(u, 0.9)
    const e = w * w * w * (w * (w * 6 - 15) + 10) // smootherstep on warped time
    camera.position.lerpVectors(a.fromPos!, a.to.pos, e)
    ;(controls.target as Vector3).lerpVectors(a.fromTarget!, a.to.target, e)
    camera.fov = a.fromFov! + (a.to.fov - a.fromFov!) * e
    camera.updateProjectionMatrix()
    controls.update()
    if (u >= 1) animRef.current = null
  })

  // Pose capture: press "P" in the view to capture the exact current camera pose
  // (position / target / fov / up). Shows it on-screen (PoseReadout) + copies it,
  // so it can be pasted back and baked into KITCHEN_VIEWS as a 'pose' view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key.toLowerCase() !== 'p') return
      const t = controlsRef.current?.target
      const pose = {
        position: camera.position.toArray().map((v) => +v.toFixed(4)),
        target: t ? (t.toArray() as number[]).map((v) => +v.toFixed(4)) : null,
        fov: camera.fov,
        up: camera.up.toArray(),
      }
      const text = JSON.stringify(pose)
      console.log('[POSE]', text)
      // Visible feedback (clipboard can silently fail without focus): show an
      // on-screen, pre-selected readout via a DOM event (PoseReadout listens).
      window.dispatchEvent(new CustomEvent('envision:pose', { detail: text }))
      void navigator.clipboard?.writeText(text).catch(() => {})
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [camera])

  const lookup = useMemo(
    () => ET.createLookup(scene, { applianceMode: config.applianceMode }),
    [scene, config.applianceMode],
  )

  // Shared warm off-white room paint — ONE instance for the wall/ceiling shell
  // AND the visible ceiling cap, so they're guaranteed identical. Real
  // MeshStandardMaterial (lighting-responsive, NOT MeshBasic); emissive off so it
  // never self-lights; DoubleSide so the down-facing cap renders from the room.
  // Wall paint for the plaster shell. ONE shared instance (every wall mesh points at it), created
  // once and recoloured live from the selected Paint Color swatch (see the effect below) — so the
  // whole shell repaints instantly without re-running the architectural rebuild.
  const roomPaint = useMemo(() => {
    const initial = wallColorHex(config.wallColor) ?? '#f3f0ea'
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initial), metalness: 0, roughness: 0.91, envMapIntensity: 0.025,
      side: THREE.DoubleSide,
    })
    m.emissive.set(0x000000)
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Repaint the whole shell when the wall-colour swatch changes (all wall meshes share roomPaint).
  useEffect(() => {
    const hex = wallColorHex(config.wallColor)
    if (hex) roomPaint.color.set(hex)
  }, [config.wallColor, roomPaint])

  // Ceiling cap material — same paint, but with a gentle emissive floor. The sun
  // sits above the room, so the ceiling's down-facing underside receives no direct
  // sun and would read dark/brown against the now sun-lit room. A real painted
  // ceiling stays bright from light bouncing UP off the room; this low emissive
  // simulates that bounce so the ceiling holds a soft warm white — independent of
  // the directional sun, and without self-lighting the walls (separate material).
  const ceilingPaint = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: 0xf3f0ea, metalness: 0, roughness: 0.95, envMapIntensity: 0.025,
      side: THREE.DoubleSide,
    })
    m.emissive.set(0xf1ede5)
    m.emissiveIntensity = 0.32
    return m
  }, [])

  useEffect(() => {
    if (!onTargets) return
    const counts: TargetCounts = {}
    for (const c of ET.CATEGORIES) counts[c] = lookup.targets[c].length
    onTargets(counts)
  }, [lookup, onTargets])

  // One-time PBR rebuild of the architectural surfaces, driven by the authored
  // glTF material NAMES (GLTFLoader preserves them) plus node names — NOT by
  // ancestry-regex guesses. Critical detail: ~69 meshes were exported with no
  // material, so GLTFLoader hands them all ONE shared default material. We must
  // reassign those per-category (never mutate the shared default), or marble /
  // countertops / crown-molding all collapse to whichever ran first.
  //   Material names of interest:
  //     'Calacatta Marble (AAML31)'        → marble (textured: backsplash, waterfall)
  //     'Benchmark Oak 3060, Planks (…)'   → wood floor
  //     'Plaster_02_1K'                    → walls + ceiling
  //     'Brass 04, Brushed' / corrugated   → metal (already metalness 0.5)
  //   No-material meshes, keyed by node name:
  //     '…CrownMolding', '…window_molding', '…Window…Frame/Grille' → cream trim
  //     '…Countertop_Island/RangeWall…'    → marble (untextured slab)
  useEffect(() => {
    const fullName = (o: THREE.Object3D) => {
      let p: THREE.Object3D | null = o
      let name = ''
      while (p) { if (p.name) name = `${p.name} ${name}`; p = p.parent }
      return name
    }

    // Borrow the authored Calacatta veining map so the untextured slab
    // countertops can share the same stone instead of reading flat grey.
    //
    // RECURRING-BUG FIX (flat-white countertops): this effect REPLACES the
    // authored 'Calacatta Marble' materials with our own (unnamed) ones. `scene`
    // comes from drei's cached useGLTF, so it's shared and PERSISTS across
    // remounts — view switches, HMR, and StrictMode's double-invoke. On any run
    // after the first, the authored marble is already gone, so a /calacatta|
    // marble/ NAME scan finds nothing, marbleMap stays null, and the counters
    // rebuild map-less → flat white. So cache the authored maps on scene.userData
    // the first time and always recover them (also from any material we already
    // rebuilt, which stashes the maps in userData) instead of re-deriving by name.
    const su = scene.userData as Record<string, THREE.Texture | null | undefined>
    let marbleMap: THREE.Texture | null = su.__ctMarbleMap ?? null
    let marbleNormal: THREE.Texture | null = su.__ctMarbleNormal ?? null
    if (!marbleMap) {
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
        if (!m) return
        if (/calacatta|marble/i.test(m.name)) {
          marbleMap = marbleMap ?? m.map ?? null
          marbleNormal = marbleNormal ?? m.normalMap ?? null
        }
        // A material we already rebuilt on a prior run — recover its stashed maps.
        const ud = m.userData as Record<string, THREE.Texture | undefined>
        if (ud.calacattaMap) {
          marbleMap = marbleMap ?? ud.calacattaMap ?? null
          marbleNormal = marbleNormal ?? ud.calacattaNormal ?? null
        }
      })
      su.__ctMarbleMap = marbleMap
      su.__ctMarbleNormal = marbleNormal
    }

    // Let the veining tile across large slabs (the projected UVs below exceed 1).
    if (marbleMap) {
      ;(marbleMap as THREE.Texture).wrapS = THREE.RepeatWrapping
      ;(marbleMap as THREE.Texture).wrapT = THREE.RepeatWrapping
      ;(marbleMap as THREE.Texture).needsUpdate = true
    }
    if (marbleNormal) {
      ;(marbleNormal as THREE.Texture).wrapS = THREE.RepeatWrapping
      ;(marbleNormal as THREE.Texture).wrapT = THREE.RepeatWrapping
    }

    // Polished marble — carries the Calacatta veining map (map/normalMap/UVs are
    // preserved exactly as-is). Finish only: clearcoat gives a glossy, subtly
    // reflective polished-stone surface that softly mirrors the cabinets without
    // going mirror/glass/wet or washing out the veining.
    const marble = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      map: marbleMap, normalMap: marbleNormal,
      roughness: 0.18, metalness: 0,
      clearcoat: 0.65, clearcoatRoughness: 0.18, envMapIntensity: 0.9,
    })
    // Stash the authored Calacatta maps + expose the material so the countertop-finish
    // effect can swap between Calacatta and Marble012 without rebuilding the scene.
    marble.userData.calacattaMap = marbleMap
    marble.userData.calacattaNormal = marbleNormal
    marbleRef.current = marble

    // Island-only material — same polished finish, but its maps are mirror-wrapped
    // clones so the tiling bookends (each repeat flips against its neighbour) and the
    // seam disappears. Defaults to the Calacatta veining like the shared material.
    const mkMirror = (t: THREE.Texture | null) => {
      if (!t) return null
      const c = t.clone()
      c.wrapS = c.wrapT = THREE.MirroredRepeatWrapping
      c.needsUpdate = true
      return c
    }
    const islandMarble = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      map: mkMirror(marbleMap), normalMap: mkMirror(marbleNormal),
      roughness: 0.18, metalness: 0,
      clearcoat: 0.65, clearcoatRoughness: 0.18, envMapIntensity: 0.9,
    })
    islandMarble.userData.calacattaMap = islandMarble.map
    islandMarble.userData.calacattaNormal = islandMarble.normalMap
    islandMarbleRef.current = islandMarble

    // Project planar XZ UVs (world-scaled) so the no-material slab counters/island
    // top show the same veining instead of reading as flat white. ~2.6 m per sheet.
    const projectMarbleUVs = (geom: THREE.BufferGeometry) => {
      const pos = geom.attributes.position
      if (!pos) return
      const S = 1 / 2.6
      const uv = new Float32Array(pos.count * 2)
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = pos.getX(i) * S
        uv[i * 2 + 1] = pos.getZ(i) * S
      }
      geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    }
    // Match the cabinet default "White" finish exactly (#f6f4f0 + same satin params) so the
    // trim, crown molding and vent hood read as the same white as the cabinets.
    const trimPaint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f6f4f0'),
      roughness: 0.52, metalness: 0,
      clearcoat: 0.1, clearcoatRoughness: 0.58, envMapIntensity: 0.08,
    })
    // Window frame / mullions / casing — off-white painted trim (matches cabinets).
    const windowTrim = new THREE.MeshStandardMaterial({
      color: 0xf3f1ec, metalness: 0, roughness: 0.52, envMapIntensity: 0.18,
    })
    // Window glass — subtle, near-clear. NOT the authored metallic Glass_Basic_01
    // (metalness 1 reflecting the dim env read as a dark panel). depthWrite:false
    // so it never occludes the garden plate sitting behind it.
    const windowGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.05,
      transmission: 0.35, transparent: true, opacity: 0.18,
      envMapIntensity: 0.15, depthWrite: false, side: THREE.DoubleSide,
    })
    // Room shell — the ONE shared warm off-white paint (lifted to component scope
    // as `roomPaint` so the visible ceiling cap below reuses the exact same
    // material instance as the walls/ceiling).
    const sharedRoomPaint = roomPaint

    backsplashMeshesRef.current = []
    applianceMetalRef.current = []
    originalFaucetMeshesRef.current = []
    faucetAnchorRef.current = null

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const src = mesh.material as THREE.MeshStandardMaterial
      if (!src) return
      const done = (mesh.userData as Record<string, unknown>)
      // RECURRING-BUG FIX: branch on the AUTHORED material name, stashed once. This
      // effect REPLACES materials in place, and `scene` (drei-cached useGLTF) persists
      // across remounts — switching the top nav tab or reloading unmounts/remounts
      // KitchenScene and re-runs this effect over the SAME scene. On a re-run src.name
      // is our own (unnamed) replacement, so a live-name test would misclassify: e.g.
      // the authored 'Calacatta Marble' island waterfall no longer matches the marble
      // branch, falls through to the /countertop/ slab branch, gets planar-XZ UVs
      // reprojected onto its vertical face, and renders flat/striped instead of veined.
      // Reading the stashed authored name keeps every mesh's classification stable.
      if (done.__origMat === undefined) done.__origMat = src.name || ''
      const mat = done.__origMat as string
      const name = fullName(o)

      // Authored sink faucet (the Galley tap) — collect its meshes FIRST so the faucet-swap
      // effect can hide them and anchor the chosen faucet GLB. Must precede the /countertop/i
      // branch below: the faucet node is "…SinkWall_Countertop_01_Faucet" (contains
      // "Countertop"), which would otherwise capture it as a marble countertop.
      if (/faucet/i.test(name)) {
        originalFaucetMeshesRef.current.push(mesh)
        return
      }

      // Wood floor — UNLIT (MeshBasic). three.js can't exclude one light from one surface,
      // so to keep the OUTSIDE SUN (and all lights) off the floor while the sun still hits
      // the cabinets/counters, the floor simply doesn't react to light. toneMapped stays on
      // so it grades with the scene (not flat/pale); the recolour drives a vibrant tone so
      // it doesn't read dull. Grounded by the fake contact-shadow decals.
      if (/benchmark oak|oak.*plank/i.test(mat) || /Floor_/i.test(name)) {
        if (done.__archDone) return
        const oak = new THREE.MeshBasicMaterial({
          map: src.map ?? null,
          color: new THREE.Color('#c7a672'), // light golden oak base (painted-finish default)
        })
        mesh.material = oak
        mesh.receiveShadow = false // no real shadow-map shadows; fake decals do the grounding
        done.__archDone = true
        return
      }
      // Windows — handled as a group BEFORE the generic trim/metal rules so no
      // window mesh keeps the shared metallic default. The frame, mullions
      // (grille), molding AND the bare casing ring (leaf "Geom3D_Windows", which
      // has no authored material and otherwise renders as a DARK metallic border
      // in front of the garden) all get off-white trim; the panes get near-clear
      // glass. The garden plate (a separate unlit plane) sits behind all of this.
      if (/(^|\s)Windows(\s|$)/.test(name) || /window_molding/i.test(name)) {
        if (/glass/i.test(name)) {
          mesh.material = windowGlass
        } else {
          mesh.geometry?.computeVertexNormals()
          mesh.material = windowTrim
        }
        return
      }
      // Plaster room shell (walls + ceiling) → the single shared paint. Match on
      // the MATERIAL name only: the three real shell meshes (Walls_Perimeter_01 ×2,
      // Ceiling_Perimeter_01) all carry 'Plaster_02_1K'. Do NOT match by node name
      // here — the window sub-meshes are named "Window_SinkWall_…", so a /wall/i
      // name test would wrongly repaint the window glass and blank the garden.
      if (/plaster/i.test(mat)) {
        mesh.material = sharedRoomPaint
        return
      }
      // Backsplash — defaults to the shared marble ('matching-stone'); the backsplash
      // effect swaps it to a tile material. Precompute the world tile UVs now and stash
      // both UV sets so the effect can flip between marble (authored) and tile UVs. Must
      // come BEFORE the generic marble branch (its material is 'Calacatta Marble').
      if (BACKSPLASH_NODE_RE.test(name)) {
        const geom = mesh.geometry
        if (geom?.attributes.uv && !geom.userData.__bsUVReady) {
          geom.userData.__uvMarble = geom.attributes.uv
          geom.userData.__uvTile = makeWallTileUVs(geom, mesh, 1 / 0.55) // ~0.55 m per tile image
          geom.userData.__bsUVReady = true
        }
        mesh.material = marble
        backsplashMeshesRef.current.push(mesh)
        return
      }
      // Marble — authored textured pieces (backsplash, island waterfall).
      // Island pieces get the mirror-wrapped island material; everything else shared.
      if (/calacatta|marble/i.test(mat)) {
        mesh.material = /island/i.test(name) ? islandMarble : marble
        return
      }
      // Slab countertops / island top (no authored material) — project planar UVs
      // and apply the real marble map so the veining reads, then the polished
      // marble material. (Fixes the washed-out flat-white tops.)
      if (/countertop/i.test(name)) {
        // Reproject once per geometry — the scene is cached across remounts, so a
        // second pass must not re-run planar projection (and never touch a piece
        // already routed through the authored-marble branch above).
        if (mesh.geometry && !mesh.geometry.userData.__ctUVReady) {
          mesh.geometry.computeVertexNormals()
          projectMarbleUVs(mesh.geometry)
          mesh.geometry.userData.__ctUVReady = true
        }
        mesh.material = /island/i.test(name) ? islandMarble : marble
        return
      }
      // Crown molding, window frames/grille/molding, perimeter trim, and the vent
      // hood → cream. The hood stays trim-coloured regardless of cabinet finish.
      // The crown molding's normals are inverted (mirrored instance) so it reads
      // near-black; recompute them so it catches light like the reference.
      if (/crownmolding|trim_perimeter|window_molding|window_.*_(frame|grille)|hood/i.test(name)) {
        mesh.geometry?.computeVertexNormals()
        mesh.material = trimPaint
        return
      }
      // Fridge/freezer metal body+handles (one fused 'alu' mesh). Collect it so the
      // hardware-finish effect can recolour the handles to match the cabinet pulls.
      // The body sits behind the panel-ready fronts/inside the casing, so visibly this
      // recolours the protruding handles. Skip the generic metal tweak below — the
      // finish effect assigns its material.
      if (mat === 'alu' && /Refrigerator/i.test(name)) {
        applianceMetalRef.current.push(mesh)
        return
      }
      // Already-metal surfaces (brass pulls, stainless range/hood, fridge, faucet).
      if ((src.metalness ?? 0) >= 0.5 && !/panel/i.test(name)) {
        if (done.__archDone) return
        src.roughness = Math.min(src.roughness ?? 0.32, 0.32)
        src.envMapIntensity = 0.85
        src.needsUpdate = true
        done.__archDone = true
        return
      }
    })
  }, [scene])

  // Enable shadows on every model mesh. GLTFLoader leaves castShadow/receiveShadow
  // false, so NOTHING in the room cast or received a shadow — the whole reason the
  // scene read flat. With these on, the sun produces real cast shadows and the
  // cabinetry/molding gets depth.
  //
  // EXCEPTION: the architectural shell (walls + ceiling) must NOT cast shadows.
  // The sun sits high above the room, so if the ceiling casts, it shadows the
  // ENTIRE floor — the whole room sits in the ceiling's shade, sunlight never
  // reaches the floor, and you get a flat scene with no visible object shadows.
  // Walls/ceiling still RECEIVE shadows so the cabinetry casts onto them.
  // Shadow logic: nearly everything casts AND receives. Only two exceptions, both
  // to let the outside sun reach the room: (1) the CEILING/soffit cap doesn't cast
  // (a flat overhead lid would shadow the whole floor), and (2) the single solid
  // wall blocker directly behind the sink window doesn't cast (so sunlight passes
  // through the window area). The window frame/mullions/glass and all OTHER walls
  // cast normally. (The blocking mesh is identified at runtime by name — see below.)
  useEffect(() => {
    const anc = (o: THREE.Object3D, re: RegExp) => {
      let p: THREE.Object3D | null = o
      while (p) { if (re.test(p.name)) return true; p = p.parent }
      return false
    }
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = !anc(o, /ceiling|soffit/i)
        // Floor never RECEIVES real shadow maps — it's the matte non-reflective floor
        // and is grounded by the fake contact-shadow decals instead.
        m.receiveShadow = !anc(o, /Floor_Perimeter/i)
      }
    })
  }, [scene])

  // Countertop finish → swap the shared marble material's maps. 'calacatta' = the authored
  // GLB stone; every other id pulls its color+normal from ctTex. Same polished finish + UVs
  // either way, so all marble surfaces (counters, island top, waterfall, backsplash) update.
  useEffect(() => {
    const mat = marbleRef.current
    const isl = islandMarbleRef.current
    if (!mat) return
    const m = ctTex[`${config.countertop}__m`]
    const n = ctTex[`${config.countertop}__n`]
    // Mirror-wrapped clone for the island (bookended tiling), disposing the prior
    // clone so swapping materials doesn't leak GPU textures.
    const mkMirror = (t: THREE.Texture | null) => {
      if (!t) return null
      const c = t.clone()
      c.wrapS = c.wrapT = THREE.MirroredRepeatWrapping
      c.needsUpdate = true
      return c
    }
    const setIsland = (im: THREE.Texture | null, inn: THREE.Texture | null, ns: number) => {
      if (!isl) return
      if (isl.map && isl.map !== isl.userData.calacattaMap) isl.map.dispose()
      if (isl.normalMap && isl.normalMap !== isl.userData.calacattaNormal) isl.normalMap.dispose()
      isl.map = im
      isl.normalMap = inn
      isl.normalScale.set(ns, ns)
      isl.needsUpdate = true
    }
    if (m && n) {
      for (const t of [m, n]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true }
      m.colorSpace = THREE.SRGBColorSpace
      n.colorSpace = THREE.NoColorSpace
      mat.map = m
      mat.normalMap = n
      mat.normalScale.set(0.4, 0.4) // subtle — keep it reading as polished slab, not bumpy
      const im = mkMirror(m)
      const inn = mkMirror(n)
      if (im) im.colorSpace = THREE.SRGBColorSpace
      if (inn) inn.colorSpace = THREE.NoColorSpace
      setIsland(im, inn, 0.4)
    } else {
      // 'calacatta' (default) → the authored GLB stone (island uses its mirror clone).
      mat.map = (mat.userData.calacattaMap as THREE.Texture) ?? null
      mat.normalMap = (mat.userData.calacattaNormal as THREE.Texture) ?? null
      mat.normalScale.set(1, 1)
      setIsland(
        (isl?.userData.calacattaMap as THREE.Texture) ?? null,
        (isl?.userData.calacattaNormal as THREE.Texture) ?? null,
        1,
      )
    }
    mat.needsUpdate = true
  }, [scene, config.countertop, ctTex])

  // Backsplash material → 'matching-stone' keeps the shared countertop marble (so it
  // tracks the countertop automatically); any other id swaps to a tile material AND
  // swaps the geometry's uv attribute to the world tile UVs (square tiles) — flipping
  // back to the authored marble UVs when 'matching-stone' is reselected.
  useEffect(() => {
    const meshes = backsplashMeshesRef.current
    if (!meshes.length) return
    const isStone = config.backsplashStyle === 'matching-stone'
    const tile = bsMaterials[config.backsplashStyle]
    for (const m of meshes) {
      const geom = m.geometry
      const uvMarble = geom.userData.__uvMarble as THREE.BufferAttribute | undefined
      const uvTile = geom.userData.__uvTile as THREE.BufferAttribute | undefined
      const wantUv = isStone ? uvMarble : uvTile
      if (wantUv && geom.attributes.uv !== wantUv) {
        geom.setAttribute('uv', wantUv)
        wantUv.needsUpdate = true
      }
      m.material = isStone ? (marbleRef.current ?? m.material) : (tile ?? marbleRef.current ?? m.material)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.backsplashStyle, bsMaterials])

  // Hardware pulls (one-time): find every original pull and capture its brass material so
  // the swapped pulls inherit the scene's hardware finish. Visibility is managed by the
  // swap effect below (the 'modern-bar-pull' option keeps the originals visible).
  useEffect(() => {
    const targets = analyzePullTargets(scene)
    pullTargetsRef.current = targets
    if (targets[0]) {
      const m = targets[0].mesh.material
      pullMaterialRef.current = Array.isArray(m) ? m[0] : m
    }
  }, [scene])

  // Cabinet doors (one-time): find every cabinet door panel. Visibility + swap is handled
  // by the door-swap effect below (the 'shaker' option keeps the originals visible).
  useEffect(() => {
    doorTargetsRef.current = analyzeDoorTargets(scene)
  }, [scene])

  // Hardware pull selection. 'modern-bar-pull' (no GLB) → show the original authored pulls.
  // A GLB option → hide the originals and replace each with an aligned instance of the pull.
  useEffect(() => {
    const targets = pullTargetsRef.current
    if (!targets.length) return
    addedPullsRef.current.forEach((o) => o.parent?.remove(o))
    addedPullsRef.current = []
    const src = pullSources[config.hardwareStyle]
    if (!src || config.hardwareStyle === ORIGINAL_PULL_ID) {
      targets.forEach((t) => { t.mesh.visible = true }) // original authored pulls
      return
    }
    const material =
      pullMaterialRef.current ??
      new THREE.MeshStandardMaterial({ color: '#b08a4f', metalness: 0.9, roughness: 0.35 })
    targets.forEach((t) => { t.mesh.visible = false })
    const roll = PULL_ROLL[config.hardwareStyle] ?? 0
    for (const t of targets) {
      // Island drawer fronts face the opposite world direction from the wall cabinets, but the
      // bbox-derived basis is identical, so island pulls protrude the wrong way. Flip them 180°
      // about their long axis so the posts point out of the island face toward the room.
      const r = /island/i.test(t.name) ? roll + Math.PI : roll
      const inst = makePullInstance(src, t, material, r)
      sceneRoot.add(inst)
      addedPullsRef.current.push(inst)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.hardwareStyle, pullSources])

  // Hardware FINISH → paint every visible pull with the selected textured metal. Runs AFTER
  // the swap effect (above) so the swapped instances already exist; reapplies on a finish
  // change (when the style hasn't changed and the swap effect doesn't re-run).
  useEffect(() => {
    const mat = metalFinishMaterial(config.hardwareFinish)
    pullTargetsRef.current.forEach((t) => { t.mesh.material = mat }) // original authored pulls
    addedPullsRef.current.forEach((inst) => inst.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) m.material = mat // swapped pull instances
    }))
    applianceMetalRef.current.forEach((m) => { m.material = mat }) // fridge/freezer handles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.hardwareStyle, config.hardwareFinish, pullSources])

  // Faucet SWAP → hide the authored Galley tap and mount the selected faucet GLB at the
  // same deck anchor (base centred on the original faucet's footprint, sitting on the
  // counter). Per-faucet scale/yaw/offset comes from FAUCET_TUNE.
  useEffect(() => {
    if (!scene) return
    // Hide the authored faucet (always replaced — every option is a swap).
    originalFaucetMeshesRef.current.forEach((m) => { m.visible = false })
    // Anchor = the authored faucet's footprint centre, sitting on its base (deck) height.
    if (!faucetAnchorRef.current && originalFaucetMeshesRef.current.length) {
      const box = new THREE.Box3()
      originalFaucetMeshesRef.current.forEach((m) => box.expandByObject(m))
      const c = box.getCenter(new THREE.Vector3())
      faucetAnchorRef.current = { x: c.x, y: box.min.y, z: c.z }
    }
    const anchor = faucetAnchorRef.current
    // Clear any previously-added faucet.
    addedFaucetRef.current.forEach((o) => o.parent?.remove(o))
    addedFaucetRef.current = []
    const idx = FAUCET_IDS.indexOf(config.faucetStyle)
    const srcScene = idx >= 0 ? faucetGltfs[idx]?.scene : null
    if (!srcScene || !anchor) return
    const tune = FAUCET_TUNE[config.faucetStyle] ?? {}
    const root = srcScene.clone(true)
    root.scale.setScalar(tune.scale ?? 1)
    root.rotation.y = tune.yaw ?? 0
    root.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(root)
    const c = box.getCenter(new THREE.Vector3())
    const inst = new THREE.Group()
    inst.name = 'SwappedFaucet'
    inst.add(root)
    // Align the faucet's base-centre (c.x, box.min.y, c.z) to the deck anchor, + nudges.
    inst.position.set(
      anchor.x - c.x + (tune.dx ?? 0),
      anchor.y - box.min.y + (tune.dy ?? 0),
      anchor.z - c.z + (tune.dz ?? 0),
    )
    inst.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } })
    ;(scene as THREE.Object3D).add(inst)
    addedFaucetRef.current.push(inst)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.faucetStyle, faucetKey])

  // Faucet FINISH → paint the swapped faucet with the selected metal (same materials as the
  // hardware pulls). Runs after the swap so the instance exists; re-applies on finish change.
  useEffect(() => {
    const mat = metalFinishMaterial(config.faucetFinish)
    addedFaucetRef.current.forEach((inst) => inst.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) m.material = mat
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.faucetStyle, config.faucetFinish, faucetKey])

  // Cabinet finish → ALL cabinetry. Sweep the whole scene and paint every mesh
  // under any "Cabinet*" node (carcasses, face frames, interiors, doors/drawer
  // fronts) — robust to target-set membership. Pulls/hardware nested inside the
  // cabinet groups are skipped so they keep their metal finish. Panel-ready
  // appliance fronts (named Appliance_…Panel) are painted separately to match.
  useEffect(() => {
    const finish = optionById(CABINET_FINISHES, config.cabinetFinish) ?? null
    // Skip pulls/hardware (keep their metal) and the vent hood (stays trim-coloured).
    const skip = /pull|hardware|knob|handle|hood/i
    applyFinish([scene], finish, skip, /cabinet/i)
    const panels = lookup.targets.cabinet_style.filter((n) => /appliance/i.test(n.name))
    applyFinish(panels, finish, skip)
  }, [scene, lookup, config.cabinetFinish])

  // Cabinet door selection. 'shaker' (no swap) → show the original authored doors. A door
  // GLB → hide the originals and fit an instance into each opening. Runs AFTER the cabinet
  // finish effect (and depends on cabinetFinish) so swapped doors inherit the painted finish.
  useEffect(() => {
    const targets = doorTargetsRef.current
    if (!targets.length) return
    addedDoorsRef.current.forEach((o) => o.parent?.remove(o))
    addedDoorsRef.current = []
    const src = doorSources[config.cabinetStyle]
    if (!src || config.cabinetStyle === ORIGINAL_DOOR_ID) {
      targets.forEach((t) => { t.mesh.visible = true }) // original authored doors
      return
    }
    // Glass uppers: swap ONLY upper doors, keep the GLB's own materials (translucent glass),
    // and leave the lower doors as the original cabinet doors.
    const glassUpper = UPPERS_ONLY_DOOR_IDS.has(config.cabinetStyle)
    const placeholder = new THREE.MeshStandardMaterial({ color: '#ece9e3', metalness: 0, roughness: 0.7 })
    for (const t of targets) {
      if (glassUpper && !t.isUpper) { t.mesh.visible = true; continue } // lowers stay original
      t.mesh.visible = false
      const inst = makeDoorInstance(src, t, glassUpper ? null : placeholder, DOOR_FLIP_SCENE.has(config.cabinetStyle), DOOR_FACE_FLIP_SCENE.has(config.cabinetStyle))
      sceneRoot.add(inst)
      inst.updateMatrixWorld(true)
      addedDoorsRef.current.push(inst)
    }
    // Some uppers GLBs ship their glass panes as an OPAQUE material (no real glass). Convert
    // that pane material to translucent glass so it reads as glass (then it's stashed below).
    const glassCfg = DOOR_GLASS[config.cabinetStyle]
    if (glassCfg) {
      for (const inst of addedDoorsRef.current) {
        const toRemove: THREE.Object3D[] = []
        inst.traverse((o) => {
          const m = o as THREE.Mesh
          if (!m.isMesh) return
          const nm = (m.material as THREE.Material | undefined)?.name || ''
          if (glassCfg.drop && glassCfg.drop.test(nm)) { toRemove.push(m); return }
          if ((glassCfg.convert && glassCfg.convert.test(nm)) || (glassCfg.convertNoMat && !nm)) {
            // UNLIT translucent glass. The pane is a single sheet whose normals are
            // inconsistent across its area, so any LIT material (Standard/Physical) shades one
            // region (the middle-right pane) brighter than the rest. MeshBasic ignores normals
            // and lighting entirely → a flat translucent colour that is identical on every pane.
            // Double-sided so a flipped-normal face is never culled.
            m.material = new THREE.MeshBasicMaterial({
              color: '#7c8893', transparent: true, opacity: 0.55, depthWrite: false,
              side: THREE.DoubleSide,
            })
            m.userData.__glassPane = true // only THESE stay glass; everything else gets the finish
          }
        })
        toRemove.forEach((o) => o.parent?.remove(o))
      }
    }
    // Paint the swapped doors with the SAME cabinet finish (wood grain / solid colour) so they
    // match the cabinetry. For glass uppers, stash the translucent glass first and restore it
    // after so only the FRAME takes the finish (the glass stays glass).
    const finish = optionById(CABINET_FINISHES, config.cabinetFinish) ?? null
    const glassRestore: { mesh: THREE.Mesh; mat: THREE.Material | THREE.Material[] }[] = []
    if (glassUpper) {
      for (const inst of addedDoorsRef.current) {
        inst.traverse((o) => {
          const m = o as THREE.Mesh
          // Stash ONLY the panes we converted to glass — a stray semi-transparent BACKING
          // panel must NOT be stashed, or it escapes the finish and shows through one pane
          // as a lighter (unpainted) patch. Everything non-glass gets painted.
          if (m.isMesh && m.userData.__glassPane) glassRestore.push({ mesh: m, mat: m.material })
        })
      }
    }
    applyFinish(addedDoorsRef.current, finish, /pull|hardware|knob|handle|hood/i)
    glassRestore.forEach((g) => { g.mesh.material = g.mat })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.cabinetStyle, config.cabinetFinish, doorSources])

  // Floor COLOUR follows the FLOORING selection in the right rail (independent of the
  // cabinet finish). The floor keeps its own texture / grain / plank layout / scale /
  // direction; we only retint the material's `color`. Solve color = tone / textureMean
  // (in LINEAR) so the floor's mean maps to the chosen wood tone while every plank's
  // variation is preserved. Nothing else on the floor is touched.
  useEffect(() => {
    const tone = woodFinishTone(config.flooring) // one of the four wood tones
    const ORIG = '__envisionFloorOrigColor'
    const TEXMEAN = '__envisionFloorTexMeanLin'
    const isFloor = (o: THREE.Object3D) => {
      let p: THREE.Object3D | null = o
      while (p) { if (/Floor_Perimeter|benchmark oak/i.test(p.name)) return true; p = p.parent }
      return false
    }
    const s2l = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    // Mean of a texture's image in LINEAR space (per-texel sRGB→linear, then averaged).
    const texMeanLinear = (tex: THREE.Texture): THREE.Color | null => {
      const img = tex.image as CanvasImageSource & { width?: number }
      if (!img || !img.width) return null
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32
      const ctx = cv.getContext('2d'); if (!ctx) return null
      ctx.drawImage(img, 0, 0, 32, 32)
      const d = ctx.getImageData(0, 0, 32, 32).data
      let r = 0, g = 0, b = 0, n = 0
      for (let i = 0; i < d.length; i += 4) { r += s2l(d[i] / 255); g += s2l(d[i + 1] / 255); b += s2l(d[i + 2] / 255); n++ }
      return new THREE.Color(r / n, g / n, b / n) // already-linear components
    }
    const WOODMAP = '__envisionFloorWoodMap'
    // Non-wood floor options that swap the actual map. swapTex = the map for the current
    // selection (undefined for the wood tones, which retint the shared plank map instead).
    const SWAP: Record<string, THREE.Texture> = { 'stone-tile': floorStoneTex, 'concrete-floor': floorConcreteTex, 'blonde-wood': floorBlondeTex, 'checkerboard': floorCheckerTex, 'charcoal-tile': floorCharcoalTileTex, 'wood-chevron': floorWoodChevronTex, 'dark-pine': floorDarkPineTex, 'terracotta-hex': floorTerracottaHexTex }
    // Per-option UV tweaks layered on top of the copied wood-map transform.
    // scale = how much bigger the pattern reads (3 = 300% → 1/3 the repeats); rot in radians.
    // scale = uniform pattern size (×); rot in radians; repeatX/repeatY = per-axis repeat
    // multipliers (< 1 stretches that axis longer).
    const SWAP_TWEAK: Record<string, { scale?: number; rot?: number; repeatX?: number; repeatY?: number }> = {
      'checkerboard': { scale: 2 },
      'charcoal-tile': { scale: 3, rot: Math.PI / 2 },
      'wood-chevron': { scale: 2, rot: Math.PI / 2 },
      'terracotta-hex': { scale: 2 },
      'dark-pine': { scale: 2, rot: Math.PI / 2 },
    }
    const swapTex = SWAP[config.flooring]
    const tweak = SWAP_TWEAK[config.flooring]
    const isSwapTex = (t: THREE.Texture | null) => !!t && (t === floorStoneTex || t === floorConcreteTex || t === floorBlondeTex || t === floorCheckerTex || t === floorCharcoalTileTex || t === floorWoodChevronTex || t === floorDarkPineTex || t === floorTerracottaHexTex)
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || !isFloor(o)) return
      const mat = mesh.material as THREE.MeshBasicMaterial
      if (!mat || !mat.color) return
      if ((mat as unknown as { isShadowMaterial?: boolean }).isShadowMaterial) return // skip the shadow overlay
      const ud = mat.userData as Record<string, unknown>
      if (!ud[ORIG]) ud[ORIG] = mat.color.clone()
      // One-time grain contrast boost on the floor map (more depth, less flat).
      const CONTRAST = '__envisionFloorContrast'
      if (mat.map && !isSwapTex(mat.map) && !ud[CONTRAST]) {
        const ct = makeContrastTexture(mat.map, 1.22)
        if (ct !== mat.map) { mat.map = ct; mat.needsUpdate = true; ud[TEXMEAN] = undefined }
        ud[CONTRAST] = true
      }
      // Capture the wood plank map once (the boosted map if present) so the swap options
      // can swap away from it and the wood options can swap back to it.
      if (!ud[WOODMAP] && mat.map && !isSwapTex(mat.map)) ud[WOODMAP] = mat.map

      // Stone / concrete → swap the floor's MAP (not just a tint). Match the wood map's UV
      // transform so it lays out at the same scale, and show it untinted.
      if (swapTex) {
        const wm = ud[WOODMAP] as THREE.Texture | null
        swapTex.colorSpace = THREE.SRGBColorSpace
        swapTex.wrapS = swapTex.wrapT = THREE.RepeatWrapping
        if (wm) {
          swapTex.repeat.copy(wm.repeat)
          swapTex.offset.copy(wm.offset)
          swapTex.center.copy(wm.center)
          swapTex.rotation = wm.rotation
          swapTex.flipY = wm.flipY
        }
        if (tweak) {
          if (tweak.scale) swapTex.repeat.multiplyScalar(1 / tweak.scale) // bigger pattern = fewer repeats
          if (tweak.repeatX) swapTex.repeat.x *= tweak.repeatX
          if (tweak.repeatY) swapTex.repeat.y *= tweak.repeatY
          if (tweak.rot) { swapTex.center.set(0.5, 0.5); swapTex.rotation = (wm?.rotation ?? 0) + tweak.rot }
        }
        swapTex.needsUpdate = true
        mat.map = swapTex
        mat.color.setRGB(1, 1, 1) // show the swap map true, no wood tint
        mat.needsUpdate = true
        return
      }
      // Wood option → make sure the wood map is back (in case we were on stone/concrete).
      if (isSwapTex(mat.map) && ud[WOODMAP]) { mat.map = ud[WOODMAP] as THREE.Texture; mat.needsUpdate = true }
      if (!tone) { mat.color.copy(ud[ORIG] as THREE.Color); mat.needsUpdate = true; return }
      if (mat.map && !ud[TEXMEAN]) { const m = texMeanLinear(mat.map); if (m) ud[TEXMEAN] = m }
      const mean = ud[TEXMEAN] as THREE.Color | undefined
      const target = new THREE.Color(tone) // hex → linear components
      // Floor is UNLIT (gets no light), while the cabinets ARE lit — so an equal albedo
      // would render DARKER than the cabinets. Lighten slightly + boost saturation so the
      // unlit floor reads as vibrant as the lit cabinet wood.
      const hsl = { h: 0, s: 0, l: 0 }
      target.getHSL(hsl)
      // Per-floor saturation tweak (1 = default boost). Warm Walnut reads too saturated.
      const satScale = config.flooring === 'warm-walnut' ? 0.6 : 1
      target.setHSL(hsl.h, Math.min(1, hsl.s * 1.3 * satScale), Math.min(1, hsl.l * 1.18))
      if (mean) {
        const div = (a: number, b: number) => (b > 1e-4 ? Math.min(a / b, 2.5) : 1)
        mat.color.setRGB(div(target.r, mean.r), div(target.g, mean.g), div(target.b, mean.b))
      } else {
        mat.color.copy(target) // fallback if the image isn't decodable yet
      }
      mat.needsUpdate = true
    })
  }, [scene, config.flooring, floorStoneTex, floorConcreteTex, floorBlondeTex, floorCheckerTex, floorCharcoalTileTex, floorWoodChevronTex, floorDarkPineTex, floorTerracottaHexTex])

  // ── Diagnostics (temporary; gated by ?diag=inventory|basic|ambient) ───────
  // Default render (no ?diag) is completely unaffected. inventory: log lights +
  // shell materials. basic: unlit MeshBasic on the shell (isolate material vs
  // lighting). ambient: single neutral white AmbientLight, all else off.
  const DIAG = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('diag')
    : null
  const r3fScene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    if (!DIAG) return
    const fp = (o: THREE.Object3D) => { let p: THREE.Object3D | null = o, n = ''; while (p) { if (p.name) n = `${p.name} / ${n}`; p = p.parent } return n }
    // (1) Active lights in the real render graph
    const lights: THREE.Light[] = []
    r3fScene.traverse((o) => { if ((o as THREE.Light).isLight) lights.push(o as THREE.Light) })
    console.log('[DIAG] toneMapping=', gl.toneMapping, 'exposure=', gl.toneMappingExposure, 'outputColorSpace=', gl.outputColorSpace)
    console.log('[DIAG] light count =', lights.length)
    lights.forEach((l) => {
      const o: any = { type: l.type, intensity: +l.intensity.toFixed(3), color: '#' + l.color.getHexString() }
      const h = l as THREE.HemisphereLight
      if (h.isHemisphereLight) o.groundColor = '#' + h.groundColor.getHexString()
      const sp = l as THREE.SpotLight
      if (sp.castShadow !== undefined) o.castShadow = l.castShadow
      if (sp.shadow) o.shadowMap = !!sp.shadow.map
      console.log('[DIAG][light]', JSON.stringify(o))
    })
    // Shadow system state — is it globally enabled, and do meshes cast/receive?
    console.log('[DIAG][shadowMap] enabled=', (gl as any).shadowMap?.enabled, 'type=', (gl as any).shadowMap?.type, 'autoUpdate=', (gl as any).shadowMap?.autoUpdate)
    const sc = { cast: 0, recv: 0, total: 0 }
    scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { sc.total++; if (m.castShadow) sc.cast++; if (m.receiveShadow) sc.recv++ } })
    console.log('[DIAG][mesh shadow flags]', JSON.stringify(sc))
    // (2) Shell material inventory
    const shell: { name: string; mesh: THREE.Mesh }[] = []
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh && /Walls_Perimeter|Ceiling_Perimeter/i.test(fp(o))) shell.push({ name: fp(o), mesh: m })
    })
    shell.forEach(({ name, mesh }) => {
      const mt = mesh.material as THREE.MeshStandardMaterial
      const g = mesh.geometry as THREE.BufferGeometry
      console.log('[DIAG][shell]', JSON.stringify({
        name: name.trim(), type: mt.type, uuid: mt.uuid,
        color: '#' + mt.color.getHexString(),
        emissive: mt.emissive ? '#' + mt.emissive.getHexString() : null,
        emissiveIntensity: (mt as any).emissiveIntensity,
        roughness: mt.roughness, metalness: mt.metalness, envMapIntensity: (mt as any).envMapIntensity,
        map: !!mt.map, lightMap: !!(mt as any).lightMap, aoMap: !!(mt as any).aoMap, normalMap: !!mt.normalMap,
        vertexColors: mt.vertexColors, side: mt.side,
        hasVertexColorAttr: !!g.attributes.color,
      }))
    })
    console.log('[DIAG] unique shell material UUIDs =', new Set(shell.map((s) => (s.mesh.material as any).uuid)).size, 'across', shell.length, 'meshes (1 = fully shared)')
    // Where is the real ceiling, actually? World bbox + a straight-down probe.
    const ceil = shell.find((s) => /Ceiling_Perimeter/i.test(s.name))
    if (ceil) {
      const bb = new THREE.Box3().setFromObject(ceil.mesh)
      console.log('[DIAG][ceiling-world-bbox] min', bb.min.toArray().map((v) => +v.toFixed(2)), 'max', bb.max.toArray().map((v) => +v.toFixed(2)))
      const down = new THREE.Raycaster(new THREE.Vector3(3.4, 1.3, -0.7), new THREE.Vector3(0, 1, 0))
      const up = down.intersectObject(ceil.mesh, true)
      console.log('[DIAG][ceiling up-ray from room center] hits=', up.length, up[0] ? 'at y=' + up[0].point.y.toFixed(2) : '')
      console.log('[DIAG][camera] pos', camera.position.toArray().map((v) => +v.toFixed(2)), 'fov', (camera as any).fov)
    }
    // (3) wallLightingDebug — unlit MeshBasic so lighting/shadows are removed
    if (DIAG === 'basic') {
      const basic = new THREE.MeshBasicMaterial({ color: 0xf3f0ea, side: THREE.DoubleSide })
      shell.forEach(({ mesh }) => { mesh.material = basic })
      console.log('[DIAG] applied unlit MeshBasicMaterial #f3f0ea to', shell.length, 'shell meshes')
    }
    // Raycast probe: given normalized device coords, report the exact hit object,
    // its world-space normal, and material — removes all ambiguity about which
    // mesh a screen pixel is actually showing.
    ;(window as any).__diagProbe = (ndcX: number, ndcY: number) => {
      const rc = new THREE.Raycaster()
      rc.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
      const hits = rc.intersectObject(r3fScene, true).filter((h) => {
        const m = h.object as THREE.Mesh
        return m.isMesh && (m.material as THREE.Material)?.visible !== false
      })
      if (!hits.length) return { hit: null }
      const h = hits[0]
      const m = h.object as THREE.Mesh
      let n = null as null | number[]
      if (h.face) {
        const wn = h.face.normal.clone().transformDirection(m.matrixWorld)
        n = [+wn.x.toFixed(2), +wn.y.toFixed(2), +wn.z.toFixed(2)]
      }
      let full = ''; let p: THREE.Object3D | null = m; while (p) { if (p.name) full = `${p.name}/${full}`; p = p.parent }
      const mt = m.material as THREE.MeshStandardMaterial
      return {
        name: full, dist: +h.distance.toFixed(2), worldNormal: n,
        matType: mt.type, matName: (mt as any).name || '', matColor: '#' + mt.color.getHexString(),
        matUuid: mt.uuid, metalness: mt.metalness, roughness: mt.roughness,
        map: !!mt.map, hasUV: !!(m.geometry as THREE.BufferGeometry)?.attributes?.uv,
        receiveShadow: m.receiveShadow, castShadow: m.castShadow,
      }
    }
    ;(window as any).__faucetInfo = () => {
      let f: THREE.Object3D | null = null
      scene.traverse((o) => { if (o.name === 'SwappedFaucet') f = o })
      if (!f) return null
      const box = new THREE.Box3().setFromObject(f)
      const c = box.getCenter(new THREE.Vector3()); const s = box.getSize(new THREE.Vector3())
      return { center: c.toArray(), size: s.toArray(), min: box.min.toArray(), max: box.max.toArray() }
    }
    ;(window as any).__setCam = (px: number, py: number, pz: number, tx: number, ty: number, tz: number) => {
      camera.position.set(px, py, pz); camera.updateProjectionMatrix()
      const c = controlsRef.current
      if (c && c.target) { c.target.set(tx, ty, tz); c.update() } else { camera.lookAt(tx, ty, tz) }
      return { pos: camera.position.toArray(), fov: (camera as any).fov }
    }
    // Report every wood (map'd MeshPhysical) mesh whose bbox reaches the floor, with
    // the grain axis baked into its UVs (V correlates with worldY ⇒ vertical grain).
    ;(window as any).__baseProbe = () => {
      const out: any[] = []
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        const mt = m.material as THREE.MeshPhysicalMaterial
        if (!mt || !(mt as any).map) return
        const bb = new THREE.Box3().setFromObject(m)
        if (bb.min.y > 0.25) return // only near-floor pieces
        const g = m.geometry as THREE.BufferGeometry
        const uv = g.attributes.uv, pos = g.attributes.position
        let vCorrY = 0, vCorrXZ = 0
        if (uv && pos) {
          const mw = m.matrixWorld
          const wp = new THREE.Vector3()
          let y0 = 0, v0 = 0
          for (let i = 0; i < Math.min(pos.count, 60); i++) {
            wp.fromBufferAttribute(pos, i).applyMatrix4(mw)
            const v = uv.getY(i), u = uv.getX(i)
            if (i > 0) { vCorrY += Math.abs(v - v0) * Math.abs(wp.y - y0); vCorrXZ += Math.abs(u - v0) }
            y0 = wp.y; v0 = v; void u
          }
        }
        let full = ''; let p: THREE.Object3D | null = o; while (p) { if (p.name) full = `${p.name}/${full}`; p = p.parent }
        out.push({ name: full.replace(/\/$/, '').split('/').slice(-2).join('/'), minY: +bb.min.y.toFixed(2), maxY: +bb.max.y.toFixed(2), isBASE: /BASE/i.test(full) })
      })
      return out
    }
    // Inspect a carcass geometry: indexed?, and the world-Y distribution of
    // VERTICAL-facing (|normal.y|<0.5) triangles → does a distinct low toe-kick
    // face exist that we can flip per-triangle?
    ;(window as any).__geomDbg = (re: string) => {
      const rx = new RegExp(re, 'i')
      const out: any[] = []
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh || !rx.test(m.name)) return
        const g = m.geometry as THREE.BufferGeometry
        const pos = g.attributes.position, nor = g.attributes.normal
        const idx = g.index
        const mw = m.matrixWorld
        const nmat = new THREE.Matrix3().getNormalMatrix(mw)
        const a = new THREE.Vector3(), bb = new THREE.Vector3(), c = new THREE.Vector3()
        const na = new THREE.Vector3()
        const triCount = idx ? idx.count / 3 : pos.count / 3
        const bins = { lowVert: 0, midVert: 0, highVert: 0, horizFace: 0 } // by centroid Y for vertical faces
        let lowMinY = 9, lowMaxY = -9
        for (let t = 0; t < triCount; t++) {
          const i0 = idx ? idx.getX(t * 3) : t * 3
          const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1
          const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2
          a.fromBufferAttribute(pos, i0).applyMatrix4(mw)
          bb.fromBufferAttribute(pos, i1).applyMatrix4(mw)
          c.fromBufferAttribute(pos, i2).applyMatrix4(mw)
          na.fromBufferAttribute(nor, i0).applyMatrix3(nmat).normalize()
          const cy = (a.y + bb.y + c.y) / 3
          if (Math.abs(na.y) >= 0.5) { bins.horizFace++; continue } // tops/bottoms
          if (cy < 0.14) { bins.lowVert++; lowMinY = Math.min(lowMinY, a.y, bb.y, c.y); lowMaxY = Math.max(lowMaxY, a.y, bb.y, c.y) }
          else if (cy < 0.8) bins.midVert++
          else bins.highVert++
        }
        out.push({ name: m.name, indexed: !!idx, verts: pos.count, tris: triCount, bins, lowFaceY: bins.lowVert ? [+lowMinY.toFixed(3), +lowMaxY.toFixed(3)] : null })
      })
      return out
    }
    ;(window as any).__diagDump = () => {
      const out: any[] = []
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        let full = ''; let p: THREE.Object3D | null = o; while (p) { if (p.name) full = `${p.name}/${full}`; p = p.parent }
        if (/countertop|island|waterfall|backsplash/i.test(full)) {
          const mt = m.material as THREE.MeshStandardMaterial
          out.push({ name: full.replace(/\/$/, '').split('/').slice(-2).join('/'), type: mt?.type, matName: (mt as any)?.name, col: mt?.color ? '#' + mt.color.getHexString() : null, map: !!mt?.map })
        }
      })
      return out
    }
    ;(window as any).__shadowInfo = () => {
      const sm = (gl as any).shadowMap
      const out: any = { renderer: { enabled: sm?.enabled, type: sm?.type, autoUpdate: sm?.autoUpdate, needsUpdate: sm?.needsUpdate }, lights: [] }
      r3fScene.traverse((o) => {
        const l = o as any
        if (l.isSpotLight || l.isDirectionalLight || l.isPointLight) {
          out.lights.push({ type: l.type, castShadow: l.castShadow, intensity: +l.intensity.toFixed(2), mapExists: !!l.shadow?.map, mapW: l.shadow?.map?.width ?? null, near: l.shadow?.camera?.near, far: l.shadow?.camera?.far, radius: l.shadow?.radius, blurSamples: l.shadow?.blurSamples })
        }
      })
      return out
    }
    ;(window as any).__winPos = () => {
      const w = scene.getObjectByName('Windows')
      if (!w) return { err: 'no Windows node' }
      const box = new THREE.Box3().setFromObject(w)
      const c = box.getCenter(new THREE.Vector3())
      return { center: [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)], min: [+box.min.x.toFixed(2), +box.min.y.toFixed(2), +box.min.z.toFixed(2)], max: [+box.max.x.toFixed(2), +box.max.y.toFixed(2), +box.max.z.toFixed(2)] }
    }
    ;(window as any).__findPos = (re: string) => {
      const rx = new RegExp(re, 'i')
      const hits: any[] = []
      scene.traverse((o) => {
        if (o.name && rx.test(o.name)) {
          const box = new THREE.Box3().setFromObject(o)
          const c = box.getCenter(new THREE.Vector3())
          hits.push({ name: o.name, center: [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)], minx: +box.min.x.toFixed(2), maxx: +box.max.x.toFixed(2), minz: +box.min.z.toFixed(2), maxz: +box.max.z.toFixed(2) })
        }
      })
      return hits.slice(0, 12)
    }
    ;(window as any).__floorDbg = () => {
      const out: any = { floorMeshes: [], reflectors: [] }
      r3fScene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        let full = ''; let p: THREE.Object3D | null = o; while (p) { if (p.name) full = `${p.name}/${full}`; p = p.parent }
        if (/Floor_Perimeter/i.test(full)) out.floorMeshes.push({ name: o.name, visible: o.visible, parentVisible: o.parent?.visible })
        const mt = m.material as any
        const t = Array.isArray(mt) ? mt[0]?.type : mt?.type
        if (t && /Reflector/i.test(t)) {
          const wp = new THREE.Vector3(); o.getWorldPosition(wp)
          out.reflectors.push({ name: o.name || '(jsx)', matType: t, visible: o.visible, worldPos: wp.toArray().map((v) => +v.toFixed(2)) })
        }
      })
      return out
    }
    console.log('[DIAG] __diagProbe(ndcX,ndcY) ready')
  }, [DIAG, scene, r3fScene, gl, camera])

  // ── Diagnostic 4: only a neutral white AmbientLight, everything else off ──
  if (DIAG === 'ambient') {
    return (
      <>
        <ambientLight intensity={1.4} color={'#ffffff'} />
        <WindowGarden scene={scene} />
        <primitive object={scene} />
        <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.1} />
      </>
    )
  }

  return (
    <>
      {/* Neutral IBL base (not in the controllable rig). The env-map HDR is an EXTERNAL asset
          and is nonessential to first render, so it's isolated: its own Suspense keeps it from
          blocking the model's first paint, and Optional swallows a load failure (renders nothing)
          so a stalled/failed CDN never turns into a whole-scene error. */}
      <Optional>
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.28} />
        </Suspense>
      </Optional>

      {/* ── Live, panel-controlled lighting rig: exposure, ambient, hemisphere,
          the shadow-casting Sun, accent key, fills, under-cab wash. ?studio=1. */}
      <LightingRig cfg={light} studio={studio} />

      {/* Decorative recessed can fixtures (folder 8) — visual only by default. */}
      <CanFixtureGrid cfg={cans} studio={studio} />

      {/* Flat garden view behind the window — NOT a light. MeshBasicMaterial so
          it never illuminates the room, casts no glow/bloom/beam. */}
      <WindowGarden scene={scene} />

      {/* Visible ceiling cap. The authored Ceiling_Perimeter mesh is mis-placed
          (a straight-up ray from the room center never hits it), so the top of the
          hero view was the R3F background, not geometry. This real, down-facing
          plane sits at the room-shell ceiling height (y≈2.585, just under the
          2.59 wall tops/crown so it meets them flush without z-fighting or poking
          through), spans the room footprint, and uses the SAME shared roomPaint —
          so the top of frame is now a lighting-responsive painted surface. */}
      <mesh
        name="Ceiling_Visible_Cap"
        position={[3.435, 2.585, -0.68]}
        rotation={[Math.PI / 2, 0, 0]}
        material={ceilingPaint}
        receiveShadow
      >
        <planeGeometry args={[7.15, 6.24]} />
      </mesh>

      {/* Fiddle leaf fig — floor plant, just right of the tall end cabinet by the
          fridge (cabinet ends at x≈4.42; back wall at z≈-3.66). */}
      <FiddleLeafFig x={4.95} z={-3.15} />

      {/* Fake floor contact shadows — purely cosmetic dark decals (NOT a lighting
          effect). They ground the island, cabinet runs and plant: dark at the base,
          soft penumbra outward, footprint-shaped, all offset toward +x (away from the
          window-side key light) so they read like real cast shadows. No light added. */}
      <FloorContactShadows />

      <primitive object={scene} />

      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.1} />
    </>
  )
}

/* ── Exterior garden view (flat background plane, NOT a light) ─────────────── */

// Places a flat textured plane just outside the real window opening. Uses the
// window group's runtime bounding box so it tracks the actual model — no guessed
// coordinates. MeshBasicMaterial = unlit: it emits nothing into the room.
function WindowGarden({ scene }: { scene: THREE.Object3D }) {
  const tex = useTexture('/garden.jpg')

  const place = useMemo(() => {
    const win = scene.getObjectByName('Windows')
    if (!win) return null
    const box = new Box3().setFromObject(win)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    // Sink wall is constant-X; outside the room is smaller X. Sit 5 cm beyond
    // the outermost window face so frame/glass/mullions stay in front.
    return {
      pos: [box.min.x - 0.05, center.y, center.z] as [number, number, number],
      w: size.z * 1.04, // window width runs along world Z
      h: size.y * 1.04,
    }
  }, [scene])

  // Build the window texture from the loaded image, adjusting ONLY this photo
  // (not the scene exposure): drawn through a canvas brightness/saturate filter
  // so the exterior reads natural instead of blown-out. MeshBasic has no
  // saturation control, hence the canvas. Also applies the "cover by height"
  // crop (full image height, sides cropped to the window aspect, centered) so
  // the photo is never squished/stretched.
  const gardenTex = useMemo(() => {
    const img = tex.image as HTMLImageElement | undefined
    if (!img?.width || !img?.height) return tex
    const W = 1600
    const H = Math.round((W * img.height) / img.width)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return tex
    ctx.filter = 'brightness(0.86) saturate(0.82)' // lower exposure + gentle desaturate
    ctx.drawImage(img, 0, 0, W, H)
    const ct = new THREE.CanvasTexture(canvas)
    ct.colorSpace = THREE.SRGBColorSpace
    ct.wrapS = THREE.ClampToEdgeWrapping
    ct.wrapT = THREE.ClampToEdgeWrapping
    if (place) {
      const imgAspect = W / H
      const planeAspect = place.w / place.h
      const repeatX = Math.min(1, planeAspect / imgAspect)
      ct.repeat.set(repeatX, 1)
      ct.offset.set((1 - repeatX) / 2, 0)
    }
    ct.needsUpdate = true
    return ct
  }, [tex, place])

  useEffect(() => () => { if (gardenTex !== tex) gardenTex.dispose() }, [gardenTex, tex])

  if (!place) return null
  return (
    <mesh name="Window_Exterior_Garden_View" position={place.pos} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[place.w, place.h]} />
      <meshBasicMaterial map={gardenTex} side={THREE.DoubleSide} toneMapped transparent opacity={0.85} />
    </mesh>
  )
}

/* ── Fiddle leaf fig (floor plant) ────────────────────────────────────────── */
const FIDDLE_URL = '/Fiddle_leaf_fig.glb'
const FIDDLE_TARGET_H = 1.65 // a real fiddle leaf fig is ~1.5–1.8 m tall
// Auto-fit: scale the model to a realistic height, recenter on (x,z), and sit its
// base on the floor (y=0) — robust to whatever units/origin the GLB ships with.
function FiddleLeafFig({ x, z }: { x: number; z: number }) {
  const { scene } = useGLTF(FIDDLE_URL)
  const obj = useMemo(() => {
    const o = scene.clone(true)
    const b0 = new THREE.Box3().setFromObject(o)
    const size = b0.getSize(new THREE.Vector3())
    const s = FIDDLE_TARGET_H / (size.y || 1)
    o.scale.setScalar(s)
    o.updateMatrixWorld(true)
    const b1 = new THREE.Box3().setFromObject(o)
    const c1 = b1.getCenter(new THREE.Vector3())
    // center X/Z at the group origin, drop base to y=0
    o.position.set(-c1.x, -b1.min.y, -c1.z)
    o.traverse((m) => {
      const mesh = m as THREE.Mesh
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true }
    })
    return o
  }, [scene])
  return (
    <group position={[x, 0, z]}>
      <primitive object={obj} />
    </group>
  )
}

/* ── Fake floor contact shadows (cosmetic decals, NOT a lighting effect) ───── */
// A footprint-shaped decal: SOLID dark interior that fills the object's whole footprint
// (and slightly past its base, so the contact line is dark — no floating gap), feathering
// outward into a soft penumbra. Built per object at its real footprint proportions so the
// feather is even all the way around (not a stretched blob).
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
// fw×fh = footprint (m); fm = feather margin (m) of soft penumbra outside the footprint.
// Boost the contrast of a texture (the floor grain) a little so it reads with more
// depth. Redraws the decoded image through a canvas `contrast()` filter, preserving all
// the original sampling params. Cached per (texture, amount). Returns src if undecoded.
const _contrastCache = new Map<string, THREE.Texture>()
function makeContrastTexture(src: THREE.Texture, k: number): THREE.Texture {
  const img = src.image as (CanvasImageSource & { width?: number; height?: number }) | undefined
  if (!img || !img.width) return src
  const key = src.uuid + ':' + k
  const hit = _contrastCache.get(key)
  if (hit) return hit
  const w = img.width as number
  const h = img.height as number
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')!
  ctx.filter = `contrast(${k})`
  ctx.drawImage(img, 0, 0, w, h)
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = src.wrapS
  t.wrapT = src.wrapT
  t.repeat.copy(src.repeat)
  t.offset.copy(src.offset)
  t.center.copy(src.center)
  t.rotation = src.rotation
  t.colorSpace = src.colorSpace
  t.anisotropy = src.anisotropy
  t.flipY = src.flipY
  t.needsUpdate = true
  _contrastCache.set(key, t)
  return t
}

// For MULTIPLY blending: the texture is a GREYSCALE multiplier — white (=1) outside the
// shadow leaves the floor untouched, a darker grey in the core multiplies the floor's
// colour down (so the wood colour/grain shows THROUGH the shadow, not a flat grey wash).
// `core` is the darkest multiplier (0=black, 1=none); lower = darker shadow.
function makeBoxShadowTexture(fw: number, fh: number, fm: number, core: number): THREE.Texture {
  const PXM = 96 // canvas px per metre
  const cw = Math.round((fw + 2 * fm) * PXM)
  const ch = Math.round((fh + 2 * fm) * PXM)
  const cv = document.createElement('canvas')
  cv.width = cw
  cv.height = ch
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = 'white' // background multiplier = 1 → no change outside the shadow
  ctx.fillRect(0, 0, cw, ch)
  const blur = fm * PXM * 1.15 // wide feather → soft penumbra (no hard edge)
  ctx.filter = `blur(${blur}px)`
  const g = Math.round(Math.max(0, Math.min(1, core)) * 255)
  ctx.fillStyle = `rgb(${g},${g},${g})` // shadow core multiplier
  // Solid footprint, expanded a hair so the base contact stays grounded after blur.
  const ov = Math.min(fw, fh) * 0.05
  roundRectPath(ctx, (fm - ov) * PXM, (fm - ov) * PXM, (fw + 2 * ov) * PXM, (fh + 2 * ov) * PXM, Math.min(fw, fh) * PXM * 0.3)
  ctx.fill()
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Each shadow sized to a real footprint (cx,cz centre; fw×fh footprint; fm feather).
// `core` = darkest multiply factor (lower = darker; the floor colour shows through).
const FLOOR_SHADOWS = [
  // Island: follow the CABINET BASE that touches the floor (x1.7–4.44, z-1.82–-1.17),
  // NOT the countertop overhang — otherwise the shadow sticks out past the island.
  { cx: 3.07, cz: -1.5, fw: 2.74, fh: 0.65, fm: 0.4, core: 0.44 },
  { cx: 4.98, cz: -3.12, fw: 0.82, fh: 0.76, fm: 0.42, core: 0.6 }, // fiddle-leaf plant (≈4.95,-3.15)
  { cx: 0.78, cz: -2.13, fw: 0.95, fh: 3.05, fm: 0.34, core: 0.74 }, // sink-wall lower run (left wall)
  { cx: 2.66, cz: -3.18, fw: 3.55, fh: 0.95, fm: 0.34, core: 0.74 }, // range-wall run + fridge (back wall)
]
function FloorContactShadows() {
  const items = useMemo(
    () => FLOOR_SHADOWS.map((s) => ({ ...s, tex: makeBoxShadowTexture(s.fw, s.fh, s.fm, s.core) })),
    [],
  )
  return (
    <group>
      {items.map((s, i) => (
        <mesh key={i} position={[s.cx, 0, s.cz]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[s.fw + 2 * s.fm, s.fh + 2 * s.fm]} />
          <meshBasicMaterial
            map={s.tex}
            transparent
            blending={THREE.MultiplyBlending}
            depthWrite={false}
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Recessed can fixtures ────────────────────────────────────────────────── */
// The fixture GLB is ~0.20 m wide × 0.035 m deep, already Y-up, already in meters.
const CAN_FIXTURE_URL = '/6_Can_Light.glb'

// Fixture is flipped 180° about X so the open trim faces down (-Y).
const CAN_FLIP: [number, number, number] = [Math.PI, 0, 0]
// The fixture's inner lens uses the glTF material literally named "Material"
// (pale near-white); the trim/housing use the "*face_material"/"Caulk" mats.
const CAN_LENS_MATERIAL = /^material$/i

// Decorative recessed-can fixtures, fully driven by the live CanConfig (folder 8).
// Cans are visual-only by default: downlight contribution is 0 and they cast no
// shadows, so they never stripe the cabinets or light the scene.
function CanFixtureGrid({ cfg, studio }: { cfg: CanConfig; studio: boolean }) {
  const { scene: can } = useGLTF(CAN_FIXTURE_URL)
  // Trim color/brightness + lens glow are live-tunable. (metalness→0 so the white
  // trim isn't a dark metal hole — a SketchUp-export default.) Fixture mats only.
  useEffect(() => {
    can.traverse((o) => {
      const m = (o as THREE.Mesh).material
      const mats = Array.isArray(m) ? m : m ? [m] : []
      mats.forEach((mat) => {
        const sm = mat as THREE.MeshStandardMaterial
        if (!sm || !('metalness' in sm)) return
        sm.metalness = 0
        sm.roughness = Math.min(sm.roughness ?? 1, 0.8)
        if (CAN_LENS_MATERIAL.test(sm.name)) {
          sm.emissive = new THREE.Color(cfg.glowColor)
          sm.emissiveIntensity = cfg.glowIntensity
          sm.toneMapped = true
        } else {
          // Trim sits up at the ceiling where little light reaches it, so a plain
          // white albedo renders near-black. Drive brightness as a self-lit
          // (emissive) trim so turning it up visibly brightens the ring.
          sm.color = new THREE.Color(cfg.trimColor)
          sm.emissive = new THREE.Color(cfg.trimColor)
          sm.emissiveIntensity = cfg.trimBrightness * 0.6
          sm.toneMapped = true
        }
        sm.needsUpdate = true
      })
    })
  }, [can, cfg.glowColor, cfg.glowIntensity, cfg.trimColor, cfg.trimBrightness])
  // Recenter the off-origin fixture to its bbox center (rotation-invariant), then
  // place the group so the can's TOP sits flush at the ceiling Y.
  const { center, half } = useMemo(() => {
    const b = new THREE.Box3().setFromObject(can)
    const c = b.getCenter(new THREE.Vector3())
    return { center: [-c.x, -c.y, -c.z] as [number, number, number], half: (b.max.y - b.min.y) / 2 }
  }, [can])
  if (!cfg.visible) return null
  return (
    <>
      {cfg.positions.map(([x, z], i) => (
        <group key={`canfix-${i}`}>
          <group position={[x, cfg.y - half, z]} rotation={CAN_FLIP}>
            <Clone object={can} position={center} castShadow={false} receiveShadow={false} />
          </group>
          <CanSpot x={x} y={cfg.y} z={z} intensity={cfg.downlight} helper={studio && cfg.helper} />
        </group>
      ))}
    </>
  )
}

// Recessed-can downlight, aimed straight down — a REAL light that casts shadows
// (each with its own shadow camera scoped to the room height). These are the
// primary lights, so the island/cabinets cast real shadows onto counters/floor.
function CanSpot({ x, y, z, intensity, helper }: { x: number; y: number; z: number; intensity: number; helper: boolean }) {
  const ref = useRef<THREE.SpotLight>(null!)
  const tgt = useRef<THREE.Object3D>(null!)
  useEffect(() => {
    ref.current.target = tgt.current
  }, [])
  useHelper(helper ? ref : null, THREE.SpotLightHelper)
  // Cans are soft fill only — they do NOT cast (the fixed SunLight casts shadows,
  // so we never stack many shadow maps, which is unreliable across GPUs).
  return (
    <>
      <spotLight ref={ref} position={[x, y - 0.04, z]} color={'#ffefe3'} intensity={intensity} angle={0.7} penumbra={0.55} distance={7} decay={1.0} castShadow={false} />
      <object3D ref={tgt} position={[x, 0, z]} />
    </>
  )
}


// Asset preloading is owned by preloadAssets.ts (byte-tracked into THREE.Cache) so the
// loader can map to the real download and nothing is fetched twice; useGLTF then reads the
// GLBs straight from cache. (Previously these module-level useGLTF.preload calls warmed the
// cache but bypassed the byte tracker.)
