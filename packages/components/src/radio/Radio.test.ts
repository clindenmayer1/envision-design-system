import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionRadio } from './Radio.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

async function mountGroup(name: string, values: string[], checked?: string): Promise<EnvisionRadio[]> {
  const wrap = document.createElement('div');
  wrap.setAttribute('role', 'radiogroup');
  document.body.appendChild(wrap);
  const radios = values.map((v) => {
    const el = document.createElement('envision-radio') as EnvisionRadio;
    el.setAttribute('name', name);
    el.setAttribute('value', v);
    el.setAttribute('label', v);
    if (v === checked) el.setAttribute('checked', '');
    wrap.appendChild(el);
    return el;
  });
  await flush();
  return radios;
}
const input = (el: EnvisionRadio) => el.shadowRoot!.querySelector('input') as HTMLInputElement;

describe('envision-radio (group coordination across separate custom elements)', () => {
  it('selecting one deselects same-name siblings', async () => {
    const [a, b, c] = await mountGroup('color', ['red', 'green', 'blue'], 'red');
    // simulate native selection of b
    input(b).checked = true;
    input(b).dispatchEvent(new Event('change'));
    await flush();
    expect(b.checked).toBe(true);
    expect(a.checked).toBe(false);
    expect(c.checked).toBe(false);
  });

  it('implements roving tabindex — only the checked radio is tabbable', async () => {
    const [a, b, c] = await mountGroup('size', ['s', 'm', 'l'], 'm');
    await flush();
    expect(input(a).tabIndex).toBe(-1);
    expect(input(b).tabIndex).toBe(0);
    expect(input(c).tabIndex).toBe(-1);
  });

  it('when nothing is checked, the first enabled radio is tabbable', async () => {
    const [a, b] = await mountGroup('x', ['1', '2']);
    await flush();
    expect(input(a).tabIndex).toBe(0);
    expect(input(b).tabIndex).toBe(-1);
  });

  it('ArrowDown moves selection to the next radio and emits change', async () => {
    const [a, b] = await mountGroup('y', ['1', '2'], '1');
    let changes = 0;
    b.addEventListener('change', () => changes++);
    input(a).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await flush();
    expect(b.checked).toBe(true);
    expect(a.checked).toBe(false);
    expect(changes).toBe(1);
  });
});
