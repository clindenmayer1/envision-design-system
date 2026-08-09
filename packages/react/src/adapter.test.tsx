import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button, Checkbox, Input } from './index.js';

/** Render synchronously so useLayoutEffect (which applies attrs/events) has committed. */
function render(node: React.ReactElement): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(node));
  return container;
}

describe('@envision/react thin adapter', () => {
  it('renders the underlying custom element by meaningful name', () => {
    const c = render(<Button label="Apply" />);
    const el = c.querySelector('envision-button')!;
    expect(el).toBeTruthy();
    expect(el.getAttribute('label')).toBe('Apply');
  });

  it('maps camelCase props to kebab-case attributes', () => {
    const c = render(<Button label="Go" variant="outline" fullWidth leadingIcon="add" />);
    const el = c.querySelector('envision-button')!;
    expect(el.getAttribute('variant')).toBe('outline');
    expect(el.hasAttribute('full-width')).toBe(true); // fullWidth → full-width
    expect(el.getAttribute('leading-icon')).toBe('add'); // leadingIcon → leading-icon
  });

  it('treats boolean props as presence attributes (false removes them)', () => {
    const c = render(<Button label="Go" disabled={false} />);
    const el = c.querySelector('envision-button')!;
    expect(el.hasAttribute('disabled')).toBe(false);
    const c2 = render(<Button label="Go" disabled />);
    expect(c2.querySelector('envision-button')!.hasAttribute('disabled')).toBe(true);
  });

  it('forwards on* props to custom-element events (onClick)', () => {
    let clicks = 0;
    const c = render(<Button label="Go" onClick={() => clicks++} />);
    (c.querySelector('envision-button') as HTMLElement).click();
    expect(clicks).toBe(1);
  });

  it('receives the composed change event a form control emits (onChange)', () => {
    let detail: unknown = null;
    const c = render(<Checkbox label="Agree" onChange={(e) => (detail = (e as CustomEvent).detail)} />);
    const el = c.querySelector('envision-checkbox') as HTMLElement;
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(detail).toEqual({ checked: true }); // adapter forwards the composed change
  });

  it('passes typed props through to a composed field (Input)', () => {
    const c = render(<Input label="Email" type="email" required helperText="Work email" />);
    const el = c.querySelector('envision-input') as HTMLElement;
    expect(el.getAttribute('type')).toBe('email');
    expect(el.hasAttribute('required')).toBe(true);
    expect(el.getAttribute('helper-text')).toBe('Work email');
  });
});
