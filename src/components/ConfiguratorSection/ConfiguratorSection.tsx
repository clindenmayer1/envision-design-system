/*
 * ConfiguratorSection — one rail section (Figma): a 24px-bold title followed by
 * its groups. Each group is either a card picker or a swatch grid, with a
 * 16px-bold sub-label.
 */
import OptionSwatch from '../OptionSwatch/OptionSwatch'
import OptionCard from '../OptionCard/OptionCard'
import { backsplashOptionsFor, wallColorLabel, wallColorHex, type Section } from '../../three/materials'
import { upgradeLabel } from '../../three/pricing'
import type { ConfigKey, KitchenConfig } from '../../types'
import './ConfiguratorSection.css'

interface Props {
  section: Section
  config: KitchenConfig
  onChange: (key: ConfigKey, id: string) => void
  /** Open the bottom tray for a tray-enabled card group (e.g. cabinet style). */
  onOpenTray?: (key: ConfigKey) => void
  /** Card whose tray is currently open → active outline. */
  openTrayKey?: ConfigKey | null
  /** Open the full Choose Wall Color picker (from the "+" chip in the wall-color row). */
  onOpenWallPicker?: () => void
}

export default function ConfiguratorSection({ section, config, onChange, onOpenTray, openTrayKey, onOpenWallPicker }: Props) {
  return (
    <section className="cfg-section">
      <h2 className="cfg-section__title">{section.title}</h2>
      {section.groups.map((group) => {
        const value = config[group.key]
        // Backsplash's 'matching-stone' preview is derived from the current countertop
        // (the backsplash is its child in that mode), so its card thumbnail tracks the
        // selected countertop instead of showing a fixed image.
        let options = group.key === 'backsplashStyle' ? backsplashOptionsFor(config.countertop) : group.options
        // Wall-color row: the curated colors hold their positions. Choosing one selects it where
        // it already sits, because a swatch that jumps to the front moves every other swatch under
        // the pointer and makes the row impossible to scan twice the same way.
        //
        // The one exception is a color chosen from the full picker that is NOT in the curated set:
        // it has nowhere to sit, so it prepends as tile #1, pushes the rest over, and drops the
        // last curated swatch. The row stays capped at 11, plus the "›" opener.
        if (group.key === 'wallColor') {
          const sel = config.wallColor
          const curated = options.some((o) => o.id === sel)
          options = curated
            ? options.slice(0, 11)
            : [{ id: sel, label: wallColorLabel(sel) ?? 'Custom', swatch: wallColorHex(sel) }, ...options].slice(0, 11)
        }
        // Swatch groups keep a label, but it shows the SELECTED swatch's name
        // (e.g. "Hale Navy"). Section H2s and card sublabels (Style/Material/etc.)
        // are intentionally omitted — the cards are self-describing.
        const heading = (group.key === 'wallColor' ? wallColorLabel(value) : options.find((o) => o.id === value)?.label) ?? group.label
        const priceLabel = upgradeLabel(group.key, value)
        return (
          <div className="cfg-group" key={group.key}>
            {group.kind !== 'card' && (
              <div className="cfg-group__header">
                <h3 className="cfg-group__label">{heading}</h3>
                <span className={`cfg-group__included${priceLabel !== 'Included' ? ' cfg-group__included--upgrade' : ''}`}>{priceLabel}</span>
              </div>
            )}
            {group.kind === 'card' ? (
              <OptionCard
                options={options}
                value={value}
                note={priceLabel}
                onChange={(id) => onChange(group.key, id)}
                onOpen={group.tray && onOpenTray ? () => onOpenTray(group.key) : undefined}
                active={openTrayKey === group.key}
              />
            ) : (
              <div className="cfg-group__swatches">
                {options.map((opt) => (
                  <OptionSwatch
                    key={opt.id}
                    option={opt}
                    selected={opt.id === value}
                    onSelect={(id) => onChange(group.key, id)}
                  />
                ))}
                {group.key === 'wallColor' && (
                  <button
                    type="button"
                    className="swatch swatch--more"
                    onClick={onOpenWallPicker}
                    title="Browse all colors"
                    aria-label="Browse all wall colors"
                  >
                    <span className="swatch__chip swatch__chip--more">
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
