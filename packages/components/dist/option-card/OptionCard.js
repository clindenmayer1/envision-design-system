import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
/**
 * Envision OptionCard — `<envision-option-card>`. Selection-row opener in the RightRail.
 *
 * Registry → "option-card":
 *   props:  options(MaterialOption[]) · value(string) · title(required) · note ·
 *           onOpen(() opens tray; if absent, cycles) · active(false, tray open for this card)
 *   states: default · hover · pressed · selected/active · loading · price-pending
 *   a11y (ACCESSIBILITY.md): the WHOLE card is a <button>; NO nested interactive; opens the tray.
 *
 * The note is "Included" or "+$X"; the upgrade style applies when it is not "Included". `options`
 * + `value` are object properties used to render the current thumb; `title`/`note`/`active` are
 * attributes. Emits a composed `open` event.
 */
const styles = css `
  :host { display: block; }
  .card {
    inline-size: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--envision-t3-option-card-text-gap, 0.75rem);
    text-align: start;
    padding: var(--envision-t1-spacing-12, 12px);
    border: none;
    border-radius: var(--envision-t2-border-radius-control, 6px);
    background: var(--envision-t2-color-background-surface-warm-default, #fbf8f5);
    cursor: pointer;
    box-shadow: 0 0 0 1px var(--envision-t3-option-card-ring-rest, #e7e3dc);
    transition: box-shadow var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { .card { transition: none; } }
  .card:hover { box-shadow: 0 0 0 1px var(--envision-t3-option-card-ring-hover, #ababa0); }
  .card:active { box-shadow: 0 0 0 2px var(--envision-t3-option-card-ring-pressed, #998574); }
  :host([active]) .card { box-shadow: 0 0 0 2px var(--envision-t3-option-card-ring-selected, #29594f); }
  .card:focus-visible { outline: var(--envision-t2-border-width-focus, 2px) solid var(--envision-t2-color-border-focus-default, #29594f); outline-offset: 2px; }
  /* Website thumb = 72px, radius 4 (control-sm). */
  .thumb { inline-size: 72px; block-size: 72px; flex: none; border-radius: var(--envision-t2-border-radius-control-sm, 4px); background: var(--envision-t2-color-background-surface-sunken-default, #edeae4) var(--ev-thumb, none); background-size: cover; background-position: center; }
  .body { flex: 1; min-inline-size: 0; display: flex; flex-direction: column; gap: 0.125rem; }
  /* Website title = 14 / 600 / 1.2; note = 13 / 500 / 1.6. */
  .title { font-family: inherit; font-size: var(--envision-t1-font-size-14, 14px); font-weight: var(--envision-t1-font-weight-600, 600); line-height: var(--envision-t1-line-height-120, 1.2); color: var(--envision-t2-color-content-primary-default, #222); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .note { font-size: var(--envision-t1-font-size-13, 13px); font-weight: var(--envision-t1-font-weight-500, 500); line-height: var(--envision-t1-line-height-160, 1.6); color: var(--envision-t2-color-content-secondary-default, #666); }
  .note.upgrade { color: var(--envision-t2-color-content-brand-default, #29594f); font-weight: var(--envision-t1-font-weight-600, 600); }
  .note.pending { color: var(--envision-t2-color-content-secondary-default, #666); font-style: italic; }
  .chev { flex: none; font-family: 'Material Symbols Outlined', sans-serif; font-size: var(--envision-t1-font-size-20, 20px); color: var(--envision-t2-color-content-tertiary-default, #8a8a82); font-feature-settings: 'liga'; }
  :host([loading]) .card { opacity: 0.6; pointer-events: none; }
`;
export class EnvisionOptionCard extends EnvisionElement {
    static styles = styles;
    static observedAttributes = ['title', 'note', 'active', 'loading', 'price-pending', 'thumb-image', 'thumb-color'];
    #card;
    #thumb;
    #title;
    #note;
    #options = [];
    #value = '';
    get options() { return this.#options; }
    set options(v) { this.#options = v ?? []; this.requestUpdate(); }
    get value() { return this.#value || (this.getStr('value') ?? ''); }
    set value(v) { this.#value = v; this.requestUpdate(); }
    get title() { return this.getStr('title') ?? ''; }
    set title(v) { this.setStr('title', v); }
    get note() { return this.getStr('note') ?? ''; }
    set note(v) { this.setStr('note', v); }
    get active() { return this.getBool('active'); }
    set active(v) { this.reflectBool('active', v); }
    connectedCallback() {
        this.addEventListener('click', this.#onClick, { capture: true });
        super.connectedCallback();
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.#onClick, { capture: true });
    }
    #onClick = (e) => {
        if (this.getBool('loading')) {
            e.stopImmediatePropagation();
            return;
        }
        this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true, detail: { value: this.value } }));
    };
    render() {
        const root = this.shadowRoot;
        root.innerHTML = `
      <button class="card" part="card" type="button">
        <span class="thumb" part="thumb" aria-hidden="true"></span>
        <span class="body">
          <span class="title" part="title"></span>
          <span class="note" part="note"></span>
        </span>
        <span class="chev" part="chevron" aria-hidden="true">chevron_right</span>
      </button>`;
        this.#card = root.querySelector('.card');
        this.#thumb = root.querySelector('.thumb');
        this.#title = root.querySelector('.title');
        this.#note = root.querySelector('.note');
    }
    updated() {
        const current = this.#options.find((o) => o.id === this.value);
        const image = current?.image ?? this.getStr('thumb-image') ?? '';
        const color = current?.color ?? this.getStr('thumb-color') ?? '';
        this.#thumb.style.setProperty('--ev-thumb', image ? `url("${image}")` : 'none');
        if (!image && color)
            this.#thumb.style.background = color;
        this.#title.textContent = this.title;
        const pending = this.getBool('price-pending');
        this.#note.textContent = pending ? 'Updating price…' : this.note;
        this.#note.className = 'note' +
            (pending ? ' pending' : this.note && this.note.toLowerCase() !== 'included' ? ' upgrade' : '');
        // whole card exposes its expanded (tray-open) state
        this.#card.setAttribute('aria-expanded', this.active ? 'true' : 'false');
        this.#card.setAttribute('aria-label', `${this.title}${this.note ? ', ' + this.note : ''}`);
    }
}
//# sourceMappingURL=OptionCard.js.map