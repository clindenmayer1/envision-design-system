# Envision Design System — Architecture Manifest & Ground-Truth Audit (v3)

Reconstructed from the governing source: the three-tier diagram (figma `hg7iIfW9nJdMu3DmG2eABO`, node 1-149) + the "Build a Design System" transcript. **When a later instruction conflicts with the diagram, the diagram wins** — except where the user has explicitly and repeatedly overridden it (noted below).

## 1. Source-of-truth architecture

### Naming (from the diagram's own examples)
| Tier | Figma path (NO tier segment) | Code name |
|---|---|---|
| 1 primitive | `color/green/100` | `--ds-color-green-100` (no tier id) |
| 2 semantic | `color/background/brand` | `--ds-theme-color-background-brand` (tier id = **theme**) |
| 3 component | `button/primary/color/background/hover` | `--ds-theme-button-primary-color-background-hover` |

Global prefix here = **`envision`** (the diagram says choose a unique prefix; `ds` is its example). So: Tier 1 → `--envision-<category>-…`; Tier 2/3 → `--envision-theme-…`. The tier identifier is **omitted from Figma** (tier = collection) and present in code as `theme`.

### Tier anatomy
- **Tier 1** categories (diagram): color, typography, **spacing**, border (width+radius), shadow, animation (duration+easing), viewport/breakpoint (design-only), z-index (code-only), opacity, shared/utility. Names describe raw values.
- **Tier 2**: `prefix → tier-id → category → property → variant → state`. Purpose-based roles (content/background/border/surface/action/focus/selected/disabled/error/…). **Never value-based.**
- **Tier 3**: `prefix → tier-id → component → variant → property → state`. Component-owned decisions. Chain: **component property → T3 → T2 → T1 → value**. Direct T1/T2/raw bindings are documented exceptions.

## 2. Findings from this round's ground-truth scan (bindings inspected by variable ID, not name)

| # | Finding | Status |
|---|---|---|
| F1 | Tier-1 spacing category was named `dimension` (invented). | **FIXED** — renamed to `spacing/*` in Figma (19 vars, IDs/bindings preserved) + JSON (0 broken/circular). |
| F2 | Code/CSS naming used `t1/t2/t3` segments (violates source). | **FIXED** — generated CSS now uses `--envision-color-*` (T1) and `--envision-theme-*` (T2/T3). |
| F3 | No generated code output existed; **website did not consume tokens**. | **FIXED (foundation + representative)** — `design-system/build/{primitives,semantic,components,tokens}.css` generated; app `global.css` + `OptionSwatch.css` now consume them. Full-app refactor **STAGED** (F8). |
| F4 | MaterialSwatch lacked a full Tier-3 contract. | **FIXED** — 6 T3 tokens, all owned props bound (evidence §3). |
| F5 | Components mostly bind **Tier-2 directly** (Tier-3 not the consumption layer). | **PARTIAL** — MaterialSwatch fully on T3; Button/Input/Tab/PackageCard/OptionCard have partial T3 (color); remaining component-owned props on T2. Full T3 rollout **STAGED** (F9). Note: the governing diagram says Tier-2 is the default and Tier-3 only when justified; the user overrode this to require T3 everywhere. |
| F6 | v2 silently normalized off-grid values (14→12, 10→8, 3→4…). | **RESTORED** (v2.5): product values Field 14/10 and swatch 3px restored via `spacing/field/*` + `radius/container/xsmall`; doc-only 14→12 left grid-aligned (documented). |
| F7 | Figma MaterialSwatch chip radius = 16px, but **product OptionSwatch = 4px** (drift I introduced). | **FLAGGED** — website bound to the product value (4, via `radius/control/small`); Figma component radius (16) needs reconciliation to 4. Owner: design-systems. |
| F8 | Only `global.css` + `OptionSwatch.css` wired; ~17 other product component CSS files still hard-coded. | **STAGED / open.** |
| F9 | Tier-3 contracts for the other ~13 built components (+ Select/Dialog/Table/Alert/Toast/Drawer/Menu/Tooltip not built at all). | **STAGED / open.** |
| F10 | Text-style `lineHeight` unbound. | **Open** — technical limitation (Tier-1 line-heights are unitless multipliers; styles use PERCENT). fontSize/family/letterSpacing ARE bound. |

## 3. MaterialSwatch — full evidence chain (representative component)

Verified live from the Figma property panel (bound variable IDs resolved):

| Property | Figma T3 | → T2 | → T1 | value | → generated code token | → website usage |
|---|---|---|---|---|---|---|
| **Item gap** (Auto Layout) | `material-swatch/item-gap` | `spacing/content/label-gap` | `spacing/100` | **4** | `--envision-theme-material-swatch-item-gap` → `…-spacing-content-label-gap` → `--envision-spacing-100` | `OptionSwatch.css .swatch{gap}` |
| **Radius** | `material-swatch/radius` | `radius/container/large` | `radius/400` | 16 (Figma) | `--envision-theme-material-swatch-radius` | *(product uses 4 — F7)* |
| **Chip size** | `material-swatch/chip-size` | *(T3→T1, no T2 size role — exception)* | `spacing/1100` | 64 | `--envision-theme-material-swatch-chip-size` | `.swatch__chip aspect-ratio` |
| **Chip background** | `material-swatch/chip-background` | `color/background/surface-sunken` | `color/neutral/100` | #F3F0EA | `--envision-theme-material-swatch-chip-background` | product-data fill |
| **Label color** | `material-swatch/label-color` | `color/content/secondary` | `color/neutral/600` | #666 | `--envision-theme-material-swatch-label-color` | `.swatch__label{color:var(--ink)}` |
| **Label typography** | text style `Label/Caption` | — | `font-size/50` | Inter Medium 11 | `--envision-font-size-50` | `.swatch__label{font-size}` |
| **Selection ring** | effect style `Ring/Rest\|Hover\|Selected` | — | taupe ramp | — | *(box-shadow tokens)* | `.swatch[aria-pressed] box-shadow` |
| **Unavailable opacity** | `material-swatch/unavailable-opacity` | *(T3→T1, no T2 opacity role — exception)* | `opacity/muted` | 0.4 | `--envision-theme-material-swatch-unavailable-opacity` | *(staged)* |

**The Figma gap shows `material-swatch/item-gap` — not a raw `4`, not `spacing/space-4`, not a Tier-1 or generic Tier-2 token.** ✔

## 4. Honest completion status
This is **NOT complete** per the strict completion rule. Delivered end-to-end for the representative component (MaterialSwatch) + foundation. **Explicitly staged / open:** full Tier-3 contracts for the other components (F9); wiring the remaining ~17 product component CSS files (F8); un-built components (Select, Dialog, Table, Alert, Toast, Drawer, Menu, Tooltip, Pagination); Flutter/TS outputs; dark-mode + multi-mode resolution tests; `lineHeight` binding (F10); automated tests + visual-regression. See exceptions register above for owners/status. No completion claim is made.
