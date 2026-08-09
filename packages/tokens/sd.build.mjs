// sd.build.mjs — Style Dictionary build for Envision design tokens.
// Consumes the DTCG files in ./tokens and emits:
//   - CSS custom properties with the alias chain preserved (outputReferences)
//   - a responsive @media block driven by $extensions["envision.responsive"].mobile
//   - typed TypeScript/JS exports
// The desktop $value is the :root default; mobile overrides the SAME custom property
// inside a single max-width media query at the Envision tablet breakpoint. Nothing is
// invented — every responsive value comes from the Figma-derived token metadata.
// Run: node design-system/sd.build.mjs
import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { flatten, collectResponsive, RESP_NS } from './lib/responsive.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tokensDir = join(here, 'src');
const buildDir = join(here, 'dist');

// dimension (number) -> "16px". Unitless types (number, fontWeight, lineHeight) pass through.
StyleDictionary.registerTransform({
  name: 'envision/dimension-px',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'dimension' && typeof t.$value === 'number',
  transform: (t) => `${t.$value}px`,
});
// duration (ms) -> "200ms"
StyleDictionary.registerTransform({
  name: 'envision/duration-ms',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'duration' && typeof t.$value === 'number',
  transform: (t) => `${t.$value}ms`,
});

const sd = new StyleDictionary({
  source: [`${tokensDir}/*.tokens.json`],
  platforms: {
    css: {
      transforms: ['attribute/cti', 'name/kebab', 'color/css', 'envision/dimension-px', 'envision/duration-ms'],
      buildPath: `${buildDir}/`,
      options: { outputReferences: true }, // keep var(--…) chains, don't flatten to raw values
      files: [
        { destination: 'tokens.css', format: 'css/variables' }, // all tiers, the full chain
        { destination: 'primitives.css', format: 'css/variables', filter: (t) => t.path[1] === 't1' },
        { destination: 'semantic.css', format: 'css/variables', filter: (t) => t.path[1] === 't2' },
        { destination: 'components.css', format: 'css/variables', filter: (t) => t.path[1] === 't3' },
      ],
    },
    ts: {
      transformGroup: 'js', // camelCase names, resolved values for JS/TS consumers
      buildPath: `${buildDir}/`,
      files: [
        { destination: 'tokens.js', format: 'javascript/es6' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
      ],
    },
  },
});

await sd.buildAllPlatforms();

// ── Responsive layer ────────────────────────────────────────────────────────
// SD doesn't process $extensions, so we build the media-query overrides directly
// from the DTCG source (see ./lib/responsive.mjs for the pure, tested logic).
// Load every DTCG file (sorted → deterministic) and flatten to a token list.
const files = readdirSync(tokensDir).filter((f) => f.endsWith('.tokens.json')).sort();
const tokens = [];
for (const f of files) flatten(JSON.parse(readFileSync(join(tokensDir, f), 'utf8')), [], tokens);

// Breakpoint is DERIVED, not invented: the Envision tablet primitive (== the app's
// dominant max-width media query).
const bpTok = tokens.find((t) => t.path === 'envision.t1.breakpoint.tablet');
const breakpoint = bpTok ? bpTok.value : null;

const { overrides, errors, responsiveCount } = collectResponsive(tokens);
if (breakpoint == null) errors.unshift("primitive 'envision.t1.breakpoint.tablet' not found — cannot derive the responsive breakpoint");
if (errors.length) {
  throw new Error('Responsive token validation failed:\n  - ' + errors.join('\n  - '));
}

const banner =
  `\n/* ── Responsive overrides ──────────────────────────────────────────────────\n` +
  `   Generated from $extensions["${RESP_NS}"].mobile. The desktop value in :root\n` +
  `   above is the default; below ${breakpoint}px (Envision tablet breakpoint) the\n` +
  `   SAME custom property resolves to its mobile value. References preserved. */\n`;
const mediaBlock = overrides.length
  ? `@media (max-width: ${breakpoint}px) {\n  :root {\n` +
    overrides.map((o) => `    ${o.name}: ${o.css};`).join('\n') +
    `\n  }\n}\n`
  : '';

// tokens.css becomes self-complete (desktop :root + responsive @media).
appendFileSync(join(buildDir, 'tokens.css'), banner + mediaBlock);
// Standalone responsive layer for consumers composing from the per-tier splits.
writeFileSync(
  join(buildDir, 'tokens.responsive.css'),
  `/* Envision responsive overrides — import AFTER the base custom properties. */\n` + mediaBlock,
);

console.log(
  `style-dictionary: built css + ts. Responsive: ${overrides.length} mobile override(s) ` +
    `@ max-width ${breakpoint}px (validated ${responsiveCount} responsive tokens).`,
);
