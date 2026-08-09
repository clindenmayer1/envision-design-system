/*
 * Temporary targeting debug panel — live target-set counts from the name-based
 * targeting module. Collapsed by default so it stays out of the way during review.
 */
import { useState } from 'react'
import type { TargetCounts } from '../../three/KitchenScene'
import type { ApplianceMode } from '../../types'
import './DebugTargetsPanel.css'

const ORDER: (keyof TargetCounts)[] = [
  'cabinet_style', 'cabinet_body', 'hardware', 'appliance', 'countertop',
  'backsplash', 'floor', 'walls', 'ceiling', 'windows', 'plumbing', 'trim', 'island',
]

interface Props {
  counts: TargetCounts | null
  applianceMode: ApplianceMode
}

export default function DebugTargetsPanel({ counts, applianceMode }: Props) {
  const [open, setOpen] = useState(false)
  const total = counts ? Object.values(counts).reduce((a, b) => a + (b ?? 0), 0) : 0

  return (
    <div className={`debug${open ? '' : ' debug--collapsed'}`}>
      <button type="button" className="debug__bar" onClick={() => setOpen((o) => !o)}>
        <span className="debug__title">Targeting</span>
        <span className="debug__meta">{counts ? `${total} nodes` : '…'} {open ? '▾' : '▸'}</span>
      </button>
      {open && counts && (
        <div className="debug__body">
          <div className="debug__mode">applianceMode: <b>{applianceMode}</b></div>
          <ul className="debug__list">
            {ORDER.map((k) => (
              <li key={k} className="debug__row">
                <span className="debug__key">{k}</span>
                <span className="debug__val">{counts[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
