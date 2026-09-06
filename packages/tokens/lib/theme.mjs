// theme.mjs — the Envision white-label seam.
//
// Envision is a white-label platform: one system, potentially thousands of builder brands. A
// theme is DATA, not a fork. It supplies the brand layer and nothing else; every other decision
// in the system (neutrals, status colors, spacing, radius, type scale, elevation, motion,
// z-index, breakpoints) is shared and is not a builder's to change.
//
// The seam is deliberately narrow — 23 brand tokens feeding 10 semantic roles. Narrow is the
// point: it is what lets a theme be validated automatically instead of reviewed by hand, which
// is the only thing that scales past a handful of brands.
//
// This module is pure and dependency-free so the same logic runs in three places: the browser
// (applying a theme fetched from an API), CI (gating a theme before it ships), and the docs
// (showing a component under a theme).

/** The ramp steps every themeable color ramp must supply. */
export const RAMP_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

/**
 * The complete list of custom properties a theme may set — the white-label contract.
 * Anything not in this map is invariant and belongs to the system, not the builder.
 */
export function themeCssPropertyNames() {
  return [
    ...RAMP_STEPS.map((s) => `--envision-t2-color-primary-${s}`),
    ...RAMP_STEPS.map((s) => `--envision-t2-color-accent-${s}`),
    '--envision-t2-color-content-on-primary-default',
    '--envision-t2-font-family-display',
    '--envision-t2-font-family-wordmark',
  ];
}

/**
 * Properties a theme may additionally override via `overrides`.
 *
 * These are semantic roles that DERIVE from the brand ramp and are usually correct, but can fail
 * for an unusual brand. The focus ring is the real case: it defaults to primary/500, which is
 * invisible on white for a pale brand. Rather than force every theme to restate it, a theme
 * overrides it only when the contrast gate says it must.
 */
export const ALLOWED_OVERRIDES = Object.freeze([
  '--envision-t2-color-border-focus-default',
  '--envision-t2-color-content-brand-default',
  '--envision-t2-color-content-brand-hover',
]);

/**
 * Invariant colors the gate measures themes against. These come from the neutral primitives and
 * are NOT themeable; `npm run test` asserts they still match primitives.tokens.json so this
 * cannot silently drift away from the built tokens.
 */
export const INVARIANTS = Object.freeze({
  surface: '#FFFFFF',        // t1.color.neutral.0   — background/surface/default
  surfaceSunken: '#F3F0EA',  // t1.color.neutral.100 — background/surface/sunken
  contentPrimary: '#222222', // t1.color.neutral.800 — content/primary/default
});

// ── color maths ────────────────────────────────────────────────────────────
const HEX = /^#([0-9a-f]{6})$/i;

export function parseHex(hex) {
  const m = typeof hex === 'string' && hex.match(HEX);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const f = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
}

/** WCAG 2.1 contrast ratio, 1–21. Returns null if either color is unparseable. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la == null || lb == null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const round = (n) => Math.round(n * 100) / 100;

// ── theme → CSS ─────────────────────────────────────────────────────────────
/**
 * Flatten a theme document into the CSS custom properties it sets.
 * Only contract properties are emitted; `overrides` is filtered against the allow-list.
 */
export function themeToCssProps(theme) {
  const b = theme?.brand ?? {};
  const props = {};
  for (const step of RAMP_STEPS) {
    if (b.primary?.[step]) props[`--envision-t2-color-primary-${step}`] = b.primary[step];
    if (b.accent?.[step]) props[`--envision-t2-color-accent-${step}`] = b.accent[step];
  }
  if (b.contentOnBrand) props['--envision-t2-color-content-on-primary-default'] = b.contentOnBrand;
  if (b.fontFamily?.display) props['--envision-t2-font-family-display'] = b.fontFamily.display;
  if (b.fontFamily?.wordmark) props['--envision-t2-font-family-wordmark'] = b.fontFamily.wordmark;

  for (const [k, v] of Object.entries(theme?.overrides ?? {})) {
    if (ALLOWED_OVERRIDES.includes(k)) props[k] = v;
  }
  return props;
}

/** Render a theme as a CSS rule, for build-time or server-rendered delivery. */
export function themeToCss(theme, selector = ':root') {
  const props = themeToCssProps(theme);
  const body = Object.entries(props).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `${selector} {\n${body}\n}\n`;
}

/**
 * Apply a theme at runtime by setting the brand custom properties on an element.
 *
 * Because only the brand layer is set, every semantic role and component token downstream
 * re-resolves through the normal cascade. No component is aware a theme changed.
 *
 * Returns a function that removes the properties again.
 */
export function applyTheme(theme, target) {
  const el = target ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) throw new Error('applyTheme: no target element and no document available');
  // Clear the whole contract first. Themes differ in which optional overrides they set, so
  // swapping citrine (which overrides the focus ring) for a theme that does not would otherwise
  // leave citrine's focus ring behind.
  for (const k of [...themeCssPropertyNames(), ...ALLOWED_OVERRIDES]) el.style.removeProperty(k);
  const props = themeToCssProps(theme);
  for (const [k, v] of Object.entries(props)) el.style.setProperty(k, v);
  if (theme?.id) el.dataset.envisionTheme = theme.id;
  return () => {
    for (const k of Object.keys(props)) el.style.removeProperty(k);
    delete el.dataset.envisionTheme;
  };
}

// ── validation ──────────────────────────────────────────────────────────────
/**
 * The contrast pairs a theme must satisfy.
 *
 * Every pair below is derived from a real token chain in the built CSS, not invented:
 *   button/primary + badge/promotional  content on-brand over background/brand/{default,hover,pressed}
 *   selection-indicator                 on-brand icon over background/brand/default
 *   input focus ring                    border/focus over the surfaces it appears against
 *   content/brand                       brand text over the page surface
 *   background/brand-subtle             content/primary text over a subtle brand surface
 */
function pairsFor(props, inv) {
  const primary = (s) => props[`--envision-t2-color-primary-${s}`];
  const onBrand = props['--envision-t2-color-content-on-primary-default'];
  const focus = props['--envision-t2-color-border-focus-default'] ?? primary('500');
  const brandText = props['--envision-t2-color-content-brand-default'] ?? primary('500');
  const brandTextHover = props['--envision-t2-color-content-brand-hover'] ?? primary('600');

  return [
    { id: 'on-brand/default', fg: onBrand, bg: primary('500'), min: 4.5,
      why: 'Primary button and promotional badge label sit on background/brand/default.' },
    { id: 'on-brand/hover', fg: onBrand, bg: primary('600'), min: 4.5,
      why: 'Primary button label on background/brand/hover.' },
    { id: 'on-brand/pressed', fg: onBrand, bg: primary('700'), min: 4.5,
      why: 'Primary button label on background/brand/pressed.' },
    { id: 'focus/surface', fg: focus, bg: inv.surface, min: 3,
      why: 'The focus ring must be visible on the default surface (WCAG 1.4.11).' },
    { id: 'focus/surface-sunken', fg: focus, bg: inv.surfaceSunken, min: 3,
      why: 'The focus ring must also survive the sunken surface.' },
    { id: 'content-brand/surface', fg: brandText, bg: inv.surface, min: 4.5,
      why: 'Brand-colored text (links, selected tab labels) on the page surface.' },
    { id: 'content-brand-hover/surface', fg: brandTextHover, bg: inv.surface, min: 4.5,
      why: 'Brand text in its hover state.' },
    { id: 'brand-subtle/content', fg: inv.contentPrimary, bg: primary('50'), min: 4.5,
      why: 'Body text on background/brand-subtle.' },
  ];
}

/**
 * Validate a theme document. Returns { ok, errors, warnings, results }.
 *
 * This is the gate that makes thousands of themes tractable: a theme is not "reviewed", it is
 * measured. A failing pair names the fix (usually contentOnBrand, or a focus override).
 */
export function validateTheme(theme, invariants = INVARIANTS) {
  const errors = [];
  const warnings = [];

  if (!theme || typeof theme !== 'object') return { ok: false, errors: ['theme is not an object'], warnings, results: [] };
  if (!theme.id) errors.push('theme.id is required');
  if (!theme.name) warnings.push('theme.name is missing; tooling will fall back to the id');

  // Structure: both ramps complete, every value a 6-digit hex.
  for (const ramp of ['primary', 'accent']) {
    const r = theme.brand?.[ramp];
    if (!r) { errors.push(`brand.${ramp} is required and must supply all 10 steps`); continue; }
    for (const step of RAMP_STEPS) {
      if (!r[step]) errors.push(`brand.${ramp}.${step} is missing`);
      else if (!parseHex(r[step])) errors.push(`brand.${ramp}.${step} is not a 6-digit hex color: ${r[step]}`);
    }
  }
  if (!theme.brand?.contentOnBrand) {
    errors.push('brand.contentOnBrand is required — it is what keeps a label legible on the brand color, and a light brand needs dark ink here');
  }
  for (const k of Object.keys(theme.overrides ?? {})) {
    if (!ALLOWED_OVERRIDES.includes(k)) {
      errors.push(`overrides.${k} is not part of the white-label contract. Themeable properties are the brand layer plus ${ALLOWED_OVERRIDES.join(', ')}`);
    }
  }

  const props = themeToCssProps(theme);
  const results = [];
  if (!errors.length) {
    for (const pair of pairsFor(props, invariants)) {
      const ratio = contrastRatio(pair.fg, pair.bg);
      const pass = ratio != null && ratio >= pair.min;
      results.push({ id: pair.id, fg: pair.fg, bg: pair.bg, ratio: ratio == null ? null : round(ratio), min: pair.min, pass });
      if (!pass) {
        errors.push(
          `contrast ${pair.id}: ${pair.fg} on ${pair.bg} is ${ratio == null ? 'unmeasurable' : round(ratio) + ':1'}, needs ${pair.min}:1. ${pair.why}`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, results };
}
