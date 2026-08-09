/*
 * Cabinet-door swapping. The kitchen GLB has cabinet door PANELS in varied orientations
 * (thin axis = the face normal; the other two = the door face: a tall height + a width).
 * A door option is a separate door GLB; we replace every cabinet door with an instance of
 * the chosen door, fit to each opening (non-uniform: width→width, height→height, thin→thin).
 *
 * "door" also appears on fridge door-panels, cabinet boxes ("…WithShelves") and nested
 * pulls — those are filtered out so only real cabinet door panels are swapped.
 */
import * as THREE from 'three'

// Exclude appliances/fridge door-panels, hardware, drawers. NOT "shelf/shelves" or "panel"
// generally — some cabinet doors are nested under "…WithShelves" cabinets, and the cabinet
// BOX itself is excluded by the thin-panel size check below, not by name.
const NON_DOOR_RE = /refrigerator|fridge|appliance|pull|knob|handle|hinge|drawer|doorpanel/i

const unit = (i: number) => new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0)

// thin = smallest axis (face normal); height = the LONGER of the two remaining (doors are
// taller than wide, whether authored Y-up or Z-up); width = the other.
function doorAxes(size: THREE.Vector3) {
  const s = [size.x, size.y, size.z]
  const thinAxis = s.indexOf(Math.min(...s))
  const rest = [0, 1, 2].filter((a) => a !== thinAxis)
  const heightAxis = s[rest[0]] >= s[rest[1]] ? rest[0] : rest[1]
  const widthAxis = rest.find((a) => a !== heightAxis)!
  return { thinAxis, heightAxis, widthAxis, width: s[widthAxis], height: s[heightAxis], thin: s[thinAxis] }
}

export interface DoorSource {
  template: THREE.Object3D
  center: THREE.Vector3
  widthAxis: number
  heightAxis: number
  thinAxis: number
  width: number
  height: number
  thin: number
}

export function analyzeDoorSource(gltfScene: THREE.Object3D): DoorSource {
  const template = gltfScene.clone(true)
  template.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(template)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  return { template, center, ...doorAxes(size) }
}

export interface DoorTarget extends Omit<DoorSource, 'template'> {
  mesh: THREE.Mesh
  isUpper: boolean // upper-cabinet door (vs lower) — used by the glass-upper-doors option
}

export function analyzeDoorTargets(scene: THREE.Object3D): DoorTarget[] {
  const out: DoorTarget[] = []
  scene.updateWorldMatrix(true, true)
  scene.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    let p: THREE.Object3D | null = o
    let name = ''
    while (p) { name = `${p.name || ''} ${name}`; p = p.parent }
    if (!/door/i.test(name) || NON_DOOR_RE.test(name)) return
    const box = new THREE.Box3().setFromObject(m)
    const size = box.getSize(new THREE.Vector3())
    // Real door panels are thin (one dimension much smaller than the others).
    const dims = [size.x, size.y, size.z].sort((a, b) => a - b)
    if (dims[0] > 0.06 || dims[2] < 0.2) return // not a thin door-sized panel
    const center = box.getCenter(new THREE.Vector3())
    out.push({ mesh: m, center, isUpper: /upper/i.test(name), ...doorAxes(size) })
  })
  return out
}

/**
 * Build one door instance: clone the source, center it, then map its (width, height, thin)
 * axes onto the target's with a NON-uniform scale so it fills the opening.
 */
export function makeDoorInstance(src: DoorSource, tgt: DoorTarget, material: THREE.Material | null, flip = false, flipFace = false): THREE.Object3D {
  const root = src.template.clone(true)
  root.traverse((o) => {
    const mm = o as THREE.Mesh
    if (!mm.isMesh) return
    if (material) mm.material = material // null → keep the GLB's own materials (e.g. glass)
    mm.castShadow = true
    mm.receiveShadow = true
  })
  root.position.copy(src.center).multiplyScalar(-1) // center geometry at origin

  // Columns ordered by SOURCE local axis (x,y,z): each maps to the matching target axis
  // direction, scaled so that source dimension → target dimension.
  // flip = 180° in-plane (about the face normal): negate the width + height directions, so
  // an upside-down source ends up right-side up while still facing out of the cabinet.
  // flipFace = 180° about the HEIGHT axis (negate width + normal): swaps which face points
  // OUT of the cabinet, for a door whose molded face would otherwise sit against the box.
  const f = flip ? -1 : 1
  const ff = flipFace ? -1 : 1
  const role: Record<number, { dir: THREE.Vector3; scale: number }> = {
    [src.widthAxis]: { dir: unit(tgt.widthAxis).multiplyScalar(f * ff), scale: tgt.width / (src.width || 1) },
    [src.heightAxis]: { dir: unit(tgt.heightAxis).multiplyScalar(f), scale: tgt.height / (src.height || 1) },
    [src.thinAxis]: { dir: unit(tgt.thinAxis).multiplyScalar(ff), scale: tgt.thin / (src.thin || 1) },
  }
  const col = (a: number) => role[a].dir.clone().multiplyScalar(role[a].scale)
  const m = new THREE.Matrix4().makeBasis(col(0), col(1), col(2))
  m.setPosition(tgt.center)

  const outer = new THREE.Group()
  outer.name = 'SwappedDoor'
  outer.add(root)
  outer.matrixAutoUpdate = false
  outer.matrix.copy(m)
  outer.updateMatrixWorld(true)
  return outer
}
