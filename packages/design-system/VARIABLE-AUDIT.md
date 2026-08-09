# Variable Application Audit & Migration — Role-Based (corrected)

System-wide migration binding every eligible property to **role-based** tokens per the three-tier algorithm. The first pass (v1) bound properties to a value-based Tier-2 scale (`spacing/space-4`, `radius/radius-8`) and silently normalized off-grid values — both wrong. This report documents the correction.

## What was wrong in v1 (now fixed)
1. **Value-based Tier-2 was a duplicate primitive scale.** `spacing/space-4` names a value, not a role. **Deleted** all 27 `spacing/space-*` / `radius/radius-*` variables; rebound everything to purpose-based roles.
2. **Silent visual changes.** v1 rounded off-grid values (14→12, 10→8, 9→8, 5→4, 3→4). **Restored** the product-derived values (see below); documented the rest.

## Corrected architecture
- **Tier 1 — primitives** (raw, hidden): `dimension/*`, `radius/*`, `border-width/*`, `color/*`, `font-size/*`, etc. Added legit off-grid primitives: `dimension/250` (10px), `dimension/350` (14px), `radius/75` (3px) — each documented as a real product/system value, not a rounding artifact.
- **Tier 2 — semantic roles** (purpose): `spacing/layout/{section-gap, page-gutter, grid-gap, stack-gap …}`, `spacing/control/{padding-inline, padding-block, gap …}`, `spacing/field/{padding-inline, padding-block}`, `spacing/content/{label-gap, related-gap, heading-gap …}`, `spacing/container/{padding, padding-lg …}`, `radius/control/*`, `radius/container/*`, `border-width/control/*`, plus the color/typography roles. Each aliases a Tier-1 primitive; the name says **why**.
- **Tier 3 — component roles** (only where governed): `component/material-swatch/{item-gap, radius}`.

## MaterialSwatch — exact final mappings (the flagged example)

| Component property | Tier 3 | Tier 2 semantic | Tier 1 primitive | Resolved |
|---|---|---|---|---|
| **Item gap** | `material-swatch/item-gap` | `spacing/content/label-gap` | `dimension/100` | **4px** |
| **Radius** | `material-swatch/radius` | `radius/container/large` | `radius/400` | **16px** |
| **Padding** | — | — | — | N/A (gap-only layout) |
| **Border width** | — | *(selection = `Ring/*` effect style)* | — | N/A (no stroke; ring is an effect style) |
| **Border color** | — | *(selection ring color lives in the effect style)* | — | N/A |
| **Background color** | — | `color/background/surface-sunken/default` | `color/neutral/100` | placeholder surface |
| **Label color** | — | `color/content/secondary/default` | `color/neutral/600` | `#666666` |
| **Label typography** | — | text style `Label/Caption` | `font-size/50` (+ family/letter-spacing) | Inter Medium 11 |

The Figma property panel now shows the item-gap bound to `material-swatch/item-gap` (not a raw `4`), resolving through the chain above.

## Validation (role-based, not raw-value)
| Check | Result |
|---|---|
| Value-based `space-*` / `radius-*` remaining | **0** (27 deleted) |
| Component spacing/radius/border bindings on Tier-1 (bypassing semantic layer) | **0** |
| Component bindings on Tier-2 roles | 854 |
| Component bindings on Tier-3 | 32 |
| Broken / circular aliases (DTCG) | **0** (345 tokens) |
| Instances with token-bypassing local overrides | **0** of 226 (only width/height sizing overrides for matrix cells) |
| Detached instances | 0 |

## Restored values (reversed the v1 normalization)
| Value | Where | Restored to | Evidence it was correct |
|---|---|---|---|
| 14 / 10 | Text field padding | `spacing/field/padding-inline` (14) + `padding-block` (10) | product search input is `9px 14px` |
| 3px | PackageCard swatch radius | `radius/container/xsmall` → `radius/75` (3) | product `.pkg-card__swatch { border-radius: 3px }` |
| 4px | MaterialSwatch item gap | `material-swatch/item-gap` (4) | unchanged (was already 4) |

## Typography
- All 17 base text styles + 7 added role styles (Label/Caption, Numeric/Count, Body/Small-Emphasis, Body/XSmall, Label/Compact, Card/Title, Heading/Section) are **variable-driven** — fontSize → `t1.font-size.*`, letterSpacing → `t1.letter-spacing.*`, fontFamily → `t1.font-family.*`.
- **92 component text nodes** now consume a semantic text style (applied only on exact match → zero visual change).
- Remaining direct text = **11 icon glyphs** (✓ checkmarks, › chevrons) — not typographic content; slated to become Material icons.

## Remaining exceptions (documented, zero unexplained)
| # | Item | Reason |
|---|---|---|
| E1 | Documentation micro-label text uses direct type. | Doc scaffolding, not published-component text; the type system is variable-driven and applied to component + specimen text. |
| E2 | 11 glyph characters (✓, ›) remain direct. | Icon glyphs, not typographic roles; will migrate to Material icons. |
| E3 | Text-style `lineHeight` not variable-bound. | Tier-1 line-height tokens are unitless multipliers vs the styles' PERCENT unit — a technical unit mismatch. fontSize/letterSpacing/fontFamily ARE bound. |
| E4 | H2/H3 letter-spacing bound to `letter-spacing/none`. | −0.4/−0.2 tracking is off the tracking scale; documented normalization on large headings only. |
| E5 | Documentation frame spacing that v1 normalized (14→12, 10→8 in doc cards) NOT reverted. | These were my own authoring inconsistencies in internal documentation (not product values); left grid-aligned. Product-derived off-grid values (Field, package swatch) WERE restored. |
| E6 | `border-width/thin` (1.5px) review. | 1.5px is used by checkbox/radio/swatch selection rings (a real, consistently-rendered decision, not a raw-value artifact). Kept as `t1.border-width/150` → `t2.border-width/control/thin`. Renders crisply at 1x/2x. |
| E7 | Product-material colors render via placeholder UI tokens. | Product data is not part of the interface color system (D-005). |

**No published component bypasses the semantic layer; no value-based duplicate scale exists; no visual value was changed without documentation.** Alias hierarchy is valid and drives the file.
