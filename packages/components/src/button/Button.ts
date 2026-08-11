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
const styles = css`
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
    font-size: var(--envision-t1-font-size-14);
    font-weight: var(--envision-t1-font-weight-600);
    line-height: 1.2;
    cursor: pointer;
    border: var(--envision-t2-border-width-default) solid transparent;
    /* Website primary CTA radius = 10 (container-md), not the shared control radius. */
    border-radius: var(--envision-t2-border-radius-container-md);
    /* Block padding is 16 (Figma Button binds paddingTop/Bottom to spacing/container-padding-note;
       every variant master is 49 tall). This previously read var(--envision-t1-spacing-16), a
       px-named token that does not exist in this step-named scale — the declaration was invalid,
       so the button rendered with NO vertical padding at all. */
    padding-block: var(--envision-t2-spacing-container-padding-note);
    padding-inline: var(--envision-t2-spacing-control-padding-inline);
    transition: background-color var(--envision-t2-motion-micro-duration)
        cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .btn { transition: none; }
  }

  /* size: relative scaling over the base control padding (no per-size tokens exist yet) */
  :host([size='sm']) .btn { padding-block: calc(var(--envision-t2-spacing-control-padding-block) * 0.6); padding-inline: calc(var(--envision-t2-spacing-control-padding-inline) * 0.75); font-size: 0.875em; }
  :host([size='lg']) .btn { padding-block: calc(var(--envision-t2-spacing-control-padding-block) * 1.35); padding-inline: calc(var(--envision-t2-spacing-control-padding-inline) * 1.25); font-size: 1.0625em; }

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

const VARIANTS = ['primary', 'outline', 'ghost'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];

export class EnvisionButton extends EnvisionElement {
  static styles = styles;
  static observedAttributes = [
    'variant', 'size', 'label', 'leading-icon', 'trailing-icon', 'disabled', 'loading', 'full-width',
  ];

  #button!: HTMLButtonElement;
  #label!: HTMLSpanElement;
  #lead!: HTMLSpanElement;
  #trail!: HTMLSpanElement;

  // --- reactive props (attribute-backed; no class fields, per base-class note) ---
  get variant(): Variant { return this.getEnum('variant', VARIANTS, 'primary'); }
  set variant(v: Variant) { this.setStr('variant', v); }
  get size(): Size { return this.getEnum('size', SIZES, 'md'); }
  set size(v: Size) { this.setStr('size', v); }
  get label(): string { return this.getStr('label') ?? ''; }
  set label(v: string) { this.setStr('label', v); }
  get leadingIcon(): string | null { return this.getStr('leading-icon'); }
  set leadingIcon(v: string | null) { this.setStr('leading-icon', v); }
  get trailingIcon(): string | null { return this.getStr('trailing-icon'); }
  set trailingIcon(v: string | null) { this.setStr('trailing-icon', v); }
  get disabled(): boolean { return this.getBool('disabled'); }
  set disabled(v: boolean) { this.reflectBool('disabled', v); }
  get loading(): boolean { return this.getBool('loading'); }
  set loading(v: boolean) { this.reflectBool('loading', v); }
  get fullWidth(): boolean { return this.getBool('full-width'); }
  set fullWidth(v: boolean) { this.reflectBool('full-width', v); }

  connectedCallback(): void {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'primary');
    if (!this.hasAttribute('size')) this.setAttribute('size', 'md');
    // Block activation while loading/disabled at the capture phase (before consumer listeners).
    this.addEventListener('click', this.#guardActivation, { capture: true });
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#guardActivation, { capture: true } as EventListenerOptions);
  }

  #guardActivation = (e: Event): void => {
    if (this.disabled || this.loading) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `
      <button class="btn" part="button" type="button">
        <span class="spinner" part="spinner" aria-hidden="true"></span>
        <slot name="leading"></slot>
        <span class="icon lead" part="icon" aria-hidden="true"></span>
        <span class="label" part="label"></span>
        <span class="icon trail" part="icon" aria-hidden="true"></span>
        <slot name="trailing"></slot>
      </button>`;
    this.#button = root.querySelector('.btn')!;
    this.#label = root.querySelector('.label')!;
    this.#lead = root.querySelector('.icon.lead')!;
    this.#trail = root.querySelector('.icon.trail')!;
  }

  protected updated(): void {
    this.#label.textContent = this.label;
    // Material Symbols ligature default; consumers may instead slot custom icon nodes.
    this.#applyIcon(this.#lead, this.leadingIcon);
    this.#applyIcon(this.#trail, this.trailingIcon);
    // disabled removes the control from tab order (platform behavior); loading keeps it
    // focusable but announces busy and blocks activation (see #guardActivation).
    this.#button.disabled = this.disabled;
    this.#button.setAttribute('aria-busy', this.loading ? 'true' : 'false');
  }

  #applyIcon(el: HTMLSpanElement, name: string | null): void {
    if (name) {
      el.textContent = name;
      el.setAttribute('data-icon', name);
    } else {
      el.textContent = '';
      el.removeAttribute('data-icon');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-button': EnvisionButton;
  }
}
