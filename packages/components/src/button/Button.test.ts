import { describe, it, expect } from 'vitest';
import '../index.js';
import { EnvisionButton } from './Button.js';
import { cssSource } from '../base/css.js';

/** Let the base class's microtask-batched update run, then resolve. */
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

async function mount(attrs: Record<string, string> = {}): Promise<EnvisionButton> {
  const el = document.createElement('envision-button') as EnvisionButton;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await flush();
  return el;
}

const inner = (el: EnvisionButton) => el.shadowRoot!.querySelector('button') as HTMLButtonElement;

describe('envision-button', () => {
  it('renders a real <button> with the label as its accessible name', async () => {
    const el = await mount({ label: 'Apply design' });
    const btn = inner(el);
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.type).toBe('button');
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toBe('Apply design');
  });

  it('applies default variant=primary and size=md', async () => {
    const el = await mount({ label: 'Go' });
    expect(el.getAttribute('variant')).toBe('primary');
    expect(el.getAttribute('size')).toBe('md');
    expect(el.variant).toBe('primary');
    expect(el.size).toBe('md');
  });

  it('reflects properties to attributes and back', async () => {
    const el = await mount({ label: 'Go' });
    el.variant = 'outline';
    el.size = 'lg';
    el.fullWidth = true;
    expect(el.getAttribute('variant')).toBe('outline');
    expect(el.getAttribute('size')).toBe('lg');
    expect(el.hasAttribute('full-width')).toBe(true);
  });

  it('disables the inner button and drops it from tab order when disabled', async () => {
    const el = await mount({ label: 'Go', disabled: '' });
    expect(inner(el).disabled).toBe(true);
  });

  it('blocks activation when disabled', async () => {
    const el = await mount({ label: 'Go', disabled: '' });
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    await flush();
    expect(clicks).toBe(0);
  });

  it('sets aria-busy and blocks activation when loading (still focusable)', async () => {
    const el = await mount({ label: 'Saving', loading: '' });
    expect(inner(el).getAttribute('aria-busy')).toBe('true');
    expect(inner(el).disabled).toBe(false); // loading stays focusable, unlike disabled
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    await flush();
    expect(clicks).toBe(0);
  });

  it('fires click when enabled', async () => {
    const el = await mount({ label: 'Go' });
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    await flush();
    expect(clicks).toBe(1);
  });

  it('renders leading/trailing icon ligatures when set, hidden otherwise', async () => {
    const el = await mount({ label: 'Add', 'leading-icon': 'add' });
    const lead = el.shadowRoot!.querySelector('.icon.lead') as HTMLElement;
    const trail = el.shadowRoot!.querySelector('.icon.trail') as HTMLElement;
    expect(lead.getAttribute('data-icon')).toBe('add');
    expect(lead.textContent).toBe('add');
    expect(trail.hasAttribute('data-icon')).toBe(false);
    // icons are decorative
    expect(lead.getAttribute('aria-hidden')).toBe('true');
  });

  it('outline variant binds the neutral hairline border token (web match), never brand green', () => {
    const src = cssSource(EnvisionButton.styles);
    // outline = neutral secondary (hairline border + neutral text), matching the web
    expect(src).toContain('--envision-t2-color-border-default-default');
    expect(src).toContain('--envision-t2-color-content-primary-default');
    // the brand-green outline tokens must NOT be used anywhere
    expect(src).not.toContain('t3-button-outline');
    // brand green stays for the PRIMARY variant only
    expect(src).toContain('--envision-t3-button-primary-color-background-default');
  });

  it('handles empty/very long labels without throwing (content extremes)', async () => {
    const long = 'Apply this design configuration to every selected room '.repeat(6);
    const el = await mount({ label: long });
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toBe(long);
    const empty = await mount({});
    expect(empty.shadowRoot!.querySelector('.label')!.textContent).toBe('');
  });
});
