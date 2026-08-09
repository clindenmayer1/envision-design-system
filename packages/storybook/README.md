# @envision/storybook

The **executable technical specification** of the Envision Design System. Every example is the real
production Web Component (`@envision/components`) rendered with the real production tokens
(`@envision/tokens`) — no Storybook-specific approximations.

## What it is (and isn't)

This is **not** a component gallery. It is the runnable source of truth for the system, and it is
configured to serve six roles at once:

- **executable component reference** — live components + full API via Controls,
- **state library** — every meaningful state as a story,
- **technical documentation** — per-component MDX (overview → anatomy → when to use/not → states →
  behaviour → accessibility → content → API → tokens → examples),
- **interaction-testing environment** — `play` functions (keyboard/focus/activation),
- **accessibility-testing environment** — the axe (WCAG 2.2 AA) panel on every story,
- **visual-regression source** — the rendered stories are the canonical snapshot frames.

## Storybook vs the documentation site

**Storybook = the spec you can run.** The dedicated **docs site = the system you reason about**
(foundations, methodology, patterns/page-recipes, accessibility guidance, adoption, governance,
releases, contribution, education). If a claim can be *proven by running the component*, it lives
here; if it's about *judgement, process, or the system as a whole*, it lives on the docs site. See
**Introduction → Storybook vs the docs site** inside Storybook for the full split.

## For engineers

- The **Docs** tab of each component is the API reference (attributes/properties/events) and the
  narrative. Every doc shows both usages:
  ```html
  <envision-button variant="primary" label="Apply"></envision-button>
  ```
  ```tsx
  import { Button } from '@envision/react';
  <Button variant="primary" label="Apply" onClick={apply} />
  ```
- Load tokens once in the app: `import '@envision/tokens/css'`.
- Run interaction + a11y tests headlessly with `npm run test:stories` (test-runner + Playwright).

## For designers

- Confirms real behaviour a static frame can’t: focus order, keyboard, loading, content overflow,
  and the RightRail’s responsive rail→sheet re-composition.
- Use the **Backgrounds**, **Viewport**, and **Theme** toolbars to check surfaces, breakpoints, and
  light/dark. Verify that selection/status are never colour-only (ring + check + label).

## Scripts

```bash
npm run storybook   -w @envision/storybook   # dev server, :6006
npm run build       -w @envision/storybook   # static build → storybook-static/ (visual-regression source)
npm run test:stories -w @envision/storybook  # headless play + a11y tests
```

Storybook consumes the built `@envision/components` and `@envision/tokens`. Build those first
(`npm run components && npm run tokens` from the repo root).

## Layout

```
.storybook/
  main.ts            framework (web-components-vite) + stories glob + addons (essentials, a11y, interactions)
  preview.ts         imports @envision/tokens/css + @envision/components; backgrounds, viewports, a11y, theme toolbar
  preview-head.html  Inter + Material Symbols fonts (reach shadow DOM)
  manager.ts         Envision-branded sidebar theme
stories/
  Introduction/      Overview · Using this Storybook · Storybook vs the docs site
  Foundations/       Color · Typography · Spacing & Radius   (live from tokens)
  components/        control primitives — *.stories.ts (+ Button/Input full MDX)
  product/           MaterialSwatch · OptionCard · PackageCard
  patterns/          RightRail (+ MDX)
```

## Documentation coverage

Every component has a live **Docs** page (autodocs: description, full API table, and all
state/example stories). **Button**, **Input**, and **RightRail** carry hand-authored MDX with the
complete section set as the template the remaining components follow.
