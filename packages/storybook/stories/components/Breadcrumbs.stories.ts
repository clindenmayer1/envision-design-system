import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';

interface Item { label: string; href?: string }
interface Args {
  items: Item[];
  label: string;
  onNavigate: (e: Event) => void;
}

const TRAIL: Item[] = [
  { label: 'Envision Design System', href: '/' },
  { label: 'Design Tokens', href: '/tokens' },
  { label: 'Token architecture' },
];

const meta: Meta<Args> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: 'envision-breadcrumbs',
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description:
        'The trail, root first. A JS PROPERTY, not an attribute: it carries objects. The last ' +
        'entry is rendered as the current page.',
    },
    label: { control: 'text', description: 'Accessible name for the nav landmark.' },
    onNavigate: { action: 'navigate', table: { category: 'Events' } },
  },
  args: { items: TRAIL, label: 'Breadcrumb', onNavigate: fn() },
  render: (a) => html`
    <envision-breadcrumbs .items=${a.items} label=${a.label} @navigate=${a.onNavigate}></envision-breadcrumbs>
  `,
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumbs, `<envision-breadcrumbs>`. Renders a labeled `nav` landmark containing an ' +
          '`ol`; ancestors are real `<a href>` and the final item is text carrying ' +
          '`aria-current="page"`. Emits a cancelable `navigate` event so a single-page-app router ' +
          'can take over while keeping real anchors (and therefore open-in-new-tab).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

/** A two-level trail: one ancestor and the current page. */
export const TwoLevels: Story = {
  tags: ['!dev'],
  args: { items: [{ label: 'Components', href: '/components' }, { label: 'Button' }] },
};

/** A deep trail. It wraps rather than truncating, so no part of the path is hidden. */
export const Deep: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Envision Design System', href: '/' },
      { label: 'Components', href: '/components' },
      { label: 'Input & Control', href: '/components/category/input-control' },
      { label: 'MaterialSwatch', href: '/components/materialswatch' },
      { label: 'Accessibility' },
    ],
  },
};

/** A single item is just the current page: no links, no separators. */
export const CurrentPageOnly: Story = {
  tags: ['!dev'],
  args: { items: [{ label: 'Overview' }] },
};

/**
 * An intermediate step with no `href` renders as text rather than a dead link, for a grouping
 * level that is not itself a destination.
 */
export const NonLinkedAncestor: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Envision Design System', href: '/' },
      { label: 'Reference' },
      { label: 'Token reference' },
    ],
  },
};

/** Realistic: the trail as it appears on an Envision documentation page, in context. */
export const RealUseCase_PageHeader: Story = {
  name: 'Realistic: page header',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => html`
    <div style="display:grid; gap:20px; max-width:640px;">
      <envision-breadcrumbs
        .items=${TRAIL}
        @navigate=${(e: Event) => e.preventDefault()}
      ></envision-breadcrumbs>
      <h1 style="margin:0; font-size:48px; line-height:1.1; letter-spacing:-0.02em;">Token architecture</h1>
      <p style="margin:0; font-size:20px; line-height:1.55; color:var(--envision-t2-color-content-secondary-default);">
        Envision separates tokens into layers so that a decision can be changed at the level it was
        actually made.
      </p>
    </div>
  `,
};
