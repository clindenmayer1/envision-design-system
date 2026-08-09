import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { tryAttachInternals, setFormValue, emitChange } from '../base/internals.js';
/**
 * Envision Switch — `<envision-switch>`.
 *
 * Registry contract → "switch":
 *   props:  checked(required) · label(required) · disabled(false)
 *   states: on · off · focus-visible · disabled
 *   semantics: role=switch · Space/Enter toggles
 *
 * Built on a native <input type=checkbox role=switch>: checkbox gives the toggle behavior and
 * Space handling; role=switch gives the on/off semantics; we add Enter to toggle (per contract,
 * native checkbox only toggles on Space). The on/off state also shifts the thumb position, so it
 * is not conveyed by color alone.
 */
const styles = css `
  :host { display: inline-flex; }
  .root { display: inline-flex; align-items: center; gap: var(--envision-t2-spacing-control-gap, 0.5rem); font-family: inherit; font-size: var(--envision-t1-font-size-14, 14px); color: var(--envision-t2-color-content-primary-default, #222); cursor: pointer; }
  .track {
    position: relative;
    inline-size: 2.25rem;
    block-size: 1.25rem;
    flex: none;
  }
  input {
    appearance: none;
    -webkit-appearance: none;
    position: absolute;
    inset: 0;
    margin: 0;
    inline-size: 100%;
    block-size: 100%;
    border-radius: var(--envision-t2-border-radius-pill, 999px);
    background: var(--envision-t2-color-border-default-default, #8a8a82);
    cursor: pointer;
    transition: background-color var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .thumb {
    position: absolute;
    inset-block-start: 0.1875rem;
    inset-inline-start: 0.1875rem;
    inline-size: 0.875rem;
    block-size: 0.875rem;
    border-radius: 50%;
    background: var(--envision-t2-color-content-on-brand-default, #fff);
    pointer-events: none;
    transition: transform var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { input, .thumb { transition: none; } }
  input:checked { background: var(--envision-t2-color-background-brand-default, #29594f); }
  :host([checked]) .thumb { transform: translateX(1rem); }
  input:focus-visible { outline: var(--envision-t2-border-width-focus, 2px) solid var(--envision-t2-color-border-focus-default, #29594f); outline-offset: 2px; }
  :host([disabled]) .root { cursor: not-allowed; color: var(--envision-t2-color-content-disabled-default, #8a8a82); }
  :host([disabled]) input { cursor: not-allowed; opacity: 0.5; }
`;
export class EnvisionSwitch extends EnvisionElement {
    static styles = styles;
    static formAssociated = true;
    static observedAttributes = ['checked', 'label', 'disabled'];
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
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `<label class="root" part="root"><span class="track"><input type="checkbox" role="switch" part="control" /><span class="thumb" part="thumb" aria-hidden="true"></span></span><span class="label" part="label"></span></label>`;
        this.#input = root.querySelector('input');
        this.#label = root.querySelector('.label');
        this.#input.addEventListener('change', this.#onChange);
        // Contract requires Enter to toggle too (native checkbox only toggles on Space).
        this.#input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.disabled) {
                e.preventDefault();
                this.#input.checked = !this.#input.checked;
                this.#onChange();
            }
        });
    }
    #onChange = () => {
        this.checked = this.#input.checked;
        setFormValue(this.#internals, this.#input.checked ? this.getStr('value') ?? 'on' : null);
        emitChange(this, { checked: this.#input.checked });
    };
    updated() {
        this.#label.textContent = this.label;
        this.#input.checked = this.checked;
        this.#input.disabled = this.disabled;
        setFormValue(this.#internals, this.checked ? this.getStr('value') ?? 'on' : null);
    }
}
//# sourceMappingURL=Switch.js.map