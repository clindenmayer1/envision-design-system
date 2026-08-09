import { EnvisionElement } from '../base/element.js';
export declare class EnvisionRadio extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get checked(): boolean;
    set checked(v: boolean);
    get name(): string;
    set name(v: string);
    get value(): string;
    set value(v: string);
    get label(): string;
    set label(v: string);
    get disabled(): boolean;
    set disabled(v: boolean);
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-radio': EnvisionRadio;
    }
}
//# sourceMappingURL=Radio.d.ts.map