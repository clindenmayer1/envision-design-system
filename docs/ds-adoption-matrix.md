# Envision DS adoption matrix

Audit of the shipping application against the production design system. Numbers are measured by
`scripts/ds-adoption-audit.mjs`, not estimated. Re-run it after each migration group.

## Baseline (before this migration)

| | |
|---|---|
| application components | 18 |
| application lines audited | 3,645 |
| components using a DS component | **4 / 18** |
| components fully migrated | **0 / 18** |
| canonical `--envision-t1/t2/t3-*` references | 125 |
| legacy token references | 93 |
| **hardcoded design values** | **659** (colour 171 · length 355 · type 113 · shadow 20) |

The application imports the token package but is not meaningfully consuming the system: 96% of its
UI is bespoke.

## What the system actually ships

**14 web components:** Badge, Button, Checkbox, IconButton, Input, Label, Link, MaterialSwatch,
OptionCard, PackageCard, Radio, RightRail, Switch, Tab.

**10 React adapters** — MaterialSwatch, OptionCard, PackageCard and RightRail have none. Since the
application is React and must not get parallel component implementations, completing the adapter
layer is a prerequisite for migration groups 4 and 6, not optional work.

## Matrix

Classification key: **R** replace with DS component · **A** adopt product-specific DS component ·
**T** bespoke structure, consume DS tokens · **C** app-specific pattern composed from DS parts ·
**M** missing DS coverage, needs review (do not invent).

| # | App element | Current implementation | DS component | Canonical / legacy / hardcoded | Class | Migration action | Visual + behavioural risk | Responsive | Accessibility | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Global tokens | `src/styles/*` legacy layer, canonical imported but unused by most screens | `@envision/tokens` | 125 / 93 / — | T | Load canonical sheet first; retire legacy layer screen by screen | Low; layers are separately namespaced | Responsive sheet must load after base | none | **done** (rail scope) |
| 2 | TopBar | bespoke `<header>` + 3 `<button>` + inline SVG | none shipping | 0 / 4 / 43 | T + C | Keep structure; nav items become `Tab`; icon actions become `IconButton`; tokens throughout | Nav is brand-critical; verify wordmark + avatar untouched | collapses under 1024 | nav landmark, current-page state | pending |
| 3 | ViewSwitcher | 3 segmented `<button>` | `Tab` (fitted) | 0 / 3 / 23 | R | Replace with `Tab` in a tablist | Segmented look differs from underline tabs — needs review before swapping | fixed | needs `role=tablist` + arrows | **review** |
| 4 | RoomSelector | `<button>` trigger + `<ul>/<li>` menu with per-room status | none shipping | 0 / 4 / 41 | M | No Dropdown/Menu in the shipping system. Keep bespoke, migrate to tokens now; log coverage gap | Status colours must map to semantic status roles | fixed | combobox/menu semantics, Esc, focus return | pending |
| 5 | RightRail | bespoke shell; tabs already `Tab` | `RightRail` | 17 / 0 / 1 | A | Adopt the shell once its React adapter exists; footer via the `footer` slot | Shell hardcodes a title + one-row footer upstream | rail → sheet ≤1024 | sheet is a modal dialog w/ focus trap | partial |
| 6 | RailFooter | bespoke; CTA is `Button` | — | 26 / 0 / 1 | C | Composed from `Button` + tokens | none | none | Save button needs a name | **done** |
| 7 | ConfiguratorSection | section wrapper + swatch groups | — | 0 / 1 / 17 | C | Compose from `MaterialSwatch`; tokens for the wrapper | swatch sizing/ring must match | none | group labelling | pending |
| 8 | OptionCard (app) | `<button>` + thumb + title + chevron | **`OptionCard`** | 0 / 35 / 9 | R | Replace with the DS component via adapter | DS card layout differs from the rail row; compare before swap | none | already a real button | pending |
| 9 | OptionSwatch | `<button>` + chip | **`MaterialSwatch`** | 0 / 15 / 10 | R | Replace via adapter | DS swatch has label + price slots the app may not use | none | selected state must not be colour-only | pending |
| 10 | PackagesTab card | bespoke `<section role=button>` | **`PackageCard`** | 82 / 0 / 4 | R | Replace via adapter | Upstream card lacks description, applied check, texture swatches | none | div-as-button today; DS uses real buttons | pending |
| 11 | CabinetStyleTray | tray + tile grid | none shipping | 0 / 7 / 70 | M + C | Tiles → `MaterialSwatch`; tray shell stays bespoke, tokenised | large surface, high drift risk | tray height | dialog semantics | pending |
| 12 | WallColorModal | modal + category sidebar + swatch grid | none shipping | 0 / 14 / **158** | M + C | Largest hardcoded surface. Swatches → `MaterialSwatch`; modal stays bespoke, tokenised | very high; 158 raw values | fixed 720 | modal focus trap, Esc | pending |
| 13 | Overview | dashboard cards | none shipping | 0 / 0 / 116 | T | Tokens only; cards are app-specific compositions | high value, brand-facing | dashboard 3→1 col | heading order | pending |
| 14 | Layout | grid wrapper | — | 0 / 2 / 5 | T | Tokens for gutters/gaps | low | drives the ≤1024 switch | landmarks | pending |
| 15 | StudioPanel | lighting/dev controls | — | 0 / 0 / 81 | T | Tokens; consider `Switch`/`Input` for its controls | internal tool | none | — | pending |
| 16 | DebugTargetsPanel | dev overlay | — | 0 / 8 / 23 | T | Tokens only | internal tool, not shipped UI | none | — | low priority |
| 17 | PoseReadout / SceneCanvas / PullThumb | 3D viewport chrome | — | 0 / 0 / 57 | C | 3D domain; tokens where it paints UI | must not disturb the renderer | none | — | low priority |

## Missing system coverage (do not invent)

Three application patterns have no shipping DS component. Each is real, recurring product UI:

1. **Dropdown / menu** — RoomSelector, and the sort control in WallColorModal.
2. **Modal / dialog** — WallColorModal.
3. **Tray / sheet** — CabinetStyleTray (RightRail's sheet mode is close but is the rail, not a tray).

These are flagged for review rather than built. Until they exist, those structures stay bespoke and
consume tokens.

## Sequencing

Adapters first (blocks 5, 8, 9, 10), then in the order the user set, adjusted for dependency:

1. Global tokens — done for the rail; extend as each screen lands
2. Complete the React adapter layer *(prerequisite)*
3. TopBar
4. RightRail shell + ConfiguratorSection
5. OptionCard, OptionSwatch → DS components
6. PackagesTab card → `PackageCard`
7. Tray, modal, overlays (bespoke + tokens; coverage gaps logged)
8. Overview and remaining product UI
9. Dev/3D chrome last

## Rules held throughout

- Primitive → Semantic → Component → Product. Application UI consumes T2/T3, never T1, unless the
  system has no role and it is documented inline.
- No hex, px, shadow or type literal where the system publishes a role.
- Visual parity verified against the running product; drift is a bug, not an improvement.
- No new component layer, no parallel React implementations.


---

# FINAL DISPOSITIONS

Every application component now has an explicit state. Measured by `scripts/ds-adoption-audit.mjs`.

| State | Components |
|---|---|
| **A** migrated to a DS component | RightRail tabs (`Tab`), RailFooter CTA (`Button`), PackagesTab badges (`Badge`), ConfiguratorSection |
| **B** app composition using DS parts + tokens | RightRail, RailFooter, PackagesTab, ConfiguratorSection |
| **C** tokenised app structure | TopBar, Overview, WallColorModal, CabinetStyleTray, StudioPanel, RoomSelector, ViewSwitcher, Layout, PoseReadout, SceneCanvas, DebugTargetsPanel, PullThumb |
| **D** DS coverage gap | Dropdown/Menu · Modal/Dialog · Tray/Sheet |
| **E** parity exception | OptionCard · OptionSwatch · PackagesTab card · TopBar nav · TopBar notification badge |

## Parity exceptions, with evidence

The three product components in the shipping system **cannot yet express the shipped product**.
All three have zero slots, so the application cannot inject its own content:

| Component | Why adoption would redesign the product |
|---|---|
| `envision-option-card` | No slot. The app renders a **live 3D `PullThumb`** inside the thumb; adopting it would silently drop 3D door/pull previews. Also single thumb geometry vs the app's portrait/square variants. |
| `envision-material-swatch` | Fixed 64px vs the app's fluid `width:100%` + `aspect-ratio` grid cell; adds a **green check badge** the product deliberately does not use ("ring only, no checkmark"); no circular variant for the rendered metal spheres; renders no label. |
| `envision-package-card` | No description, no applied-check, 5 round colour dots instead of the product's 6 square **texture** tiles, price stacked rather than baseline-aligned. |
| TopBar primary nav | `envision-tab` is 16/0/14 with a full-width indicator; the nav is a 6px-underlined link at a 40px rhythm. |
| TopBar notification count | `envision-badge` publishes no `accent` tone; `brand` would render it green instead of orange. |

These are **DS capability gaps, not application problems**. Each is a missing slot, variant or tone
on a component that was built to a simplified spec. Closing them is a design decision about the
components' public API, so they are logged rather than forced — adopting any of them today would
visibly redesign approved product UI, which this migration forbids.

## Remaining raw values, classified

| Category | Count | Disposition |
|---|---|---|
| Structural geometry | ~120 | 3D viewport maths, canvas sizing, absolute positioning, optical offsets. No system role applies. |
| Product/content data | ~35 | Material colours, texture URLs, package imagery. Content, not tokens (SYSTEM_SPEC §4). |
| Off-grid values the system retired | 44 | 3/5/6/7/9/10/14/22px. The system's scale has no such steps; snapping would move the product. |
| Genuine missing roles | ~16 | Ring insets, scrim tints and a 10px micro-label with no published role. Logged as gaps. |

The goal was never zero. It was zero *unjustified* design decisions, and each remaining value now
falls into one of the four categories above.


---

# COMPONENT EVOLUTION PASS (final)

Authorised to change DS public APIs so the system can represent the approved product.

## APIs evolved, each driven by an observed product requirement

| Component | Capability added | Product evidence |
|---|---|---|
| `OptionCard` | `media` slot + `thumb-shape="portrait"` | The rail renders a **live 3D `PullThumb`** in the thumb; a background-image API cannot express it |
| `MaterialSwatch` | `fluid`, `shape="circle"`, `hide-check`, `label` | Rail/tray swatches fill their grid cell, metal finishes render as spheres, and the product shows selection as a ring with **no check** |
| `PackageCard` | `description`, applied check, 6 square **texture** tiles, `action` slot | The shipped package card has all four; the component had none |

All three ship with tests (86 component tests pass), updated React adapter types, and registry-visible APIs.

## Product adoption outcome

| Component | Adopted? | Evidence |
|---|---|---|
| **MaterialSwatch** | **Yes** — 47 instances live | Bespoke `OptionSwatch.css` deleted; the app now renders `<envision-material-swatch>` |
| `OptionCard` | **No — reverted** | The DS card renders its chevron via a Material Symbols **ligature the app does not load**, so it displayed the literal text `chevron_right`, and the row geometry differed. Verified in-browser, reverted. |
| `PackageCard` | **No — reverted** | With the evolved API the card still lost its media region, the Popular badge overlapped the title, tiles rendered round and undersized, and Popular appeared on cards that never had it. Verified in-browser, reverted. |

The component APIs are now capable; the **rendering** does not yet match. Both failures are concrete
and fixable, and both were caught by looking at the running product rather than by tests passing.

### Remaining work to finish these two adoptions

1. **Icon dependency** — `OptionCard` (and any component using Material Symbols ligatures) must
   either ship its glyphs or degrade to an inline SVG. Today it silently renders raw text in any
   host that does not load the font. This is a DS defect, not an application one.
2. **PackageCard media + layout** — the media region needs the product's `351/166` ratio and image
   binding through the `pkg` property path, the Popular badge needs to sit over the media rather
   than the title, and the tile grid needs the product's six-up square geometry at full row width.
