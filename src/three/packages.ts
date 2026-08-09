/*
 * Curated package collections — reusable, static definitions kept SEPARATE from the user's
 * live customization state. Each package is a coordinated set of existing material IDs (no new
 * materials invented). Applying a package merges its `config` into the live KitchenConfig via
 * the SAME selection path as manual customization (App.handleApplyPackage → setConfig).
 *
 * Thumbnails are real snapshots of the 3D model with the package applied, generated offline
 * (scripts/genPackageThumbs.mjs) into /public/packages/<id>.jpg and cached. `materialHash`
 * detects when a package's materials change so a thumbnail can be regenerated.
 */
import type { KitchenConfig } from '../types'
import {
  CABINET_FINISHES, COUNTERTOP_MATERIALS, BACKSPLASH_MATERIALS, FLOORING, METAL_FINISHES,
  WALL_COLORS, optionById,
} from './materials'

/** The material keys a package assigns (a subset of KitchenConfig). */
export type PackageConfig = Pick<
  KitchenConfig,
  | 'cabinetStyle' | 'cabinetFinish' | 'countertop' | 'backsplashStyle'
  | 'flooring' | 'hardwareStyle' | 'hardwareFinish' | 'faucetStyle' | 'faucetFinish' | 'wallColor'
>

export interface KitchenPackage {
  id: string
  name: string
  description: string
  /** Figma card price line. */
  price: string
  /** Shows a badge on the card. */
  popular?: boolean
  /** Badge label; defaults to "Popular" when `popular` is set. */
  badge?: string
  /** Coordinated material assignments (existing IDs only). */
  config: PackageConfig
}

export const PACKAGES: KitchenPackage[] = [
  {
    id: 'summit',
    name: 'Summit',
    description: 'White cabinets, Calacatta, and chrome.',
    price: 'Included',
    popular: true,
    config: {
      cabinetStyle: 'beadboard-shaker', cabinetFinish: 'white', countertop: 'calacatta',
      backsplashStyle: 'matching-stone', flooring: 'natural-oak', hardwareStyle: 'modern-bar-pull',
      hardwareFinish: 'silver', faucetFinish: 'silver', faucetStyle: 'high-arc-gooseneck',
      wallColor: 'pure-white',
    },
  },
  {
    id: 'heritage',
    name: 'Heritage',
    description: 'Taupe cabinets, Carrara marble, and brass.',
    price: '+$126/mo',
    popular: true,
    badge: 'Trending',
    config: {
      cabinetStyle: 'salerno-molded', cabinetFinish: 'revere-pewter', countertop: 'carrara3',
      backsplashStyle: 'subwayhorz', flooring: 'wood-chevron', hardwareStyle: 'whitman',
      hardwareFinish: 'brass', faucetFinish: 'brass', faucetStyle: 'st-claire',
      wallColor: 'white-wisp',
    },
  },
  {
    id: 'haven',
    name: 'Haven',
    description: 'Natural oak, warm stone, ivory tile.',
    price: '+$104/mo',
    config: {
      cabinetStyle: 'beadboard-shaker', cabinetFinish: 'warm-walnut', countertop: 'marble110',
      backsplashStyle: 'subwayvert', flooring: 'natural-oak', hardwareStyle: 'bennett',
      hardwareFinish: 'brushed-brass', faucetFinish: 'brushed-brass', faucetStyle: 'high-arc-gooseneck',
      wallColor: 'soft-greige',
    },
  },
  {
    id: 'monarch',
    name: 'Monarch',
    description: 'Navy cabinets, Calacatta marble, and brass.',
    price: '+$164/mo',
    popular: true,
    config: {
      cabinetStyle: 'recessed-panel', cabinetFinish: 'hale-navy', countertop: 'calacatta',
      backsplashStyle: 'matching-stone', flooring: 'white-oak', hardwareStyle: 'brixton',
      hardwareFinish: 'brass', faucetFinish: 'brass', faucetStyle: 'st-claire',
      wallColor: 'white-wisp',
    },
  },
  {
    id: 'foundry',
    name: 'Foundry',
    description: 'White cabinets, charcoal marble, matte black.',
    price: '+$142/mo',
    config: {
      cabinetStyle: 'recessed-panel', cabinetFinish: 'white', countertop: 'marble108',
      backsplashStyle: 'stonecharcoal', flooring: 'checkerboard', hardwareStyle: 'emerson',
      hardwareFinish: 'matte-black', faucetFinish: 'matte-black', faucetStyle: 'square-gooseneck',
      wallColor: 'soft-greige',
    },
  },
  {
    id: 'canvas',
    name: 'Canvas',
    description: 'Gray cabinets, white quartz, and nickel.',
    price: '+$92/mo',
    config: {
      cabinetStyle: 'beadboard-shaker', cabinetFinish: 'stonington-gray', countertop: 'whitequartz',
      backsplashStyle: 'longwhite', flooring: 'white-oak', hardwareStyle: 'bennett',
      hardwareFinish: 'steel', faucetFinish: 'steel', faucetStyle: 'high-arc-gooseneck',
      wallColor: 'white-wisp',
    },
  },
  {
    id: 'lumen',
    name: 'Lumen',
    description: 'White cabinets, marble, and warm brass.',
    price: '+$110/mo',
    config: {
      cabinetStyle: 'raised-panel', cabinetFinish: 'white', countertop: 'whitemarble4',
      backsplashStyle: 'matching-stone', flooring: 'blonde-wood', hardwareStyle: 'larkin',
      hardwareFinish: 'brushed-brass', faucetFinish: 'brushed-brass', faucetStyle: 'high-arc-gooseneck',
      wallColor: 'pure-white',
    },
  },
  {
    id: 'oak-stone',
    name: 'Sienna',
    description: 'Natural oak, travertine, and soft brass.',
    price: '+$114/mo',
    config: {
      cabinetStyle: 'beadboard-shaker', cabinetFinish: 'smoked-walnut', countertop: 'travertine',
      backsplashStyle: 'matching-stone', flooring: 'terracotta-hex', hardwareStyle: 'mercer',
      hardwareFinish: 'brushed-brass', faucetFinish: 'brushed-brass', faucetStyle: 'high-arc-gooseneck',
      wallColor: 'soft-greige',
    },
  },
  {
    id: 'modern-prairie',
    name: 'Meadow',
    description: 'Sage cabinets, Calacatta, fluted clay.',
    price: '+$120/mo',
    config: {
      cabinetStyle: 'recessed-panel', cabinetFinish: 'saybrook-sage', countertop: 'calacatta',
      backsplashStyle: 'fluted', flooring: 'warm-walnut', hardwareStyle: 'klein',
      hardwareFinish: 'matte-black', faucetFinish: 'matte-black', faucetStyle: 'square-gooseneck',
      wallColor: 'light-beige',
    },
  },
  {
    id: 'coastal',
    name: 'Coastal',
    description: 'Light oak, Carrara marble, and nickel.',
    price: '+$98/mo',
    config: {
      cabinetStyle: 'beadboard-shaker', cabinetFinish: 'white', countertop: 'carrara3',
      backsplashStyle: 'blue', flooring: 'white-oak', hardwareStyle: 'rowan',
      hardwareFinish: 'steel', faucetFinish: 'steel', faucetStyle: 'high-arc-gooseneck',
      wallColor: 'white-wisp',
    },
  },
]

/** A visual swatch preview — a real material texture image, or a flat colour fallback. */
export interface PackageSwatch {
  texture?: string
  color?: string
}

/**
 * The card swatch previews for a package, in the fixed order:
 * cabinet finish → countertop → backsplash → flooring → metal finish → wall color.
 * Each maps to the real option's texture (preferred) or swatch colour. No arbitrary colours.
 */
export function packageSwatches(pkg: KitchenPackage): PackageSwatch[] {
  const c = pkg.config
  const lookups: Array<[typeof CABINET_FINISHES, string]> = [
    [CABINET_FINISHES, c.cabinetFinish],
    [COUNTERTOP_MATERIALS, c.countertop],
    [BACKSPLASH_MATERIALS, c.backsplashStyle],
    [FLOORING, c.flooring],
    [METAL_FINISHES, c.hardwareFinish],
    [WALL_COLORS, c.wallColor],
  ]
  return lookups.map(([list, id]) => {
    const o = optionById(list, id)
    return { texture: o?.texture, color: o?.swatch ?? o?.color }
  })
}

/** Stable hash of a package's material assignment — used to invalidate a cached thumbnail
 *  (and to know when it needs regenerating) whenever the materials change. */
export function packageMaterialHash(pkg: KitchenPackage): string {
  const c = pkg.config
  const parts = [c.cabinetStyle, c.cabinetFinish, c.countertop, c.backsplashStyle, c.flooring, c.hardwareStyle, c.hardwareFinish, c.faucetStyle, c.faucetFinish, c.wallColor]
  let h = 0
  const s = parts.join('|')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/** Runtime thumbnail URL for a package (cache-busted by material hash). */
export function packageThumbUrl(pkg: KitchenPackage): string {
  return `/packages/${pkg.id}.jpg?v=${packageMaterialHash(pkg)}`
}

export function packageById(id: string | null): KitchenPackage | undefined {
  return id ? PACKAGES.find((p) => p.id === id) : undefined
}
