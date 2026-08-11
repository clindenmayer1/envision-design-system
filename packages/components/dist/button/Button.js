import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
/**
 * Envision Button — `<envision-button>`.
 *
 * Registry contract (component-registry.json → "button"):
 *   props:  variant('primary'|'outline'|'ghost'=primary) · size('sm'|'md'|'lg'=md) ·
 *           label(string, required) · leadingIcon · trailingIcon ·
 *           disabled(false) · loading(false) · fullWidth(false)
 *   states: default · hover · focus-visible · pressed · disabled · loading
 *   a11y:   accessible name from label · disabled reflected · aria-busy when loading ·
 *           Enter/Space activate · not focusable when disabled
 *
 * Semantics: renders a real <button type="button"> in the shadow root, so keyboard
 * activation, disabled focus behavior, and form semantics come from the platform.
 *
 * Tokens only (no raw color/radius): primary = t3.button.primary.*. Outline is a NEUTRAL
 * secondary button matching the web (t2.color.border.default var(--envision-t2-color-border-default-default) + t2.color.content.primary
 * + t2.color.background.surface) — the t3.button.outline.* tokens resolve to brand green and do
 * NOT match the shipped product (AUDIT.md §B/§D). Ghost falls back to T2 brand roles. Per-size
 * type/padding tokens do not exist yet, so size scales by relative ratio over the base control
 * padding — a noted follow-up, not a raw design value.
 */
const styles = css `
  :host {
    display: inline-flex;
    vertical-align: middle;
  }
  :host([full-width]) {
    display: flex;
    width: 100%;
  }

  .btn {
    /* layout */
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--envision-t2-spacing-control-gap);
    width: 100%;
    /* Explicit type to match the website (14px / 600), not inherited. */
    font-family: inherit;
    font-size: var(--envision-t3-button-medium-font-size-default);
    font-weight: var(--envision-t1-font-weight-600);
    line-height: 1.2;
    cursor: pointer;
    border: var(--envision-t2-border-width-default) solid transparent;
    /* Website primary CTA radius = 10 (container-md), not the shared control radius. */
    border-radius: var(--envision-t2-border-radius-container-md);
    /* Size geometry comes from the T3 button size tokens, which the Figma Button set binds to its
       Size variant. Medium is the base and is applied here rather than on a :host([size]) rule, so
       a button with no size attribute is a medium. */
    padding-block: var(--envision-t3-button-medium-padding-block-default);
    padding-inline: var(--envision-t3-button-medium-padding-inline-default);
    transition: background-color var(--envision-t2-motion-micro-duration)
        cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .btn { transition: none; }
  }

  /* size — every value is a published T3 token bound to the Figma Button's Size variant.
     Previously these were calc() ratios (0.6 / 0.75 / 1.35 / 1.25 / 0.875em / 1.0625em) over a
     DIFFERENT base than medium used, which made large render SMALLER than medium and gave small
     the same font size as medium. Resolved geometry is now 38 / 49 / 59 tall, matching Figma. */
  :host([size='sm']) .btn {
    padding-block: var(--envision-t3-button-small-padding-block-default);
    padding-inline: var(--envision-t3-button-small-padding-inline-default);
    font-size: var(--envision-t3-button-small-font-size-default);
  }
  :host([size='lg']) .btn {
    padding-block: var(--envision-t3-button-large-padding-block-default);
    padding-inline: var(--envision-t3-button-large-padding-inline-default);
    font-size: var(--envision-t3-button-large-font-size-default);
  }

  /* variant: primary */
  :host([variant='primary']) .btn {
    background: var(--envision-t3-button-primary-color-background-default);
    color: var(--envision-t3-button-primary-color-content-default);
  }
  :host([variant='primary']) .btn:hover {
    background: var(--envision-t3-button-primary-color-background-hover);
  }
  :host([variant='primary']) .btn:active {
    background: var(--envision-t3-button-primary-color-background-pressed);
  }

  /* variant: outline — NEUTRAL secondary button. Matches the web design (the app's hairline
     "Customize"/secondary buttons: var(--envision-t2-color-border-default-default) border, dark text, surface fill). The registry's
     t3.button.outline.* tokens resolve to BRAND green, which does not match the shipped web
     product, so outline binds to the nearest existing neutral tokens instead. See AUDIT.md §B/§D. */
  :host([variant='outline']) .btn {
    background: var(--envision-t2-color-background-surface-default);
    color: var(--envision-t2-color-content-primary-default);
    border-color: var(--envision-t2-color-border-default-default);
  }
  :host([variant='outline']) .btn:hover {
    background: var(--envision-t2-color-background-surface-warm-default);
    border-color: var(--envision-t2-color-border-strong-default);
  }
  :host([variant='outline']) .btn:active {
    background: var(--envision-t2-color-background-surface-warm-default);
    border-color: var(--envision-t2-color-border-strong-default);
  }

  /* variant: ghost (no T3 tokens → T2 brand roles) */
  :host([variant='ghost']) .btn {
    background: transparent;
    color: var(--envision-t2-color-content-brand-default);
  }
  :host([variant='ghost']) .btn:hover {
    background: var(--envision-t2-color-background-brand-subtle-default);
  }
  :host([variant='ghost']) .btn:active {
    background: var(--envision-t2-color-background-brand-subtle-default);
  }

  /* focus ring — the DS 2px brand ring, never clipped (offset outline) */
  .btn:focus-visible {
    outline: var(--envision-t2-border-width-focus) solid
      var(--envision-t2-color-border-focus-default);
    outline-offset: 2px;
  }

  /* disabled */
  :host([disabled]) .btn,
  .btn:disabled {
    cursor: not-allowed;
    background: var(--envision-t3-button-primary-color-background-disabled);
    color: var(--envision-t3-button-primary-color-content-disabled);
    border-color: transparent;
  }
  :host([variant='outline'][disabled]) .btn,
  :host([variant='ghost'][disabled]) .btn {
    background: transparent;
    border-color: var(--envision-t3-button-primary-color-background-disabled);
  }

  /* loading */
  :host([loading]) .btn { cursor: progress; }
  .spinner {
    display: none;
    inline-size: 1em;
    block-size: 1em;
    border-radius: 50%;
    border: 2px solid currentColor;
    border-inline-end-color: transparent;
    animation: ev-spin var(--envision-t2-motion-loading-duration) linear infinite;
  }
  :host([loading]) .spinner { display: inline-block; }
  :host([loading]) .label { opacity: 0.7; }
  @media (prefers-reduced-motion: reduce) {
    .spinner { animation-duration: 1600ms; }
  }
  @keyframes ev-spin { to { transform: rotate(360deg); } }

  .icon {
    display: none;
    font-family: 'Material Symbols Outlined', sans-serif;
    font-size: 1.25em;
    line-height: 1;
    -webkit-font-feature-settings: 'liga';
    font-feature-settings: 'liga';
  }
  .icon[data-icon]:not([data-icon='']) { display: inline-block; }
  ::slotted([slot='leading']),
  ::slotted([slot='trailing']) { display: inline-flex; }
`;
const VARIANTS = ['primary', 'outline', 'ghost'];
const SIZES = ['sm', 'md', 'lg'];
export class EnvisionButton extends EnvisionElement {
    static styles = styles;
    static observedAttributes = [
        'variant', 'size', 'label', 'leading-icon', 'trailing-icon', 'disabled', 'loading', 'full-width',
    ];
    #button;
    #label;
    #lead;
    #trail;
    // --- reactive props (attribute-backed; no class fields, per base-class note) ---
    get variant() { return this.getEnum('variant', VARIANTS, 'primary'); }
    set variant(v) { this.setStr('variant', v); }
    get size() { return this.getEnum('size', SIZES, 'md'); }
    set size(v) { this.setStr('size', v); }
    get label() { return this.getStr('label') ?? ''; }
    set label(v) { this.setStr('label', v); }
    get leadingIcon() { return this.getStr('leading-icon'); }
    set leadingIcon(v) { this.setStr('leading-icon', v); }
    get trailingIcon() { return this.getStr('trailing-icon'); }
    set trailingIcon(v) { this.setStr('trailing-icon', v); }
    get disabled() { return this.getBool('disabled'); }
    set disabled(v) { this.reflectBool('disabled', v); }
    get loading() { return this.getBool('loading'); }
    set loading(v) { this.reflectBool('loading', v); }
    get fullWidth() { return this.getBool('full-width'); }
    set fullWidth(v) { this.reflectBool('full-width', v); }
    connectedCallback() {
        if (!this.hasAttribute('variant'))
            this.setAttribute('variant', 'primary');
        if (!this.hasAttribute('size'))
            this.setAttribute('size', 'md');
        // Block activation while loading/disabled at the capture phase (before consumer listeners).
        this.addEventListener('click', this.#guardActivation, { capture: true });
        super.connectedCallback();
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.#guardActivation, { capture: true });
    }
    #guardActivation = (e) => {
        if (this.disabled || this.loading) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    };
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `
      <button class="btn" part="button" type="button">
        <span class="spinner" part="spinner" aria-hidden="true"></span>
        <slot name="leading"></slot>
        <span class="icon lead" part="icon" aria-hidden="true"></span>
        <span class="label" part="label"></span>
        <span class="icon trail" part="icon" aria-hidden="true"></span>
        <slot name="trailing"></slot>
      </button>`;
        this.#button = root.querySelector('.btn');
        this.#label = root.querySelector('.label');
        this.#lead = root.querySelector('.icon.lead');
        this.#trail = root.querySelector('.icon.trail');
    }
    updated() {
        this.#label.textContent = this.label;
        // Material Symbols ligature default; consumers may instead slot custom icon nodes.
        this.#applyIcon(this.#lead, this.leadingIcon);
        this.#applyIcon(this.#trail, this.trailingIcon);
        // disabled removes the control from tab order (platform behavior); loading keeps it
        // focusable but announces busy and blocks activation (see #guardActivation).
        this.#button.disabled = this.disabled;
        this.#button.setAttribute('aria-busy', this.loading ? 'true' : 'false');
    }
    #applyIcon(el, name) {
        if (name) {
            el.textContent = name;
            el.setAttribute('data-icon', name);
        }
        else {
            el.textContent = '';
            el.removeAttribute('data-icon');
        }
    }
}
//# sourceMappingURL=Button.js.map