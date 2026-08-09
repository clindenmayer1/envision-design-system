import { EnvisionElement } from '../base/element.js';
export declare class EnvisionSwitch extends EnvisionElement {
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
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-switch': EnvisionSwitch;
    }
}
//# sourceMappingURL=Switch.d.ts.map