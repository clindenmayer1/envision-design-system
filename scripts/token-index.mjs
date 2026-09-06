/*
 * Flattens the DTCG token sources into one list, and is the single place that knows how a token
 * path becomes a CSS custom property.
 *
 * Three artifacts needed the same mapping and each had grown its own copy: the reference table in
 * packages/tokens/src, the registry's per-component dependency lists, and the docs claim verifier.
 * Copies drift, and the table had drifted far enough to advertise a `button/outline` family the
 * build has never emitted.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages/tokens/src');

/** Token files in build order. Responsive re-declares names for mobile, so it comes last and loses. */
const FILES = ['primitives.tokens.json', 'semantic.tokens.json', 'brand.tokens.json', 'components.tokens.json', 'responsive.tokens.json'];

export function tokenIndex() {
  const byCss = new Map();
  const rows = [];
  for (const file of FILES) {
    if (!readdirSync(SRC).includes(file)) continue;
    const walk = (node, path) => {
      if (node && typeof node === 'object' && '$value' in node) {
        const css = `--${path.join('-')}`;
        // The base declaration wins; a responsive override is the same token, not a new one.
        if (byCss.has(css)) return;
        const row = {
          path: path.join('/'),
          dotted: path.slice(1).join('.'),
          css,
          type: node.$type ?? '',
          value: node.$value,
          tier: path[1] ?? '',
          file,
        };
        byCss.set(css, row);
        rows.push(row);
        return;
      }
      for (const key of Object.keys(node ?? {})) {
        if (node[key] && typeof node[key] === 'object' && !key.startsWith('$')) walk(node[key], [...path, key]);
      }
    };
    walk(JSON.parse(readFileSync(join(SRC, file), 'utf8')), []);
  }
  return { rows, byCss };
}

/** `--envision-t2-border-radius-control` -> `t2.border-radius.control`, using real token paths. */
export function cssToDotted(css, byCss) {
  return byCss.get(css)?.dotted ?? null;
}
