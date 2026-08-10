import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionOptionCard } from './OptionCard.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(attrs: Record<string, string> = {}, setup: (el: EnvisionOptionCard) => void = () => {}): Promise<EnvisionOptionCard> {
  const el = document.createElement('envision-option-card') as EnvisionOptionCard;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  setup(el);
  document.body.appendChild(el);
  await flush();
  return el;
}
const card = (el: EnvisionOptionCard) => el.shadowRoot!.querySelector('.card') as HTMLButtonElement;

describe('envision-option-card', () => {
  it('is a single whole-card <button> with no nested interactive', async () => {
    const el = await mount({ title: 'Cabinets', note: 'Included' });
    expect(card(el).tagName).toBe('BUTTON');
    expect(el.shadowRoot!.querySelectorAll('button, a, input').length).toBe(1);
    expect(el.shadowRoot!.querySelector('.title')!.textContent).toBe('Cabinets');
  });

  it('emits open on click and reflects the active (tray-open) state', async () => {
    const el = await mount({ title: 'Hardware', active: '' });
    expect(card(el).getAttribute('aria-expanded')).toBe('true');
    let opened = 0;
    el.addEventListener('open', () => opened++);
    el.click();
    await flush();
    expect(opened).toBe(1);
  });

  it('styles a price note as an upgrade but "Included" as normal', async () => {
    const up = await mount({ title: 'Counter', note: '+$540' });
    expect(up.shadowRoot!.querySelector('.note')!.className).toContain('upgrade');
    const inc = await mount({ title: 'Counter', note: 'Included' });
    expect(inc.shadowRoot!.querySelector('.note')!.className).not.toContain('upgrade');
  });

  it('shows a price-pending message', async () => {
    const el = await mount({ title: 'Counter', note: '+$100', 'price-pending': '' });
    expect(el.shadowRoot!.querySelector('.note')!.textContent).toBe('Updating price…');
  });

  it('renders the current option thumb from options + value', async () => {
    const el = await mount({ title: 'Cabinets' }, (e) => {
      e.options = [{ id: 'a', name: 'A', color: '#123456' }, { id: 'b', name: 'B', color: '#abcdef' }];
      e.value = 'b';
    });
    const thumb = el.shadowRoot!.querySelector('.thumb') as HTMLElement;
    expect(thumb.style.background.toLowerCase()).toContain('abcdef'); // current option (b) color
  });

  it('accepts slotted media so the product can render a live 3D preview in the thumb', async () => {
    const el = await mount();
    const media = document.createElement('div');
    media.slot = 'media'; media.id = 'live-3d';
    el.appendChild(media);
    await flush();
    const slot = el.shadowRoot!.querySelector('slot[name="media"]') as HTMLSlotElement;
    expect(slot).toBeTruthy();
    expect(slot.assignedElements().map((n) => n.id)).toContain('live-3d');
  });
});
