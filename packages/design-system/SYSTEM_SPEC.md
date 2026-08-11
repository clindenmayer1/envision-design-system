# Envision Design System — SYSTEM_SPEC

**Status:** v0.1 (Candidate). Owner: Design Systems. Last reviewed: 2026-07-16.
Figma library: `Envision Design System` (fileKey `ZnnaoZcKjKhDxXFvfHr6fA`). Product: https://envision-4tq.pages.dev/ · Code: `envision-app/`.

This is the governing specification. **Read it before editing any UI.** It is the source of truth for architecture, naming, taxonomy, responsive strategy, accessibility, content, white-label, page composition, Figma↔code mapping, governance, and definition of done.

---

## 1. Product context

Envision is a **white-label homeowner experience + interactive home-design platform**. A homeowner lands on a dashboard (welcome, builder branding, home/plan, design progress, key dates, floor-plan & lot-map widgets), enters a **Design Center** with an interactive **3D kitchen visualizer**, and selects finishes (cabinets, hardware, countertops, backsplash, flooring, wall color, sink/faucet, lighting) via a **RightRail** (Customize + Packages tabs) with live 3D preview, dynamic pricing/upcharges, save/apply, and a bottom selection/action tray. Desktop and mobile.

Architecture is **branded-house**: shared foundations + shared components + controlled brand overrides. A new builder = a new **mode** in the `T2 · Brand` collection, never a forked system.

## 2. Design principles

1. **Preserve the product, systemize it.** Keep the recognizable warm, editorial Envision look; normalize inconsistencies, never silently change behavior.
2. **Tokens are law.** No raw hex/px/radius/shadow in published components. Consume Tier 2/3; never Tier 1 directly.
3. **Selection & status are never color-only.** Rings + checks + icons + text carry meaning (WCAG 1.4.1).
4. **Product data ≠ UI tokens.** Cabinet/paint/material colors live in content models, not the color system.
5. **Composition over variant explosion.** Slots and nested components before N×M variant matrices.
6. **Explicit states.** Every component enumerates interaction, selection, persistence, async, availability, validation states.
7. **Responsive is behavior, not scaling.** Mobile is re-composed (rail→sheet), not a shrunken desktop.
8. **AI-legible.** The registry/recipes/state-model let a fresh Claude session build pages without inventing rules.

## 3. Token architecture (three tiers)

Governed by the supplied three-tier algorithm. Collections in Figma:

| Collection | Tier | Purpose | Modes |
|---|---|---|---|
| `T1 · Primitives` | 1 | Raw ingredients, no UI meaning. Hidden from publishing. | value |
| `T2 · Brand` | 2 | White-label seam (primary/accent/fonts). | westlake (+future builders) |
| `T2 · Semantic Color` | 2 | Color roles. | light (dark-ready) |
| `T2 · Semantic Layout` | 2 | Spacing/radius/border/elevation/motion/layer roles. | value |
| `T2 · Responsive` | 2 | Values that differ by device. | desktop, mobile |
| `T3 · Components` | 3 | Justified component tokens. | value |

**Naming anatomy** (also the CSS custom-property, prefix `--envision-`):
- T1: `envision/t1/{category}/{family}/{step}` → `--envision-t1-color-green-500`
- T2: `envision/t2/{category}/{property}/{variant}/{state}` → `--envision-t2-color-background-brand-hover`
- T3: `envision/t3/{component}/{variant}/{property}/{state}` → `--envision-t3-button-primary-color-background-hover`

**Rules:** T3 aliases T2 where possible; direct T1 refs are documented exceptions (`right-rail/header-height`, `top-bar/height`, `badge` sizes, `bottom-tray/max-width`, `package-card/image-ratio`). No circular aliases. Every variable is scoped and described. Full values: `tokens/*.tokens.json` (DTCG). Machine table: `tokens/tokens-table.md`.

Counts: **T1 = 149, Brand = 14, Semantic Color = 46, Semantic Layout = 34, Responsive = 15, Components = 32 → 290 variables.** Plus 17 text styles, 10 effect styles (6 elevation + 4 selection rings).

## 4. Foundations summary (evidence-based)

- **Color:** brand green `#29594F`; warm neutrals `#222/#666/#555/#8A8A82/#E7E3DC/#EDEAE4/#FBF8F5/#FFF`; warm brown `#765D49` alpha ramp; taupe selection-ring ramp `#E2E2DD→#ABAB9D→#999988→#998574`; status `#3F9D5A / #C99A3A / #E67E22` (+ added error red for a11y). Cabinet/paint/material colors are product data.
- **Type:** Inter (UI), Playfair Display (hero display), Georgia (wordmark, unavailable in Figma env → substituted). Body baseline 16; scale 11–56. Headings scale down on mobile; body stable.
- **Spacing:** 4pt grid (4/8/12/16/20/24/32/40 + 6/18/22). Radius 4/6/8/10/12/14/16 + pill + circle. Border 1/2.
- **Elevation:** flat → raised → raised-hover → menu → tray → overlay-dark (effect styles).
- **Motion:** micro 150ms; signature ease `cubic-bezier(.2,.8,.2,1)`; reduced-motion honored.
- **Layers:** base 0 · sticky-nav 25 · tray/menu 30 · modal 40 · toast 1000.

## 5. Component taxonomy (7 levels)

1. **Foundations** — tokens, type, icons, layout, motion, elevation, grid, a11y.
2. **Layout primitives** — Box, Stack, Inline, Grid, Divider, ScrollArea, StickyRegion, Surface, Panel, PageContainer, Section, AppShell, PageShell, SplitView, Drawer, Sheet, Overlay (built as-needed).
3. **Control primitives** — Button, IconButton, Link, Label, Field/Input, Checkbox, Radio, Switch, Tabs, Badge, Tooltip, MenuItem, Divider, ProgressIndicator, MaterialSymbol.
4. **Product components** — OptionCard, MaterialSwatch, PackageCard, SelectionCard, ProgressCard, KeyDateCard, PriceAdjustment, SelectionSummary, ViewPresetControl, DesignProgressTracker, RightRailSection, BottomActionTray, RoomSelector, FloorPlanCard, LotMapCard.
5. **Composite patterns** — RightRail, GlobalNav, DashboardWidgetGrid, PackageBrowser, MaterialSelector, ColorPickerModal, ThreeDViewportShell, MobileSelectionSheet.
6. **Templates** — DashboardTemplate, DesignCenterTemplate, VisualizerTemplate, BrowseSelectionsTemplate, ReviewSelectionsTemplate.
7. **Pages** — instances composed from the above (page-recipes.json).

Every asset is exactly one level. See `component-registry.json` for the authoritative list, maturity, and build status.

## 6. Responsive strategy

Real breakpoints: **1024px** (row→column, RightRail→full-width, canvas→60vh band) and **1080px** (dashboard cards 3→1). Added: mobile 390, desktop 1280, wide 1440. Auto Layout + constraints first; a `Device` variant only when anatomy/interaction changes. RightRail becomes a mobile sheet/drawer (same API, not a shrunk rail). Touch targets ≥44px where layout permits.

## 7. Accessibility baseline

Target **WCAG 2.2 AA**; behavior per WAI-ARIA APG. (2.4.13 Focus Appearance = enhanced internal target, not an AA gate.) Visible, unclipped, unobscured focus (2px brand ring). Contrast met for text, meaningful icons, control boundaries. No color-only status/selection/error. Persistent labels, programmatic required/invalid, associated errors. Icon-only controls named. Reduced-motion respected. Manual checks required (keyboard, SR naming/state, zoom 200/400, text-spacing, forced-colors, targets, translation, focus management). Details: `ACCESSIBILITY.md`.

## 8. Content principles

Semantic content-role registry (page title, section title, card title/description, field label, price, price delta, etc.) maps role → text style → HTML element → wrap/truncate/max-length/localization. Body baseline 16; 12px never for labels/pricing/instructions. Price/currency localized, tabular figures, explicit included/pending/unknown states, screen-reader phrasing. Paragraph spacing via layout gaps, not doubled. See `content-models.json` + registry text roles.

## 9. White-label strategy

Only `T2 · Brand` changes per builder (primary ramp, accent, display/wordmark fonts). Everything else shared. Add a builder = add a Brand mode + (optionally) a Semantic Color mode override; components need no changes. Dark mode: architecture-ready — add a `dark` mode to `T2 · Semantic Color` inverting neutrals; brand primary stays fixed. Not built (product is light-only).

## 10. Page-composition model

Pages = Shell + Template + Regions + Component instances, driven by an approved **page recipe** (`page-recipes.json`). Regions have contracts (allowed components, scroll/sticky/width/responsive). Future pages MUST reuse a recipe or add a reviewed one. New-page workflow + guardrails in `CLAUDE.md`.

## 11. Figma ↔ code mapping

1:1 names (Figma `PackageCard` ↔ code `PackageCard`). `figma-code-map.json` holds node IDs, property→prop maps, token maps, story IDs, parity. Code Connect used when plan/publish/repo/framework allow; otherwise the manual map is source of truth. Figma MCP is used so Claude inspects real component structure, never generic frame CSS when an approved component exists.

## 12. Storybook requirements

Organize `Foundations/ Components/ Patterns/ Templates/ Pages/`, with `Components/` subdivided by the canonical component taxonomy — `Actions`, `Inputs & Selection`, `Navigation`, `Data Display`, `Feedback & Guidance`, `Panels`, `Status & Progress`, in that fixed order, alphabetised within each. The taxonomy is declared once in `component-registry.json` (`meta.componentTaxonomy` + per-component `category`) and derived everywhere else; `scripts/verify-taxonomy.mjs` enforces it. Component taxonomy is independent of token taxonomy and of the `architecture` axis (control-primitive / product-component / composite-pattern / internal-subcomponent) — a component's category never implies a token namespace. Every public component: default + each variant/size/state + long/min/max content + desktop/mobile + a11y + interaction + visual-regression. Reuse child stories in composite/page stories. Deterministic fixtures; mock 3D + APIs at the Storybook boundary. Assumptions (framework/TS/styling/tokens transform/versions) in `STORYBOOK.md` — **provisional until engineering confirms the stack**.

## 13. Governance & Definition of Done

Maturity: Experimental → Candidate → Stable → Deprecated. A component is **Stable** only when Figma+code+story+docs+props/slots/variants/states/tokens mapped, a11y+responsive defined, tests exist, parity passes, and it appears in ≥1 real screen. Contribution, versioning, Tier-3 criteria, new-component/variant/recipe criteria, deprecation & migration in `GOVERNANCE.md`. Decisions in `decisions.md`; releases in `changelog.md`.
