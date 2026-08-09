/*
 * Camera presets derived from the SketchUp scene cameras baked into the GLB
 * (nodes VIEW1/VIEW2/VIEW3/…).
 *
 * IMPORTANT unit/axis caveat: the SimLab export is INCONSISTENT —
 *   • geometry  → meters, Y-up (bbox ≈ 7×2.6×6 m, centered near origin)
 *   • cam nodes → inches, Z-up (VIEW2 eye ≈ 277,-75,50)
 * So a camera node's raw translation must be converted into the geometry's
 * space before use: (x, y, z)_inch,Zup → (x, z, -y) × 0.0254 meters, Y-up.
 * The look target is the model's bbox center (computed at runtime in
 * KitchenScene), so the framing is robust regardless of exact eye.
 */
const INCH_TO_M = 0.0254

/** SketchUp (inches, Z-up) → glTF geometry space (meters, Y-up). */
function toGeometrySpace(sk: [number, number, number]): [number, number, number] {
  return [sk[0] * INCH_TO_M, sk[2] * INCH_TO_M, -sk[1] * INCH_TO_M]
}

export interface CameraPreset {
  id: string
  label: string
  position: [number, number, number]
  /** Fallback target (meters, Y-up). KitchenScene overrides with the live bbox center. */
  target: [number, number, number]
  up: [number, number, number]
  fov: number
}

const MODEL_CENTER: [number, number, number] = [3.4, 1.3, -0.7]

export const VIEW2: CameraPreset = {
  id: 'view2',
  label: 'View 2',
  position: toGeometrySpace([277.24, -75.47, 49.62]), // ≈ [7.04, 1.26, 1.92]
  target: MODEL_CENTER,
  up: [0, 1, 0],
  fov: 50,
}
export const VIEW1: CameraPreset = {
  id: 'view1',
  label: 'View 1',
  position: toGeometrySpace([99.5, -133.96, 55.1]),
  target: MODEL_CENTER,
  up: [0, 1, 0],
  fov: 50,
}
export const VIEW3: CameraPreset = {
  id: 'view3',
  label: 'View 3',
  position: toGeometrySpace([307.35, 69.04, 51.72]),
  target: MODEL_CENTER,
  up: [0, 1, 0],
  fov: 50,
}

export const CAMERA_PRESETS: CameraPreset[] = [VIEW2, VIEW1, VIEW3]
export const DEFAULT_PRESET = VIEW2
