/*
 * TopBar — white nav bar: WESTLAKE HOMES wordmark left, centered menu, and
 * notifications bell (with badge) + account avatar + chevron on the right.
 * (Matches the Figma "NavBar" design.)
 */
import './TopBar.css'

export const MENU = ['Overview', 'Design Center', 'My Selections', 'Build Progress', 'Financing'] as const
export type Tab = (typeof MENU)[number]

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export default function TopBar({ active, onChange }: Props) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__brand-name">WESTLAKE</span>
        <span className="topbar__brand-sub">— HOMES —</span>
      </div>

      <nav className="topbar__menu" aria-label="Primary">
        {MENU.map((label) => (
          <button
            key={label}
            type="button"
            className={`topbar__link${active === label ? ' topbar__link--active' : ''}`}
            aria-current={active === label ? 'page' : undefined}
            onClick={() => onChange(label)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="topbar__right">
        <button type="button" className="topbar__bell" aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="topbar__badge" role="status" aria-label="2 notifications">2</span>
        </button>
        <button type="button" className="topbar__account" aria-label="Account">
          <span className="topbar__avatar">TJ</span>
          <svg className="topbar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  )
}
