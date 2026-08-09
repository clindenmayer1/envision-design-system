import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionLink } from './Link.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}): Promise<EnvisionLink> {
  const el = document.createElement('envision-link') as EnvisionLink;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}
const anchor = (el: EnvisionLink) => el.shadowRoot!.querySelector('a') as HTMLAnchorElement;

describe('envision-link', () => {
  it('renders a real <a href> with the label', async () => {
    const el = await mount({ href: '/plans', label: 'View plans' });
    expect(anchor(el).getAttribute('href')).toBe('/plans');
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toBe('View plans');
  });

  it('drops href, aria-disables, and removes from tab order when disabled; blocks activation', async () => {
    const el = await mount({ href: '/x', label: 'Nope', disabled: '' });
    expect(anchor(el).hasAttribute('href')).toBe(false);
    expect(anchor(el).getAttribute('aria-disabled')).toBe('true');
    expect(anchor(el).tabIndex).toBe(-1);
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    await flush();
    expect(clicks).toBe(0);
  });

  it('reveals the direction icon only when requested', async () => {
    const el = await mount({ href: '/x', label: 'Go', 'direction-icon': '' });
    expect((el.shadowRoot!.querySelector('.arrow') as HTMLElement).hidden).toBe(false);
    const plain = await mount({ href: '/x', label: 'Go' });
    expect((plain.shadowRoot!.querySelector('.arrow') as HTMLElement).hidden).toBe(true);
  });
});
