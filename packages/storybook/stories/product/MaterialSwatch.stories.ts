import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const walnut = { id: 'walnut', name: 'Matte Walnut', finish: 'Matte', priceLabel: '+$120', color: '#5b4636' };
const oak = { id: 'oak', name: 'White Oak', finish: 'Natural', priceLabel: 'Included', color: '#c9b28a' };
const navy = { id: 'navy', name: 'Deep Navy', finish: 'Satin', priceLabel: '+$180', color: '#26364a' };

const meta: Meta = {
  title: 'Components/Inputs & Selection/MaterialSwatch',
  component: 'envision-material-swatch',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Selectable material or finish chip, `<envision-material-swatch>`. The fill is **product data** (image/texture/color), set inline, never a token. Selection is signalled by a **ring + check** (not color-only); the accessible name is material + finish + price. `option` is a JS property.' } } },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<envision-material-swatch .option=${walnut} @select=${fn()}></envision-material-swatch>`,
};

export const Selected: Story = {
  render: () => html`<envision-material-swatch .option=${walnut} selected @select=${fn()}></envision-material-swatch>`,
};

export const Unavailable: Story = {
  render: () => html`<envision-material-swatch .option=${navy} unavailable @select=${fn()}></envision-material-swatch>`,
};

/** Realistic: a finish group with one selected (ring + check) and one unavailable. */
export const RealUseCase_FinishGroup: Story = {
  name: 'Realistic: finish group',
  render: () => html`
    <div style="display:flex; gap:16px; padding:8px;">
      <envision-material-swatch .option=${oak} selected @select=${fn()}></envision-material-swatch>
      <envision-material-swatch .option=${walnut} @select=${fn()}></envision-material-swatch>
      <envision-material-swatch .option=${navy} unavailable @select=${fn()}></envision-material-swatch>
    </div>
  `,
};
