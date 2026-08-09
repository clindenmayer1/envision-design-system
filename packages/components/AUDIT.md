# Envision Component Library — Production-Hardening Audit

Audit performed before/while implementing `@envision/components`. It covers (a) the **existing**
Envision UI (`src/components`) against the design system's law, (b) the **registry contracts** vs
the **emitted tokens**, and (c) how each requested hardening dimension is resolved in the new
library. Legitimate issues that required a change are called out with the reason, per the brief.

## Method

- Read the system-of-record (`SYSTEM_SPEC.md`, `component-registry.json`, `ACCESSIBILITY.md`) as
  the authority on the established design.
- Static + read-through audit of all 33 `src/components` `.tsx`/`.css` files.
- Cross-checked the registry's `tokenDependencies` against the pipeline's emitted
  `--envision-*` custom properties (`packages/tokens/dist/tokens.css`).

## Headline

The design system is **specification-complete but had no component code**. `src/components` is
**application UI**, not a reusable library, and carries real accessibility and tokenization debt.
So "harden the existing library" means implementing the specified library as production
infrastructure (this package) — which is done for the 14 designed components — and recording the
app-side debt as the migration target.

---

## A. Current implementation (`src/components`) findings

Token adoption is **bimodal**: only `OptionCard` and `PackagesTab` are genuinely tokenized; the
rest use raw values or a hex-as-fallback anti-pattern.

| # | Systemic issue | Evidence (representative) |
|---|---|---|
| 1 | **Raw hex everywhere except two components** (~220+ literals). Brand `#29594F` copy-pasted in ≥8 files. | `RightRail.css:46`, `TopBar.css:70`, `RailFooter.css:70,78`, `Overview.css:90,200` |
| 2 | **Hex-as-fallback anti-pattern** re-introduces the Tier-1 value the token removes. | `var(--envision-theme-color-content-primary-default, #22201c)` ×14 in GuidedMapping; `var(--ink,#2b2622)` in WallColorModal |
| 3 | **Hardcoded box-shadows / rgba scrims** instead of elevation effect tokens (24 declarations). | `CabinetStyleTray.css:21,120`, `WallColorModal.css:26`, `RoomSelector.css:22` |
| 4 | **div/section-as-button** in product UI. | `PackagesTab` `<section role="button" tabIndex=0>` (`.tsx:35-40`); `WallColorModal` `<div onClick>` backdrop (`.tsx:41`); `Plans` lightbox (`.tsx:80`) |
| 5 | **Custom widgets missing APG keyboard nav.** | `RightRail` tabs (no Arrow/Home/End, no `tabpanel`); `RoomSelector`/`SourceSelector` listboxes (no arrow nav) |
| 6 | **No modal focus management anywhere.** `WallColorModal` (the spec's ColorPickerModal): no focus trap, no Esc, no focus-on-open/return. | `WallColorModal.tsx` (grep Escape/focus = none) |
| 7 | **`focus-visible` styled in only 1 of 22 CSS files** — the promised 2px ring is largely invisible on keyboard. | `PackagesTab.css` only |
| 8 | **Color-only selection** on the swatch primitive. | `OptionSwatch.css:59-69` (ring-shade only, code says "no checkmark") |
| 9 | **Prop hygiene**: no component exports its `Props`; callbacks inconsistent (`onChange` vs `onSelect` vs none); all default exports; no shared `variant`/`size`/`tone` vocabulary. | every `src/components/*/*.tsx` |
| 10 | **White-label leak**: brand identity hardcoded, blocking the brand-mode requirement. | `TopBar.tsx:20-21` ("WESTLAKE"/"HOMES"), `MENU` const |

Clean on one axis: **no `any` types** were found anywhere in the component tree.

These are the migration targets. The new library implements the correct pattern for each on the
components it covers (see §C); the app adopts them per surface.

---

## B. Registry ↔ emitted-token reconciliations (issues found → changes made)

The registry's idealized `tokenDependencies` dot-paths drift from the pipeline's emitted variable
names in a few places. The **token architecture is frozen** (per the brief), so the library
consumes the real emitted names and records the reconciliation here rather than changing tokens.

| Registry says | Emitted reality | Resolution |
|---|---|---|
| badge tone `error`, `brand` | tokens are `critical`, `promotional` | Badge maps `error→critical`, `brand→promotional` (documented in component). |
| button `t2.spacing.inline-icon-gap` | `--envision-t2-spacing-control-gap` | Use `control-gap`. |
| ghost Button; checkbox/radio/switch T3 tokens | **none emitted** | Consume **T2** roles (`color-content-brand`, `color-background-brand`, `color-border-*`). |
| per-size button padding/type tokens | none emitted | Size scales by **relative ratio** over base control padding (not a raw value). |
| **`t3.button.outline.color-border`/`.color-content`** (Button outline + PackageCard Customize) | resolve to **brand green** (`t2.color.border/content.brand` → `#29594f`) | **Does not match the shipped web.** Every bordered secondary control in the app uses the neutral hairline `--hairline` (`t2.color.border.default` = **`#e7e3dc`**) with dark text; there is **no brand-green outline button anywhere** (only one non-button dashboard element uses a green border). Rebound outline + Customize to `t2.color.border.default` (#e7e3dc) + `t2.color.content.primary` (#222, nearest to the web's #333) + `t2.color.background.surface`; hover `t2.color.border.strong` + `surface-warm`. Nearest existing tokens; no new tokens. |

**Recommended follow-ups (token layer, out of scope to change here):** add badge `brand`/`error`
aliases (or update the registry labels), add ghost-button + checkbox/radio/switch T3 tokens, and
per-size control tokens. Filed as design-system backlog, not silently patched.

---

## C. How each requested dimension is hardened in the new library

| Dimension | Resolution in `@envision/components` |
|---|---|
| **Correct token usage** | Every component styles only with `--envision-t2/t3-*`; product data (material color/image) is inline per SYSTEM_SPEC §4. |
| **Hard-coded values** | None for design decisions; `var(…, fallback)` fallbacks are render-safety only. Size scaling uses ratios, not raw px. |
| **API consistency** | Uniform kebab attributes / camel React props; boolean presence attrs; object inputs as properties. |
| **Naming consistency** | Meaningful component names (Button, Input, OptionCard); events named by intent (`select`/`open`/`apply`/`customize`). |
| **Composability** | Slots (Button icon slots; RightRail body + total slots) over variant explosion; RightRail is a shell, not kitchen-coupled. |
| **Variants** | Implemented per registry (`variant`, `size`, `tone`, `shape`) — no invented variants. |
| **States** | default/hover/focus-visible/pressed/disabled/loading; form invalid/required/read-only; selection/active; image loading/error; price-pending; RightRail loading/sheet. |
| **Responsive behavior** | RightRail recomposes rail→sheet at ≤1024px (matchMedia), the documented behavior — same API. |
| **Keyboard interaction** | Native activation; Radio + Tab implement APG roving tabindex (Arrow/Home/End); Switch adds Enter; RightRail sheet traps Tab. |
| **Semantic HTML** | Real `<button>`/`<a>`/`<input>`/`<label>`; PackageCard is real buttons (fixes div-as-button); no clickable divs. |
| **Accessibility** | Per-component ACCESSIBILITY.md contract: names, `aria-pressed/selected/checked/invalid/required/busy/modal`, not-color-only, described-by. |
| **Focus behavior** | 2px brand `:focus-visible` ring on every control; RightRail sheet: focus-in, trap, Esc, return focus. |
| **TypeScript typing** | Strict; typed element classes + exported React prop interfaces + `HTMLElementTagNameMap` augmentation. |
| **Edge cases** | Disabled/loading activation guards; unavailable swatch blocks select; radio/tab group edge cases. |
| **Content extremes** | Empty/very long labels tested; name line-clamp; count clamp (`99+`); material preview cap. |
| **Loading** | Button spinner (blocks re-activation, `aria-busy`); PackageCard image shimmer; RightRail `aria-busy`; OptionCard price-pending. |
| **Error** | Input error message + `aria-invalid` + described-by; PackageCard image-error fallback. |
| **Performance** | One shared constructable stylesheet per component (no per-instance `<style>`); build-once/sync-once render (no re-innerHTML); microtask-batched updates; zero runtime deps. |

## D. Changes made for legitimate technical/a11y reasons (logged per the brief)

1. **First render made synchronous** (was microtask) — eliminates a flash of unbuilt content and
   makes SSR/testing deterministic. Reason: production correctness + determinism.
2. **Label implemented in light DOM** — a `<label for>` in Shadow DOM cannot associate with a
   light-DOM control. Reason: form-label association is impossible otherwise.
3. **Roving tabindex recomputed group-wide** on any member change. Reason: a radio must correct its
   siblings' tab order, not just its own.
4. **Button `fullwidth` attribute → `full-width`** for kebab consistency across the set/adapter.
   Reason: uniform attribute↔prop mapping.
5. Token-name reconciliations in §B. Reason: emitted names differ from registry labels; token
   architecture is frozen.
6. **Outline Button + PackageCard Customize rebound from brand green to the neutral hairline**
   (`t2.color.border.default` #e7e3dc + `t2.color.content.primary` #222 + `surface`; hover
   `t2.color.border.strong` + `surface-warm`). Reason: the `t3.button.outline.*` tokens resolve to
   brand green, but the shipped web product renders every secondary/outline button as a neutral
   hairline with dark text (verified against the GitHub baseline across the whole app). Matched to
   the **nearest existing tokens** — no new tokens/primitives created. Documented in COMPONENTS.md,
   ARCHITECTURE.md §6, and the component comments.

None of these alter the established **visual system, component hierarchy, token architecture, or
methodology** — they are implementation-level corrections, documented here as required.
