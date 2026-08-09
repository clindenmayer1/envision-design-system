import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionInput } from './Input.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}): Promise<EnvisionInput> {
  const el = document.createElement('envision-input') as EnvisionInput;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}
const input = (el: EnvisionInput) => el.shadowRoot!.querySelector('input') as HTMLInputElement;
const label = (el: EnvisionInput) => el.shadowRoot!.querySelector('label') as HTMLLabelElement;

describe('envision-input', () => {
  it('associates a persistent <label> with the input by id (not a placeholder-label)', async () => {
    const el = await mount({ label: 'Email' });
    expect(label(el).getAttribute('for')).toBe(input(el).id);
    expect(input(el).id).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.label-text')!.textContent).toBe('Email');
  });

  it('sets aria-invalid + aria-describedby → error when invalid, and shows the error text', async () => {
    const el = await mount({ label: 'Email', invalid: '', 'error-message': 'Required' });
    expect(input(el).getAttribute('aria-invalid')).toBe('true');
    const describedby = input(el).getAttribute('aria-describedby') ?? '';
    expect(describedby).toContain('-err');
    expect(el.shadowRoot!.querySelector('.error')!.textContent).toBe('Required');
  });

  it('describes by the helper text when present and not invalid', async () => {
    const el = await mount({ label: 'Email', 'helper-text': "We'll never share it" });
    expect(input(el).getAttribute('aria-describedby')).toContain('-help');
    expect(input(el).getAttribute('aria-invalid')).toBe('false');
  });

  it('maps type=price to a text input with decimal inputmode', async () => {
    const el = await mount({ label: 'Price', type: 'price' });
    expect(input(el).type).toBe('text');
    expect(input(el).inputMode).toBe('decimal');
  });

  it('marks required via aria-required', async () => {
    const el = await mount({ label: 'Name', required: '' });
    expect(input(el).getAttribute('aria-required')).toBe('true');
  });

  it('emits composed input events and reflects the value', async () => {
    const el = await mount({ label: 'Name' });
    let val: unknown = null;
    el.addEventListener('input', (e) => { val = (e as CustomEvent).detail; });
    input(el).value = 'Ada';
    input(el).dispatchEvent(new Event('input'));
    await flush();
    expect(val).toEqual({ value: 'Ada' });
    expect(el.getAttribute('value')).toBe('Ada');
  });
});
