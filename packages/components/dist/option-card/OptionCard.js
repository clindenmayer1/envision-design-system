import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { ICON } from '../base/icons.js';
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
    gap: var(--envision-t3-option-card-text-gap);
    text-align: start;
    /* Figma Card / Option binds all four paddings to spacing/inset-control (12). This previously
       read var(--envision-t1-spacing-12), which does not exist — the card lost its padding. */
    padding: var(--envision-t2-spacing-inset-control);
    border: none;
    border-radius: var(--envision-t2-border-radius-control);
    background: var(--envision-t2-color-background-surface-warm-default);
    cursor: pointer;
    box-shadow: 0 0 0 1px var(--envision-t3-option-card-ring-rest);
    transition: box-shadow var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { .card { transition: none; } }
  .card:hover { box-shadow: 0 0 0 1px var(--envision-t3-option-card-ring-hover); }
  .card:active { box-shadow: 0 0 0 2px var(--envision-t3-option-card-ring-pressed); }
  :host([active]) .card { box-shadow: 0 0 0 2px var(--envision-t3-option-card-ring-selected); }
  .card:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 2px; }
  /* Website thumb = 72px, radius 4 (control-sm). */
  /* Product media (a live 3D preview) is slotted; the component still owns the frame. */
  .thumb ::slotted(*) { inline-size: 100%; block-size: 100%; display: block; }
  :host([thumb-shape='portrait']) .thumb { aspect-ratio: 4 / 5; block-size: auto; }
  .thumb { inline-size: 72px; block-size: 72px; flex: none; border-radius: var(--envision-t2-border-radius-control-sm); background: var(--envision-t2-color-background-surface-sunken-default) var(--ev-thumb, none); background-size: cover; background-position: center; }
  .body { flex: 1; min-inline-size: 0; display: flex; flex-direction: column; gap: 0.125rem; }
  /* Website title = 14 / 600 / 1.2; note = 13 / 500 / 1.6. */
  .title { font-family: inherit; font-size: var(--envision-t1-font-size-14); font-weight: var(--envision-t1-font-weight-600); line-height: var(--envision-t1-line-height-120); color: var(--envision-t2-color-content-primary-default); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .note { font-size: var(--envision-t1-font-size-13); font-weight: var(--envision-t1-font-weight-500); line-height: var(--envision-t1-line-height-160); color: var(--envision-t2-color-content-secondary-default); }
  .note.upgrade { color: var(--envision-t2-color-content-brand-default); font-weight: var(--envision-t1-font-weight-600); }
  .note.pending { color: var(--envision-t2-color-content-secondary-default); font-style: italic; }
  .chev { inline-size: 1.25rem; block-size: 1.25rem; flex: none; font-size: var(--envision-t1-font-size-20); color: var(--envision-t2-color-content-tertiary-default); font-feature-settings: 'liga'; }
  :host([loading]) .card { opacity: 0.6; pointer-events: none; }
`;
export class EnvisionOptionCard extends EnvisionElement {
    static styles = styles;
    static observedAttributes = ['title', 'note', 'active', 'loading', 'price-pending', 'thumb-image', 'thumb-color', 'thumb-shape'];
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
        <span class="thumb" part="thumb" aria-hidden="true"><slot name="media"></slot></span>
        <span class="body">
          <span class="title" part="title"></span>
          <span class="note" part="note"></span>
        </span>
        <span class="chev" part="chevron" aria-hidden="true">${ICON.chevronRight}</span>
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