import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import type { MaterialOption } from '../types.js';

/**
 * Envision MaterialSwatch — `<envision-material-swatch>`. Selectable material/finish chip.
 *
 * Registry → "material-swatch":
 *   props:  option(MaterialOption, required) · selected(false) · unavailable(false) · onSelect(id)
 *   states: default · hover · selected · unavailable · loading · image-failure
 *   a11y (ACCESSIBILITY.md): role button toggle · aria-pressed · accessible name =
 *          material + finish + price · ring + check (NOT color-only).
 *
 * The fill is PRODUCT DATA (image/texture/color) set inline, never a token (SYSTEM_SPEC §4).
 * Selection is signalled by BOTH a ring (token effect) AND a check glyph, so it is not color-only.
 * `option` is an object PROPERTY (objects can't be attributes); selected/unavailable are attributes.
 */
const styles = css`
  :host { display: inline-flex; }
  .swatch {
    position: relative;
    inline-size: var(--envision-t3-material-swatch-chip-size, 3rem);
    block-size: var(--envision-t3-material-swatch-chip-size, 3rem);
    padding: 0;
    border: none;
    border-radius: var(--envision-t2-border-radius-control-sm, 4px);
    background: var(--envision-t3-material-swatch-chip-background, #edeae4) var(--ev-fill, none);
    background-size: cover;
    background-position: center;
    cursor: pointer;
    box-shadow: 0 0 0 var(--envision-t3-material-swatch-ring-hover-width, 2px) transparent;
    transition: box-shadow var(--envision-t2-motion-micro-duration, 150ms) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { .swatch { transition: none; } }
  .swatch:hover { box-shadow: 0 0 0 var(--envision-t3-material-swatch-ring-hover-width, 2px) var(--envision-t3-material-swatch-ring-hover-color, #ababa0); }
  :host([selected]) .swatch {
    box-shadow: 0 0 0 var(--envision-t3-material-swatch-ring-selected-gap-width, 2px) var(--envision-t3-material-swatch-ring-selected-gap-color, #fff),
      0 0 0 calc(var(--envision-t3-material-swatch-ring-selected-gap-width, 2px) + var(--envision-t3-material-swatch-ring-selected-width, 2px)) var(--envision-t3-material-swatch-ring-selected-color, #29594f);
  }
  .swatch:focus-visible { outline: var(--envision-t2-border-width-focus, 2px) solid var(--envision-t2-color-border-focus-default, #29594f); outline-offset: 3px; }
  .check {
    position: absolute;
    inset-block-end: -0.25rem;
    inset-inline-end: -0.25rem;
    inline-size: 1.1rem;
    block-size: 1.1rem;
    border-radius: 50%;
    background: var(--envision-t2-color-background-brand-default, #29594f);
    color: var(--envision-t2-color-content-on-brand-default, #fff);
    display: none;
    align-items: center;
    justify-content: center;
    font-family: 'Material Symbols Outlined', sans-serif;
    font-size: 0.85rem;
    font-feature-settings: 'liga';
  }
  :host([selected]) .check { display: inline-flex; }
  :host([unavailable]) .swatch { cursor: not-allowed; opacity: var(--envision-t3-material-swatch-unavailable-opacity, 0.4); }
  :host([unavailable]) .diag { position: absolute; inset: 0; }
  :host([unavailable]) .diag::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top left, transparent 47%, currentColor 47%, currentColor 53%, transparent 53%); color: var(--envision-t2-color-content-tertiary-default, #8a8a82); }
  .swatch.loading { animation: ev-shimmer 1.2s ease-in-out infinite; }
  @keyframes ev-shimmer { 50% { opacity: 0.55; } }
`;

export class EnvisionMaterialSwatch extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['selected', 'unavailable', 'name', 'finish', 'price', 'image', 'color'];

  #btn!: HTMLButtonElement;
  #check!: HTMLSpanElement;
  #option: MaterialOption | null = null;

  get option(): MaterialOption | null { return this.#option; }
  set option(v: MaterialOption | null) { this.#option = v; this.requestUpdate(); }
  get selected(): boolean { return this.getBool('selected'); }
  set selected(v: boolean) { this.reflectBool('selected', v); }
  get unavailable(): boolean { return this.getBool('unavailable'); }
  set unavailable(v: boolean) { this.reflectBool('unavailable', v); }

  #field(key: keyof MaterialOption, attr: string): string {
    return (this.#option?.[key] as string | undefined) ?? this.getStr(attr) ?? '';
  }

  connectedCallback(): void {
    this.addEventListener('click', this.#onClick, { capture: true });
    super.connectedCallback();
  }
  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick, { capture: true } as EventListenerOptions);
  }
  #onClick = (e: Event): void => {
    if (this.unavailable) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    const id = this.#option?.id ?? this.getStr('id') ?? '';
    this.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { id } }));
  };

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `<button class="swatch" part="swatch" type="button"><span class="diag" aria-hidden="true"></span><span class="check" part="check" aria-hidden="true">check</span></button>`;
    this.#btn = root.querySelector('.swatch')!;
    this.#check = root.querySelector('.check')!;
  }

  protected updated(): void {
    const name = this.#field('name', 'name');
    const finish = this.#field('finish', 'finish');
    const price = this.#field('priceLabel', 'price');
    const image = this.#field('image', 'image');
    const color = this.#field('color', 'color');

    // product-data fill (inline, not a token)
    this.#btn.style.setProperty('--ev-fill', image ? `url("${image}")` : 'none');
    if (!image && color) this.#btn.style.background = color;

    // accessible name = material + finish + price (+ availability), per ACCESSIBILITY.md
    const parts = [name, finish, price, this.unavailable ? 'unavailable' : ''].filter(Boolean);
    this.#btn.setAttribute('aria-label', parts.join(', '));
    this.#btn.setAttribute('aria-pressed', this.selected ? 'true' : 'false');
    this.#btn.disabled = this.unavailable;
    void this.#check;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-material-swatch': EnvisionMaterialSwatch;
  }
}
