import { EnvisionElement } from '../base/element.js';
import type { MaterialOption } from '../types.js';
export declare class EnvisionMaterialSwatch extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get option(): MaterialOption | null;
    set option(v: MaterialOption | null);
    get selected(): boolean;
    set selected(v: boolean);
    get unavailable(): boolean;
    set unavailable(v: boolean);
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-material-swatch': EnvisionMaterialSwatch;
    }
}
//# sourceMappingURL=MaterialSwatch.d.ts.map