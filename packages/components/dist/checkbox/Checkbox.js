import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { tryAttachInternals, setFormValue, emitChange } from '../base/internals.js';
/**
 * Envision Checkbox, `<envision-checkbox>`.
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
const styles = css `
  :host { display: inline-flex; }
  .root {
    display: inline-flex;
    align-items: center;
    gap: var(--envision-t2-spacing-control-gap);
    font-family: inherit;
    font-size: var(--envision-t1-font-size-14);
    color: var(--envision-t2-color-content-primary-default);
    cursor: pointer;
  }
  :host {
    --ev-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 9'%3E%3Cpath d='M1 4.6 4.4 8 11 1' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  }
  input {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
    inline-size: 1.15rem;
    block-size: 1.15rem;
    display: grid;
    place-content: center;
    border: var(--envision-t2-border-width-emphasis) solid
      var(--envision-t2-color-border-default-default);
    border-radius: var(--envision-t2-border-radius-control-sm);
    background: var(--envision-t2-color-background-surface-default);
    cursor: pointer;
    transition: background-color var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { input { transition: none; } }
  input::after {
    content: '';
    /* 11.5 x 8.3 in Figma's 22px box, expressed against this box's own size. */
    inline-size: 0.6rem;
    block-size: 0.44rem;
    background: var(--envision-t2-color-content-on-brand-default);
    -webkit-mask: var(--ev-check) center / contain no-repeat;
    mask: var(--ev-check) center / contain no-repeat;
    opacity: 0;
  }
  input:checked {
    background: var(--envision-t2-color-background-brand-default);
    border-color: var(--envision-t2-color-border-brand-default);
  }
  input:checked::after { opacity: 1; }
  input:focus-visible {
    outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default);
    outline-offset: 2px;
  }
  :host([invalid]) input { border-color: var(--envision-t2-color-border-error-default); }
  :host([disabled]) .root { cursor: not-allowed; color: var(--envision-t2-color-content-disabled-default); }
  :host([disabled]) input { cursor: not-allowed; border-color: var(--envision-t2-color-border-disabled-default); background: var(--envision-t2-color-background-surface-sunken-default); }
`;
export class EnvisionCheckbox extends EnvisionElement {
    static styles = styles;
    static formAssociated = true;
    static observedAttributes = ['checked', 'label', 'disabled', 'required', 'invalid'];
    #internals = null;
    #input;
    #label;
    constructor() {
        super();
        this.#internals = tryAttachInternals(this);
    }
    get checked() { return this.getBool('checked'); }
    set checked(v) { this.reflectBool('checked', v); }
    get label() { return this.getStr('label') ?? ''; }
    set label(v) { this.setStr('label', v); }
    get disabled() { return this.getBool('disabled'); }
    set disabled(v) { this.reflectBool('disabled', v); }
    get required() { return this.getBool('required'); }
    set required(v) { this.reflectBool('required', v); }
    get invalid() { return this.getBool('invalid'); }
    set invalid(v) { this.reflectBool('invalid', v); }
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `<label class="root" part="root"><input type="checkbox" part="control" /><span class="label" part="label"></span></label>`;
        this.#input = root.querySelector('input');
        this.#label = root.querySelector('.label');
        this.#input.addEventListener('change', this.#onChange);
    }
    #onChange = () => {
        this.checked = this.#input.checked; // reflect to host attribute
        setFormValue(this.#internals, this.#input.checked ? this.getStr('value') ?? 'on' : null);
        emitChange(this, { checked: this.#input.checked });
    };
    updated() {
        this.#label.textContent = this.label;
        this.#input.checked = this.checked;
        this.#input.disabled = this.disabled;
        this.#input.required = this.required;
        this.#input.setAttribute('aria-invalid', this.invalid ? 'true' : 'false');
        if (this.required)
            this.#input.setAttribute('aria-required', 'true');
        else
            this.#input.removeAttribute('aria-required');
        setFormValue(this.#internals, this.checked ? this.getStr('value') ?? 'on' : null);
    }
}
//# sourceMappingURL=Checkbox.js.map