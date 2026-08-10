import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
/**
 * Envision Link — `<envision-link>`. Inline or standalone navigation.
 *
 * Registry contract → "link":
 *   props:  href(required) · label(required) · variant('inline'|'standalone'=inline) ·
 *           directionIcon(false, RTL-aware) · disabled(false, only when semantically appropriate)
 *   semantics: <a href>. Enter activates (native). Hover underline; focus-visible ring.
 *
 * A disabled link is an anti-pattern for real navigation, so `disabled` drops the href,
 * removes it from the tab order, sets aria-disabled, and blocks activation (per registry note
 * "only when semantically appropriate").
 */
const styles = css `
  :host { display: inline; }
  :host([variant='standalone']) { display: inline-flex; }
  a {
    display: inline;
    align-items: center;
    gap: var(--envision-t2-spacing-control-gap-tight);
    color: var(--envision-t2-color-content-brand-default);
    text-decoration: none;
    border-radius: var(--envision-t2-border-radius-control-xs);
    cursor: pointer;
  }
  :host([variant='inline']) a { text-decoration: underline; text-underline-offset: 0.15em; }
  a:hover { color: var(--envision-t2-color-content-brand-hover); text-decoration: underline; }
  a:focus-visible {
    outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default);
    outline-offset: 2px;
  }
  :host([variant='standalone']) a { display: inline-flex; }
  :host([disabled]) a {
    color: var(--envision-t2-color-content-disabled-default);
    text-decoration: none;
    cursor: not-allowed;
    pointer-events: none;
  }
  .arrow { font-family: 'Material Symbols Outlined', sans-serif; font-size: 1.1em; line-height: 1; font-feature-settings: 'liga'; }
  :host(:dir(rtl)) .arrow { transform: scaleX(-1); }
`;
const VARIANTS = ['inline', 'standalone'];
export class EnvisionLink extends EnvisionElement {
    static styles = styles;
    static observedAttributes = ['href', 'label', 'variant', 'direction-icon', 'disabled'];
    #a;
    #label;
    #arrow;
    get href() { return this.getStr('href') ?? ''; }
    set href(v) { this.setStr('href', v); }
    get label() { return this.getStr('label') ?? ''; }
    set label(v) { this.setStr('label', v); }
    get variant() { return this.getEnum('variant', VARIANTS, 'inline'); }
    set variant(v) { this.setStr('variant', v); }
    get directionIcon() { return this.getBool('direction-icon'); }
    set directionIcon(v) { this.reflectBool('direction-icon', v); }
    get disabled() { return this.getBool('disabled'); }
    set disabled(v) { this.reflectBool('disabled', v); }
    connectedCallback() {
        if (!this.hasAttribute('variant'))
            this.setAttribute('variant', 'inline');
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
        root.innerHTML = `<a part="link"><span class="label" part="label"></span><span class="arrow" part="icon" aria-hidden="true" hidden>arrow_forward</span></a>`;
        this.#a = root.querySelector('a');
        this.#label = root.querySelector('.label');
        this.#arrow = root.querySelector('.arrow');
    }
    updated() {
        this.#label.textContent = this.label;
        if (this.disabled) {
            this.#a.removeAttribute('href');
            this.#a.setAttribute('role', 'link');
            this.#a.setAttribute('aria-disabled', 'true');
            this.#a.tabIndex = -1;
        }
        else {
            this.#a.setAttribute('href', this.href);
            this.#a.removeAttribute('aria-disabled');
            this.#a.removeAttribute('role');
            this.#a.removeAttribute('tabindex');
        }
        this.#arrow.hidden = !this.directionIcon;
    }
}
//# sourceMappingURL=Link.js.map