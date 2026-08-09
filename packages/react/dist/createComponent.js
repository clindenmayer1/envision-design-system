import * as React from 'react';
/**
 * createComponent — the ONLY logic in @envision/react.
 *
 * It wraps an Envision custom element in a React component that:
 *   - forwards camelCase props to kebab-case ATTRIBUTES on the element,
 *   - forwards `on*` props to custom-element EVENT listeners,
 *   - forwards `ref` to the underlying element,
 *   - passes `children` through as slotted/light-DOM content.
 *
 * It contains NO component behavior — every bit of rendering, state, a11y, and keyboard logic
 * lives once in @envision/components. This is why adding React (or later Vue/Svelte) support is
 * a thin, generated layer and not a re-implementation. React 19 handles custom-element props and
 * events natively; this wrapper gives the same ergonomics on React 18 and keeps typing precise.
 */
const kebab = (s) => s.replace(/([A-Z])/g, '-$1').toLowerCase();
const isEventProp = (k) => /^on[A-Z]/.test(k);
const eventName = (k) => k.slice(2).toLowerCase();
export function createComponent(tagName) {
    const Component = React.forwardRef(function EnvisionReact(props, forwardedRef) {
        const elementRef = React.useRef(null);
        const { children, className, style, id, ...rest } = props;
        React.useLayoutEffect(() => {
            const el = elementRef.current;
            if (!el)
                return;
            if (className != null)
                el.className = className;
            if (id != null)
                el.setAttribute('id', id);
            if (style)
                Object.assign(el.style, style);
            const cleanups = [];
            for (const [key, value] of Object.entries(rest)) {
                if (isEventProp(key) && typeof value === 'function') {
                    const evt = eventName(key);
                    el.addEventListener(evt, value);
                    cleanups.push(() => el.removeEventListener(evt, value));
                }
                else {
                    const attr = kebab(key);
                    if (value === false || value == null)
                        el.removeAttribute(attr);
                    else if (value === true)
                        el.setAttribute(attr, '');
                    else
                        el.setAttribute(attr, String(value));
                }
            }
            return () => cleanups.forEach((c) => c());
        });
        const setRef = (node) => {
            elementRef.current = node;
            if (typeof forwardedRef === 'function')
                forwardedRef(node);
            else if (forwardedRef)
                forwardedRef.current = node;
        };
        // Only ref + children go through React; everything else is applied imperatively above so
        // camelCase→kebab mapping and custom events are correct across React versions.
        return React.createElement(tagName, { ref: setRef }, children);
    });
    Component.displayName = `Envision(${tagName})`;
    return Component;
}
//# sourceMappingURL=createComponent.js.map