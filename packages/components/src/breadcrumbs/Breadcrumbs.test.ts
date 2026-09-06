import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionBreadcrumbs } from './Breadcrumbs.js';
import type { BreadcrumbItem } from '../types.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

const TRAIL: BreadcrumbItem[] = [
  { label: 'Envision Design System', href: '/' },
  { label: 'Design Tokens', href: '/tokens' },
  { label: 'Token architecture' },
];

async function mount(items = TRAIL, attrs: Record<string, string> = {}): Promise<EnvisionBreadcrumbs> {
  const el = document.createElement('envision-breadcrumbs') as EnvisionBreadcrumbs;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  el.items = items;
  await flush();
  return el;
}

const root = (el: EnvisionBreadcrumbs) => el.shadowRoot!;
const links = (el: EnvisionBreadcrumbs) => [...root(el).querySelectorAll('a')];

describe('envision-breadcrumbs', () => {
  it('renders a labeled nav landmark containing an ordered list', async () => {
    const el = await mount();
    const nav = root(el).querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(nav.querySelector('ol')).toBeTruthy();
    expect(root(el).querySelectorAll('li')).toHaveLength(3);
  });

  it('accepts a custom landmark name, which matters when a page has several navs', async () => {
    const el = await mount(TRAIL, { label: 'You are here' });
    expect(root(el).querySelector('nav')!.getAttribute('aria-label')).toBe('You are here');
  });

  it('renders every step except the last as a real anchor with its href', async () => {
    const el = await mount();
    const a = links(el);
    expect(a).toHaveLength(2);
    expect(a.map((x) => x.getAttribute('href'))).toEqual(['/', '/tokens']);
    expect(a.map((x) => x.textContent)).toEqual(['Envision Design System', 'Design Tokens']);
  });

  it('marks the final step as the current page and does not link it', async () => {
    const el = await mount();
    const current = root(el).querySelector('[aria-current="page"]')!;
    expect(current.textContent).toBe('Token architecture');
    expect(current.tagName).toBe('SPAN');
  });

  it('renders an intermediate step without an href as text rather than a dead link', async () => {
    const el = await mount([
      { label: 'Root', href: '/' },
      { label: 'Grouping level' },
      { label: 'Here' },
    ]);
    expect(links(el)).toHaveLength(1);
    // Only the LAST item is the current page; the middle one is plain text with no aria-current.
    expect(root(el).querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  it('hides separators from assistive technology', async () => {
    const el = await mount();
    const seps = [...root(el).querySelectorAll('.sep')];
    expect(seps).toHaveLength(2); // one fewer than the number of items
    expect(seps.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('emits a composed, cancelable navigate event carrying the href and index', async () => {
    const el = await mount();
    const seen: Array<{ href: string; index: number }> = [];
    el.addEventListener('navigate', (e) => {
      const d = (e as CustomEvent<{ href: string; index: number }>).detail;
      seen.push({ href: d.href, index: d.index });
    });
    links(el)[1].click();
    await flush();
    expect(seen).toEqual([{ href: '/tokens', index: 1 }]);
  });

  it('lets a router cancel the event to take over navigation', async () => {
    const el = await mount();
    el.addEventListener('navigate', (e) => e.preventDefault());
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    links(el)[0].dispatchEvent(ev);
    await flush();
    expect(ev.defaultPrevented).toBe(true);
  });

  it('leaves the anchor alone when nobody cancels, so ordinary navigation still works', async () => {
    const el = await mount();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    links(el)[0].dispatchEvent(ev);
    await flush();
    expect(ev.defaultPrevented).toBe(false);
  });

  it('never intercepts a modifier click, so open-in-new-tab keeps working', async () => {
    const el = await mount();
    let fired = 0;
    el.addEventListener('navigate', () => fired++);
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, metaKey: true });
    links(el)[0].dispatchEvent(ev);
    await flush();
    expect(fired).toBe(0);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('re-renders when the trail changes', async () => {
    const el = await mount();
    el.items = [{ label: 'Home', href: '/' }, { label: 'Components' }];
    await flush();
    expect(root(el).querySelectorAll('li')).toHaveLength(2);
    expect(root(el).querySelector('[aria-current="page"]')!.textContent).toBe('Components');
  });

  it('renders nothing rather than throwing when given no items', async () => {
    const el = await mount([]);
    expect(root(el).querySelectorAll('li')).toHaveLength(0);
    expect(root(el).querySelector('nav')).toBeTruthy();
  });

  it('handles a single-item trail as the current page', async () => {
    const el = await mount([{ label: 'Overview' }]);
    expect(links(el)).toHaveLength(0);
    expect(root(el).querySelectorAll('.sep')).toHaveLength(0);
    expect(root(el).querySelector('[aria-current="page"]')!.textContent).toBe('Overview');
  });
});
