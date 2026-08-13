/**
 * @envision/react — thin React wrappers over the Envision custom elements.
 *
 * Importing this registers the elements (via @envision/components) and exposes each component
 * under its MEANINGFUL name (Button, Input, OptionCard…). Prop TYPES mirror the element contracts
 * for editor ergonomics; there is no behavioral logic here (see createComponent).
 *
 * Consumers still load tokens once:  import '@envision/tokens/css';
 */
import '@envision/components'; // side effect: define all <envision-*> elements
import { createComponent, type EnvisionReactBaseProps } from './createComponent.js';

type EventHandler = (e: Event) => void;

export interface ButtonProps extends EnvisionReactBaseProps {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  leadingIcon?: string;
  trailingIcon?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: EventHandler;
}
export const Button = createComponent<ButtonProps>('envision-button');

export interface IconButtonProps extends EnvisionReactBaseProps {
  icon: string;
  accessibleName: string;
  variant?: 'standard' | 'subtle';
  selected?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick?: EventHandler;
}
export const IconButton = createComponent<IconButtonProps>('envision-icon-button');

export interface LinkProps extends EnvisionReactBaseProps {
  href: string;
  label: string;
  variant?: 'inline' | 'standalone';
  directionIcon?: boolean;
  disabled?: boolean;
}
export const Link = createComponent<LinkProps>('envision-link');

export interface LabelProps extends EnvisionReactBaseProps {
  text: string;
  htmlFor: string;
  required?: boolean;
  helpIcon?: boolean;
}
export const Label = createComponent<LabelProps>('envision-label');

export interface BadgeProps extends EnvisionReactBaseProps {
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'error';
  shape?: 'count' | 'dot';
  count?: number;
  max?: number;
  label?: string;
}
export const Badge = createComponent<BadgeProps>('envision-badge');

export interface CheckboxProps extends EnvisionReactBaseProps {
  checked?: boolean;
  label: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  onChange?: EventHandler;
}
export const Checkbox = createComponent<CheckboxProps>('envision-checkbox');

export interface SwitchProps extends EnvisionReactBaseProps {
  checked?: boolean;
  label: string;
  disabled?: boolean;
  onChange?: EventHandler;
}
export const Switch = createComponent<SwitchProps>('envision-switch');

export interface InputProps extends EnvisionReactBaseProps {
  type?: 'text' | 'email' | 'search' | 'number' | 'price' | 'password';
  value?: string;
  label: string;
  helperText?: string;
  errorMessage?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  placeholder?: string;
  onInput?: EventHandler;
  onChange?: EventHandler;
}
export const Input = createComponent<InputProps>('envision-input');

export interface RadioProps extends EnvisionReactBaseProps {
  checked?: boolean;
  name: string;
  value: string;
  label: string;
  disabled?: boolean;
  onChange?: EventHandler;
}
export const Radio = createComponent<RadioProps>('envision-radio');

export interface TabProps extends EnvisionReactBaseProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  panel?: string;
  onSelect?: EventHandler;
}
export const Tab = createComponent<TabProps>('envision-tab');

/* --------------------------------------------------------------------------------------------
 * Product components. Identical thin bridge to everything above: camelCase props become
 * kebab-case attributes, `on*` props become custom-element listeners, no behaviour is duplicated.
 * `option` / `options` / `pkg` are product-data OBJECTS, so they are assigned as element
 * properties through a ref rather than serialised to attributes.
 * ------------------------------------------------------------------------------------------ */

export interface MaterialSwatchProps extends EnvisionReactBaseProps {
  name?: string;
  finish?: string;
  /** Display string such as "Included" or "+$120"; the caller formats it. */
  price?: string;
  /** Texture URL (preferred) or a solid product color. Product data, never a token. */
  image?: string;
  color?: string;
  selected?: boolean;
  unavailable?: boolean;
  /** Fill the grid cell instead of the fixed chip size (rail + trays). */
  fluid?: boolean;
  /** 'circle' presents rendered spherical materials such as metal finishes. */
  shape?: 'square' | 'circle';
  /** Show selection as the ring alone, with no check badge. */
  hideCheck?: boolean;
  /** Optional visible caption under the swatch. */
  label?: string;
  onSelect?: EventHandler;
}
export const MaterialSwatch = createComponent<MaterialSwatchProps>('envision-material-swatch');

export interface OptionCardProps extends EnvisionReactBaseProps {
  title?: string;
  note?: string;
  /** This row's tray is open. */
  active?: boolean;
  loading?: boolean;
  pricePending?: boolean;
  thumbImage?: string;
  thumbColor?: string;
  /** 'portrait' matches the product's door/faucet tiles. */
  thumbShape?: 'square' | 'portrait';
  /** Fired when the row is activated; the host opens the matching tray. */
  onOpen?: EventHandler;
}
export const OptionCard = createComponent<OptionCardProps>('envision-option-card');

export interface PackageCardProps extends EnvisionReactBaseProps {
  name?: string;
  description?: string;
  price?: string;
  image?: string;
  popular?: boolean;
  selected?: boolean;
  onSelect?: EventHandler;
  onCustomize?: EventHandler;
}
export const PackageCard = createComponent<PackageCardProps>('envision-package-card');

export interface RightRailProps extends EnvisionReactBaseProps {
  mode?: 'customize' | 'packages';
  /** Optional; with no heading the rail reserves no title space. */
  heading?: string;
  loading?: boolean;
  /** Force sheet presentation; otherwise automatic below 1024px. */
  sheet?: boolean;
  open?: boolean;
  onModechange?: EventHandler;
  onApply?: EventHandler;
  onClose?: EventHandler;
}
export const RightRail = createComponent<RightRailProps>('envision-right-rail');

export { createComponent } from './createComponent.js';
export type { EnvisionReactBaseProps } from './createComponent.js';
