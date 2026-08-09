/*
 * Material upgrade pricing. Each category has a base "Included" option (the default kitchen
 * config = $0); premium materials add an upgrade cost. Values are best-judgement estimates
 * (standard vs. designer vs. premium tiers) meant to read realistically, easy to tune here.
 *
 * Anything NOT listed for a category is Included ($0). The running total (RailFooter) counts
 * each priced category once — faucetFinish mirrors hardwareFinish (synced), so it's excluded.
 */
import type { ConfigKey, KitchenConfig } from '../types'

export const UPGRADE_PRICES: Partial<Record<ConfigKey, Record<string, number>>> = {
  // Door style — Classic Shaker is standard; profiled/glass doors upgrade.
  cabinetStyle: {
    'raised-panel': 650,
    'recessed-panel': 900,
    'salerno-molded': 1200,
    'glass-upper-doors': 1450,
    'thorsen-glass-uppers': 1650,
  },
  // Finish — painted neutrals included; deep specialty paints modest; real wood veneers premium.
  cabinetFinish: {
    'hale-navy': 400,
    'kendall-charcoal': 400,
    black: 400,
    'natural-oak': 1900,
    'white-oak': 1900,
    'warm-walnut': 2600,
    'smoked-walnut': 2600,
    'warm-maple': 2600,
  },
  // Countertop — Calacatta included; other marbles/travertine modest; quartzite/bold marble premium.
  countertop: {
    carrara3: 450,
    whitemarble4: 550,
    marble110: 650,
    marble020: 700,
    marble012: 700,
    romanobeige: 500,
    romanogrey: 500,
    travertine: 500,
    whitequartz: 900,
    marble15: 1200,
    marble108: 1400,
    marble016: 1600,
    statuario: 1900,
    polarwhite: 1600,
    medgrey: 1700,
    grey5: 1700,
    monaco: 1700,
  },
  // Backsplash — matching stone slab included; tile adds labor/material.
  backsplashStyle: {
    subwayvert: 450,
    subwayhorz: 450,
    longwhite: 450,
    longgray: 450,
    whitechevron: 550,
    chevron: 550,
    whitewoven: 550,
    concrete: 500,
    stonecharcoal: 600,
    whiteherringbone: 600,
    blackherringbone: 600,
    fluted: 750,
    stackedterracotta: 750,
    green: 800,
    blue: 800,
    bluegreenhex: 800,
  },
  // Flooring — Natural Oak included; oak/pine a modest step up; walnut is premium hardwood.
  flooring: {
    'white-oak': 900,
    'blonde-wood': 900,
    'dark-pine': 900,
    'warm-walnut': 1500,
    'smoked-walnut': 1500,
    'wood-chevron': 1800,
    'stone-tile': 1200,
    'concrete-floor': 1200,
    'charcoal-tile': 1200,
    checkerboard: 1400,
    'terracotta-hex': 1400,
  },
  // Hardware pulls — Modern Bar included; designer pulls a small upgrade.
  hardwareStyle: {
    bennett: 180,
    rowan: 180,
    alden: 180,
    mercer: 180,
    larkin: 180,
    warren: 180,
    camden: 180,
    emerson: 220,
    klein: 220,
    whitman: 220,
    brixton: 260,
  },
  // Metal finish — chrome & brushed nickel included; specialty finishes upgrade.
  hardwareFinish: {
    'matte-black': 200,
    'brushed-brass': 300,
    brass: 300,
    copper: 400,
  },
  // Faucet — High-Arc Gooseneck included; other styles upgrade.
  faucetStyle: {
    'single-handle-pulldown': 250,
    'square-gooseneck': 300,
    'modern-tap': 300,
    'essa-pulldown': 350,
    'st-claire': 450,
  },
}

/** Upgrade price (USD) for a given option in a category; 0 = Included. */
export function optionUpgrade(key: ConfigKey, id: string): number {
  return UPGRADE_PRICES[key]?.[id] ?? 0
}

/** "Included" or "+$1,200" for a category's option. */
export function upgradeLabel(key: ConfigKey, id: string): string {
  const p = optionUpgrade(key, id)
  return p > 0 ? `+$${p.toLocaleString('en-US')}` : 'Included'
}

// Categories that contribute to the running total. faucetFinish mirrors hardwareFinish
// (kept in sync), so it's excluded to avoid double-counting the one metal-finish choice.
const PRICED_KEYS: ConfigKey[] = [
  'cabinetStyle', 'cabinetFinish', 'countertop', 'backsplashStyle',
  'flooring', 'hardwareStyle', 'hardwareFinish', 'faucetStyle',
]

/** Sum of all selected upgrades for the current configuration. */
export function upgradeTotal(config: KitchenConfig): number {
  return PRICED_KEYS.reduce((sum, k) => sum + optionUpgrade(k, config[k] as string), 0)
}
