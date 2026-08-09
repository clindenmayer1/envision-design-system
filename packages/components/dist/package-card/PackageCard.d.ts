import { EnvisionElement } from '../base/element.js';
import type { KitchenPackage } from '../types.js';
export declare class EnvisionPackageCard extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    get pkg(): KitchenPackage | null;
    set pkg(v: KitchenPackage | null);
    get selected(): boolean;
    set selected(v: boolean);
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-package-card': EnvisionPackageCard;
    }
}
//# sourceMappingURL=PackageCard.d.ts.map