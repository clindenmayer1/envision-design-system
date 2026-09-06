import { EnvisionElement } from '../base/element.js';
import type { BreadcrumbItem } from '../types.js';
export declare class EnvisionBreadcrumbs extends EnvisionElement {
    #private;
    static styles: CSSStyleSheet;
    static observedAttributes: string[];
    /** The trail, root first. The last entry is treated as the current page. */
    get items(): BreadcrumbItem[];
    set items(v: BreadcrumbItem[]);
    /** Accessible name for the landmark. Distinct names matter when a page has several navs. */
    get label(): string;
    set label(v: string);
    protected render(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-breadcrumbs': EnvisionBreadcrumbs;
    }
}
//# sourceMappingURL=Breadcrumbs.d.ts.map