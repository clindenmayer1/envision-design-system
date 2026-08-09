# Envision Components — Technical Reference

Per-component API, states, tokens, and accessibility contracts for `@envision/components`.
Each component is a custom element (`<envision-*>`) and has a typed React wrapper in
`@envision/react` under its meaningful name. Load tokens once: `import '@envision/tokens/css'`.

Conventions: HTML attributes are kebab-case; React props are camelCase (the adapter maps them);
booleans are presence attributes; events are composed `CustomEvent`s (React: `onEvent`); object
inputs are set as JS **properties**.

> **Visual fidelity:** exact per-component type/geometry values are reconciled to the website's
> original design in [`FIDELITY-AUDIT.md`](./FIDELITY-AUDIT.md) (three-way: website vs Figma vs
> component). All type is set explicitly (no `font: inherit`); e.g. Button is 14px/600, radius 10.

---

## Control primitives

### Button — `<envision-button>` / `Button`
- **Props:** `variant`('primary'|'outline'|'ghost'=primary), `size`('sm'|'md'|'lg'=md), `label`\*(string), `leadingIcon`, `trailingIcon`, `disabled`(false), `loading`(false), `fullWidth`(false).
- **Events:** native `click` (blocked while disabled/loading).
- **States:** default, hover, focus-visible, pressed, disabled, loading (spinner replaces intent, `aria-busy`, activation blocked but stays focusable).
- **Tokens:** primary → `t3.button.primary.*`. **Outline = neutral secondary** → `t2.color.border.default` (#e7e3dc) + `t2.color.content.primary` (#222) + `t2.color.background.surface`, hover `t2.color.border.strong` + `surface-warm` (matches the web's hairline "Customize" button; the brand-green `t3.button.outline.*` tokens do NOT match the shipped product — see AUDIT.md §B). Ghost → T2 brand roles. Plus `t2.border-radius.control`, `t2.spacing.control-gap`, `t2.color.border.focus`.
- **a11y:** real `<button>`, name from `label`, `aria-busy` on load, not focusable when disabled, Enter/Space native, 2px focus ring. Icon slots `leading`/`trailing` for custom icons.

### IconButton — `<envision-icon-button>` / `IconButton`
- **Props:** `icon`\*, `accessibleName`\*(required — icon-only has no visible text), `variant`('standard'|'subtle'), `selected`(false), `disabled`(false), `tooltip`.
- **States:** default, hover, focus-visible, selected (brand fill), disabled.
- **a11y:** `aria-label`=accessibleName; `aria-pressed` only when acting as a toggle; Enter/Space; `title` tooltip (richer APG tooltip = the proposed Tooltip component).

### Link — `<envision-link>` / `Link`
- **Props:** `href`\*, `label`\*, `variant`('inline'|'standalone'), `directionIcon`(false, RTL-aware), `disabled`(false).
- **a11y:** real `<a href>`; disabled drops href, sets `aria-disabled`, removes from tab order, blocks activation. Inline variant underlines; focus ring.

### Label — `<envision-label>` / `Label`
- **Props:** `text`\*, `htmlFor`\*, `required`(false), `helpIcon`(false).
- **Note:** **light-DOM** element so `<label for>` associates with a document control. Required asterisk renders BEFORE the text and is `aria-hidden`; also set `aria-required` on the control.

### Input — `<envision-input>` / `Input`
- **Props:** `type`('text'|'email'|'search'|'number'|'price'|'password'=text), `value`, `label`\*, `helperText`, `errorMessage`, `invalid`(false), `required`(false), `disabled`(false), `readonly`, `leadingIcon`, `trailingIcon`, `placeholder`.
- **Events:** `input`, `change` (composed).
- **States:** empty, filled, hover, focus-visible, invalid, disabled, read-only, required.
- **Tokens:** `t3.input.default.color-border.*`, `t2.color.background.surface`, `t2.color.content.placeholder`, `t2.border-radius.control`.
- **a11y:** persistent `<label for>` (never placeholder-as-label); `aria-invalid`, `aria-required`, `aria-describedby`→helper/error. `price`→text + decimal inputmode.

### Checkbox — `<envision-checkbox>` / `Checkbox`
- **Props:** `checked`, `label`\*, `disabled`(false), `required`(false), `invalid`(false). **Events:** `change`.
- **a11y:** native `<input type=checkbox>`; check is drawn as **geometry** (not color-only); Space toggles; `aria-required`/`aria-invalid`. `ElementInternals.setFormValue` when available.

### Radio — `<envision-radio>` / `Radio`
- **Props:** `checked`, `name`\*, `value`\*, `label`\*, `disabled`(false). **Events:** `change`.
- **a11y:** native `<input type=radio>`; **group coordination across separate custom elements** by `name` — selecting one deselects same-name siblings; **APG roving tabindex** (Arrow/Home/End move + select); filled dot = shape, not color-only.

### Switch — `<envision-switch>` / `Switch`
- **Props:** `checked`, `label`\*, `disabled`(false). **Events:** `change`.
- **a11y:** `<input type=checkbox role=switch>`; Space (native) + Enter (added) toggle; thumb position conveys state (not color-only).

### Badge — `<envision-badge>` / `Badge`
- **Props:** `tone`('neutral'|'brand'|'info'|'success'|'warning'|'error'=neutral), `shape`('count'|'dot'=count), `count`, `max`(99), `label`.
- **Tokens:** `t3.badge.{neutral|info|success|warning|critical|promotional}.*` (tone `error→critical`, `brand→promotional`), `t2.border-radius.pill`.
- **a11y:** count clamps to `N+`; `role=status`+`aria-label` when it carries a count/label; a bare dot is decorative (`aria-hidden`).

### Tab — `<envision-tab>` / `Tab`
- **Props:** `label`\*, `selected`(false), `disabled`(false), `panel`(tabpanel id). **Events:** `select` (composed).
- **a11y:** `role=tab`, `aria-selected`, `aria-controls`; roving tabindex + Arrow/Home/End across sibling tabs (selection-follows-focus). The `Tabs` container is the proposed component; wrap tabs in `role=tablist`.

---

## Product components

### MaterialSwatch — `<envision-material-swatch>` / `MaterialSwatch`
- **Props:** `option`(MaterialOption, property), `selected`(false), `unavailable`(false). **Events:** `select` (detail `{id}`).
- **States:** default, hover, selected, unavailable, loading, image-failure.
- **a11y:** toggle `<button>`, `aria-pressed`; accessible name = material + finish + price; selection = **ring + check** (not color-only); fill is product data (inline), not a token; unavailable blocks selection.

### OptionCard — `<envision-option-card>` / `OptionCard`
- **Props:** `options`(MaterialOption[], property), `value`(property/attr), `title`\*, `note`, `active`(false), plus `loading`, `price-pending`. **Events:** `open` (detail `{value}`).
- **a11y:** the **whole card is a single `<button>`** with no nested interactive; `aria-expanded` reflects tray-open; note styles as upgrade when not "Included".

### PackageCard — `<envision-package-card>` / `PackageCard`
- **Props:** `pkg`(KitchenPackage, property), `selected`(false). **Events:** `select`, `customize` (detail `{id}`).
- **States:** default, selected, popular, image-loading (shimmer), image-ready, image-error, long-name (line-clamp), max-materials (preview cap 5).
- **a11y:** real select `<button>` + **separate** customize `<button>` (no div-as-button, no nested buttons); `aria-pressed`; labelled actions.

---

## Composite pattern

### RightRail — `<envision-right-rail>` / `RightRail`
- **Props:** `mode`('customize'|'packages'=customize), `heading`, `loading`(false), `sheet`(force sheet), `open`(sheet open). Body + `total` are **slots**. **Events:** `modechange` (detail `{mode}`), `apply`, `close`.
- **Responsive:** desktop **rail** (`role=complementary`, token width) → ≤1024px **sheet** (modal dialog).
- **a11y (sheet):** `role=dialog` + `aria-modal`; focus moves in on open; **Tab trapped** across header tabs → slotted body → footer apply; **Esc closes**; focus returned to the opener. `aria-busy` while loading.

---

## Usage

```html
<!-- Any framework / vanilla -->
<script type="module">import '@envision/components';</script>
<link rel="stylesheet" href="/node_modules/@envision/tokens/dist/tokens.css" />
<envision-button variant="primary" label="Apply"></envision-button>
```
```tsx
// React
import '@envision/tokens/css';
import { Button, RightRail, OptionCard } from '@envision/react';

<RightRail heading="Design" onApply={save}>
  <OptionCard title="Cabinets" note="Included" onOpen={openTray} />
</RightRail>
```

Staged (browser-only) verification per component — `:focus-visible` painting, forced-colors,
real form submission, visual regression — lives in the Playwright layer (see ARCHITECTURE.md §8).
