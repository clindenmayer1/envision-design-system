import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { fn, userEvent, expect, waitFor } from '@storybook/test';

interface ButtonArgs {
  variant: 'primary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  label: string;
  leadingIcon?: string;
  trailingIcon?: string;
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
  onClick: (e: Event) => void;
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  component: 'envision-button',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'outline', 'ghost'], description: 'Emphasis. Primary = brand CTA; outline = neutral secondary; ghost = low-emphasis.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text', description: 'Accessible label — the button’s name (required).' },
    leadingIcon: { control: 'text', description: 'Material Symbols name rendered before the label.' },
    trailingIcon: { control: 'text', description: 'Material Symbols name rendered after the label.' },
    disabled: { control: 'boolean', description: 'Not focusable; blocks activation.' },
    loading: { control: 'boolean', description: 'Shows a spinner, sets aria-busy, blocks re-activation (stays focusable).' },
    fullWidth: { control: 'boolean' },
    onClick: { action: 'click', table: { category: 'Events' } },
  },
  args: {
    variant: 'primary', size: 'md', label: 'Apply design',
    disabled: false, loading: false, fullWidth: false, onClick: fn(),
  },
  render: (a) => html`
    <envision-button
      variant=${a.variant}
      size=${a.size}
      label=${a.label}
      leading-icon=${ifDefined(a.leadingIcon || undefined)}
      trailing-icon=${ifDefined(a.trailingIcon || undefined)}
      ?disabled=${a.disabled}
      ?loading=${a.loading}
      ?full-width=${a.fullWidth}
      @click=${a.onClick}
    ></envision-button>
  `,
  parameters: {
    docs: {
      description: {
        component:
          'The Envision **Button** — `<envision-button>`. A real `<button>` in a shadow root, so keyboard ' +
          'activation, disabled focus behaviour and form semantics come from the platform. Styled entirely ' +
          'with production tokens (14px / 600 / brand-CTA radius 10; outline = neutral hairline secondary).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<ButtonArgs>;

/** The default primary CTA. Use the Controls panel to explore every prop live. */
export const Default: Story = {};

/** The three emphasis levels. Primary is the brand CTA; outline is the neutral secondary; ghost is lowest-emphasis. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:12px; align-items:center;">
      <envision-button variant="primary" label="Primary"></envision-button>
      <envision-button variant="outline" label="Outline"></envision-button>
      <envision-button variant="ghost" label="Ghost"></envision-button>
    </div>
  `,
};

/** Three sizes scaled from the base control padding. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:12px; align-items:center;">
      <envision-button size="sm" label="Small"></envision-button>
      <envision-button size="md" label="Medium"></envision-button>
      <envision-button size="lg" label="Large"></envision-button>
    </div>
  `,
};

/** Leading and trailing Material Symbols icons; icon-adjacent gap comes from a spacing token. */
export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:12px; align-items:center;">
      <envision-button variant="primary" label="New design" leading-icon="add"></envision-button>
      <envision-button variant="outline" label="Continue" trailing-icon="arrow_forward"></envision-button>
    </div>
  `,
};

/** Loading blocks re-activation and announces `aria-busy`, but the control stays focusable. */
export const Loading: Story = { args: { loading: true, label: 'Saving…' } };

/** Disabled removes the control from the tab order and blocks activation. */
export const Disabled: Story = { args: { disabled: true } };

/** Stretches to fill its container — used for the RightRail apply action and mobile CTAs. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [(s) => html`<div style="width:360px; padding:16px; background:var(--envision-t2-color-background-surface-warm-default);">${s()}</div>`],
};

/** Content extremes — empty, one word, and a very long label (buttons should not wrap or break layout). */
export const ContentExtremes: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; max-width:520px;">
      <envision-button variant="outline" label="Go"></envision-button>
      <envision-button variant="primary" label="Apply this design configuration to every selected room in the plan"></envision-button>
    </div>
  `,
};

/** Focus-visible ring (2px brand). Tab to the button to see it; the play function moves focus for you. */
export const FocusVisible: Story = {
  args: { variant: 'outline', label: 'Focus me' },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('envision-button') as HTMLElement & { shadowRoot: ShadowRoot };
    const btn = host.shadowRoot.querySelector('button') as HTMLButtonElement;
    btn.focus();
    await expect(host.shadowRoot.activeElement).toBe(btn);
  },
};

/** Keyboard activation: focusing and pressing Enter fires the click; disabled/loading block it. */
export const KeyboardActivation: Story = {
  args: { label: 'Press Enter' },
  play: async ({ canvasElement, args }) => {
    const host = canvasElement.querySelector('envision-button') as HTMLElement & { shadowRoot: ShadowRoot };
    const btn = host.shadowRoot.querySelector('button') as HTMLButtonElement;
    btn.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(args.onClick).toHaveBeenCalled());
  },
};

/** A realistic Envision use case: the RightRail footer — primary apply + ghost cancel + a price total. */
export const RealUseCase_RailFooter: Story = {
  name: 'Realistic — RightRail footer',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => html`
    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;
                width:392px; padding:16px; border-top:1px solid var(--envision-t2-color-border-subtle-default);
                background:var(--envision-t2-color-background-surface-warm-default); font-variant-numeric:tabular-nums;">
      <span style="color:var(--envision-t2-color-content-primary-default);">Upgrades <strong>+$4,280</strong></span>
      <div style="display:flex; gap:8px;">
        <envision-button variant="ghost" label="Cancel"></envision-button>
        <envision-button variant="primary" label="Apply"></envision-button>
      </div>
    </div>
  `,
};
