/* Rail picker row — the production design-system component.
 *
 * <envision-option-card> gained a `media` slot, which is what this screen proved the system was
 * missing: the product renders a LIVE 3D preview (PullThumb) inside the thumbnail, which a
 * background-image API cannot express. The component owns row structure, button semantics, ring
 * states and tokens; the application supplies only the media it uniquely knows how to render.
 */
import { OptionCard as DSOptionCard } from '@envision/react'
import type { Option } from '../../types'
import PullThumb from '../PullThumb/PullThumb'

interface Props {
  options: Option[]
  value: string
  onChange: (id: string) => void
  /** When provided, clicking the card opens this (e.g. a tray) instead of cycling. */
  onOpen?: () => void
  /** True while this card's tray/overlay is open -> persistent active outline. */
  active?: boolean
  /** Subtitle override — the upgrade price label ("Included" / "+$1,200"). */
  note?: string
}

export default function OptionCard({ options, value, onChange, onOpen, active, note }: Props) {
  const idx = Math.max(0, options.findIndex((o) => o.id === value))
  const current = options[idx] ?? options[0]
  const advance = () => onChange(options[(idx + 1) % options.length].id)
  const isDoorLike = !!current.model && /\/doors\/|\/faucets\/|door/i.test(current.model)

  return (
    <DSOptionCard
      title={current.label}
      note={note ?? current.note ?? 'Included'}
      active={active}
      thumbShape={isDoorLike ? 'portrait' : 'square'}
      thumbImage={current.texture}
      thumbColor={current.swatch}
      onOpen={onOpen ?? advance}
    >
      {current.model && <div slot="media"><PullThumb url={current.model} /></div>}
    </DSOptionCard>
  )
}
