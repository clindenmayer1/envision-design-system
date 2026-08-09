# Envision Design System — Governance & Lifecycle

## Roles
- **System owner** — architecture, token tiers, releases, final approval.
- **Component owner** — a specific component's API, docs, parity.
- **Design reviewer** — visual/anatomy/variant correctness.
- **Engineering reviewer** — API, a11y semantics, token usage, tests.
- **Accessibility reviewer** — WCAG 2.2 AA + APG behavior sign-off.

## Status vocabulary (designer-facing)
The internal status badge uses plain-language statuses:

| Status | What it tells the designer | Machine `maturity` |
|---|---|---|
| **In progress** | Not ready to use yet | `experimental` |
| **Ready to use** | Approved, documented, and supported | `stable` |
| **Limited use** | Usable only for specific cases described in the documentation | `candidate` |
| **Deprecated** | Do not use for new designs; replace existing usage | `deprecated` |
| **Retired** | No longer available or supported | `retired` |

The JSON registries retain the machine `maturity` enum (`experimental` / `candidate` / `stable` / `deprecated` / `retired`); the table above is the human-facing label shown on Figma status badges and page headers. **Ready to use** requires the full Definition of Done + parity (below).

## Component acceptance checklist (Definition of Done)
A public component is **Stable** only when ALL hold:
purpose + classification documented · clean Auto Layout · meaningful layer names · values use tokens/styles · T2/T3 aliases resolve · component properties intentional · slots where appropriate · every legitimate variant/size/state present · desktop + mobile defined · long-label / translation / min / max content pass · focus visible + unclipped · a11y + keyboard + semantic-HTML documented · code name + prop API exist · Storybook story matrix exists · appears in ≥1 representative screen · passes component QA + parity.

## Parity gate (per component)
Stable requires: Figma exists · code exists · story exists · docs exist · props mapped · slots mapped · variants mapped · states mapped · tokens mapped · a11y documented · tests exist · Code Connect (where available) · visual parity · responsive parity. **A component cannot be Stable if it exists only in Figma, only in code, has unmapped Figma properties, omits supported states in Storybook, retains raw values, or lacks a11y/responsive behavior.**

## Contribution process
1. Open a gap (see CLAUDE.md system-gap process). 2. Classify (prop/slot/variant/component/pattern/token/recipe). 3. Confirm reusability + no existing alternative. 4. Propose the smallest addition. 5. Document token/a11y/responsive/Storybook impact. 6. Design + Eng + A11y review. 7. Build Figma → code → Storybook. 8. Update registries + figma-code-map + changelog. 9. Promote maturity.

## Criteria for a **new Tier-3 token**
Only when a component has a real, durable requirement Tier 2 cannot represent, and composition/an existing Tier-2 role cannot solve it. Must alias Tier 2 (direct-T1 only as a documented exception). Never to hide an architecture problem or for convenience.

## Criteria for a **new component**
The need is reusable (≥2 real uses or a clear product pattern), not solvable by props/slots/variants of an existing component, and has a distinct API. Otherwise extend an existing component.

## Criteria for a **new variant**
A finite, meaningful, product-observed difference. Not a one-off; not achievable via a boolean/slot; won't cause variant explosion.

## Criteria for a **new page recipe**
A repeated page family not covered by an existing recipe. Requires shell + template + region contracts + fixture + responsive + a11y before approval.

## Versioning
SemVer on the token+component package. MAJOR = breaking token/prop/removal; MINOR = additive (new tokens/components/variants); PATCH = fixes/docs. Token removals require a Deprecated period + migration entry.

## Release notes format
`[version] — date (maturity)` with Added / Changed / Normalized / Deprecated / Removed / Known-gaps. See `changelog.md`.

## Deprecation & migration
Mark token/component Deprecated with description + replacement + removal target. Add a `migration-map.json` entry (existing → replacement, data/prop changes, priority, risks). Keep the deprecated item ≥1 minor version. Migrate representative screens first; preserve existing screens until migrated.
