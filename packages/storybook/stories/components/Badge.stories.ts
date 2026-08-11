import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

interface Args {
  tone: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'error';
  shape: 'count' | 'dot';
  count?: number;
  max: number;
  label?: string;
}

const meta: Meta<Args> = {
  title: 'Components/Data Display/Badge',
  component: 'envision-badge',
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'brand', 'info', 'success', 'warning', 'error'] },
    shape: { control: 'inline-radio', options: ['count', 'dot'] },
    count: { control: 'number' },
    max: { control: 'number', description: 'Renders `N+` above this value.' },
    label: { control: 'text', description: 'Accessible name (a bare dot is otherwise decorative).' },
  },
  args: { tone: 'brand', shape: 'count', count: 3, max: 99 },
  render: (a) => html`
    <envision-badge tone=${a.tone} shape=${a.shape} count=${ifDefined(a.count)} max=${a.max} label=${ifDefined(a.label || undefined)}></envision-badge>
  `,
  parameters: { docs: { description: { component: 'Count or status indicator — `<envision-badge>`. Registry tones map to emitted tokens (`error→critical`, `brand→promotional`). Meaning is never colour-only — pair with adjacent text or an accessible label.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <envision-badge tone="neutral" count="2" label="2 items"></envision-badge>
      <envision-badge tone="brand" count="2" label="2 items"></envision-badge>
      <envision-badge tone="info" count="2" label="2 items"></envision-badge>
      <envision-badge tone="success" count="2" label="2 items"></envision-badge>
      <envision-badge tone="warning" count="2" label="2 items"></envision-badge>
      <envision-badge tone="error" count="2" label="2 items"></envision-badge>
    </div>
  `,
};

/** Count clamps to `max` as `N+` (content extreme). */
export const CountClamping: Story = { args: { count: 250, max: 99 } };

/** A dot for unread/attention, with no number. Provide a label so it isn't purely decorative. */
export const Dot: Story = { args: { shape: 'dot', tone: 'error', label: 'Unread' } };

/** Realistic — a notification bell with an overlaid count. */
export const RealUseCase_NotificationBell: Story = {
  name: 'Realistic — notification bell',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="position:relative; display:inline-flex;">
      <envision-icon-button icon="notifications" accessible-name="Notifications, 3 unread"></envision-icon-button>
      <span style="position:absolute; top:2px; right:2px;">
        <envision-badge tone="error" count="3" label="3 unread"></envision-badge>
      </span>
    </div>
  `,
};
