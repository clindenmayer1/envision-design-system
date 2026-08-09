import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionSwitch } from './Switch.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}): Promise<EnvisionSwitch> {
  const el = document.createElement('envision-switch') as EnvisionSwitch;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}
const input = (el: EnvisionSwitch) => el.shadowRoot!.querySelector('input') as HTMLInputElement;

describe('envision-switch', () => {
  it('exposes role=switch on a native checkbox', async () => {
    const el = await mount({ label: 'Notifications' });
    expect(input(el).getAttribute('role')).toBe('switch');
    expect(input(el).type).toBe('checkbox');
  });

  it('reflects the on/off state', async () => {
    const el = await mount({ label: 'x', checked: '' });
    expect(input(el).checked).toBe(true);
  });

  it('toggles on Enter (contract adds Enter to native Space)', async () => {
    const el = await mount({ label: 'x' });
    let changes = 0;
    el.addEventListener('change', () => changes++);
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    expect(input(el).checked).toBe(true);
    expect(el.hasAttribute('checked')).toBe(true);
    expect(changes).toBe(1);
  });

  it('does not toggle on Enter when disabled', async () => {
    const el = await mount({ label: 'x', disabled: '' });
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    expect(input(el).checked).toBe(false);
  });
});
