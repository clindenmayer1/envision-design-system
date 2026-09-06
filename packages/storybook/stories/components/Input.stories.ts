import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

interface Args {
  type: 'text' | 'email' | 'search' | 'number' | 'price' | 'password';
  value?: string;
  label: string;
  helperText?: string;
  errorMessage?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  placeholder?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  onInput: (e: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Inputs & Selection/Field',
  component: 'envision-input',
  tags: ['autodocs'],
  argTypes: {
    // inline-radio, not select: enum controls read as one horizontal switcher site-wide, which is
    // how a reader moves between a component's variants now that each is no longer its own page.
    type: { control: 'inline-radio', options: ['text', 'email', 'search', 'number', 'price', 'password'] },
    value: { control: 'text' },
    label: { control: 'text', description: 'Persistent label (a placeholder is NOT a label).' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    leadingIcon: { control: 'text', description: 'Material Symbols name rendered before the value.' },
    trailingIcon: { control: 'text', description: 'Material Symbols name rendered after the value.' },
    onInput: { action: 'input', table: { category: 'Events' } },
  },
  args: { type: 'text', label: 'Full name', invalid: false, required: false, disabled: false },
  render: (a) => html`
    <div style="width:320px;">
      <envision-input
        type=${a.type}
        label=${a.label}
        value=${ifDefined(a.value)}
        helper-text=${ifDefined(a.helperText || undefined)}
        error-message=${ifDefined(a.errorMessage || undefined)}
        placeholder=${ifDefined(a.placeholder || undefined)}
        leading-icon=${ifDefined(a.leadingIcon || undefined)}
        trailing-icon=${ifDefined(a.trailingIcon || undefined)}
        ?invalid=${a.invalid}
        ?required=${a.required}
        ?disabled=${a.disabled}
        @input=${a.onInput}
      ></envision-input>
    </div>
  `,
  parameters: { docs: { description: { component: 'Text field, `<envision-input>`. A persistent `<label>` is associated by id; `aria-invalid` / `aria-required` / `aria-describedby` wire the error & helper text. `type="price"` uses a decimal inputmode.' } } },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

/**
 * The stories below are hidden from the sidebar with `tags: ['!dev']`. Each is a single field with
 * one prop flipped, so it is reached from Default via the controls instead of its own page. They
 * remain indexed: the docs page still embeds them and visual regression still screenshots them.
 */
export const WithHelperText: Story = { tags: ['!dev'], args: { label: 'Email', type: 'email', helperText: "We'll only use this to send your selections." } };

/** Validation and error: `invalid` shows the error message and wires aria-invalid + aria-describedby. */
export const Invalid: Story = { tags: ['!dev'], args: { label: 'Email', type: 'email', value: 'not-an-email', invalid: true, errorMessage: 'Enter a valid email address.' } };

export const Required: Story = { tags: ['!dev'], args: { label: 'Home address', required: true } };

export const Disabled: Story = { tags: ['!dev'], args: { label: 'Plan (locked)', value: 'Westlake, The Sonoma', disabled: true } };

export const WithLeadingIcon: Story = { tags: ['!dev'], args: { label: 'Search finishes', type: 'search', leadingIcon: 'search', placeholder: 'e.g. matte walnut' } };

/**
 * Either end of the field can carry an icon, and they do different jobs. A leading icon labels the
 * field's subject and is decorative; a trailing icon is usually a status or an affordance, so if it
 * can be acted on it needs a real control, not a glyph. Both are hidden from assistive technology:
 * the persistent label is what names the field.
 */
export const WithIcons: Story = {
  args: { label: 'Search finishes', type: 'search', leadingIcon: 'search', trailingIcon: 'close', placeholder: 'e.g. matte walnut' },
};

/** The full state matrix on one page: the "state library" view. */
export const StateMatrix: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => html`
    <div style="display:grid; gap:20px; width:320px;">
      <envision-input label="Empty" placeholder="Placeholder"></envision-input>
      <envision-input label="Filled" value="Ada Lovelace"></envision-input>
      <envision-input label="With helper" helper-text="Optional field"></envision-input>
      <envision-input label="Required" required></envision-input>
      <envision-input label="Invalid" value="bad@" invalid error-message="Enter a valid email."></envision-input>
      <envision-input label="Disabled" value="Locked" disabled></envision-input>
      <envision-input label="Price" type="price" placeholder="0.00"></envision-input>
    </div>
  `,
};
