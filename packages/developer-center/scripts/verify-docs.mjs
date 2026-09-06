/**
 * Documentation guard.
 *
 * Verifies the two things most likely to break silently as the site grows:
 *   1. every route in the canonical Foundations and Design Tokens orders is registered in App.tsx
 *   2. every documentation article uses the DocArticle template rather than a bespoke shell
 *
 * Run: npm run verify -w @envision/developer-center
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const app = readFileSync(join(src, 'App.tsx'), 'utf8');
const routes = new Set([...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));

const fail = [];
const ok = [];

// ---- 1. canonical orders are fully routed ----------------------------------------------------
const orderFrom = (file, constName) => {
  const s = readFileSync(join(src, 'pages', file), 'utf8');
  const block = s.slice(s.indexOf(`${constName}: Array<[string, string]> = [`));
  return [...block.slice(0, block.indexOf('];')).matchAll(/'([^']*)', '(\/[^']*)'/g)].map((m) => m[2]);
};
for (const [file, name, label] of [
  ['FoundationArticles.tsx', 'ORDER', 'Foundations'],
  ['TokenLayers.tsx', 'TOKEN_ORDER', 'Design Tokens'],
]) {
  const paths = orderFrom(file, name);
  if (!paths.length) fail.push(`${label}: canonical order could not be parsed from ${file}`);
  for (const p of paths) {
    if (routes.has(p)) ok.push(`${label} route registered: ${p}`);
    else fail.push(`${label}: "${p}" is in the canonical order but has no route in App.tsx`);
  }
}

// ---- 2. no article rebuilds the shell ---------------------------------------------------------
for (const f of readdirSync(join(src, 'pages')).filter((f) => f.endsWith('.tsx'))) {
  const s = readFileSync(join(src, 'pages', f), 'utf8');
  if (s.includes('dc-article-layout')) {
    fail.push(`${f}: rebuilds the article shell. Use the DocArticle template instead.`);
  } else ok.push(`${f}: no duplicated article shell`);
}

console.log(`${ok.length} checks passed, ${fail.length} failed`);
for (const f of fail) console.error(`  FAIL  ${f}`);
process.exit(fail.length ? 1 : 0);
