/**
 * Form-participation helper.
 *
 * Form-associated custom elements (ElementInternals + `static formAssociated`) let a
 * component contribute a value to its containing <form> across the shadow boundary. That
 * API is present in every modern browser but NOT in the happy-dom test environment, so we
 * feature-detect it: when present we call `setFormValue`; when absent the component still
 * works (native inner control drives semantics/keyboard/focus) and simply doesn't submit a
 * value. Real-browser form submission is covered by the staged Playwright layer.
 */
export declare function tryAttachInternals(el: HTMLElement): ElementInternals | null;
export declare function setFormValue(internals: ElementInternals | null, value: string | null): void;
/** Re-dispatch a change as a composed event so it escapes the shadow root to consumers. */
export declare function emitChange(host: HTMLElement, detail: unknown): void;
export declare function emitInput(host: HTMLElement, detail: unknown): void;
//# sourceMappingURL=internals.d.ts.map