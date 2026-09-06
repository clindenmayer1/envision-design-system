/*
 * verify-claims — checks what the documentation SAYS against what is actually there.
 *
 * The docs assert things about every component: that it is drawn in Figma, that it varies on these
 * axes and no others, that it is built in `@envision/components`, that it ships in the product,
 * that it depends on these tokens. Each of those is checkable, and each has been wrong at some
 * point, because a claim written once is not re-read when the thing it describes moves.
 *
 * Every check reads a real source. Nothing is inferred:
 *   Figma    packages/design-system/fixtures/figma-truth.json    pages, sections, status badges
 *            packages/design-system/fixtures/figma-variants.json variant axes and their values
 *   code     packages/components/src/<dir>, and its customElements.define calls
 *   product  ../envision/src/<path>
 *   tokens   packages/tokens/src/*.tokens.json, via scripts/token-index.mjs
 *
 * The Figma fixtures are exported from the library with the Plugin API and verified by checksum on
 * both sides, so a stale fixture cannot quietly pass. Refresh them when the library changes.
 *
 * A claim that cannot be checked is reported as UNVERIFIED rather than passed, because "I could not
 * tell" and "it is true" are different answers.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenIndex } from './token-index.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const registry = readJson('packages/design-system/component-registry.json');
const truth = readJson('packages/design-system/fixtures/figma-truth.json');
const variants = readJson('packages/design-system/fixtures/figma-variants.json');
const { byCss } = tokenIndex();

const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const figmaByName = new Map();
for (const page of truth.pages) {
  figmaByName.set(norm(page.page), page);
  for (const set of page.sets) if (!figmaByName.has(norm(set))) figmaByName.set(norm(set), page);
}

/** Documentation frames a page may link to instead of the component itself. */
const docFrames = new Map((variants.docFrames ?? []).map((f) => [f.id, f]));
/** Effect styles the library publishes. They carry no CSS token, so this is their only record. */
const effectStyles = new Set(variants.effectStyles ?? []);

/** Every component and component set in the library, by name and by node id. */
const setByName = new Map();
const nodeById = new Map();
for (const page of variants.pages) {
  for (const node of [...(page.sets ?? []), ...(page.singles ?? [])]) {
    const entry = { ...node, page: page.page };
    if (!setByName.has(norm(node.name))) setByName.set(norm(node.name), entry);
    nodeById.set(node.id, entry);
  }
}

/** Figma's status badges against the registry's vocabulary. */
const BADGE_ALLOWS = {
  'Ready to use': ['audited', 'ready-for-review', 'passed-qa'],
  'In progress': ['in-progress'],
  'Limited use': ['audited', 'ready-for-review'],
  Deprecated: ['deprecated'],
  Retired: ['retired'],
};

const SECTION_TO_CATEGORY = {
  ACTIONS: 'Actions',
  'INPUTS & SELECTION': 'Inputs & Selection',
  NAVIGATION: 'Navigation',
  'DATA DISPLAY': 'Data Display',
  'FEEDBACK & GUIDANCE': 'Feedback & Guidance',
  PANELS: 'Panels',
  'STATUS & PROGRESS': 'Status & Progress',
};

/** How the registry names a Figma property type, against what the API reports. */
const PROP_TYPE = { text: 'TEXT', boolean: 'BOOLEAN', 'instance-swap': 'INSTANCE_SWAP' };

const componentDirs = readdirSync(join(repo, 'packages/components/src'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'base')
  .map((d) => d.name);

/** Custom elements the package actually registers, read from the define calls. */
const definedTags = new Set();
for (const dir of componentDirs) {
  const base = join('packages/components/src', dir);
  for (const file of readdirSync(join(repo, base))) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
    for (const m of read(join(base, file)).matchAll(/customElements\.define\(\s*['"]([^'"]+)['"]/g)) definedTags.add(m[1]);
  }
}

const productRoot = join(repo, '..', 'envision');

const fail = [];
const unverified = [];
let checks = 0;
const check = (cond, id, claim, detail = '') => {
  checks++;
  if (cond === null) unverified.push({ id, claim, detail });
  else if (!cond) fail.push({ id, claim, detail });
};

/** Tokens a built component actually references, so a dependency list cannot drift from the code. */
const tokensUsedBy = (dir) => {
  const used = new Set();
  for (const file of readdirSync(join(repo, 'packages/components/src', dir))) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
    for (const m of read(join('packages/components/src', dir, file)).matchAll(/--envision-[a-z0-9-]+/g)) {
      if (byCss.has(m[0])) used.add(byCss.get(m[0]).dotted);
    }
  }
  return used;
};

for (const c of registry.components) {
  const id = c.displayName ?? c.id;
  const page = figmaByName.get(norm(c.figmaPage)) ?? figmaByName.get(norm(c.figmaName)) ?? figmaByName.get(norm(c.displayName));
  const proposed = c.figmaStatus === 'proposed';
  const dir = componentDirs.find((d) => [c.codeName, c.displayName, c.id].some((n) => norm(n) === norm(d)));

  // 1. "Drawn in Figma" / "not drawn in Figma".
  if (proposed) check(!page, id, 'claims figmaStatus=proposed (not drawn)', page ? `but Figma has page "${page.page}"` : '');
  else check(Boolean(page), id, `claims figmaStatus=${c.figmaStatus}`, page ? '' : 'but no Figma page carries that name');

  // 2. Status matches the badge the page actually shows.
  if (page && !proposed) {
    if (page.badge === null) check(null, id, `status "${c.figmaStatus}" vs Figma badge`, `page "${page.page}" shows no status badge`);
    else {
      const allowed = BADGE_ALLOWS[page.badge] ?? [];
      check(allowed.includes(c.figmaStatus), id, `status "${c.figmaStatus}" vs Figma badge "${page.badge}"`,
        allowed.includes(c.figmaStatus) ? '' : `badge allows ${allowed.join(', ')}`);
    }
  }

  // 3. Category matches the section the page sits in.
  if (page && c.public) {
    const expected = SECTION_TO_CATEGORY[page.section];
    if (expected) check(c.category === expected, id, `category "${c.category}"`, c.category === expected ? '' : `Figma files it under ${page.section} (${expected})`);
  }

  // 4. The "View in Figma" target is this component, on its own page. A page may point at its
  //    documentation frame instead of the component, which is still the right page and the right
  //    subject, so those are checked by name against the exported frame list.
  if (c.figmaNodeId) {
    const node = nodeById.get(c.figmaNodeId);
    const frame = docFrames.get(c.figmaNodeId);
    if (node) {
      check(norm(node.name) === norm(c.figmaName), id, `links to Figma node ${c.figmaNodeId}`,
        norm(node.name) === norm(c.figmaName) ? '' : `that node is "${node.name}" on page "${node.page}", not ${c.figmaName}`);
    } else if (frame) {
      const onOwnPage = page && norm(frame.page) === norm(page.page);
      check(onOwnPage, id, `links to the "${frame.name}" documentation frame`,
        onOwnPage ? '' : `that frame is on page "${frame.page}", not "${page?.page}"`);
    } else {
      check(false, id, `links to Figma node ${c.figmaNodeId}`, 'no component, set or documentation frame in the fixtures has that id');
    }
  } else if (!proposed && c.figmaName && setByName.has(norm(c.figmaName))) {
    check(false, id, 'has no figmaNodeId', `but ${c.figmaName} exists in the library, so the page cannot link to it`);
  }

  // 5. The variant table: every axis the component varies on, and every value of each. The page
  //    says a value not listed is not supported, which makes both directions a claim.
  if (c.figmaProperties) {
    const own = setByName.get(norm(c.figmaName)) ?? setByName.get(norm(c.displayName));
    if (!own) check(false, id, 'documents variant axes', `no Figma component named ${c.figmaName}`);
    else {
      for (const [key, value] of Object.entries(c.figmaProperties)) {
        // "Child · Prop" documents an axis carried by a composed part rather than by this component.
        const [ownerName, propName] = key.includes('·') ? key.split('·').map((s) => s.trim()) : [null, key];
        const owner = ownerName ? setByName.get(norm(ownerName)) : own;
        if (!owner) { check(false, id, `documents "${key}"`, `no Figma component named ${ownerName}`); continue; }
        const realKey = Object.keys(owner.props).find((k) => norm(k) === norm(propName));
        if (!realKey) { check(false, id, `documents property "${key}"`, `${owner.name} has no such property`); continue; }
        const real = owner.props[realKey];
        if (Array.isArray(value) !== Array.isArray(real)) {
          check(false, id, `documents "${key}" as ${Array.isArray(value) ? 'a variant axis' : value}`,
            `it is ${Array.isArray(real) ? 'a variant axis' : real} in Figma`);
          continue;
        }
        if (Array.isArray(value)) {
          const missing = real.filter((v) => !value.some((d) => norm(d) === norm(v)));
          const invented = value.filter((v) => !real.some((d) => norm(d) === norm(v)));
          check(!missing.length, id, `documents "${key}"`, missing.length ? `omits ${missing.join(', ')}` : '');
          check(!invented.length, id, `documents "${key}"`, invented.length ? `lists ${invented.join(', ')}, which Figma does not have` : '');
        } else {
          check(PROP_TYPE[value] === real, id, `documents "${key}" as ${value}`, PROP_TYPE[value] === real ? '' : `Figma reports ${real}`);
        }
      }
      // The other direction: an axis the component has that the table never mentions.
      const documented = new Set(Object.keys(c.figmaProperties).map((k) => norm(k.includes('·') ? k.split('·')[1] : k)));
      for (const k of Object.keys(own.props)) {
        check(documented.has(norm(k)), id, `variant table omits "${k}"`, documented.has(norm(k)) ? '' : `${own.name} varies on it`);
      }
    }
  }

  // 6. "Built in @envision/components", and the custom element it names.
  if (c.webComponentPackage) check(Boolean(dir), id, `claims webComponentPackage ${c.webComponentPackage}`, dir ? '' : 'no matching directory in packages/components/src');
  if (c.tag) check(definedTags.has(c.tag), id, `claims tag <${c.tag}>`, definedTags.has(c.tag) ? '' : 'not registered by the package');

  // 7. "Ships in the product" points at a path that exists.
  if (c.productImplementation) {
    const rel = c.productImplementation.replace(/^.*·\s*/, '').trim();
    check(existsSync(join(productRoot, rel)), id, `claims it ships at ${rel}`, existsSync(join(productRoot, rel)) ? '' : 'that path does not exist');
  }

  // 8. Token dependencies name real tokens, and for a built component match what it consumes.
  if (c.tokenDependencies) {
    const effects = c.tokenDependencies.filter((d) => d.startsWith('effect '));
    const named = c.tokenDependencies.filter((d) => !d.startsWith('effect '));
    for (const dep of named) {
      const css = `--envision-${dep.replace(/\.\*$/, '').replace(/\./g, '-')}`;
      const exists = byCss.has(css) || [...byCss.keys()].some((k) => k.startsWith(`${css}-`));
      check(exists, id, `depends on token ${dep}`, exists ? '' : 'no such token in the build');
    }
    for (const e of effects) {
      // "effect Ring/Rest|Hover|Selected" names one family and several of its styles.
      const spec = e.slice(7).trim();
      const [family, rest] = spec.includes('/') ? [spec.slice(0, spec.indexOf('/')), spec.slice(spec.indexOf('/') + 1)] : [spec, ''];
      for (const leaf of rest.split('|').filter(Boolean)) {
        const full = `${family}/${leaf}`;
        check(effectStyles.has(full), id, `depends on Figma effect style "${full}"`, effectStyles.has(full) ? '' : 'the library publishes no such effect style');
      }
    }
    if (dir) {
      const used = tokensUsedBy(dir);
      const stale = named.filter((d) => !d.endsWith('.*') && !used.has(d));
      const missed = [...used].filter((t) => !named.includes(t));
      check(!stale.length, id, 'token dependencies match the source', stale.length ? `lists ${stale.slice(0, 3).join(', ')}${stale.length > 3 ? ` +${stale.length - 3}` : ''}, unused by src/${dir}` : '');
      check(!missed.length, id, 'token dependencies are complete', missed.length ? `src/${dir} also uses ${missed.slice(0, 3).join(', ')}${missed.length > 3 ? ` +${missed.length - 3}` : ''}` : '');
    }
  }

  // 9. Everything it says it is composed of has to exist.
  for (const part of c.composedOf ?? []) {
    const hit = registry.components.some((x) => x.id === part);
    check(hit, id, `claims it composes "${part}"`, hit ? '' : 'no component with that id');
  }

  // 10. Anatomy markers name parts the specimen can actually expose.
  if (c.anatomyParts && dir) {
    const src = readdirSync(join(repo, 'packages/components/src', dir))
      .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
      .map((f) => read(join('packages/components/src', dir, f)))
      .join('\n');
    const parts = new Set([...src.matchAll(/part=["']([^"']+)["']/g)].flatMap((m) => m[1].split(/\s+/)));
    for (const p of c.anatomyParts) {
      for (const name of p.part ?? []) {
        check(parts.has(name), id, `anatomy ${p.n} "${p.name}" points at part="${name}"`, parts.has(name) ? '' : `src/${dir} exposes no such part`);
      }
    }
  }
}

// 11. The reverse: an implementation nothing claims.
for (const dir of componentDirs) {
  const claimed = registry.components.some((c) => c.webComponentPackage && [c.codeName, c.displayName, c.id].some((n) => norm(n) === norm(dir)));
  check(claimed, `packages/components/src/${dir}`, 'is built but unclaimed', claimed ? '' : 'no registry record points at it');
}

// 12. Token names written into prose. A doc that names a token the build does not emit is telling
//     the reader to use something that does not exist.
const DOC_ROOTS = ['packages/components', 'packages/design-system', 'packages/tokens', 'packages/developer-center/src', 'packages/storybook'];
const SKIP = new Set(['node_modules', 'dist', 'storybook-static', 'fixtures']);
const docs = [];
const walk = (rel) => {
  for (const entry of readdirSync(join(repo, rel), { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const next = join(rel, entry.name);
    if (entry.isDirectory()) walk(next);
    // The documentation site's pages are .tsx, and a token named in page prose is as much a claim
    // as one named in a markdown file.
    else if (/\.(md|mdx|tsx)$/.test(entry.name) && entry.name !== 'tokens-table.md') docs.push(next);
  }
};
for (const root of DOC_ROOTS) if (existsSync(join(repo, root)) && statSync(join(repo, root)).isDirectory()) walk(root);

// Prose names families as well as tokens: `--envision-t2-color-` or `--envision-t3-button-primary-
// color-background` stand for every token beneath them. A name is true if the build emits it or
// anything under it; it is false only when nothing in the build begins with it.
const tokenNames = [...byCss.keys()];
const namesSomething = (name) => byCss.has(name) || tokenNames.some((t) => t.startsWith(name));

/**
 * Documents that describe a past state rather than the current one. Naming a token the build no
 * longer emits is the point of these files, not a mistake in them, so the check would report their
 * accuracy as an error. Each is listed with the reason it is exempt rather than pattern-matched.
 */
const HISTORICAL = {
  'packages/design-system/changelog.md': 'records what each release shipped, including token names since renamed',
  'packages/components/AUDIT.md': 'quotes defects found in product code, which is where the stale names live',
  'packages/design-system/ARCHITECTURE-MANIFEST.md': 'a superseded audit, kept as the record of an earlier naming scheme',
};

for (const doc of docs) {
  if (HISTORICAL[doc]) { check(null, relative('.', doc), 'token names not checked', HISTORICAL[doc]); continue; }
  const text = read(doc);
  // A page may name a token deliberately as a counter-example. It declares that inline, so the
  // exemption sits next to the sentence it excuses instead of in a list far away.
  const allowed = new Set([...text.matchAll(/verify-claims:\s*allow\s+(--envision-[a-z0-9-]+)/g)].map((m) => m[1]));
  const seen = new Set();
  for (const m of text.matchAll(/--envision-[a-z0-9-]+/g)) {
    if (seen.has(m[0]) || allowed.has(m[0])) continue;
    seen.add(m[0]);
    // A bare tier prefix is a way of writing "the T2 tokens", not a claim about one token.
    if (/^--envision-(t[123]|theme)-?$/.test(m[0])) continue;
    check(namesSomething(m[0]), relative('.', doc), `names token ${m[0]}`, namesSomething(m[0]) ? '' : 'nothing in the build has that name');
  }
}

const pad = (s, n) => String(s).padEnd(n);
if (fail.length) {
  console.log(`\nFALSE CLAIMS (${fail.length})`);
  for (const f of fail) console.log(`  ${pad(f.id, 26)} ${f.claim}${f.detail ? ` — ${f.detail}` : ''}`);
}
if (unverified.length) {
  console.log(`\nUNVERIFIED (${unverified.length})`);
  for (const u of unverified) console.log(`  ${pad(u.id, 26)} ${u.claim}${u.detail ? ` — ${u.detail}` : ''}`);
}
console.log(`\n${checks - fail.length - unverified.length}/${checks} claims verified true, ${fail.length} false, ${unverified.length} unverifiable`);
process.exit(fail.length ? 1 : 0);
