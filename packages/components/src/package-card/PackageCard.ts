import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import type { KitchenPackage } from '../types.js';

/**
 * Envision PackageCard — `<envision-package-card>`. Curated design package card.
 *
 * Registry → "package-card":
 *   props:  pkg(KitchenPackage, required) · selected(false) · onSelect(id) · onCustomize(id)
 *   states: default · selected · popular · image-loading(shimmer) · image-ready · image-error ·
 *           long-name · max-materials
 *   a11y (ACCESSIBILITY.md): select button + nested Customize control — the valid nested pattern.
 *
 * AUDIT FIX: the app's PackageCard is a `<section role="button" tabindex=0>` (div-as-button). Here
 * the primary select target is a REAL <button> covering media+name+price, and Customize is a
 * SEPARATE sibling <button> (no invalid button-in-button, no stopPropagation hack needed). The card
 * carries the full image lifecycle: shimmer while loading, graceful fallback on error.
 */
const styles = css`
  :host { display: block; }
  .card {
    display: flex;
    flex-direction: column;
    border-radius: var(--envision-t3-package-card-default-radius);
    background: var(--envision-t2-color-background-surface-default);
    border: 1px solid transparent;
    overflow: hidden;
    /* elevation has no token: Figma defines it as effect styles, which the variable export cannot see */ box-shadow: 0 1px 3px rgba(34, 32, 28, 0.08);
  }
  :host([selected]) .card { border-color: var(--envision-t3-package-card-selected-color-border); box-shadow: 0 0 0 2px var(--envision-t3-package-card-selected-color-border); }
  .select {
    appearance: none; border: none; background: transparent; text-align: start; cursor: pointer; padding: 0;
    display: flex; flex-direction: column; gap: var(--envision-t3-package-card-header-gap);
  }
  .select:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: -2px; }
  .media {
    position: relative; aspect-ratio: var(--envision-t3-package-card-default-image-ratio);
    background: var(--envision-t3-package-card-media-color-background);
    background-size: cover; background-position: center;
  }
  .media.loading::after { content: ''; position: absolute; inset: 0; animation: ev-shimmer 1.2s ease-in-out infinite; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); }
  @keyframes ev-shimmer { 100% { transform: translateX(0); } 50% { opacity: 0.5; } }
  .media.error { display: flex; align-items: center; justify-content: center; color: var(--envision-t2-color-content-tertiary-default); font-family: 'Material Symbols Outlined', sans-serif; font-size: 2rem; font-feature-settings: 'liga'; }
  .popular { position: absolute; inset-block-start: 0.5rem; inset-inline-start: 0.5rem; }
  .info { padding: var(--envision-t3-package-card-content-gap); display: flex; flex-direction: column; gap: 0.25rem; }
  /* Website package title = 19 (off-scale) -> nearest 18; bold. Price = 13. */
  .name { font-family: inherit; font-size: var(--envision-t1-font-size-18); font-weight: var(--envision-t1-font-weight-700); color: var(--envision-t2-color-content-primary-default); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .price { font-size: var(--envision-t1-font-size-13); color: var(--envision-t2-color-content-secondary-default); font-variant-numeric: tabular-nums; }
  .footer { display: flex; align-items: center; justify-content: space-between; gap: var(--envision-t3-package-card-footer-gap); padding: 0 var(--envision-t3-package-card-content-gap) var(--envision-t3-package-card-content-gap); }
  /* Customize = neutral secondary button (hairline border + dark text + surface fill), matching
     the web's Customize pill — NOT the brand-green t3.button.outline tokens (see AUDIT.md §B). */
  /* Customize = website secondary pill: hairline border, radius 8 (container-sm), 13/600 text. */
  .customize { appearance: none; border: 1px solid var(--envision-t2-color-border-default-default); background: var(--envision-t2-color-background-surface-default); color: var(--envision-t2-color-content-primary-default); border-radius: var(--envision-t2-border-radius-container-sm); padding: 0.375rem 0.75rem; font-family: inherit; font-size: var(--envision-t1-font-size-13); font-weight: var(--envision-t1-font-weight-600); cursor: pointer; }
  .customize:hover { border-color: var(--envision-t2-color-border-strong-default); background: var(--envision-t2-color-background-surface-warm-default); }
  .customize:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 2px; }
  .mats { display: inline-flex; gap: 0.25rem; }
  .mat { inline-size: 1rem; block-size: 1rem; border-radius: 50%; border: 1px solid var(--envision-t2-color-border-subtle-default); }
`;

export class EnvisionPackageCard extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['selected', 'name', 'image', 'price', 'popular'];

  #select!: HTMLButtonElement;
  #media!: HTMLSpanElement;
  #name!: HTMLSpanElement;
  #price!: HTMLSpanElement;
  #popularWrap!: HTMLSpanElement;
  #customize!: HTMLButtonElement;
  #mats!: HTMLSpanElement;
  #pkg: KitchenPackage | null = null;

  get pkg(): KitchenPackage | null { return this.#pkg; }
  set pkg(v: KitchenPackage | null) { this.#pkg = v; this.requestUpdate(); }
  get selected(): boolean { return this.getBool('selected'); }
  set selected(v: boolean) { this.reflectBool('selected', v); }

  #id(): string { return this.#pkg?.id ?? this.getStr('id') ?? ''; }

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `
      <article class="card" part="card">
        <button class="select" part="select" type="button">
          <span class="media" part="media"><span class="popular" part="popular" hidden></span></span>
          <span class="info">
            <span class="name" part="name"></span>
            <span class="price" part="price"></span>
          </span>
        </button>
        <div class="footer">
          <span class="mats" part="materials" aria-hidden="true"></span>
          <button class="customize" part="customize" type="button">Customize</button>
        </div>
      </article>`;
    this.#select = root.querySelector('.select')!;
    this.#media = root.querySelector('.media')!;
    this.#name = root.querySelector('.name')!;
    this.#price = root.querySelector('.price')!;
    this.#popularWrap = root.querySelector('.popular')!;
    this.#customize = root.querySelector('.customize')!;
    this.#mats = root.querySelector('.mats')!;
    this.#select.addEventListener('click', () => this.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { id: this.#id() } })));
    this.#customize.addEventListener('click', () => this.dispatchEvent(new CustomEvent('customize', { bubbles: true, composed: true, detail: { id: this.#id() } })));
  }

  protected updated(): void {
    const name = this.#pkg?.name ?? this.getStr('name') ?? '';
    const price = this.#pkg?.priceLabel ?? this.getStr('price') ?? '';
    const image = this.#pkg?.image ?? this.getStr('image') ?? '';
    const popular = this.#pkg?.popular ?? this.getBool('popular');

    this.#name.textContent = name;
    this.#price.textContent = price;
    this.#select.setAttribute('aria-pressed', this.selected ? 'true' : 'false');
    this.#select.setAttribute('aria-label', `Select ${name}${popular ? ', popular' : ''}${price ? ', ' + price : ''}`);
    this.#customize.setAttribute('aria-label', `Customize ${name}`);
    this.#popularWrap.hidden = !popular;
    if (popular && !this.#popularWrap.firstChild) {
      this.#popularWrap.innerHTML = `<envision-badge tone="brand" label="Popular"><span slot="label">Popular</span></envision-badge>`;
    }

    this.#loadImage(image);
    this.#renderMats();
  }

  #loadImage(src: string): void {
    this.#media.classList.remove('error');
    if (!src) { this.#media.classList.remove('loading'); this.#media.style.backgroundImage = 'none'; return; }
    this.#media.classList.add('loading');
    const img = new Image();
    img.onload = () => { this.#media.classList.remove('loading', 'error'); this.#media.style.backgroundImage = `url("${src}")`; };
    img.onerror = () => { this.#media.classList.remove('loading'); this.#media.classList.add('error'); this.#media.textContent = 'broken_image'; };
    img.src = src;
  }

  #renderMats(): void {
    const mats = (this.#pkg?.materials ?? []).slice(0, 5); // cap preview (max-materials state)
    this.#mats.innerHTML = mats
      .map((m) => `<span class="mat" style="background:${m.color ?? '#ccc'}"></span>`)
      .join('');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-package-card': EnvisionPackageCard;
  }
}
