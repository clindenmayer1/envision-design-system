import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { emitChange } from '../base/internals.js';

/**
 * Envision Radio — `<envision-radio>`.
 *
 * Registry contract → "radio":
 *   props:  checked(required) · name(required) · value(required) · label(required) · disabled(false)
 *   states: selected · unselected · focus-visible · disabled
 *   semantics: <input type=radio> group · Arrow keys move within group; Space selects
 *
 * WEB-COMPONENTS NOTE (documented in the architecture doc): native radios only group within a
 * single tree scope, so radios that are SEPARATE custom elements (each with its own shadow root)
 * do NOT group natively. This component therefore coordinates the group itself by `name` within
 * the shared root node: selecting one deselects same-name siblings, and Arrow/Home/End implement
 * the APG roving-tabindex pattern. The selected state is a filled inner dot (shape, not color-only).
 */
const styles = css`
  :host { display: inline-flex; }
  .root { display: inline-flex; align-items: center; gap: var(--envision-t2-spacing-control-gap); font-family: inherit; font-size: var(--envision-t1-font-size-14); color: var(--envision-t2-color-content-primary-default); cursor: pointer; }
  input {
    appearance: none; -webkit-appearance: none; margin: 0;
    inline-size: 1.15rem; block-size: 1.15rem;
    display: grid; place-content: center;
    border: var(--envision-t2-border-width-emphasis) solid var(--envision-t2-color-border-default-default);
    border-radius: 50%;
    background: var(--envision-t2-color-background-surface-default);
    cursor: pointer;
  }
  input::after { content: ''; inline-size: 0.6rem; block-size: 0.6rem; border-radius: 50%; background: var(--envision-t2-color-background-brand-default); opacity: 0; }
  input:checked { border-color: var(--envision-t2-color-border-brand-default); }
  input:checked::after { opacity: 1; }
  input:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 2px; }
  :host([disabled]) .root { cursor: not-allowed; color: var(--envision-t2-color-content-disabled-default); }
  :host([disabled]) input { cursor: not-allowed; opacity: 0.5; }
`;

export class EnvisionRadio extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['checked', 'name', 'value', 'label', 'disabled'];

  #input!: HTMLInputElement;
  #label!: HTMLSpanElement;

  get checked(): boolean { return this.getBool('checked'); }
  set checked(v: boolean) { this.reflectBool('checked', v); }
  get name(): string { return this.getStr('name') ?? ''; }
  set name(v: string) { this.setStr('name', v); }
  get value(): string { return this.getStr('value') ?? ''; }
  set value(v: string) { this.setStr('value', v); }
  get label(): string { return this.getStr('label') ?? ''; }
  set label(v: string) { this.setStr('label', v); }
  get disabled(): boolean { return this.getBool('disabled'); }
  set disabled(v: boolean) { this.reflectBool('disabled', v); }

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `<label class="root" part="root"><input type="radio" part="control" /><span class="label" part="label"></span></label>`;
    this.#input = root.querySelector('input')!;
    this.#label = root.querySelector('.label')!;
    this.#input.addEventListener('change', () => this.#select());
    this.#input.addEventListener('keydown', this.#onKeydown);
  }

  #onKeydown = (e: KeyboardEvent): void => {
    const group = this.#group();
    if (group.length < 2) return;
    let idx = group.indexOf(this);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { idx = (idx + 1) % group.length; }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { idx = (idx - 1 + group.length) % group.length; }
    else if (e.key === 'Home') { idx = 0; }
    else if (e.key === 'End') { idx = group.length - 1; }
    else return;
    e.preventDefault();
    const next = group[idx];
    next.#select();
    next.#input.focus();
  };

  #select(): void {
    if (this.disabled) return;
    for (const r of this.#group()) r.checked = r === this;
    emitChange(this, { name: this.name, value: this.value });
  }

  /** Same-name, non-disabled radios within the shared root, in DOM order. */
  #group(): EnvisionRadio[] {
    const rootNode = this.getRootNode() as Document | ShadowRoot;
    const all = Array.from(rootNode.querySelectorAll<EnvisionRadio>(`envision-radio[name="${cssEscape(this.name)}"]`));
    return all.filter((r) => !r.disabled);
  }

  protected updated(): void {
    this.#label.textContent = this.label;
    this.#input.checked = this.checked;
    this.#input.name = this.name;
    this.#input.value = this.value;
    this.#input.disabled = this.disabled;
    // Roving tabindex depends on GROUP state, so recompute it for every member — a radio added
    // or selected must correct its siblings' tab order, not just its own.
    this.#applyRovingTabIndex();
  }

  /** APG roving tabindex across the group: the checked radio (or the first when none is) is tabbable. */
  #applyRovingTabIndex(): void {
    const group = this.#group();
    const anyChecked = group.some((r) => r.checked);
    for (const r of group) {
      const tabbable = r.checked || (!anyChecked && group[0] === r);
      if (r.#input) r.#input.tabIndex = tabbable ? 0 : -1;
    }
  }
}

function cssEscape(v: string): string {
  return v.replace(/["\\]/g, '\\$&');
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-radio': EnvisionRadio;
  }
}
