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
export { createComponent } from './createComponent.js';
export type { EnvisionReactBaseProps } from './createComponent.js';
//# sourceMappingURL=index.d.ts.map