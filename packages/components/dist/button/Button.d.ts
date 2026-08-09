import { EnvisionElement } from '../base/element.js';
declare const VARIANTS: readonly ["primary", "outline", "ghost"];
declare const SIZES: readonly ["sm", "md", "lg"];
type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];
export declare class EnvisionButton extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get variant(): Variant;
    set variant(v: Variant);
    get size(): Size;
    set size(v: Size);
    get label(): string;
    set label(v: string);
    get leadingIcon(): string | null;
    set leadingIcon(v: string | null);
    get trailingIcon(): string | null;
    set trailingIcon(v: string | null);
    get disabled(): boolean;
    set disabled(v: boolean);
    get loading(): boolean;
    set loading(v: boolean);
    get fullWidth(): boolean;
    set fullWidth(v: boolean);
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-button': EnvisionButton;
    }
}
export {};
//# sourceMappingURL=Button.d.ts.map