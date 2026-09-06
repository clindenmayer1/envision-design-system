import { system } from './generated';

/**
 * Envision Design information architecture.
 *
 * The top-level order is fixed by Part X of the build specification and must not be re-sorted.
 * Page inventory follows Part LI. Every entry declares `built` honestly: Part LVI forbids making
 * the site look complete when documentation does not exist, so unbuilt routes render an explicit
 * "not yet written" state rather than shallow filler text.
 *
 * Component pages are NOT listed here. They are derived from the registry at the bottom of this
 * file so the navigation cannot drift from the actual component inventory (Part LIII).
 */
export interface NavPage {
  title: string;
  path: string;
  built: boolean;
  /** Extra search terms: aliases a reader might type instead of the title. */
  aliases?: string[];
  summary?: string;
}

/**
 * A labeled run of pages inside a section.
 *
 * The label is a heading, not a link: it names a shelf rather than being a place you can go, which
 * is what lets Components carry 51 entries without the reader scrolling an undifferentiated list.
 * A group with no label renders its pages directly under the section, for sections that read as a
 * single sequence.
 */
interface NavGroup {
  label?: string;
  items: NavPage[];
}
export interface NavSection {
  title: string;
  /** The route prefix the section owns. Also the landing page, unless `landing` is false. */
  path: string;
  built: boolean;
  summary?: string;
  /**
   * True when the section's list is long enough to need filtering in place. Components carries
   * every component in the library, which is more than a person can scan; the rest are short
   * enough that a filter would be furniture. This is not search: it narrows the list you are
   * already looking at, and the top bar keeps the search that crosses the whole site.
   */
  filterable?: boolean;
  /**
   * False when the section has no page of its own and its sidebar row is a disclosure only.
   * A landing that exists solely to list the pages already listed below it is a page the reader
   * has to pass through rather than one they came for, so a section earns a landing only when it
   * has something to say that its child pages do not.
   */
  landing?: boolean;
  groups: NavGroup[];
}

/**
 * Every page in a section, flattened.
 *
 * Grouping is presentation. Search, the unwritten-page fallback and the link validator all want the
 * plain list, and deriving it here means a section can never carry a grouped tree and a flat copy
 * that disagree with each other.
 */
export const sectionPages = (s: NavSection): NavPage[] => s.groups.flatMap((g) => g.items);

const p = (title: string, path: string, built = false, summary?: string, aliases?: string[]): NavPage =>
  ({ title, path, built, summary, aliases });

export function slug(s: string): string {
  return s.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const componentPath = (name: string) => `/components/${slug(name)}`;

/** Public components matching a predicate, alphabetical, as navigation entries. */
/**
 * Whether a component actually exists, as opposed to being a specification for one.
 *
 * Three ways to exist, and any one is enough: drawn in the Figma library, built in
 * `@envision/components`, or shipping inside the product. Testing only the first hid a surface the
 * product renders on every Design Center view, because `figmaStatus` only ever described the
 * design file. What is excluded is the component that exists in no form yet.
 */
export const existsInFigma = (c: (typeof system.components)[number]): boolean =>
  (Boolean(c.figmaStatus) && c.figmaStatus !== 'proposed') ||
  Boolean(c.webComponentPackage) ||
  Boolean(c.productImplementation);

const componentItems = (match: (c: (typeof system.components)[number]) => boolean): NavPage[] =>
  system.components
    .filter((k) => !k.internal && existsInFigma(k) && match(k))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((k) => ({
      title: k.name,
      path: componentPath(k.name),
      built: true,
      summary: k.purpose ?? undefined,
      aliases: [k.category ?? '', k.tag ?? ''],
    }));

export const SECTIONS: NavSection[] = [
  {
    // Not 'Overview'. Every other section uses that word for a row INSIDE it that links to that
    // section's own landing page, and this is a different thing: the site root, with no children.
    // Sharing the name made the sidebar read as though this were one of those rows.
    title: 'Home',
    path: '/',
    built: true,
    summary: 'What Envision is and how its parts connect.',
    groups: [],
  },
  {
    title: 'Get started',
    path: '/get-started',
    built: true,
    summary: 'Orientation for designers, developers and contributors.',
    groups: [
    {
      items: [
        p('Overview', '/get-started', true),
      ] },
    {
      items: [
        p('Introduction', '/get-started/introduction', true),
        p('What is the Envision Design System?', '/get-started/what-is-envision', true),
        p('Design system principles', '/get-started/principles', true),
        p('How the system works', '/get-started/how-the-system-works', false, undefined, ['pipeline', 'design to code']),
        p('Designers: getting started', '/get-started/designers', true),
        p('Developers: getting started', '/get-started/developers', true),
        p('Installation and setup', '/get-started/installation', false, undefined, ['install', 'npm']),
        p('Figma libraries', '/get-started/figma', true),
        p('Storybook', '/get-started/storybook', true),
        p('Contributing', '/get-started/contributing', true),
      ] },
    ],
  },
  {
    title: 'Foundations',
    path: '/foundations',
    built: true,
    summary: 'The visual, behavioral and editorial decisions every component builds on.',
    groups: [
    {
      items: [
        p('Overview', '/foundations', true),
      ] },
    { label: 'Visual style',
      items: [
        p('Color', '/foundations/color', true, 'how Envision assigns meaning to color through semantic roles', ['color', 'palette', 'contrast', 'swatch']),
        p('Typography', '/foundations/typography', true, 'the typeface, type scale, hierarchy and responsive type roles', ['font', 'type', 'text', 'heading', 'inter']),
        p('Spacing', '/foundations/spacing', true, 'the spacing scale and how proximity communicates relationship', ['padding', 'margin', 'gap', 'rhythm']),
        p('Layout & grid', '/foundations/layout-grid', true, 'page regions, content width, rails and the absence of a column grid', ['grid', 'columns', 'region', 'rail', 'container']),
        p('Radius', '/foundations/radius', true, 'how corner shape distinguishes controls from containers', ['corner', 'rounded', 'border radius', 'shape']),
        p('Elevation & shadows', '/foundations/elevation-shadows', true, 'when a surface should lift and when a border should do the work', ['shadow', 'depth', 'layer', 'z-index', 'overlay']),
        p('Iconography', '/foundations/iconography', true, 'the split between inline system glyphs and consumer-supplied icons', ['icon', 'svg', 'material symbols', 'glyph']),
        p('Motion', '/foundations/motion', true, 'the duration roles that exist and the easing system that does not', ['animation', 'transition', 'duration', 'easing', 'reduced motion']),
        p('Imagery', '/foundations/imagery', true, 'the five kinds of Envision imagery and why material accuracy is data', ['image', 'photo', 'material', 'texture', 'alt text']),
      ] },
    { label: 'Layout and responsiveness',
      items: [
        p('Responsive design', '/foundations/responsive-design', true, 'how Envision adapts structure and priority to available space', ['mobile', 'tablet', 'reflow', 'adaptive', 'stack']),
        p('Breakpoints', '/foundations/breakpoints', true, 'the declared width thresholds and which one actually drives change', ['mobile', 'tablet', 'media query', 'viewport']),
      ] },
    ],
  },
  {
    title: 'Design Tokens',
    path: '/tokens',
    built: true,
    summary: 'Design decisions encoded as data so design and code stay aligned.',
    groups: [
    {
      items: [
        // The Design language landing. This section is the first in that area, so this row sits at
        // the top of its sidebar, which is where every other area puts its Overview.
        p('Overview', '/tokens', true),
      ] },
    {
      items: [
        p('Token architecture', '/tokens/architecture', true, 'the four layers, who consumes each, and one decision traveling to a component', ['tiers', 'layers', 'primitive', 'semantic']),
        p('Primitives', '/tokens/primitives', true, 'raw values before they are given meaning', ['raw', 'tier 1', 't1', 'scale']),
        p('Brand tokens', '/tokens/brand', true, 'the white-label seam: which colors belong to the builder being viewed', ['brand', 'identity', 'primary', 'white label', 'theme']),
        p('Semantic tokens', '/tokens/semantic', true, 'the role a value performs rather than how it looks', ['semantic', 'role', 'alias', 'intent']),
        p('Responsive tokens', '/tokens/responsive', true, 'values that change with available space, as a parallel concern', ['responsive', 'breakpoint', 'media query', 'mobile']),
        p('Component tokens', '/tokens/component', true, 'decisions owned by a single component and its states', ['component tokens', 'tier 3', 't3']),
        p('Naming conventions', '/tokens/naming', true, 'how a token name encodes scope, role, property and state', ['naming', 'convention', 'anatomy']),
        p('Figma variables', '/tokens/figma-variables', true, 'the design-side representation of system decisions', ['figma', 'variables', 'design source']),
        p('DTCG token structure', '/tokens/dtcg', true, 'the standardized JSON shape Envision authors tokens in', ['dtcg', 'json', 'format', 'design tokens community group']),
        p('Style Dictionary', '/tokens/style-dictionary', true, 'the build that transforms token source into platform formats', ['style dictionary', 'build', 'transform', 'sd']),
        p('CSS tokens', '/tokens/css', true, 'the generated custom properties and how to consume them', ['css variable', 'custom property', 'var']),
        p('TypeScript tokens', '/tokens/typescript', true, 'the generated exports, and when CSS is the better choice', ['typescript', 'javascript', 'import', 'js']),
        p('Token pipeline', '/tokens/pipeline', true, 'the full path from design source to product, traced with a real token', ['pipeline', 'token build', 'flow', 'end to end']),
        p('Using tokens in components', '/tokens/using-tokens', true, 'choosing the right layer and avoiding hardcoded values', ['consume', 'hardcode', 'usage']),
        p('Token reference', '/tokens/reference', true, 'every generated token, searchable and copyable', ['all tokens', 'browser', 'lookup']),
      ] },
    ],
  },
  {
    title: 'Theming',
    path: '/theming',
    built: true,
    summary: 'One system, many builder brands: what a theme may change, and what it may not.',
    groups: [
    {
      items: [
        p('Overview', '/theming', true),
      ] },
    {
      items: [
        p('The theming contract', '/theming/contract', true, 'the themeable brand layer, and the much longer list of invariants', ['contract', 'themeable', 'invariant', 'seam']),
        p('Authoring a builder theme', '/theming/authoring', true, 'the theme document, its schema and a worked example', ['author', 'schema', 'theme json', 'ramp']),
        p('Applying a theme', '/theming/applying', true, 'the runtime API and why nothing downstream changes', ['applyTheme', 'runtime', 'css custom properties']),
        p('Theme validation', '/theming/validation', true, 'the contrast gate that lets thousands of themes ship', ['validation', 'contrast', 'gate', 'wcag', 'ci']),
        p('Designing for white-label', '/theming/designing', true, 'designing for a brand color you have never seen', ['design', 'guidance', 'pale brand', 'on-brand']),
      ] },
    ],
  },
  {
    title: 'Accessibility',
    path: '/accessibility',
    built: true,
    summary: 'What the system guarantees and what product teams remain responsible for.',
    groups: [
    {
      items: [
        p('Overview', '/accessibility', true),
      ] },
    {
      items: [
        p('Accessibility principles', '/accessibility/principles', true, 'six principles derived from what Envision does', ['a11y', 'principles']),
        p('WCAG standards', '/accessibility/wcag', true, 'the framework and Envision’s stated position', ['wcag', 'conformance', 'aa', 'standard']),
        p('Color & contrast', '/accessibility/contrast', true, 'pairing rules, focus, and product material', ['contrast', 'color', 'ratio']),
        p('Keyboard navigation', '/accessibility/keyboard', true, 'expected keys by control family', ['keyboard', 'tab', 'arrow keys', 'shortcut']),
        p('Focus management', '/accessibility/focus', true, 'where focus goes when interfaces open, close and update', ['focus', 'focus trap', 'modal']),
        p('Screen readers', '/accessibility/screen-readers', true, 'names, roles, states and announcements', ['screen reader', 'aria', 'voiceover', 'nvda']),
        p('Semantic structure', '/accessibility/semantics', true, 'native HTML, headings, landmarks and ARIA', ['semantics', 'html', 'landmark', 'heading']),
        p('Accessible forms', '/accessibility/forms', true, 'labels, association, errors and announcement', ['form', 'label', 'aria-describedby']),
        p('Motion & reduced motion', '/accessibility/motion', true, 'when motion helps and when it is a barrier', ['motion', 'reduced motion', 'animation']),
        p('Testing requirements', '/accessibility/testing', true, 'what to run and what it cannot prove', ['testing', 'audit', 'axe', 'checklist']),
      ] },
    ],
  },
  {
    title: 'Content',
    path: '/content',
    built: true,
    summary: 'How Envision writes interface copy.',
    groups: [
    {
      items: [
        p('Overview', '/content', true),
      ] },
    {
      items: [
        p('Voice & tone', '/content/voice-and-tone', true, 'how Envision sounds and when the register changes', ['voice', 'tone', 'writing']),
        p('Writing principles', '/content/principles', true, 'seven rules, each with a reason', ['writing', 'copy', 'principles']),
        p('UI copy', '/content/ui-copy', true, 'writing for scanning rather than reading', ['copy', 'microcopy', 'ui text']),
        p('Labels', '/content/labels', true, 'naming fields, options and destinations', ['label', 'naming', 'capitalization']),
        p('Buttons & actions', '/content/actions', true, 'verb-first labels that predict the outcome', ['button copy', 'action', 'cta', 'verb']),
        p('Forms', '/content/forms', true, 'labels, helper text, placeholders and instructions', ['form copy', 'helper text', 'placeholder']),
        p('Validation & errors', '/content/errors', true, 'what happened, what needs attention, how to fix it', ['error copy', 'validation', 'message']),
        p('Empty states', '/content/empty-states', true, 'content formulas for six kinds of empty', ['empty copy', 'zero state']),
        p('Notifications', '/content/notifications', true, 'success, information, warning and error wording', ['notification', 'toast', 'alert', 'status']),
        p('Terminology', '/content/terminology', true, 'the Envision product glossary', ['glossary', 'terminology', 'vocabulary', 'terms']),
        p('Accessibility & inclusive language', '/content/inclusive-language', true, 'plain language, descriptive links, non-visual instructions', ['inclusive', 'plain language', 'a11y copy']),
      ] },
    ],
  },
  {
    title: 'Components',
    path: '/components',
    built: true,
    filterable: true,
    summary: 'Production interface building blocks, organized by the system taxonomy.',
    groups: [
    {
      items: [
        p('Overview', '/components', true),
      ] },
    // Every component sits in its category, which is the same category the Figma library files it
    // under. Splitting the tree by build status instead put components that exist and are ready to
    // use under a heading saying they were not built, which is the opposite of what the reader
    // needs: the category is what they are looking for, and build status is a property of the
    // component, carried by the dot beside it.
    ...system.taxonomy.order
      .map((cat) => ({
        label: cat,
        // Alphabetical within the category. That is what makes the Card- prefix do its job: every
        // card sorts together instead of scattering by whatever order the registry happens to list.
        items: componentItems((k) => k.category === cat),
      }))
      .filter((g) => g.items.length > 0),
    { label: 'Guidelines',
      items: [
        p('Component anatomy', '/components/anatomy', true, 'the vocabulary every component page uses', ['anatomy', 'parts', 'slot', 'property']),
        p('Variants & states', '/components/variants-and-states', true, 'why variants are chosen and states are entered', ['variant', 'state', 'matrix']),
        p('Responsive behavior', '/components/responsive', true, 'how a component adapts itself rather than being adapted', ['responsive', 'adapt', 'transform']),
        p('Accessibility', '/components/accessibility', true, 'what components guarantee and what stays yours', ['a11y', 'guarantee', 'responsibility']),
        p('Usage guidelines', '/components/usage', true, 'using the library without quietly forking it', ['usage', 'detach', 'fork', 'guidelines']),
      ] },
    ],
  },
  {
    title: 'Patterns',
    path: '/patterns',
    built: true,
    summary: 'Reusable solutions to recurring product problems.',
    groups: [
    {
      items: [
        p('Overview', '/patterns', true),
      ] },
    {
      items: [
        p('Navigation', '/patterns/navigation', true, 'moving between places without losing position', ['nav', 'menu', 'tabs']),
        p('Forms', '/patterns/forms', true, 'structure, validation timing and error recovery', ['form', 'input', 'validation']),
        p('Selection', '/patterns/selection', true, 'choosing packages, materials and finishes', ['material', 'package', 'swatch', 'choose']),
        p('Filtering', '/patterns/filtering', true, 'narrowing a set without hiding that you did', ['filter', 'narrow', 'facet']),
        p('Search', '/patterns/search', true, 'finding by name rather than browsing', ['search', 'query', 'find']),
        p('Empty states', '/patterns/empty-states', true, 'six reasons nothing is here and what to say', ['empty', 'no results', 'zero state']),
        p('Loading', '/patterns/loading', true, 'waiting without losing context', ['loading', 'spinner', 'skeleton', 'busy']),
        p('Errors', '/patterns/errors', true, 'where a problem is reported and how it is recovered', ['error', 'failure', 'retry']),
        p('Confirmation', '/patterns/confirmation', true, 'telling someone what happened, or asking whether they meant it', ['confirm', 'dialog', 'modal', 'destructive']),
        p('Progressive disclosure', '/patterns/progressive-disclosure', true, 'showing less without making anything unfindable', ['disclosure', 'expand', 'collapse', 'accordion']),
        p('Responsive patterns', '/patterns/responsive', true, 'how complete interaction patterns adapt', ['responsive', 'mobile', 'adapt']),
        p('Complex workflows', '/patterns/workflows', true, 'one real Envision task mapped end to end', ['workflow', 'journey', 'design center', 'flow']),
      ] },
    ],
  },
  {
    title: 'Tools',
    path: '/tools',
    built: true,
    summary: 'Libraries, packages and where to get help.',
    groups: [
    {
      items: [
        p('Overview', '/tools', true),
      ] },
    {
      items: [
        p('Figma library', '/tools/figma', true, 'the design source and its publishing status', ['figma', 'library', 'design source']),
        p('Storybook', '/tools/storybook', true, 'the live executable component reference', ['storybook', 'live', 'reference']),
        p('Design tokens', '/tools/tokens', true, 'token source, generated output and documentation', ['tokens', 'source', 'output']),
        p('Code packages', '/tools/packages', true, 'every workspace package, generated from manifests', ['packages', 'npm', 'install', 'version']),
        p('Icons', '/tools/icons', true, 'where Envision icons come from and how to use them', ['icons', 'svg', 'material symbols']),
        p('Templates', '/tools/templates', true, 'reusable scaffolding that actually exists', ['templates', 'scaffolding']),
        p('Release notes', '/tools/releases', true, 'human-readable change summaries', ['release', 'notes', 'version']),
        p('Changelog', '/tools/changelog', true, 'chronological technical history', ['changelog', 'history', 'changes']),
        p('Support', '/tools/support', true, 'where to take a question, a bug or a request', ['support', 'help', 'contact', 'bug']),
      ] },
    ],
  },
  {
    title: 'Governance',
    path: '/governance',
    built: true,
    summary: 'How system decisions are proposed, reviewed, released and retired.',
    groups: [
    {
      items: [
        p('Overview', '/governance', true),
      ] },
    { label: 'Working with the system',
      items: [
        p('How the system is maintained', '/governance/maintenance', true, 'the system as a product, and its sources of truth', ['maintenance', 'ownership', 'health']),
        p('Ownership & responsibilities', '/governance/ownership', true, 'who decides what, as a recommended model', ['ownership', 'raci', 'responsibility', 'roles']),
        p('Contribution model', '/governance/contribution', true, 'how an idea becomes a released part of Envision', ['contribute', 'proposal', 'rfc']),
        p('Requesting a component', '/governance/requesting-a-component', true, 'the proposal fields and evaluation criteria', ['request component', 'new component', 'proposal']),
        p('Proposing a change', '/governance/proposing-a-change', true, 'change types and the reviews each needs', ['change', 'breaking', 'proposal']),
      ] },
    { label: 'Reviews',
      items: [
        p('Design review', '/governance/design-review', true, 'system fit, duplication, anatomy and states', ['design review', 'checklist']),
        p('Engineering review', '/governance/engineering-review', true, 'API, semantics, tests and compatibility', ['engineering review', 'api', 'checklist']),
        p('Accessibility review', '/governance/accessibility-review', true, 'semantics, keyboard, focus and contrast', ['accessibility review', 'a11y checklist']),
      ] },
    { label: 'Release phases',
      items: [
        p('Component lifecycle', '/governance/lifecycle', true, 'what each status means for you', ['lifecycle', 'status', 'stable', 'experimental']),
        p('Versioning', '/governance/versioning', true, 'what version numbers would mean, and what they mean now', ['version', 'semver', 'breaking']),
        p('Deprecation', '/governance/deprecation', true, 'removing something safely', ['deprecate', 'removal', 'migration']),
        p('Releases', '/governance/releases', true, 'how a change reaches products, and what exists today', ['release', 'publish', 'pipeline', 'ci']),
      ] },
    { label: 'Direction',
      items: [
        p('Adoption', '/governance/adoption', true, 'what can be measured today, and what cannot', ['adoption', 'metrics', 'usage', 'coverage']),
        p('System roadmap', '/governance/roadmap', true, 'how roadmap decisions are organized', ['roadmap', 'plan', 'gaps']),
      ] },
    ],
  },
];

/**
 * The top-level areas, which are what the top navigation switches between.
 *
 * An area is a whole shelf of the system rather than a page: choosing one changes which sections
 * the sidebar offers, so the side navigation never shows the entire site at once. `path` is where
 * the area's own link lands, and `sections` is the tree the sidebar draws while you are inside it.
 */
interface NavArea {
  title: string;
  path: string;
  sections: NavSection[];
}

const section = (title: string): NavSection => {
  const s = SECTIONS.find((x) => x.title === title);
  if (!s) throw new Error(`Unknown section: ${title}`);
  return s;
};

export const AREAS: NavArea[] = [
  {
    title: 'System principles',
    path: '/',
    sections: [section('Home'), section('Get started'), section('Foundations')],
  },
  {
    title: 'Design language',
    path: '/tokens',
    sections: [section('Design Tokens'), section('Theming'), section('Content'), section('Accessibility')],
  },
  { title: 'Components', path: '/components', sections: [section('Components')] },
  { title: 'Patterns', path: '/patterns', sections: [section('Patterns')] },
  { title: 'Tools', path: '/tools', sections: [section('Tools')] },
  { title: 'Governance', path: '/governance', sections: [section('Governance')] },
];

/** The area a route belongs to, so the top navigation can mark where you are. */
export function areaFor(pathname: string): NavArea {
  for (const a of AREAS) {
    for (const s of a.sections) {
      if (s.path !== '/' && (pathname === s.path || pathname.startsWith(s.path + '/'))) return a;
    }
  }
  return AREAS[0];
}

/** External destinations. Part X requires these under a divider with an external indicator. */
export const TOOLS = [
  { title: 'Storybook', href: system.storybookUrl },
  // The design source, built from the file key the registry already records, so the link cannot
  // drift from the library the docs are generated against.
  { title: 'Figma', href: `https://www.figma.com/design/${system.figmaFileKey}/Envision-Design-System` },
  // The repository moved and this still pointed at `envision-testing`, which 404s. It is the
  // remote the working copy actually pushes to.
  { title: 'GitHub', href: 'https://github.com/clindenmayer1/envision-design-system' },
  { title: 'Changelog', href: '/tools/changelog', internal: true },
];

/** Flat index used by search and by the link validator. */
export interface SearchDoc {
  title: string;
  path: string;
  kind: string;
  context: string;
  breadcrumb: string;
  built: boolean;
  terms: string;
}

export const SEARCH_DOCS: SearchDoc[] = [
  ...SECTIONS.flatMap((s) => [
    { title: s.title, path: s.path, kind: 'Section', context: s.summary ?? '', breadcrumb: 'Envision Design System', built: s.built, terms: s.title },
    // Walking groups rather than the flattened list lets a result say which shelf it came from:
    // a component reads as "Component · Action" because that is the group label above it.
    ...s.groups.flatMap((g) =>
      g.items.map((c) => ({
        title: c.title,
        path: c.path,
        kind: g.label ? `${s.title === 'Components' ? 'Component' : s.title} · ${g.label}` : s.title,
        context: c.summary ?? '',
        breadcrumb: `Envision Design System / ${s.title}${g.label ? ` / ${g.label}` : ''}`,
        built: c.built,
        terms: [c.title, ...(c.aliases ?? [])].join(' '),
      })),
    ),
  ]),
  // Tokens are searchable by name, which is how developers actually look them up.
  ...system.tokens.map((t) => ({
    title: t.name,
    path: `/tokens/reference?q=${encodeURIComponent(t.name)}`,
    kind: `Design Token · Tier ${t.tier}`,
    context: t.alias ? `Aliases ${t.alias}` : `Value ${t.value}`,
    breadcrumb: 'Envision Design System / Design Tokens',
    built: true,
    terms: t.name,
  })),
];

/**
 * Where the pre-restructure URLs went.
 *
 * Envision Design's own links were rewritten in place, so these exist for links that left the
 * site: a Figma annotation, a Slack message, a bookmark. Prefixes are matched at the start of the
 * path only, which is what keeps `/components/accessibility` out of the `/accessibility` rule.
 */
const PATH_REDIRECTS: Array<[string, string]> = [
  ['/getting-started', '/get-started'],
  ['/resources', '/tools'],
  // Card components were renamed to sort together (OptionCard -> Card-Option), which moved their
  // slugs. Anything linking to the old name still lands on the component.
  ['/components/optioncard', '/components/card-option'],
  ['/components/packagecard', '/components/card-package'],
  ['/components/selectioncard', '/components/card-selection'],
  ['/components/progresscard', '/components/card-progress'],
  ['/components/keydatecard', '/components/card-keydate'],
  ['/components/floorplancard', '/components/card-floorplan'],
  ['/components/lotmapcard', '/components/card-lotmap'],
  // Tray was a per-category fork of Selection Tray and was deleted from the Figma library.
  ['/components/tray', '/components/selection-tray'],
  // RoomSelector was one instance of Dropdown, not a component of its own.
  ['/components/roomselector', '/components/dropdown'],
  // Renamed to the names the Figma library uses: Tab is not RightRail's, and the component is a
  // ProgressRing rather than a generic ProgressIndicator.
  ['/components/rightrailtab', '/components/tab'],
  ['/components/progressindicator', '/components/progressring'],
  // Tabs was the plural of the item it contains; the container is a Tab Bar.
  ['/components/tabs', '/components/tab-bar'],
];

export function redirectFor(pathname: string): string | null {
  for (const [from, to] of PATH_REDIRECTS) {
    if (pathname === from || pathname.startsWith(from + '/')) return to + pathname.slice(from.length);
  }
  return null;
}
