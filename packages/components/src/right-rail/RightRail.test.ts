import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionRightRail } from './RightRail.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/** happy-dom's default viewport is ≤1024, which auto-triggers sheet mode; pin a width so the
 *  rail/sheet presentation is deterministic (desktop by default; sheet tests force `sheet`). */
function setViewport(width: number): void {
  (window as unknown as { happyDOM?: { setViewport?: (o: { width: number }) => void } }).happyDOM?.setViewport?.({ width });
}

async function mount(attrs: Record<string, string> = {}, bodyHTML = '', width = 1280): Promise<EnvisionRightRail> {
  setViewport(width);
  const el = document.createElement('envision-right-rail') as EnvisionRightRail;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.innerHTML = bodyHTML;
  document.body.appendChild(el);
  await flush();
  return el;
}
const rail = (el: EnvisionRightRail) => el.shadowRoot!.querySelector('.rail') as HTMLElement;

describe('envision-right-rail (composite shell)', () => {
  it('is a role=complementary rail on desktop with slotted body', async () => {
    const el = await mount({ heading: 'Design' }, '<div class="content">slotted</div>');
    expect(rail(el).getAttribute('role')).toBe('complementary');
    expect(rail(el).hasAttribute('aria-modal')).toBe(false);
    expect(el.querySelector('.content')!.textContent).toBe('slotted'); // body is composable/slotted
  });

  it('switches mode via the tabs and emits modechange', async () => {
    const el = await mount({ heading: 'Design' });
    let mode: unknown = null;
    el.addEventListener('modechange', (e) => (mode = (e as CustomEvent).detail.mode));
    (el.shadowRoot!.querySelector('.t-packages') as HTMLElement).dispatchEvent(new CustomEvent('select', { bubbles: true }));
    await flush();
    expect(el.mode).toBe('packages');
    expect(mode).toBe('packages');
  });

  it('emits apply from the footer action', async () => {
    const el = await mount();
    let applied = 0;
    el.addEventListener('apply', () => applied++);
    (el.shadowRoot!.querySelector('.apply') as HTMLElement).click();
    await flush();
    expect(applied).toBe(1);
  });

  it('AUDIT FIX: as a mobile sheet it becomes a modal dialog and closes on Esc', async () => {
    const el = await mount({ sheet: '', open: '', heading: 'Design' }, '<button class="b1">One</button>');
    await flush();
    expect(el.hasAttribute('data-sheet')).toBe(true);
    expect(rail(el).getAttribute('role')).toBe('dialog');
    expect(rail(el).getAttribute('aria-modal')).toBe('true');

    let closed = 0;
    el.addEventListener('close', () => closed++);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flush();
    expect(closed).toBe(1);
    expect(el.open).toBe(false);
  });

  it('traps Tab within the sheet (prevents focus escaping the dialog)', async () => {
    const el = await mount({ sheet: '', open: '' }, '<button class="b1">One</button><button class="b2">Two</button>');
    await flush();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true); // trap intercepts Tab
  });

  it('reflects loading as aria-busy on the body', async () => {
    const el = await mount({ loading: '' });
    expect((el.shadowRoot!.querySelector('.body') as HTMLElement).getAttribute('aria-busy')).toBe('true');
  });
});
