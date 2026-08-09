/*
 * StudioPanel — a custom, always-visible lighting controller (no Leva dependency).
 * Fixed to the right edge, high z-index, scrollable. It edits the shared lighting
 * state held in App; that same state drives <LightingRig> in the canvas, so every
 * slider / toggle / color picker updates the live scene immediately.
 *
 * Shown only when the `visible` prop is true (App passes ?studio=1).
 */
import { useState } from 'react'
import { REFERENCE_MATCH_LIGHTING, saveStoredLighting, type LightingState } from '../../three/lighting'
import './StudioPanel.css'

type Ctl =
  | { k: keyof LightingState; type: 'slider'; label: string; min: number; max: number; step: number }
  | { k: keyof LightingState; type: 'toggle'; label: string }
  | { k: keyof LightingState; type: 'color'; label: string }

interface Group {
  title: string
  controls: Ctl[]
}

const sl = (k: keyof LightingState, label: string, min: number, max: number, step: number): Ctl => ({ k, type: 'slider', label, min, max, step })
const tg = (k: keyof LightingState, label: string): Ctl => ({ k, type: 'toggle', label })
const col = (k: keyof LightingState, label: string): Ctl => ({ k, type: 'color', label })

const GROUPS: Group[] = [
  { title: 'Exposure', controls: [sl('exposure', 'toneMappingExposure', 0.75, 1.35, 0.01)] },
  {
    title: 'Ambient',
    controls: [tg('amb_on', 'enabled'), sl('amb_int', 'intensity', 0, 1.2, 0.01), col('amb_col', 'color')],
  },
  {
    title: 'Hemisphere',
    controls: [
      tg('hemi_on', 'enabled'), sl('hemi_int', 'intensity', 0, 1.2, 0.01),
      col('hemi_sky', 'sky color'), col('hemi_ground', 'ground color'),
    ],
  },
  {
    title: 'Inside Sun (in-room, casts shadows)',
    controls: [
      tg('sun_on', 'enabled'),
      sl('sun_int', 'brightness', 0, 6, 0.05),
      col('sun_col', 'color'),
      sl('sun_x', 'position X (left / right)', -18, 18, 0.1),
      sl('sun_y', 'position Y (height)', 1, 16, 0.1),
      sl('sun_z', 'position Z (front / back)', -18, 18, 0.1),
      sl('sun_soft', 'shadow softness', 0, 15, 0.5),
    ],
  },
  {
    title: 'Outside Sun (daylight, casts shadows)',
    controls: [
      tg('osun_on', 'enabled'),
      sl('osun_int', 'brightness', 0, 6, 0.05),
      col('osun_col', 'color'),
      sl('osun_x', 'direction X (left / right)', -18, 18, 0.1),
      sl('osun_y', 'direction Y (height — lower = longer shadow)', 1, 16, 0.1),
      sl('osun_z', 'direction Z (front / back)', -18, 18, 0.1),
      sl('osun_soft', 'shadow softness', 0, 15, 0.5),
    ],
  },
  {
    title: 'Main Key Light',
    controls: [
      tg('key_on', 'enabled'), sl('key_int', 'intensity', 0, 5, 0.01), col('key_col', 'color'),
      sl('key_px', 'position X', -10, 10, 0.01), sl('key_py', 'position Y', 0, 8, 0.01), sl('key_pz', 'position Z', -10, 10, 0.01),
      sl('key_tx', 'target X', -10, 10, 0.01), sl('key_ty', 'target Y', 0, 5, 0.01), sl('key_tz', 'target Z', -10, 10, 0.01),
      sl('key_angle', 'angle / focus', 0.1, 1.2, 0.01), sl('key_pen', 'penumbra', 0, 1, 0.01),
      sl('key_dist', 'distance', 1, 15, 0.1), sl('key_decay', 'decay', 0, 3, 0.01),
      tg('key_shadow', 'shadow enabled'), sl('key_sr', 'shadow radius', 0, 15, 0.1),
      sl('key_sbias', 'shadow bias', -0.002, 0.002, 0.00001), sl('key_nbias', 'normal bias', 0, 0.1, 0.001),
      tg('h_key', 'show helper'),
    ],
  },
  {
    title: 'Key Light 2',
    controls: [
      tg('key2_on', 'enabled'), sl('key2_int', 'intensity', 0, 5, 0.01), col('key2_col', 'color'),
      sl('key2_px', 'position X', -10, 10, 0.01), sl('key2_py', 'position Y', 0, 8, 0.01), sl('key2_pz', 'position Z', -10, 10, 0.01),
      sl('key2_tx', 'target X', -10, 10, 0.01), sl('key2_ty', 'target Y', 0, 5, 0.01), sl('key2_tz', 'target Z', -10, 10, 0.01),
      sl('key2_angle', 'angle / focus', 0.1, 1.2, 0.01), sl('key2_pen', 'penumbra', 0, 1, 0.01),
      sl('key2_dist', 'distance', 1, 15, 0.1), sl('key2_decay', 'decay', 0, 3, 0.01),
      tg('key2_shadow', 'shadow enabled'), sl('key2_sr', 'shadow radius', 0, 15, 0.1),
      sl('key2_sbias', 'shadow bias', -0.002, 0.002, 0.00001), sl('key2_nbias', 'normal bias', 0, 0.1, 0.001),
      tg('h_key2', 'show helper'),
    ],
  },
  {
    title: 'Fill Light',
    controls: [
      tg('fill_on', 'enabled'), sl('fill_int', 'intensity', 0, 3, 0.01), col('fill_col', 'color'),
      sl('fill_px', 'position X', -10, 10, 0.01), sl('fill_py', 'position Y', 0, 8, 0.01), sl('fill_pz', 'position Z', -10, 10, 0.01),
      sl('fill_tx', 'target X', -10, 10, 0.01), sl('fill_ty', 'target Y', 0, 5, 0.01), sl('fill_tz', 'target Z', -10, 10, 0.01),
      tg('h_fill', 'show helper'),
    ],
  },
  {
    title: 'Wall Lift',
    controls: [
      tg('wall_on', 'enabled'), sl('wall_int', 'intensity', 0, 2, 0.01), col('wall_col', 'color'),
      sl('wall_px', 'position X', -10, 10, 0.01), sl('wall_py', 'position Y', 0, 8, 0.01), sl('wall_pz', 'position Z', -10, 10, 0.01),
      sl('wall_tx', 'target X', -10, 10, 0.01), sl('wall_ty', 'target Y', 0, 5, 0.01), sl('wall_tz', 'target Z', -10, 10, 0.01),
      tg('h_wall', 'show helper'),
    ],
  },
  {
    title: 'Under Cabinet',
    controls: [
      tg('uc_on', 'enabled'), sl('uc_int', 'intensity', 0, 8, 0.05), col('uc_col', 'color'),
      sl('uc_angle', 'angle / focus', 0.1, 1.4, 0.01), sl('uc_pen', 'focus softness', 0, 1, 0.01),
      sl('uc1x', 'light 1 — X', -1, 5, 0.05), sl('uc1y', 'light 1 — Y', 0.5, 2.4, 0.01), sl('uc1z', 'light 1 — Z', -4, 1, 0.05),
      sl('uc2x', 'light 2 — X', -1, 5, 0.05), sl('uc2y', 'light 2 — Y', 0.5, 2.4, 0.01), sl('uc2z', 'light 2 — Z', -4, 1, 0.05),
      sl('uc3x', 'light 3 — X', -1, 5, 0.05), sl('uc3y', 'light 3 — Y', 0.5, 2.4, 0.01), sl('uc3z', 'light 3 — Z', -4, 1, 0.05),
      sl('uc4x', 'light 4 — X', -1, 5, 0.05), sl('uc4y', 'light 4 — Y', 0.5, 2.4, 0.01), sl('uc4z', 'light 4 — Z', -4, 1, 0.05),
      sl('uc5x', 'light 5 — X', -1, 5, 0.05), sl('uc5y', 'light 5 — Y', 0.5, 2.4, 0.01), sl('uc5z', 'light 5 — Z', -4, 1, 0.05),
      sl('uc6x', 'light 6 — X', -1, 5, 0.05), sl('uc6y', 'light 6 — Y', 0.5, 2.4, 0.01), sl('uc6z', 'light 6 — Z', -4, 1, 0.05),
      tg('h_uc', 'show helper'),
    ],
  },
  {
    title: 'Can Fixtures',
    controls: [
      tg('can_visible', 'visible'), col('can_trimcol', 'trim color'), sl('can_trimbright', 'trim brightness', 0.2, 2, 0.01),
    ],
  },
  {
    title: 'Helpers',
    controls: [
      tg('h_key', 'key helper'), tg('h_key2', 'key 2 helper'), tg('h_fill', 'fill helper'), tg('h_wall', 'wall lift helper'),
      tg('h_uc', 'under-cab helper'), tg('h_can', 'can helpers'), tg('h_shadow', 'shadow camera'),
    ],
  },
]

const HELPER_KEYS: (keyof LightingState)[] = ['h_key', 'h_key2', 'h_fill', 'h_wall', 'h_uc', 'h_can', 'h_shadow']

interface Props {
  visible: boolean
  config: LightingState
  onChange: (key: keyof LightingState, value: number | boolean | string) => void
  onReplace: (next: LightingState) => void
  onClose: () => void
}

export default function StudioPanel({ visible, config, onChange, onReplace, onClose }: Props) {
  const [saved, setSaved] = useState(false)
  if (!visible) return null

  const allHelpers = HELPER_KEYS.every((k) => config[k] === true)
  const setAllHelpers = (on: boolean) => {
    const next = { ...config }
    HELPER_KEYS.forEach((k) => ((next as Record<string, unknown>)[k] = on))
    onReplace(next)
  }

  const save = () => {
    saveStoredLighting(config)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1300)
  }

  // Reset only one group's controls back to the baseline defaults.
  const resetGroup = (g: Group) => {
    const next = { ...config } as Record<string, unknown>
    g.controls.forEach((c) => {
      next[c.k] = (REFERENCE_MATCH_LIGHTING as Record<string, unknown>)[c.k]
    })
    onReplace(next as LightingState)
  }

  return (
    <aside className="studio" aria-label="Lighting Studio">
      <header className="studio__title">
        Lighting Studio
        <button type="button" className="studio__close" onClick={onClose} aria-label="Close">×</button>
      </header>
      <div className="studio__scroll">
        {GROUPS.map((g) => (
          <section className="studio__group" key={g.title}>
            <h4 className="studio__grouptitle">
              {g.title}
              <button type="button" className="studio__groupreset" onClick={() => resetGroup(g)} title="Reset this group to default">↺ reset</button>
            </h4>
            {g.title === 'Helpers' && (
              <Row label="show all helpers">
                <input type="checkbox" checked={allHelpers} onChange={(e) => setAllHelpers(e.target.checked)} />
              </Row>
            )}
            {g.controls.map((c) => (
              <Row key={`${g.title}.${c.k}`} label={c.label}>
                {c.type === 'toggle' && (
                  <input
                    type="checkbox"
                    checked={config[c.k] as boolean}
                    onChange={(e) => onChange(c.k, e.target.checked)}
                  />
                )}
                {c.type === 'color' && (
                  <input
                    type="color"
                    value={config[c.k] as string}
                    onChange={(e) => onChange(c.k, e.target.value)}
                  />
                )}
                {c.type === 'slider' && (
                  <span className="studio__sliderwrap">
                    <input
                      type="range"
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      value={config[c.k] as number}
                      onChange={(e) => onChange(c.k, parseFloat(e.target.value))}
                    />
                    <span className="studio__val">{fmt(config[c.k] as number)}</span>
                  </span>
                )}
              </Row>
            ))}
          </section>
        ))}

        <section className="studio__group">
          <div className="studio__buttons">
            <button type="button" onClick={save}>{saved ? '✓ Saved' : 'Save'}</button>
            <button type="button" onClick={() => onReplace({ ...REFERENCE_MATCH_LIGHTING })}>Reset to baseline</button>
          </div>
        </section>
      </div>
    </aside>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="studio__row">
      <span className="studio__label">{label}</span>
      <span className="studio__control">{children}</span>
    </label>
  )
}

function fmt(n: number): string {
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(1)
  return Number.isInteger(n) ? String(n) : n.toFixed(n < 1 && n > -1 ? 3 : 2)
}
