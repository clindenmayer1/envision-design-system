/*
 * Cabinet-pull swapping. The kitchen GLB has ~32 individual "*Pull*" bar meshes, each
 * axis-aligned but in varying orientations (vertical / horizontal / front-to-back) and two
 * lengths. A hardware option is a separate pull GLB; we replace every original pull with an
 * instance of the chosen pull, matched to each original's position, orientation and length.
 *
 * Some pull exports carry stray content (e.g. an embedded "Sumele" mannequin in Bennett);
 * those meshes are filtered out by material/name before use.
 */
import * as THREE from 'three'

const NON_PULL_RE = /sumele|mixamo|avatar|body|hair|skin|dress|shoe|jewelry|person|figure/i

export interface PullSource {
  template: THREE.Object3D // filtered clone in its own local frame
  center: THREE.Vector3 // bbox center (template-local)
  axisLong: number // 0/1/2 = which local axis is longest / mid / shortest
  axisDepth: number
  axisThin: number
  sizeLong: number
}

function axesBySize(size: THREE.Vector3) {
  const s = [size.x, size.y, size.z]
  const axisLong = s.indexOf(Math.max(...s))
  const axisThin = s.indexOf(Math.min(...s))
  const axisDepth = 3 - axisLong - axisThin
  return { axisLong, axisDepth, axisThin, sizeLong: s[axisLong] }
}

/** Filter out non-pull (character) meshes and measure the pull's local frame. */
export function analyzePullSource(gltfScene: THREE.Object3D): PullSource {
  const template = gltfScene.clone(true)
  const drop: THREE.Object3D[] = []
  template.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const matName = (m.material && (m.material as THREE.Material).name) || ''
    if (NON_PULL_RE.test(matName) || NON_PULL_RE.test(m.name)) drop.push(m)
  })
  drop.forEach((o) => o.parent?.remove(o))
  template.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(template)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  return { template, center, ...axesBySize(size) }
}

export interface PullTarget {
  mesh: THREE.Mesh
  center: THREE.Vector3
  axisLong: number
  axisDepth: number
  axisThin: number
  sizeLong: number
  /** Full ancestor-name chain (lowercased), e.g. for detecting island pulls. */
  name: string
}

/** Find every original pull mesh in the kitchen scene and measure its world placement. */
export function analyzePullTargets(scene: THREE.Object3D): PullTarget[] {
  const out: PullTarget[] = []
  scene.updateWorldMatrix(true, true)
  scene.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    let p: THREE.Object3D | null = o
    let name = ''
    while (p) { name = `${p.name || ''} ${name}`; p = p.parent }
    if (!/pull/i.test(name)) return
    const box = new THREE.Box3().setFromObject(m)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    out.push({ mesh: m, center, name: name.toLowerCase(), ...axesBySize(size) })
  })
  return out
}

const unit = (i: number) => new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0)

/**
 * Build one pull instance: clone the source, center it, then rotate its (long, depth, thin)
 * frame onto the target's, scale uniformly so the long axis matches, and place at the
 * target centre. Uniform scale preserves the pull's true proportions.
 */
export function makePullInstance(src: PullSource, tgt: PullTarget, material: THREE.Material, rollFix = 0): THREE.Object3D {
  // Right-handed source + target bases.
  const sl = unit(src.axisLong), sd = unit(src.axisDepth)
  const st = new THREE.Vector3().crossVectors(sl, sd)
  const tl = unit(tgt.axisLong), td = unit(tgt.axisDepth)
  const tt = new THREE.Vector3().crossVectors(tl, td)
  const Bs = new THREE.Matrix4().makeBasis(sl, sd, st)
  const Bt = new THREE.Matrix4().makeBasis(tl, td, tt)
  const R = Bt.multiply(Bs.transpose()) // source frame → target world frame (proper rotation)
  const quat = new THREE.Quaternion().setFromRotationMatrix(R)
  // Per-pull correction: a bbox can't tell protrusion from thickness, so some pulls need a
  // roll about their long axis to sit the right way up.
  if (rollFix) {
    quat.premultiply(new THREE.Quaternion().setFromAxisAngle(tl, rollFix))
  }
  const scale = tgt.sizeLong / (src.sizeLong || 1)

  const inner = src.template.clone(true)
  inner.position.copy(src.center).multiplyScalar(-1) // center geometry at the group origin
  inner.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    m.material = material
    m.castShadow = true
    m.receiveShadow = false
  })

  const outer = new THREE.Group()
  outer.name = 'SwappedPull'
  outer.add(inner)
  outer.quaternion.copy(quat)
  outer.scale.setScalar(scale)
  outer.position.copy(tgt.center)
  outer.updateMatrixWorld(true)
  return outer
}
