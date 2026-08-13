/**
 * Envision Label, `<envision-label>`. Reusable field/control label.
 *
 * Registry contract → "label":
 *   props: text(required) · required(false) · helpIcon(false) · htmlFor(required)
 *   a11y:  required asterisk is rendered BEFORE the text and is aria-hidden; the ASSOCIATED
 *          control must also carry aria-required. Association is via <label for={htmlFor}>.
 *
 * DELIBERATE ARCHITECTURE EXCEPTION: this element renders into the LIGHT DOM (no Shadow DOM).
 * A `<label for="…">` inside a shadow root cannot associate with a control in the document's
 * light DOM, `for`/`id` matching is scoped to a single tree. Form-label association therefore
 * requires light DOM. The self-labelling form controls (Input/Checkbox/Radio/Switch) instead
 * keep their <label> and <input> together inside one shadow root, so they don't need this.
 * Documented in the component doc + Component Architecture Document.
 */
const STYLE_ID = 'envision-label-styles';
function ensureStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    envision-label { display: inline-block; }
    envision-label .envision-label__text {
      font-family: inherit;
      font-size: var(--envision-t1-font-size-14);
      color: var(--envision-t2-color-content-primary-default);
      display: inline-flex;
      align-items: center;
      gap: var(--envision-t2-spacing-control-gap-tight);
    }
    envision-label .envision-label__req {
      color: var(--envision-t2-color-content-error-default);
    }
    envision-label .envision-label__help {
      font-family: 'Material Symbols Outlined', sans-serif;
      font-size: 1em;
      line-height: 1;
      color: var(--envision-t2-color-content-tertiary-default);
      font-feature-settings: 'liga';
    }
  `;
  document.head.appendChild(style);
}

export class EnvisionLabel extends HTMLElement {
  static observedAttributes = ['text', 'required', 'help-icon', 'html-for'];

  get text(): string { return this.getAttribute('text') ?? ''; }
  set text(v: string) { this.setAttribute('text', v); }
  get required(): boolean { return this.hasAttribute('required'); }
  set required(v: boolean) { this.toggleAttribute('required', v); }
  get helpIcon(): boolean { return this.hasAttribute('help-icon'); }
  set helpIcon(v: boolean) { this.toggleAttribute('help-icon', v); }
  get htmlFor(): string { return this.getAttribute('html-for') ?? ''; }
  set htmlFor(v: string) { this.setAttribute('html-for', v); }

  connectedCallback(): void {
    ensureStyles();
    this.#render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.#render();
  }

  #render(): void {
    const asterisk = this.required
      ? `<span class="envision-label__req" aria-hidden="true">*</span>`
      : '';
    const help = this.helpIcon
      ? `<span class="envision-label__help" aria-hidden="true">help</span>`
      : '';
    // <label for> in light DOM associates document-wide.
    this.innerHTML = `<label for="${escapeAttr(this.htmlFor)}" class="envision-label__text">${asterisk}<span class="envision-label__label"></span>${help}</label>`;
    (this.querySelector('.envision-label__label') as HTMLElement).textContent = this.text;
  }
}

function escapeAttr(v: string): string {
  return v.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-label': EnvisionLabel;
  }
}
