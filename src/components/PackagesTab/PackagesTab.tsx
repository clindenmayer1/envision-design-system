/*
 * Packages tab — curated collection cards (matches the Figma "Packages Panel").
 * Header + a scrolling list of package cards + a "Fully customizable" note.
 *
 * Cards show a real 3D snapshot of the model with the package applied (cached under
 * /public/packages), the real material swatches, and selected / customized / loading states.
 * Selecting a package applies its full config to the live model via the same selection path
 * as manual customization (no competing apply system).
 */
import { useState } from 'react'
import { Badge } from '@envision/react'
import { PACKAGES, packageSwatches, packageThumbUrl, type KitchenPackage } from '../../three/packages'
import './PackagesTab.css'

interface Props {
  selectedPackageId: string | null
  /** The selected package has since been individually modified in Customize. */
  customized: boolean
  /** Select the card — applies the package to the live model, stays on the Packages tab. */
  onSelect: (pkg: KitchenPackage) => void
  /** Customize — applies the package and switches to the Customize tab. */
  onCustomize: (pkg: KitchenPackage) => void
}

function PackageCard({ pkg, selected, onSelect, onCustomize }: {
  pkg: KitchenPackage
  selected: boolean
  onSelect: (pkg: KitchenPackage) => void
  onCustomize: (pkg: KitchenPackage) => void
}) {
  const [imgState, setImgState] = useState<'loading' | 'ready' | 'error'>('loading')
  const swatches = packageSwatches(pkg)
  // Selecting the card applies the package to the 3D model.
  const select = () => onSelect(pkg)
  return (
    <section
      className={`pkg-card${selected ? ' pkg-card--selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          select()
        }
      }}
    >
      <div className="pkg-card__image">
        <img
          src={packageThumbUrl(pkg)}
          alt={`${pkg.name} kitchen`}
          onLoad={() => setImgState('ready')}
          onError={() => setImgState('error')}
          style={{ opacity: imgState === 'ready' ? 1 : 0 }}
          draggable={false}
        />
        {imgState !== 'ready' && (
          <div className={`pkg-card__thumbfallback${imgState === 'loading' ? ' pkg-card__thumbfallback--loading' : ''}`}>
            {imgState === 'error' && <span>Preview coming soon</span>}
          </div>
        )}
        {pkg.popular && (
          <Badge className="pkg-card__badge" tone="brand" label={pkg.badge ?? 'Popular'} />
        )}
        {selected && (
          <span className="pkg-card__check" role="img" aria-label="Applied">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </span>
        )}
      </div>

      <div className="pkg-card__content">
        <div className="pkg-card__titlerow">
          <h3 className="pkg-card__name">{pkg.name} Package</h3>
          <span className="pkg-card__price">{pkg.price}</span>
        </div>
        <p className="pkg-card__desc">{pkg.description}</p>

        <div className="pkg-card__swatchrow">
          <div className="pkg-card__swatches" aria-hidden>
            {swatches.map((s, i) => (
              <span
                key={i}
                className="pkg-card__swatch"
                style={s.texture ? { backgroundImage: `url(${s.texture})` } : { background: s.color ?? '#ccc' }}
              />
            ))}
          </div>
          <button
            type="button"
            className="pkg-card__customize"
            onClick={(e) => {
              e.stopPropagation()
              onCustomize(pkg)
            }}
          >
            Customize
          </button>
        </div>
      </div>
    </section>
  )
}

export default function PackagesTab({ selectedPackageId, onSelect, onCustomize }: Props) {
  return (
    <div className="pkg-tab">
      <header className="pkg-tab__header">
        <h2 className="pkg-tab__title">Start with a collection curated by our designers</h2>
        <p className="pkg-tab__sub">You can customize every finish to create a home that's uniquely yours.</p>
      </header>

      <div className="pkg-tab__cards">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={pkg.id === selectedPackageId}
            onSelect={onSelect}
            onCustomize={onCustomize}
          />
        ))}
      </div>

      <div className="pkg-tab__note">
        <svg className="pkg-tab__note-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" />
          <circle cx="9" cy="8" r="2" fill="#fff" /><circle cx="15" cy="16" r="2" fill="#fff" />
        </svg>
        <div className="pkg-tab__note-text">
          <strong>Fully customizable</strong>
          <span>You can adjust any selection after applying a package.</span>
        </div>
      </div>
    </div>
  )
}
