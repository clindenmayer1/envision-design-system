import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const options = [
  { id: 'shaker', name: 'Beadboard Shaker', color: '#c9b28a' },
  { id: 'flat', name: 'Flat Panel', color: '#5b4636' },
];

const meta: Meta = {
  title: 'Product Components/OptionCard',
  component: 'envision-option-card',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Selection-row opener in the RightRail — `<envision-option-card>`. The **whole card is a single `<button>`** (no nested interactive); it shows the current option thumb + title + note and opens the selection tray. `active` reflects the tray being open; the note styles as an upgrade when it isn’t "Included".' } },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<div style="width:340px;"><envision-option-card title="Cabinet Style" note="Included" .options=${options} value="shaker" @open=${fn()}></envision-option-card></div>`,
};

export const Upgrade: Story = {
  name: 'Upgrade note',
  render: () => html`<div style="width:340px;"><envision-option-card title="Countertop" note="+$1,200" .options=${options} value="flat" @open=${fn()}></envision-option-card></div>`,
};

export const Active: Story = {
  name: 'Active (tray open)',
  render: () => html`<div style="width:340px;"><envision-option-card title="Hardware" note="+$85" active .options=${options} value="shaker" @open=${fn()}></envision-option-card></div>`,
};

export const PricePending: Story = {
  name: 'Price pending',
  render: () => html`<div style="width:340px;"><envision-option-card title="Backsplash" note="+$300" price-pending .options=${options} value="shaker" @open=${fn()}></envision-option-card></div>`,
};

/** A realistic stack of selection rows in the RightRail. */
export const RealUseCase_Stack: Story = {
  name: 'Realistic — selection stack',
  render: () => html`
    <div style="width:340px; display:grid; gap:8px;">
      <envision-option-card title="Cabinet Style" note="Included" .options=${options} value="shaker" @open=${fn()}></envision-option-card>
      <envision-option-card title="Cabinet Finish" note="+$120" .options=${options} value="flat" @open=${fn()}></envision-option-card>
      <envision-option-card title="Countertop" note="+$1,200" active .options=${options} value="flat" @open=${fn()}></envision-option-card>
    </div>
  `,
};
