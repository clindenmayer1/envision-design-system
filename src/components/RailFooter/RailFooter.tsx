/*
 * RailFooter — sticky action row pinned to the bottom of the right rail (last flex
 * child of .rail, so it stays put while .rail__scroll scrolls above it). Shows the
 * running upgrade total, a "Save this design" text button, and the primary
 * "Select this design" CTA.
 */
import './RailFooter.css'

interface Props {
  /** Running upgrade total in dollars. Static placeholder until a pricing model exists. */
  upgradeTotal?: number
  onSave?: () => void
  onSelect?: () => void
}

export default function RailFooter({ upgradeTotal = 4280, onSave, onSelect }: Props) {
  const total = `+$${upgradeTotal.toLocaleString('en-US')}`
  return (
    <div className="railfooter">
      <div className="railfooter__top">
        <button type="button" className="railfooter__save" onClick={onSave}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4 2.5h10a1 1 0 0 1 1 1v12l-6-3.2-6 3.2v-12a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          Save this design
        </button>
        <div className="railfooter__upgrades">
          {upgradeTotal > 0 ? (
            <>
              <span className="railfooter__label">Selected upgrades</span>
              <span className="railfooter__total">{total}</span>
            </>
          ) : (
            <span className="railfooter__included">All selections included</span>
          )}
        </div>
      </div>
      <button type="button" className="railfooter__select" onClick={onSelect}>
        Select this design
      </button>
    </div>
  )
}
