#!/usr/bin/env node
/**
 * Component-taxonomy verification.
 *
 * The Envision component taxonomy has exactly ONE source of truth:
 * `packages/design-system/component-registry.json` — `meta.componentTaxonomy.order` for the
 * category list and order, and `category` on each component for membership.
 *
 * Everything downstream (Storybook sidebar, docs, manifests) must DERIVE its grouping from that
 * file. This script fails if any consumer has drifted or has grown a parallel hand-maintained
 * list, and if the inventory invariants stop holding.
 *
 *   node scripts/verify-taxonomy.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const REGISTRY = 'packages/design-system/component-registry.json';
const STORIES = 'packages/storybook/stories';
const PREVIEW = 'packages/storybook/.storybook/preview.ts';

const fail = [];
const ok = [];
const check = (cond, msg) => (cond ? ok.push(msg) : fail.push(msg));

const reg = JSON.parse(readFileSync(REGISTRY, 'utf8'));
const taxonomy = reg.meta?.componentTaxonomy;
const CATEGORIES = taxonomy?.order ?? [];
const components = reg.components;

// ---- 1. the taxonomy declaration itself ---------------------------------------------------
check(Array.isArray(CATEGORIES) && CATEGORIES.length === 7, `meta.componentTaxonomy.order declares 7 categories (got ${CATEGORIES.length})`);
check(new Set(CATEGORIES).size === CATEGORIES.length, 'no duplicate category names');

// ---- 2. inventory invariants ---------------------------------------------------------------
const names = components.map((c) => c.displayName);
const ids = components.map((c) => c.id);
check(components.length === 52, `52 registered entries (got ${components.length})`);
check(new Set(names).size === names.length, 'no duplicate displayName');
check(new Set(ids).size === ids.length, 'no duplicate id');

const pub = components.filter((c) => c.public);
const internal = components.filter((c) => !c.public);
check(pub.length === 50, `50 public components (got ${pub.length})`);
check(internal.length === 2, `2 internal subcomponents (got ${internal.length})`);

// ---- 3. category membership ----------------------------------------------------------------
for (const c of pub) {
  check(
    CATEGORIES.includes(c.category),
    `public "${c.displayName}" has a canonical category (got ${JSON.stringify(c.category)})`,
  );
}
for (const c of internal) {
  check(c.category === null, `internal "${c.displayName}" carries category: null (got ${JSON.stringify(c.category)})`);
}
// every category is represented — a category with no members is a taxonomy error, but a category
// with exactly one member is legitimate (Feedback & Guidance).
for (const cat of CATEGORIES) {
  check(pub.some((c) => c.category === cat), `category "${cat}" has at least one component`);
}

// ---- 4. the architectural axis survived intact ----------------------------------------------
// Specified components must keep their atomic level. Inventory records (`specified: false`) carry
// `architecture: null` on purpose — the level has never been defined for them, and guessing one
// would fabricate a classification nobody approved.
const ARCH = new Set(['control-primitive', 'product-component', 'composite-pattern', 'internal-subcomponent']);
for (const c of components) {
  if (c.specified === false) {
    check(c.architecture === null, `unspecified "${c.displayName}" leaves architecture null (got ${JSON.stringify(c.architecture)})`);
  } else {
    check(ARCH.has(c.architecture), `"${c.displayName}" retains its architecture classification (got ${JSON.stringify(c.architecture)})`);
  }
}
check(
  components.every((c) => typeof c.maturity === 'string' && typeof c.figmaStatus === 'string'),
  'implementation status (maturity + figmaStatus) preserved on every entry',
);

// ---- 5. Storybook derives its grouping from the registry -------------------------------------
const storyFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.stories\.(ts|js)$/.test(e)) storyFiles.push(p);
  }
})(STORIES);

// A story title is DERIVED, not authored: `Components/<category>/<displayName>`, both read from
// the registry. Note displayName may itself contain a slash (RightRail/Tab), which Storybook
// renders as a nested group — that is intentional and matches the published component name.
const expected = new Map(
  components.filter((c) => c.public).map((c) => [`Components/${c.category}/${c.displayName}`, c]),
);
const claimed = new Set();
for (const f of storyFiles) {
  const m = /title: '([^']+)'/.exec(readFileSync(f, 'utf8'));
  if (!m) { fail.push(`${f} declares no story title`); continue; }
  const title = m[1];
  const entry = expected.get(title);
  if (!entry) {
    const guess = components.find((c) => title.endsWith(`/${c.displayName}`));
    fail.push(
      `${f}: title "${title}" is not Components/<category>/<displayName> for any public component` +
      (guess ? ` — "${guess.displayName}" would be "Components/${guess.category}/${guess.displayName}"` : ''),
    );
    continue;
  }
  if (claimed.has(title)) fail.push(`${f}: duplicate story title "${title}"`);
  claimed.add(title);
  ok.push(`${entry.displayName}: story title derives from the registry ("${title}")`);
}

// ---- 6. the sidebar order is the registry order, not a parallel list --------------------------
const preview = readFileSync(PREVIEW, 'utf8');
const block = /'Components',\s*\[([\s\S]*?)\]/.exec(preview);
if (!block) fail.push(`${PREVIEW}: no Components storySort block found`);
else {
  const listed = [...block[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).filter((x) => x !== '*');
  check(
    JSON.stringify(listed) === JSON.stringify(CATEGORIES),
    `storySort category order matches the registry exactly\n     registry: ${CATEGORIES.join(' | ')}\n     preview : ${listed.join(' | ')}`,
  );
}

// ---- report ----------------------------------------------------------------------------------
// Alphabetisation ignores spaces and punctuation, so `SelectionCard` sorts before
// `Selection Indicator` rather than after it on a raw ASCII compare.
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const byAlpha = (a, b) => norm(a).localeCompare(norm(b));
const CATS = {};
for (const c of pub) (CATS[c.category] ??= []).push(c.displayName);
console.log('Envision component taxonomy\n');
for (const cat of CATEGORIES) {
  console.log(`  ${cat}`);
  for (const n of (CATS[cat] ?? []).sort(byAlpha)) console.log(`    - ${n}`);
}
console.log('  Internal');
for (const n of internal.map((c) => c.displayName).sort(byAlpha)) console.log(`    - ${n}`);

console.log(`\n${ok.length} checks passed, ${fail.length} failed`);
console.log(`inventory: ${pub.length} public + ${internal.length} internal = ${components.length} entries`);
if (fail.length) {
  console.error('\nFAILED:');
  for (const f of fail) console.error('  x ' + f);
  process.exit(1);
}
