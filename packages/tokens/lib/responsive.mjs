// responsive.mjs — pure, testable helpers for the Envision responsive token layer.
// The CSS custom-property name equals the dotted token path with '.'→'-', which is
// identical to Style Dictionary's name/kebab, so overrides target the exact same var.
export const RESP_NS = 'envision.responsive';

export const varName = (dottedPath) => `--${dottedPath.replace(/\./g, '-')}`;

// Flatten a DTCG token tree into { path, value, type, ext } records.
export function flatten(node, path = [], out = []) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      out.push({ path: [...path, k].join('.'), value: v.$value, type: v.$type, ext: v.$extensions?.[RESP_NS] });
    } else if (v && typeof v === 'object') {
      flatten(v, [...path, k], out);
    }
  }
  return out;
}

// Resolve a mobile metadata value to a CSS value, preserving references as var(--…).
export function resolveMobile(mobile, type) {
  if (typeof mobile === 'string' && /^\{.+\}$/.test(mobile)) {
    const refPath = mobile.slice(1, -1);
    return { css: `var(${varName(refPath)})`, isRef: true, refPath };
  }
  const n = typeof mobile === 'number' ? mobile : /^-?\d+(\.\d+)?$/.test(mobile) ? Number(mobile) : mobile;
  return { css: type === 'dimension' && typeof n === 'number' ? `${n}px` : `${n}`, isRef: false };
}

// Validate responsive metadata and collect the mobile overrides that actually change.
// Returns { overrides: [{name, css, refPath?}], errors: string[], responsiveCount }.
export function collectResponsive(tokens) {
  const paths = new Set(tokens.map((t) => t.path));
  const errors = [];
  const overrides = [];
  let responsiveCount = 0;
  for (const t of tokens) {
    if (!t.ext) continue;
    responsiveCount++;
    const mobile = t.ext.mobile;
    if (mobile === undefined || mobile === null || mobile === '') {
      errors.push(`${t.path}: responsive metadata present but "mobile" is missing/empty`);
      continue;
    }
    const m = resolveMobile(mobile, t.type);
    if (m.isRef && !paths.has(m.refPath)) {
      errors.push(`${t.path}: mobile references unknown token {${m.refPath}}`);
      continue;
    }
    if (String(mobile) === String(t.value)) continue; // no-op (mobile === desktop) → skip, never duplicate
    overrides.push({ name: varName(t.path), css: m.css, refPath: m.isRef ? m.refPath : undefined });
  }
  return { overrides, errors, responsiveCount };
}
