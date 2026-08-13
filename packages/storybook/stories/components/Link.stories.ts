import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface Args {
  href: string;
  label: string;
  variant: 'inline' | 'standalone';
  directionIcon: boolean;
  disabled: boolean;
}

const meta: Meta<Args> = {
  title: 'Components/Navigation/Link',
  component: 'envision-link',
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
    label: { control: 'text' },
    variant: { control: 'inline-radio', options: ['inline', 'standalone'] },
    directionIcon: { control: 'boolean', description: 'Trailing directional arrow (RTL-aware).' },
    disabled: { control: 'boolean', description: 'Only when semantically appropriate. Drops the href and the tab order.' },
  },
  args: { href: '#plans', label: 'View all plans', variant: 'inline', directionIcon: false, disabled: false },
  render: (a) => html`
    <envision-link href=${a.href} label=${a.label} variant=${a.variant} ?direction-icon=${a.directionIcon} ?disabled=${a.disabled}></envision-link>
  `,
  parameters: { docs: { description: { component: 'Navigation, `<envision-link>`, a real `<a href>`. Use for moving between pages/views; use **Button** for actions and **IconButton** for icon-only actions.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const InlineInProse: Story = {
  name: 'Inline (in prose)',
  parameters: { controls: { disable: true } },
  render: () => html`
    <p style="max-width:420px; font-family:Inter,sans-serif; color:var(--envision-t2-color-content-primary-default); line-height:1.6;">
      Your selections are saved automatically. You can
      <envision-link href="#review" label="review everything" variant="inline"></envision-link>
      before submitting to your builder.
    </p>
  `,
};

export const Standalone: Story = { args: { variant: 'standalone', directionIcon: true, label: 'Continue to Design Center' } };

export const Disabled: Story = { args: { disabled: true, label: 'Unavailable' } };
