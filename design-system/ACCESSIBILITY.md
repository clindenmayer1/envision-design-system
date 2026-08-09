# Envision Design System — Accessibility

**Target: WCAG 2.2 AA.** Behavior per WAI-ARIA Authoring Practices (APG). WCAG **2.4.13 Focus Appearance** is treated as an enhanced internal quality target, **not** an AA gate (it is AAA). Automated testing does not establish conformance — manual checks are required.

## Global rules
- **Visible focus** — 2px brand ring (`t2.color.border.focus`), never clipped, never obscured, remains visible against adjacent colors.
- **Contrast** — text meets AA; meaningful icons + control boundaries meet non-text contrast (1.4.11); test text over architectural renderings and scrims over the 3D viewport.
- **Never color-only** — status, selection, error, progress, save, availability, applied all carry an icon/shape/text (rings + checks + labels).
- **Forms** — persistent labels (never placeholder-as-label); required communicated visually (asterisk before label) + programmatically (`aria-required`); errors associated (`aria-invalid` + `aria-describedby`).
- **Icon-only controls** — accessible name required; tooltip when ambiguous; tooltips never hold otherwise-unavailable essential info; hover/focus content dismissible (Esc) and hoverable.
- **Motion** — respect `prefers-reduced-motion` (product already gates the tray stagger).
- **Targets** — meet WCAG 2.5.8 minimum; aim ~44px where layout permits.
- **Text-spacing** — layouts stay usable under increased line/word/letter/paragraph spacing (1.4.12).

## Per-component behavior (summary)
| Component | Role / semantics | Keyboard | Key ARIA |
|---|---|---|---|
| Button | `button` (or polymorphic `a`) | Enter/Space | aria-busy(loading), disabled |
| IconButton | `button` | Enter/Space; tooltip Esc | aria-label=accessibleName, aria-pressed(toggle) |
| Link | `a[href]` | Enter | — |
| Field/Input | `input` + `label` | text editing | aria-invalid, aria-describedby, aria-required |
| Checkbox | `input[checkbox]` | Space | checked; check glyph (not color-only) |
| Radio | `input[radio]` group | Arrows move, Space selects | group semantics |
| Switch | `role=switch` | Space/Enter | aria-checked |
| Tabs/Tab | `tablist`/`tab`/`tabpanel` | Arrows, Home/End | aria-selected, controls panel |
| Badge | text/status | — | count via aria-label; adjacent text conveys meaning |
| MaterialSwatch | `button` toggle | Enter/Space | aria-pressed; name = material+finish+price; ring+check not color-only |
| OptionCard | `button` (whole card) | Enter/Space | no nested interactive; opens tray |
| PackageCard | `button` (select) + nested Customize control | Enter/Space select | valid nested-control pattern (stopPropagation) |
| RightRail | `complementary` (desktop) / `dialog` (mobile sheet) | Tab within; Esc closes sheet | focus trapped only as modal; return focus on close |
| ColorPickerModal | `dialog aria-modal` | Tab within; Esc reverts | focus managed; preview announced |
| ThreeDViewportShell | region | controls only when ready | aria-busy(loading), assertive on error |

## Required manual checks (per component + inside complete screens)
Keyboard-only operation · screen-reader naming · SR state communication · visible focus · unobscured focus · 200% zoom · 400% zoom / reflow · increased text spacing · reduced motion · forced-colors / high-contrast · touch targets · long content · translated content · error recovery · modal + drawer focus management · context inside full Envision screens.

## Contrast results (spot checks, foreground on background)
| Pair | Ratio | Verdict |
|---|---|---|
| content/primary `#222` on surface `#FFF` | ~15.9:1 | AA/AAA |
| content/secondary `#666` on surface `#FFF` | ~5.7:1 | AA |
| content/subtle `#8A8A82` on surface `#FFF` | ~3.4:1 | AA large / non-text only — **do not use for essential small text** |
| on-brand `#FFF` on brand `#29594F` | ~7.4:1 | AA/AAA |
| content/brand `#29594F` on surface `#FFF` | ~7.4:1 | AA/AAA |
| status warning `#C99A3A` on `#FFF` | ~2.5:1 | **fails text** — pair with dark text/icon; use `#856322` (warning.700) for text |
| status success `#3F9D5A` on `#FFF` | ~3.0:1 | large/non-text; use success.700 for small text |

Action items: promote subtle-gray and status text usages to darker steps (600/700) where they carry essential small text; verify scrim-over-viewport text at runtime.
