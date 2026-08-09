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
export function tryAttachInternals(el) {
    const attach = el.attachInternals;
    if (typeof attach !== 'function')
        return null;
    try {
        return attach.call(el);
    }
    catch {
        return null;
    }
}
export function setFormValue(internals, value) {
    if (internals && typeof internals.setFormValue === 'function') {
        internals.setFormValue(value);
    }
}
/** Re-dispatch a change as a composed event so it escapes the shadow root to consumers. */
export function emitChange(host, detail) {
    host.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail }));
}
export function emitInput(host, detail) {
    host.dispatchEvent(new CustomEvent('input', { bubbles: true, composed: true, detail }));
}
//# sourceMappingURL=internals.js.map