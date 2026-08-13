/*
 * RightRail — the fixed 416px configurator. Two tabs fixed at the top (Customize | Packages);
 * the tab content scrolls beneath them. Customize is the default and preserves the existing
 * section-based customization experience exactly. Packages shows the curated package cards.
 */
import { useState } from 'react'
import { Tab } from '@envision/react'
import ConfiguratorSection from '../ConfiguratorSection/ConfiguratorSection'
import PackagesTab from '../PackagesTab/PackagesTab'
import RailFooter from '../RailFooter/RailFooter'
import { SECTIONS } from '../../three/materials'
import { upgradeTotal } from '../../three/pricing'
import type { KitchenPackage } from '../../three/packages'
import type { ConfigKey, KitchenConfig, SectionId } from '../../types'
import './RightRail.css'

type RailTab = 'customize' | 'packages'

/** The scroll region is the tabpanel both tabs control. */
const PANEL_ID = 'rail-panel'

interface Props {
  config: KitchenConfig
  onChange: (key: ConfigKey, id: string) => void
  onSectionFocus?: (id: SectionId) => void
  onOpenTray?: (key: ConfigKey) => void
  /** Card whose tray is open → renders with the active outline. */
  openTrayKey?: ConfigKey | null
  /** Currently-applied package (drives the selected card state). */
  selectedPackageId: string | null
  /** The applied package has since been individually modified in Customize. */
  packageCustomized: boolean
  /** Apply a package's full configuration to the live model. */
  onApplyPackage: (pkg: KitchenPackage) => void
  /** Open the full Choose Wall Color picker (the "+" chip in the wall-color row). */
  onOpenWallPicker?: () => void
}

export default function RightRail({ config, onChange, onSectionFocus, onOpenTray, openTrayKey, selectedPackageId, packageCustomized, onApplyPackage, onOpenWallPicker }: Props) {
  const [tab, setTab] = useState<RailTab>('customize')

  return (
    <aside className="rail">
      <div className="rail__tabs" role="tablist" aria-label="Configurator">
        <Tab
          label="Customize"
          panel={PANEL_ID}
          selected={tab === 'customize'}
          onSelect={() => setTab('customize')}
        />
        <Tab
          label="Packages"
          panel={PANEL_ID}
          selected={tab === 'packages'}
          onSelect={() => setTab('packages')}
        />
      </div>

      <div className="rail__scroll" id={PANEL_ID} role="tabpanel" aria-label={tab === 'customize' ? 'Customize' : 'Packages'}>
        {tab === 'customize' ? (
          <div className="rail__customize">
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                className="rail__section"
                onMouseEnter={() => onSectionFocus?.(section.id)}
              >
                <ConfiguratorSection section={section} config={config} onChange={onChange} onOpenTray={onOpenTray} openTrayKey={openTrayKey} onOpenWallPicker={onOpenWallPicker} />
              </div>
            ))}
          </div>
        ) : (
          <PackagesTab
            selectedPackageId={selectedPackageId}
            customized={packageCustomized}
            onSelect={onApplyPackage}
            onCustomize={(pkg) => {
              onApplyPackage(pkg)
              setTab('customize')
            }}
          />
        )}
      </div>

      <RailFooter upgradeTotal={upgradeTotal(config)} />
    </aside>
  )
}
