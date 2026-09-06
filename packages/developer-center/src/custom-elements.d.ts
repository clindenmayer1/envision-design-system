/**
 * JSX typings for the real Envision custom elements.
 *
 * These are the production elements registered by @envision/components. Declaring them here lets
 * documentation pages render the actual component in JSX, which is what makes every live example
 * on this site genuine rather than a re-implementation.
 *
 * Attribute names are the element's real observed attributes (kebab-case), so a typo fails to
 * compile instead of silently rendering an unstyled element.
 */
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type EL<T = Record<string, unknown>> = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & T;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'envision-button': EL<{
        variant?: 'primary' | 'outline' | 'ghost';
        size?: 'sm' | 'md' | 'lg';
        label?: string;
        'leading-icon'?: string;
        'trailing-icon'?: string;
        disabled?: boolean;
        loading?: boolean;
        'full-width'?: boolean;
      }>;
      'envision-icon-button': EL<{
        icon?: string;
        'accessible-name'?: string;
        variant?: 'standard' | 'subtle';
        selected?: boolean;
        disabled?: boolean;
      }>;
      'envision-badge': EL<{ tone?: string; shape?: string; count?: number | string; max?: number | string; label?: string }>;
      'envision-input': EL<{
        type?: string; label?: string; value?: string; placeholder?: string;
        'helper-text'?: string; 'error-message'?: string; 'leading-icon'?: string;
        invalid?: boolean; required?: boolean; disabled?: boolean;
      }>;
      'envision-label': EL<{ text?: string; 'html-for'?: string; required?: boolean; 'help-icon'?: boolean }>;
      'envision-checkbox': EL<{ label?: string; checked?: boolean; disabled?: boolean; required?: boolean; invalid?: boolean }>;
      'envision-radio': EL<{ label?: string; name?: string; value?: string; checked?: boolean; disabled?: boolean }>;
      'envision-switch': EL<{ label?: string; checked?: boolean; disabled?: boolean }>;
      'envision-link': EL<{ href?: string; label?: string; variant?: 'inline' | 'standalone'; disabled?: boolean; 'direction-icon'?: boolean }>;
      'envision-tab': EL<{ label?: string; selected?: boolean; disabled?: boolean; panel?: string }>;
      'envision-material-swatch': EL<{ selected?: boolean; unavailable?: boolean }>;
      'envision-option-card': EL<{ title?: string; note?: string; value?: string; active?: boolean; 'price-pending'?: boolean }>;
      'envision-package-card': EL<{ selected?: boolean }>;
      /* Its crumbs are an array, so they are set as a property rather than an attribute. */
      'envision-breadcrumbs': EL<Record<string, never>>;
      'envision-right-rail': EL<{ heading?: string; loading?: boolean; sheet?: boolean; open?: boolean }>;
    }
  }
}

export {};
