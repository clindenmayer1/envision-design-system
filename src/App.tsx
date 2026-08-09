/*
 * App — single source of truth for the kitchen configuration. All fields flow
 * down to the rail (controls) and the canvas (3D). Upper/Lower cabinet finishes
 * are wired to the named SketchUp objects; other categories update state and
 * are ready to wire the same way.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Layout from './components/Layout/Layout'
import SceneCanvas from './components/SceneCanvas/SceneCanvas'
import RightRail from './components/RightRail/RightRail'
import ViewSwitcher from './components/ViewSwitcher/ViewSwitcher'
import RoomSelector from './components/RoomSelector/RoomSelector'
import Overview from './components/Overview/Overview'
import type { Tab } from './components/TopBar/TopBar'
import PoseReadout from './components/PoseReadout/PoseReadout'
import StudioPanel from './components/StudioPanel/StudioPanel'
import CabinetStyleTray from './components/CabinetStyleTray/CabinetStyleTray'
import WallColorModal from './components/WallColorModal/WallColorModal'
import { CABINET_STYLES, COUNTERTOP_MATERIALS, HARDWARE_STYLES, FAUCET_STYLES, backsplashOptionsFor } from './three/materials'
import { loadStoredLighting, saveStoredLighting, type LightingState } from './three/lighting'
import type { ViewName } from './three/KitchenScene'
import { PACKAGES, packageById, type KitchenPackage } from './three/packages'
import type { ConfigKey, KitchenConfig, SectionId } from './types'
import './styles/global.css'

const INITIAL_CONFIG: KitchenConfig = {
  selectedCategory: 'cabinets',
  cabinetStyle: 'beadboard-shaker',
  cabinetFinish: 'white',
  hardwareStyle: 'modern-bar-pull',
  hardwareFinish: 'silver',
  countertop: 'calacatta',
  backsplashStyle: 'matching-stone',
  backsplash: 'gloss-white',
  flooring: 'natural-oak',
  wallColor: 'pure-white',
  sinkStyle: 'single-bowl-undermount',
  faucetStyle: 'high-arc-gooseneck',
  faucetFinish: 'silver',
  applianceMode: 'panel-ready',
  applianceFinish: 'panel-match',
  lightingMood: 'daylight',
}

export default function App() {
  const [config, setConfig] = useState<KitchenConfig>(INITIAL_CONFIG)
  const [activeView, setActiveView] = useState<ViewName>('View 1')
  // Bumped on EVERY view-button click (even the already-active one) so the camera
  // re-snaps to that view's default pose after the user has orbited/zoomed away.
  const [viewNonce, setViewNonce] = useState(0)
  const handleView = useCallback((view: ViewName) => {
    setActiveView(view)
    setViewNonce((n) => n + 1)
  }, [])
  // Live lighting state — edited by the StudioPanel and consumed by the scene's
  // LightingRig. Loads any previously-saved setup on boot, and auto-persists every
  // change to localStorage so tuning survives refreshes.
  const [lighting, setLighting] = useState<LightingState>(loadStoredLighting)
  useEffect(() => {
    saveStoredLighting(lighting)
  }, [lighting])
  const updateLight = useCallback(
    (key: keyof LightingState, value: number | boolean | string) =>
      setLighting((prev) => ({ ...prev, [key]: value })),
    [],
  )
  // Lighting controller opens via the on-screen button (or auto-opens with
  // ?studio=1). studioOpen also drives light-helper visibility in the scene.
  const initialStudio = useMemo(() => new URLSearchParams(window.location.search).get('studio') === '1', [])
  const [studioOpen, setStudioOpen] = useState(initialStudio)

  // Bottom trays — opened by clicking a tray-enabled cell (cabinet style, countertop, backsplash).
  const [cabinetTrayOpen, setCabinetTrayOpen] = useState(false)
  const [countertopTrayOpen, setCountertopTrayOpen] = useState(false)
  const [backsplashTrayOpen, setBacksplashTrayOpen] = useState(false)
  const [hardwareTrayOpen, setHardwareTrayOpen] = useState(false)
  const [faucetTrayOpen, setFaucetTrayOpen] = useState(false)
  // The full Choose Wall Color picker (opened by the "+" chip in the wall-colour row).
  const [wallPickerOpen, setWallPickerOpen] = useState(false)
  // The wall colour in effect when the picker opened — restored if the user cancels/closes
  // without confirming (swatch clicks live-preview on the model; the CTA commits).
  const wallColorBeforePicker = useRef(config.wallColor)
  const openWallPicker = useCallback(() => {
    setConfig((prev) => { wallColorBeforePicker.current = prev.wallColor; return prev })
    setWallPickerOpen(true)
  }, [])
  const handleOpenTray = useCallback((key: ConfigKey) => {
    // Only one tray open at a time — opening one dismisses any other.
    setCabinetTrayOpen(key === 'cabinetStyle')
    setCountertopTrayOpen(key === 'countertop')
    setBacksplashTrayOpen(key === 'backsplashStyle')
    setHardwareTrayOpen(key === 'hardwareStyle')
    setFaucetTrayOpen(key === 'faucetStyle')
  }, [])

  // Which card's tray is currently open — that card shows the active (#999988) outline.
  const openTrayKey: ConfigKey | null = cabinetTrayOpen
    ? 'cabinetStyle'
    : countertopTrayOpen
      ? 'countertop'
      : backsplashTrayOpen
        ? 'backsplashStyle'
        : hardwareTrayOpen
          ? 'hardwareStyle'
          : faucetTrayOpen
            ? 'faucetStyle'
            : null

  // Active top-nav tab. 'Overview' shows the dashboard; everything else shows the
  // Design Center configurator (only Overview + Design Center have real views for now).
  const [tab, setTab] = useState<Tab>('Overview')

  // Curated-package state. selectedPackageId is the applied package; it PERSISTS when the
  // user then tweaks individual materials in Customize (the live kitchen becomes a customized
  // variation, the package definition is never rewritten).
  // Summit mirrors the default kitchen config, so it's the selected package on load.
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('summit')

  const handleChange = useCallback((key: ConfigKey, id: string) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: id }
      // Hardware and faucet share the same metal-finish set — keep them matched:
      // changing one updates the other so the kitchen reads as one cohesive finish.
      if (key === 'hardwareFinish') next.faucetFinish = id
      else if (key === 'faucetFinish') next.hardwareFinish = id
      return next
    })
  }, [])

  // Apply a package: merge its full material config into the live model via the same state
  // path as manual customization, and mark it selected. Does not switch tabs by itself.
  const handleApplyPackage = useCallback((pkg: KitchenPackage) => {
    setConfig((prev) => ({ ...prev, ...pkg.config }))
    setSelectedPackageId(pkg.id)
  }, [])

  // The applied package has been individually modified when the live config diverges from
  // the package's defined materials.
  const packageCustomized = useMemo(() => {
    const pkg = packageById(selectedPackageId)
    if (!pkg) return false
    return (Object.keys(pkg.config) as Array<keyof typeof pkg.config>).some((k) => config[k] !== pkg.config[k])
  }, [selectedPackageId, config])

  // Dev/init hook used by the offline package-thumbnail generator to drive the same
  // configuration path (no separate apply system). Harmless in normal use.
  useEffect(() => {
    const w = window as unknown as { __setKitchenConfig?: (p: Partial<KitchenConfig>) => void; __PACKAGES?: unknown }
    w.__setKitchenConfig = (partial) => setConfig((prev) => ({ ...prev, ...partial }))
    w.__PACKAGES = PACKAGES
  }, [])

  const handleSectionFocus = useCallback((id: SectionId) => {
    setConfig((prev) => (prev.selectedCategory === id ? prev : { ...prev, selectedCategory: id }))
  }, [])

  return (
    <>
      <Layout
        canvas={<SceneCanvas config={config} activeView={activeView} viewNonce={viewNonce} lighting={lighting} studio={studioOpen} countertopOpen={countertopTrayOpen} backsplashOpen={backsplashTrayOpen} hardwareOpen={hardwareTrayOpen} faucetOpen={faucetTrayOpen} active={tab !== 'Overview'} />}
        rail={<RightRail config={config} onChange={handleChange} onSectionFocus={handleSectionFocus} onOpenTray={handleOpenTray} openTrayKey={openTrayKey} selectedPackageId={selectedPackageId} packageCustomized={packageCustomized} onApplyPackage={handleApplyPackage} onOpenWallPicker={openWallPicker} />}
        debug={<ViewSwitcher active={activeView} onChange={handleView} />}
        roomNav={<RoomSelector />}
        activeTab={tab}
        onTabChange={setTab}
        overview={<Overview onGoToDesign={() => setTab('Design Center')} active={tab === 'Overview'} />}
        canvasOverlay={
          <>
            <CabinetStyleTray
              open={cabinetTrayOpen}
              title="Cabinet Style"
              options={CABINET_STYLES}
              value={config.cabinetStyle}
              priceKey="cabinetStyle"
              onSelect={(id) => handleChange('cabinetStyle', id)}
              onClose={() => setCabinetTrayOpen(false)}
            />
            <CabinetStyleTray
              open={countertopTrayOpen}
              title="Countertop Materials"
              square
              options={COUNTERTOP_MATERIALS}
              value={config.countertop}
              priceKey="countertop"
              onSelect={(id) => handleChange('countertop', id)}
              onClose={() => setCountertopTrayOpen(false)}
            />
            <CabinetStyleTray
              open={backsplashTrayOpen}
              title="Backsplash Materials"
              square
              options={backsplashOptionsFor(config.countertop)}
              value={config.backsplashStyle}
              priceKey="backsplashStyle"
              onSelect={(id) => handleChange('backsplashStyle', id)}
              onClose={() => setBacksplashTrayOpen(false)}
            />
            <CabinetStyleTray
              open={hardwareTrayOpen}
              title="Cabinet Hardware"
              square
              options={HARDWARE_STYLES}
              value={config.hardwareStyle}
              priceKey="hardwareStyle"
              onSelect={(id) => handleChange('hardwareStyle', id)}
              onClose={() => setHardwareTrayOpen(false)}
            />
            <CabinetStyleTray
              open={faucetTrayOpen}
              title="Faucet Style"
              options={FAUCET_STYLES}
              value={config.faucetStyle}
              priceKey="faucetStyle"
              onSelect={(id) => handleChange('faucetStyle', id)}
              onClose={() => setFaucetTrayOpen(false)}
            />
            {wallPickerOpen && (
              <WallColorModal
                current={config.wallColor}
                onPreview={(id) => handleChange('wallColor', id)}
                onClose={() => { handleChange('wallColor', wallColorBeforePicker.current); setWallPickerOpen(false) }}
                onSelect={(id) => { handleChange('wallColor', id); setWallPickerOpen(false) }}
              />
            )}
          </>
        }
      />
      {/* Design-Center-only overlays — hidden on the Overview dashboard. */}
      {tab !== 'Overview' && (
        <>
          <PoseReadout />
          {/* Lighting Studio button hidden for now (2026-07-16). The panel is still reachable via
              the ?studio=1 URL param if needed; flip this back to `!studioOpen` to restore it. */}
          {false && (
            <button type="button" className="studio-toggle" onClick={() => setStudioOpen(true)}>
              💡 Lighting Studio
            </button>
          )}
          <StudioPanel
            visible={studioOpen}
            config={lighting}
            onChange={updateLight}
            onReplace={setLighting}
            onClose={() => setStudioOpen(false)}
          />
        </>
      )}
    </>
  )
}
