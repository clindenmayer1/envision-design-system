# Envision — Product & Interface Audit (Stage A)

**Method:** Full read of the live codebase (`envision-app/src`) — all 18 CSS files, all component `.tsx`, `App.tsx`, `types.ts`, `three/packages.ts`, `three/pricing.ts`, `three/useSceneLoad.ts`, `data/wallColorLibrary.ts` — cross-referenced with the live product at https://envision-4tq.pages.dev/. Values below are extracted, **not estimated**. Source of truth for existing runtime behavior = the audited code.

The single design-token block in the product is `styles/global.css`:
`--ink:#222222; --ink-soft:#666666; --card-bg:#fbf8f5; --line:#765d49; --hairline:#e7e3dc; --canvas-bg:#edeae4`.

---

## 1. Key structural facts

| Fact | Value | Evidence |
|---|---|---|
| Right rail width | **392px** (not the 416 the comments claim) | `.rail{width:392px;flex:0 0 392px}` |
| Top bar height | 64px | `.topbar{height:64px}` |
| Tablet breakpoint | 1024px — row→column, rail→full-width (border left→top) | Layout.css / RightRail.css |
| Dashboard breakpoint | 1080px — cards 3-col→1-col | Overview.css |
| Canvas on mobile | fixed 60vh band above stacked rail | Layout.css |
| Bottom tray | anchored `bottom:24px`, `max-width:min(900px,100%-48px)`, 6-tile carousel | CabinetStyleTray.css |
| Primary font | Inter (NOT self-hosted — system fallback risk) | global.css body |
| Display font | Playfair Display (imported), wordmark Georgia | Overview.css / TopBar.css |

## 2. Color — reconciliation decisions (Preserve / Normalize)

| Observed | Disposition | Canonical token |
|---|---|---|
| Brand green `#29594F` | **Preserve** | `t1.color.green.500` |
| 3 hover greens `#21493f`, `#234c43`, `#1f453d` | **Normalize** → 2 ordered steps | `green.600 #234C43`, `green.700 #1F453D` |
| ink `#222222` vs hardcoded `#2b2622` | **Normalize** → `#222222` canonical | `neutral.800` |
| ink-soft `#666666` vs `#6c6359` | **Normalize** → `#666666` | `neutral.600` |
| `--line #765D49` (only ever used as rgba α) | **Normalize** → base + 9-step alpha ramp | `brown.*` |
| Selection rings `#E2E2DD/#ABAB9D/#999988/#998574` | **Preserve** as ring ramp | `taupe.100/300/500/600` |
| success `#3F9D5A`, warning `#C99A3A`, badge `#E67E22`, info `#6EA8FE` | **Preserve** | status/accent/info ramps |
| No destructive red anywhere | **Needs confirmation** — error ramp added for a11y, flagged | `error.*` |
| Cabinet/paint/material colors | **Product data, NOT UI tokens** | `content-models.json` |

## 3. Scales (Normalize to grid)

- **Spacing** clusters: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 + off-grid 6 / 18 / 22. Optical `-3.5px` outline offset = documented exception.
- **Radius**: 4 / 6 / 8 / 10 / 12 / 14 / 16 + pill(999) + circle(50%).
- **Type sizes** (product one-offs 9–56) → consolidated 11/12/13/14/15/16/18/20/22/24/28/32/40/48/56.
- **Elevation** tiers: inset hairline → subtle card `0 4px14px .04` → hover `0 6px20px .08` → menu `0 10px30px .14` → tray/modal `0 18px48px .18` → dark `0 8px30px .35`.
- **Motion**: uniform `0.15s ease` micro; signature tray ease `cubic-bezier(.2,.8,.2,1)` 200–340ms; reduced-motion path exists (CabinetStyleTray).

## 4. Component inventory & disposition

| Product element | Disposition | System classification | Canonical component |
|---|---|---|---|
| TopBar | Normalize | Composite pattern | `GlobalNav` |
| Layout (app shell) | Preserve | Template/Shell | `DesignCenterShell` / `AppShell` |
| RightRail (+ tabs, scroll, footer) | Replace one-off → composite | Composite pattern | `RightRail` + subcomponents |
| ConfiguratorSection | Normalize | Product component | `RightRailSection` |
| OptionCard | Preserve | Product component | `OptionCard` |
| OptionSwatch | Preserve | Product component | `MaterialSwatch` |
| CabinetStyleTray | Preserve | Composite pattern | `BottomSelectionTray` |
| PackagesTab / PackageCard | Preserve | Pattern + product component | `PackageBrowser` / `PackageCard` |
| WallColorModal | Preserve | Composite pattern | `ColorPickerModal` |
| RoomSelector | Preserve | Product component | `RoomSelector` |
| ViewSwitcher | Preserve | Product component | `ViewPresetControl` |
| Overview (dashboard) | Normalize | Template + widgets | `DashboardTemplate` + widgets |
| SceneCanvas / useSceneLoad | Preserve | Product component | `ThreeDViewportShell` |
| RailFooter | Preserve | Product component | `SelectionSummary` / rail footer |
| StudioPanel / PoseReadout / DebugTargetsPanel | **Retire from public system** | Internal dev tools | — (excluded from library) |
| PullThumb | Preserve | Internal subcomponent | `_MaterialThumb` |

## 5. State model (evidence-backed)

- **Selection:** `aria-pressed` / `id===value` → ring; one tray open at a time (`openTrayKey`).
- **Package:** `selected` (green border + check), `customized` (config diff vs `pkg.config`), default `summit`.
- **3D load (useSceneLoad):** `cached` skip · real-byte `percent` (cap 99 → 100 on ready) · `ReadyDetector` 3 frames · `GRACE_MS 180` before loader shows · `FADE_MS 340` · `WATCHDOG_MS 20000` · error → non-fading retry. **No fake snapshot in canvas**; package cards use pre-rendered `/packages/<id>.jpg`.
- **Image (PackageCard):** loading(shimmer) / ready / error("Preview coming soon").
- **Price:** `upgradeLabel` → "Included" | "+$X"; rail total or "All selections included".
- **Wall color preview vs commit:** click previews (`onPreview`), CTA/dblclick commits, cancel reverts.
- **Empty:** WallColorModal "No colors match …". **Disabled:** `.wcm__apply:disabled` (opacity .4).

## 6. Product data models (see content-models.json for full field lists)

`KitchenConfig` (14 config keys), `Option`, `KitchenPackage`+`PackageConfig` (10 packages), `WallColor`+`WallColorSection` (7 sections, 279 real Benjamin Moore colors), `UPGRADE_PRICES` (per-category upgrade $), 12 Rooms w/ status, Overview `SELECTIONS`/`KEY_DATES`.

## 7. 100% interface-disposition — visually-minor elements

Dividers→`t2.color.border.default`; hairlines→same; scroll regions→`RightRail/ScrollRegion`; selection indicators→ring ramp + check icon (never color-only); focus rings→`t2.color.border.focus` 2px; skeletons→`pkg-shimmer` pattern; price deltas→`Price`/`PriceDelta` roles; image fallbacks→`--upgrade`/error treatments; scrims→`t2.color.background.scrim-strong`. All accounted for in `component-registry.json` and `state-model.json`.
