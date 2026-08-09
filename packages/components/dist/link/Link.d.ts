import { EnvisionElement } from '../base/element.js';
declare const VARIANTS: readonly ["inline", "standalone"];
type Variant = (typeof VARIANTS)[number];
export declare class EnvisionLink extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get href(): string;
    set href(v: string);
    get label(): string;
    set label(v: string);
    get variant(): Variant;
    set variant(v: Variant);
    get directionIcon(): boolean;
    set directionIcon(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-link': EnvisionLink;
    }
}
export {};
//# sourceMappingURL=Link.d.ts.map