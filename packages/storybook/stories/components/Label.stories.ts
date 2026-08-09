import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface Args { text: string; htmlFor: string; required: boolean; helpIcon: boolean; }

const meta: Meta<Args> = {
  title: 'Components/Label',
  component: 'envision-label',
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    htmlFor: { control: 'text', description: 'id of the associated control.' },
    required: { control: 'boolean', description: 'Asterisk BEFORE the text (aria-hidden); also set aria-required on the control.' },
    helpIcon: { control: 'boolean' },
  },
  args: { text: 'Project name', htmlFor: 'demo-field', required: false, helpIcon: false },
  render: (a) => html`
    <div style="display:grid; gap:6px; width:280px;">
      <envision-label text=${a.text} html-for=${a.htmlFor} ?required=${a.required} ?help-icon=${a.helpIcon}></envision-label>
      <input id=${a.htmlFor} style="height:36px; border:1px solid var(--envision-t2-color-border-default-default); border-radius:6px; padding:0 10px; font:inherit;" />
    </div>
  `,
  parameters: { docs: { description: { component: 'Reusable field/control label — `<envision-label>`. Rendered in **light DOM** so `<label for>` can associate with a control across no shadow boundary. Composes with external controls; the form controls (Input/Checkbox/…) already carry their own label internally.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const WithHelpIcon: Story = { args: { helpIcon: true, text: 'Upgrade budget' } };
