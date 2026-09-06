import { describe, it, expect } from 'vitest';
import '../index.js';
import { EnvisionPackageCard } from './PackageCard.js';
import { cssSource } from '../base/css.js';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
async function mount(setup: (el: EnvisionPackageCard) => void = () => {}): Promise<EnvisionPackageCard> {
  const el = document.createElement('envision-package-card') as EnvisionPackageCard;
  setup(el);
  document.body.appendChild(el);
  await flush();
  return el;
}
const selectBtn = (el: EnvisionPackageCard) => el.shadowRoot!.querySelector('.select') as HTMLButtonElement;
const customizeBtn = (el: EnvisionPackageCard) => el.shadowRoot!.querySelector('.customize') as HTMLButtonElement;

describe('envision-package-card (audit fix: real buttons, not a div-as-button)', () => {
  it('uses a real select <button> and a SEPARATE customize <button> (no nested buttons)', async () => {
    const el = await mount((e) => { e.pkg = { id: 'p1', name: 'Modern Farmhouse', priceLabel: '$12,400' }; });
    expect(selectBtn(el).tagName).toBe('BUTTON');
    expect(customizeBtn(el).tagName).toBe('BUTTON');
    // customize is NOT nested inside select
    expect(selectBtn(el).contains(customizeBtn(el))).toBe(false);
    expect(el.shadowRoot!.querySelector('[role="button"]')).toBeNull(); // no div-as-button
  });

  it('emits select and customize independently with the package id', async () => {
    const el = await mount((e) => { e.pkg = { id: 'p1', name: 'Coastal' }; });
    let sel: unknown = null; let cust: unknown = null;
    el.addEventListener('select', (e) => (sel = (e as CustomEvent).detail.id));
    el.addEventListener('customize', (e) => (cust = (e as CustomEvent).detail.id));
    selectBtn(el).click();
    customizeBtn(el).click();
    await flush();
    expect(sel).toBe('p1');
    expect(cust).toBe('p1');
  });

  it('reflects selected as aria-pressed and labels the actions', async () => {
    const el = await mount((e) => { e.pkg = { id: 'p1', name: 'Coastal', popular: true, priceLabel: '$9,900' }; e.selected = true; });
    expect(selectBtn(el).getAttribute('aria-pressed')).toBe('true');
    expect(selectBtn(el).getAttribute('aria-label')).toContain('Coastal');
    expect(selectBtn(el).getAttribute('aria-label')).toContain('popular');
    expect(customizeBtn(el).getAttribute('aria-label')).toBe('Customize Coastal');
  });

  it('Customize is a neutral secondary button (hairline border, not brand green — web match)', () => {
    const src = cssSource(EnvisionPackageCard.styles);
    expect(src).toContain('--envision-t2-color-border-default-default'); // hairline border
    expect(src).toContain('--envision-t2-color-content-primary-default'); // neutral text
    expect(src).not.toContain('t3-button-outline'); // no brand-green outline tokens
  });

  it('caps the material preview (max-materials state)', async () => {
    const el = await mount((e) => {
      e.pkg = { id: 'p1', name: 'Big', materials: Array.from({ length: 9 }, (_, i) => ({ id: String(i), name: `m${i}`, color: '#ccc' })) };
    });
    expect(el.shadowRoot!.querySelectorAll('.mat').length).toBe(6);
  });

  it('renders the package description (product anatomy)', async () => {
    const el = await mount((e) => { e.pkg = { id: 'p', name: 'Summit', description: 'White cabinets, Calacatta, and chrome.' }; });
    expect(el.shadowRoot!.querySelector('.desc')!.textContent).toBe('White cabinets, Calacatta, and chrome.');
  });

  it('confirms the applied state with a check, so selection is never color-only', async () => {
    const el = await mount((e) => { e.pkg = { id: 'p', name: 'Summit' }; });
    const applied = el.shadowRoot!.querySelector('.applied') as HTMLElement;
    expect(applied.getAttribute('aria-label')).toBe('Applied');
    el.selected = true; await flush();
    expect(cssSource(EnvisionPackageCard.styles)).toContain(':host([selected]) .applied');
  });

  it('previews a material texture when the product supplies one', async () => {
    const el = await mount((e) => { e.pkg = { id: 'p', name: 'S', materials: [{ id: 'a', name: 'Oak', image: '/t/oak.jpg' }] }; });
    expect(el.shadowRoot!.querySelector<HTMLElement>('.mat')!.style.backgroundImage).toContain('/t/oak.jpg');
  });
});
