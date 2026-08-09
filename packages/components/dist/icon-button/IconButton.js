import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
/**
 * Envision IconButton — `<envision-icon-button>`. Icon-only action.
 *
 * Registry contract → "icon-button":
 *   props:  icon(required) · accessibleName(string, REQUIRED — icon-only has no visible text) ·
 *           variant('standard'|'subtle'=standard) · selected(false) · disabled(false) · tooltip?
 *   states: default · hover · focus-visible · selected · disabled
 *   a11y:   aria-label = accessibleName · aria-pressed when toggle · Enter/Space · tooltip Esc
 */
const styles = css `
  :host { display: inline-flex; }
  .btn {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    padding: 0;
    border: none;
    border-radius: var(--envision-t2-border-radius-control, 8px);
    background: transparent;
    color: var(--envision-t2-color-content-secondary-default, #666);
    cursor: pointer;
    transition: background-color var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
  :host([size='sm']) .btn { inline-size: 2rem; block-size: 2rem; }
  :host([size='lg']) .btn { inline-size: 3rem; block-size: 3rem; }

  .btn:hover { background: var(--envision-t2-color-background-brand-subtle-default, rgba(41, 89, 79, 0.08)); }
  :host([variant='subtle']) .btn { color: var(--envision-t2-color-content-tertiary-default, #8a8a82); }

  :host([selected]) .btn {
    background: var(--envision-t2-color-background-brand-default, #29594f);
    color: var(--envision-t2-color-content-on-brand-default, #fff);
  }

  .btn:focus-visible {
    outline: var(--envision-t2-border-width-focus, 2px) solid var(--envision-t2-color-border-focus-default, #29594f);
    outline-offset: 2px;
  }

  :host([disabled]) .btn { cursor: not-allowed; color: var(--envision-t2-color-content-disabled-default, #8a8a82); background: transparent; }

  .icon {
    font-family: 'Material Symbols Outlined', sans-serif;
    font-size: 1.375rem;
    line-height: 1;
    font-feature-settings: 'liga';
  }
`;
const VARIANTS = ['standard', 'subtle'];
export class EnvisionIconButton extends EnvisionElement {
    static styles = styles;
    static observedAttributes = ['icon', 'accessible-name', 'variant', 'selected', 'disabled', 'tooltip', 'size'];
    #button;
    #icon;
    get icon() { return this.getStr('icon') ?? ''; }
    set icon(v) { this.setStr('icon', v); }
    get accessibleName() { return this.getStr('accessible-name') ?? ''; }
    set accessibleName(v) { this.setStr('accessible-name', v); }
    get variant() { return this.getEnum('variant', VARIANTS, 'standard'); }
    set variant(v) { this.setStr('variant', v); }
    get selected() { return this.getBool('selected'); }
    set selected(v) { this.reflectBool('selected', v); }
    get disabled() { return this.getBool('disabled'); }
    set disabled(v) { this.reflectBool('disabled', v); }
    get tooltip() { return this.getStr('tooltip'); }
    set tooltip(v) { this.setStr('tooltip', v); }
    connectedCallback() {
        if (!this.hasAttribute('variant'))
            this.setAttribute('variant', 'standard');
        this.addEventListener('click', this.#guard, { capture: true });
        super.connectedCallback();
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.#guard, { capture: true });
    }
    #guard = (e) => {
        if (this.disabled) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    };
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `<button class="btn" part="button" type="button"><span class="icon" part="icon" aria-hidden="true"></span></button>`;
        this.#button = root.querySelector('.btn');
        this.#icon = root.querySelector('.icon');
    }
    updated() {
        this.#icon.textContent = this.icon;
        // accessible name is MANDATORY for an icon-only control
        this.#button.setAttribute('aria-label', this.accessibleName || this.icon);
        // toggle semantics only when `selected` is meaningfully present as a toggle
        if (this.hasAttribute('selected') || this.selected) {
            this.#button.setAttribute('aria-pressed', this.selected ? 'true' : 'false');
        }
        else {
            this.#button.removeAttribute('aria-pressed');
        }
        this.#button.disabled = this.disabled;
        // Minimal tooltip via title; the richer APG tooltip (Esc-dismiss, hoverable) is the
        // proposed Tooltip component — documented as a staged dependency.
        if (this.tooltip)
            this.#button.setAttribute('title', this.tooltip);
        else
            this.#button.removeAttribute('title');
    }
}
//# sourceMappingURL=IconButton.js.map