/**
 * Constructable-stylesheet helper.
 *
 * `css` builds a `CSSStyleSheet` once at module load so every instance of a
 * component shares ONE sheet via `adoptedStyleSheets` (no per-instance <style>
 * duplication — this is the main performance reason to prefer Shadow DOM + tokens).
 *
 * Component styles reference the design-system CSS custom properties
 * (`--envision-t2-*`, `--envision-t3-*`) from `@envision/tokens`. Custom
 * properties inherit THROUGH the shadow boundary, so theming/white-label still
 * works even though the internals are encapsulated.
 */
/** Raw source text per sheet — the authoritative styling contract for tests. (Test envs like
 *  happy-dom mangle `var()` declarations when re-serializing `cssRules`, so assert on this.) */
const sources = new WeakMap();
export function css(strings, ...values) {
    const cssText = strings.reduce((acc, chunk, i) => {
        const v = values[i - 1];
        return acc + (v === undefined ? '' : String(v)) + chunk;
    });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    sources.set(sheet, cssText);
    return sheet;
}
/** The exact source CSS a `css`\`\`-built sheet was created from (for styling-contract tests). */
export function cssSource(sheet) {
    const sheets = Array.isArray(sheet) ? sheet : sheet ? [sheet] : [];
    return sheets.map((s) => sources.get(s) ?? '').join('\n');
}
//# sourceMappingURL=css.js.map