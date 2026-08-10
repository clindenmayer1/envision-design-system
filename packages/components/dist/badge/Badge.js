import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
/**
 * Envision Badge — `<envision-badge>`. Count or status indicator.
 *
 * Registry contract → "badge":
 *   props:  tone('neutral'|'brand'|'info'|'success'|'warning'|'error'=neutral) ·
 *           shape('count'|'dot'=count) · count(number) · max(number=99)
 *
 * Token reconciliation (documented in AUDIT.md): the emitted T3 badge tones are
 * neutral/info/success/warning/critical/promotional, so the registry's `error`→`critical`
 * and `brand`→`promotional`. A `label` attribute is added for the accessible-name path the
 * registry/ACCESSIBILITY.md require ("count via aria-label; adjacent text conveys meaning").
 */
const TONE_TO_TOKEN = {
    neutral: 'neutral',
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'critical',
    brand: 'promotional',
};
const styles = css `
  :host { display: inline-flex; vertical-align: middle; }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--envision-t3-badge-medium-gap-default);
    font-family: inherit;
    font-weight: var(--envision-t1-font-weight-600);
    font-size: var(--envision-t3-badge-medium-font-size-default);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    padding-block: var(--envision-t3-badge-medium-padding-block-default);
    padding-inline: var(--envision-t3-badge-medium-padding-inline-default);
    border-radius: var(--envision-t2-border-radius-pill);
    background: var(--ev-badge-bg, var(--envision-t3-badge-neutral-color-background-default));
    color: var(--ev-badge-fg, var(--envision-t3-badge-neutral-color-content-default));
  }
  :host([shape='dot']) .badge {
    inline-size: var(--envision-t3-badge-notification-dot-size);
    block-size: var(--envision-t3-badge-notification-dot-size);
    padding: 0;
    border-radius: 50%;
  }
  :host([shape='dot']) .num { display: none; }
  :host([shape='dot']) .text { display: none; }
  .text:empty { display: none; }
`;
const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'error'];
const SHAPES = ['count', 'dot'];
export class EnvisionBadge extends EnvisionElement {
    static styles = styles;
    static observedAttributes = ['tone', 'shape', 'count', 'max', 'label'];
    #badge;
    #num;
    #text;
    get tone() { return this.getEnum('tone', TONES, 'neutral'); }
    set tone(v) { this.setStr('tone', v); }
    get shape() { return this.getEnum('shape', SHAPES, 'count'); }
    set shape(v) { this.setStr('shape', v); }
    get count() { const v = this.getStr('count'); return v == null ? null : Number(v); }
    set count(v) { this.setStr('count', v == null ? null : String(v)); }
    get max() { const v = Number(this.getStr('max')); return Number.isFinite(v) && v > 0 ? v : 99; }
    set max(v) { this.setStr('max', String(v)); }
    get label() { return this.getStr('label'); }
    set label(v) { this.setStr('label', v); }
    connectedCallback() {
        if (!this.hasAttribute('tone'))
            this.setAttribute('tone', 'neutral');
        if (!this.hasAttribute('shape'))
            this.setAttribute('shape', 'count');
        super.connectedCallback();
    }
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `<span class="badge" part="badge"><span class="text" part="label"></span><span class="num" part="count"></span></span>`;
        this.#badge = root.querySelector('.badge');
        this.#num = root.querySelector('.num');
        this.#text = root.querySelector('.text');
    }
    updated() {
        // tone → token custom-property switch (drives .badge background/content)
        const token = TONE_TO_TOKEN[this.tone] ?? 'neutral';
        this.#badge.style.setProperty('--ev-badge-bg', `var(--envision-t3-badge-${token}-color-background-default)`);
        this.#badge.style.setProperty('--ev-badge-fg', `var(--envision-t3-badge-${token}-color-content-default)`);
        // count → clamped display ("99+")
        const display = this.#displayCount();
        this.#num.textContent = display;
        // A status Badge (Figma: Badge with a Label) shows its label as TEXT; a notification Badge
        // shows a count. Label text renders only when there is no count, so counted and dot badges
        // are unchanged and `label` keeps acting purely as their accessible name.
        const showsText = this.shape !== 'dot' && this.count == null && !!this.label;
        this.#text.textContent = showsText ? this.label : '';
        // accessible name: explicit label wins; else count phrase; dot with no label is decorative
        const name = this.label ??
            (this.shape === 'count' && this.count != null ? `${this.count} ${this.count === 1 ? 'item' : 'items'}` : null);
        if (showsText) {
            // The visible text IS the accessible name; a live region would re-announce it on insert.
            this.#badge.removeAttribute('role');
            this.#badge.removeAttribute('aria-label');
            this.#badge.removeAttribute('aria-hidden');
        }
        else if (name) {
            this.#badge.setAttribute('role', 'status');
            this.#badge.setAttribute('aria-label', name);
            this.#badge.removeAttribute('aria-hidden');
        }
        else {
            this.#badge.removeAttribute('role');
            this.#badge.removeAttribute('aria-label');
            this.#badge.setAttribute('aria-hidden', 'true');
        }
    }
    #displayCount() {
        if (this.shape === 'dot' || this.count == null)
            return '';
        return this.count > this.max ? `${this.max}+` : String(this.count);
    }
}
//# sourceMappingURL=Badge.js.map