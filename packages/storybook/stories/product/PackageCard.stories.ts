import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const mats = [
  { id: '1', name: 'a', color: '#5b4636' }, { id: '2', name: 'b', color: '#c9b28a' },
  { id: '3', name: 'c', color: '#26364a' }, { id: '4', name: 'd', color: '#8a8a82' },
];
const pkg = { id: 'heritage', name: 'Heritage Package', priceLabel: '+$126/mo', materials: mats };
const pkgPopular = { ...pkg, id: 'modern', name: 'Modern Farmhouse', popular: true };

const meta: Meta = {
  title: 'Components/Inputs & Selection/PackageCard',
  component: 'envision-package-card',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Curated design-package card, `<envision-package-card>`. A real select `<button>` plus a **separate** Customize `<button>` (never a div-as-button, never nested buttons). Carries the image lifecycle (shimmer → ready → error), a popular badge, and a material preview capped at 5. `pkg` is a JS property.' } },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<div style="width:260px;"><envision-package-card .pkg=${pkg} @select=${fn()} @customize=${fn()}></envision-package-card></div>`,
};

export const Selected: Story = {
  render: () => html`<div style="width:260px;"><envision-package-card .pkg=${pkg} selected @select=${fn()} @customize=${fn()}></envision-package-card></div>`,
};

export const Popular: Story = {
  render: () => html`<div style="width:260px;"><envision-package-card .pkg=${pkgPopular} @select=${fn()} @customize=${fn()}></envision-package-card></div>`,
};

/** Content extreme: a long package name line-clamps to two lines. */
export const LongName: Story = {
  render: () => html`<div style="width:260px;"><envision-package-card .pkg=${{ ...pkg, name: 'The Grand Coastal Transitional Statement Collection, Signature Edition' }} @select=${fn()} @customize=${fn()}></envision-package-card></div>`,
};

/** Realistic: the Packages tab grid. */
export const RealUseCase_Grid: Story = {
  name: 'Realistic: packages grid',
  parameters: { layout: 'padded' },
  render: () => html`
    <div style="display:grid; grid-template-columns:repeat(2, 240px); gap:16px;">
      <envision-package-card .pkg=${pkgPopular} selected @select=${fn()} @customize=${fn()}></envision-package-card>
      <envision-package-card .pkg=${pkg} @select=${fn()} @customize=${fn()}></envision-package-card>
    </div>
  `,
};
