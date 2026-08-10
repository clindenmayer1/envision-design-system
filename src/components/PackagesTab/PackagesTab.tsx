/*
 * Packages tab — curated collection cards (matches the Figma "Packages Panel").
 * Header + a scrolling list of package cards + a "Fully customizable" note.
 *
 * Cards show a real 3D snapshot of the model with the package applied (cached under
 * /public/packages), the real material swatches, and selected / customized / loading states.
 * Selecting a package applies its full config to the live model via the same selection path
 * as manual customization (no competing apply system).
 */
import { useEffect, useRef } from 'react'
import { PackageCard as DSPackageCard } from '@envision/react'
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
  // The design-system card owns anatomy, states, image lifecycle and semantics. It gained a
  // description, an applied check and six square TEXTURE tiles because this screen proved the
  // product needs them. `materials` is product DATA, so it is set as an element property.
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current as (HTMLElement & { pkg?: unknown }) | null
    if (!el) return
    el.pkg = {
      id: pkg.id,
      name: `${pkg.name} Package`,
      description: pkg.description,
      priceLabel: pkg.price,
      image: packageThumbUrl(pkg),
      popular: pkg.popular,
      badgeLabel: pkg.badge,
      materials: packageSwatches(pkg).map((sw, i) => ({
        id: String(i), name: '', image: sw.texture, color: sw.color,
      })),
    }
  }, [pkg])

  return (
    <DSPackageCard
      ref={ref}
      selected={selected}
      onSelect={() => onSelect(pkg)}
      onCustomize={() => onCustomize(pkg)}
    />
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
