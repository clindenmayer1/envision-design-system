# @envision/tokens

The Envision design-token package. Figma variables → diffable snapshot → DTCG →
Style Dictionary → CSS custom properties (with the primitive→semantic→component alias
chain and responsive `@media` overrides) + typed TS/JS exports.

Full pipeline detail (including the responsive layer, breakpoint derivation, and
tradeoffs) lives in [`TOKEN-PIPELINE.md`](./TOKEN-PIPELINE.md).

## Layout
```
src/            DTCG source of truth
  _figma-export.txt      diffable Figma snapshot (name|$type|value[|mobile])
  *.tokens.json          primitives / brand / semantic / responsive / components (DTCG)
  build-dtcg.mjs         snapshot → DTCG
  tokens-table.md        reference table
lib/responsive.mjs       pure, tested responsive helpers
sd.build.mjs             Style Dictionary build + responsive emit
test/tokens.test.mjs     validation + generated-CSS tests
dist/                    build output (committed, diffable)
  tokens.css             all tiers, alias chain + @media overrides (import this)
  tokens.responsive.css  standalone responsive overrides
  {primitives,semantic,components}.css   per-tier splits (desktop-only)
  tokens.js, tokens.d.ts typed resolved values
```

## Scripts
| command | does |
|---|---|
| `npm run build -w @envision/tokens` | regenerate DTCG + all CSS/TS (incl. responsive) |
| `npm run test -w @envision/tokens` | validation + integration tests |
| `npm run verify -w @envision/tokens` | build then test |

(From the repo root: `npm run tokens`, `npm run test:tokens`, `npm run tokens:verify`.)

## Consuming
```css
/* CSS custom properties — the recommended import (self-complete, responsive) */
@import '@envision/tokens/css';
```
```ts
// Typed resolved values (JS/TS)
import { EnvisionT2ColorBackgroundBrandDefault } from '@envision/tokens';
```
Consumers reference Tier-2 / Tier-3 custom properties (`--envision-t2-*`, `--envision-t3-*`)
and never Tier-1 directly. See the design-system governance in
`@envision/design-system` (`CLAUDE.md`, `SYSTEM_SPEC.md`).

> **Known migration:** the Envision app currently consumes a legacy in-app copy of the
> token CSS using an older `--envision-theme-*` naming. Wiring the app to
> `@envision/tokens/css` (the current `--envision-t1/t2/t3-*` naming) requires a naming
> reconciliation — tracked as a follow-up, out of scope for the repository restructure.
