# ADR 0002 — Standards-based Web Components for the component library

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Design Systems lead (Envision)
- **Supersedes/extends:** the "deferred `@envision/components`" note in ADR 0001

## Context

The Envision design system was specification-complete (Figma library + `component-registry.json`
with APIs/states/tokens/a11y) but had **no component code**; `STORYBOOK.md` recorded the runtime as
"provisional." The product's `src/components` are application UI with real accessibility and
tokenization debt (see `packages/components/AUDIT.md`), not a reusable library. We needed to
implement the specified library as production infrastructure and, in doing so, choose its runtime.

The system's stated purpose is **white-label, multi-framework infrastructure** (`SYSTEM_SPEC` §9;
ADR 0001 already plans `@envision/react` and `@envision/vue`), and its theming is entirely CSS
custom properties (`@envision/tokens`).

## Decision

Implement the component library as **framework-agnostic Web Components** (custom elements + Shadow
DOM + `ElementInternals`), styled exclusively with the existing `--envision-*` tokens, and ship a
**thin React adapter** (`@envision/react`) that duplicates no component logic. Scope: the **14
`ready-for-review` components**; the 20 `proposed` ones are not invented.

## Alternatives considered

1. **React component library (only).** Simpler today (one consumer), but forecloses the explicit
   multi-framework goal: every future non-React surface re-implements components — the exact
   duplication the design system exists to prevent. Rejected as the *core*; React stays a
   first-class consumer via the adapter.
2. **Lit (or another WC base).** Viable and ergonomic, but adds a runtime dependency; a tiny
   zero-dep base class demonstrates the standards directly and keeps the core dependency-free.
   Rejected for now; could adopt later without changing the element contracts.
3. **Web Components "because other systems use them."** Explicitly rejected as a reason. The
   decision rests on *this* system's token architecture + multi-framework mandate.
4. **Defer components entirely (keep governance-only).** Rejected: the brief is to prove the system
   is production infrastructure, which requires real, tested components.

## Rationale

- CSS custom properties **inherit through Shadow DOM**, so encapsulated components remain fully
  themeable/white-labelable with zero extra machinery — the property that makes WC cheap *here*.
- One implementation, consumable from React now and Vue/Svelte/vanilla later via a thin adapter.
- Native encapsulation (style/DOM/a11y) is robust against the host app's leaked CSS (an audit
  finding).
- Zero runtime dependencies; the library is the platform + tokens.

## Tradeoffs

- `ElementInternals` (form participation) isn't in the jsdom/happy-dom test runtime → form controls
  are built on native inner `<input>`s (fully testable) and layer `setFormValue` when available;
  browser form submission is a staged Playwright check.
- React < 19 needs the adapter for prop/event ergonomics (React 19 is native). Accepted; ~70 lines.
- SSR/declarative Shadow DOM is a scoped follow-up (product is a client SPA today).
- Web Components are less familiar than React to product engineers — mitigated because they write
  ordinary React via the adapter and never touch a custom element.

## Consequences / follow-ups

1. `@envision/components` + `@envision/react` are implemented, tested (70 tests), and in CI
   (blocking). ADR 0001's "deferred component package" item is now **done**.
2. **Storybook** + Playwright/visual-regression stand up on top of the extracted components.
3. The **app** migrates onto `@envision/react` per surface, starting with the highest-debt areas
   (PackageCard, WallColorModal→RightRail sheet), after the token-naming reconciliation (ADR 0001).
4. Token-layer backlog from the audit: badge `brand`/`error` aliases, ghost/checkbox/radio/switch
   T3 tokens, per-size control tokens.
