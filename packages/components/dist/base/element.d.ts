/**
 * EnvisionElement, the shared base for every Envision custom element.
 *
 * Zero runtime dependencies. It provides just enough of a reactive lifecycle to
 * keep components small and correct:
 *
 *  - Shadow DOM + shared constructable stylesheet (adopted once).
 *  - Batched, microtask-coalesced updates (`requestUpdate`).
 *  - A two-phase render split so DOM is BUILT once (`render`) and STATE is SYNCED
 *    on every change (`updated`). This avoids re-`innerHTML`ing on every attribute
 *    change, which would destroy focus and form state, a real production concern
 *    for inputs, checkboxes, and switches.
 *  - Small attribute-reflection helpers.
 *
 * We deliberately do NOT use class fields for reactive props (the project sets
 * `useDefineForClassFields`, which would shadow prototype accessors). Reactive
 * props are expressed as getters/setters over attributes in each subclass.
 */
export declare abstract class EnvisionElement extends HTMLElement {
    /** Subclass-provided constructable stylesheet(s). Adopted once on connect. */
    static styles?: CSSStyleSheet | CSSStyleSheet[];
    protected hasRendered: boolean;
    private updateScheduled;
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(): void;
    private adoptStyles;
    /** Schedule a coalesced update on the microtask queue. */
    protected requestUpdate(): void;
    /** Run an update synchronously (used by tests and setters that need to observe DOM now). */
    protected performUpdate(): void;
    /** Build the shadow DOM once. Subclasses override. */
    protected render(): void;
    /** Sync reactive state onto the already-built DOM. Called after first render and on every change. */
    protected updated(): void;
    protected reflectBool(name: string, value: boolean): void;
    protected getBool(name: string): boolean;
    protected getEnum<T extends string>(name: string, allowed: readonly T[], fallback: T): T;
    protected getStr(name: string): string | null;
    protected setStr(name: string, value: string | null | undefined): void;
}
/** Define a custom element idempotently (safe across HMR / double-import / SSR hydration). */
export declare function define(tag: string, ctor: CustomElementConstructor): void;
//# sourceMappingURL=element.d.ts.map