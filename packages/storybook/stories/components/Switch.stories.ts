import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

interface Args { checked: boolean; label: string; disabled: boolean; onChange: (e: Event) => void; }

const meta: Meta<Args> = {
  title: 'Components/Inputs & Selection/Switch',
  component: 'envision-switch',
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { action: 'change', table: { category: 'Events' } },
  },
  args: { checked: true, label: 'Show upgrade pricing', disabled: false, onChange: fn() },
  render: (a) => html`<envision-switch ?checked=${a.checked} label=${a.label} ?disabled=${a.disabled} @change=${a.onChange}></envision-switch>`,
  parameters: { docs: { description: { component: 'On/off toggle for an immediate setting, `<envision-switch>` (`role=switch`). Space or Enter toggles; the thumb position (not just color) conveys state. Use for instant toggles; use **Checkbox** for form selections.' } } },
};
export default meta;
type Story = StoryObj<Args>;

/** The canonical single-instance page. Off and Disabled are reached from here via the controls. */
export const On: Story = { args: { checked: true } };

// Hidden from the sidebar (`!dev`): reachable by flipping `checked` / `disabled` on On.
// Still indexed, so the docs page embeds them and visual regression still covers them.
export const Off: Story = { tags: ['!dev'], args: { checked: false } };
export const Disabled: Story = { tags: ['!dev'], args: { disabled: true } };

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:grid; gap:12px;">
      <envision-switch label="Off"></envision-switch>
      <envision-switch label="On" checked></envision-switch>
      <envision-switch label="Disabled" disabled></envision-switch>
      <envision-switch label="Disabled + on" checked disabled></envision-switch>
    </div>
  `,
};
