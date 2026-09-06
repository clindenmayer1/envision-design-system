// theme.test.mjs — the white-label gate.
//
// Two jobs: prove the theme runtime does what the contract says, and MEASURE every theme in the
// repo. With thousands of builder themes nobody can review contrast by eye, so this is the
// mechanism that makes the promise real. Run: node test/theme.test.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import {
  validateTheme, themeToCssProps, themeToCss, contrastRatio, relativeLuminance,
  themeCssPropertyNames, ALLOWED_OVERRIDES, INVARIANTS, RAMP_STEPS,
} from '../lib/theme.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const themesDir = join(here, '..', 'src', 'themes');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

let passed = 0;
const failures = [];
const test = (name, fn) => {
  try { fn(); passed++; }
  catch (e) { failures.push(`${name}\n    ${e.message.split('\n')[0]}`); }
};

// ── color maths ────────────────────────────────────────────────────────────
test('contrast ratio matches the WCAG reference points', () => {
  assert.equal(Math.round(contrastRatio('#FFFFFF', '#000000')), 21);
  assert.equal(Math.round(contrastRatio('#FFFFFF', '#FFFFFF')), 1);
  // #767676 is the canonical lightest gray that still passes 4.5:1 on white; one step
  // lighter fails. Bracketing the threshold catches an off-by-a-little luminance curve.
  assert.ok(contrastRatio('#767676', '#FFFFFF') >= 4.5);
  assert.ok(contrastRatio('#777777', '#FFFFFF') < 4.5);
  assert.ok(contrastRatio('#757575', '#FFFFFF') > 4.5);
});

test('unparseable colors yield null rather than a bogus ratio', () => {
  assert.equal(contrastRatio('rebeccapurple', '#FFFFFF'), null);
  assert.equal(relativeLuminance('#GGGGGG'), null);
});

// ── the invariants must not drift from the built primitives ─────────────────
test('INVARIANTS still match the neutral primitives they were taken from', () => {
  const prims = readJson(join(here, '..', 'src', 'primitives.tokens.json')).envision.t1.color.neutral;
  assert.equal(prims['0'].$value.toUpperCase(), INVARIANTS.surface);
  assert.equal(prims['100'].$value.toUpperCase(), INVARIANTS.surfaceSunken);
  assert.equal(prims['800'].$value.toUpperCase(), INVARIANTS.contentPrimary);
});

// ── the contract ────────────────────────────────────────────────────────────
test('the contract is exactly the brand layer: 10 + 10 ramp steps, on-brand, two fonts', () => {
  const names = themeCssPropertyNames();
  assert.equal(names.length, 23);
  assert.ok(names.every((n) => n.startsWith('--envision-t2-')));
  assert.equal(names.filter((n) => n.includes('color-primary-')).length, 10);
  assert.equal(names.filter((n) => n.includes('color-accent-')).length, 10);
});

test('a theme cannot set properties outside the contract', () => {
  const theme = readJson(join(themesDir, 'westlake.theme.json'));
  const rogue = { ...theme, overrides: { '--envision-t1-color-neutral-0': '#FF0000' } };
  const r = validateTheme(rogue);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('not part of the white-label contract')));
  // and it never reaches the emitted properties
  assert.equal(themeToCssProps(rogue)['--envision-t1-color-neutral-0'], undefined);
});

test('the allow-listed overrides do reach the emitted properties', () => {
  const citrine = readJson(join(themesDir, 'example-citrine.theme.json'));
  const props = themeToCssProps(citrine);
  for (const k of Object.keys(citrine.overrides)) {
    assert.ok(ALLOWED_OVERRIDES.includes(k), `${k} should be allow-listed`);
    assert.equal(props[k], citrine.overrides[k]);
  }
});

test('themeToCss emits a CSS rule containing every brand property', () => {
  const theme = readJson(join(themesDir, 'envision.theme.json'));
  const css = themeToCss(theme, '[data-envision-theme="envision"]');
  assert.ok(css.startsWith('[data-envision-theme="envision"] {'));
  for (const step of RAMP_STEPS) assert.ok(css.includes(`--envision-t2-color-primary-${step}:`));
});

// ── structural validation ───────────────────────────────────────────────────
test('an incomplete ramp is rejected, because it leaves hover and pressed undefined', () => {
  const r = validateTheme({ id: 'x', name: 'X', brand: { primary: { 500: '#000000' }, accent: {}, contentOnBrand: '#FFFFFF' } });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('primary.600 is missing')));
});

test('a missing contentOnBrand is rejected with the reason', () => {
  const theme = readJson(join(themesDir, 'westlake.theme.json'));
  delete theme.brand.contentOnBrand;
  const r = validateTheme(theme);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('contentOnBrand is required')));
});

test('a non-hex color is rejected', () => {
  const theme = readJson(join(themesDir, 'westlake.theme.json'));
  theme.brand.primary['500'] = 'darkgreen';
  const r = validateTheme(theme);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('not a 6-digit hex')));
});

// ── the substantive check: white on a pale brand must fail ──────────────────
test('white text on a pale brand is caught, not shipped', () => {
  const citrine = readJson(join(themesDir, 'example-citrine.theme.json'));
  const broken = { ...citrine, brand: { ...citrine.brand, contentOnBrand: '#FFFFFF' } };
  const r = validateTheme(broken);
  assert.equal(r.ok, false, 'white on #E8C511 should fail the gate');
  assert.ok(r.errors.some((e) => e.startsWith('contrast on-brand/default')));
});

test('a brand-derived focus ring that vanishes on white is caught', () => {
  const citrine = readJson(join(themesDir, 'example-citrine.theme.json'));
  const noOverrides = { ...citrine };
  delete noOverrides.overrides;
  const r = validateTheme(noOverrides);
  assert.equal(r.ok, false, 'a pale focus ring on white should fail 1.4.11');
  assert.ok(r.errors.some((e) => e.startsWith('contrast focus/surface')));
});

// ── every theme in the repo must pass ───────────────────────────────────────
const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith('.theme.json')).sort();

test('the repo actually contains themes to check', () => {
  assert.ok(themeFiles.length >= 2, 'expected at least a default and one builder theme');
});

const report = [];
for (const file of themeFiles) {
  const theme = readJson(join(themesDir, file));
  test(`theme "${theme.id}" passes every contrast gate`, () => {
    const r = validateTheme(theme);
    assert.equal(r.ok, true, r.errors.join('\n    '));
  });
  const r = validateTheme(theme);
  report.push({ id: theme.id, kind: theme.kind, worst: r.results.length ? Math.min(...r.results.map((x) => x.ratio ?? 0)) : null });
}

test('exactly one theme is the default', () => {
  const defaults = themeFiles.map((f) => readJson(join(themesDir, f))).filter((t) => t.kind === 'default');
  assert.equal(defaults.length, 1, `expected 1 default theme, found ${defaults.length}`);
  assert.equal(defaults[0].id, 'envision');
});

test('no example theme is mistakable for a real builder', () => {
  for (const f of themeFiles) {
    const t = readJson(join(themesDir, f));
    if (t.kind === 'example') assert.ok(t.id.startsWith('example-'), `${t.id} should be prefixed example-`);
  }
});

// ── report ──────────────────────────────────────────────────────────────────
console.log('\nTheme contrast report (worst pair per theme):');
for (const r of report) {
  console.log(`  ${String(r.id).padEnd(18)} ${String(r.kind ?? '').padEnd(8)} worst ${r.worst}:1`);
}
console.log(`\ntheme: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
