/*
 * Choose Wall Color — full-library picker opened by the "+" chip in the wall-colour row.
 * Mirrors the Figma design (fonts, spacing, 5-column grid, BROWSE BY / EXPLORE BY THEME sidebar,
 * Saved Colors, footer). Real Benjamin Moore colours grouped by section; selecting one and
 * confirming applies it to the live model (config.wallColor → the plaster shell paint).
 */
import { useMemo, useState } from 'react'
import { WALL_COLOR_SECTIONS, WALL_COLOR_LIBRARY, type WallColor } from '../../data/wallColorLibrary'
import './WallColorModal.css'

interface Props {
  /** Currently-applied wall colour id (curated id or library id). */
  current: string
  /** Cancel — reverts the live preview to the original colour and closes. */
  onClose: () => void
  /** Confirm the chosen library colour by id (commits + closes). */
  onSelect: (id: string) => void
  /** Live-preview a colour on the model as the user clicks swatches (before confirming). */
  onPreview?: (id: string) => void
}

const CATEGORIES = ['All Colors', ...WALL_COLOR_SECTIONS.map((s) => s.name)]

export default function WallColorModal({ current, onClose, onSelect, onPreview }: Props) {
  const [category, setCategory] = useState('All Colors')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string>(current)

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (c: WallColor) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    const base = category === 'All Colors' ? WALL_COLOR_SECTIONS : WALL_COLOR_SECTIONS.filter((s) => s.name === category)
    return base.map((s) => ({ name: s.name, colors: s.colors.filter(match) })).filter((s) => s.colors.length > 0)
  }, [category, query])

  const total = useMemo(() => sections.reduce((n, s) => n + s.colors.length, 0), [sections])
  const canApply = picked && WALL_COLOR_LIBRARY.some((c) => c.id === picked)

  return (
    <div className="wcm" role="dialog" aria-label="Choose Wall Color" aria-modal="true">
      <div className="wcm__backdrop" onClick={onClose} />
      <div className="wcm__card">
        <header className="wcm__head">
          <div className="wcm__titles">
            <h2 className="wcm__title">Choose Wall Color</h2>
          </div>
          <div className="wcm__search">
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search colors" aria-label="Search colors" />
          </div>
          <button type="button" className="wcm__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="wcm__divider" />

        <div className="wcm__body">
          <nav className="wcm__sidebar" aria-label="Browse by">
            <div className="wcm__browse">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`wcm__cat${category === c ? ' wcm__cat--active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </nav>

          <div className="wcm__content">
            <div className="wcm__content-head">
              <span className="wcm__count">{category} ({total.toLocaleString('en-US')})</span>
              <span className="wcm__sort">Sort by: Popular
                <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
            <div className="wcm__scroll">
              {sections.map((s) => (
                <section key={s.name} className="wcm__section">
                  {category === 'All Colors' && <h3 className="wcm__section-title">{s.name}</h3>}
                  <div className="wcm__grid">
                    {s.colors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`wcm__swatch${picked === c.id ? ' wcm__swatch--sel' : ''}`}
                        onClick={() => { setPicked(c.id); onPreview?.(c.id) }}
                        onDoubleClick={() => onSelect(c.id)}
                        title={`${c.name} ${c.code}`}
                      >
                        <span className="wcm__chip" style={{ background: c.hex }}>
                          {picked === c.id && (
                            <span className="wcm__check">
                              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          )}
                        </span>
                        <span className="wcm__name">{c.name}</span>
                        <span className="wcm__code">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
              {total === 0 && <p className="wcm__empty">No colors match “{query}”.</p>}
            </div>
          </div>
        </div>

        <footer className="wcm__foot">
          <button type="button" className="wcm__save">
            <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden="true"><path d="M4 2.5h10a1 1 0 0 1 1 1v12l-6-3.2-6 3.2v-12a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            Save Color
          </button>
          <button type="button" className="wcm__apply" disabled={!canApply} onClick={() => canApply && onSelect(picked)}>
            Select This Color
          </button>
        </footer>
      </div>
    </div>
  )
}
