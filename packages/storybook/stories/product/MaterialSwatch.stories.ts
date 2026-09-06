import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const walnut = { id: 'walnut', name: 'Matte Walnut', finish: 'Matte', priceLabel: '+$120', color: '#5b4636' };
const oak = { id: 'oak', name: 'White Oak', finish: 'Natural', priceLabel: 'Included', color: '#c9b28a' };
const navy = { id: 'navy', name: 'Deep Navy', finish: 'Satin', priceLabel: '+$180', color: '#26364a' };

const MATERIALS: Record<string, typeof walnut> = { walnut, oak, navy };

interface Args {
  material: 'walnut' | 'oak' | 'navy';
  selected: boolean;
  unavailable: boolean;
  onSelect: (e: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Inputs & Selection/MaterialSwatch',
  component: 'envision-material-swatch',
  tags: ['autodocs'],
  // This component previously had no controls: selected and unavailable were separate hard-coded
  // stories. The args below make both reachable from one page, which is why those pages are hidden.
  argTypes: {
    material: {
      control: 'inline-radio',
      options: ['walnut', 'oak', 'navy'],
      description: 'Product data bound to the `option` property. The fill is real material data, never a token.',
    },
    selected: { control: 'boolean', description: 'Signaled by a ring plus a check, never color alone.' },
    unavailable: { control: 'boolean' },
    onSelect: { action: 'select', table: { category: 'Events' } },
  },
  args: { material: 'walnut', selected: false, unavailable: false, onSelect: fn() },
  render: (a) => html`
    <envision-material-swatch
      .option=${MATERIALS[a.material]}
      ?selected=${a.selected}
      ?unavailable=${a.unavailable}
      @select=${a.onSelect}
    ></envision-material-swatch>
  `,
  parameters: { docs: { description: { component: 'Selectable material or finish chip, `<envision-material-swatch>`. The fill is **product data** (image/texture/color), set inline, never a token. Selection is signaled by a **ring + check** (not color-only); the accessible name is material + finish + price. `option` is a JS property.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

// Hidden from the sidebar (`!dev`): each flips one prop, reached from Default via the controls.
// Still indexed, so the docs page embeds them and visual regression covers them.
export const Selected: Story = { tags: ['!dev'], args: { selected: true } };

export const Unavailable: Story = { tags: ['!dev'], args: { material: 'navy', unavailable: true } };

/** Realistic: a finish group with one selected (ring + check) and one unavailable. */
export const RealUseCase_FinishGroup: Story = {
  name: 'Realistic: finish group',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:16px; padding:8px;">
      <envision-material-swatch .option=${oak} selected @select=${fn()}></envision-material-swatch>
      <envision-material-swatch .option=${walnut} @select=${fn()}></envision-material-swatch>
      <envision-material-swatch .option=${navy} unavailable @select=${fn()}></envision-material-swatch>
    </div>
  `,
};
