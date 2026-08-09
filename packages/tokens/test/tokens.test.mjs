// test-tokens.mjs — validation + integration tests for the responsive token layer.
// Run: node scripts/test-tokens.mjs   (assumes `npm run tokens` has produced build/)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { collectResponsive } from '../lib/responsive.mjs';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0;
const fail = [];
const ok = (name, cond) => (cond ? pass++ : fail.push(name));

// ── Unit: collectResponsive validation ──────────────────────────────────────
// Reference is preserved, no-op skipped, raw dimension gets px.
const u = collectResponsive([
  { path: 'envision.t1.font-size.40', value: 40, type: 'dimension' },
  { path: 'envision.t1.font-size.16', value: 16, type: 'dimension' },
  { path: 'envision.t2.font-size.display', value: '{envision.t1.font-size.56}', type: 'dimension', ext: { mobile: '{envision.t1.font-size.40}' } },
  { path: 'envision.t2.font-size.body-lg', value: '{envision.t1.font-size.16}', type: 'dimension', ext: { mobile: '{envision.t1.font-size.16}' } }, // no-op
  { path: 'envision.t2.layout.right-rail-width', value: 392, type: 'dimension', ext: { mobile: 390 } },
]);
ok('unit: no validation errors on good tokens', u.errors.length === 0);
ok('unit: responsiveCount counts all responsive tokens (3)', u.responsiveCount === 3);
ok('unit: no-op override skipped (2 emitted)', u.overrides.length === 2);
ok('unit: reference preserved as var()', u.overrides.some((o) => o.name === '--envision-t2-font-size-display' && o.css === 'var(--envision-t1-font-size-40)'));
ok('unit: raw dimension gets px', u.overrides.some((o) => o.name === '--envision-t2-layout-right-rail-width' && o.css === '390px'));

// Missing mobile → clear error.
const e1 = collectResponsive([{ path: 'x.y', value: 1, type: 'dimension', ext: {} }]);
ok('unit: missing mobile surfaced', e1.errors.length === 1 && /missing\/empty/.test(e1.errors[0]));

// Mobile ref to unknown token → clear error.
const e2 = collectResponsive([{ path: 'x.y', value: '{a.b}', type: 'dimension', ext: { mobile: '{does.not.exist}' } }]);
ok('unit: unknown mobile reference surfaced', e2.errors.length === 1 && /unknown token \{does\.not\.exist\}/.test(e2.errors[0]));

// ── Integration: generated CSS ──────────────────────────────────────────────
const css = readFileSync(join(pkg, 'dist/tokens.css'), 'utf8');
ok('integration: breakpoint derived (max-width: 1024px)', css.includes('@media (max-width: 1024px)'));
ok('integration: desktop default present in :root', css.includes('--envision-t2-font-size-display: var(--envision-t1-font-size-56);'));
const media = css.slice(css.indexOf('@media (max-width: 1024px)'));
ok('integration: mobile override inside media query', media.includes('--envision-t2-font-size-display: var(--envision-t1-font-size-40);'));
ok('integration: no-op token NOT in media query', !media.includes('--envision-t2-font-size-body-lg'));
ok('integration: raw layout override with px', media.includes('--envision-t2-layout-right-rail-width: 390px;'));
ok('integration: primitives resolve the chain', css.includes('--envision-t1-font-size-56: 56px;') && css.includes('--envision-t1-font-size-40: 40px;'));

// ── Report ──────────────────────────────────────────────────────────────────
console.log(`token tests: ${pass} passed, ${fail.length} failed`);
if (fail.length) {
  console.error('FAILED:\n  - ' + fail.join('\n  - '));
  process.exit(1);
}
