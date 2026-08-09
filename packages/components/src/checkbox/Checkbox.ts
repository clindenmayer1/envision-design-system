import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { tryAttachInternals, setFormValue, emitChange } from '../base/internals.js';

/**
 * Envision Checkbox — `<envision-checkbox>`.
 *
 * Registry contract → "checkbox":
 *   props:  checked(required) · label(required) · disabled(false) · required(false) · invalid(false)
 *   states: checked · unchecked · focus-visible · disabled · error
 *   semantics: <input type=checkbox> · Space toggles · "not color-only (check glyph)"
 *
 * A REAL native <input type=checkbox> in the shadow root provides role, checked state,
 * Space-to-toggle, and focus for free. The check is drawn as GEOMETRY (a rotated tick), so the
 * checked state is conveyed by shape, not color alone. Form participation via ElementInternals
 * when available.
 */
const styles = css`
  :host { display: inline-flex; }
  .root {
    display: inline-flex;
    align-items: center;
    gap: var(--envision-t2-spacing-control-gap, 0.5rem);
    font-family: inherit;
    font-size: var(--envision-t1-font-size-14, 14px);
    color: var(--envision-t2-color-content-primary-default, #222);
    cursor: pointer;
  }
  input {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
    inline-size: 1.15rem;
    block-size: 1.15rem;
    display: grid;
    place-content: center;
    border: var(--envision-t2-border-width-emphasis, 2px) solid
      var(--envision-t2-color-border-default-default, #8a8a82);
    border-radius: var(--envision-t2-border-radius-control-sm, 4px);
    background: var(--envision-t2-color-background-surface-default, #fff);
    cursor: pointer;
    transition: background-color var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { input { transition: none; } }
  input::after {
    content: '';
    inline-size: 0.34rem;
    block-size: 0.62rem;
    border: solid var(--envision-t2-color-content-on-brand-default, #fff);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translateY(-1px);
    opacity: 0;
  }
  input:checked {
    background: var(--envision-t2-color-background-brand-default, #29594f);
    border-color: var(--envision-t2-color-border-brand-default, #29594f);
  }
  input:checked::after { opacity: 1; }
  input:focus-visible {
    outline: var(--envision-t2-border-width-focus, 2px) solid var(--envision-t2-color-border-focus-default, #29594f);
    outline-offset: 2px;
  }
  :host([invalid]) input { border-color: var(--envision-t2-color-border-error-default, #b00020); }
  :host([disabled]) .root { cursor: not-allowed; color: var(--envision-t2-color-content-disabled-default, #8a8a82); }
  :host([disabled]) input { cursor: not-allowed; border-color: var(--envision-t2-color-border-disabled-default, #e7e3dc); background: var(--envision-t2-color-background-surface-sunken-default, #fbf8f5); }
`;

export class EnvisionCheckbox extends EnvisionElement {
  static styles = styles;
  static formAssociated = true;
  static observedAttributes = ['checked', 'label', 'disabled', 'required', 'invalid'];

  #internals: ElementInternals | null = null;
  #input!: HTMLInputElement;
  #label!: HTMLSpanElement;

  constructor() {
    super();
    this.#internals = tryAttachInternals(this);
  }

  get checked(): boolean { return this.getBool('checked'); }
  set checked(v: boolean) { this.reflectBool('checked', v); }
  get label(): string { return this.getStr('label') ?? ''; }
  set label(v: string) { this.setStr('label', v); }
  get disabled(): boolean { return this.getBool('disabled'); }
  set disabled(v: boolean) { this.reflectBool('disabled', v); }
  get required(): boolean { return this.getBool('required'); }
  set required(v: boolean) { this.reflectBool('required', v); }
  get invalid(): boolean { return this.getBool('invalid'); }
  set invalid(v: boolean) { this.reflectBool('invalid', v); }

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `<label class="root" part="root"><input type="checkbox" part="control" /><span class="label" part="label"></span></label>`;
    this.#input = root.querySelector('input')!;
    this.#label = root.querySelector('.label')!;
    this.#input.addEventListener('change', this.#onChange);
  }

  #onChange = (): void => {
    this.checked = this.#input.checked; // reflect to host attribute
    setFormValue(this.#internals, this.#input.checked ? this.getStr('value') ?? 'on' : null);
    emitChange(this, { checked: this.#input.checked });
  };

  protected updated(): void {
    this.#label.textContent = this.label;
    this.#input.checked = this.checked;
    this.#input.disabled = this.disabled;
    this.#input.required = this.required;
    this.#input.setAttribute('aria-invalid', this.invalid ? 'true' : 'false');
    if (this.required) this.#input.setAttribute('aria-required', 'true');
    else this.#input.removeAttribute('aria-required');
    setFormValue(this.#internals, this.checked ? this.getStr('value') ?? 'on' : null);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-checkbox': EnvisionCheckbox;
  }
}
