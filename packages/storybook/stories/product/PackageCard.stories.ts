import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const mats = [
  { id: '1', name: 'a', color: '#5b4636' }, { id: '2', name: 'b', color: '#c9b28a' },
  { id: '3', name: 'c', color: '#26364a' }, { id: '4', name: 'd', color: '#8a8a82' },
];
const pkg = { id: 'heritage', name: 'Heritage Package', priceLabel: '+$126/mo', materials: mats };
const pkgPopular = { ...pkg, id: 'modern', name: 'Modern Farmhouse', popular: true };

interface Args {
  name: string;
  priceLabel: string;
  popular: boolean;
  selected: boolean;
  onSelect: (e: Event) => void;
  onCustomize: (e: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Inputs & Selection/Card-Package',
  component: 'envision-package-card',
  tags: ['autodocs'],
  // This component previously had no controls: selected, popular and the long-name content extreme
  // were separate hard-coded stories. The args below rebuild `pkg` per render so each is reachable
  // from one page, which is why those pages are now hidden from the sidebar.
  argTypes: {
    name: { control: 'text', description: 'A long name line-clamps to two lines.' },
    priceLabel: { control: 'text' },
    popular: { control: 'boolean', description: 'Shows the popular badge.' },
    selected: { control: 'boolean' },
    onSelect: { action: 'select', table: { category: 'Events' } },
    onCustomize: { action: 'customize', table: { category: 'Events' } },
  },
  args: {
    name: 'Heritage Package',
    priceLabel: '+$126/mo',
    popular: false,
    selected: false,
    onSelect: fn(),
    onCustomize: fn(),
  },
  render: (a) => html`
    <div style="width:260px;">
      <envision-package-card
        .pkg=${{ id: 'heritage', name: a.name, priceLabel: a.priceLabel, materials: mats, popular: a.popular }}
        ?selected=${a.selected}
        @select=${a.onSelect}
        @customize=${a.onCustomize}
      ></envision-package-card>
    </div>
  `,
  parameters: {
    docs: { description: { component: 'Curated design-package card, `<envision-package-card>`. A real select `<button>` plus a **separate** Customize `<button>` (never a div-as-button, never nested buttons). Carries the image lifecycle (shimmer → ready → error), a popular badge, and a material preview capped at 5. `pkg` is a JS property.' } },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

// Hidden from the sidebar (`!dev`): each flips one prop, reached from Default via the controls.
// Still indexed, so the docs page embeds them and visual regression covers them.
export const Selected: Story = { tags: ['!dev'], args: { selected: true } };

export const Popular: Story = { tags: ['!dev'], args: { name: 'Modern Farmhouse', popular: true } };

/** Content extreme: a long package name line-clamps to two lines. */
export const LongName: Story = {
  tags: ['!dev'],
  args: { name: 'The Grand Coastal Transitional Statement Collection, Signature Edition' },
};

/** Realistic: the Packages tab grid. */
export const RealUseCase_Grid: Story = {
  name: 'Realistic: packages grid',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => html`
    <div style="display:grid; grid-template-columns:repeat(2, 240px); gap:16px;">
      <envision-package-card .pkg=${pkgPopular} selected @select=${fn()} @customize=${fn()}></envision-package-card>
      <envision-package-card .pkg=${pkg} @select=${fn()} @customize=${fn()}></envision-package-card>
    </div>
  `,
};
