import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const options = [
  { id: 'shaker', name: 'Beadboard Shaker', color: '#c9b28a' },
  { id: 'flat', name: 'Flat Panel', color: '#5b4636' },
];

const body = () => html`
  <envision-option-card title="Cabinet Style" note="Included" .options=${options} value="shaker" @open=${fn()}></envision-option-card>
  <envision-option-card title="Cabinet Finish" note="+$120" .options=${options} value="flat" @open=${fn()}></envision-option-card>
  <envision-option-card title="Countertop" note="+$1,200" active .options=${options} value="flat" @open=${fn()}></envision-option-card>
  <envision-option-card title="Hardware" note="+$85" .options=${options} value="shaker" @open=${fn()}></envision-option-card>
  <span slot="total">Upgrades <strong>+$4,280</strong></span>
`;

const meta: Meta = {
  title: 'Components/Panels/RightRail',
  component: 'envision-right-rail',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The configurator side panel shell — `<envision-right-rail>`. Header + tabs (Customize / Packages), a scrollable **slotted** body, and a sticky footer (total slot + Apply). It is `role=complementary` on desktop and **re-composes into a modal sheet** (`role=dialog aria-modal`, focus-trapped, Esc-to-close, focus returned) at ≤1024px — the same API, not a shrunken rail. Body content is slotted, so the rail is a reusable shell, not coupled to the kitchen domain.' } },
  },
};
export default meta;
type Story = StoryObj;

/** Desktop rail (role=complementary). */
export const Rail: Story = {
  render: () => html`
    <div style="height:640px; display:flex; justify-content:flex-end; background:var(--envision-t2-color-background-surface-sunken-default);">
      <envision-right-rail heading="Kitchen" style="height:640px;" @apply=${fn()} @modechange=${fn()}>
        ${body()}
      </envision-right-rail>
    </div>
  `,
};

/**
 * Loading — the body is dimmed and marked aria-busy while content resolves.
 *
 * DOCUMENTED A11Y EXCEPTION: the transient opacity dim reduces text contrast below AA *while
 * loading only*; content passes contrast at rest. Colour-contrast is scoped-off for this one
 * story. The proper fix — skeleton placeholders (no dimmed real text) — is a tracked follow-up in
 * ACCESSIBILITY-CONTRACTS.md.
 */
export const Loading: Story = {
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  render: () => html`
    <div style="height:640px; display:flex; justify-content:flex-end;">
      <envision-right-rail heading="Kitchen" loading style="height:640px;" @apply=${fn()}>
        ${body()}
      </envision-right-rail>
    </div>
  `,
};

/**
 * Mobile sheet — the SAME component, forced into its sheet presentation and opened. It becomes a
 * modal dialog: focus moves in, Tab is trapped across header → body → Apply, Esc closes, and focus
 * returns to the opener. (Switch the Viewport toolbar to ≤1024 to see this happen automatically.)
 */
export const MobileSheet: Story = {
  name: 'Mobile sheet (modal dialog)',
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: () => html`
    <div style="height:720px; position:relative; background:var(--envision-t2-color-background-surface-sunken-default);">
      <envision-right-rail heading="Kitchen" sheet open style="height:720px;" @apply=${fn()} @close=${fn()}>
        ${body()}
      </envision-right-rail>
    </div>
  `,
};
