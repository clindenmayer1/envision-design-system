/**
 * EnvisionElement — the shared base for every Envision custom element.
 *
 * Zero runtime dependencies. It provides just enough of a reactive lifecycle to
 * keep components small and correct:
 *
 *  - Shadow DOM + shared constructable stylesheet (adopted once).
 *  - Batched, microtask-coalesced updates (`requestUpdate`).
 *  - A two-phase render split so DOM is BUILT once (`render`) and STATE is SYNCED
 *    on every change (`updated`). This avoids re-`innerHTML`ing on every attribute
 *    change, which would destroy focus and form state — a real production concern
 *    for inputs, checkboxes, and switches.
 *  - Small attribute-reflection helpers.
 *
 * We deliberately do NOT use class fields for reactive props (the project sets
 * `useDefineForClassFields`, which would shadow prototype accessors). Reactive
 * props are expressed as getters/setters over attributes in each subclass.
 */
export class EnvisionElement extends HTMLElement {
    /** Subclass-provided constructable stylesheet(s). Adopted once on connect. */
    static styles;
    hasRendered = false;
    updateScheduled = false;
    constructor() {
        super();
        // delegatesFocus lets a click on the host move focus to the inner control,
        // and lets :focus-visible on the host reflect inner focus (see per-component CSS).
        this.attachShadow({ mode: 'open', delegatesFocus: true });
    }
    connectedCallback() {
        this.adoptStyles();
        // First render is SYNCHRONOUS so the shadow DOM exists immediately on connect (no flash of
        // unbuilt content, deterministic for tests/SSR). Later attribute changes batch via microtask.
        this.performUpdate();
    }
    attributeChangedCallback() {
        // Ignore the initial attribute set (handled by the connect render); only
        // schedule work for post-render changes.
        if (this.hasRendered)
            this.requestUpdate();
    }
    adoptStyles() {
        const s = this.constructor.styles;
        const root = this.shadowRoot;
        if (!s || !root)
            return;
        if (root.adoptedStyleSheets.length > 0)
            return; // already adopted
        root.adoptedStyleSheets = Array.isArray(s) ? s : [s];
    }
    /** Schedule a coalesced update on the microtask queue. */
    requestUpdate() {
        if (this.updateScheduled)
            return;
        this.updateScheduled = true;
        queueMicrotask(() => {
            this.updateScheduled = false;
            if (!this.isConnected)
                return;
            this.performUpdate();
        });
    }
    /** Run an update synchronously (used by tests and setters that need to observe DOM now). */
    performUpdate() {
        if (!this.shadowRoot)
            return;
        if (!this.hasRendered) {
            this.render();
            this.hasRendered = true;
        }
        this.updated();
    }
    /** Build the shadow DOM once. Subclasses override. */
    render() { }
    /** Sync reactive state onto the already-built DOM. Called after first render and on every change. */
    updated() { }
    // --- attribute reflection helpers -------------------------------------------
    reflectBool(name, value) {
        if (value)
            this.setAttribute(name, '');
        else
            this.removeAttribute(name);
    }
    getBool(name) {
        return this.hasAttribute(name);
    }
    getEnum(name, allowed, fallback) {
        const v = this.getAttribute(name);
        return v && allowed.includes(v) ? v : fallback;
    }
    getStr(name) {
        return this.getAttribute(name);
    }
    setStr(name, value) {
        if (value == null)
            this.removeAttribute(name);
        else
            this.setAttribute(name, value);
    }
}
/** Define a custom element idempotently (safe across HMR / double-import / SSR hydration). */
export function define(tag, ctor) {
    if (typeof customElements === 'undefined')
        return;
    if (!customElements.get(tag))
        customElements.define(tag, ctor);
}
//# sourceMappingURL=element.js.map