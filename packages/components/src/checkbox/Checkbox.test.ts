import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionCheckbox } from './Checkbox.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}): Promise<EnvisionCheckbox> {
  const el = document.createElement('envision-checkbox') as EnvisionCheckbox;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}
const input = (el: EnvisionCheckbox) => el.shadowRoot!.querySelector('input') as HTMLInputElement;

describe('envision-checkbox', () => {
  it('renders a native <input type=checkbox> with the label', async () => {
    const el = await mount({ label: 'I agree' });
    expect(input(el).type).toBe('checkbox');
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toBe('I agree');
  });

  it('syncs checked prop → native input', async () => {
    const el = await mount({ label: 'x', checked: '' });
    expect(input(el).checked).toBe(true);
    el.checked = false;
    await flush();
    expect(input(el).checked).toBe(false);
  });

  it('reflects native toggle back to the host attribute and emits a composed change', async () => {
    const el = await mount({ label: 'x' });
    let detail: unknown = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    input(el).checked = true;
    input(el).dispatchEvent(new Event('change'));
    await flush();
    expect(el.hasAttribute('checked')).toBe(true);
    expect(detail).toEqual({ checked: true });
  });

  it('wires required + invalid into ARIA (error state, not color-only)', async () => {
    const el = await mount({ label: 'x', required: '', invalid: '' });
    expect(input(el).getAttribute('aria-required')).toBe('true');
    expect(input(el).getAttribute('aria-invalid')).toBe('true');
  });

  it('disables the native control', async () => {
    const el = await mount({ label: 'x', disabled: '' });
    expect(input(el).disabled).toBe(true);
  });
});
