import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { tryAttachInternals, setFormValue, emitChange, emitInput } from '../base/internals.js';
/**
 * Envision Input (Field) — `<envision-input>`.
 *
 * Registry contract → "field" (codeName Input):
 *   props:  type('text'|'email'|'search'|'number'|'price'|'password'=text) · value · label(required) ·
 *           helperText · errorMessage · invalid(false) · required(false) · disabled(false) ·
 *           leadingIcon · trailingIcon
 *   states: empty · filled · hover · focus-visible · invalid · disabled · read-only · required
 *   a11y:   persistent <label> associated by id (placeholder is NOT a label) · aria-invalid ·
 *           aria-describedby → error/helper · aria-required
 *
 * Label, input, and messages all live in ONE shadow root, so `for`/`id`/`aria-describedby`
 * association works within scope. `price` maps to a text input with decimal inputmode (locale
 * formatting is product/content responsibility, not a control concern — SYSTEM_SPEC §8).
 */
const styles = css `
  :host { display: block; }
  .field { display: flex; flex-direction: column; gap: var(--envision-t2-spacing-control-gap-tight, 0.25rem); font: inherit; }
  .label { color: var(--envision-t2-color-content-primary-default, #222); display: inline-flex; gap: 0.25rem; }
  .req { color: var(--envision-t2-color-content-error-default, #b00020); }
  .control {
    display: flex;
    align-items: center;
    gap: var(--envision-t2-spacing-control-gap-tight, 0.25rem);
    border: var(--envision-t2-border-width-default, 1px) solid var(--envision-t3-input-default-color-border-default, #8a8a82);
    border-radius: var(--envision-t2-border-radius-control, 8px);
    background: var(--envision-t2-color-background-surface-default, #fff);
    padding-inline: var(--envision-t2-spacing-control-padding-inline, 0.75rem);
  }
  .control:hover { border-color: var(--envision-t3-input-default-color-border-hover, #666); }
  .control:focus-within {
    border-color: var(--envision-t3-input-default-color-border-focus, #29594f);
    outline: var(--envision-t2-border-width-focus, 2px) solid var(--envision-t2-color-border-focus-default, #29594f);
    outline-offset: 1px;
  }
  input {
    flex: 1;
    min-inline-size: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: var(--envision-t1-font-size-15, 15px);
    color: var(--envision-t2-color-content-primary-default, #222);
    padding-block: var(--envision-t2-spacing-control-padding-block, 0.5rem);
  }
  input::placeholder { color: var(--envision-t2-color-content-placeholder-default, #8a8a82); }
  .icon { font-family: 'Material Symbols Outlined', sans-serif; line-height: 1; color: var(--envision-t2-color-content-tertiary-default, #8a8a82); font-feature-settings: 'liga'; }
  .icon:empty { display: none; }
  .msg { font-size: 0.8125em; color: var(--envision-t2-color-content-secondary-default, #666); }
  .msg.error { color: var(--envision-t2-color-content-error-default, #b00020); }
  .msg:empty { display: none; }
  :host([invalid]) .control { border-color: var(--envision-t3-input-default-color-border-error, #b00020); }
  :host([disabled]) .control { background: var(--envision-t2-color-background-surface-sunken-default, #fbf8f5); border-color: var(--envision-t2-color-border-disabled-default, #e7e3dc); }
  :host([disabled]) input { cursor: not-allowed; color: var(--envision-t2-color-content-disabled-default, #8a8a82); }
`;
const TYPES = ['text', 'email', 'search', 'number', 'price', 'password'];
let uid = 0;
export class EnvisionInput extends EnvisionElement {
    static styles = styles;
    static formAssociated = true;
    static observedAttributes = [
        'type', 'value', 'label', 'helper-text', 'error-message', 'invalid', 'required', 'disabled',
        'readonly', 'leading-icon', 'trailing-icon', 'placeholder',
    ];
    #internals = null;
    #input;
    #labelText;
    #req;
    #lead;
    #trail;
    #helper;
    #error;
    #id = `ev-input-${++uid}`;
    constructor() {
        super();
        this.#internals = tryAttachInternals(this);
    }
    get type() { return this.getEnum('type', TYPES, 'text'); }
    set type(v) { this.setStr('type', v); }
    get value() { return this.#input ? this.#input.value : this.getStr('value') ?? ''; }
    set value(v) { this.setStr('value', v); }
    get label() { return this.getStr('label') ?? ''; }
    set label(v) { this.setStr('label', v); }
    get helperText() { return this.getStr('helper-text') ?? ''; }
    set helperText(v) { this.setStr('helper-text', v); }
    get errorMessage() { return this.getStr('error-message') ?? ''; }
    set errorMessage(v) { this.setStr('error-message', v); }
    get invalid() { return this.getBool('invalid'); }
    set invalid(v) { this.reflectBool('invalid', v); }
    get required() { return this.getBool('required'); }
    set required(v) { this.reflectBool('required', v); }
    get disabled() { return this.getBool('disabled'); }
    set disabled(v) { this.reflectBool('disabled', v); }
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `
      <div class="field" part="field">
        <label class="label" part="label" for="${this.#id}"><span class="label-text"></span><span class="req" aria-hidden="true" hidden>*</span></label>
        <div class="control" part="control">
          <span class="icon lead" part="icon" aria-hidden="true"></span>
          <input id="${this.#id}" part="input" />
          <span class="icon trail" part="icon" aria-hidden="true"></span>
        </div>
        <div class="msg helper" id="${this.#id}-help" part="helper"></div>
        <div class="msg error" id="${this.#id}-err" part="error"></div>
      </div>`;
        this.#input = root.querySelector('input');
        this.#labelText = root.querySelector('.label-text');
        this.#req = root.querySelector('.req');
        this.#lead = root.querySelector('.icon.lead');
        this.#trail = root.querySelector('.icon.trail');
        this.#helper = root.querySelector('.helper');
        this.#error = root.querySelector('.error');
        this.#input.addEventListener('input', () => {
            this.setStr('value', this.#input.value);
            setFormValue(this.#internals, this.#input.value);
            emitInput(this, { value: this.#input.value });
        });
        this.#input.addEventListener('change', () => emitChange(this, { value: this.#input.value }));
    }
    updated() {
        this.#labelText.textContent = this.label;
        this.#req.hidden = !this.required;
        // 'price' → text with decimal inputmode; others map straight through.
        const t = this.type;
        this.#input.type = t === 'price' ? 'text' : t;
        if (t === 'price' || t === 'number')
            this.#input.inputMode = 'decimal';
        else
            this.#input.removeAttribute('inputmode');
        const v = this.getStr('value') ?? '';
        if (this.#input.value !== v)
            this.#input.value = v;
        this.#input.disabled = this.disabled;
        this.#input.required = this.required;
        this.#input.readOnly = this.getBool('readonly');
        const ph = this.getStr('placeholder');
        if (ph)
            this.#input.placeholder = ph;
        else
            this.#input.removeAttribute('placeholder');
        this.#applyIcon(this.#lead, this.getStr('leading-icon'));
        this.#applyIcon(this.#trail, this.getStr('trailing-icon'));
        this.#helper.textContent = this.helperText;
        this.#error.textContent = this.invalid ? this.errorMessage : '';
        // a11y wiring
        this.#input.setAttribute('aria-invalid', this.invalid ? 'true' : 'false');
        if (this.required)
            this.#input.setAttribute('aria-required', 'true');
        else
            this.#input.removeAttribute('aria-required');
        const describedby = [
            this.helperText ? `${this.#id}-help` : '',
            this.invalid && this.errorMessage ? `${this.#id}-err` : '',
        ].filter(Boolean).join(' ');
        if (describedby)
            this.#input.setAttribute('aria-describedby', describedby);
        else
            this.#input.removeAttribute('aria-describedby');
        setFormValue(this.#internals, v);
    }
    #applyIcon(el, name) {
        el.textContent = name ?? '';
    }
}
//# sourceMappingURL=Input.js.map