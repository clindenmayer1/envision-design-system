import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
/**
 * Envision Tab — `<envision-tab>`.
 *
 * Registry contract → "rightrail-tab" (codeName Tab):
 *   props:  label(required) · selected(false) · disabled(false)
 *   states: default · hover · selected · disabled
 *   a11y:   role=tab · aria-selected · controls the tabpanel id ·
 *           Left/Right arrows move · Home/End · activation manual or automatic per APG
 *
 * The `Tabs` CONTAINER is a `proposed` (not-yet-designed) component, so it is intentionally not
 * built here. To keep the shipped Tab primitive fully keyboard-operable on its own, it coordinates
 * with sibling `<envision-tab>` elements under the same parent (a tablist): roving tabindex +
 * Arrow/Home/End, with selection-follows-focus (automatic). It emits a composed `select` event so a
 * host can show the matching panel; wrap in an element with role="tablist" for full APG semantics.
 */
const styles = css `
  :host { display: inline-flex; }
  .tab {
    appearance: none;
    border: none;
    background: transparent;
    /* Explicit type to match the website tabs (14px / 600). */
    font-family: inherit;
    font-size: var(--envision-t1-font-size-14);
    font-weight: var(--envision-t1-font-weight-600);
    cursor: pointer;
    /* Website tab padding: 16 top / 0 sides / 16 bottom (14 -> 16 under the rule of 8s).
       This previously read var(--envision-t1-spacing-16), a px-named token absent from this
       step-named scale, so the whole shorthand was invalid and the tab had no padding.
       NOTE: the Figma Tabs master carries padding 0 and spaces its indicator with an 8px
       itemSpacing instead, so Figma and the shipped website disagree here — logged for
       reconciliation rather than silently resolved. */
    padding: var(--envision-t2-spacing-container-padding-note) 0;
    color: var(--envision-t2-color-content-tertiary-default);
    border-block-end: 2px solid transparent;
  }
  .tab:hover { color: var(--envision-t2-color-content-primary-default); }
  :host([selected]) .tab {
    color: var(--envision-t3-tab-selected-color-content-default);
    border-block-end-color: var(--envision-t3-tab-selected-color-indicator-default);
  }
  .tab:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 2px; }
  :host([disabled]) .tab { color: var(--envision-t2-color-content-disabled-default); cursor: not-allowed; }
`;
export class EnvisionTab extends EnvisionElement {
    static styles = styles;
    static observedAttributes = ['label', 'selected', 'disabled', 'panel'];
    #tab;
    #label;
    get label() { return this.getStr('label') ?? ''; }
    set label(v) { this.setStr('label', v); }
    get selected() { return this.getBool('selected'); }
    set selected(v) { this.reflectBool('selected', v); }
    get disabled() { return this.getBool('disabled'); }
    set disabled(v) { this.reflectBool('disabled', v); }
    get panel() { return this.getStr('panel'); }
    set panel(v) { this.setStr('panel', v); }
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `<button class="tab" part="tab" role="tab" type="button"><span class="label" part="label"></span></button>`;
        this.#tab = root.querySelector('.tab');
        this.#label = root.querySelector('.label');
        this.#tab.addEventListener('click', () => this.#activate());
        this.#tab.addEventListener('keydown', this.#onKeydown);
    }
    #onKeydown = (e) => {
        const group = this.#group();
        if (!group.length)
            return;
        let idx = group.indexOf(this);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
            idx = (idx + 1) % group.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
            idx = (idx - 1 + group.length) % group.length;
        else if (e.key === 'Home')
            idx = 0;
        else if (e.key === 'End')
            idx = group.length - 1;
        else
            return;
        e.preventDefault();
        const next = group[idx];
        next.#tab.focus();
        next.#activate(); // automatic activation (selection follows focus)
    };
    #activate() {
        if (this.disabled)
            return;
        for (const t of this.#group())
            t.selected = t === this;
        this.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { label: this.label, panel: this.panel } }));
    }
    /** Sibling tabs under the same parent (the tablist), non-disabled, in DOM order. */
    #group() {
        const parent = this.parentElement;
        if (!parent)
            return [this];
        return Array.from(parent.children).filter((c) => c.tagName === 'ENVISION-TAB' && !c.disabled);
    }
    updated() {
        this.#label.textContent = this.label;
        this.#tab.setAttribute('aria-selected', this.selected ? 'true' : 'false');
        this.#tab.disabled = this.disabled;
        this.#tab.tabIndex = this.selected ? 0 : -1; // roving tabindex
        if (this.panel)
            this.#tab.setAttribute('aria-controls', this.panel);
        else
            this.#tab.removeAttribute('aria-controls');
    }
}
//# sourceMappingURL=Tab.js.map