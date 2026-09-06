/**
 * Generates the Developer Center's data layer from the ACTUAL system, never from hand-written
 * copies. Part LIII of the build specification: do not manually duplicate facts that can be
 * generated. Everything this file emits is traceable to a source of truth:
 *
 *   component-registry.json  -> component inventory, categories, purpose, states, a11y, tokens
 *   storybook-static/index.json -> verified Storybook story ids (links that actually resolve)
 *   packages/tokens/dist/tokens.css -> the real token names and resolved values
 *   packages/<name>/package.json -> real package names and versions
 *
 * Anything that cannot be resolved is emitted as null so the UI can render an explicit
 * "Implementation detail pending verification" placeholder rather than inventing a value.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..');
const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p));

// ---- 1. component registry -------------------------------------------------------------------
const registry = readJson(join(repo, 'packages/design-system/component-registry.json'));
const taxonomy = registry.meta.componentTaxonomy;

// ---- 2. verified Storybook story ids ----------------------------------------------------------
// Only ids present in the built index are emitted. A component with no built stories gets null,
// which the UI renders as "no Storybook reference yet" instead of a dead link.
const sbIndexPath = join(repo, 'packages/storybook/storybook-static/index.json');
const sbEntries = existsSync(sbIndexPath) ? Object.values(readJson(sbIndexPath).entries) : [];
if (!sbEntries.length) {
  console.warn('[generate-data] storybook-static/index.json not found — Storybook links will be null.');
}
const STORYBOOK_URL = 'https://envision-storybook.pages.dev';

/** Story ids grouped by their Storybook title, e.g. "Components/Action/Button". */
const byTitle = new Map();
for (const e of sbEntries) {
  if (!byTitle.has(e.title)) byTitle.set(e.title, { docs: null, stories: [] });
  const slot = byTitle.get(e.title);
  if (e.type === 'docs') slot.docs = e.id;
  // `dev` is stripped from single-state stories that are reachable via controls; they are still
  // real stories, but they are not navigation targets, so they are not offered as entry links.
  else if ((e.tags ?? []).includes('dev')) slot.stories.push({ id: e.id, name: e.name });
}

// ---- 3. real token data -----------------------------------------------------------------------
const tokensCss = read(join(repo, 'packages/tokens/dist/tokens.css'));
const tokens = [];
const seen = new Set();
for (const m of tokensCss.matchAll(/--(envision-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  const name = `--${m[1]}`;
  if (seen.has(name)) continue; // responsive re-declarations repeat names; keep the base
  seen.add(name);
  const raw = m[2].trim();
  const alias = /^var\(\s*(--envision-[a-z0-9-]+)/.exec(raw);
  tokens.push({
    name,
    tier: m[1].startsWith('envision-t1') ? 1 : m[1].startsWith('envision-t2') ? 2 : 3,
    value: raw,
    alias: alias ? alias[1] : null,
  });
}
/** Follow an alias chain to the literal value, so token tables can show both. */
const byName = new Map(tokens.map((t) => [t.name, t]));
for (const t of tokens) {
  let cur = t, hops = 0;
  while (cur.alias && byName.has(cur.alias) && hops++ < 12) cur = byName.get(cur.alias);
  t.resolved = cur.alias ? null : cur.value;
}

// ---- 4. real packages -------------------------------------------------------------------------
const packages = readdirSync(join(repo, 'packages'))
  .map((d) => join(repo, 'packages', d, 'package.json'))
  .filter(existsSync)
  .map((p) => {
    const j = readJson(p);
    return { name: j.name, version: j.version, private: !!j.private, description: j.description ?? null };
  });

// ---- 5. which components actually exist in code ------------------------------------------------
const implemented = new Set(
  readdirSync(join(repo, 'packages/components/src'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'base')
    .map((d) => d.name),
);

// ---- 6. assemble components --------------------------------------------------------------------
const components = registry.components.map((c) => {
  const title = c.public !== false && c.category ? `Components/${c.category}/${c.displayName}` : null;
  const sb = title ? byTitle.get(title) ?? null : null;
  // A registry `codeName` maps to a kebab source directory in @envision/components.
  const dir = (c.codeName ?? c.displayName)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return {
    id: c.id,
    name: c.displayName,
    category: c.category,
    categoryPrevious: c.categoryPrevious ?? null,
    internal: c.public === false,
    maturity: c.maturity ?? null,
    figmaStatus: c.figmaStatus ?? null,
    specified: c.specified !== false,
    implemented: implemented.has(dir),
    tag: c.webComponentPackage ? `envision-${dir}` : null,
    purpose: c.purpose ?? null,
    whenToUse: c.whenToUse ?? null,
    whenNotToUse: c.whenNotToUse ?? null,
    anatomy: c.anatomy ?? null,
    // Sourced from the component's anatomy frame in the Figma library. Its presence is what decides
    // whether the site shows an Anatomy section at all.
    anatomyNote: c.anatomyNote ?? null,
    // The rules that govern how a component acts, which Figma carries as its Behavior Rules
    // panel and the docs had no place for.
    behavior: c.behavior ?? null,
    // Where a component ships in the product when it is not in the Figma library. A component
    // can exist without being drawn, and `figmaStatus` only ever described the design file.
    productImplementation: c.productImplementation ?? null,
    // The numbered parts of the anatomy, from the Figma anatomy frame. Data, not a screenshot:
    // the page draws the markers over the real element so they stay crisp at any zoom.
    anatomyParts: c.anatomyParts ?? null,
    anatomyAxis: c.anatomyAxis ?? null,
    anatomySpecimenWidth: c.anatomySpecimenWidth ?? null,
    // The library's variant axes. For a component that is drawn but not built this is the
    // only complete list of what it varies on.
    figmaProperties: c.figmaProperties ?? null,
    states: c.states ?? null,
    keyboard: c.keyboard ?? null,
    aria: c.aria ?? null,
    semanticHTML: c.semanticHTML ?? null,
    responsive: c.responsive ?? null,
    tokenDependencies: c.tokenDependencies ?? null,
    usageExamples: c.usageExamples ?? [],
    prohibitedExamples: c.prohibitedExamples ?? [],
    // Props are normalized to ONE shape with explicit nulls. Emitting them raw produced a union
    // where `default` and `note` existed on some members and not others, so the documentation site
    // could not read a field without a type error. The shape is the contract; absence is null.
    props: (c.props ?? []).map((p) => ({
      name: p.name ?? '',
      type: p.type ?? null,
      required: p.required ?? false,
      default: p.default ?? null,
      note: p.note ?? null,
      figmaProp: p.figmaProp ?? null,
    })),
    importPath: c.importPath ?? null,
    webComponentPackage: c.webComponentPackage ?? null,
    figmaNodeId: c.figmaNodeId ?? null,
    storybook: sb ? { docs: sb.docs, stories: sb.stories, url: sb.docs ? `${STORYBOOK_URL}/?path=/docs/${sb.docs}` : null } : null,
  };
});

const data = {
  generatedFrom: {
    registry: 'packages/design-system/component-registry.json',
    storybookIndex: existsSync(sbIndexPath) ? 'packages/storybook/storybook-static/index.json' : null,
    tokens: 'packages/tokens/dist/tokens.css',
  },
  storybookUrl: STORYBOOK_URL,
  figmaFileKey: 'ZnnaoZcKjKhDxXFvfHr6fA',
  taxonomy,
  components,
  tokens,
  packages,
  counts: {
    total: components.length,
    public: components.filter((c) => !c.internal).length,
    internal: components.filter((c) => c.internal).length,
    implemented: components.filter((c) => c.implemented).length,
    specified: components.filter((c) => c.specified).length,
    withStorybook: components.filter((c) => c.storybook?.docs).length,
    tokens: tokens.length,
  },
};

const out = join(here, '..', 'src', 'data', 'generated.ts');
writeFileSync(
  out,
  '// GENERATED by scripts/generate-data.mjs. Do not edit by hand.\n' +
    '// Every value here is derived from the registry, the built Storybook index, the token build,\n' +
    '// or package manifests. Run `npm run generate -w @envision/developer-center` to refresh.\n' +
    `export const system = ${JSON.stringify(data, null, 2)} as const;\n` +
    'export type SystemData = typeof system;\n' +
    'export type Component = (typeof system)["components"][number];\n' +
    'export type Token = (typeof system)["tokens"][number];\n',
);

console.log(
  `[generate-data] ${data.counts.public} public components (${data.counts.implemented} implemented, ` +
    `${data.counts.withStorybook} with Storybook docs), ${data.counts.tokens} tokens, ${packages.length} packages`,
);
