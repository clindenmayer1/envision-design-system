#!/usr/bin/env node
/**
 * Undefined-token audit.
 *
 * Every `var(--envision-*)` a component references must be DEFINED by the published token sheet.
 * A reference to a token that does not exist makes the whole declaration invalid, and CSS drops
 * it silently — so a retired token does not fail a build, it deletes a component's padding.
 *
 * Reports, per file, every referenced custom property with no definition and no fallback.
 *
 *   node scripts/verify-token-refs.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS = 'packages/tokens/dist/tokens.css';
const ROOTS = ['packages/components/src', 'packages/react/src', 'src'];

const files = [];
for (const root of ROOTS) {
  (function walk(d) {
    let entries;
    try { entries = readdirSync(d); } catch { return; }
    for (const e of entries) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) { if (e !== 'node_modules' && e !== 'dist') walk(p); }
      else if (/\.(ts|tsx|css)$/.test(e) && !/\.test\./.test(e)) files.push(p);
    }
  })(root);
}

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

// A property counts as defined if the published token sheet declares it, OR if any scanned
// stylesheet declares it — the application keeps its own legacy `--envision-theme-*` layer in
// src/styles, and treating those as undefined would bury the real defects in false positives.
const defined = new Set([...readFileSync(TOKENS, 'utf8').matchAll(/--([a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
for (const f of files) {
  for (const m of strip(readFileSync(f, 'utf8')).matchAll(/(--envision-[a-z0-9-]+)\s*:/gi)) {
    defined.add(m[1].slice(2));
  }
}

const findings = [];
for (const f of files) {
  const src = strip(readFileSync(f, 'utf8'));
  const seen = new Map();
  // var(--name) with no fallback — `var(--name, fallback)` degrades safely, a bare one does not
  for (const m of src.matchAll(/var\(\s*(--envision-[a-z0-9-]+)\s*\)/gi)) {
    const name = m[1].slice(2);
    if (defined.has(name)) continue;
    // locate the declaration this reference sits in, so the report names the property it kills
    const before = src.slice(0, m.index);
    const declStart = Math.max(before.lastIndexOf(';'), before.lastIndexOf('{'), before.lastIndexOf('\n'));
    const prop = (src.slice(declStart + 1, m.index).match(/([-a-z]+)\s*:/i) ?? [])[1] ?? '?';
    const line = before.split('\n').length;
    const key = `${name}|${prop}`;
    if (!seen.has(key)) seen.set(key, { name, prop, line });
  }
  if (seen.size) findings.push({ file: f, refs: [...seen.values()] });
}

if (!findings.length) {
  console.log(`token references: every var(--envision-*) in ${files.length} files resolves against ${TOKENS}`);
  process.exit(0);
}

let total = 0;
console.log('UNDEFINED TOKEN REFERENCES\n');
console.log('Each of these silently invalidates its declaration — the property is dropped entirely.\n');
for (const { file, refs } of findings) {
  console.log(file);
  for (const r of refs) {
    console.log(`  line ${String(r.line).padStart(4)}  ${r.prop.padEnd(22)} var(--${r.name})`);
    total++;
  }
  console.log('');
}
console.log(`${total} undefined reference(s) across ${findings.length} file(s)`);
process.exit(1);
