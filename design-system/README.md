# Envision Design System

Reverse-engineered from the live Envision product (https://envision-4tq.pages.dev/) and the `envision-app` codebase into a three-tier, white-label, AI-legible design system.

- **Figma library:** `Envision Design System` — fileKey `ZnnaoZcKjKhDxXFvfHr6fA` (20 pages, 290 variables, 17 text styles, 10 effect styles, 14 built components).
- **Status:** v0.1 · Candidate. Foundations + machine-readable system complete; code/Storybook pending stack confirmation.

## Read order
1. [`SYSTEM_SPEC.md`](SYSTEM_SPEC.md) — governing spec (architecture, tokens, taxonomy, a11y, responsive, content, white-label, page composition, DoD).
2. [`CLAUDE.md`](CLAUDE.md) — rules + workflow for any Claude/engineer building Envision UI.
3. [`component-registry.json`](component-registry.json) — authoritative component list, APIs, states, tokens, build status.
4. [`page-recipes.json`](page-recipes.json) — approved page compositions (shells, layout recipes, region contracts).

## Map
| File | What |
|---|---|
| `AUDIT.md` | Stage-A product/code audit + disposition + reconciliation decisions |
| `tokens/*.tokens.json` | DTCG tokens — primitives, brand, semantic, responsive, components |
| `tokens/tokens-table.md` | Flattened machine-readable token table (304 entries, CSS vars) |
| `component-registry.json` | Components: props, variants, states, a11y, tokens, Figma node IDs, maturity |
| `pattern-registry.json` | Composite patterns (RightRail, GlobalNav, viewport, modals, sheets) |
| `page-recipes.json` | Shells, layout recipes, region contracts, mapped pages |
| `state-model.json` | Interaction / selection / persistence / async / availability / validation states |
| `content-models.json` | Product data models (config, options, packages, wall colors, pricing…) |
| `figma-code-map.json` | 1:1 Figma↔code map + variable-collection IDs + Code Connect plan |
| `migration-map.json` | Existing element → replacement, disposition, priority, risks |
| `fixtures/*.json` | Deterministic fixtures (dashboard, design-center, packages, states) |
| `ACCESSIBILITY.md` | WCAG 2.2 AA baseline, per-component behavior, contrast results, manual checks |
| `STORYBOOK.md` | Handoff assumptions (provisional stack), story matrices, organization |
| `GOVERNANCE.md` | Roles, DoD, parity gate, contribution, versioning, Tier-3 criteria, deprecation |
| `MANIFEST.md` | System Build Manifest, parity matrix, QA dashboard |
| `AI-READINESS.md` | 3 validation exercises proving a fresh session can build without inventing |
| `decisions.md` / `changelog.md` | Decision log / release notes |

## Regenerate the token table
`node` over `tokens/*.tokens.json` → `tokens/tokens-table.md` (flatten `$value`/aliases to CSS vars).
