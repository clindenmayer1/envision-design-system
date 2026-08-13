/*
 * Option catalogs + the right-rail section model — mirrors the Figma source.
 * Colors taken directly from the Figma design context (swatch fills).
 */
import type { ConfigKey, Option, SectionId } from '../types'
import { wallLibraryById } from '../data/wallColorLibrary'

// ---- Cabinet finishes (Upper + Lower share this palette) -------------------
export const CABINET_FINISHES: Option[] = [
  { id: 'white', label: 'White', swatch: '#f6f4f0' },
  { id: 'stonington-gray', label: 'Stonington Gray', swatch: '#d7d8d6' },
  { id: 'revere-pewter', label: 'Warm Taupe', swatch: '#cbc2b3' },
  { id: 'saybrook-sage', label: 'Saybrook Sage', swatch: '#9da391' },
  { id: 'hale-navy', label: 'Hale Navy', swatch: '#2e3a4a' },
  { id: 'kendall-charcoal', label: 'Kendall Charcoal', swatch: '#52544f' },
  { id: 'black', label: 'Black', swatch: '#1b1b1b' },
  { id: 'natural-oak', label: 'Natural Oak', swatch: '#c9a876', texture: '/textures/oak/oak_thumb.jpg' },
  { id: 'white-oak', label: 'White Oak', swatch: '#d8c09a', texture: '/textures/oak/oak_white_thumb.jpg' },
  { id: 'warm-walnut', label: 'Warm Walnut', swatch: '#8a5e3b', texture: '/textures/walnut/walnut_thumb.jpg' },
  { id: 'smoked-walnut', label: 'Smoked Walnut', swatch: '#4a3528', texture: '/textures/walnut/walnut_smoked_thumb.jpg' },
  { id: 'warm-maple', label: 'Warm Maple', swatch: '#6b5446', texture: '/textures/maple/maple_thumb.jpg' },
]

// Textured PBR metal finishes — each maps to /textures/metals/<id>/ (color/metal/rough/normal),
// applied to the hardware pulls in KitchenScene. swatch image = the metal preview thumbnail.
// roughness here is the FALLBACK for finishes that ship no roughness map (brass).
// Swatch image = a pre-baked reflective, beveled rounded-tile render of the finish (see
// public/textures/metals/<id>/tile.png) — reads like real polished/brushed metal in the chip.
export const METAL_FINISHES: Option[] = [
  { id: 'silver', label: 'Chrome', texture: '/textures/metals/silver/tile.png', metalness: 1, roughness: 0.4 },
  { id: 'steel', label: 'Brushed Nickel', texture: '/textures/metals/steel/tile.png', metalness: 1, roughness: 0.5 },
  { id: 'brushed-brass', label: 'Soft Gold', texture: '/textures/metals/brushed-brass/tile.png', metalness: 1, roughness: 0.45 },
  { id: 'brass', label: 'Brushed Brass', texture: '/textures/metals/brass/tile.png', metalness: 1, roughness: 0.4 },
  { id: 'copper', label: 'Copper', texture: '/textures/metals/copper/tile.png', metalness: 1, roughness: 0.5 },
  { id: 'matte-black', label: 'Matte Black', texture: '/textures/metals/matte-black/tile.png', metalness: 0.25, roughness: 0.72 },
]

export const BACKSPLASH_FINISHES: Option[] = [
  { id: 'gloss-white', label: 'Gloss White', swatch: '#f2f0ea' },
  { id: 'warm-white', label: 'Warm White', swatch: '#eae5da' },
  { id: 'greige', label: 'Greige', swatch: '#ddd6c8' },
  { id: 'sage', label: 'Sage', swatch: '#cbd2bf' },
  { id: 'textured-stone', label: 'Textured Stone', swatch: '#edeae2' },
]

// Flooring = the four cabinet wood tones (ids match WOOD_FINISHES so the floor recolor
// reuses woodFinishTone). Each option shows the veneer thumbnail.
export const FLOORING: Option[] = [
  // Woods grouped together, lightest → darkest …
  { id: 'blonde-wood', label: 'Blonde Wood', swatch: '#dcc69a', texture: '/textures/floor/blondewood_thumb.jpg' },
  { id: 'white-oak', label: 'White Oak', swatch: '#a89888', texture: '/textures/oak/oak_white_thumb.jpg' },
  { id: 'natural-oak', label: 'Natural Oak', swatch: '#99856f', texture: '/textures/oak/oak_thumb.jpg' },
  { id: 'warm-walnut', label: 'Warm Walnut', swatch: '#654337', texture: '/textures/walnut/walnut_thumb.jpg' },
  { id: 'smoked-walnut', label: 'Smoked Walnut', swatch: '#50403a', texture: '/textures/walnut/walnut_smoked_thumb.jpg' },
  { id: 'dark-pine', label: 'Dark Pine', swatch: '#4a352a', texture: '/textures/floor/darkpine_thumb.jpg' },
  { id: 'wood-chevron', label: 'Wood Chevron', swatch: '#8a6243', texture: '/textures/floor/woodchevron_thumb.jpg' },
  // … then the non-wood floors. Unlike the wood tones (which only retint a shared plank
  // map), these swap the floor's actual texture map in KitchenScene.
  { id: 'stone-tile', label: 'Stone Tile', swatch: '#bdb6a8', texture: '/textures/floor/stone006_thumb.jpg' },
  { id: 'concrete-floor', label: 'Polished Concrete', swatch: '#7e7d78', texture: '/textures/floor/concrete_thumb.jpg' },
  { id: 'checkerboard', label: 'Checkerboard Tile', swatch: '#8f8d8a', texture: '/textures/floor/checker_thumb.jpg' },
  { id: 'charcoal-tile', label: 'Charcoal Tile', swatch: '#333334', texture: '/textures/floor/charcoaltile_thumb.jpg' },
  { id: 'terracotta-hex', label: 'Terracotta Hexagon Tile', swatch: '#b06a4f', texture: '/textures/floor/terracottahex_thumb.jpg' },
]

// The curated wall colors shown as chips in the rail. The 12th chip in the UI is a "+" that
// opens the full Choose Wall Color picker (see WALL_COLOR_LIBRARY). The original five ids are
// kept (packages reference them); six real Benjamin Moore neutrals round the row out to eleven.
export const WALL_COLORS: Option[] = [
  { id: 'pure-white', label: 'Pure White', swatch: '#f6f4ef' },
  { id: 'white-wisp', label: 'White Wisp', swatch: '#e9e7df' },
  { id: 'soft-greige', label: 'Soft Greige', swatch: '#dad2c4' },
  { id: 'light-beige', label: 'Light Beige', swatch: '#d8cbb6' },
  { id: 'pale-sage', label: 'Pale Sage', swatch: '#cdd3c4' },
  { id: 'chantilly-lace', label: 'Chantilly Lace', swatch: '#f4f6f1' },
  { id: 'classic-gray', label: 'Classic Gray', swatch: '#e3e0d7' },
  { id: 'pale-oak', label: 'Pale Oak', swatch: '#ddd9ce' },
  { id: 'manchester-tan', label: 'Manchester Tan', swatch: '#dbd2bc' },
  { id: 'gentle-cream', label: 'Gentle Cream', swatch: '#e9ddc5' },
  { id: 'gray-cashmere', label: 'Gray Cashmere', swatch: '#cfd5cd' },
]

// Resolve a wallColor id to its hex / label, whether it's a curated chip above or any color
// picked from the full library modal.
export function wallColorHex(id: string): string | undefined {
  return optionById(WALL_COLORS, id)?.swatch ?? wallLibraryById(id)?.hex
}
export function wallColorLabel(id: string): string | undefined {
  return optionById(WALL_COLORS, id)?.label ?? wallLibraryById(id)?.name
}

// ---- Card option sets (shown as a single picker row) -----------------------
// Cabinet door styles — each option is a 3D GLB that swaps every cabinet door panel in the
// kitchen (thumbnails rendered live from each GLB).
export const CABINET_STYLES: Option[] = [
  // beadboard_smooth.glb = the original beadboard door with its vertical bead grooves
  // flattened (the panel-face valley verts at depth 0.551 snapped up to the ridge level
  // 0.591), removing the inner lines while keeping the door's own frame/recess geometry.
  { id: 'beadboard-shaker', label: 'Classic Shaker', model: '/doors/beadboard_smooth.glb' },
  { id: 'raised-panel', label: 'Mitered Shaker', model: '/doors/raised_panel.glb' },
  { id: 'salerno-molded', label: 'Salerno Molded', model: '/doors/salerno_molded.glb' },
  // recessed_panel_big.glb = recessed_panel with the inner panel/bevel RIGIDLY translated
  // outward (interior insets −0.9) — a modest enlargement that preserves the door's original
  // sharp bevel shape + normals exactly (translation doesn't rotate normals).
  { id: 'recessed-panel', label: 'Raised Panel', model: '/doors/recessed_panel_big.glb' },
  // Glass uppers: replaces ONLY the upper cabinet doors (lowers keep the original doors).
  { id: 'glass-upper-doors', label: 'Traditional Glass Uppers', model: '/doors/glass_uppers.glb' },
  // Uppers-only (like glass-upper-doors): replaces ONLY the upper cabinet doors.
  { id: 'thorsen-glass-uppers', label: 'Thorsen Glass Uppers', model: '/doors/thorsen_glass_uppers.glb' },
]
// Cabinet hardware pulls — each option is a 3D GLB that swaps every "*Pull*" object in
// the kitchen model. Thumbnails are rendered live & isometric (no static image needed).
export const HARDWARE_STYLES: Option[] = [
  // Option 1 = the original authored pulls in the model. The thumbnail renders the actual
  // authored pull node straight out of the kitchen GLB; the scene keeps the authored pulls
  // (no swap — see ORIGINAL_PULL_ID).
  { id: 'modern-bar-pull', label: 'Modern Bar', model: '/envision_kitchen_clean_test.glb#CabinetPull_Vertical_Hardware_RangeWall_Upper_01_Pull' },
  { id: 'bennett', label: 'Bennett', model: '/pulls/bennett.glb' },
  { id: 'rowan', label: 'Rowan', model: '/pulls/rowan.glb' },
  { id: 'alden', label: 'Alden', model: '/pulls/alden.glb' },
  { id: 'mercer', label: 'Mercer', model: '/pulls/mercer.glb' },
  { id: 'larkin', label: 'Larkin', model: '/pulls/larkin.glb' },
  { id: 'emerson', label: 'Emerson', model: '/pulls/emerson.glb' },
  { id: 'klein', label: 'Klein', model: '/pulls/klein.glb' },
  { id: 'whitman', label: 'Whitman', model: '/pulls/whitman.glb' },
  { id: 'warren', label: 'Warren', model: '/pulls/warren.glb' },
  { id: 'camden', label: 'Camden', model: '/pulls/camden.glb' },
  { id: 'brixton', label: 'Brixton', model: '/pulls/brixton.glb' },
]
export const COUNTERTOP_MATERIALS: Option[] = [
  // Option 1 = the current authored countertop stone (Calacatta, embedded in the GLB).
  { id: 'calacatta', label: 'Calacatta Marble', swatch: '#efeae2', texture: '/textures/countertops/calacatta_thumb.jpg' },
  // Bianco Carrara (classic white Carrara) sits ahead of the grey marble.
  { id: 'carrara3', label: 'Bianco Carrara Marble', swatch: '#e6e4e1', texture: '/textures/countertops/carrara3_thumb.jpg' },
  { id: 'whitemarble4', label: 'Bianco Venato Marble', swatch: '#efefee', texture: '/textures/countertops/whitemarble4_thumb.jpg' },
  // Option 2 = Marble012 texture set (applied as the countertop map in the scene).
  { id: 'marble012', label: 'Gray Marble', swatch: '#d9dadd', texture: '/textures/countertops/marble012_thumb.jpg' },
  // Option 5 = marble_108 (charcoal grey with bold white veining).
  { id: 'marble108', label: 'Charcoal Marble', swatch: '#4a4a4d', texture: '/textures/countertops/marble108_thumb.jpg' },
  // Option 3 = Marble016 (black marble).
  { id: 'marble016', label: 'Nero Marble', swatch: '#33352f', texture: '/textures/countertops/marble016_thumb.jpg' },
  // Option 4 = Marble020 (cream marble).
  { id: 'marble020', label: 'Crema Marble', swatch: '#b2a396', texture: '/textures/countertops/marble020_thumb.jpg' },
  // Option 6 = marble_110 (warm cream / onyx swirl).
  { id: 'marble110', label: 'Botticino Marble', swatch: '#ded2c7', texture: '/textures/countertops/marble110_thumb.jpg' },
  // Additional imported marbles/quartzites.
  { id: 'statuario', label: 'Statuario Marble', swatch: '#e9e9e8', texture: '/textures/countertops/statuario_thumb.jpg' },
  { id: 'polarwhite', label: 'Polar Gray Quartzite', swatch: '#dededd', texture: '/textures/countertops/polarwhite_thumb.jpg' },
  { id: 'romanobeige', label: 'Romano Beige Travertine', swatch: '#cdccc8', texture: '/textures/countertops/romanobeige_thumb.jpg' },
  { id: 'romanogrey', label: 'Romano Grey Travertine', swatch: '#bdbdbe', texture: '/textures/countertops/romanogrey_thumb.jpg' },
  { id: 'medgrey', label: 'Mediterranean Grey Quartzite', swatch: '#9c8f84', texture: '/textures/countertops/medgrey_thumb.jpg' },
  { id: 'grey5', label: 'Pearl Grey Quartzite', swatch: '#7d838a', texture: '/textures/countertops/grey5_thumb.jpg' },
  { id: 'monaco', label: 'Monaco Quartzite', swatch: '#a89f92', texture: '/textures/countertops/monaco_thumb.jpg' },
  { id: 'whitequartz', label: 'White Quartz', swatch: '#ecebe9', texture: '/textures/countertops/whitequartz_thumb.jpg' },
  { id: 'marble15', label: 'Ming Green Marble', swatch: '#dde7e0', texture: '/textures/countertops/marble15_thumb.jpg' },
  { id: 'travertine', label: 'Neutral Travertine', swatch: '#bdac94', texture: '/textures/countertops/travertine_thumb.jpg' },
]
export const BACKSPLASH_STYLES: Option[] = [
  { id: 'subway-tile', label: 'Subway Tile' },
  { id: 'herringbone', label: 'Herringbone' },
  { id: 'zellige', label: 'Zellige' },
  { id: 'slab-match', label: 'Slab Match' },
]
// Backsplash materials (popup tray). Option 1 = 'matching-stone' → the backsplash keeps
// the shared countertop marble (so it always matches the selected countertop). Every other
// id swaps the backsplash mesh to a tiled material in /textures/backsplash/<id>_{color,
// normal,rough}.jpg.
export const BACKSPLASH_MATERIALS: Option[] = [
  { id: 'matching-stone', label: 'Matching Stone', swatch: '#e8e4dd', texture: '/textures/countertops/calacatta_thumb.jpg' },
  { id: 'chevron', label: 'Chevron', swatch: '#c9cdd0', texture: '/textures/backsplash/chevron_thumb.jpg' },
  { id: 'stonecharcoal', label: 'Charcoal Stone', swatch: '#4e4e51', texture: '/textures/backsplash/stonecharcoal_thumb.jpg' },
  { id: 'fluted', label: 'Fluted Clay', swatch: '#7a5b4a', texture: '/textures/backsplash/fluted_thumb.jpg' },
  { id: 'subwayvert', label: 'Beige Subway Stacked', swatch: '#ece8df', texture: '/textures/backsplash/subwayvert_thumb.jpg' },
  { id: 'subwayhorz', label: 'Cream Subway', swatch: '#ece8df', texture: '/textures/backsplash/subwayhorz_thumb.jpg' },
  { id: 'concrete', label: 'Concrete', swatch: '#9a8b73', texture: '/textures/backsplash/concrete_thumb.jpg' },
  { id: 'green', label: 'Handmade Green', swatch: '#315651', texture: '/textures/backsplash/green_thumb.jpg' },
  { id: 'blue', label: 'Handmade Blue', swatch: '#3f7fa6', texture: '/textures/backsplash/blue_thumb.jpg' },
  { id: 'blackherringbone', label: 'Black Herringbone', swatch: '#2a2a2a', texture: '/textures/backsplash/blackherringbone_thumb.jpg' },
  { id: 'whitechevron', label: 'White Chevron', swatch: '#dcdcdc', texture: '/textures/backsplash/whitechevron_thumb.jpg' },
  { id: 'longgray', label: 'Gray Subway', swatch: '#3a3a3a', texture: '/textures/backsplash/longgray_thumb.jpg' },
  { id: 'bluegreenhex', label: 'Blue-Green Hexagon', swatch: '#2e6b6a', texture: '/textures/backsplash/bluegreenhex_thumb.jpg' },
  { id: 'whiteherringbone', label: 'White Herringbone', swatch: '#d6d4cf', texture: '/textures/backsplash/whiteherringbone_thumb.jpg' },
  { id: 'whitewoven', label: 'White Woven', swatch: '#d9d7d2', texture: '/textures/backsplash/whitewoven_thumb.jpg' },
  { id: 'longwhite', label: 'White Subway', swatch: '#d8d6d1', texture: '/textures/backsplash/longwhite_thumb.jpg' },
  { id: 'stackedterracotta', label: 'Stacked Terracotta', swatch: '#b06a4f', texture: '/textures/backsplash/stackedterracotta_thumb.jpg' },
]
export const SINK_STYLES: Option[] = [
  { id: 'single-bowl-undermount', label: 'Single Bowl Undermount' },
  { id: 'double-bowl', label: 'Double Bowl' },
  { id: 'farmhouse', label: 'Farmhouse Apron' },
]
// Faucets — each option is a 3D GLB that REPLACES the authored sink faucet. Thumbnails
// render live from each GLB (see pullThumbRenderer faucet branch).
export const FAUCET_STYLES: Option[] = [
  { id: 'single-handle-pulldown', label: 'Pull-Down Sprayer', model: '/faucets/single_handle_pulldown.glb' },
  { id: 'high-arc-gooseneck', label: 'High-Arc Gooseneck', model: '/faucets/high_arc_gooseneck.glb' },
  { id: 'square-gooseneck', label: 'Square Gooseneck', model: '/faucets/square_gooseneck.glb' },
  { id: 'modern-tap', label: 'Modern Tap', model: '/faucets/modern_tap.glb' },
  { id: 'essa-pulldown', label: 'Essa Pull-Down', model: '/faucets/essa_pulldown.glb' },
  { id: 'st-claire', label: 'St. Claire', model: '/faucets/st_claire.glb' },
]

// ---- Section / group model (data-driven rail) ------------------------------
export type GroupKind = 'card' | 'swatches'

export interface OptionGroup {
  kind: GroupKind
  key: ConfigKey
  label: string
  options: Option[]
  /** true => wired to the 3D scene in this build. */
  live?: boolean
  /** card groups: open a bottom tray of tiles instead of cycling on click. */
  tray?: boolean
}

export interface Section {
  id: SectionId
  title: string
  groups: OptionGroup[]
}

export const SECTIONS: Section[] = [
  {
    id: 'cabinets',
    title: 'Cabinets',
    groups: [
      { kind: 'card', key: 'cabinetStyle', label: 'Door Style', options: CABINET_STYLES, tray: true, live: true },
      { kind: 'swatches', key: 'cabinetFinish', label: 'Finish', options: CABINET_FINISHES, live: true },
    ],
  },
  {
    id: 'countertops',
    title: 'Countertops',
    groups: [
      { kind: 'card', key: 'countertop', label: 'Material', options: COUNTERTOP_MATERIALS, tray: true, live: true },
    ],
  },
  {
    id: 'flooring',
    title: 'Flooring',
    groups: [
      { kind: 'swatches', key: 'flooring', label: 'Material', options: FLOORING, live: true },
    ],
  },
  {
    id: 'backsplash',
    title: 'Backsplash',
    groups: [
      { kind: 'card', key: 'backsplashStyle', label: 'Material', options: BACKSPLASH_MATERIALS, tray: true, live: true },
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware',
    groups: [
      { kind: 'card', key: 'hardwareStyle', label: 'Pull Style', options: HARDWARE_STYLES, tray: true, live: true },
      { kind: 'swatches', key: 'hardwareFinish', label: 'Hardware Finish', options: METAL_FINISHES },
    ],
  },
  {
    id: 'walls',
    title: 'Wall Color',
    groups: [
      { kind: 'swatches', key: 'wallColor', label: 'Paint Color', options: WALL_COLORS },
    ],
  },
  {
    id: 'sink-faucet',
    title: 'Faucet',
    groups: [
      { kind: 'card', key: 'faucetStyle', label: 'Faucet Style', options: FAUCET_STYLES, tray: true, live: true },
      { kind: 'swatches', key: 'faucetFinish', label: 'Faucet Finish', options: METAL_FINISHES },
    ],
  },
]

export function optionById(options: Option[], id: string): Option | undefined {
  return options.find((o) => o.id === id)
}

/**
 * Backsplash options with the 'matching-stone' entry's PREVIEW derived from the current
 * countertop — the backsplash is a "child" of the countertop in that mode (the 3D already
 * shares the countertop's stone material), so its swatch/thumbnail must reflect whatever
 * countertop is selected rather than a fixed image. Every other option is returned as-is.
 */
export function backsplashOptionsFor(countertopId: string): Option[] {
  const ct = optionById(COUNTERTOP_MATERIALS, countertopId)
  return BACKSPLASH_MATERIALS.map((o) =>
    o.id === 'matching-stone' && ct
      ? { ...o, texture: ct.texture, swatch: ct.swatch ?? o.swatch }
      : o,
  )
}
