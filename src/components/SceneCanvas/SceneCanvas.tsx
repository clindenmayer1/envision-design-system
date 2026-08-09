/* Full-bleed R3F canvas hosting the kitchen model (replaces the static photo).
 *
 * A preloader is shown over the canvas ONLY while the initial scene assets are downloading. Its
 * bar is driven by REAL bytes (preloadAssets streams every required GLB + texture and reports
 * actual download progress) — never a simulated, timed, or decorative animation. All of that
 * load logic lives in useSceneLoad; the bar below is purely presentational and reads only a
 * number + a couple of flags, so it can be replaced by any graphic without touching the loading,
 * completion, or error behaviour. The scene mounts only once assets are cached (useGLTF then
 * reads from cache — no double download), and the bar reaches 100% only when the scene has truly
 * rendered. If everything is already cached, the model shows immediately with no preloader. */
import { Component, Suspense, useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import KitchenScene, { type TargetCounts, type ViewName } from '../../three/KitchenScene'
import { DEFAULT_PRESET } from '../../three/cameraPresets'
import { useSceneLoad } from '../../three/useSceneLoad'
import type { LightingState } from '../../three/lighting'
import type { KitchenConfig } from '../../types'
import './SceneCanvas.css'

interface Props {
  config: KitchenConfig
  onTargets?: (counts: TargetCounts) => void
  activeView?: ViewName
  viewNonce?: number
  lighting: LightingState
  studio: boolean
  /** When the Countertop Materials tray is open, frame the countertop pose. */
  countertopOpen?: boolean
  /** When the Backsplash Materials tray is open, frame the backsplash pose. */
  backsplashOpen?: boolean
  /** When the Cabinet Hardware tray is open, frame the hardware pose. */
  hardwareOpen?: boolean
  /** When the Faucet Style tray is open, frame the faucet pose. */
  faucetOpen?: boolean
  /** False when the Design Center is covered by another tab — idles the render loop
   *  (GPU) without unmounting/resizing, so the context + buffers survive for an instant return. */
  active?: boolean
}

/* Lives inside <Suspense>, so it mounts only after the GLBs have parsed and every suspending
 * texture has resolved. It waits a few rendered frames (the scene has built and actually painted
 * by then) before signalling ready — this is the true "model is on screen" moment that drives the
 * bar to 100%. */
function ReadyDetector({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current >= 3) {
      done.current = true
      onReady()
    }
  })
  return null
}

/* Catches a render/asset error thrown inside the R3F scene tree (e.g. a texture that 404s and
 * rejects) so it surfaces as an error state instead of a blank canvas. */
class SceneErrorBoundary extends Component<{ onError: (e: unknown) => void; children: ReactNode }> {
  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }
  render() {
    return this.props.children
  }
}

/*
 * SceneLoader — purely presentational. Given a real `percent` (0–100) and an `error` flag, it
 * draws the bar (or an error message). No timers, no simulated motion: the fill's width is the
 * real value, and the short CSS transition on it only smooths the gaps between real byte updates.
 */
function SceneLoader({ percent, error }: { percent: number; error: boolean }) {
  if (error) {
    return (
      <div className="scene-loader__error" role="alert">
        <p className="scene-loader__error-title">We couldn’t load the 3D model.</p>
        <button type="button" className="scene-loader__error-retry" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    )
  }
  return (
    <div className="scene-loader__bar">
      <div className="scene-loader__fill" style={{ transform: `scaleX(${Math.max(0, Math.min(100, percent)) / 100})` }} />
    </div>
  )
}

export default function SceneCanvas({ config, onTargets, activeView, viewNonce, lighting, studio, countertopOpen, backsplashOpen, hardwareOpen, faucetOpen, active = true }: Props) {
  const { percent, mountScene, showLoader, visible, error, onSceneReady, onSceneError } = useSceneLoad()

  return (
    <div className="scene-canvas">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        shadows={{ type: THREE.VSMShadowMap }}
        dpr={[1, 2]}
        camera={{ position: DEFAULT_PRESET.position, fov: DEFAULT_PRESET.fov, near: 0.05, far: 2000 }}
        onCreated={({ camera }) => camera.up.set(...DEFAULT_PRESET.up)}
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.NeutralToneMapping }}
      >
        <color attach="background" args={['#f3f0ea']} />
        {/* Mount the scene only once assets are cached — useGLTF then reads from THREE.Cache. */}
        {mountScene && (
          <Suspense fallback={null}>
            <SceneErrorBoundary onError={onSceneError}>
              <KitchenScene config={config} onTargets={onTargets} activeView={activeView} viewNonce={viewNonce} lighting={lighting} studio={studio} countertopOpen={countertopOpen} backsplashOpen={backsplashOpen} hardwareOpen={hardwareOpen} faucetOpen={faucetOpen} />
              <ReadyDetector onReady={onSceneReady} />
            </SceneErrorBoundary>
          </Suspense>
        )}
      </Canvas>
      {showLoader && (
        <div className={`scene-loader${visible ? ' scene-loader--visible' : ''}`} aria-hidden={!visible}>
          <SceneLoader percent={percent} error={error} />
        </div>
      )}
    </div>
  )
}
