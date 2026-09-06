import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

const options = [
  { id: 'shaker', name: 'Beadboard Shaker', color: '#c9b28a' },
  { id: 'flat', name: 'Flat Panel', color: '#5b4636' },
];

interface Args {
  title: string;
  note: string;
  value: string;
  active: boolean;
  pricePending: boolean;
  onOpen: (e: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Inputs & Selection/Card-Option',
  component: 'envision-option-card',
  tags: ['autodocs'],
  // This component previously had no controls: every state was its own hard-coded story, so the
  // only way to see an upgrade note or an open tray was to navigate to a separate page. The args
  // below make each state reachable from one page, which is why the state pages are now hidden.
  argTypes: {
    title: { control: 'text' },
    note: { control: 'text', description: 'Styles as an upgrade when it is not "Included".' },
    value: { control: 'inline-radio', options: ['shaker', 'flat'] },
    active: { control: 'boolean', description: 'Reflects the selection tray being open.' },
    pricePending: { control: 'boolean' },
    onOpen: { action: 'open', table: { category: 'Events' } },
  },
  args: { title: 'Cabinet Style', note: 'Included', value: 'shaker', active: false, pricePending: false, onOpen: fn() },
  render: (a) => html`
    <div style="width:340px;">
      <envision-option-card
        title=${a.title}
        note=${a.note}
        .options=${options}
        value=${a.value}
        ?active=${a.active}
        ?price-pending=${a.pricePending}
        @open=${a.onOpen}
      ></envision-option-card>
    </div>
  `,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Selection-row opener in the RightRail, `<envision-option-card>`. The **whole card is a single `<button>`** (no nested interactive); it shows the current option thumb + title + note and opens the selection tray. `active` reflects the tray being open; the note styles as an upgrade when it isn’t "Included".' } },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

// Hidden from the sidebar (`!dev`): each is one card with a prop flipped, reached from Default via
// the controls. Still indexed, so the docs page embeds them and visual regression covers them.
export const Upgrade: Story = {
  tags: ['!dev'],
  name: 'Upgrade note',
  args: { title: 'Countertop', note: '+$1,200', value: 'flat' },
};

export const Active: Story = {
  tags: ['!dev'],
  name: 'Active (tray open)',
  args: { title: 'Hardware', note: '+$85', active: true },
};

export const PricePending: Story = {
  tags: ['!dev'],
  name: 'Price pending',
  args: { title: 'Backsplash', note: '+$300', pricePending: true },
};

/** A realistic stack of selection rows in the RightRail. */
export const RealUseCase_Stack: Story = {
  name: 'Realistic: selection stack',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="width:340px; display:grid; gap:8px;">
      <envision-option-card title="Cabinet Style" note="Included" .options=${options} value="shaker" @open=${fn()}></envision-option-card>
      <envision-option-card title="Cabinet Finish" note="+$120" .options=${options} value="flat" @open=${fn()}></envision-option-card>
      <envision-option-card title="Countertop" note="+$1,200" active .options=${options} value="flat" @open=${fn()}></envision-option-card>
    </div>
  `,
};
