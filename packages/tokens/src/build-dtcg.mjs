// build-dtcg.mjs
// Parses design-system/tokens/_figma-export.txt (a snapshot of the Envision Figma
// variables) and emits DTCG-format token files, one per tier/collection, with
// ALIASES PRESERVED as {envision.t1.color.green.500}-style references (not resolved
// to raw values). Style Dictionary then consumes these. Run: node scripts/build-dtcg.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// This script lives alongside the DTCG source in packages/tokens/src.
const dir = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(dir, '_figma-export.txt'), 'utf8');

// --- parse the pipe-delimited export into tier buckets ---
const tiers = { t1: [], t2: [], t3: [] };
let cur = null;
for (const line of raw.split('\n').map((l) => l.trim())) {
  const m = line.match(/^#\s*=====\s*(t[123])\s*=====/);
  if (m) { cur = m[1]; continue; }
  if (!line || line.startsWith('#') || !cur) continue;
  const [name, type, value, mobile] = line.split('|');
  tiers[cur].push({ name, type, value, mobile });
}

// alias ("=envision.x.y") -> DTCG reference "{envision.x.y}"; else number or string
const toVal = (v) =>
  v === undefined ? undefined
  : v.startsWith('=') ? `{${v.slice(1)}}`
  : /^-?\d+(\.\d+)?$/.test(v) ? Number(v)
  : v;

const setPath = (obj, path, leaf) => {
  const p = path.split('/');
  let o = obj;
  for (let i = 0; i < p.length - 1; i++) o = (o[p[i]] ??= {});
  o[p[p.length - 1]] = leaf;
};

const leaf = (t) => {
  const l = { $type: t.type, $value: toVal(t.value) };
  // Responsive tokens carry a mobile override; stash it for a future media-query build.
  if (t.mobile !== undefined) l.$extensions = { 'envision.responsive': { mobile: toVal(t.mobile) } };
  return l;
};

// --- Tier 1 ---
const t1 = {};
for (const t of tiers.t1) setPath(t1, t.name, leaf(t));

// --- Tier 2, split into brand / semantic / responsive ---
const BRAND = new Set(['color/content/on-primary/default', 'font-family/display', 'font-family/wordmark']);
const isBrand = (n) => /^color\/(primary|accent)\//.test(n) || BRAND.has(n);
const brand = {}, semantic = {}, responsive = {};
for (const t of tiers.t2) {
  if (t.mobile !== undefined) setPath(responsive, t.name, leaf(t));
  else if (isBrand(t.name)) setPath(brand, t.name, leaf(t));
  else setPath(semantic, t.name, leaf(t));
}

// --- Tier 3 ---
const t3 = {};
for (const t of tiers.t3) setPath(t3, t.name, leaf(t));

// Note: no root-level $description — Style Dictionary merges all files into one tree
// and sibling root $descriptions would collide. Tier docs live in the export header + README.
const wrap = (_desc, tier, tree) =>
  JSON.stringify({ envision: { [tier]: tree } }, null, 2) + '\n';

const files = [
  ['primitives.tokens.json', wrap('Envision, TIER 1 PRIMITIVES (raw ingredients, no UI meaning). Never consume directly; consume Tier 2/3 aliases. Generated from Figma by scripts/build-dtcg.mjs.', 't1', t1)],
  ['brand.tokens.json', wrap('Envision, TIER 2 BRAND. Themeable brand ramp + brand fonts; the white-label seam. Aliases Tier 1.', 't2', brand)],
  ['semantic.tokens.json', wrap('Envision, TIER 2 SEMANTIC (roles). color/{property}/{variant}/{state} + spacing/border-radius/border-width/layer/motion/size. Components consume these. Aliases Tier 1/2.', 't2', semantic)],
  ['responsive.tokens.json', wrap('Envision, TIER 2 RESPONSIVE. $value is the desktop value; the mobile override lives in $extensions["envision.responsive"].mobile for a future media-query build.', 't2', responsive)],
  ['components.tokens.json', wrap('Envision, TIER 3 COMPONENT tokens. Only where a component has a durable need Tier 2 cannot express. Aliases Tier 2 where possible, Tier 1 only when no semantic role exists.', 't3', t3)],
];

for (const [name, content] of files) writeFileSync(join(dir, name), content);
console.log('build-dtcg: wrote', files.map((f) => f[0]).join(', '));
