/*
 * Overview — the "Overview" tab: a hero band, then three cards (Design Progress with a 25%
 * ring + selections list, What's Next kitchen prompt, and Key Dates schedule). Matches the
 * Figma "Dashboard 2 — Home" (node 18:1140). The hero and kitchen thumbnail are pre-composed
 * images (text/buttons baked in) exported from Figma; transparent buttons sit over the baked
 * CTAs so they're clickable.
 */
import { useEffect, useRef } from 'react'
import './Overview.css'

const SELECTIONS = [
  { n: 1, name: 'Kitchen', status: 'In Progress', active: true, done: false },
  { n: 2, name: 'Primary Bathroom', status: 'Get Started', active: false, done: false },
  { n: 3, name: 'Secondary Bathroom', status: 'Complete', active: false, done: true },
  { n: 4, name: 'Flooring', status: 'Get Started', active: false, done: false },
  { n: 5, name: 'Interior Finishes', status: 'Get Started', active: false, done: false },
]

const KEY_DATES = [
  ['Design Selections Due', 'Jun 15, 2026'],
  ['Pre-Construction Meeting', 'Jun 22, 2026'],
  ['Estimated Start', 'Jul 7, 2026'],
  ['Estimated Completion', 'Jan 15, 2027'],
]

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
  </svg>
)

export default function Overview({ onGoToDesign, active = true }: { onGoToDesign: () => void; active?: boolean }) {
  // 25% arc of a circle r=88 (circumference ≈ 553).
  const r = 88
  const c = 2 * Math.PI * r

  // Ease the hero video's playback speed down over its final seconds so it decelerates
  // smoothly into the last frame instead of stopping abruptly.
  const videoRef = useRef<HTMLVideoElement>(null)
  // Overview stays mounted while other tabs are active (Layout hides it with display:none),
  // so pause the hero video when hidden — a display:none video keeps decoding otherwise,
  // burning CPU on the convolution filter's source for no visible benefit. Resumes instantly
  // on return (frames already buffered — no re-fetch), which is the whole point of staying mounted.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active) { if (v.paused) void v.play().catch(() => {}) }
    else if (!v.paused) v.pause()
  }, [active])
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const EASE = 3 // seconds before the end to start slowing
    const MIN_RATE = 0.1 // playback speed at the very end
    let raf = 0
    const tick = () => {
      if (v.duration && isFinite(v.duration)) {
        const remaining = v.duration - v.currentTime
        if (remaining <= EASE) {
          const t = Math.max(0, remaining / EASE) // 1 → 0 across the window
          v.playbackRate = MIN_RATE + (1 - MIN_RATE) * t * t
        }
      }
      if (!v.ended) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="ov">
      {/* Unsharp-mask filter applied to the hero video (see .ov__hero-img). */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
        <filter id="ov-sharpen">
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -1.25 0 -1.25 6 -1.25 0 -1.25 0" />
        </filter>
      </svg>
      <div className="ov__hero">
        <video
          ref={videoRef}
          className="ov__hero-img"
          src="/home1.mp4"
          poster="/overview_hero.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
        />{/* plays once (no loop) and holds on the last frame */}
        <div className="ov__hero-scrim" aria-hidden />
        <div className="ov__hero-overlay">
          <div className="ov__hero-head">
            <span className="ov__eyebrow">Welcome home,</span>
            <h1 className="ov__name">The Johnsons!</h1>
          </div>
          <p className="ov__sub">We're excited to help you personalize<br />your new home. Let's make it yours.</p>
          <button type="button" className="ov__start" onClick={onGoToDesign}>
            Start Designing
            <Arrow />
          </button>
        </div>
      </div>

      <div className="ov__content">
        <div className="ov__cards">
          {/* Design Progress */}
          <section className="ov-card ov-card--progress">
            <h3 className="ov-card__title">Your Design Progress</h3>
            <div className="ov-progress">
              <div className="ov-ring">
                <svg viewBox="0 0 202 202" width="176" height="176">
                  <circle cx="101" cy="101" r={r} fill="none" stroke="#e6e4dd" strokeWidth="14" />
                  <circle cx="101" cy="101" r={r} fill="none" stroke="#29594F" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={`${c * 0.20} ${c}`} transform="rotate(-90 101 101)" />
                </svg>
                <div className="ov-ring__label"><span className="ov-ring__pct">20%</span><span className="ov-ring__cap">Complete</span></div>
              </div>
              <ul className="ov-sel">
                {SELECTIONS.map((s) => (
                  <li key={s.n} className={`ov-sel__row${s.active ? ' ov-sel__row--active' : ''}`}>
                    <span className={`ov-sel__circle${s.done ? ' ov-sel__circle--done' : ''}`}>
                      {s.done && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                      )}
                    </span>
                    <span className="ov-sel__num">{s.n}</span>
                    <span className="ov-sel__name">{s.name}</span>
                    <span className={`ov-sel__status${s.active || s.done ? ' ov-sel__status--active' : ''}`}>{s.status}</span>
                    {s.active && <span className="ov-sel__chev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a5e5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* What's Next */}
          <section className="ov-card ov-card--next">
            <h3 className="ov-card__title ov-card__title--icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e3230" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
              What's Next?
            </h3>
            <div className="ov-next__thumb">
              <img src="/overview_kitchen.jpg" alt="Kitchen" />
              <button type="button" className="ov-next__cta" onClick={onGoToDesign}>
                Continue to Kitchen Selections
                <Arrow />
              </button>
            </div>
          </section>

          {/* Key Dates */}
          <section className="ov-card ov-card--dates">
            <div className="ov-card__head">
              <h3 className="ov-card__title ov-card__title--icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e3230" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
                Key Dates
              </h3>
              <button type="button" className="ov-link"><span>View Full Schedule</span><Arrow /></button>
            </div>
            <ul className="ov-dates">
              {KEY_DATES.map(([label, date], i) => (
                <li key={label} className={`ov-dates__row${i > 0 ? ' ov-dates__row--div' : ''}`}>
                  <span className="ov-dates__label">{label}</span>
                  <span className="ov-dates__date">{date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
