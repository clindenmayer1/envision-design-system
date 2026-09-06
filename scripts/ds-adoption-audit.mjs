#!/usr/bin/env node
/**
 * Design-system adoption audit for the shipping Envision application.
 *
 * Measures, per application component, how much of its implementation is expressed through the
 * production design system versus bespoke values. Run before and after each migration group so
 * adoption is tracked, not asserted.
 *
 *   node scripts/ds-adoption-audit.mjs           # table
 *   node scripts/ds-adoption-audit.mjs --json    # machine readable
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const APP = 'src/components';
const TOKENS = 'packages/tokens/dist/tokens.css';

const defined = new Set(
  [...readFileSync(TOKENS, 'utf8').matchAll(/--([a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);

/** Comments carry migration notes, not live values. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Values that are layout plumbing rather than design decisions.
const STRUCTURAL = /^(0|1|100|200|999)(px|%)?$/;

const PATTERNS = {
  canonical: /var\(\s*--envision-t[123]-[a-z0-9-]+/g,
  legacyTheme: /var\(\s*--envision-theme-[a-z0-9-]+/g,
  legacyApp: /var\(\s*--envision-(?!t[123]-|theme-)[a-z0-9-]+/g,
  legacyBare: /var\(\s*--(hairline|ink|ink-soft|card-bg|canvas-bg|line|primary)\b/g,
  dsElements: /<(?:envision-[a-z-]+|Button|IconButton|Link|Label|Badge|Checkbox|Switch|Input|Radio|Tab|MaterialSwatch|OptionCard|PackageCard|RightRail)[\s/>]/g,
  dsImports: /from '@envision\/(react|components|tokens)[^']*'/g,
};

function hardcoded(css) {
  const out = { color: [], length: [], shadow: [], type: [] };
  const noVars = css.replace(/var\([^)]*\)/g, 'VAR');
  for (const m of noVars.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g)) out.color.push(m[0]);
  for (const m of noVars.matchAll(/box-shadow\s*:\s*([^;]+);/g)) if (!/VAR|none/.test(m[1])) out.shadow.push(m[1].trim());
  for (const m of noVars.matchAll(/font-(?:size|weight)\s*:\s*([^;]+);/g)) if (!/VAR|inherit|bold|normal/.test(m[1])) out.type.push(m[1].trim());
  for (const m of noVars.matchAll(/(?<![\w.-])\d*\.?\d+(?:px|rem)\b/g)) if (!STRUCTURAL.test(m[0])) out.length.push(m[0]);
  return out;
}

const rows = [];
for (const dir of readdirSync(APP)) {
  const full = join(APP, dir);
  if (!statSync(full).isDirectory()) continue;
  const files = readdirSync(full);
  const cssFile = files.find((f) => f.endsWith('.css'));
  const tsxFile = files.find((f) => f.endsWith('.tsx'));
  const css = cssFile ? strip(readFileSync(join(full, cssFile), 'utf8')) : '';
  const tsx = tsxFile ? strip(readFileSync(join(full, tsxFile), 'utf8')) : '';
  const both = css + '\n' + tsx;
  const hc = hardcoded(css + '\n' + tsx);
  const count = (re) => (both.match(re) ?? []).length;
  rows.push({
    component: dir,
    lines: (css ? css.split('\n').length : 0) + (tsx ? tsx.split('\n').length : 0),
    canonical: count(PATTERNS.canonical),
    legacy: count(PATTERNS.legacyTheme) + count(PATTERNS.legacyApp) + count(PATTERNS.legacyBare),
    dsUsages: count(PATTERNS.dsElements),
    dsImports: count(PATTERNS.dsImports),
    hcColor: hc.color.length,
    hcLength: hc.length.length,
    hcShadow: hc.shadow.length,
    hcType: hc.type.length,
    hardcoded: hc.color.length + hc.length.length + hc.shadow.length + hc.type.length,
  });
}

const T = rows.reduce((a, r) => {
  for (const k of ['lines', 'canonical', 'legacy', 'dsUsages', 'dsImports', 'hcColor', 'hcLength', 'hcShadow', 'hcType', 'hardcoded']) a[k] = (a[k] ?? 0) + r[k];
  return a;
}, {});
T.componentsUsingDs = rows.filter((r) => r.dsUsages > 0).length;
T.componentsTotal = rows.length;
T.componentsFullyMigrated = rows.filter((r) => r.legacy === 0 && r.hardcoded === 0 && r.canonical > 0).length;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ rows, totals: T }, null, 2));
} else {
  rows.sort((a, b) => b.legacy + b.hardcoded - (a.legacy + a.hardcoded));
  const H = ['component', 'lines', 'DS uses', 'canonical', 'legacy', 'hardcoded'];
  console.log(H[0].padEnd(22) + H[1].padStart(7) + H[2].padStart(9) + H[3].padStart(11) + H[4].padStart(8) + H[5].padStart(11));
  console.log('-'.repeat(68));
  for (const r of rows) {
    console.log(r.component.padEnd(22) + String(r.lines).padStart(7) + String(r.dsUsages).padStart(9) +
      String(r.canonical).padStart(11) + String(r.legacy).padStart(8) + String(r.hardcoded).padStart(11));
  }
  console.log('-'.repeat(68));
  console.log('TOTAL'.padEnd(22) + String(T.lines).padStart(7) + String(T.dsUsages).padStart(9) +
    String(T.canonical).padStart(11) + String(T.legacy).padStart(8) + String(T.hardcoded).padStart(11));
  console.log(`\ncomponents touching the DS : ${T.componentsUsingDs}/${T.componentsTotal}`);
  console.log(`fully migrated             : ${T.componentsFullyMigrated}/${T.componentsTotal}`);
  console.log(`hardcoded breakdown        : color ${T.hcColor} · length ${T.hcLength} · shadow ${T.hcShadow} · type ${T.hcType}`);
}
