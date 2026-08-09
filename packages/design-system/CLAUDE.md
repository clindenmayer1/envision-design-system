# CLAUDE.md — Rules for building Envision UI

You are generating or editing Envision UI (product: white-label homeowner + home-design platform). This design system is an explicit visual + technical language. **Do not invent visual rules, components, tokens, layouts, states, or interactions.** Follow this file exactly.

## Read before you build (in order)
1. `design-system/SYSTEM_SPEC.md` — architecture, tokens, taxonomy, a11y, responsive, content, white-label.
2. `design-system/component-registry.json` — what components exist, their props, states, allowed children, tokens, maturity, and whether they are built.
3. `design-system/page-recipes.json` — approved page compositions. **Never compose a page freehand.**
4. As needed: `state-model.json`, `content-models.json`, `pattern-registry.json`, `figma-code-map.json`, `tokens/*.tokens.json`.

## Hard rules (never violate)
1. **Use existing component exports.** Never recreate an existing component locally, copy its source into a page, or rebuild its visuals with page CSS.
2. **Tokenized values only.** Never use raw hex, arbitrary px spacing, arbitrary radius, arbitrary typography, arbitrary elevation, or arbitrary animation. Consume Tier 2 / Tier 3 tokens (`--envision-t2-*`, `--envision-t3-*`). Never consume Tier 1 (`--envision-t1-*`) directly.
3. **Never introduce a new shared visual treatment inside a page.** No new card type, no second RightRail, no bespoke button.
4. **Never bypass a component API with internal CSS selectors** or brittle descendant selectors. Style via props/slots.
5. **Never use an icon outside the approved Material Symbols registry** (page 06 / `iconography`). One family, one config.
6. **Never add a component or variant silently.** Follow the system-gap process (§ below).
7. **Product data (cabinet/paint/material colors) is not a UI token.** Render via MaterialSwatch/MaterialCard with data from content models; never as flat hex chrome.
8. **Selection/status/error are never color-only.** Use the ring ramp + check/icon/text.
9. **Never detach a page from the approved shell + layout structure.**
10. **Never invent backend, repository, or product facts.** If a field/route/service is unknown, label it proposed and stop.

## Page-level styling MAY control
Approved shell placement, approved layout recipes, grid composition, region-level spacing via semantic tokens, page-specific media placement, content order.

## Page-level styling MAY NOT redefine
Button/control/card/RightRail/form/nav/status appearance, the type scale, focus treatment, component breakpoints, icon appearance.

## New-page generation workflow (follow every step)
1. Read this file. 2. Identify page purpose, target user, primary task.
3. Search `page-recipes.json` for the closest approved recipe. 4. Select the shell. 5. Select the template.
6. Search `component-registry.json`; select approved components. 7. Identify data models (`content-models.json`).
8. Select/create approved fixtures (`fixtures/`). 9. **Output a page-composition plan BEFORE coding** (objective, user, task, recipe, shell, template, regions, components-by-region, data models, fixtures, required states, responsive behavior, a11y landmarks, interactions, tokens used, potential gaps).
10. Confirm whether a system gap exists. If a fundamental gap is unresolved, STOP.
11. Build using existing imports. 12. Create/update the Storybook page story.
13. Add loading, empty, error, and maximum-content states. 14. Add interaction, a11y, responsive, and visual-regression tests.
15. Run typecheck, lint, tests, build. 16. Compare to Figma (via Figma MCP or `figma-code-map.json`).
17. Report every system gap and exception. 18. Update registries only through governance.

## Required states on every page
`loading` (skeleton/byte-progress — see ThreeDViewportShell), `empty`, `no-results` (search), `error` (with retry), `maximum-content`. Wire these — do not omit.

## System-gap process (when something needed doesn't exist)
Do NOT approximate locally. Instead: (1) record the gap; (2) classify it (missing prop / slot / variant / component / pattern / token / page recipe); (3) search for an existing alternative; (4) decide if it's reusable; (5) propose the smallest system addition; (6) document token/a11y/responsive/Storybook impact; (7) obtain review before promoting to Stable; (8) update Figma → code → Storybook → registries → changelog. Never add a Tier-3 token to solve what composition or an existing Tier-2 role handles.

## Guardrails when writing a page
Import from approved public package paths (not private internals). Do not copy component source into the page. No inline hex / arbitrary px / one-off type / unregistered icons / new card type / new RightRail. No brittle descendant selectors. No duplicating responsive logic a component/template owns. No absolute positioning as a layout substitute. No mobile-by-scaling-desktop. Never mark a page complete when tests fail.

## Stack note
The runtime stack (framework/TS/styling/token transform) is **provisional** — see `STORYBOOK.md`. The current product is React 18 + TypeScript + Vite + plain CSS with CSS custom properties. Confirm before asserting import paths or that implementation can begin with zero decisions remaining.
