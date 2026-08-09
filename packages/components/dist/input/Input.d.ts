import { EnvisionElement } from '../base/element.js';
declare const TYPES: readonly ["text", "email", "search", "number", "price", "password"];
type FieldType = (typeof TYPES)[number];
export declare class EnvisionInput extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static formAssociated: boolean;
    static observedAttributes: string[];
    constructor();
    get type(): FieldType;
    set type(v: FieldType);
    get value(): string;
    set value(v: string);
    get label(): string;
    set label(v: string);
    get helperText(): string;
    set helperText(v: string);
    get errorMessage(): string;
    set errorMessage(v: string);
    get invalid(): boolean;
    set invalid(v: boolean);
    get required(): boolean;
    set required(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-input': EnvisionInput;
    }
}
export {};
//# sourceMappingURL=Input.d.ts.map