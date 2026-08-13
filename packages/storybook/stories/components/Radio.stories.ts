import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn, expect, userEvent } from '@storybook/test';

const meta: Meta = {
  title: 'Components/Inputs & Selection/Radio',
  component: 'envision-radio',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Single choice within a group, `<envision-radio>`. Because separate custom elements do not group natively, Radio coordinates by `name` within its root: selecting one deselects same-name siblings, and Arrow / Home / End implement the APG roving-tabindex pattern. The selected dot is a filled shape, not color-only.' } } },
};
export default meta;
type Story = StoryObj;

/** A radio group. Arrow keys move + select within the group. */
export const Group: Story = {
  render: () => html`
    <div role="radiogroup" aria-label="Countertop" style="display:grid; gap:10px;">
      <envision-radio name="counter" value="quartz" label="Quartz" checked @change=${fn()}></envision-radio>
      <envision-radio name="counter" value="granite" label="Granite" @change=${fn()}></envision-radio>
      <envision-radio name="counter" value="marble" label="Marble (+$1,200)" @change=${fn()}></envision-radio>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const radios = [...canvasElement.querySelectorAll('envision-radio')] as (HTMLElement & { shadowRoot: ShadowRoot; checked: boolean })[];
    (radios[0].shadowRoot.querySelector('input') as HTMLInputElement).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(radios[1].checked).toBe(true);
    await expect(radios[0].checked).toBe(false);
  },
};

export const WithDisabledOption: Story = {
  render: () => html`
    <div role="radiogroup" aria-label="Delivery" style="display:grid; gap:10px;">
      <envision-radio name="d" value="standard" label="Standard" checked></envision-radio>
      <envision-radio name="d" value="express" label="Express"></envision-radio>
      <envision-radio name="d" value="white-glove" label="White-glove (unavailable)" disabled></envision-radio>
    </div>
  `,
};
