import { EnvisionElement } from '../base/element.js';
export declare class EnvisionCheckbox extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static formAssociated: boolean;
    static observedAttributes: string[];
    constructor();
    get checked(): boolean;
    set checked(v: boolean);
    get label(): string;
    set label(v: string);
    get disabled(): boolean;
    set disabled(v: boolean);
    get required(): boolean;
    set required(v: boolean);
    get invalid(): boolean;
    set invalid(v: boolean);
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-checkbox': EnvisionCheckbox;
    }
}
//# sourceMappingURL=Checkbox.d.ts.map