# Envision

**Envision** is a white-label homeowner / interactive home-design product (a React 18 +
React-Three-Fiber kitchen visualizer) **and the production design system built for it.**

This repository is the portfolio project: the product application in `src/`, and a real,
end-to-end design system in `packages/*` — Figma-derived tokens, a framework-agnostic Web Component
library, a React adapter, an executable-spec Storybook, and an enforceable automated quality
pipeline.

## What's here

| Path | What it is |
|---|---|
| `src/`, `public/` | The Envision product app (React 18 + R3F): the 3D kitchen visualizer, RightRail configurator, rooms selector, packages, etc. |
| `packages/tokens` | `@envision/tokens` — Figma snapshot → DTCG → Style Dictionary → CSS custom properties + typed TS (with responsive `@media`). |
| `packages/components` | `@envision/components` — the design-system components as **standards-based Web Components** (custom elements + Shadow DOM + ElementInternals), consuming the tokens. Zero runtime deps. |
| `packages/react` | `@envision/react` — a **thin** React adapter over the custom elements (no duplicated logic). |
| `packages/storybook` | `@envision/storybook` — the **executable technical specification**: every real component + state, rendered with the real tokens. |
| `packages/design-system` | The system-of-record: registries, governance, specs, accessibility contracts. |
| `docs/` | Architecture, ADRs, the **quality strategy** (+ Mermaid pipeline), and the **accessibility contracts**. |

## Run it

```bash
npm install

npm run dev            # the Envision product app (Vite)
npm run storybook      # the design system, live (:6006)

# Quality (see docs/QUALITY-STRATEGY.md):
npm run quality        # lint + typecheck + tokens + components + react + storybook build
npm run test           # token + component + adapter unit/contract tests
npm run test:a11y      # fast axe accessibility (unit)
npm run test:stories   # interaction + WCAG 2.2 AA a11y (Storybook test-runner, needs Chromium)
npm run visual         # visual regression vs committed baselines
```

## The design system in one line

Figma variables → tokens → framework-agnostic Web Components → thin React adapter → Storybook as the
runnable spec → a CI quality pipeline (lint · typecheck · token validation · unit/contract ·
accessibility · interaction · visual regression) that makes quality **enforceable, not a checklist**.

See [`docs/QUALITY-STRATEGY.md`](./docs/QUALITY-STRATEGY.md),
[`docs/ACCESSIBILITY-CONTRACTS.md`](./docs/ACCESSIBILITY-CONTRACTS.md),
[`packages/components/ARCHITECTURE.md`](./packages/components/ARCHITECTURE.md), and the ADRs in
`docs/adr/`.

## Notes

- The product app carries a small amount of pre-existing TypeScript debt; its CI checks are
  **advisory**. The design-system packages are fully green and gate all merges.
- This is a personal portfolio project. Not affiliated with any builder brand used for demo content.
