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
const TONE_TO_TOKEN: Record<string, string> = {
  neutral: 'neutral',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'critical',
  brand: 'promotional',
};

const styles = css`
  :host { display: inline-flex; vertical-align: middle; }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--envision-t3-badge-medium-gap-default, 0.25rem);
    font-family: inherit;
    font-weight: var(--envision-t1-font-weight-600, 600);
    font-size: var(--envision-t3-badge-medium-font-size-default, 0.75rem);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    padding-block: var(--envision-t3-badge-medium-padding-block-default, 0.125rem);
    padding-inline: var(--envision-t3-badge-medium-padding-inline-default, 0.5rem);
    border-radius: var(--envision-t2-border-radius-pill, 999px);
    background: var(--ev-badge-bg, var(--envision-t3-badge-neutral-color-background-default, #edeae4));
    color: var(--ev-badge-fg, var(--envision-t3-badge-neutral-color-content-default, #555));
  }
  :host([shape='dot']) .badge {
    inline-size: var(--envision-t3-badge-notification-dot-size, 0.5rem);
    block-size: var(--envision-t3-badge-notification-dot-size, 0.5rem);
    padding: 0;
    border-radius: 50%;
  }
  :host([shape='dot']) .num { display: none; }
`;

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'error'] as const;
const SHAPES = ['count', 'dot'] as const;
type Tone = (typeof TONES)[number];
type Shape = (typeof SHAPES)[number];

export class EnvisionBadge extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['tone', 'shape', 'count', 'max', 'label'];

  #badge!: HTMLSpanElement;
  #num!: HTMLSpanElement;

  get tone(): Tone { return this.getEnum('tone', TONES, 'neutral'); }
  set tone(v: Tone) { this.setStr('tone', v); }
  get shape(): Shape { return this.getEnum('shape', SHAPES, 'count'); }
  set shape(v: Shape) { this.setStr('shape', v); }
  get count(): number | null { const v = this.getStr('count'); return v == null ? null : Number(v); }
  set count(v: number | null) { this.setStr('count', v == null ? null : String(v)); }
  get max(): number { const v = Number(this.getStr('max')); return Number.isFinite(v) && v > 0 ? v : 99; }
  set max(v: number) { this.setStr('max', String(v)); }
  get label(): string | null { return this.getStr('label'); }
  set label(v: string | null) { this.setStr('label', v); }

  connectedCallback(): void {
    if (!this.hasAttribute('tone')) this.setAttribute('tone', 'neutral');
    if (!this.hasAttribute('shape')) this.setAttribute('shape', 'count');
    super.connectedCallback();
  }

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = `<span class="badge" part="badge"><span class="num" part="count"></span></span>`;
    this.#badge = root.querySelector('.badge')!;
    this.#num = root.querySelector('.num')!;
  }

  protected updated(): void {
    // tone → token custom-property switch (drives .badge background/content)
    const token = TONE_TO_TOKEN[this.tone] ?? 'neutral';
    this.#badge.style.setProperty(
      '--ev-badge-bg',
      `var(--envision-t3-badge-${token}-color-background-default)`,
    );
    this.#badge.style.setProperty(
      '--ev-badge-fg',
      `var(--envision-t3-badge-${token}-color-content-default)`,
    );

    // count → clamped display ("99+")
    const display = this.#displayCount();
    this.#num.textContent = display;

    // accessible name: explicit label wins; else count phrase; dot with no label is decorative
    const name =
      this.label ??
      (this.shape === 'count' && this.count != null ? `${this.count} ${this.count === 1 ? 'item' : 'items'}` : null);
    if (name) {
      this.#badge.setAttribute('role', 'status');
      this.#badge.setAttribute('aria-label', name);
      this.#badge.removeAttribute('aria-hidden');
    } else {
      this.#badge.removeAttribute('role');
      this.#badge.removeAttribute('aria-label');
      this.#badge.setAttribute('aria-hidden', 'true');
    }
  }

  #displayCount(): string {
    if (this.shape === 'dot' || this.count == null) return '';
    return this.count > this.max ? `${this.max}+` : String(this.count);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-badge': EnvisionBadge;
  }
}
