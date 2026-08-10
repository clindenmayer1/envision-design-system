import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';

/**
 * Envision RightRail — `<envision-right-rail>`. The configurator side panel shell.
 *
 * Registry → "right-rail":
 *   props:  mode('customize'|'packages'=customize) · config · onChange · onApply ·
 *           selectedPackageId · loading(false)
 *   a11y (ACCESSIBILITY.md): role=complementary on desktop; role=dialog aria-modal on the mobile
 *          sheet, with focus TRAPPED, Esc to close, and focus returned on close.
 *   responsive (SYSTEM_SPEC §6): desktop rail → mobile sheet is a RE-COMPOSITION, same API.
 *
 * AUDIT FIX: the app's RightRail never becomes the promised mobile sheet and has no focus
 * management. Here the sheet is a real modal dialog: focus moves in on open, Tab is trapped across
 * the header tabs → slotted body → footer apply, Esc emits `close`, and focus is returned to the
 * opener. Body content is SLOTTED, so the rail is a reusable shell, not coupled to the kitchen
 * domain (another audit fix). Presentation is auto (matchMedia ≤1024px) or forced via `sheet`.
 */
const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    inline-size: var(--envision-t3-right-rail-default-width);
    max-block-size: 100%;
    background: var(--envision-t3-right-rail-default-color-background);
    border-inline-start: 1px solid var(--envision-t3-right-rail-default-color-border);
  }
  .header { flex: none; padding: var(--envision-t2-spacing-container-padding); border-block-end: 1px solid var(--envision-t2-color-border-subtle-default); }
  .title { margin: 0 0 0.5rem; font-family: inherit; font-size: var(--envision-t1-font-size-18); font-weight: var(--envision-t1-font-weight-600); color: var(--envision-t2-color-content-primary-default); }
  .tabs { display: flex; gap: 0.5rem; }
  .body { flex: 1; overflow-y: auto; padding: var(--envision-t2-spacing-container-padding); display: flex; flex-direction: column; gap: var(--envision-t2-spacing-container-gap); }
  .footer { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: var(--envision-t2-spacing-container-padding); border-block-start: 1px solid var(--envision-t2-color-border-subtle-default); }
  .total { font-variant-numeric: tabular-nums; color: var(--envision-t2-color-content-primary-default); }
  :host([loading]) .body { opacity: 0.6; }

  /* Sheet (mobile) presentation: a modal dialog with a backdrop. */
  :host([data-sheet]) { position: fixed; inset-block: 0; inset-inline-end: 0; inline-size: min(92vw, 420px); z-index: 40; /* elevation has no token (see PackageCard) */ box-shadow: -8px 0 24px rgba(34,32,28,0.24); transform: translateX(100%); transition: transform var(--envision-t2-motion-panel-duration) cubic-bezier(0.2,0.8,0.2,1); }
  :host([data-sheet][open]) { transform: translateX(0); }
  @media (prefers-reduced-motion: reduce) { :host([data-sheet]) { transition: none; } }
  .backdrop { display: none; position: fixed; inset: 0; background: var(--envision-t2-color-background-overlay-default); z-index: 39; }
  :host([data-sheet][open]) .backdrop { display: block; }
`;

const MODES = ['customize', 'packages'] as const;
type Mode = (typeof MODES)[number];
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"]),envision-button,envision-icon-button,envision-input,envision-checkbox,envision-switch,envision-radio,envision-material-swatch,envision-option-card,envision-package-card';

export class EnvisionRightRail extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['mode', 'loading', 'sheet', 'open', 'heading'];

  #section!: HTMLElement;
  #title!: HTMLHeadingElement;
  #tabCustomize!: HTMLElement;
  #tabPackages!: HTMLElement;
  #body!: HTMLElement;
  #apply!: HTMLElement;
  #mql: MediaQueryList | null = null;
  #returnFocusTo: HTMLElement | null = null;

  get mode(): Mode { return this.getEnum('mode', MODES, 'customize'); }
  set mode(v: Mode) { this.setStr('mode', v); }
  get loading(): boolean { return this.getBool('loading'); }
  set loading(v: boolean) { this.reflectBool('loading', v); }
  get open(): boolean { return this.getBool('open'); }
  set open(v: boolean) { this.reflectBool('open', v); }
  /** Force sheet presentation; otherwise auto below 1024px. */
  get sheet(): boolean { return this.getBool('sheet'); }
  set sheet(v: boolean) { this.reflectBool('sheet', v); }

  connectedCallback(): void {
    if (!this.hasAttribute('mode')) this.setAttribute('mode', 'customize');
    if (typeof matchMedia === 'function') {
      this.#mql = matchMedia('(max-width: 1024px)');
      this.#mql.addEventListener?.('change', this.#syncPresentation);
    }
    this.addEventListener('keydown', this.#onKeydown);
    super.connectedCallback();
    this.#syncPresentation();
  }
  disconnectedCallback(): void {
    this.#mql?.removeEventListener?.('change', this.#syncPresentation);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `
      <div class="backdrop" part="backdrop"></div>
      <section class="rail" part="rail">
        <div class="header" part="header">
          <h2 class="title" part="title"></h2>
          <div class="tabs" role="tablist" part="tabs">
            <!-- No aria-controls: the tabs live in their own shadow roots, so an IDREF to the body
                 panel (a different shadow scope) is invalid. role=tab + aria-selected carry the
                 semantics; the body is a labelled region that swaps content by mode. -->
            <envision-tab class="t-customize" label="Customize"></envision-tab>
            <envision-tab class="t-packages" label="Packages"></envision-tab>
          </div>
        </div>
        <div class="body" part="body" id="ev-rr-body" role="region" aria-label="Selections"><slot></slot></div>
        <div class="footer" part="footer">
          <span class="total" part="total"><slot name="total"></slot></span>
          <envision-button class="apply" variant="primary" label="Apply"></envision-button>
        </div>
      </section>`;
    this.#section = root.querySelector('.rail')!;
    this.#title = root.querySelector('.title')!;
    this.#tabCustomize = root.querySelector('.t-customize')!;
    this.#tabPackages = root.querySelector('.t-packages')!;
    this.#body = root.querySelector('.body')!;
    this.#apply = root.querySelector('.apply')!;

    root.querySelector('.backdrop')!.addEventListener('click', () => this.#requestClose());
    this.#tabCustomize.addEventListener('select', () => this.#setMode('customize'));
    this.#tabPackages.addEventListener('select', () => this.#setMode('packages'));
    this.#apply.addEventListener('click', () => this.dispatchEvent(new CustomEvent('apply', { bubbles: true, composed: true })));
  }

  #setMode(mode: Mode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.dispatchEvent(new CustomEvent('modechange', { bubbles: true, composed: true, detail: { mode } }));
  }

  #syncPresentation = (): void => {
    const isSheet = this.sheet || (this.#mql?.matches ?? false);
    if (isSheet) this.setAttribute('data-sheet', '');
    else { this.removeAttribute('data-sheet'); this.removeAttribute('aria-modal'); }
    this.#applyRoleAndModal(isSheet);
  };

  #applyRoleAndModal(isSheet: boolean): void {
    if (isSheet && this.open) {
      this.#section.setAttribute('role', 'dialog');
      this.#section.setAttribute('aria-modal', 'true');
    } else if (isSheet) {
      this.#section.setAttribute('role', 'dialog');
      this.#section.removeAttribute('aria-modal');
    } else {
      this.#section.setAttribute('role', 'complementary');
      this.#section.removeAttribute('aria-modal');
    }
    this.#section.setAttribute('aria-label', this.getStr('heading') || 'Configurator');
  }

  #onKeydown = (e: KeyboardEvent): void => {
    const isSheet = this.hasAttribute('data-sheet') && this.open;
    if (!isSheet) return;
    if (e.key === 'Escape') { e.preventDefault(); this.#requestClose(); return; }
    if (e.key === 'Tab') this.#trapTab(e);
  };

  /** Focus order across the shadow header/footer and the slotted body. */
  #focusables(): HTMLElement[] {
    const tabs = Array.from(this.shadowRoot!.querySelectorAll<HTMLElement>('envision-tab'));
    const slotted = Array.from(this.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.hasAttribute('disabled'),
    );
    return [...tabs, ...slotted, this.#apply];
  }

  #trapTab(e: KeyboardEvent): void {
    const items = this.#focusables();
    if (items.length === 0) return;
    const active = (this.shadowRoot!.activeElement as HTMLElement) ?? (document.activeElement as HTMLElement);
    const idx = items.indexOf(active);
    let next: number;
    if (e.shiftKey) next = idx <= 0 ? items.length - 1 : idx - 1;
    else next = idx === items.length - 1 ? 0 : idx + 1;
    e.preventDefault();
    items[next]?.focus();
  }

  #requestClose(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    this.#returnFocusTo?.focus();
    this.#returnFocusTo = null;
  }

  protected updated(): void {
    this.#title.textContent = this.getStr('heading') ?? '';
    this.#tabCustomize.toggleAttribute('selected', this.mode === 'customize');
    this.#tabPackages.toggleAttribute('selected', this.mode === 'packages');
    this.#body.setAttribute('aria-busy', this.loading ? 'true' : 'false');
    this.#syncPresentation();

    // On open as a sheet, remember the opener and move focus in (trap begins).
    if (this.hasAttribute('data-sheet') && this.open) {
      if (!this.#returnFocusTo) this.#returnFocusTo = document.activeElement as HTMLElement;
      const first = this.#focusables()[0];
      if (first && this.shadowRoot!.activeElement !== first) queueMicrotask(() => first.focus());
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-right-rail': EnvisionRightRail;
  }
}
