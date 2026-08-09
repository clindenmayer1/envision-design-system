import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionMaterialSwatch } from './MaterialSwatch.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(setup: (el: EnvisionMaterialSwatch) => void = () => {}): Promise<EnvisionMaterialSwatch> {
  const el = document.createElement('envision-material-swatch') as EnvisionMaterialSwatch;
  setup(el);
  document.body.appendChild(el);
  await flush();
  return el;
}
const btn = (el: EnvisionMaterialSwatch) => el.shadowRoot!.querySelector('.swatch') as HTMLButtonElement;

describe('envision-material-swatch', () => {
  it('builds the accessible name from material + finish + price', async () => {
    const el = await mount((e) => { e.option = { id: 'm1', name: 'Maple', finish: 'Matte', priceLabel: '+$120' }; });
    expect(btn(el).getAttribute('aria-label')).toBe('Maple, Matte, +$120');
    expect(btn(el).getAttribute('aria-pressed')).toBe('false');
  });

  it('is a pressed toggle when selected and emits select with the id', async () => {
    const el = await mount((e) => { e.option = { id: 'm1', name: 'Oak' }; e.selected = true; });
    expect(btn(el).getAttribute('aria-pressed')).toBe('true');
    let id: unknown = null;
    el.addEventListener('select', (e) => (id = (e as CustomEvent).detail.id));
    el.click();
    await flush();
    expect(id).toBe('m1');
  });

  it('blocks selection and marks unavailable', async () => {
    const el = await mount((e) => { e.option = { id: 'm2', name: 'Walnut' }; e.unavailable = true; });
    expect(btn(el).disabled).toBe(true);
    expect(btn(el).getAttribute('aria-label')).toContain('unavailable');
    let fired = 0;
    el.addEventListener('select', () => fired++);
    el.click();
    await flush();
    expect(fired).toBe(0);
  });
});
