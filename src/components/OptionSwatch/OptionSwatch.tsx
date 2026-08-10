/* Material swatch — now the production design-system component.
 *
 * The bespoke implementation is gone. <envision-material-swatch> gained the capabilities this
 * screen proved were needed: fluid sizing so it fills the rail/tray grid cell, a circular shape
 * for rendered metal spheres, and ring-only selection (the product deliberately shows no check).
 * Only the sphere-rendering side effect stays here, because that is product rendering logic.
 */
import { useEffect, useState } from 'react'
import { MaterialSwatch } from '@envision/react'
import type { Option } from '../../types'
import { isMetalFinish, getMetalSwatch, peekMetalSwatch } from './metalSwatchRenderer'

interface Props {
  option: Option
  selected: boolean
  onSelect: (id: string) => void
}

export default function OptionSwatch({ option, selected, onSelect }: Props) {
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
    <MaterialSwatch
      fluid
      hideCheck
      shape={isMetal ? 'circle' : 'square'}
      name={option.label}
      image={isMetal ? sphere : option.texture}
      color={option.swatch ?? option.color}
      selected={selected}
      onSelect={() => onSelect(option.id)}
    />
  )
}
