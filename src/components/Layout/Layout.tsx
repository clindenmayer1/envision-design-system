/* App shell: top bar, then either the Overview page or a row of [main canvas | right rail].
 *
 * Once the Design Center row has been opened it stays MOUNTED (just hidden while on Overview),
 * so returning to it never remounts/rebuilds the 3D scene — no blank canvas, instant display.
 * It's mounted lazily (on first non-Overview tab) so the heavy model isn't downloaded until
 * the user actually visits the Design Center. */
import { useEffect, useState, type ReactNode } from 'react'
import TopBar, { type Tab } from '../TopBar/TopBar'
import './Layout.css'

interface Props {
  canvas: ReactNode
  rail: ReactNode
  debug?: ReactNode
  /** Top-left canvas control (e.g. the room selector). */
  roomNav?: ReactNode
  /** Overlays rendered inside the 3D canvas panel (e.g. the cabinet-style tray). */
  canvasOverlay?: ReactNode
  /** Active nav tab + handler (drives which body renders). */
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  /** The Overview page, rendered when the Overview tab is active. */
  overview: ReactNode
}

export default function Layout({ canvas, rail, debug, roomNav, canvasOverlay, activeTab, onTabChange, overview }: Props) {
  const isOverview = activeTab === 'Overview'
  // Keep the Design Center row alive once it's been shown (see file header).
  const [rowMounted, setRowMounted] = useState(!isOverview)
  useEffect(() => {
    if (!isOverview) setRowMounted(true)
  }, [isOverview])

  return (
    <div className="layout">
      <TopBar active={activeTab} onChange={onTabChange} />

      <div className="layout__body">
        {/* The Design Center row stays MOUNTED AND FULL-SIZE once shown — it is NEVER
            display:none'd. display:none collapses the WebGL canvas to 0×0 and drops its GPU
            context/buffers; returning then re-uploads the whole ~18MB scene in one blocking
            frame (~1.6s freeze). Instead the Overview is drawn as an opaque overlay ON TOP,
            so the canvas keeps its size + context and switching back is instant. */}
        {rowMounted && (
          <div className="layout__row" aria-hidden={isOverview}>
            <main className="layout__canvas">
              {canvas}
              {roomNav && <div className="layout__roomnav">{roomNav}</div>}
              {debug && <div className="layout__debug">{debug}</div>}
              {canvasOverlay}
            </main>
            {rail}
          </div>
        )}

        {/* Overview overlays the row when active; stays mounted (its hero <video> is paused
            while hidden) so returning to it never re-fetches/re-decodes the mp4. */}
        <div className="layout__overview" style={isOverview ? undefined : { display: 'none' }} aria-hidden={!isOverview}>
          {overview}
        </div>
      </div>
    </div>
  )
}
