# Envision Design System — Changelog

Format: [version] — date. Keep-a-changelog style. Maturity in parentheses.

## [0.1.0] — 2026-07-16 (Candidate)

### Added — Foundations
- **6 Figma variable collections, 290 variables**: `T1 · Primitives` (149), `T2 · Brand` (14, westlake mode), `T2 · Semantic Color` (46, light mode), `T2 · Semantic Layout` (34), `T2 · Responsive` (15, desktop+mobile), `T3 · Components` (32).
- **17 text styles** (Display/Hero, Heading H1–H5, Body L/M/S, Caption, Label L/M/S, Link, Numeric Price/Price-Delta, Eyebrow).
- **10 effect styles** (Elevation flat/raised/raised-hover/menu/tray/overlay-dark; selection Ring rest/hover/pressed/selected).
- **DTCG token files**: primitives, brand, semantic, responsive, components (`tokens/*.tokens.json`).
- 20-page Figma file structure (00–19) per spec.

### Added — Components (Figma, token-bound, ready-for-review)
- Control primitives: **Button** (Type×State, 15 variants + Label/icon props), **IconButton**, **Link**, **Label**, **Field**, **Checkbox**, **Radio**, **Switch**, **Badge** (tone×shape), **RightRail/Tab**.
- Product components: **MaterialSwatch**, **OptionCard**, **PackageCard** (Default/Selected/Popular).
- Composite: **RightRail** (assembled from real nested instances + sticky footer CTA).

### Added — Machine-readable system
- `component-registry.json`, `page-recipes.json`, `pattern-registry.json`, `state-model.json`, `content-models.json`, `figma-code-map.json`, `migration-map.json`.
- `fixtures/` (dashboard, design-center, packages, states).
- Docs: `SYSTEM_SPEC.md`, `CLAUDE.md`, `AUDIT.md`, `GOVERNANCE.md`, `ACCESSIBILITY.md`, `STORYBOOK.md`, `decisions.md`, `MANIFEST.md`, `tokens/tokens-table.md`.

### Normalized
- 3 hover greens → green.600/700; ink/ink-soft canonicalized; `--line` → brown alpha ramp; type one-offs → scale; RightRail width corrected to 392.

### Changed — Documentation presentation (matrix rebuild)
- Rebuilt every built-component page as a **labeled instance matrix** (real component instances, row/column axes from actual variants, dashed container) matching the reference model. No stacked small examples, no empty cards, no clipped text (full-file clipping audit: 0 issues).
- **Split families into separate pages**: Buttons · Icon Buttons · Links (was "Buttons & Links").
- Guidance split into **Usage / Accessibility / Implementation / Tokens** callouts (added Usage + Tokens note types).
- Designer-facing status vocabulary everywhere (In progress / Ready to use / Limited use / Deprecated / Retired); removed the badge bullet; foundations + built components set to **Ready to use**.
- Icons: added Material-icon documentation (in-use set incl. bookmark filled + border, extended set), replacing Envision's inline SVGs in the system.
- Page panel reorganized with blank dash-line section dividers (Overview / Foundations / Components / Product / Patterns & Templates / System / Internal); 22 content pages.
- Fixes: circular radius token → 999; RightRail anatomy width restored to 392; token-table CSS-var prefix.

### In progress — v4 component-by-component Tier-3 migration (real, not staged)
- **OptionCard migrated end-to-end** (`OptionCard.css` → zero raw governed values): added a full `option-card/*` Tier-3 contract (padding, radius, ring-inset/width + color, warm hover shadow, thumb radius + inset shadow, title/note/chevron type + gaps). Added Tier-1 `border-width/350` (3.5px tile-ring spread), `shadow/thumb-inset`, `shadow/option-hover` (warm) and Tier-2 roles `border-width/ring-tile`, `shadow/elevation-warm`, `shadow/thumb-inset`. **Measured value-parity: every resolved value equals the original** (ring #E2E2DD/#ABAB9D/#999988, 3.5px/2px ring, `0 2px 10px rgba(118,93,73,0.12)`, radius 6, thumb radius 4 + `inset 0 0 0 1px rgba(0,0,0,0.06)`, 14/1.2 title, 13/1.6 note, 20 chevron, 12/8/2 spacing). Only intrinsic thumbnail px geometry + `line-height:1` icon reset remain literal (structural, documented).
- **opacity category correction (source-verified)**: the source diagram defines no standalone Tier-1 `opacity` category, so the invented `opacity/muted` primitive was **removed from Figma** (T1 · Primitives) and JSON; `material-swatch/unavailable-opacity` repointed to a **component-specific direct `0.4`** (Figma T3 unaliased + JSON) — no other consumers existed.
- **Fixed dangling reference**: `OptionSwatch.css` `material-swatch-item-gap` → `material-swatch-label-gap` (the T3 rename). **Global dangling sweep across all product CSS = 0 missing tokens.**
- **Validated**: 432 tokens, 0 broken/0 circular; `npx vite build` ✓; every migrated component (OptionSwatch/PackagesTab/OptionCard) has 0 raw governed hex/rgba/px.

- **MaterialSwatch corrected**: `item-gap` → `label-gap` (accurate role; verified it is the chip→label gap); radius drift **fixed 16 → 4** to match the product (both resolve `→ radius/100 → 4`). Full 6-token contract synced to JSON.
- **PackageCard migrated end-to-end**: full Tier-3 contract (23 tokens) in `components.tokens.json` derived from the real `PackagesTab.css`; CSS regenerated (370 tokens, 0 broken); **`PackagesTab.css` rewritten to consume `package-card/*` Tier-3 tokens**, preserving the exact website structure (image top · Trending badge over image · name+price one row · 6 swatches + Customize one footer row · no full-width Customize · same height/radius/padding). Product one-offs (rgba borders, #6b6f6d, shadows) left raw + documented `raw:` — no silent value changes.
- **Validated**: `npx vite build` ✓ (CSS bundle builds, 0 dangling tokens). `npm run build` blocked only by PRE-EXISTING TS errors in 3D code (`targeting.ts`, `KitchenScene.tsx`) unrelated to this migration.
- Added Tier-1 `opacity` category (`opacity/muted` 0.4). Remaining components/CSS files migrate next — NOT complete.

### Fixed — v3 source-of-truth audit (naming, code output, website consumption)
- **Tier-1 `dimension` category → `spacing`** (source-mandated; 19 Figma vars renamed, IDs/bindings preserved; JSON + table synced; 0 broken/circular).
- **Generated real code output** with source naming: `design-system/build/{primitives,semantic,components,tokens}.css` — Tier-1 `--envision-color-*`/`--envision-spacing-*`, Tier-2/3 `--envision-theme-*`, full alias chain preserved as `var()` references.
- **Website now consumes the token system**: `envision-app/src/styles/tokens.css` imported in `global.css`; all product `:root` vars (`--ink`, `--card-bg`, `--hairline`, `--canvas-bg`, `--line`) + scrollbar now resolve through the token chain; `OptionSwatch.css` (product MaterialSwatch) consumes Tier-3 `material-swatch/item-gap` + semantic tokens.
- **MaterialSwatch full Tier-3 contract**: added `material-swatch/{chip-background, label-color, chip-size, unavailable-opacity}` (+ existing item-gap, radius); all owned props bound; added Tier-1 `opacity/muted`. Full chain evidence in `ARCHITECTURE-MANIFEST.md §3`.
- **Flagged** Figma↔product parity drift: Figma MaterialSwatch chip radius 16 vs product 4 (F7). **Not claimed complete** — full Tier-3 rollout + full website refactor + Flutter/tests staged (manifest §4).

### Fixed — Role-based token architecture (correction of the value-based migration)
- **Deleted** the value-based Tier-2 scale (`spacing/space-*`, `radius/radius-*` — 27 vars); it was a duplicate primitive scale.
- Added **role-based Tier-2** tokens (`spacing/layout|control|field|content|container/*`, `radius/control|container/*`, `border-width/control/*`) and **Tier-3** `component/material-swatch/{item-gap, radius}`. Rebound 3,277 properties to roles.
- **Restored** values v1 had silently normalized: Field padding → 14/10 (product value), PackageCard swatch → 3px; added Tier-1 `dimension/250` (10), `dimension/350` (14), `radius/75` (3) as documented primitives.
- Added 7 role text styles; applied semantic text styles to 92 component text nodes (exact-match, no visual change). Only 11 icon glyphs remain direct.
- Validation: value scale = 0, component Tier-1-direct spacing/radius/border = 0, instances token-bypass = 0. Full report: `VARIABLE-AUDIT.md`.

### Changed — System-wide variable migration
- Bound **3,869** hard-coded gap/padding/corner-radius/stroke-weight values to Tier-2 variables across all 41 roots; second audit = **0 unbound**, **0 raw fills/strokes**.
- Added Tier-2 semantic **spacing scale** (`spacing/space-*`, 17) + **radius scale** (`radius/radius-*`, 10) + `border-width/thin` (1.5), and Tier-1 `border-width/150`. No duplicate tokens; one alias per value.
- Made all 17 text styles variable-driven (fontSize/letterSpacing/fontFamily bound to Tier-1).
- Normalized off-grid drift (14→12, 10→8, etc.) to the 4-pt grid while binding. Full report + documented exceptions: `VARIABLE-AUDIT.md`.

### Known gaps (Candidate → not yet Stable)
- Code components, Storybook stories, and tests are **specified, not implemented** (stack provisional).
- Product components ThreeDViewportShell, ColorPickerModal, BottomActionTray, GlobalNav, dashboard widgets are **specified in the registry, not yet drawn in Figma** (`figmaStatus: proposed`).
- Dark mode architecture-ready but not built. Code Connect not applied.
