/* A single 64px swatch chip + label (Figma: bordered chip, selected badge). */
import { useEffect, useState } from 'react'
import type { Option } from '../../types'
import { isMetalFinish, getMetalSwatch, peekMetalSwatch } from './metalSwatchRenderer'
import './OptionSwatch.css'

interface Props {
  option: Option
  selected: boolean
  onSelect: (id: string) => void
}

export default function OptionSwatch({ option, selected, onSelect }: Props) {
  // Hardware finishes render as a real reflective sphere (offscreen, cached by id) instead of
  // a flat baked tile. Everything else keeps the flat colour / veneer-thumbnail chip.
  const isMetal = isMetalFinish(option.id)
  const [sphere, setSphere] = useState<string | undefined>(() => (isMetal ? peekMetalSwatch(option.id) : undefined))
  useEffect(() => {
    if (!isMetal) return
    let cancelled = false
    setSphere(peekMetalSwatch(option.id))
    getMetalSwatch(option.id).then((d) => { if (!cancelled) setSphere(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [isMetal, option.id])

  return (
    <button
      type="button"
      className={`swatch${isMetal ? ' swatch--sphere' : ''}`}
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      title={option.label}
    >
      {/* Selected/hover state is the same dark outline-ring as the tray tiles (no checkmark),
          driven by aria-pressed in CSS. Metal finishes show a rendered sphere; wood finishes
          show their veneer thumbnail; the rest show a flat colour. */}
      <span
        className="swatch__chip"
        style={
          isMetal
            ? sphere
              ? { backgroundImage: `url(${sphere})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
              : undefined
            : option.texture
              ? { backgroundImage: `url(${option.texture})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: option.swatch ?? option.color ?? '#ccc' }
        }
      />
    </button>
  )
}
