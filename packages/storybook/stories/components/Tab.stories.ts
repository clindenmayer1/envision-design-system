import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn, expect, userEvent } from '@storybook/test';

interface Args {
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (e: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Tab',
  component: 'envision-tab',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onSelect: { action: 'select', table: { category: 'Events' } },
  },
  args: { label: 'Customize', selected: true, disabled: false, onSelect: fn() },
  // A role=tab requires a role=tablist parent — even a single tab is shown inside one.
  render: (a) => html`<div role="tablist"><envision-tab label=${a.label} ?selected=${a.selected} ?disabled=${a.disabled} @select=${a.onSelect}></envision-tab></div>`,
  parameters: { docs: { description: { component: '`role=tab` control — `<envision-tab>`. Implements the APG roving-tabindex pattern across sibling tabs (Arrow / Home / End), selection-follows-focus. The `Tabs` container is a separate (proposed) component; wrap tabs in `role="tablist"`.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

/** A real tablist — the RightRail Customize / Packages tabs. Arrow keys move + select. */
export const Tablist: Story = {
  name: 'Tablist (keyboard)',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div role="tablist" style="display:flex; gap:8px; border-bottom:1px solid var(--envision-t2-color-border-subtle-default); padding:0 8px;">
      <envision-tab label="Customize" selected></envision-tab>
      <envision-tab label="Packages"></envision-tab>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const tabs = [...canvasElement.querySelectorAll('envision-tab')] as (HTMLElement & { shadowRoot: ShadowRoot; selected: boolean })[];
    const firstBtn = tabs[0].shadowRoot.querySelector('button') as HTMLButtonElement;
    firstBtn.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1].selected).toBe(true);
    await expect(tabs[0].selected).toBe(false);
  },
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div role="tablist" style="display:flex; gap:8px;">
      <envision-tab label="Customize" selected></envision-tab>
      <envision-tab label="Packages"></envision-tab>
      <envision-tab label="History" disabled></envision-tab>
    </div>
  `,
};
