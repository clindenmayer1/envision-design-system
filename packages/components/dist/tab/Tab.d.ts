import { EnvisionElement } from '../base/element.js';
export declare class EnvisionTab extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get label(): string;
    set label(v: string);
    get selected(): boolean;
    set selected(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    get panel(): string | null;
    set panel(v: string | null);
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-tab': EnvisionTab;
    }
}
//# sourceMappingURL=Tab.d.ts.map