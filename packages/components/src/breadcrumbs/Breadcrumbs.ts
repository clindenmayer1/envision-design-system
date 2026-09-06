import { EnvisionElement } from '../base/element.js';
import { css } from '../base/css.js';
import type { BreadcrumbItem } from '../types.js';

/**
 * Envision Breadcrumbs, `<envision-breadcrumbs>`.
 *
 * Registry contract → "breadcrumbs":
 *   props:  items(required, JS property) · label('Breadcrumb')
 *   events: navigate (composed, cancelable) — detail { href, index, item }
 *   semantics: <nav aria-label> > <ol> > <li>. Links are real <a href>; the final item is
 *              plain text carrying aria-current="page".
 *
 * Two decisions worth knowing:
 *
 * 1. `items` is a JS PROPERTY, not an attribute, because it carries objects. Setting it as an
 *    attribute would stringify to "[object Object]" — the same rule MaterialSwatch follows.
 *
 * 2. It renders real anchors, so right-click, middle-click and open-in-new-tab all work. A
 *    single-page app would normally lose that by rendering router links instead, so the
 *    component emits a cancelable `navigate` event first: a router-aware consumer calls
 *    preventDefault() and routes client-side, and everyone else gets ordinary navigation.
 *    Modifier-clicks are never intercepted, so cmd/ctrl-click always opens a new tab.
 *
 * The trail wraps rather than truncating. A breadcrumb exists to say where you are, and an
 * ellipsis in the middle of that removes the part people actually read.
 */
const styles = css`
  :host {
    display: block;
    font-size: var(--envision-t1-font-size-13);
    color: var(--envision-t2-color-content-secondary-default);
  }
  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--envision-t1-spacing-100);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: var(--envision-t1-spacing-100);
    min-width: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
    border-radius: var(--envision-t2-border-radius-control-xs);
  }
  a:hover {
    color: var(--envision-t2-color-content-primary-default);
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  a:focus-visible {
    outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default);
    outline-offset: 2px;
  }
  /* The current page is the one thing in the trail that is not a destination, so it is the
     only item that does not read as interactive. */
  .current {
    color: var(--envision-t2-color-content-primary-default);
  }
  .sep {
    color: var(--envision-t2-color-content-tertiary-default);
    user-select: none;
  }
`;

export class EnvisionBreadcrumbs extends EnvisionElement {
  static styles = styles;
  static observedAttributes = ['label'];

  #nav!: HTMLElement;
  #list!: HTMLOListElement;
  #items: BreadcrumbItem[] = [];

  /** The trail, root first. The last entry is treated as the current page. */
  get items(): BreadcrumbItem[] { return this.#items; }
  set items(v: BreadcrumbItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    if (this.hasRendered) this.performUpdate();
  }

  /** Accessible name for the landmark. Distinct names matter when a page has several navs. */
  get label(): string { return this.getStr('label') ?? 'Breadcrumb'; }
  set label(v: string) { this.setStr('label', v); }

  protected render(): void {
    const root = this.shadowRoot!;
    root.innerHTML = '<nav part="nav"><ol part="list"></ol></nav>';
    this.#nav = root.querySelector('nav')!;
    this.#list = root.querySelector('ol')!;
    this.#list.addEventListener('click', this.#onClick);
  }

  #onClick = (e: MouseEvent): void => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    // Never intercept a modifier click: those mean "open elsewhere", and hijacking them is
    // the most common way a design-system link breaks a browser expectation.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const index = Number(a.dataset.index);
    const item = this.#items[index];
    if (!item) return;

    const detail = { href: item.href ?? '', index, item };
    const evt = new CustomEvent('navigate', { detail, bubbles: true, composed: true, cancelable: true });
    const proceed = this.dispatchEvent(evt);
    // A consumer that handled routing itself cancels the event; we then stop the anchor from
    // navigating. Uncanceled, the anchor behaves exactly as an anchor should.
    if (!proceed) e.preventDefault();
  };

  protected updated(): void {
    this.#nav.setAttribute('aria-label', this.label);

    // Rebuilt wholesale: a breadcrumb has no focusable state worth preserving between trails,
    // and the trail changes only on navigation.
    this.#list.replaceChildren();

    this.#items.forEach((item, i) => {
      const last = i === this.#items.length - 1;
      const li = document.createElement('li');

      if (last || !item.href) {
        const span = document.createElement('span');
        span.textContent = item.label;
        if (last) {
          span.className = 'current';
          span.setAttribute('aria-current', 'page');
        }
        li.append(span);
      } else {
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.dataset.index = String(i);
        a.textContent = item.label;
        li.append(a);
      }

      if (!last) {
        const sep = document.createElement('span');
        sep.className = 'sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '/';
        li.append(sep);
      }

      this.#list.append(li);
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'envision-breadcrumbs': EnvisionBreadcrumbs;
  }
}
