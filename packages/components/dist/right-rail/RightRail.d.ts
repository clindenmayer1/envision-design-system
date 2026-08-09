import { EnvisionElement } from '../base/element.js';
declare const MODES: readonly ["customize", "packages"];
type Mode = (typeof MODES)[number];
export declare class EnvisionRightRail extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get mode(): Mode;
    set mode(v: Mode);
    get loading(): boolean;
    set loading(v: boolean);
    get open(): boolean;
    set open(v: boolean);
    /** Force sheet presentation; otherwise auto below 1024px. */
    get sheet(): boolean;
    set sheet(v: boolean);
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-right-rail': EnvisionRightRail;
    }
}
export {};
//# sourceMappingURL=RightRail.d.ts.map