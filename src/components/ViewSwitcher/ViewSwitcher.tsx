/* Camera view switcher — a single rounded container: a "View" label followed by
 * numbered segments (1 2 3), with the active view highlighted. */
import { VIEW_NAMES, type ViewName } from '../../three/KitchenScene'
import './ViewSwitcher.css'

interface Props {
  active: ViewName
  onChange: (view: ViewName) => void
}

export default function ViewSwitcher({ active, onChange }: Props) {
  return (
    <div className="viewswitch" role="group" aria-label="Camera view">
      <span className="viewswitch__label">View</span>
      {VIEW_NAMES.map((name, i) => (
        <button
          key={name}
          type="button"
          className={`viewswitch__num${active === name ? ' viewswitch__num--active' : ''}`}
          aria-pressed={active === name}
          aria-label={name}
          onClick={() => onChange(name)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}
