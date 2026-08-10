#!/usr/bin/env node
/**
 * Remove hardcoded fallbacks from `var(--envision-*, <fallback>)` in component styles.
 *
 * Components must render from the generated token pipeline (packages/tokens -> DTCG JSON ->
 * Style Dictionary -> --envision-* custom properties) and nothing else. A literal fallback is a
 * second, silent source of truth: it drifts the moment a token changes, and it hides a missing
 * token instead of surfacing it. An audit found 81 of 229 fallbacks already disagreeing with the
 * token they shadowed.
 *
 * Only touches var() references to --envision-* inside the component source; parses with balanced
 * parens so nested values such as rgba(...) are handled correctly.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (extname(p) === '.ts' && !p.includes('.test.')) out.push(p);
  }
  return out;
}

/** Rewrite every `var(--envision-x, fallback)` to `var(--envision-x)`. */
function stripFallbacks(src) {
  let out = '';
  let i = 0;
  let removed = 0;
  while (i < src.length) {
    const start = src.indexOf('var(--envision-', i);
    if (start === -1) { out += src.slice(i); break; }
    out += src.slice(i, start);

    // scan the var(...) with balanced parens
    let depth = 0, j = start + 3, commaAt = -1;
    for (; j < src.length; j++) {
      const c = src[j];
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) break; }
      else if (c === ',' && depth === 1 && commaAt === -1) commaAt = j;
    }
    if (j >= src.length) { out += src.slice(start); break; }

    const name = src.slice(start + 4, commaAt === -1 ? j : commaAt).trim();
    out += `var(${name})`;
    if (commaAt !== -1) removed++;
    i = j + 1;
  }
  return { out, removed };
}

let files = 0, total = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  const { out, removed } = stripFallbacks(src);
  if (removed > 0) {
    writeFileSync(file, out);
    files++; total += removed;
    console.log(`  ${basename(file).padEnd(22)} ${removed} fallback${removed === 1 ? '' : 's'} removed`);
  }
}
console.log(`\n${total} hardcoded fallbacks removed across ${files} files`);
