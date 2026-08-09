import { EnvisionElement } from '../base/element.js';
import type { MaterialOption } from '../types.js';
export declare class EnvisionOptionCard extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get options(): MaterialOption[];
    set options(v: MaterialOption[]);
    get value(): string;
    set value(v: string);
    get title(): string;
    set title(v: string);
    get note(): string;
    set note(v: string);
    get active(): boolean;
    set active(v: boolean);
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-option-card': EnvisionOptionCard;
    }
}
//# sourceMappingURL=OptionCard.d.ts.map