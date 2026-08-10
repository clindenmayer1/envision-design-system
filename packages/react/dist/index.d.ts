/**
 * @envision/react — thin React wrappers over the Envision custom elements.
 *
 * Importing this registers the elements (via @envision/components) and exposes each component
 * under its MEANINGFUL name (Button, Input, OptionCard…). Prop TYPES mirror the element contracts
 * for editor ergonomics; there is no behavioral logic here (see createComponent).
 *
 * Consumers still load tokens once:  import '@envision/tokens/css';
 */
import '@envision/components';
import { type EnvisionReactBaseProps } from './createComponent.js';
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
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface IconButtonProps extends EnvisionReactBaseProps {
    icon: string;
    accessibleName: string;
    variant?: 'standard' | 'subtle';
    selected?: boolean;
    disabled?: boolean;
    tooltip?: string;
    onClick?: EventHandler;
}
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface LinkProps extends EnvisionReactBaseProps {
    href: string;
    label: string;
    variant?: 'inline' | 'standalone';
    directionIcon?: boolean;
    disabled?: boolean;
}
export declare const Link: import("react").ForwardRefExoticComponent<LinkProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface LabelProps extends EnvisionReactBaseProps {
    text: string;
    htmlFor: string;
    required?: boolean;
    helpIcon?: boolean;
}
export declare const Label: import("react").ForwardRefExoticComponent<LabelProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface BadgeProps extends EnvisionReactBaseProps {
    tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'error';
    shape?: 'count' | 'dot';
    count?: number;
    max?: number;
    label?: string;
}
export declare const Badge: import("react").ForwardRefExoticComponent<BadgeProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface CheckboxProps extends EnvisionReactBaseProps {
    checked?: boolean;
    label: string;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    onChange?: EventHandler;
}
export declare const Checkbox: import("react").ForwardRefExoticComponent<CheckboxProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface SwitchProps extends EnvisionReactBaseProps {
    checked?: boolean;
    label: string;
    disabled?: boolean;
    onChange?: EventHandler;
}
export declare const Switch: import("react").ForwardRefExoticComponent<SwitchProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
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
export declare const Input: import("react").ForwardRefExoticComponent<InputProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface RadioProps extends EnvisionReactBaseProps {
    checked?: boolean;
    name: string;
    value: string;
    label: string;
    disabled?: boolean;
    onChange?: EventHandler;
}
export declare const Radio: import("react").ForwardRefExoticComponent<RadioProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface TabProps extends EnvisionReactBaseProps {
    label: string;
    selected?: boolean;
    disabled?: boolean;
    panel?: string;
    onSelect?: EventHandler;
}
export declare const Tab: import("react").ForwardRefExoticComponent<TabProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export interface MaterialSwatchProps extends EnvisionReactBaseProps {
    name?: string;
    finish?: string;
    /** Display string such as "Included" or "+$120"; the caller formats it. */
    price?: string;
    /** Texture URL (preferred) or a solid product colour. Product data, never a token. */
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
export declare const MaterialSwatch: import("react").ForwardRefExoticComponent<MaterialSwatchProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
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
export declare const OptionCard: import("react").ForwardRefExoticComponent<OptionCardProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
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
export declare const PackageCard: import("react").ForwardRefExoticComponent<PackageCardProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
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
export declare const RightRail: import("react").ForwardRefExoticComponent<RightRailProps & EnvisionReactBaseProps & import("react").RefAttributes<HTMLElement>>;
export { createComponent } from './createComponent.js';
export type { EnvisionReactBaseProps } from './createComponent.js';
//# sourceMappingURL=index.d.ts.map