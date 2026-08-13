import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

interface Args { checked: boolean; label: string; disabled: boolean; required: boolean; invalid: boolean; onChange: (e: Event) => void; }

const meta: Meta<Args> = {
  title: 'Components/Inputs & Selection/Checkbox',
  component: 'envision-checkbox',
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    onChange: { action: 'change', table: { category: 'Events' } },
  },
  args: { checked: false, label: 'Include lighting package', disabled: false, required: false, invalid: false, onChange: fn() },
  render: (a) => html`<envision-checkbox ?checked=${a.checked} label=${a.label} ?disabled=${a.disabled} ?required=${a.required} ?invalid=${a.invalid} @change=${a.onChange}></envision-checkbox>`,
  parameters: { docs: { description: { component: 'Boolean choice, `<envision-checkbox>`, built on a native `<input type=checkbox>`. The check is drawn as **geometry** (a tick), so the checked state is not conveyed by color alone. Space toggles.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = { args: { invalid: true, required: true, label: 'Accept the builder agreement' } };

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:grid; gap:12px;">
      <envision-checkbox label="Unchecked"></envision-checkbox>
      <envision-checkbox label="Checked" checked></envision-checkbox>
      <envision-checkbox label="Disabled" disabled></envision-checkbox>
      <envision-checkbox label="Disabled + checked" checked disabled></envision-checkbox>
      <envision-checkbox label="Invalid (required)" invalid required></envision-checkbox>
    </div>
  `,
};
