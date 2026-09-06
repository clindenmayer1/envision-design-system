/** Type surface for the Envision white-label theme runtime (lib/theme.mjs). */

export type RampStep = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type Ramp = Record<RampStep, string>;

/** A semantic role that derives from the brand ramp and may be overridden when it fails a gate. */
export type AllowedOverride =
  | '--envision-t2-color-border-focus-default'
  | '--envision-t2-color-content-brand-default'
  | '--envision-t2-color-content-brand-hover';

export interface Theme {
  id: string;
  name: string;
  version?: string;
  kind?: 'default' | 'builder' | 'example';
  description?: string;
  brand: {
    primary: Ramp;
    accent: Ramp;
    /** Content that sits on the brand ramp. A light brand must set this to dark ink. */
    contentOnBrand: string;
    fontFamily?: { display?: string; wordmark?: string };
  };
  overrides?: Partial<Record<AllowedOverride, string>>;
}

export interface ContrastResult {
  id: string;
  fg: string;
  bg: string;
  ratio: number | null;
  min: number;
  pass: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  results: ContrastResult[];
}

export declare const RAMP_STEPS: readonly RampStep[];
export declare const ALLOWED_OVERRIDES: readonly AllowedOverride[];
export declare const INVARIANTS: Readonly<{ surface: string; surfaceSunken: string; contentPrimary: string }>;

export declare function themeCssPropertyNames(): string[];
export declare function parseHex(hex: string): { r: number; g: number; b: number } | null;
export declare function relativeLuminance(hex: string): number | null;
export declare function contrastRatio(a: string, b: string): number | null;
export declare function themeToCssProps(theme: Theme): Record<string, string>;
export declare function themeToCss(theme: Theme, selector?: string): string;
/** Applies the brand layer to an element and returns a disposer that removes it again. */
export declare function applyTheme(theme: Theme, target?: HTMLElement): () => void;
export declare function validateTheme(
  theme: Theme,
  invariants?: { surface: string; surfaceSunken: string; contentPrimary: string },
): ValidationResult;
