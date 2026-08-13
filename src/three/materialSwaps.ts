/*
 * Reversible material swaps applied to targeted node sets.
 *
 * Strategy: the first time we touch a mesh we stash its authored material in
 * userData. Applying a finish sets a shared MeshStandardMaterial; selecting
 * "original" restores the stashed material. This keeps swaps cheap and fully
 * reversible without cloning the 18 MB scene.
 */
import * as THREE from 'three'
import type { Option } from '../types'

const ORIG_KEY = '__envisionOrigMaterial'
const NORMALS_FIXED_KEY = '__envisionNormalsFixed'

/**
 * Some cabinet meshes are mirrored SketchUp component instances whose normals
 * were exported pointing inward. Those faces then miss the directional lights
 * and render noticeably darker than identical neighbours. Recomputing vertex
 * normals from the (correct) face winding fixes the shading. Done once per
 * geometry, guarded by a flag so repeated finish swaps don't repeat the work.
 */
function ensureOutwardNormals(mesh: THREE.Mesh): void {
  const geom = mesh.geometry
  if (!geom) return
  const gud = geom.userData as Record<string, unknown>
  if (gud[NORMALS_FIXED_KEY]) return
  geom.computeVertexNormals()
  gud[NORMALS_FIXED_KEY] = true
}

// ── Real wood veneer finishes (built from the image textures in /public/textures;
// EXR normal/roughness converted to PNG, source grain rotated so it runs vertically).
// FIRST PASS: base color (diffuse) only — normal/roughness/AO come back subtly later;
// displacement is never used. Each finish points at its own diffuse jpg; lighter/
// darker variants get their OWN baked diffuse (multiply-tint only darkens, so a
// lighter "white oak" needs a brighter map; a smokier walnut gets a desaturated map).
interface WoodCfg {
  diff: string
  color?: string // optional multiply tint (only to darken; default white)
  tone: string // the diffuse's mean color = this wood's overall tone (used to recolor the floor)
  repeat?: number // optional texture-repeat multiplier (>1 shrinks the grain pattern; this
  // source has a coarser native grain than oak/walnut, so maple scales its pattern down)
}
const WOOD_FINISHES: Record<string, WoodCfg> = {
  // Softened diffuse: grain contrast reduced ~30%, orange/yellow cast trimmed
  // (desaturated) so the oak reads as muted honey-beige rather than synthetic orange.
  // `tone` is the measured mean of each diffuse — the canonical wood color, reused to
  // recolor the floor so it matches the selected cabinet wood (color only).
  'natural-oak': { diff: '/textures/oak/oak_diff_soft_2k.jpg', tone: '#99856f' },
  'white-oak': { diff: '/textures/oak/oak_diff_white_soft_2k.jpg', tone: '#a89888' },
  'warm-walnut': { diff: '/textures/walnut/walnut_diff_soft_2k.jpg', tone: '#654337' },
  'smoked-walnut': { diff: '/textures/walnut/walnut_diff_smoked_soft_2k.jpg', tone: '#50403a' },
  'warm-maple': { diff: '/textures/maple/maple_diff_soft_2k.jpg', tone: '#6b5446', repeat: 1.5 },
}

/** The canonical tone (mean diffuse color) for a wood finish id, or null if not wood. */
export function woodFinishTone(id: string): string | null {
  return WOOD_FINISHES[id]?.tone ?? null
}
const woodDiffCache: Record<string, THREE.Texture> = {}
function loadWoodDiff(url: string): THREE.Texture {
  if (woodDiffCache[url]) return woodDiffCache[url]
  const t = new THREE.TextureLoader().load(url)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  woodDiffCache[url] = t
  return t
}

export function isWoodFinish(opt: Option): boolean {
  return !!WOOD_FINISHES[opt.id]
}

// Per-panel color variation — VERY subtle multiply tints. Kept close to white so the
// cabinetry reads as an even color throughout (user wants even color) with only a
// whisper of warm/cool veneer difference, not visible patchwork. The grain pattern still
// varies per panel (offset/scale/mirror in projectBoxUVs) so it doesn't read as one
// printed texture even though the color is near-uniform.
const WOOD_PANEL_TINTS = [
  '#ffffff', // neutral
  '#fefcf9', // barely warm
  '#fafbfc', // barely cool
  '#fcfbf9', // barely muted
]
const _tintC = new THREE.Color()
const fract = (n: number) => n - Math.floor(n)
function woodPanelTint(mesh: THREE.Mesh): THREE.Color {
  mesh.getWorldPosition(_wp)
  const bucket = Math.floor(fract(Math.sin(_wp.x * 51.31 + _wp.y * 7.97 + _wp.z * 23.17) * 9137.21) * 4) % 4
  // tiny continuous brightness jitter so two same-bucket panels never match exactly
  const j = fract(Math.sin(_wp.x * 12.11 + _wp.y * 88.3 + _wp.z * 3.7) * 1733.7)
  _tintC.set(WOOD_PANEL_TINTS[bucket]).multiplyScalar(0.995 + j * 0.01) // ×0.995..1.005 (near-uniform)
  return _tintC
}

// Optional per-mesh tint gives each panel its own subtle color; called once per mesh
// in applyFinish (cheap — the diffuse texture itself is shared/cached).
function makeWoodMaterial(opt: Option, mesh?: THREE.Mesh): THREE.MeshPhysicalMaterial {
  const cfg = WOOD_FINISHES[opt.id]
  const color = new THREE.Color(cfg.color ?? '#ffffff')
  if (mesh) color.multiply(woodPanelTint(mesh))
  const diff = loadWoodDiff(cfg.diff)
  // Shrink this wood's grain pattern (repeat>1) — safe because the diffuse is cached per
  // URL and only this finish uses it. RepeatWrapping is already set in loadWoodDiff.
  if (cfg.repeat) diff.repeat.set(cfg.repeat, cfg.repeat)
  return new THREE.MeshPhysicalMaterial({
    map: diff, // diffuse carries the color
    color,
    roughness: 0.5, // smooth finished veneer (no bump/normal — stays satin, not raw lumber)
    metalness: 0,
    clearcoat: 0.14, // soft satin clear-coat: catches light gently, not glossy/plastic
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.12,
  })
}

// Cabinet meshes were painted (flat color), so they carry no usable UVs — a texture
// would sample a single texel and read flat. Generate box-projected UVs (world-scaled)
// so the veneer maps onto every face. Broad, cabinet-scale grain (≈OAK_UV_TILE m of
// veneer per tile — big enough to read as real veneer, not tiny ribs). The texture's
// grain runs along V; doors/slabs keep grain VERTICAL, drawer fronts get it
// HORIZONTAL. Each panel is offset by a per-mesh hash so the same region of the
// photo isn't obviously repeated. Guarded so it runs once per geometry.
const OAK_UV_TILE = 2.2 // metres of veneer per tile (WORLD space) → large, bold cabinet grain
// Cross-grain widener: scale the across-grain axis (texture-U) down so the grain
// spreads wider/looser without changing the along-grain (vertical) scale. 0.75 ≈ +33%
// wider cathedrals. Applied AFTER the drawer U/V swap, so it always hits cross-grain.
const OAK_CROSS = 0.75
// World height (m) below which a vertical cabinet face is treated as the baseboard /
// toe-kick → horizontal grain. Carcasses expose a kick face spanning y≈0–0.14; 0.12
// sits between the kick triangles' centroids (≤~0.10) and the front faces (≥~0.14).
const BASEBOARD_Y = 0.12
const OAK_UV_KEY = '__envisionOakUV'
const _wp = new THREE.Vector3()
const _wn = new THREE.Vector3()
const _nmat = new THREE.Matrix3()
function projectBoxUVs(mesh: THREE.Mesh): void {
  // Guard on the MESH (not the geometry): instanced cabinets share one BufferGeometry,
  // so a geometry-level guard would let the first instance bake its UVs and every other
  // instance reuse them → neighbouring doors with the IDENTICAL grain. Clone the geometry
  // per mesh so each instance's UVs come from its OWN world position (unique offset/
  // mirror/scale), then this mesh never re-projects.
  const mud = mesh.userData as Record<string, unknown>
  if (mud[OAK_UV_KEY]) return
  if (!mesh.geometry || !mesh.geometry.attributes.position) return
  const geom = (mesh.geometry = mesh.geometry.clone())
  if (!geom.attributes.normal) geom.computeVertexNormals()
  // Project in WORLD space — the door meshes carry a scale, so local coords are not
  // in metres (that was the ribbing bug). World coords give true cabinet-scale grain.
  mesh.updateWorldMatrix(true, false)
  const mw = mesh.matrixWorld
  _nmat.getNormalMatrix(mw)
  // Grain runs VERTICAL on every visible front (doors, drawer fronts, tall fridge/
  // pantry panels, island faces, exposed cabinet sides) — architectural/intentional.
  // EXCEPTION: the BASEBOARD / toe-kick strip. Every cabinet carcass is built with a
  // distinct vertical-facing face spanning y≈0–0.14 at the floor (the recessed kick);
  // real cabinetry runs that base trim with HORIZONTAL grain. We detect it per-TRIANGLE
  // by centroid height (not per-mesh, so a tall cabinet's kick flips while its sides stay
  // vertical; not per-vertex, so the kick's top edge — which shares a Y with the front
  // face above — doesn't tear). Per-panel offset + a small per-panel scale jitter so
  // identical/instanced panels don't line up = breaks the repeated-wallpaper look.
  mesh.getWorldPosition(_wp)
  const frac = (n: number) => n - Math.floor(n)
  const offU = frac(Math.sin(_wp.x * 12.9898 + _wp.y * 4.1414 + _wp.z * 78.233) * 43758.5453)
  const offV = frac(Math.sin(_wp.x * 39.346 + _wp.y * 11.135 + _wp.z * 7.71) * 24634.6345)
  // ±~22% scale variation per panel so grain size visibly differs panel to panel.
  const scaleJit = 0.82 + frac(Math.sin(_wp.x * 5.7 + _wp.y * 2.3 + _wp.z * 9.1) * 5371.1) * 0.36
  // Per-panel mirror (cross-grain) + vertical flip (along-grain) → cathedrals point
  // up on some panels, down on others, mirrored left/right on others. With the per-
  // instance offset this makes every neighbour visibly different (grain stays vertical).
  const mirrorU = frac(Math.sin(_wp.x * 27.13 + _wp.y * 61.7 + _wp.z * 14.9) * 9281.3) < 0.5 ? -1 : 1
  const flipV = frac(Math.sin(_wp.x * 8.91 + _wp.y * 33.7 + _wp.z * 52.1) * 6571.7) < 0.5 ? -1 : 1
  // Tiny per-panel grain-angle jitter (±~3°): kills the perfectly-aligned, machine-
  // stamped look without making the cabinetry feel chaotic. Stays read-as-vertical.
  const _ang = (frac(Math.sin(_wp.x * 19.3 + _wp.y * 7.1 + _wp.z * 41.7) * 3187.4) - 0.5) * 0.11
  const cosA = Math.cos(_ang), sinA = Math.sin(_ang)
  const pos = geom.attributes.position
  const nor = geom.attributes.normal
  const idx = geom.index
  const uv = new Float32Array(pos.count * 2)
  const s = scaleJit / OAK_UV_TILE
  // Write one vertex's UV; `horizontal` swaps the grain axis (used for the toe-kick).
  const writeVert = (i: number, horizontal: boolean) => {
    _wp.fromBufferAttribute(pos, i).applyMatrix4(mw) // world position
    _wn.fromBufferAttribute(nor, i).applyMatrix3(_nmat) // world normal
    const px = _wp.x, py = _wp.y, pz = _wp.z
    const ax = Math.abs(_wn.x), ay = Math.abs(_wn.y), az = Math.abs(_wn.z)
    let u: number, v: number
    if (ax >= ay && ax >= az) { u = pz; v = py } // X-facing front → V=y (vertical grain)
    else if (az >= ax && az >= ay) { u = px; v = py } // Z-facing front → V=y (vertical grain)
    else { u = px; v = pz } // Y-facing (tops/bottoms)
    if (horizontal) { const t = u; u = v; v = t } // rotate grain 90° → horizontal
    // scale + cross-grain widener, then per-panel mirror / vertical flip / angle jitter
    const tu = u * s * OAK_CROSS * mirrorU
    const tv = v * s * flipV
    const ru = tu * cosA - tv * sinA
    const rv = tu * sinA + tv * cosA
    uv[i * 2] = ru + offU
    uv[i * 2 + 1] = rv + offV
  }
  const triCount = idx ? idx.count / 3 : pos.count / 3
  for (let t = 0; t < triCount; t++) {
    const i0 = idx ? idx.getX(t * 3) : t * 3
    const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1
    const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2
    // Triangle centroid height (world). Below the kick threshold AND on a vertical-ish
    // face → baseboard → horizontal grain. Floor-facing undersides are never flipped.
    const cy = (
      _wp.fromBufferAttribute(pos, i0).applyMatrix4(mw).y +
      _wp.fromBufferAttribute(pos, i1).applyMatrix4(mw).y +
      _wp.fromBufferAttribute(pos, i2).applyMatrix4(mw).y
    ) / 3
    _wn.fromBufferAttribute(nor, i0).applyMatrix3(_nmat)
    const vertical = Math.abs(_wn.y) < 0.5 * _wn.length()
    const horizontal = vertical && cy < BASEBOARD_Y
    writeVert(i0, horizontal); writeVert(i1, horizontal); writeVert(i2, horizontal)
  }
  const attr = new THREE.BufferAttribute(uv, 2)
  geom.setAttribute('uv', attr)
  geom.setAttribute('uv2', attr) // for aoMap (later pass)
  mud[OAK_UV_KEY] = true
}

export function makeFinishMaterial(opt: Option): THREE.MeshPhysicalMaterial {
  // Oak finishes use the real veneer texture maps.
  if (isWoodFinish(opt)) return makeWoodMaterial(opt)
  // Painted cabinetry reads as satin / semi-matte — enough sheen to model the
  // panels, but matte enough to keep groove/panel detail and avoid blowout.
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(opt.color ?? opt.swatch ?? '#ffffff'),
    roughness: opt.roughness ?? 0.52,
    metalness: opt.metalness ?? 0.0,
    // Light satin sheen for dimension. envMap kept very low so the soft area key
    // (not the environment sky) does the modeling — avoids the door-face glow.
    clearcoat: opt.metalness ? 0 : 0.1,
    clearcoatRoughness: 0.58,
    envMapIntensity: 0.08,
  })
}

function ancestorMatches(obj: THREE.Object3D, re: RegExp): boolean {
  let p: THREE.Object3D | null = obj
  while (p) {
    if (p.name && re.test(p.name)) return true
    p = p.parent
  }
  return false
}

function eachMesh(
  nodes: THREE.Object3D[],
  fn: (mesh: THREE.Mesh) => void,
  skip?: RegExp,
  include?: RegExp,
): void {
  for (const node of nodes) {
    node.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return
      if (include && !ancestorMatches(mesh, include)) return
      if (skip && ancestorMatches(mesh, skip)) return
      fn(mesh)
    })
  }
}

/**
 * Apply (or clear) a finish across the given target nodes.
 * @param nodes   target nodes to traverse (pass [scene] with `include` to sweep all)
 * @param finish  Option to apply, or null / id==='original' to restore authored material
 * @param skip    optional RegExp — skip any mesh whose name (or an ancestor's) matches
 *                (e.g. /pull|hardware/i so hardware inside a cabinet keeps its material)
 * @param include optional RegExp — only paint meshes whose name (or an ancestor's)
 *                matches (e.g. /cabinet/i to repaint all cabinetry regardless of
 *                target-set membership)
 */
export function applyFinish(
  nodes: THREE.Object3D[],
  finish: Option | null,
  skip?: RegExp,
  include?: RegExp,
): void {
  const useOriginal = !finish || finish.id === 'original'
  const wood = !useOriginal && isWoodFinish(finish as Option)
  // Painted finishes share one material; wood gets a per-mesh instance so each panel
  // can carry its own subtle color variation (see makeWoodMaterial / woodPanelTint).
  const sharedMat = !useOriginal && !wood ? makeFinishMaterial(finish as Option) : null
  eachMesh(
    nodes,
    (mesh) => {
      ensureOutwardNormals(mesh)
      // Wood needs real UVs (cabinets were painted → no usable UVs): box-project them
      // so the veneer maps with vertical grain, and provide uv2 for the aoMap.
      if (wood) projectBoxUVs(mesh)
      const ud = mesh.userData as Record<string, unknown>
      if (ud[ORIG_KEY] === undefined) ud[ORIG_KEY] = mesh.material
      if (useOriginal) mesh.material = ud[ORIG_KEY] as THREE.Material
      else if (wood) mesh.material = makeWoodMaterial(finish as Option, mesh)
      else mesh.material = sharedMat as THREE.Material
    },
    skip,
    include,
  )
}
