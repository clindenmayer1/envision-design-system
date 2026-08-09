/*
 * Lighting rig + shared lighting state.
 *
 * - REFERENCE_MATCH_LIGHTING is the flat baseline state (the named default preset).
 *   It lives in App state; the custom <StudioPanel> (DOM) edits it and the same
 *   object drives <LightingRig> inside the canvas — so a slider move updates the
 *   real R3F/THREE objects immediately (no disconnected config).
 * - <LightingRig> renders the real lights (ambient, hemisphere, SpotLight key,
 *   RectAreaLight broad + wall-lift fills, under-cab rect wash, ContactShadows)
 *   from the assembled config, plus optional helpers (only when studio=true).
 */
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

// ── ReferenceMatchLighting — flat baseline state (edited live by the panel) ─────
// These defaults ARE the user's tuned "reference" lighting (captured from a saved localStorage
// setup on 2026-07-16), so a fresh visitor to the deployed site — who has no saved lighting —
// sees the intended bright, white-walled look instead of a darker/grayer fallback.
export const REFERENCE_MATCH_LIGHTING = {
  exposure: 1.01,

  amb_on: true, amb_int: 1.03, amb_col: '#ffffff',
  hemi_on: true, hemi_int: 0, hemi_sky: '#faf8f4', hemi_ground: '#ded8cf',

  // Sun — in-room shadow-casting light (off in the reference setup; the outside sun carries it).
  sun_on: false, sun_int: 1.4, sun_col: '#fff6ec', sun_x: 14.4, sun_y: 4.4, sun_z: 8.3, sun_soft: 11,

  // Outside Sun — directional daylight from outside (the primary light in the reference setup).
  osun_on: true, osun_int: 4.5, osun_col: '#fff6ec', osun_x: -9.8, osun_y: 2.4, osun_z: 1.2, osun_soft: 10.5,

  key_on: true, key_int: 1.7, key_col: '#fdfbf7',
  key_px: 1.93, key_py: 2.48, key_pz: 1.59,
  key_tx: 1.64, key_ty: 0.39, key_tz: -2.47,
  key_angle: 0.62, key_pen: 0.85, key_dist: 18, key_decay: 0.18,
  key_shadow: true, key_sr: 11.2, key_sbias: -0.002, key_nbias: 0,

  key2_on: true, key2_int: 1.97, key2_col: '#fdfbf7',
  key2_px: 10, key2_py: 2.01, key2_pz: 2.03,
  key2_tx: -3.5, key2_ty: 5, key2_tz: 1.36,
  key2_angle: 0.62, key2_pen: 0.85, key2_dist: 18, key2_decay: 0.5,
  key2_shadow: true, key2_sr: 6, key2_sbias: -0.00012, key2_nbias: 0.02,

  fill_on: true, fill_int: 1.79, fill_col: '#ffffff',
  fill_px: 1.83, fill_py: 1.93, fill_pz: 4.8,
  fill_tx: 6.18, fill_ty: 1.4, fill_tz: -1.4,
  fill_w: 9, fill_h: 5,

  wall_on: true, wall_int: 0.29, wall_col: '#f8f8f6',
  wall_px: 7.61, wall_py: 3.5, wall_pz: 0.64,
  wall_tx: 2.03, wall_ty: 1.93, wall_tz: 4.58,
  wall_w: 5, wall_h: 4,

  uc_on: true, uc_int: 0.95, uc_col: '#fff2df',
  uc_angle: 0.76, uc_pen: 0.5,
  uc1x: 0.05, uc1y: 1.51, uc1z: -0.35, uc2x: 0.05, uc2y: 1.5, uc2z: -0.8,
  uc3x: 0.05, uc3y: 1.54, uc3z: -2.55, uc4x: 0.05, uc4y: 1.5, uc4z: -3.05,
  uc5x: 0.35, uc5y: 2.4, uc5z: -1.7, uc6x: 1.05, uc6y: 1.66, uc6z: -3.55,

  cs_on: true, cs_opacity: 0.18, cs_blur: 2.2, cs_scale: 16,

  can_visible: true, can_trimcol: '#ffffff', can_trimbright: 0.27, can_y: 2.585,
  can_glow_int: 2.0, can_glow_col: '#fff4ea', can_down: 1.8, can_shadow: false,
  can1x: 1.8, can1z: -1.75, can2x: 3.4, can2z: -1.75, can3x: 5.0, can3z: -1.75,
  can4x: 1.8, can4z: -0.05, can5x: 3.4, can5z: -0.05, can6x: 5.0, can6z: -0.05,

  h_key: false, h_key2: false, h_fill: false, h_wall: false, h_uc: false, h_can: false, h_shadow: false,
}

export type LightingState = typeof REFERENCE_MATCH_LIGHTING

// ── Persistence: lighting auto-saves here and auto-loads on refresh ─────────────
export const LIGHTING_STORAGE_KEY = 'envision.lighting'

// BUMP THIS whenever REFERENCE_MATCH_LIGHTING changes. A save is only honoured if it carries
// the current version; older saves are DISCARDED and the new baseline is adopted. This is what
// lets a defaults change actually reach existing visitors — the app auto-saves lighting on first
// load, so a returning visitor would otherwise keep the STALE saved defaults forever (that's why
// the deployed site kept its old dark look after the defaults were updated).
const LIGHTING_VERSION = 3

export function loadStoredLighting(): LightingState {
  try {
    const s = localStorage.getItem(LIGHTING_STORAGE_KEY)
    if (s) {
      const saved = JSON.parse(s) as Partial<LightingState> & { __v?: number }
      // Only honour a save from the CURRENT defaults version — merged over the baseline so any
      // newly-added control still gets its default. Any older/unversioned save is dropped.
      if (saved.__v === LIGHTING_VERSION) {
        return { ...REFERENCE_MATCH_LIGHTING, ...saved }
      }
    }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return { ...REFERENCE_MATCH_LIGHTING }
}

export function saveStoredLighting(state: LightingState): void {
  try {
    localStorage.setItem(LIGHTING_STORAGE_KEY, JSON.stringify({ ...state, __v: LIGHTING_VERSION }))
  } catch {
    /* storage unavailable */
  }
}

// ── Resolved config types consumed by the rig components ────────────────────────
export interface LightConfig {
  exposure: number
  ambient: { enabled: boolean; intensity: number; color: string }
  hemi: { enabled: boolean; intensity: number; sky: string; ground: string }
  sun: { enabled: boolean; intensity: number; color: string; pos: [number, number, number]; softness: number }
  osun: { enabled: boolean; intensity: number; color: string; pos: [number, number, number]; softness: number }
  key: {
    enabled: boolean; intensity: number; color: string
    pos: [number, number, number]; target: [number, number, number]
    angle: number; penumbra: number; distance: number; decay: number
    shadow: boolean; shadowRadius: number; shadowBias: number; normalBias: number
  }
  key2: {
    enabled: boolean; intensity: number; color: string
    pos: [number, number, number]; target: [number, number, number]
    angle: number; penumbra: number; distance: number; decay: number
    shadow: boolean; shadowRadius: number; shadowBias: number; normalBias: number
  }
  fill: { enabled: boolean; intensity: number; color: string; pos: [number, number, number]; target: [number, number, number]; width: number; height: number }
  wall: { enabled: boolean; intensity: number; color: string; pos: [number, number, number]; target: [number, number, number]; width: number; height: number }
  underCab: { enabled: boolean; intensity: number; color: string; angle: number; penumbra: number; positions: [number, number, number][] }
  contact: { enabled: boolean; opacity: number; blur: number; scale: number }
  helpers: { key: boolean; key2: boolean; fill: boolean; wall: boolean; underCab: boolean; cans: boolean; shadowCam: boolean }
}

export interface CanConfig {
  visible: boolean; trimColor: string; trimBrightness: number; y: number
  glowIntensity: number; glowColor: string; downlight: number; shadow: boolean; helper: boolean
  positions: [number, number][]
}

export function assemble(c: LightingState): { light: LightConfig; cans: CanConfig } {
  const light: LightConfig = {
    exposure: c.exposure,
    ambient: { enabled: c.amb_on, intensity: c.amb_int, color: c.amb_col },
    hemi: { enabled: c.hemi_on, intensity: c.hemi_int, sky: c.hemi_sky, ground: c.hemi_ground },
    sun: { enabled: c.sun_on, intensity: c.sun_int, color: c.sun_col, pos: [c.sun_x, c.sun_y, c.sun_z], softness: c.sun_soft },
    osun: { enabled: c.osun_on, intensity: c.osun_int, color: c.osun_col, pos: [c.osun_x, c.osun_y, c.osun_z], softness: c.osun_soft },
    key: {
      enabled: c.key_on, intensity: c.key_int, color: c.key_col,
      pos: [c.key_px, c.key_py, c.key_pz], target: [c.key_tx, c.key_ty, c.key_tz],
      angle: c.key_angle, penumbra: c.key_pen, distance: c.key_dist, decay: c.key_decay,
      shadow: c.key_shadow, shadowRadius: c.key_sr, shadowBias: c.key_sbias, normalBias: c.key_nbias,
    },
    key2: {
      enabled: c.key2_on, intensity: c.key2_int, color: c.key2_col,
      pos: [c.key2_px, c.key2_py, c.key2_pz], target: [c.key2_tx, c.key2_ty, c.key2_tz],
      angle: c.key2_angle, penumbra: c.key2_pen, distance: c.key2_dist, decay: c.key2_decay,
      shadow: c.key2_shadow, shadowRadius: c.key2_sr, shadowBias: c.key2_sbias, normalBias: c.key2_nbias,
    },
    fill: { enabled: c.fill_on, intensity: c.fill_int, color: c.fill_col, pos: [c.fill_px, c.fill_py, c.fill_pz], target: [c.fill_tx, c.fill_ty, c.fill_tz], width: c.fill_w, height: c.fill_h },
    wall: { enabled: c.wall_on, intensity: c.wall_int, color: c.wall_col, pos: [c.wall_px, c.wall_py, c.wall_pz], target: [c.wall_tx, c.wall_ty, c.wall_tz], width: c.wall_w, height: c.wall_h },
    underCab: {
      enabled: c.uc_on, intensity: c.uc_int, color: c.uc_col,
      angle: c.uc_angle, penumbra: c.uc_pen,
      positions: [
        [c.uc1x, c.uc1y, c.uc1z], [c.uc2x, c.uc2y, c.uc2z], [c.uc3x, c.uc3y, c.uc3z], [c.uc4x, c.uc4y, c.uc4z],
        [c.uc5x, c.uc5y, c.uc5z], [c.uc6x, c.uc6y, c.uc6z],
      ],
    },
    contact: { enabled: c.cs_on, opacity: c.cs_opacity, blur: c.cs_blur, scale: c.cs_scale },
    helpers: { key: c.h_key, key2: c.h_key2, fill: c.h_fill, wall: c.h_wall, underCab: c.h_uc, cans: c.h_can, shadowCam: c.h_shadow },
  }
  const cans: CanConfig = {
    visible: c.can_visible, trimColor: c.can_trimcol, trimBrightness: c.can_trimbright, y: c.can_y,
    glowIntensity: c.can_glow_int, glowColor: c.can_glow_col, downlight: c.can_down, shadow: c.can_shadow, helper: c.h_can,
    positions: [
      [c.can1x, c.can1z], [c.can2x, c.can2z], [c.can3x, c.can3z],
      [c.can4x, c.can4z], [c.can5x, c.can5z], [c.can6x, c.can6z],
    ],
  }
  return { light, cans }
}

// ── The live rig ────────────────────────────────────────────────────────────────
export function LightingRig({ cfg, studio }: { cfg: LightConfig; studio: boolean }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.toneMappingExposure = cfg.exposure
  }, [gl, cfg.exposure])

  return (
    <>
      {cfg.ambient.enabled && <ambientLight intensity={cfg.ambient.intensity} color={cfg.ambient.color} />}
      {cfg.hemi.enabled && (
        <hemisphereLight intensity={cfg.hemi.intensity} color={cfg.hemi.sky} groundColor={cfg.hemi.ground} />
      )}
      {cfg.sun.enabled && <SunLight cfg={cfg.sun} />}
      {cfg.osun.enabled && <OutsideSun cfg={cfg.osun} />}
      {cfg.key.enabled && (
        <KeySpot cfg={cfg.key} helper={studio && cfg.helpers.key} shadowCam={studio && cfg.helpers.shadowCam} />
      )}
      {cfg.key2.enabled && (
        <KeySpot cfg={cfg.key2} helper={studio && cfg.helpers.key2} shadowCam={false} />
      )}
      {cfg.fill.enabled && <RectFill name="BroadPhotoFill" cfg={cfg.fill} helper={studio && cfg.helpers.fill} />}
      {cfg.wall.enabled && <RectFill name="WallLiftFill" cfg={cfg.wall} helper={studio && cfg.helpers.wall} />}
      {cfg.underCab.enabled && <UnderCabWash cfg={cfg.underCab} helper={studio && cfg.helpers.underCab} />}
    </>
  )
}

// Primary sun — the single shadow-casting light, a real in-room source (spotlight)
// positioned at a direct X/Y/Z point INSIDE the room and aimed at the room center.
// Because it's an actual point in the space (not a directional light at infinity),
// it reads as a light inside the room and throws shadows of the island/cabinets
// onto the floor and surrounding surfaces. `softness` drives the shadow-blur radius.
const SUN_CENTER: [number, number, number] = [3.4, 0, -0.8]
function SunLight({ cfg }: { cfg: LightConfig['sun'] }) {
  const ref = useRef<THREE.SpotLight>(null!)
  const tgt = useRef<THREE.Object3D>(null!)
  const pos = cfg.pos
  useEffect(() => {
    ref.current.target = tgt.current
  }, [])
  return (
    <>
      <spotLight
        ref={ref}
        castShadow
        position={pos}
        intensity={cfg.intensity * 4}
        color={cfg.color}
        angle={1.2}
        penumbra={0.5}
        decay={1}
        distance={25}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.3}
        shadow-camera-far={30}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-radius={cfg.softness}
        shadow-blurSamples={25}
      />
      <object3D ref={tgt} position={SUN_CENTER} />
    </>
  )
}

// Outside Sun — a DIRECTIONAL light (parallel rays from outside, like real
// daylight). Its position only sets the incoming direction. Unlike the in-room
// sun, it aims at a point at WINDOW HEIGHT (not the floor) so the beam points
// directly/horizontally in through the window rather than tilting down from above.
const OSUN_TARGET: [number, number, number] = [2.5, 0, -1]
function OutsideSun({ cfg }: { cfg: LightConfig['osun'] }) {
  const ref = useRef<THREE.DirectionalLight>(null!)
  const tgt = useRef<THREE.Object3D>(null!)
  const pos = cfg.pos
  const far = Math.hypot(pos[0] - OSUN_TARGET[0], pos[1] - OSUN_TARGET[1], pos[2] - OSUN_TARGET[2]) + 30
  useEffect(() => {
    ref.current.target = tgt.current
  }, [])
  useEffect(() => {
    ref.current.shadow.camera.far = far
    ref.current.shadow.camera.updateProjectionMatrix()
  }, [far])
  return (
    <>
      <directionalLight
        ref={ref}
        castShadow
        position={pos}
        intensity={cfg.intensity}
        color={cfg.color}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={far}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-radius={cfg.softness}
        shadow-blurSamples={25}
      />
      <object3D ref={tgt} position={OSUN_TARGET} />
    </>
  )
}

function KeySpot({ cfg, helper, shadowCam }: { cfg: LightConfig['key']; helper: boolean; shadowCam: boolean }) {
  const ref = useRef<THREE.SpotLight>(null!)
  const tgt = useRef<THREE.Object3D>(null!)
  useEffect(() => {
    ref.current.target = tgt.current
  }, [])
  useHelper(helper ? ref : null, THREE.SpotLightHelper)
  const { scene } = useThree()
  useEffect(() => {
    if (!shadowCam || !ref.current) return
    const h = new THREE.CameraHelper(ref.current.shadow.camera)
    scene.add(h)
    return () => { scene.remove(h); h.dispose() }
  }, [shadowCam, scene])
  return (
    <>
      <spotLight
        ref={ref}
        position={cfg.pos}
        color={cfg.color}
        intensity={cfg.intensity}
        angle={cfg.angle}
        penumbra={cfg.penumbra}
        distance={cfg.distance}
        decay={cfg.decay}
        castShadow={cfg.shadow}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-radius={cfg.shadowRadius}
        shadow-bias={cfg.shadowBias}
        shadow-normalBias={cfg.normalBias}
      />
      <object3D ref={tgt} position={cfg.target} />
    </>
  )
}

function RectFill({ name, cfg, helper }: { name: string; cfg: LightConfig['fill']; helper: boolean }) {
  const ref = useRef<THREE.RectAreaLight>(null!)
  useEffect(() => {
    ref.current.lookAt(cfg.target[0], cfg.target[1], cfg.target[2])
  }, [cfg.pos, cfg.target])
  useEffect(() => {
    if (!helper || !ref.current) return
    const h = new RectAreaLightHelper(ref.current)
    ref.current.add(h)
    return () => { ref.current?.remove(h); h.dispose() }
  }, [helper])
  return (
    <rectAreaLight
      ref={ref}
      name={name}
      position={cfg.pos}
      color={cfg.color}
      intensity={cfg.intensity}
      width={cfg.width}
      height={cfg.height}
    />
  )
}

// Under-cabinet lights — measured from the GLB: the sink-wall uppers run along z
// with their front face at x≈0.35; the range-wall uppers run along x with their
// front face at z≈-3.05; both bottom out at y≈1.37. Each light is a SPOTLIGHT
// at its own X/Y/Z, aimed straight DOWN at the counter (≈y 0.92). 8 lights,
// each fully positionable.
const UC_COUNTER_Y = 0.92
function UnderCabWash({ cfg, helper }: { cfg: LightConfig['underCab']; helper: boolean }) {
  return (
    <>
      {cfg.positions.map((p, i) => (
        <UCLight key={i} pos={p} cfg={cfg} helper={helper} />
      ))}
    </>
  )
}
function UCLight({ pos, cfg, helper }: { pos: [number, number, number]; cfg: LightConfig['underCab']; helper: boolean }) {
  const ref = useRef<THREE.SpotLight>(null!)
  const tgt = useRef<THREE.Object3D>(null!)
  useEffect(() => {
    ref.current.target = tgt.current
  }, [])
  useHelper(helper ? ref : null, THREE.SpotLightHelper)
  return (
    <>
      <spotLight
        ref={ref}
        position={pos}
        color={cfg.color}
        intensity={cfg.intensity}
        angle={cfg.angle}
        penumbra={cfg.penumbra}
        distance={1.4}
        decay={1.2}
        castShadow={false}
      />
      {/* Aim straight down: target sits directly below the light at counter height. */}
      <object3D ref={tgt} position={[pos[0], UC_COUNTER_Y, pos[2]]} />
    </>
  )
}
