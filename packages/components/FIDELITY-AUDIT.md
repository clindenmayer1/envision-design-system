# Envision Components — Visual Fidelity Audit (three-way)

Systematic comparison of every DS component against the **website's original design** (the deployed
Envision app CSS = source of truth, per direction), the **Figma design system**, and the **built
component**. Where they disagree, the website is authoritative; each fix binds to an **existing**
token (no new tokens/primitives), chosen **per component** so the shared `control` token's value is
never changed (no cascade to other components).

**Headline:** the drift is systemic, not just the outline color. Components pervasively use
`font: inherit` (no explicit size) and never set `font-weight`, where the website has explicit
type; and several radii / element sizes differ. The **Figma DS itself has also drifted** from the
website (e.g. button 15px vs website 14px; radius 6 vs 8–10), so Figma is corrected too.

Legend: ✓ = matches website · ✗ = drift to fix · ⚑ = normalization judgment call (website was
internally inconsistent).

---

## Button  (canonical = the website primary CTA)
| Property | Website | Figma DS | Component (before) | → Target (existing token) |
|---|---|---|---|---|
| font-size | **14px** | 15px | `inherit` (~16) ✗ | `t1.font-size.14` |
| font-weight | **600** | 600 | unset (~400) ✗ | `t1.font-weight.600` |
| radius | 10 (primary) / 8 (Customize) ⚑ | 6 | 6 ✗ | `t2.border-radius.container-md` (10) |
| padding block | **14** | 8 | 8 ✗ | `t1.spacing.14` |
| padding inline | 16 | 16 | 16 ✓ | (unchanged) |
| gap / border | 8 / 1 | 8 / 1 | 8 / 1 ✓ | (unchanged) |

⚑ Website primary CTA is radius 10; the Customize secondary was 8. Normalized the Button family to
**10** (the prominent CTA). Outline/ghost inherit the same radius.

## Tab  (RightRail tabs)
| Property | Website | Component (before) | → Target |
|---|---|---|---|
| font-size | **14px** | `inherit` ✗ | `t1.font-size.14` |
| font-weight | **600** | unset ✗ | `t1.font-weight.600` |
| padding | **16px 0 14px** | 8/12 ✗ | `t1.spacing.16` top / 0 inline / `t1.spacing.14` bottom |
| inactive color | **#8a8a82** (content/tertiary) | `t3.tab.default` (#666) ✗ | `t2.color.content.tertiary` |
| selected color | #222 (content/primary) | `t3.tab.selected` ✓ | (unchanged) |
| indicator | 2px, radius 1px | 2px ✓ | (unchanged) |

## OptionCard
| Property | Website | Component (before) | → Target |
|---|---|---|---|
| title font-size | **14** | `inherit` ✗ | `t1.font-size.14` |
| title weight | **600** | unset ✗ | `t1.font-weight.600` |
| note font-size | 13 | 13 (`0.8125em`) ✓ | `t1.font-size.13` (explicit) |
| note weight | **500** (medium) | unset ✗ | `t1.font-weight.500` |
| note line-height | 1.6 | unset ✗ | `t1.line-height.160` |
| padding | **12** | 8/16 ✗ | `t1.spacing.12` |
| radius | 6 | 6 ✓ | (unchanged) |
| thumb size | **70–72px** | 40 (2.5rem) ✗ | 72px |
| thumb radius | **4** | 6 (control-sm=4? was control-sm) ✗ | `t2.border-radius.control-sm` (4) |
| chevron font-size | 20 | unset ✗ | `t1.font-size.20` |

## MaterialSwatch  (OptionSwatch)
| Property | Website | Component (before) | → Target |
|---|---|---|---|
| chip radius | **4** | 10 (`t3.material-swatch.radius`) ✗ | `t2.border-radius.control-sm` (4) |
| label font-size | 11 | (no label rendered) ✗ | `t1.font-size.11` + render label slot |
| label line-height | 1.15 | — | `t1.line-height.110` |
| selected ring | white gap + taupe-600 | ✓ | (unchanged) |

## PackageCard
| Property | Website | Component (before) | → Target |
|---|---|---|---|
| card radius | 12 | 12 ✓ | (unchanged) |
| title font-size | **19** | `inherit` ✗ | `t1.font-size.18` (nearest; 19 not on scale) ⚑ |
| title weight | **700** (bold) | 600 ✗ | `t1.font-weight.700` |
| price font-size | **13** | 14 (`0.875em`) ✗ | `t1.font-size.13` |
| badge font-size | 12 / 600 | (Badge cmp) | `t1.font-size.12` |

⚑ Website package title is 19px, which is **off the type scale** (scale jumps 18→20). Nearest
existing = 18. Flagged (adding a 19px primitive would be a new token — declined per direction).

## Input
| Property | Figma DS (no direct website field) | Component (before) | → Target |
|---|---|---|---|
| font-size | 15 | `inherit` ✗ | `t1.font-size.15` (DS value; no website field to match) |
| radius | control (6) | 6 ✓ | (unchanged) |
| padding | 8/12 | 8/12 ✓ | (unchanged) |

## RightRail
| Property | Website | Component (before) | → Target |
|---|---|---|---|
| width | 392 | 392 ✓ | (unchanged) |
| left border | 1px hairline | ✓ | (unchanged) |
| header title font | (n/a exact) | 18 (1.125rem) | keep 18 (`t1.font-size.18`) |

## Checkbox · Radio · Switch · Link · Label
No first-class website equivalent in the shipped product UI (native checkboxes appear only in
internal dev panels — StudioPanel/CameraControlPanel — not the product). These keep the Figma DS
values; type set explicitly (`t1.font-size.14` / `t1.font-weight.400`) instead of `inherit`, for
consistency. Flagged as "no website reference."

---

## Focus-state audit (all components)
Every one of the **13 focus-state variants** in the Figma DS was checked. All correctly signal
focus via `color/border/focus` (Button primary/outline/ghost, IconButton filled/plain, Link,
Switch), the input focus token (`input/default/color-border/focus`), or a focus-ring child element
(Checkbox, Radio). **One was wrong:** the outline-Button Focus variant had been left on
`color/border/default` (a regression from the outline color fix) — corrected to
`color/border/focus` at 2px. The component code was already correct (border stays hairline; the
focus ring is an added `:focus-visible` outline in `color/border/focus`).

## Reconciliation of structural drift
- **`t3.material-swatch.radius`** — verified correct: it aliases `border-radius.control-sm` = **4px**
  in the pipeline, matching Figma and the website. (An earlier note claimed a 10px pipeline drift;
  that was a misread of a component CSS *fallback* — there is no drift. The token = 4 everywhere.)
- **PackageCard "Customize"** — the Figma card used a full Button instance (14px / radius-10), while
  the website's Customize is a distinct smaller secondary (13px / radius-8 / hairline). The
  component already renders it correctly as its own secondary; the Figma Customize was reconciled to
  match (font 13, radius 8).

## Reconciliation rules applied
1. **Website authoritative**; each fix binds to an existing token chosen **per component** — the
   shared `control` radius/padding token value is left unchanged, so no other component shifts.
2. **Type is set explicitly** everywhere (no more `font: inherit`) using `t1.font-size.*` /
   `t1.font-weight.*` / `t1.line-height.*` — the same primitives Figma binds text to.
3. **Off-scale website values** (package title 19) map to the nearest existing token and are
   flagged; no new primitives are created.
4. Changes propagate **downstream** (component code + token bindings + docs) and **upstream**
   (Figma variables/components). Figma **library publish** is a manual UI step (no API), flagged in
   the report.
