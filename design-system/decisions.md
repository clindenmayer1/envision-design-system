# Envision Design System — Decisions Log

Senior/principal-level decisions and their rationale. Newest first.

## D-016 — Documentation uses labeled instance matrices; component families split
Every component page's primary specimen is now a full-width **comparison matrix built from live component instances** (not text stand-ins), with labeled row/column axes chosen from the component's *actual* variants — no invented sizes/states. Axes: Button = Appearance × State; Checkbox/Radio/Switch = Selection × State; Badge = Tone × Shape; Field = State table; single-axis components (Icon Button, Link, Tab) get a labeled state strip. Guidance is split into separate **Usage / Accessibility / Implementation / Tokens** callouts. Combined families were split into their own pages — **Buttons**, **Icon Buttons**, **Links** — since the previous "Buttons & Links" combined unrelated families. Visible status uses the designer-facing vocabulary ("Ready to use", never "Published"). The generation algorithm (audit → token → component → naming/token verification) is unchanged; only the presentation/organization changed.

## D-015 — Icons standardized to Material Icons, replacing inline SVGs
Envision currently renders every UI icon as a hand-drawn inline `<svg>` (no icon library). The system replaces these with canonical Material icons via ligature. **The 12 icons Envision uses today** map as: bell→`notifications`, account/room caret→`expand_more`, tray prev/next→`chevron_left`/`chevron_right`, tray+modal close→`close`, wall-color search→`search`, save / save-color→`bookmark`, applied/selected/done→`check`, package note→`info`, what's-next / start→`arrow_forward`, key dates→`calendar_today`, account→`account_circle`. Plus a vetted near-term extended set (home, menu, tune, palette, view_in_ar, add, edit, delete, download, filter_list, favorite(_border), star, check_circle, error, warning, visibility, zoom_in, sync, person, list, arrow_back, more_horiz, bookmark_border). One family, one config (Regular, 32px, `color-icon` token). **Figma-env note:** the installed font is **Material Icons** (classic) — same ligature names as Material Symbols — used to render the specimens; code should import **Material Symbols** (the canonical target) since the ligature names are compatible. **Not applied to the website** — design system only.

## D-014 — Georgia wordmark substituted in Figma specimen
Georgia is not installed in the Figma environment. The `Display/Hero` text style and wordmark specimens use Playfair Display as a stand-in. **Code keeps Georgia for the wordmark.** Documented; not a token change.

## D-013 — Selection rings as effect styles, not borders
The product expresses selection/hover/pressed/selected as layered `box-shadow` rings (taupe ramp), not borders. Preserved this exactly as 4 effect styles (`Ring/Rest|Hover|Pressed|Selected`) so components match the product's warm, inset-ring feel rather than a flat border.

## D-012 — Error red added despite no destructive UI in product
The live product has no destructive-red anywhere. Added an `error` ramp (red) for accessibility/messaging completeness and future destructive actions, flagged `needs-confirmation` in the migration map and token descriptions. The notification badge stays accent-orange.

## D-011 — RightRail width is 392px (not 416)
Code comments claim 416/Figma-416, but the actual CSS is `width:392px`. The token `t2.responsive.layout.right-rail-width` and `t3.right-rail.default.width` use **392** (evidence over comment).

## D-010 — Responsive as modes, not device variants (mostly)
Only heading sizes + a few layout dimensions change by device, so those live in `T2 · Responsive` (desktop/mobile modes). Anatomy/interaction changes (rail→sheet) are handled by composition, not a Device variant. Responsive modes are not a substitute for layout logic.

## D-009 — Brand seam isolated to `T2 · Brand`
Branded-house: only primary ramp + accent + display/wordmark fonts change per builder. A new builder = a new mode in `T2 · Brand`, not a forked system. Semantic color aliases point at brand so one mode swap re-themes everything.

## D-008 — Three inconsistent hover greens reconciled to two steps
`#21493f / #234c43 / #1f453d` → `green.600 #234C43` (hover) + `green.700 #1F453D` (pressed). Normalization; minor visual shift on hover accepted.

## D-007 — Ink/ink-soft canonicalized
`--ink #222222` and `--ink-soft #666666` are canonical; hardcoded fallbacks `#2b2622 / #6c6359` are treated as drift to be migrated.

## D-006 — `--line #765D49` tokenized as base + alpha ramp
Never used as a solid in product — only as `rgba(118,93,73, α)` at ~9 alphas. Captured as `brown.500` + `brown.a-07…a-40`.

## D-005 — Product/material colors are content, not tokens
Cabinet finishes, 279 Benjamin Moore paints, textures, metals = product data in `content-models.json`, rendered via MaterialSwatch. Kept out of the color system entirely.

## D-004 — Tier 3 kept minimal
Tier 3 only where Tier 2 can't carry a durable requirement (rail width, top-bar/header heights, tray max-width, package-card radius/ratio/selected-border, option-card ring aliases, badge sizes). Direct-T1 refs are enumerated exceptions. Everything else composes from Tier 2.

## D-003 — Dev tools excluded from the public library
StudioPanel / PoseReadout / DebugTargetsPanel are `?studio=1`-gated dev tools → **Retire** from the published system; never publish.

## D-002 — Type scale consolidated
Product one-offs (9/10/10.5/11.5/19px …) consolidated to a documented ramp; body baseline 16, 12 never for labels/pricing/instructions.

## D-001 — Three-tier token architecture adopted (governing)
Per the supplied algorithm. Transcript's Brand→Tier1, Alias/Mapped→Tier2 semantic, genuine component values→Tier3, responsive→its own collection/modes. No conceptual fourth tier.
