import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionBadge } from './Badge.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}): Promise<EnvisionBadge> {
  const el = document.createElement('envision-badge') as EnvisionBadge;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}
const badge = (el: EnvisionBadge) => el.shadowRoot!.querySelector('.badge') as HTMLElement;

describe('envision-badge', () => {
  it('shows the count for shape=count', async () => {
    const el = await mount({ count: '3' });
    expect(el.shadowRoot!.querySelector('.num')!.textContent).toBe('3');
  });

  it('clamps to max as "N+" (content extreme)', async () => {
    const el = await mount({ count: '250', max: '99' });
    expect(el.shadowRoot!.querySelector('.num')!.textContent).toBe('99+');
  });

  it('maps registry tones to emitted tokens (error→critical, brand→promotional)', async () => {
    const err = await mount({ tone: 'error', count: '1' });
    expect(badge(err).style.getPropertyValue('--ev-badge-bg')).toContain('badge-critical-color-background');
    const brand = await mount({ tone: 'brand', count: '1' });
    expect(badge(brand).style.getPropertyValue('--ev-badge-bg')).toContain('badge-promotional-color-background');
  });

  it('exposes an accessible name for counts and stays decorative for a bare dot', async () => {
    const counted = await mount({ count: '5' });
    expect(badge(counted).getAttribute('role')).toBe('status');
    expect(badge(counted).getAttribute('aria-label')).toBe('5 items');
    const dot = await mount({ shape: 'dot' });
    expect(badge(dot).getAttribute('aria-hidden')).toBe('true');
    const labelledDot = await mount({ shape: 'dot', label: 'Unread' });
    expect(labelledDot.shadowRoot!.querySelector('.badge')!.getAttribute('aria-label')).toBe('Unread');
  });
});
