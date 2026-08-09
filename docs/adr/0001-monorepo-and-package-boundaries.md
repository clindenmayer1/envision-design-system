# ADR 0001 — Monorepo with incrementally-extracted design-system packages

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Design Systems lead (Envision)

## Context

Envision is both a product (a React 18 + React-Three-Fiber home/kitchen visualizer) and a
mature design system. Before this change, everything lived in a **single application repo**:
the app in `src/`, and a rich `design-system/` *folder* holding a real token pipeline
(Figma → DTCG → Style Dictionary → CSS/TS), machine-readable registries (component-registry,
page-recipes, content/state models, figma-code-map), and governance docs.

The design system had strong **logical** boundaries (governance rules, a token contract,
registries) but **no package boundaries**: nothing was independently versioned, built, or
consumable; the app couldn't "depend on" the design system, only sit next to it. The app was
also carrying residual duplication (raw hex alongside token usage, and an in-app copy of the
token CSS).

We needed a credible production architecture that establishes clear boundaries between
tokens, styles, components, utilities, tests, Storybook, documentation, and application code —
**without** rebuilding the product, changing the (frozen) token architecture, or restructuring
for convention's sake.

## Decision

Adopt an **npm-workspaces monorepo** and extract the design system into packages, **preserving
the running app and the established design-system architecture**:

1. `packages/tokens` (**`@envision/tokens`**) — the token pipeline + committed `dist/` (CSS + TS). Self-contained, independently built and tested. The app depends on it.
2. `packages/design-system` (**`@envision/design-system`**) — the system-of-record: registries, specs, governance, fixtures. Depends on `@envision/tokens`.
3. **The Envision app stays at the repo root** as the workspace's sole application and primary consumer, declaring workspace dependencies on both packages.
4. Workspace tooling: shared `tsconfig.base.json`, flat `eslint.config.js`, Changesets for per-package versioning, and a two-tier CI (design-system blocking, app advisory).
5. **Deferred but defined** (with a migration path, not scaffolded hollow): `@envision/components`, `@envision/react` adapter, `@envision/utils`, a Storybook workspace, and the app's token-CSS/naming reconciliation.

## Alternatives considered

1. **Do nothing / keep the single-package repo.** Rejected: no independent versioning, no way for the app (or future consumers) to *depend on* the design system, duplication persists.
2. **Textbook `apps/` + `packages/` monorepo — move the app into `apps/envision` now.** Rejected *for now*: moving a live-deployed 3D app (GLB assets, a Cloudflare Pages deploy from `dist/`, Vite/tsconfig paths) is the single highest-risk change for a purely cosmetic gain. The boundary we actually need (app depends on DS packages) is achieved without it. Promoting root→`apps/envision` is a mechanical follow-up once a second app exists.
3. **Extract components into `@envision/components` in this pass.** Rejected: that is a rewrite of the product's component boundaries — exactly the "do not rebuild" the brief forbids — and it should follow the token-consumption reconciliation, not precede it.
4. **Multi-repo (separate repos per package).** Rejected: premature. A single team, one product, and tight token↔app iteration make a monorepo's atomic changes and shared tooling strictly better here; multi-repo adds release/version coordination overhead with no current benefit.
5. **Turnkey monorepo tool (Nx / Turborepo).** Rejected as overengineering for the current size: npm workspaces cover linking, isolation, and independent builds with zero extra tooling. A task runner (Turborepo) is a drop-in later *if* build-graph caching becomes a bottleneck — noted, not adopted.
6. **Reconcile the token naming (`--envision-theme-*` ↔ `--envision-t1/t2/t3-*`) as part of this change.** Rejected: the brief freezes the token architecture; naming is a token-layer decision with product-visual risk, sequenced separately.

## Rationale

- **Preserve, don't rebuild.** The extraction moves files (via `git mv`, history-preserving) and adds manifests; it changes **no** app runtime code and **no** token architecture. The app still builds and deploys exactly as before.
- **Extract the lowest-coupling, highest-value layer first.** `@envision/tokens` is self-contained (JSON + build scripts + generated output) and independently verifiable, so it's the safe, real first package — and it's the concrete "consume the DS, don't duplicate" win.
- **Make the contract a package.** `@envision/design-system` turns the registries/governance from "a folder" into a versioned dependency other packages implement against.
- **Right-size the tooling.** npm workspaces (already npm 10) + Changesets + a small CI is credible and boring; no Nx/Turborepo weight until the build graph warrants it.
- **Honesty as a feature.** The architecture explicitly sequences what's deferred (component extraction, token-CSS reconciliation, Storybook, Vitest) with reasons, rather than shipping hollow packages to look complete.

## Tradeoffs

- **App at repo root is slightly non-canonical.** It reads as "root app + `packages/`" rather than `apps/` + `packages/`. Accepted deliberately (risk vs. cosmetics); trivially promotable later.
- **`@envision/tokens/dist` is committed.** Pro: diffable token changes in PRs, no consumer build step, and a CI drift check. Con: build output in version control (mitigated by the drift check that fails if `dist` ≠ source).
- **The app doesn't yet import `@envision/tokens/css`.** The dependency is declared and the boundary is real, but full de-duplication waits on the naming reconciliation — a known gap, documented, not hidden.
- **Two-tier CI (app advisory).** The app carries pre-existing TypeScript/lint debt, so its CI steps are non-blocking until burned down. Pro: CI is honest and green on what we control; con: the app isn't gated yet.
- **Deferred component package** means "clear component boundaries" are currently enforced by *governance* (`CLAUDE.md`, the registry) rather than a compiler/package boundary. Accepted as the safe sequencing.

## Scalability implications

- **More consumers:** a new app or a framework adapter plugs into the existing acyclic graph (`consumer → components → tokens`) with no restructuring — the reason to extract boundaries now.
- **More platforms:** `@envision/tokens` adds Style Dictionary platforms (Swift/Android/RN) from the same DTCG source; no new source of truth.
- **More packages:** `packages/*` grows (components, utils, adapters, Storybook) without touching the app or tokens; Changesets versions each independently.
- **Build performance:** independent package builds keep token regeneration cheap; if the graph grows enough to want caching/affected-only builds, Turborepo drops in over the same workspace layout.
- **Governance at scale:** the registry/contract in `@envision/design-system` is the single place new consumers read, so onboarding scales without tribal knowledge.

## Consequences / follow-ups

1. **Token-naming reconciliation** so the app consumes `@envision/tokens/css` directly (removes the last token duplication). *Highest priority.*
2. **Extract `@envision/components`** from `src/components` per the registry; stand up the **Storybook** workspace + **Vitest**; promote the app CI steps to blocking.
3. **Burn down** the app's pre-existing TypeScript/lint debt.
4. **Promote root → `apps/envision`** when a second application appears.
5. Adopt **Turborepo** only if/when build-graph caching is warranted.
