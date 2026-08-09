import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionTab } from './Tab.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

async function mountTablist(labels: string[], selected?: string): Promise<{ list: HTMLElement; tabs: EnvisionTab[] }> {
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  document.body.appendChild(list);
  const tabs = labels.map((l) => {
    const el = document.createElement('envision-tab') as EnvisionTab;
    el.setAttribute('label', l);
    if (l === selected) el.setAttribute('selected', '');
    list.appendChild(el);
    return el;
  });
  await flush();
  return { list, tabs };
}
const btn = (el: EnvisionTab) => el.shadowRoot!.querySelector('.tab') as HTMLButtonElement;

describe('envision-tab', () => {
  it('exposes role=tab + aria-selected and roving tabindex', async () => {
    const { tabs } = await mountTablist(['Customize', 'Packages'], 'Customize');
    expect(btn(tabs[0]).getAttribute('role')).toBe('tab');
    expect(btn(tabs[0]).getAttribute('aria-selected')).toBe('true');
    expect(btn(tabs[0]).tabIndex).toBe(0);
    expect(btn(tabs[1]).getAttribute('aria-selected')).toBe('false');
    expect(btn(tabs[1]).tabIndex).toBe(-1);
  });

  it('activating a tab deselects siblings and emits a composed select event', async () => {
    const { list, tabs } = await mountTablist(['A', 'B'], 'A');
    let picked: unknown = null;
    list.addEventListener('select', (e) => { picked = (e as CustomEvent).detail; });
    btn(tabs[1]).click();
    await flush();
    expect(tabs[1].selected).toBe(true);
    expect(tabs[0].selected).toBe(false);
    expect(picked).toEqual({ label: 'B', panel: null });
  });

  it('ArrowRight moves selection to the next tab (automatic activation)', async () => {
    const { tabs } = await mountTablist(['A', 'B', 'C'], 'A');
    btn(tabs[0]).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(tabs[1].selected).toBe(true);
  });

  it('wires aria-controls to the panel id', async () => {
    const { tabs } = await mountTablist(['A']);
    tabs[0].panel = 'panel-a';
    await flush();
    expect(btn(tabs[0]).getAttribute('aria-controls')).toBe('panel-a');
  });
});
