/*
 * CabinetStyleTray — a bottom tray that slides up over the 3D model panel when the
 * "Cabinet Style" cell is clicked. Centered horizontally in the canvas, sitting
 * 24px above the bottom of the viewport. Tiles are clickable with active + hover
 * states. Motion is refined (no spring/bounce/scale): the tray fades+slides in,
 * tiles stagger subtly, and it fades+slides out on close. Honors reduced-motion.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ConfigKey, Option } from '../../types'
import { upgradeLabel } from '../../three/pricing'
import PullThumb from '../PullThumb/PullThumb'
import './CabinetStyleTray.css'

type Phase = 'enter' | 'open' | 'exit'

interface Props {
  open: boolean
  options: Option[]
  value: string
  onSelect: (id: string) => void
  onClose: () => void
  /** Tray heading (defaults to "Cabinet Style"). */
  title?: string
  /** Use square (1:1) thumbnails instead of the default 4:5. */
  square?: boolean
  /** Config category → drives each tile's upgrade price note ("Included" / "+$X"). */
  priceKey?: ConfigKey
}

export default function CabinetStyleTray({ open, options, value, onSelect, onClose, title = 'Cabinet Style', square = false, priceKey }: Props) {
  const [mounted, setMounted] = useState(open)
  const [phase, setPhase] = useState<Phase>('exit')
  const rafRef = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  // Carousel: show PER tiles per batch; scrolling advances a whole batch.
  const PER = 6
  const [batch, setBatch] = useState(0)
  // On open, jump to the batch holding the current selection.
  useEffect(() => {
    if (!open) return
    const i = Math.max(0, options.findIndex((o) => o.id === value))
    setBatch(Math.floor(i / PER))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open) {
      setMounted(true)
      setPhase('enter') // mount at the start position (no transition)
      // Two RAFs so the browser paints the 'enter' state before flipping to 'open'.
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() =>
        (rafRef.current = requestAnimationFrame(() => setPhase('open'))),
      )
      return () => cancelAnimationFrame(rafRef.current)
    }
    // closing
    setPhase('exit')
    const t = window.setTimeout(() => setMounted(false), 200) // after the 180ms exit
    return () => window.clearTimeout(t)
  }, [open])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Click outside the tray closes it. Deferred a tick so the same click that opened
  // the tray (on the rail card) doesn't immediately close it. EXCEPTION: clicking a
  // color/finish chip (the rail swatches) keeps the tray open & in place, so you can
  // recolor while comparing styles.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const root = rootRef.current
      const target = e.target instanceof Element ? e.target : null
      if (target && target.closest('.swatch')) return // finish swatch — don't dismiss
      if (root && !root.contains(target)) onClose()
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown, true), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown, true)
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="cab-tray-anchor">
      <div ref={rootRef} className={`cab-tray cab-tray--${phase}${square ? ' cab-tray--square' : ''}`} role="dialog" aria-label={title}>
        <div className="cab-tray__head">
          <span className="cab-tray__title">{title}</span>
          <button type="button" className="cab-tray__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {(() => {
          const TILE = 96
          const GAP = square ? 12 : 20 // cabinet doors (non-square) get more space between tiles
          const batchCount = Math.max(1, Math.ceil(options.length / PER))
          const cur = Math.min(batch, batchCount - 1)
          const shown = Math.min(options.length, PER)
          const viewportW = shown * TILE + (shown - 1) * GAP
          const batchWidth = PER * (TILE + GAP)
          const hasLeft = cur > 0
          const hasRight = cur < batchCount - 1
          return (
            <div className="cab-tray__carousel">
              {hasLeft && (
                <button type="button" className="cab-tray__arrow cab-tray__arrow--left" aria-label="Previous" onClick={() => setBatch((b) => Math.max(0, b - 1))}>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              <div
                className="cab-tray__viewport"
                style={{ width: viewportW }}
              >
                <div className="cab-tray__track" style={{ transform: `translateX(${-cur * batchWidth}px)`, gap: GAP }}>
                  {options.map((opt, i) => {
                    const selected = opt.id === value
                    const note = priceKey ? upgradeLabel(priceKey, opt.id) : (opt.note ?? 'Included')
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        className={`cab-tile${selected ? ' is-active' : ''}`}
                        style={{ '--i': i % PER } as CSSProperties}
                        aria-pressed={selected}
                        onClick={() => onSelect(opt.id)}
                      >
                        <span
                          className="cab-tile__thumb"
                          style={
                            opt.model
                              ? undefined
                              : opt.texture
                                ? { backgroundImage: `url(${opt.texture})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                : opt.swatch
                                  ? { background: opt.swatch }
                                  : undefined
                          }
                        >
                          {opt.model && <PullThumb url={opt.model} />}
                        </span>
                        <span className="cab-tile__title">{opt.label}</span>
                        <span className={`cab-tile__note${note !== 'Included' ? ' cab-tile__note--upgrade' : ''}`}>{note}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              {hasRight && (
                <button type="button" className="cab-tray__arrow cab-tray__arrow--right" aria-label="More" onClick={() => setBatch((b) => Math.min(batchCount - 1, b + 1))}>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M5 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
