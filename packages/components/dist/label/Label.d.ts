export declare class EnvisionLabel extends HTMLElement {
    #private;
    static observedAttributes: string[];
    get text(): string;
    set text(v: string);
    get required(): boolean;
    set required(v: boolean);
    get helpIcon(): boolean;
    set helpIcon(v: boolean);
    get htmlFor(): string;
    set htmlFor(v: string);
    connectedCallback(): void;
    attributeChangedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'envision-label': EnvisionLabel;
    }
}
//# sourceMappingURL=Label.d.ts.map