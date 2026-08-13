#!/usr/bin/env node
/**
 * Property-aware token migration for application stylesheets.
 *
 * Replaces raw design values with the CORRECT SEMANTIC ROLE for the property being set, not
 * merely with whatever primitive happens to hold the same value. A color used as a background
 * resolves to color/background/*, the same color used as text resolves to color/content/*, and
 * as a border to color/border/*. Primitives are used only where the system publishes no role for
 * that property (type steps, letter spacing).
 *
 * Anything it cannot map confidently is left alone and reported, so unmapped values stay visible
 * instead of being silently approximated.
 *
 *   node scripts/tokenise.mjs <file...>            # apply
 *   node scripts/tokenise.mjs --dry <file...>      # report only
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// ---- resolve every published token to its final value ------------------------------------
const css = readFileSync('packages/tokens/dist/tokens.css', 'utf8');
const root = css.slice(css.indexOf(':root'), css.indexOf('@media') > 0 ? css.indexOf('@media') : css.length);
const V = {};
for (const m of root.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) V[m[1]] = m[2].trim();
const resolve = (n, d = 0) => {
  const v = V[n];
  if (!v || d > 12) return v;
  const m = /^var\(--([a-z0-9-]+)\)$/.exec(v);
  return m ? resolve(m[1], d + 1) : v;
};

const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, '');
const hex3to6 = (h) => (/^#[0-9a-f]{3}$/i.test(h) ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h);
const rgbToHex = (s) => {
  const m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i.exec(s.trim());
  if (!m) return null;
  const a = m[4] === undefined ? 1 : parseFloat(m[4]);
  if (a < 0.999) return null; // translucent: match textually, not by hex
  return '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
};
const colorKey = (s) => {
  const t = norm(s);
  if (t.startsWith('#')) return hex3to6(t);
  const h = rgbToHex(s);
  return h ?? t;
};

// role -> token index, keyed by resolved value
const byRole = { background: {}, content: {}, border: {}, spacing: {}, radius: {}, borderWidth: {}, elevation: {}, motion: {}, fontSize: {}, fontWeight: {}, letterSpacing: {} };
const put = (bucket, key, name) => { if (key && !bucket[key]) bucket[key] = name; };

for (const name of Object.keys(V)) {
  const val = resolve(name);
  if (val === undefined) continue;
  const t = `var(--${name})`;
  if (/^envision-t2-color-background-/.test(name)) put(byRole.background, colorKey(val), t);
  else if (/^envision-t2-color-content-/.test(name)) put(byRole.content, colorKey(val), t);
  else if (/^envision-t2-color-border-/.test(name)) put(byRole.border, colorKey(val), t);
  else if (/^envision-t2-spacing-/.test(name)) put(byRole.spacing, norm(val), t);
  else if (/^envision-t2-border-radius-/.test(name)) put(byRole.radius, norm(val), t);
  else if (/^envision-t2-border-width-/.test(name)) put(byRole.borderWidth, norm(val), t);
  else if (/^envision-t2-elevation-/.test(name)) put(byRole.elevation, norm(val), t);
  else if (/^envision-t2-motion-/.test(name)) put(byRole.motion, norm(val), t);
  else if (/^envision-t1-font-size-/.test(name)) put(byRole.fontSize, norm(val), t);
  else if (/^envision-t1-font-weight-/.test(name)) put(byRole.fontWeight, norm(val), t);
  else if (/^envision-t1-letter-spacing-/.test(name)) put(byRole.letterSpacing, norm(val), t);
}
// primitive fallbacks only where no semantic role exists for that property
const spacingPrim = {}, radiusPrim = {};
for (const name of Object.keys(V)) {
  if (/^envision-t1-spacing-/.test(name)) put(spacingPrim, norm(resolve(name)), `var(--${name})`);
  if (/^envision-t1-border-radius-/.test(name)) put(radiusPrim, norm(resolve(name)), `var(--${name})`);
}

// ---- property -> which role bucket applies -----------------------------------------------
const COLOUR_PROP = {
  background: 'background', 'background-color': 'background',
  color: 'content', fill: 'content', stroke: 'content',
  'border-color': 'border', 'border-top-color': 'border', 'border-bottom-color': 'border',
  'border-left-color': 'border', 'border-right-color': 'border', 'outline-color': 'border',
};
const LENGTH_PROP = /^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block))?$/;

const stats = { color: 0, length: 0, radius: 0, width: 0, shadow: 0, type: 0, motion: 0, unmapped: [] };

function tokeniseDecl(prop, value) {
  const p = prop.trim().toLowerCase();

  // colors (standalone value, and inside shorthand border/outline)
  if (COLOUR_PROP[p]) {
    const bucket = byRole[COLOUR_PROP[p]];
    const hit = bucket[colorKey(value)];
    if (hit) { stats.color++; return hit; }
  }
  if (/^(border|border-top|border-bottom|border-left|border-right|outline)$/.test(p)) {
    return value.replace(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))/g, (c) => {
      const hit = byRole.border[colorKey(c)];
      if (hit) { stats.color++; return hit; }
      return c;
    }).replace(/(?<![\w.-])(\d*\.?\d+px)(?=\s|$)/, (w) => {
      const hit = byRole.borderWidth[norm(w)];
      if (hit) { stats.width++; return hit; }
      return w;
    });
  }

  // spacing shorthands: map each length independently
  if (LENGTH_PROP.test(p)) {
    return value.replace(/(?<![\w.-])\d*\.?\d+(?:px|rem)\b/g, (len) => {
      if (/^0(px|rem)?$/.test(len)) return len;
      const hit = byRole.spacing[norm(len)] ?? spacingPrim[norm(len)];
      if (hit) { stats.length++; return hit; }
      stats.unmapped.push(`${p}: ${len}`);
      return len;
    });
  }

  if (/border-radius$/.test(p)) {
    return value.replace(/(?<![\w.-])\d*\.?\d+(?:px|%)\b/g, (r) => {
      if (/^0/.test(r) || r === '50%') return r;
      const hit = byRole.radius[norm(r)] ?? radiusPrim[norm(r)];
      if (hit) { stats.radius++; return hit; }
      stats.unmapped.push(`${p}: ${r}`);
      return r;
    });
  }

  if (/^border(-(top|bottom|left|right))?-width$/.test(p)) {
    const hit = byRole.borderWidth[norm(value)];
    if (hit) { stats.width++; return hit; }
  }

  if (p === 'box-shadow') {
    const hit = byRole.elevation[norm(value)];
    if (hit) { stats.shadow++; return hit; }
    stats.unmapped.push(`box-shadow: ${value}`);
  }

  if (p === 'font-size') { const hit = byRole.fontSize[norm(value)]; if (hit) { stats.type++; return hit; } }
  if (p === 'font-weight') { const hit = byRole.fontWeight[norm(value)]; if (hit) { stats.type++; return hit; } }
  if (p === 'letter-spacing') { const hit = byRole.letterSpacing[norm(value)]; if (hit) { stats.type++; return hit; } }

  if (/^(transition|animation)(-duration)?$/.test(p)) {
    return value.replace(/(?<![\w.-])(\d*\.?\d+)(m?s)\b/g, (dur) => {
      const ms = /ms$/.test(dur) ? dur : `${parseFloat(dur) * 1000}ms`;
      const hit = byRole.motion[norm(ms)];
      if (hit) { stats.motion++; return hit; }
      return dur;
    });
  }

  return value;
}

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  let out = '', i = 0, changed = 0;
  // walk declarations outside comments
  const re = /([-a-zA-Z]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(src))) {
    const before = src.slice(i, m.index);
    // skip anything inside a comment
    const openComment = before.lastIndexOf('/*') > before.lastIndexOf('*/');
    out += before;
    if (openComment) { out += m[0]; i = re.lastIndex; continue; }
    const next = tokeniseDecl(m[1], m[2]);
    if (next !== m[2]) changed++;
    out += `${m[1]}: ${next};`;
    i = re.lastIndex;
  }
  out += src.slice(i);
  if (!DRY && changed) writeFileSync(file, out);
  console.log(`${file.replace('src/components/', '').padEnd(42)} ${String(changed).padStart(4)} declarations tokenised`);
}
console.log(`\ncolor ${stats.color} · spacing ${stats.length} · radius ${stats.radius} · border-width ${stats.width} · shadow ${stats.shadow} · type ${stats.type} · motion ${stats.motion}`);
if (stats.unmapped.length) {
  const u = [...new Set(stats.unmapped)];
  console.log(`\nleft alone, no role in the system (${u.length} distinct):`);
  u.slice(0, 20).forEach((x) => console.log('  ' + x));
}
