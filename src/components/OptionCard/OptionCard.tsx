/*
 * OptionCard — the picker row (Figma: image + title + "Included" + chevron).
 * Shows the currently-selected option; clicking advances to the next option
 * (structural wiring — a full picker/drawer comes later).
 */
import type { Option } from '../../types'
import PullThumb from '../PullThumb/PullThumb'
import './OptionCard.css'

interface Props {
  options: Option[]
  value: string
  onChange: (id: string) => void
  /** When provided, clicking the card opens this (e.g. a tray) instead of cycling. */
  onOpen?: () => void
  /** True while this card's tray/overlay is open → persistent active outline. */
  active?: boolean
  /** Subtitle override — the upgrade price label ("Included" / "+$1,200"). */
  note?: string
}

export default function OptionCard({ options, value, onChange, onOpen, active, note }: Props) {
  const idx = Math.max(0, options.findIndex((o) => o.id === value))
  const current = options[idx] ?? options[0]
  const advance = () => onChange(options[(idx + 1) % options.length].id)

  return (
    <button
      type="button"
      className={`opt-card${active ? ' opt-card--active' : ''}`}
      onClick={onOpen ?? advance}
      title={onOpen ? 'Choose a style' : 'Cycle option'}
    >
      <span className="opt-card__left">
        <span
          className={`opt-card__thumb${
            current.model && /\/doors\/|\/faucets\/|door/i.test(current.model)
              ? ' opt-card__thumb--door' // portrait, matches the door/faucet popup tiles
              : current.texture || current.model
                ? ' opt-card__thumb--square'
                : ''
          }`}
          style={
            current.model
              ? { background: '#f1ece3' }
              : current.texture
                ? { backgroundImage: `url(${current.texture})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : current.swatch
                  ? { background: current.swatch }
                  : { background: 'linear-gradient(135deg,#e7e2d8,#cdbfa6)' }
          }
        >
          {current.model && <PullThumb url={current.model} />}
        </span>
        <span className="opt-card__text">
          <span className="opt-card__title">{current.label}</span>
          <span className={`opt-card__note${note && note !== 'Included' ? ' opt-card__note--upgrade' : ''}`}>{note ?? current.note ?? 'Included'}</span>
        </span>
      </span>
      <span className="opt-card__chevron" aria-hidden>
        ›
      </span>
    </button>
  )
}
