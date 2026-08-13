/* Shared product types for the Envision configurator (Figma-aligned). */

export type ApplianceMode = 'standalone' | 'panel-ready' | 'integrated'

/** Right-rail sections (matches the Figma source). */
export type SectionId =
  | 'cabinets' | 'hardware' | 'countertops' | 'backsplash'
  | 'flooring' | 'walls' | 'sink-faucet'

/** Every string-valued, selectable config field. Group.key is one of these. */
export type ConfigKey =
  | 'cabinetStyle' | 'cabinetFinish'
  | 'hardwareStyle' | 'hardwareFinish'
  | 'countertop'
  | 'backsplashStyle' | 'backsplash'
  | 'flooring' | 'wallColor'
  | 'sinkStyle' | 'faucetStyle' | 'faucetFinish'
  | 'applianceFinish' | 'lightingMood'

/** A selectable option (swatch or card). */
export interface Option {
  id: string
  label: string
  /** UI swatch / thumbnail color (hex). */
  swatch?: string
  /** UI swatch image (wood-grain thumbnail) — shown instead of the flat color. */
  texture?: string
  /** 3D model (GLB) for this option — used by hardware pulls (live isometric thumbnail + scene swap). */
  model?: string
  /** 3D material base color (hex), when wired. Falls back to swatch. */
  color?: string
  roughness?: number
  metalness?: number
  /** Card subtitle (defaults to "Included"). */
  note?: string
}

/** Full kitchen configuration — single source of truth in React state. */
export interface KitchenConfig {
  selectedCategory: SectionId
  cabinetStyle: string
  cabinetFinish: string
  hardwareStyle: string
  hardwareFinish: string
  countertop: string
  backsplashStyle: string
  backsplash: string
  flooring: string
  wallColor: string
  sinkStyle: string
  faucetStyle: string
  faucetFinish: string
  applianceMode: ApplianceMode
  applianceFinish: string
  lightingMood: string
}
