import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync('packages/tokens/dist/tokens.css', 'utf8');
const declared = [...css.matchAll(/--([a-z0-9-]+)\s*:/g)].map((m) => m[1]);

const consumers = [];
for (const root of ['packages/components/src', 'packages/react/src', 'src']) {
  if (!existsSync(root)) continue;
  (function walk(d) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) { if (!/node_modules|dist/.test(e)) walk(p); }
      else if (/\.(ts|tsx|css)$/.test(e)) consumers.push(p);
    }
  })(root);
}
const blob = consumers.map((f) => readFileSync(f, 'utf8')).join('\n') + css;

// literal references
const used = new Set([...blob.matchAll(/var\(\s*--([a-z0-9-]+)/g)].map((m) => m[1]));
// dynamically constructed: var(--envision-t3-badge-${token}-color-background-default)
const dynamic = [...blob.matchAll(/var\(--([a-z0-9-]+)\$\{[^}]+\}([a-z0-9-]*)/g)]
  .map((m) => ({ pre: m[1], post: m[2] }));
const isDynamicallyUsed = (n) => dynamic.some((d) => n.startsWith(d.pre) && n.endsWith(d.post));

const dead = declared.filter((n) => !used.has(n) && !isDynamicallyUsed(n));

console.log('=== B1 (corrected). Tokens with no consumer, literal or dynamic ===');
console.log(`  declared ${declared.length} · unreferenced ${dead.length}`);
const t3dead = dead.filter((n) => /^envision-t3-/.test(n));
console.log(`\n  T3 component tokens with no consumer: ${t3dead.length}`);
const byComp = {};
for (const n of t3dead) {
  const comp = n.replace('envision-t3-', '').split('-').slice(0, 2).join('-');
  (byComp[comp] ??= []).push(n);
}
for (const [c, list] of Object.entries(byComp)) console.log(`      ${c.padEnd(22)} ${list.length}`);

// ---------------------------------------------------------------------------------------
// Do the documented "Token relationships" tables match what each component actually uses?
console.log('\n\n=== C1. Docs token tables vs real component usage ===');
const docs = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.mdx$/.test(e)) docs.push(p);
  }
})('packages/storybook/stories');

const compTokens = {};
for (const f of consumers) {
  if (!f.startsWith('packages/components/src/')) continue;
  const comp = f.split('/')[3];
  const src = readFileSync(f, 'utf8');
  compTokens[comp] ??= new Set();
  for (const m of src.matchAll(/--(envision-t[123]-[a-z0-9-]+)/g)) compTokens[comp].add(m[1]);
}

const DIR = {
  Button: 'button', Badge: 'badge', Checkbox: 'checkbox', IconButton: 'icon-button',
  Label: 'label', Link: 'link', Radio: 'radio', Switch: 'switch', Tab: 'tab',
  MaterialSwatch: 'material-swatch', OptionCard: 'option-card', PackageCard: 'package-card',
  Input: 'input', RightRail: 'right-rail',
};

let claims = 0, wrong = 0;
for (const f of docs) {
  const name = f.split('/').pop().replace('.mdx', '');
  const dir = DIR[name];
  if (!dir || !compTokens[dir]) continue;
  const src = readFileSync(f, 'utf8');
  // token names cited inside the doc, ignoring {a,b,c} brace expansions and trailing wildcards
  const cited = [...src.matchAll(/`--(envision-t[123]-[a-z0-9-]+)`/g)].map((m) => m[1]);
  for (const c of cited) {
    claims++;
    const real = [...compTokens[dir]];
    const ok = real.some((r) => r === c || r.startsWith(c) || c.startsWith(r));
    if (!ok) { console.log(`  ${name.padEnd(16)} documents --${c}  but the component never references it`); wrong++; }
  }
}
console.log(`\n  ${claims} exact token citations checked · ${wrong} unsupported`);
