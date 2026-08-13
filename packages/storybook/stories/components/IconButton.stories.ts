import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { fn } from '@storybook/test';

interface Args {
  icon: string;
  accessibleName: string;
  variant: 'standard' | 'subtle';
  selected: boolean;
  disabled: boolean;
  tooltip?: string;
  onClick: (e: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Actions/IconButton',
  component: 'envision-icon-button',
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text', description: 'Material Symbols name (required).' },
    accessibleName: { control: 'text', description: 'Accessible name. REQUIRED, since an icon-only control has no visible text.' },
    variant: { control: 'inline-radio', options: ['standard', 'subtle'] },
    selected: { control: 'boolean', description: 'Toggle on, giving a brand fill and aria-pressed.' },
    disabled: { control: 'boolean' },
    tooltip: { control: 'text' },
    onClick: { action: 'click', table: { category: 'Events' } },
  },
  args: { icon: 'close', accessibleName: 'Close panel', variant: 'standard', selected: false, disabled: false, onClick: fn() },
  render: (a) => html`
    <envision-icon-button
      icon=${a.icon}
      accessible-name=${a.accessibleName}
      variant=${a.variant}
      ?selected=${a.selected}
      ?disabled=${a.disabled}
      tooltip=${ifDefined(a.tooltip || undefined)}
      @click=${a.onClick}
    ></envision-icon-button>
  `,
  parameters: {
    docs: { description: { component: 'Icon-only action, `<envision-icon-button>`. An accessible name is mandatory; `aria-pressed` appears only when it acts as a toggle. Used for close/back/save/overflow and 3D controls.' } },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:12px;">
      <envision-icon-button icon="tune" accessible-name="Adjust" variant="standard"></envision-icon-button>
      <envision-icon-button icon="tune" accessible-name="Adjust" variant="subtle"></envision-icon-button>
    </div>
  `,
};

/** As a toggle: selected gets a brand fill and aria-pressed=true (e.g. Save / bookmark). */
export const Toggle: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:12px;">
      <envision-icon-button icon="bookmark" accessible-name="Save design"></envision-icon-button>
      <envision-icon-button icon="bookmark" accessible-name="Saved" selected></envision-icon-button>
    </div>
  `,
};

export const Disabled: Story = { args: { disabled: true, icon: 'delete', accessibleName: 'Delete' } };

/** Realistic: a 3D-viewport control cluster (zoom / reset / fullscreen). */
export const RealUseCase_ViewportControls: Story = {
  name: 'Realistic: viewport controls',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:inline-flex; gap:4px; padding:6px; border-radius:12px;
                background:var(--envision-t2-color-background-surface-default);
                box-shadow:0 1px 3px rgba(34,32,28,.16);">
      <envision-icon-button icon="add" accessible-name="Zoom in"></envision-icon-button>
      <envision-icon-button icon="remove" accessible-name="Zoom out"></envision-icon-button>
      <envision-icon-button icon="restart_alt" accessible-name="Reset view"></envision-icon-button>
      <envision-icon-button icon="fullscreen" accessible-name="Fullscreen"></envision-icon-button>
    </div>
  `,
};
