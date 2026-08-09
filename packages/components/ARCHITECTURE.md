# Envision Components — Architecture

How the Envision design system's components are implemented as **production infrastructure**:
standards-based Web Components consuming `@envision/tokens`, with a thin React adapter. This
document explains the resulting architecture, the decisions behind it, and their tradeoffs.

It assumes the design decisions already established in `@envision/design-system`
(`SYSTEM_SPEC.md`, `component-registry.json`, `ACCESSIBILITY.md`). Those are **preserved** here,
not redesigned; this document is about *implementation*, not visual or token design.

---

## 1. What existed, and what this is

The Envision design system was **specification-complete but had no component code**. The
system-of-record defines 34 components with APIs, states, tokens, and accessibility contracts
(`component-registry.json`), and `STORYBOOK.md` states plainly: *"No repository Storybook/code
exists yet — this is a handoff spec… runtime stack is provisional."* The product's `src/components`
are **application UI**, not a reusable library (see `AUDIT.md`).

This package turns the specification into shipped infrastructure. Scope is bounded to the **14
components that are actually designed** (`figmaStatus: ready-for-review`); the other 20 are
`proposed` (not drawn) and are intentionally **not** invented here.

| Tier | Implemented (this package) |
|---|---|
| Control primitives (10) | Button, IconButton, Link, Label, Input, Checkbox, Radio, Switch, Badge, Tab |
| Product components (3) | MaterialSwatch, OptionCard, PackageCard |
| Composite pattern (1) | RightRail |

---

## 2. The core decision: standards-based Web Components

The registry left the runtime open ("keep React vs other"). We evaluated it against **this**
system rather than by analogy to other design systems.

**Decision: implement the library as framework-agnostic Web Components (custom elements + Shadow
DOM + ElementInternals), styled with the existing `--envision-*` CSS custom properties, and ship a
thin React adapter (`@envision/react`).**

### Why (specific to Envision)

1. **The system's stated purpose is multi-framework, white-label infrastructure.** `SYSTEM_SPEC`
   §9 defines a branded-house model (a new builder = a new token mode, not a fork), and the
   repository ADR already plans `@envision/react` **and** `@envision/vue` adapters. A component
   layer that is framework-agnostic at its core is the honest implementation of that intent.
2. **The tokens are already framework-agnostic and already pierce the shadow boundary.** Envision
   theming is entirely CSS custom properties (`@envision/tokens`). Custom properties **inherit
   through Shadow DOM**, so encapsulated components stay fully themeable and white-labelable with
   zero extra machinery. This is the property that makes Web Components *cheap* here specifically.
3. **The one current consumer (React) loses nothing.** A thin adapter gives React users idiomatic,
   typed components; behavior lives once in the custom elements. There is no duplicated logic to
   drift.
4. **Encapsulation matches the product reality.** The audit found the app's UI is a sea of
   overriding CSS and leaked styles; Shadow DOM gives each component a hard styling boundary so a
   consuming app's CSS can't accidentally reshape a control.

### Why not "just React"

React would be simpler *today* (one consumer, React-native team). We rejected it as the **library
core** because it forecloses the system's explicit multi-consumer goal: every future non-React
surface would require re-implementing components, which is precisely the duplication the design
system exists to prevent. React remains a first-class consumer — via the adapter — just not the
substrate.

We explicitly did **not** choose Web Components because other design systems use them. The
deciding factor is the token architecture + the multi-framework mandate already in this repo.

### Cost

- **Form participation** needs `ElementInternals` (`formAssociated`), which is present in all
  modern browsers but **not in the jsdom/happy-dom test runtime**. Mitigation: form controls are
  built on real native inner `<input>`s (full semantics/keyboard/focus, fully testable) and layer
  `setFormValue` in only when available; browser-level form submission is a staged Playwright check.
- **React < 19 ergonomics**: React 18 passes unknown props as attributes and doesn't bind custom
  events. The adapter closes that gap (≈70 lines). React 19 handles both natively; the adapter
  stays valid and can thin further.
- **SSR**: custom elements render client-side; declarative Shadow DOM / SSR hydration is a known,
  scoped follow-up (the product is a client-rendered SPA today, so no current cost).
- **Team familiarity**: Web Components are less familiar than React to most product engineers. The
  thin adapter means product engineers write ordinary React and never touch a custom element.

### Benefits

- One implementation, consumable from React today and Vue/Svelte/vanilla later with only a new
  adapter (no re-implementation).
- Native encapsulation (style, DOM, a11y tree) — robust against host-app CSS.
- Zero runtime dependencies in the core; the whole library is the platform + tokens.
- Framework-version-proof: the elements outlive any framework major.

### Drawbacks (accepted, documented)

- Two packages and an adapter concept instead of one React library.
- Constructable-stylesheet + ElementInternals feature detection adds a little base-class code.
- Per-size and a few state tokens don't exist yet, so some scaling is derived from base tokens
  (noted in `AUDIT.md` as a token follow-up, not a raw value).

### Impact on Envision (the app)

None forced. The app keeps running unchanged. It can adopt components incrementally via
`@envision/react`, starting with the highest-debt areas the audit found (PackageCard's
div-as-button, WallColorModal's missing focus trap → RightRail sheet). Adoption is opt-in per
surface.

### Impact on future consumers

A second app or framework plugs into the existing acyclic graph
(`consumer → adapter → components → tokens`) by adding one thin adapter. Non-web platforms consume
`@envision/tokens` directly. The registry in `@envision/design-system` remains the single contract
everyone implements against.

---

## 3. Architecture

```
@envision/tokens         CSS custom properties (--envision-t1/t2/t3-*) + typed values
        ▲
        │ consumed via var(); inherits through Shadow DOM
        │
@envision/components      standards-based custom elements  ← THE LIBRARY
   src/base/              EnvisionElement (shadow, adopted styles, batched updates),
                          css`` (constructable stylesheet), internals (ElementInternals guard)
   src/<name>/            one folder per component: <Name>.ts + <Name>.test.ts
   src/define.ts          registers every <envision-*> tag (idempotent)
        ▲
        │ thin wrappers (no logic)
        │
@envision/react           createComponent factory + typed wrappers by meaningful name
```

### Base class (`EnvisionElement`)

- Attaches Shadow DOM (`delegatesFocus`) and adopts ONE shared `CSSStyleSheet` per component
  (constructable stylesheets — no per-instance `<style>`).
- **Two-phase render**: `render()` builds the shadow DOM **once**; `updated()` **syncs state** on
  every change. This avoids re-`innerHTML`ing on every attribute change, which would destroy focus
  and form state — a real production concern for inputs.
- **First render is synchronous on connect** (no flash of unbuilt content, deterministic for
  tests/SSR); later attribute changes are **batched on a microtask**.
- Reactive props are expressed as **getters/setters over attributes** (not class fields), so
  `useDefineForClassFields` can't shadow prototype accessors.

### Styling & tokens

Every component styles itself **only** with `--envision-t2-*` / `--envision-t3-*` custom
properties — no raw hex/px for design values (fallbacks in `var(…, fallback)` exist solely so a
component still renders if tokens aren't loaded). Product data (a material's color/image) is set
inline, because per `SYSTEM_SPEC` §4 that is **content, not a token**. Consumers load tokens once:

```
import '@envision/tokens/css';
```

---

## 4. Public API: meaningful names, not tiers

Atomic Design is retained as the **internal** organizing methodology (the registry's
control-primitive / product-component / composite-pattern tiers), but **consumers never encounter
it**. Components are exposed by their meaningful names and functions:

- HTML: `<envision-button>`, `<envision-input>`, `<envision-option-card>`, `<envision-right-rail>`.
- React: `import { Button, Input, OptionCard, RightRail } from '@envision/react'`.

Nobody has to know a Button is an "atom" or RightRail an "organism" to use them. Tiers inform
governance and dependency direction, not the import surface.

### API conventions (normalized across the set — an audit fix)

- Attributes are kebab-case; React props are camelCase; the adapter maps between them.
- Booleans are presence attributes (`disabled`, `selected`, `loading`).
- Events are composed `CustomEvent`s (`change`, `input`, `select`, `open`, `customize`, `apply`,
  `modechange`, `close`) so they cross the shadow boundary; React sees `onChange`, `onSelect`, etc.
- Object inputs (a `MaterialOption`, a `KitchenPackage`, a `KitchenConfig`) are set as **properties**,
  since attributes can't carry objects.

---

## 5. Accessibility contracts (implemented)

Each component implements the per-component contract in `ACCESSIBILITY.md`, on real semantics:

- **Real elements**: Button/IconButton → `<button>`; Link → `<a href>`; Checkbox/Radio/Input →
  native `<input>`; Switch → `<input role=switch>`; Label → **light-DOM** `<label for>` (a `for`
  inside Shadow DOM can't associate with a light-DOM control — a genuine WC constraint).
- **Not color-only**: selection/checked states carry a shape (geometric check, filled radio dot,
  selection ring + check on swatches), per `SYSTEM_SPEC` principle 3.
- **Keyboard**: native activation for buttons/links/inputs; **Radio and Tab implement the APG
  roving-tabindex group pattern** (Arrow/Home/End) across separate custom elements — native radios
  don't group across shadow roots, so the components coordinate by name/parent.
- **Focus**: a visible 2px brand focus ring (token) on every control; **RightRail's mobile sheet is
  a real modal dialog** — focus moves in, Tab is trapped across header→body→footer, Esc closes, and
  focus returns to the opener (the exact behavior the app's modal was missing).
- **Forms**: persistent labels, `aria-required`/`aria-invalid`/`aria-describedby` wired to
  helper/error text.

---

## 6. Token dependencies

Components declare their token usage in code and docs (`COMPONENTS.md`). Reconciliations against the
*emitted* token names are documented in `AUDIT.md` (not silently changed): Badge tones
`error`/`brand` map to emitted `critical`/`promotional`; a few components (ghost Button,
checkbox/radio/switch) have **no T3 tokens** and correctly consume **T2** roles; and the **outline
Button + PackageCard Customize** were rebound from the brand-green `t3.button.outline.*` tokens to
the **neutral hairline** (`t2.color.border.default` #e7e3dc + `t2.color.content.primary` +
`surface`) to match the shipped web product — the nearest existing tokens, no new tokens. Verified
against the GitHub baseline: every bordered secondary control in the app uses the hairline, and no
brand-green outline button exists.

---

## 7. The React adapter (no logic duplication)

`@envision/react` is one factory, `createComponent(tagName)`, plus typed wrappers. It:

- forwards camelCase props → kebab-case **attributes**,
- forwards `on*` props → custom-element **event listeners**,
- forwards `ref` to the underlying element,
- passes `children` through.

It contains **zero** rendering, state, keyboard, or a11y logic — all of that lives once in the
custom elements. This is the concrete proof that adding a framework is a thin, generated layer:

```tsx
import { Button, Input } from '@envision/react';
<Button variant="outline" label="Apply" onClick={apply} />
<Input label="Email" type="email" required errorMessage="Required" invalid />
```

A Vue/Svelte adapter would be the same shape over the same elements.

---

## 8. Testing strategy

- **Unit/contract tests** (Vitest + happy-dom), colocated per component: semantics, states, ARIA,
  keyboard/group behavior, events, form wiring, content extremes. 64 component + 6 adapter tests.
- **Adapter tests** render real React (react-dom) into happy-dom and assert the element receives the
  right attributes/events.
- **Staged (browser-only) checks** — `:focus-visible` painting, forced-colors, real
  `ElementInternals` form submission, visual regression — belong in a Playwright layer, noted per
  component. happy-dom can't paint or run ElementInternals, so those are explicitly out of the unit
  layer rather than falsely asserted.

---

## 9. What's deferred (honest sequencing)

- The 20 `proposed` components (Tabs container, Tooltip, ProgressIndicator, dashboard cards, etc.)
  are **not** built — they aren't designed yet; building them would be inventing.
- Storybook, Playwright/visual-regression, and SSR/declarative-Shadow-DOM are defined next steps.
- Wiring the **app** onto `@envision/react` follows the token-naming reconciliation already tracked
  in the repo ADR.

The point of this package is to demonstrate the system operates as **production infrastructure** —
real, tested, framework-agnostic components built to the established contracts — not to ship every
proposed component or hide what remains.
