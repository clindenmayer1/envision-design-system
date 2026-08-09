import { EnvisionElement } from '../base/element.js';
declare const VARIANTS: readonly ["standard", "subtle"];
type Variant = (typeof VARIANTS)[number];
export declare class EnvisionIconButton extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get icon(): string;
    set icon(v: string);
    get accessibleName(): string;
    set accessibleName(v: string);
    get variant(): Variant;
    set variant(v: Variant);
    get selected(): boolean;
    set selected(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    get tooltip(): string | null;
    set tooltip(v: string | null);
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-icon-button': EnvisionIconButton;
    }
}
export {};
//# sourceMappingURL=IconButton.d.ts.map