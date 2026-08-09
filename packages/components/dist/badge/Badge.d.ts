import { EnvisionElement } from '../base/element.js';
declare const TONES: readonly ["neutral", "brand", "info", "success", "warning", "error"];
declare const SHAPES: readonly ["count", "dot"];
type Tone = (typeof TONES)[number];
type Shape = (typeof SHAPES)[number];
export declare class EnvisionBadge extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get tone(): Tone;
    set tone(v: Tone);
    get shape(): Shape;
    set shape(v: Shape);
    get count(): number | null;
    set count(v: number | null);
    get max(): number;
    set max(v: number);
    get label(): string | null;
    set label(v: string | null);
    connectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-badge': EnvisionBadge;
    }
}
export {};
//# sourceMappingURL=Badge.d.ts.map