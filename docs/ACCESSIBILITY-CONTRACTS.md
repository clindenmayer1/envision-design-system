# Envision — Accessibility Contracts

The explicit, enforceable accessibility contract for each interactive component. **Baseline: WCAG
2.2 AA**, behaviour per the WAI-ARIA Authoring Practices. Each contract line is tagged with how it
is verified:

- **[unit]** — Vitest contract test and/or `vitest-axe` (headless, every PR).
- **[axe]** — Storybook test-runner + axe in real Chromium (contrast, rendered ARIA, every PR).
- **[play]** — Storybook `play` function (keyboard / focus / activation, every PR).
- **[manual]** — human review; automation cannot verify it (see QUALITY-STRATEGY.md).

## Global contract (all components)
- **Semantic structure** — real elements (`<button>`, `<a>`, `<input>`, `<label>`), never
  clickable `<div>`s. **[unit]**
- **Focus visibility** — a 2px brand focus ring (`--envision-t2-color-border-focus`), unclipped.
  presence **[unit]** · painted-and-visible-in-context **[manual]**
- **Contrast** — text & meaningful non-text meet AA. **[axe]** (rendered) · edge cases **[manual]**
- **Not color-only** — selection/status/error carry ring + check + text. presence **[unit]** ·
  *meaningfulness* **[manual]**
- **Reduced motion** — animations gated by `prefers-reduced-motion`. code path **[unit]** ·
  perceived reduction **[manual]**
- **Touch targets** — ≥ 24px (2.5.8), aim ~44px. **[manual]**
- **Screen-reader announcement quality** & **end-to-end keyboard journey** — **[manual]**

---

## Button — `<envision-button>`
| Aspect | Contract | Verified |
|---|---|---|
| Semantic structure | real `<button type>` in shadow | [unit] |
| Accessible naming | name from `label` | [unit][axe] |
| Keyboard | Enter/Space activate; not focusable when disabled | [play][unit] |
| Focus management | platform; ring on focus-visible | [play] |
| ARIA | `aria-busy` when loading; `disabled` reflected | [unit] |
| Disabled | removed from tab order, activation blocked | [unit] |
| Loading | `aria-busy`, re-activation blocked, stays focusable | [unit] |
| Contrast | primary/outline/ghost text on their surfaces | [axe] |

## IconButton — `<envision-icon-button>`
Accessible name is **mandatory** (`accessibleName`) — icon-only has no visible text **[unit][axe]**;
`aria-pressed` only when a toggle **[unit]**; Enter/Space **[play]**; icon color must contrast with
its (possibly brand) background **[axe]** (a real bug this suite caught).

## Link — `<envision-link>`
Real `<a href>` **[unit]**; Enter activates **[manual]**; disabled drops `href` + tab order + sets
`aria-disabled` **[unit]**; distinguishable from body text (underline, not color-only) **[axe][manual]**.

## Input — `<envision-input>`
Persistent `<label>` associated by id (never placeholder-as-label) **[unit][axe]**; `aria-required`
**[unit]**; **error**: `aria-invalid` + `aria-describedby`→message **[unit][axe]**; helper likewise
associated **[unit]**; focus ring on focus-within **[play]**; error text contrast **[axe]**.

## Checkbox / Radio / Switch
Native `<input>` semantics **[unit]**; checked/selected state is a **shape** (tick / filled dot /
thumb position), not color-only **[unit][axe]**; **Radio** implements the APG roving-tabindex group
(Arrow/Home/End, single-selection by name) **[play][unit]**; **Switch** is `role=switch`, Space/Enter
toggle **[play][unit]**; required/invalid wired **[unit]**; group has an accessible label **[manual]**.

## Tab — `<envision-tab>`
`role=tab` + `aria-selected`; **requires a `role=tablist` parent** **[unit][axe]**; roving tabindex +
Arrow/Home/End, selection-follows-focus **[play][unit]**. Note: because tabs are separate custom
elements, cross-shadow `aria-controls`→panel IDREF is **not** used (invalid across shadow roots) —
the panel is a labelled region; full tab/panel association needs a same-scope Tabs container (a
tracked follow-up).

## MaterialSwatch — `<envision-material-swatch>`
Toggle `<button>`, `aria-pressed` **[unit]**; accessible name = material + finish + price
**[unit][axe]**; selection = **ring + check** (not color-only) **[unit][manual]**; unavailable blocks
selection & is conveyed non-visually **[unit]**.

## OptionCard — `<envision-option-card>`
The **whole card is one `<button>`**, no nested interactive **[unit]**; `aria-expanded` reflects the
tray **[unit]**; note contrast (incl. the price-pending state) **[axe]** — a real contrast bug this
suite caught. **Known exception:** the RightRail *loading dim* transiently reduces contrast; tracked
below.

## PackageCard — `<envision-package-card>`
Real select `<button>` **and a separate** Customize `<button>` — no div-as-button, no nested buttons
**[unit][axe]**; `aria-pressed` on select **[unit]**; labelled actions **[unit]**; image has
loading/ready/error states **[unit]**.

## RightRail — `<envision-right-rail>`
`role=complementary` (desktop) / `role=dialog aria-modal` (mobile sheet) **[unit][axe]**; the sheet
**traps focus**, moves focus in, **Esc closes**, returns focus to the opener **[unit][manual]**;
`aria-busy` while loading **[unit]**; tablist has `role=tab`/`aria-selected` **[axe]**.

---

## Documented exceptions & follow-ups
- **RightRail loading dim** — the transient `opacity` loading treatment reduces contrast below AA
  *while loading only*; content passes at rest. Contrast is scoped-off on that one story with a
  documented reason. **Follow-up:** replace the dim with skeleton placeholders (no dimmed real text)
  so no exception is needed.
- **Tabs container** — a same-shadow `Tabs` component would restore proper tab↔panel `aria-controls`
  association; the single Tab primitive is correct on its own.

Every exception is scoped to the smallest surface and carries a reason and a follow-up — the system
never silently lowers the bar.
