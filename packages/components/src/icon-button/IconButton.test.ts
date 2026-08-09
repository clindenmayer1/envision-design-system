import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionIconButton } from './IconButton.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}): Promise<EnvisionIconButton> {
  const el = document.createElement('envision-icon-button') as EnvisionIconButton;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}
const inner = (el: EnvisionIconButton) => el.shadowRoot!.querySelector('button') as HTMLButtonElement;

describe('envision-icon-button', () => {
  it('requires and applies an accessible name (icon-only has no visible text)', async () => {
    const el = await mount({ icon: 'close', 'accessible-name': 'Close panel' });
    expect(inner(el).getAttribute('aria-label')).toBe('Close panel');
    expect(el.shadowRoot!.querySelector('.icon')!.textContent).toBe('close');
    expect(el.shadowRoot!.querySelector('.icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes aria-pressed only when acting as a toggle (selected present)', async () => {
    const plain = await mount({ icon: 'add', 'accessible-name': 'Add' });
    expect(inner(plain).hasAttribute('aria-pressed')).toBe(false);
    const toggle = await mount({ icon: 'bookmark', 'accessible-name': 'Save', selected: '' });
    expect(inner(toggle).getAttribute('aria-pressed')).toBe('true');
  });

  it('blocks activation when disabled', async () => {
    const el = await mount({ icon: 'delete', 'accessible-name': 'Delete', disabled: '' });
    expect(inner(el).disabled).toBe(true);
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    await flush();
    expect(clicks).toBe(0);
  });

  it('sets a title when a tooltip is provided', async () => {
    const el = await mount({ icon: 'info', 'accessible-name': 'Info', tooltip: 'More info' });
    expect(inner(el).getAttribute('title')).toBe('More info');
  });
});
