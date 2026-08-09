import { describe, it, expect } from 'vitest';
import '../index.js';
import type { EnvisionLabel } from './Label.js';

async function mount(attrs: Record<string, string> = {}): Promise<EnvisionLabel> {
  const el = document.createElement('envision-label') as EnvisionLabel;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

describe('envision-label', () => {
  it('renders a light-DOM <label for> that associates document-wide', async () => {
    const input = document.createElement('input');
    input.id = 'email';
    document.body.appendChild(input);
    const el = await mount({ text: 'Email', 'html-for': 'email' });
    const label = el.querySelector('label') as HTMLLabelElement; // LIGHT dom, not shadow
    expect(el.shadowRoot).toBeNull();
    expect(label.getAttribute('for')).toBe('email');
    expect(label.textContent).toContain('Email');
  });

  it('renders the required asterisk BEFORE the text and hides it from AT', async () => {
    const el = await mount({ text: 'Name', 'html-for': 'n', required: '' });
    const req = el.querySelector('.envision-label__req') as HTMLElement;
    expect(req).toBeTruthy();
    expect(req.getAttribute('aria-hidden')).toBe('true');
    // asterisk precedes the label text node
    const label = el.querySelector('label')!;
    expect(label.firstElementChild).toBe(req);
  });

  it('updates when attributes change', async () => {
    const el = await mount({ text: 'A', 'html-for': 'x' });
    el.text = 'B';
    expect(el.querySelector('.envision-label__label')!.textContent).toBe('B');
  });
});
