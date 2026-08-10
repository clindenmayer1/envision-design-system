import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import { ICON } from '../base/icons.js';
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
:host { display: inline-flex; flex-direction: column; align-items: center; gap: var(--envision-t3-material-swatch-label-gap); }
  /* Fluid: the swatch fills its grid cell instead of the fixed chip size (Envision rail + trays). */
  :host([fluid]) { inline-size: 100%; min-inline-size: 0; }
  :host([fluid]) .swatch { inline-size: 100%; block-size: auto; aspect-ratio: 1 / 1; }
  /* Rendered spherical materials (metal finishes) present as a circle. */
  :host([shape='circle']) .swatch { border-radius: 50%; background-size: contain; background-repeat: no-repeat; }
  /* Some surfaces show selection as the ring alone, with no check. */
  :host([hide-check]) .check { padding: 0.15rem; display: none !important; }
  .label { inline-size: 100%; text-align: center; font-size: var(--envision-t1-font-size-11); color: var(--envision-t2-color-content-secondary-default); }
  .label:empty { display: none; }
  .swatch {
    position: relative;
    inline-size: var(--envision-t3-material-swatch-chip-size);
    block-size: var(--envision-t3-material-swatch-chip-size);
    padding: 0;
    border: none;
    border-radius: var(--envision-t2-border-radius-control-sm);
    background: var(--envision-t3-material-swatch-chip-background) var(--ev-fill, none);
    background-size: cover;
    background-position: center;
    cursor: pointer;
    box-shadow: 0 0 0 var(--envision-t3-material-swatch-ring-hover-width) transparent;
    transition: box-shadow var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) { .swatch { transition: none; } }
  .swatch:hover { box-shadow: 0 0 0 var(--envision-t3-material-swatch-ring-hover-width) var(--envision-t3-material-swatch-ring-hover-color); }
  :host([selected]) .swatch {
    box-shadow: 0 0 0 var(--envision-t3-material-swatch-ring-selected-gap-width) var(--envision-t3-material-swatch-ring-selected-gap-color),
      0 0 0 calc(var(--envision-t3-material-swatch-ring-selected-gap-width) + var(--envision-t3-material-swatch-ring-selected-width)) var(--envision-t3-material-swatch-ring-selected-color);
  }
  .swatch:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 3px; }
  .check {
    position: absolute;
    inset-block-end: -0.25rem;
    inset-inline-end: -0.25rem;
    inline-size: 1.1rem;
    block-size: 1.1rem;
    border-radius: 50%;
    background: var(--envision-t2-color-background-brand-default);
    color: var(--envision-t2-color-content-on-brand-default);
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-feature-settings: 'liga';
  }
  :host([selected]) .check { display: inline-flex; }
  :host([unavailable]) .swatch { cursor: not-allowed; opacity: var(--envision-t3-material-swatch-unavailable-opacity); }
  :host([unavailable]) .diag { position: absolute; inset: 0; }
  :host([unavailable]) .diag::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top left, transparent 47%, currentColor 47%, currentColor 53%, transparent 53%); color: var(--envision-t2-color-content-tertiary-default); }
  .swatch.loading { animation: ev-shimmer 1.2s ease-in-out infinite; }
  @keyframes ev-shimmer { 50% { opacity: 0.55; } }
`;

export class EnvisionMaterialSwatch extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['selected', 'unavailable', 'name', 'finish', 'price', 'image', 'color', 'fluid', 'shape', 'hide-check', 'label'];

  #btn!: HTMLButtonElement;
  #check!: HTMLSpanElement;
  #label!: HTMLSpanElement;
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
    root.innerHTML = `<button class="swatch" part="swatch" type="button"><span class="diag" aria-hidden="true"></span><span class="check" part="check" aria-hidden="true">${ICON.check}</span></button><span class="label" part="label"></span>`;
    this.#label = root.querySelector('.label')!;
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
    // optional caption; the swatch keeps its own accessible name regardless
    this.#label.textContent = this.getStr('label') ?? '';
    void this.#check;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-material-swatch': EnvisionMaterialSwatch;
  }
}
