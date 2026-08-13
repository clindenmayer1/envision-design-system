import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import './index.js';
import type { EnvisionMaterialSwatch } from './material-swatch/MaterialSwatch.js';
import type { EnvisionOptionCard } from './option-card/OptionCard.js';
import type { EnvisionPackageCard } from './package-card/PackageCard.js';

expect.extend(matchers);

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Fast, headless accessibility layer. axe-core runs on each component in happy-dom and catches
 * ARIA/role/name/structure violations at unit speed. Color-contrast, focus-visible painting and
 * real screen-reader behaviour need a rendering browser — those are covered by the Storybook
 * test-runner (a11y) layer and the manual review in ACCESSIBILITY-CONTRACTS.md, so the contrast
 * rule is disabled here (it cannot be evaluated without layout).
 */
const AXE_OPTS = { rules: { 'color-contrast': { enabled: false } } } as const;

async function mount(tag: string, setup: (el: HTMLElement) => void = () => {}): Promise<HTMLElement> {
  const el = document.createElement(tag);
  setup(el);
  document.body.appendChild(el);
  await flush();
  return el;
}

async function expectNoViolations(el: Element) {
  const results = await axe(el, AXE_OPTS);
  expect(results).toHaveNoViolations();
}

describe('accessibility (axe, unit layer)', () => {
  it('Button has no violations', async () => {
    const el = await mount('envision-button', (e) => e.setAttribute('label', 'Apply design'));
    await expectNoViolations(el);
  });

  it('IconButton (icon-only) has an accessible name', async () => {
    const el = await mount('envision-icon-button', (e) => {
      e.setAttribute('icon', 'close');
      e.setAttribute('accessible-name', 'Close panel');
    });
    await expectNoViolations(el);
  });

  it('Link has no violations', async () => {
    const el = await mount('envision-link', (e) => {
      e.setAttribute('href', '#plans');
      e.setAttribute('label', 'View plans');
    });
    await expectNoViolations(el);
  });

  it('Input has an associated label', async () => {
    const el = await mount('envision-input', (e) => e.setAttribute('label', 'Email'));
    await expectNoViolations(el);
  });

  it('Input in error state associates its message', async () => {
    const el = await mount('envision-input', (e) => {
      e.setAttribute('label', 'Email');
      e.setAttribute('invalid', '');
      e.setAttribute('error-message', 'Enter a valid email.');
    });
    await expectNoViolations(el);
  });

  it('Checkbox has no violations', async () => {
    const el = await mount('envision-checkbox', (e) => e.setAttribute('label', 'Include lighting'));
    await expectNoViolations(el);
  });

  it('Radio group has no violations', async () => {
    const group = document.createElement('div');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Countertop');
    for (const v of ['quartz', 'granite']) {
      const r = document.createElement('envision-radio');
      r.setAttribute('name', 'counter');
      r.setAttribute('value', v);
      r.setAttribute('label', v);
      group.appendChild(r);
    }
    document.body.appendChild(group);
    await flush();
    await expectNoViolations(group);
  });

  it('Switch has no violations', async () => {
    const el = await mount('envision-switch', (e) => e.setAttribute('label', 'Show pricing'));
    await expectNoViolations(el);
  });

  it('Badge (count) has no violations', async () => {
    const el = await mount('envision-badge', (e) => {
      e.setAttribute('count', '3');
      e.setAttribute('label', '3 unread');
    });
    await expectNoViolations(el);
  });

  it('Tab in a tablist has no violations', async () => {
    const list = document.createElement('div');
    list.setAttribute('role', 'tablist');
    const t = document.createElement('envision-tab');
    t.setAttribute('label', 'Customize');
    t.setAttribute('selected', '');
    list.appendChild(t);
    document.body.appendChild(list);
    await flush();
    await expectNoViolations(list);
  });

  it('MaterialSwatch has an accessible name from its option', async () => {
    const el = (await mount('envision-material-swatch')) as EnvisionMaterialSwatch;
    el.option = { id: 'oak', name: 'White Oak', finish: 'Natural', priceLabel: 'Included' };
    await flush();
    await expectNoViolations(el);
  });

  it('OptionCard (whole-card button) has no violations', async () => {
    const el = (await mount('envision-option-card')) as EnvisionOptionCard;
    el.setAttribute('title', 'Cabinet Style');
    el.setAttribute('note', 'Included');
    await flush();
    await expectNoViolations(el);
  });

  it('PackageCard (select + customize buttons) has no violations', async () => {
    const el = (await mount('envision-package-card')) as EnvisionPackageCard;
    el.pkg = { id: 'p1', name: 'Heritage Package', priceLabel: '+$126/mo' };
    await flush();
    await expectNoViolations(el);
  });
});
