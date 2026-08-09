# @envision/components

The Envision design system's components as **standards-based Web Components** (custom elements +
Shadow DOM + ElementInternals), consuming `@envision/tokens`. Framework-agnostic; zero runtime
dependencies. The React adapter lives in `@envision/react`.

- **Architecture & the Web-Components decision:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Per-component API / states / tokens / a11y:** [`COMPONENTS.md`](./COMPONENTS.md)
- **Production-hardening audit:** [`AUDIT.md`](./AUDIT.md)

## Install / use

```ts
import '@envision/tokens/css';   // load design tokens once, at the document level
import '@envision/components';    // registers all <envision-*> elements
```
```html
<envision-button variant="primary" label="Apply"></envision-button>
<envision-input label="Email" type="email" required></envision-input>
```

Tokens (`--envision-t2/t3-*`) inherit through the shadow boundary, so white-label/theming works
unchanged. Consume Tier-2/Tier-3 custom properties; never Tier-1.

## Implemented (14 designed components)

Button · IconButton · Link · Label · Input · Checkbox · Radio · Switch · Badge · Tab ·
MaterialSwatch · OptionCard · PackageCard · RightRail.

The 20 `proposed` (not-yet-designed) registry components are intentionally not built. See
`@envision/design-system/component-registry.json` for the full contract.

## Scripts

| command | does |
|---|---|
| `npm run build -w @envision/components` | emit ESM + `.d.ts` to `dist/` |
| `npm run test -w @envision/components` | Vitest + happy-dom contract tests |
| `npm run verify -w @envision/components` | typecheck + test |

## Layout

```
src/base/         EnvisionElement (shadow, adopted styles, batched sync render), css``, internals
src/<name>/       <Name>.ts + <Name>.test.ts   (one folder per component)
src/define.ts     registers every <envision-*> tag (idempotent)
src/index.ts      side-effect register + class/type exports
```
