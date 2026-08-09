# Envision Design System — Storybook & Implementation Handoff

## Implementation assumptions (PROVISIONAL — engineering must confirm)
The current product (`envision-app`) is the evidence base. These are proposals, not confirmed infra. **Do not claim implementation can begin with zero decisions remaining.**

| Concern | Proposed | Confirmed? | Engineering must decide |
|---|---|---|---|
| Framework | React 18 (matches product) | product uses it | keep React vs other |
| Language | TypeScript (product uses TS) | yes | — |
| Styling | CSS + CSS custom properties (product uses plain CSS) | product pattern | CSS modules vs vanilla-extract vs CSS-in-JS |
| Token transform | Style Dictionary or `@tokens-studio/sd-transforms` from `tokens/*.tokens.json` (DTCG) → `--envision-*` CSS vars | no | transformer + version |
| Storybook | Storybook 8 (React-Vite) | no | version |
| Package manager | npm (product has package-lock) | product uses npm | — |
| Repo structure | `@envision/ui` package (importPath in registry) | no | monorepo vs single package |
| Test runner | Vitest + Testing Library + Playwright (interaction/visual) | no | confirm |
| Visual regression | Chromatic or Playwright snapshots | no | choose service |
| Material Symbols | `material-symbols` npm (variable font) or SVG components; one family/config | no | delivery method |
| CSS var loading | `:root` sheet emitted from tokens; brand mode via `[data-brand]`, scheme via `[data-theme]` | no | confirm strategy |

Record the exact DTCG spec + transformer version once chosen.

## Figma ↔ code naming (1:1)
`Button↔Button`, `IconButton↔IconButton`, `Field↔Input`, `MaterialSwatch↔MaterialSwatch`, `PackageCard↔PackageCard`, `RightRail↔RightRail` (full map: `figma-code-map.json`). Never derive a page from generic frame CSS when an approved component exists; inspect the real component via Figma MCP.

## Props: never expose pseudo-states
`hover`, `pressed`, `focus-visible` are **not** production props — they are CSS pseudo-states + Storybook stories + interaction/pseudo-state tests. Production props: `variant size tone orientation disabled loading selected expanded required invalid fullWidth leadingIcon trailingIcon label helperText errorMessage value accessibleName` (per component in `component-registry.json`).

## Property → Storybook control mapping
Figma variant prop → `select`; boolean prop → `boolean`; text prop → `text`; instance-swap → mapped component/`select`; events → actions; slots → `children`/named slots.

## Story matrix (every public component)
Default · each variant · each size · disabled · loading · selected · invalid · long content · minimal content · leading icon · trailing icon · icon-only · desktop viewport · mobile viewport · high-stress combos · relevant interaction scenarios.

## Organization
```
Foundations/    (color, type, spacing, elevation, motion, icons — token docs)
Components/      (Button, IconButton, Link, Label, Input, Checkbox, Radio, Switch, Badge, Tab, Tooltip, MenuItem, ProgressIndicator, MaterialSymbol)
Product Components/ (OptionCard, MaterialSwatch, PackageCard, SelectionSummary, PriceAdjustment, ViewPresetControl, RoomSelector, ProgressCard, KeyDateCard, BottomActionTray)
Patterns/        (RightRail, GlobalNav, PackageBrowser, MaterialSelector, ColorPickerModal, ThreeDViewportShell, DashboardWidgetGrid, MobileSelectionSheet)
Templates/       (Dashboard, DesignCenter, Visualizer, BrowseSelections, ReviewSelections)
Pages/           (Dashboard, DesignCenter — full page stories)
```

## Rules
- Reuse child stories/args inside composite + page stories — don't recreate child states.
- Deterministic fixtures (`fixtures/*`). Mock 3D engine + APIs at the Storybook boundary; page stories must render without production services.
- Every page recipe gets executable stories: typical, loading, empty, error, max-content, desktop, mobile, interaction flow.
- Story types required per component: interaction tests, a11y tests, visual-regression tests.

## Status
No repository Storybook/code exists yet — this is a handoff spec. When repo access + stack are confirmed, scaffold `@envision/ui`, generate CSS vars from `tokens/`, implement components against the registry APIs, and wire Code Connect using `figma-code-map.json` node IDs.
