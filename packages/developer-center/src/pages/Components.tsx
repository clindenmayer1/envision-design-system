import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { CssAtom } from '../modules/artwork';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalIcon } from '../shell/Shell';
import {
  Callout, CodeBlock, Copyable, DocCard, DocGrid, DoDont, LivePreview, PageHeader, SpecimenGrid,
  PrevNext, RelatedGuidance, StatusChip, StorybookCTA, TokenTable,
} from '../modules';
import { DesignCenterRail, FinishGroup, FormPanel, MaterialSwatchContents, NotificationBell, PackagesTab, PageChrome, ProductExample, ResponsiveExample, RoomHeader } from '../modules/product';
import { AnatomyFigure, type AnatomyPart } from '../modules/anatomy';
import { SPECIMENS } from '../modules/specimens';
import { ComponentArticle } from '../templates';
import { system, type Component } from '../data/generated';
import { componentPath, existsInFigma, slug } from '../data/nav';

// Sorted once here so every listing built from it (the index table, a category page, the related
// grid) reads in the same alphabetical order the sidebar uses.
const PUBLIC = system.components
  // Only what the Figma library actually has. The rest are specifications waiting to be designed,
  // and listing them alongside real components made the library look bigger than it is.
  .filter((c) => !c.internal && existsInFigma(c))
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));
const CATEGORY_PURPOSE: Record<string, string> = {
  'Action': 'Components used to initiate, confirm, or perform user actions.',
  'Input & Control': 'Components that capture a choice, a value, or a selection from the person using the product.',
  'Data Display': 'Components that present information the product already knows.',
  'Feedback & Status': 'Components that report what the system is doing, or what it needs.',
  'Navigation': 'Components that move a person between places in the product.',
  'Panels': 'Containers that host other components and organize a region of the screen.',
  'Data & Tables': 'Components for dense, row-and-column information.',
};

/* ------------------------------------------------------------------ overview */

export function ComponentsOverview() {
  const { taxonomy } = system;
  return (
    <div className="dc-container">
      <PageHeader
        trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Components' }]}
        title="Components"
        media={<CssAtom />}
        lead="Envision components are reusable production UI built to keep design, behavior, accessibility, and implementation aligned. Every component on this page is read from the component registry, so this list cannot drift from the system that actually exists."
      />

      <section>
        <h2 className="dc-h2" id="categories">Categories</h2>
        <DocGrid columns={4}>
          {taxonomy.order.map((cat) => {
            const members = PUBLIC.filter((c) => c.category === cat);
            return (
              <DocCard key={cat} to={`/components/category/${slug(cat)}`} title={cat}>
                {CATEGORY_PURPOSE[cat]}
                <br />
                <span className="dc-small" style={{ display: 'block', marginBlockStart: 'var(--dc-space-2)' }}>
                  {members.length} component{members.length === 1 ? '' : 's'} ·{' '}
                  {members.filter((m) => m.implemented).length} implemented
                </span>
              </DocCard>
            );
          })}
        </DocGrid>
      </section>

      <ComponentIndex />

      <RelatedGuidance
        links={[
          { title: 'Token architecture', to: '/tokens/architecture', note: 'What components consume.' },
          { title: 'Selection pattern', to: '/patterns/selection', note: 'These components working together.' },
          { title: 'Focus management', to: '/accessibility/focus', note: 'Behavior components must honor.' },
        ]}
      />
    </div>
  );
}

/** Filterable index of every registered component (Part XXVI). */
function ComponentIndex() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [only, setOnly] = useState<'all' | 'implemented'>('all');

  const rows = useMemo(
    () =>
      PUBLIC.filter((c) => (cat === 'All' || c.category === cat))
        .filter((c) => (only === 'all' ? true : c.implemented))
        .filter((c) => !q || (c.name + ' ' + (c.purpose ?? '')).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [q, cat, only],
  );

  return (
    <section>
      <h2 className="dc-h2" id="all-components">All components</h2>
      <div style={{ display: 'flex', gap: 'var(--dc-space-4)', flexWrap: 'wrap', alignItems: 'end', marginBlockEnd: 'var(--dc-space-5)' }}>
        {/* The real Field component rather than a bespoke input. */}
        <div style={{ minWidth: 220 }}>
          <envision-input
            type="search"
            label="Filter components"
            placeholder="Filter by name"
            leading-icon="search"
            onInput={(e: React.FormEvent) => setQ((e.target as HTMLInputElement).value ?? '')}
          />
        </div>
        <label className="dc-small">
          Category{' '}
          <select value={cat} onChange={(e) => setCat(e.target.value)} style={selectStyle}>
            <option>All</option>
            {system.taxonomy.order.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        {/* The real Checkbox component. */}
        <envision-checkbox
          label="Implemented only"
          checked={only === 'implemented' || undefined}
          onChange={(e: React.SyntheticEvent) =>
            setOnly((e.target as HTMLElement & { checked: boolean }).checked ? 'implemented' : 'all')}
        />
        <span className="dc-small" aria-live="polite">{rows.length} shown</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead>
            <tr>
              {['Component', 'Category', 'Status', 'Code', 'Storybook'].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <Link to={componentPath(c.name)} style={{ fontWeight: 'var(--envision-t1-font-weight-600)' }}>{c.name}</Link>
                  {c.purpose && <div className="dc-small">{c.purpose}</div>}
                </td>
                <td style={td}>{c.category}</td>
                <td style={td}>{c.maturity ? <StatusChip value={c.maturity} /> : <span className="dc-small">None</span>}</td>
                <td style={td}>{c.implemented ? 'Yes' : <span className="dc-small">Not implemented</span>}</td>
                <td style={td}>
                  {c.storybook?.url
                    ? <a href={c.storybook.url} target="_blank" rel="noreferrer">Open ↗</a>
                    : <span className="dc-small">None</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Elements whose bare form does not represent them, mapped to the composition that does.
 *
 * A container component is defined by what it holds. Rendering `<envision-right-rail>` with no
 * sections documented an empty shell, so the example uses the product-accurate rail this site
 * already builds. The element is still the real one underneath; only the content is supplied.
 */
const COMPOSED_CAPTION: Record<string, string | undefined> = {
  'envision-right-rail': 'The rail as the Design Center composes it: sections, group headers, swatch grids and the footer.',
  'envision-material-swatch': 'Chip for paint, wood and stone. Sphere for a metal finish, whose sample is a rendered material that needs curvature to read.',
};

const COMPOSED: Record<string, () => React.ReactNode> = {
  'envision-right-rail': () => <DesignCenterRail />,
  // Both contents side by side, because the whole point of this component is that a paint color
  // and a metal finish are different kinds of thing and are not drawn the same way.
  'envision-material-swatch': () => <MaterialSwatchContents />,
};

const selectStyle: React.CSSProperties = {
  font: 'inherit', padding: 'var(--dc-space-2) var(--dc-space-2)',
  border: '1px solid var(--envision-t2-color-border-default-default)',
  borderRadius: 'var(--envision-t2-border-radius-control-xs)',
};
const th: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', whiteSpace: 'nowrap',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)',
  fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--envision-t2-color-content-secondary-default)',
};
const td: React.CSSProperties = {
  padding: 'var(--dc-space-3)', verticalAlign: 'top',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)',
};

/* ------------------------------------------------------------------ category */

export function ComponentCategory() {
  const { cat } = useParams();
  const category = system.taxonomy.order.find((c) => slug(c) === cat);
  if (!category) return <p className="dc-container">Unknown category.</p>;
  const members = PUBLIC.filter((c) => c.category === category).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="dc-container">
      <PageHeader
        trail={[
          { label: 'Envision Design System', to: '/' },
          { label: 'Components', to: '/components' },
          { label: category },
        ]}
        title={category}
        lead={CATEGORY_PURPOSE[category]}
      />

      <section>
        <h2 className="dc-h2" id="choosing">Choosing a {category.toLowerCase()} component</h2>
        <p>
          Compare on the job each component does, not on how it looks. Where two components could both work, the more
          specific one usually carries behavior you would otherwise have to rebuild.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
            <thead>
              <tr>{['Component', 'Best for', 'Avoid when'].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {members.map((c) => (
                <tr key={c.id}>
                  <td style={td}><Link to={componentPath(c.name)}>{c.name}</Link></td>
                  <td style={td}>{c.whenToUse || c.purpose || <span className="dc-small">Pending verification</span>}</td>
                  <td style={td}>{c.whenNotToUse || <span className="dc-small">Pending verification</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="dc-h2" id="components">Components</h2>
        <DocGrid columns={3}>
          {members.map((c) => (
            <DocCard key={c.id} to={componentPath(c.name)} title={c.name}>
              {c.purpose}
            </DocCard>
          ))}
        </DocGrid>
      </section>

      <PrevNext prev={{ title: 'Components', to: '/components' }} />
    </div>
  );
}

/* -------------------------------------------------------------- component page */

/**
 * Template E: the canonical component documentation page.
 *
 * Section order is fixed by the audit brief and is the same for all 50 registered components, so a
 * reader learns the page once. Every section is GENERATED from the registry: where the registry has
 * no data, the section states that plainly instead of being silently dropped, which is how an
 * undocumented component stays visible as undocumented.
 */

/** Patterns a category participates in. Kept here because the registry does not record it. */
const CATEGORY_PATTERNS: Record<string, Array<{ title: string; to: string; note: string }>> = {
  'Action': [{ title: 'Selection', to: '/patterns/selection', note: 'Where the commit action lives.' }],
  'Input & Control': [{ title: 'Selection', to: '/patterns/selection', note: 'Choosing materials, finishes and packages.' }],
  'Panels': [{ title: 'Selection', to: '/patterns/selection', note: 'The rail that hosts selection rows.' }],
};

/**
 * The component page tab bar, built from the shipped `<envision-tab>` rather than styled links.
 *
 * The element already implements the APG tab pattern: role=tab, roving tabindex, Arrow/Home/End,
 * and a composed `select` event. The only thing it cannot know is that selecting a tab here means
 * changing the route, so that is all this wrapper adds. Selection state still comes from the URL,
 * so the back button and a pasted link stay authoritative.
 */
function ComponentTabs({ name, active, base }: { name: string; active: ComponentTab; base: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onSelect = (e: Event) => {
      const label = (e as CustomEvent<{ label: string }>).detail?.label;
      const tab = COMPONENT_TABS.find((t) => t.label === label);
      if (!tab || tab.id === active) return;
      navigate(tab.id === 'examples' ? base : `${base}/${tab.id}`);
    };
    el.addEventListener('select', onSelect);
    return () => el.removeEventListener('select', onSelect);
  }, [active, base, navigate]);

  return (
    <div ref={ref} className="dc-comp-tabs" role="tablist" aria-label={`${name} documentation`}>
      {COMPONENT_TABS.map((t) => (
        <envision-tab key={t.id} label={t.label} selected={t.id === active || undefined} />
      ))}
    </div>
  );
}

/**
 * Template E: the component page.
 *
 * A component is read in four different modes, and one long scroll served none of them well: a
 * developer wanting the element name had to scroll past placement guidance, and a designer wanting
 * the do/don'ts had to scroll past a props table. The page now opens with a header band carrying
 * the title and a tab bar on its lower edge, and each tab owns a coherent slice of the same
 * documentation. Nothing was dropped in the split; the sections moved.
 *
 * The tab lives in the URL rather than in state, so a tab is linkable and the back button works.
 */
type ComponentTab = 'examples' | 'code' | 'usage' | 'changelog';

const COMPONENT_TABS: Array<{ id: ComponentTab; label: string }> = [
  { id: 'examples', label: 'Examples' },
  { id: 'code', label: 'Code' },
  { id: 'usage', label: 'Usage' },
  { id: 'changelog', label: 'Changelog' },
];

export function ComponentPage({ component: c }: { component: Component }) {
  const { tab } = useParams();
  const active: ComponentTab = COMPONENT_TABS.find((t) => t.id === tab)?.id ?? 'examples';

  // `type` is deliberately not an appearance axis. On Field it is the input type (text, email,
  // password), which are not variants of how the component looks, and rendering them as a variant
  // strip claimed six appearances that do not exist.
  // What a reader actually needs on a Field or a Checkbox: which boolean flags it accepts, shown on.
  const boolProps = (c.props ?? []).filter((p) => p.type === 'boolean');
  // Icon props are neither a union nor a boolean in code, so nothing rendered them and a reader had
  // to take the props table's word for it. They are an appearance the component has, so they get
  // shown like any other.
  const iconProps = (c.props ?? []).filter((p) => /^(leadingIcon|trailingIcon)$/.test(p.name));
  const productSurface = surfaceFor(c.tag, c.id);
  // The registry's own rule: figmaStatus 'proposed' means not yet drawn, so anything else is drawn.
  const inFigma = Boolean(c.figmaStatus) && c.figmaStatus !== 'proposed';
  const sizeProp = c.props?.find((p) => p.name === 'size' && p.type?.includes('|'));
  const siblings = PUBLIC.filter((s) => s.category === c.category && s.id !== c.id).slice(0, 4);
  const live = c.implemented && c.tag;
  const base = componentPath(c.name);
  // Whichever axis this component actually has: named appearance values, or the boolean flags it
  // accepts. Built once so the section and its contents entry cannot disagree.
  // Every axis the component varies on, each with every one of its values. Previously this picked
  // the first matching axis and dropped the rest, so a component with a `variant` union never
  // showed its booleans and a component with only booleans showed a single row.
  const unionAxes = (c.props ?? []).filter(
    (p) =>
      Boolean(p.type?.includes('|')) &&
      // `type` on Field is the input type, not an appearance. `size` is geometry and has its own
      // section, so listing it here would say the same thing twice.
      !/^(type|size)$/.test(p.name),
  );
  const variantAxes: Array<{ name: string; note?: string; items: Array<{ label: string; note?: string; node: React.ReactNode }> }> = !live
    ? []
    : [
        ...unionAxes.map((axis) => ({
          name: axis.name,
          note: axis.note ?? undefined,
          items: unionValues(axis.type!).map((v) => ({
            label: v,
            note: v === axis.default ? 'Default. Omitting the attribute gives you this.' : undefined,
            node: <Sample tag={c.tag!} overrides={{ [attrName(axis.name)]: v, label: cap(v) }} />,
          })),
        })),
        ...(iconProps.length
          ? [{
              name: 'Icons',
              note: 'A Material Symbols name on either end. The glyphs below are the ones the Figma set '
                + 'defaults to. Both ends are decorative: the label carries the meaning, so an icon that '
                + 'can be acted on has to be a control rather than a glyph.',
              items: iconProps.map((p) => ({
                label: p.name,
                note: p.note ?? undefined,
                node: (
                  <Sample
                    tag={c.tag!}
                    overrides={{ [attrName(p.name)]: SAMPLE_GLYPH[c.id]?.[p.name] ?? 'star' }}
                  />
                ),
              })),
            }]
          : []),
        ...(boolProps.length
          ? [{
              name: 'Boolean attributes',
              note: 'Each shown switched on, beside the default.',
              items: boolProps.map((p) => ({
                label: p.name,
                note: p.note ?? undefined,
                // A boolean custom-element attribute is set by presence, so the value is ''.
                node: <Sample tag={c.tag!} overrides={{ [attrName(p.name)]: '' }} />,
              })),
            }]
          : []),
      ].filter((g) => g.items.length > 0);
  const figmaAxes: Array<[string, unknown]> = Object.entries((c.figmaProperties ?? {}) as Record<string, unknown>);
  const anatomyParts = ((c.anatomyParts ?? []) as AnatomyPart[]);
  const behavior = ((c.behavior ?? []) as string[]);
  // The band's lead is `purpose`. An Overview whose only content is that same sentence is a repeat,
  // so the section appears only when it carries something the band does not.
  const showOverview = !c.purpose || Boolean(c.semanticHTML);

  // Each tab advertises only the headings it actually renders, so the contents list can never
  // point at a section that is on a different tab.
  const toc: Record<ComponentTab, Array<{ id: string; label: string }>> = {
    examples: [
      ...(showOverview ? [{ id: 'overview', label: 'Overview' }] : []),
      ...(c.anatomyNote || anatomyParts.length ? [{ id: 'anatomy', label: 'Anatomy' }] : []),
      ...(variantAxes.length || figmaAxes.length ? [{ id: 'variants', label: 'Variants' }] : []),
      ...(live && sizeProp ? [{ id: 'sizing', label: 'Sizing' }] : []),
      ...(behavior.length ? [{ id: 'behavior', label: 'Behavior' }] : []),
      { id: 'states', label: 'States' },
      { id: 'product', label: 'In the product' },
    ],
    code: [
      ...(live ? [{ id: 'implementation', label: 'Implementation' }] : []),
      ...(c.props?.length ? [{ id: 'props', label: 'Props' }] : []),
      { id: 'tokens', label: 'Tokens' },
    ],
    usage: [
      { id: 'usage', label: 'When to use' },
      { id: 'behavior', label: 'Behavior' },
      { id: 'content', label: 'Content' },
      { id: 'placement', label: 'Placement' },
      { id: 'responsive', label: 'Responsive' },
      { id: 'accessibility', label: 'Accessibility' },
      { id: 'related-components', label: 'Related components' },
    ],
    changelog: [],
  };

  return (
    <ComponentArticle
      toc={toc[active]}
      related={[
        { title: c.category!, to: `/components/category/${slug(c.category!)}`, note: 'Other components for the same job.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'Where these values come from.' },
        { title: 'Focus management', to: '/accessibility/focus', note: 'Focus behavior this component must honor.' },
      ]}
      prev={{ title: c.category!, to: `/components/category/${slug(c.category!)}` }}
      next={siblings[0] ? { title: siblings[0].name, to: componentPath(siblings[0].name) } : undefined}
      band={
        <>
          <PageHeader
            trail={[
              { label: 'Envision Design System', to: '/' },
              { label: 'Components', to: '/components' },
              { label: c.category!, to: `/components/category/${slug(c.category!)}` },
              { label: c.name },
            ]}
            title={c.name}
            lead={c.purpose ?? undefined}
          />
          <ComponentTabs name={c.name} active={active} base={base} />
        </>
      }
    >
            {active === 'examples' && (
              <>
                {/* The opening panel is the component working, nothing else. Variants are a
                    separate question and get their own section below. */}
                {live ? (
                  // A container element renders as an empty shell on its own: the rail's job is to
                  // hold sections, so the bare element showed a heading, a tab strip and one card.
                  // The example is the rail as the product composes it, which is what the reader
                  // came to see.
                  <LivePreview caption={COMPOSED_CAPTION[c.tag!]}>
                    {COMPOSED[c.tag!] ? COMPOSED[c.tag!]() : <Sample tag={c.tag!} />}
                  </LivePreview>
                ) : SPECIMENS[c.id] ? (
                  // Drawn from the component's Figma specification in React and CSS, because the
                  // component has no implementation to render yet. The caption says so, and the
                  // note further down says it again: this documents the component, it is not one.
                  <LivePreview background="plain" caption={`Built from the Figma specification. ${c.name} has no code implementation yet, so this is a specimen rather than the running component.`}>
                    {SPECIMENS[c.id]()}
                  </LivePreview>
                ) : null}

                {showOverview && (
                  <>
                    <h2 className="dc-h2" id="overview">Overview</h2>
                    {/* The band's lead already carries `purpose`. Repeating it here said the same
                        sentence twice, so what is left is the part the band cannot show. */}
                    {!c.purpose && <p>Implementation detail pending verification.</p>}
                    {c.semanticHTML && (
                      <>
                        <p>
                          Envision builds on native elements wherever one exists, so focus, activation and form semantics come
                          from the browser rather than from re-implemented JavaScript.
                        </p>
                        {/* The badge labels the quote, so it sits on its own line above it. Inline,
                            it read as the first word of the sentence. */}
                        <div style={quoteStyle}>
                          <p style={{ margin: '0 0 var(--dc-space-4)' }}>
                            <envision-badge tone="brand" label="Semantic contract" />
                          </p>
                          <p style={{ margin: 0 }}>{c.semanticHTML}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
                {/* Anatomy is the design system's, not the site's. It appears only where the Figma
                    library has an anatomy frame for this component, and reads from it. Where Figma
                    has none the section is absent rather than filled with a placeholder, or with a
                    numbered list whose numbers point at nothing. */}
                {(c.anatomyNote || anatomyParts.length > 0) ? (
                  <>
                    <h2 className="dc-h2" id="anatomy">Anatomy</h2>
                    {c.anatomyNote && <p>{c.anatomyNote}</p>}
                    {anatomyParts.length > 0 && live ? (
                      // The real element with the numbered markers drawn over it, not a picture of
                      // one. The numbers and their copy come from the Figma anatomy frame.
                      <AnatomyFigure
                        parts={anatomyParts}
                        axis={c.anatomyAxis === 'y' ? 'y' : 'x'}
                        specimenWidth={c.anatomySpecimenWidth}
                      >
                        {/* The rail's anatomy names sections and a footer that the bare element does
                            not render on its own, so the specimen is the product-accurate rail this
                            site already builds. Its parts carry data-anatomy, so the markers measure
                            them rather than guessing from a percentage. */}
                        {c.tag === 'envision-right-rail' ? <DesignCenterRail /> : <Sample tag={c.tag!} bare />}
                      </AnatomyFigure>
                    ) : live ? (
                      <LivePreview>
                        <Sample tag={c.tag!} />
                      </LivePreview>
                    ) : null}
                  </>
                ) : null}
                {(variantAxes.length > 0 || figmaAxes.length > 0) && (
                  <>
                    <h2 className="dc-h2" id="variants">Variants</h2>
                    <p>
                      Every axis {c.name} varies on, and every value of each. A value that is not listed here is
                      not one the component supports.
                    </p>
                    {variantAxes.map((axis) => (
                      <div key={axis.name}>
                        <h3 className="dc-h3">{axis.name}</h3>
                        {axis.note && <p className="dc-small">{axis.note}</p>}
                        <VariantList items={axis.items} />
                      </div>
                    ))}
                    {/* The library's own variant table. It is the only complete list for a component
                        that is drawn but not built, and a cross-check for one that is. */}
                    {figmaAxes.length > 0 && (
                      <>
                        <h3 className="dc-h3">In the Figma library</h3>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
                            <thead>
                              <tr>{['Property', 'Values'].map((h) => (
                                <th key={h} style={{ textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)', fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--envision-t2-color-content-secondary-default)' }}>{h}</th>
                              ))}</tr>
                            </thead>
                            <tbody>
                              {figmaAxes.map(([k, v]) => (
                                <tr key={k}>
                                  <td style={{ padding: 'var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)', verticalAlign: 'top' }}><code>{k}</code></td>
                                  <td style={{ padding: 'var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)', verticalAlign: 'top' }}>
                                    {Array.isArray(v) ? v.map((x) => <code key={x} style={{ marginInlineEnd: 'var(--dc-space-2)' }}>{x}</code>) : <code>{String(v)}</code>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}

                {live && sizeProp && (
                  <>
                    <h2 className="dc-h2" id="sizing">Sizing</h2>
                    <p>
                      Sizes are geometry, not emphasis. Use the size that fits the density of the surface: a rail footer and
                      a page hero are different densities, and the same emphasis can appear at either size.
                    </p>
                    <LivePreview>
                      <SpecimenGrid
                        items={unionValues(sizeProp.type!).map((v) => ({
                          label: v,
                          node: <Sample tag={c.tag!} overrides={{ size: v }} />,
                        }))}
                      />
                    </LivePreview>
                    {sizeProp.note && <p className="dc-small">{sizeProp.note}</p>}
                  </>
                )}
                {behavior.length > 0 && (
                  <>
                    <h2 className="dc-h2" id="behavior">Behavior</h2>
                    <p>
                      How {c.name} acts once it is on screen. These are rules the component enforces, not
                      suggestions for the surface using it.
                    </p>
                    <ul>{behavior.map((b) => <li key={b}>{b}</li>)}</ul>
                  </>
                )}
                <h2 className="dc-h2" id="states">States</h2>
                {c.states?.length ? <StatesSection c={c} /> : <Pending />}
                <h2 className="dc-h2" id="product">In the Envision product</h2>
                {productSurface ? (
                  <>
                    <p>
                      Where {c.name} actually appears. The composition below is assembled from the real production
                      components, and it contains a real {c.name}.
                    </p>
                    <ProductExample
                      title={productSurface.title}
                      surface={productSurface.surface()}
                      annotations={productSurface.annotations}
                      caption="Real components, product arrangement. Captured screenshots of the running application are not in this repository."
                    />
                  </>
                ) : c.productImplementation ? (
                  // "Does not appear" is the wrong thing to say about a component that ships. This
                  // site cannot assemble it, because it lives in the product rather than the
                  // component library, but where it runs is a fact worth stating.
                  <Callout type="Note" title="Where it runs">
                    {c.name} ships in the Envision product at{' '}
                    <code>{c.productImplementation.replace(/^.*·\s*/, '')}</code>. This site builds its compositions
                    from <code>@envision/components</code>, which does not contain it, so there is no assembled
                    surface here to show it inside.
                  </Callout>
                ) : COMPOSED[c.tag ?? ''] ? (
                  // A container's product composition IS the component. Saying it appears in none
                  // was false on its face for the rail, whose example on this very page is the
                  // Design Center arrangement; the honest statement is that it is the surface.
                  <Callout type="Note" title="It is the composition">
                    {c.name} is a container, so there is no larger surface to show it inside: the product
                    arrangement is the example at the top of this page, built from the same real components the
                    Design Center uses.
                  </Callout>
                ) : (
                  <Callout type="Important" title="No product composition yet">
                    {c.name} does not appear in any of the compositions this site can assemble from real
                    components{c.implemented ? '' : ', because it is not implemented yet'}. Rather than illustrate it
                    with a surface it is absent from, there is nothing here until a composition containing it exists.
                  </Callout>
                )}

                <StorybookCTA name={c.name} url={c.storybook?.url ?? null} />
              </>
            )}

            {active === 'code' && (
              <>
                {/* Implementation first: the reason to open this tab is to use the component, so
                    how to import and render it comes before its API surface and its tokens. */}
                {live && (
                  <>
                    <h2 className="dc-h2" id="implementation">Implementation</h2>
                    <CodeBlock
                      language="html"
                      filename="Custom element"
                      code={`<script type="module">\n  import '${c.webComponentPackage}';\n</script>\n\n${sampleMarkup(c.tag!)}`}
                    />
                    {c.importPath && (
                      <p className="dc-small">
                        A React adapter is published from <Copyable text={c.importPath} />. Both wrap the same element, so
                        behavior and tokens are identical.
                      </p>
                    )}
                    {c.storybook?.url && (
                      <p style={{ marginBlockStart: 'var(--dc-space-5)' }}>
                        <a href={c.storybook.url} target="_blank" rel="noreferrer" style={storybookButton}>
                          Open {c.name} in Storybook
                          <ExternalIcon />
                        </a>
                      </p>
                    )}
                  </>
                )}
                {c.props?.length ? (
                  <>
                    <h2 className="dc-h2" id="props">Props</h2>
                    <p>
                      The public API, generated from the registry. Attributes are the kebab-case form of these
                      names on the custom element; the React adapter takes them as props.
                    </p>
                    <PropsTable props={c.props} />
                  </>
                ) : null}
                <h2 className="dc-h2" id="tokens">Tokens</h2>
                <p>
                  Component tokens for {c.name}, generated from the token build. These are what to change if this component
                  must look different. A hardcoded value in product code is always the wrong answer.
                </p>
                <TokenTable filter={(n) => n.startsWith(`--envision-t3-${slug(c.name)}-`)} />
              </>
            )}

            {active === 'usage' && (
              <>
                <h2 className="dc-h2" id="usage">When to use</h2>
                {c.whenToUse ? <p>{c.whenToUse}</p> : <Pending />}
                <h3 className="dc-h3">When not to use</h3>
                {c.whenNotToUse ? <p>{c.whenNotToUse}</p> : <Pending />}
                <h2 className="dc-h2" id="behavior">Behavior</h2>
                {c.keyboard || c.states ? (
                  <>
                    {c.keyboard && <p>{c.keyboard}</p>}
                    <p>
                      Behavior comes from the platform element wherever possible rather than from JavaScript listeners, so it
                      stays correct under assistive technology, browser autofill and form submission.
                    </p>
                  </>
                ) : <Pending />}
                <h2 className="dc-h2" id="content">Content</h2>
                {c.usageExamples?.length || c.prohibitedExamples?.length ? (
                  <>
                    <p>
                      Write for the outcome, not the mechanism. A label should let someone predict what happens before they
                      commit to it.
                    </p>
                    <DoDont
                      items={[
                        ...(c.usageExamples ?? []).map((e) => ({
                          kind: 'do' as const,
                          text: `Use the component's own API to express intent: ${e}`,
                        })),
                        ...(c.prohibitedExamples ?? []).map((e) => ({
                          kind: 'dont' as const,
                          text: `Avoid ${e}. It couples a screen to internals the system is free to change, and the change lands silently.`,
                        })),
                      ]}
                    />
                  </>
                ) : <Pending />}
                <h2 className="dc-h2" id="placement">Placement and composition</h2>
                <p>
                  {c.name} appears inside the surfaces its category implies. In Envision that most often means the Design
                  Center right rail, a selection tray, or a page-level content region. Place it where the decision it serves
                  is being made, and keep it in view with the thing it changes.
                </p>
                <h2 className="dc-h2" id="responsive">Responsive behavior</h2>
                {c.responsive ? <p>{c.responsive}</p> : <Pending />}
                {live && (
                  <ResponsiveExample
                    caption="The same element at three container widths. It reflows rather than being scaled down."
                    children={<Sample tag={c.tag!} />}
                  />
                )}
                <h2 className="dc-h2" id="accessibility">Accessibility</h2>
                {c.semanticHTML && (<><h3 className="dc-h3">Semantics</h3><p style={quoteStyle}>{c.semanticHTML}</p></>)}
                {c.keyboard && (<><h3 className="dc-h3">Keyboard</h3><p>{c.keyboard}</p></>)}
                {c.aria != null && (
                  <>
                    <h3 className="dc-h3">ARIA</h3>
                    {Array.isArray(c.aria)
                      ? <ul>{(c.aria as string[]).map((a) => <li key={a}>{a}</li>)}</ul>
                      : <p>{ariaText(c.aria)}</p>}
                  </>
                )}
                {!c.semanticHTML && !c.keyboard && c.aria == null && <Pending />}
                <Callout type="Accessibility" title="What stays with you">
                  The system guarantees the mechanics above. It cannot supply a meaningful accessible name, a correct
                  heading structure around this component, or the judgment that this is the right component for the job.
                </Callout>
                <h2 className="dc-h2" id="related-components">Related components</h2>
                {siblings.length ? (
                  <DocGrid columns={siblings.length >= 4 ? 4 : 3}>
                    {siblings.map((s) => (
                      <DocCard key={s.id} to={componentPath(s.name)} title={s.name}>{s.purpose}</DocCard>
                    ))}
                  </DocGrid>
                ) : <p className="dc-small">No other components in {c.category} yet.</p>}

                {CATEGORY_PATTERNS[c.category!]?.length && (
                  <>
                    <h2 className="dc-h2" id="related-patterns">Related patterns</h2>
                    <DocGrid columns={3}>
                      {CATEGORY_PATTERNS[c.category!].map((p) => (
                        <DocCard key={p.to} to={p.to} title={p.title}>{p.note}</DocCard>
                      ))}
                    </DocGrid>
                  </>
                )}
              </>
            )}

            {active === 'changelog' && <ComponentChangelog name={c.name} />}

            {/* Not tab-specific: if the component does not exist yet, that governs every tab. It sits
                after the guidance rather than before it, so the page opens with the component rather
                than with a disclaimer about it. */}
              {!c.implemented && (
                // Two different facts, previously collapsed into one. A component can be drawn and
                // published in Figma while having no code, and the old copy asserted BOTH that it
                // exists in Figma and that it is "not built", for every unbuilt component alike.
                <Callout
                  type="Important"
                  title={
                    c.productImplementation
                      ? 'Ships in the product, not yet in the component library'
                      : inFigma
                        ? 'Designed in Figma, not yet built in code'
                        : 'Specified, not yet designed or built'
                  }
                >
                  {c.productImplementation ? (
                    // "Not built" would be false here. It is built and shipping; what it is not is
                    // shared, which is a different problem with a different fix.
                    <>
                      {c.name} is built and running in the Envision product at{' '}
                      <code>{c.productImplementation.replace(/^.*·\s*/, '')}</code>, but it has no implementation in{' '}
                      <code>@envision/components</code>, so nothing else can reuse it. Moving it into the library is
                      what would make it a system component rather than a product one.
                    </>
                  ) : inFigma ? (
                    <>
                      {c.name} is a published component in the Envision Figma library
                      {c.figmaStatus ? ` (${c.figmaStatus})` : ''}, but has no implementation in{' '}
                      <code>@envision/components</code> yet. The guidance below is the registry specification. Live
                      rendering, code examples and Storybook links arrive when it is built.
                      {' '}
                      <a
                        href={`https://www.figma.com/design/${system.figmaFileKey}/Envision-Design-System${
                          c.figmaNodeId ? `?node-id=${c.figmaNodeId.replace(':', '-')}` : ''
                        }`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open it in Figma
                      </a>
                    </>
                  ) : (
                    <>
                      {c.name} is specified in the design system registry, but it is not yet drawn in Figma and has no
                      implementation in <code>@envision/components</code>. Everything below is the specification, not a
                      description of something that exists.
                    </>
                  )}
                </Callout>
              )}


    </ComponentArticle>
  );
}

/**
 * The variants of a component, one per row, with the live specimen beside its name.
 *
 * A row rather than a strip: at a glance you can read down the names, and each one is answered by
 * the real element on the same line, so the value and what it produces never drift apart.
 */
function VariantList({ items }: { items: Array<{ label: string; note?: string; node: React.ReactNode }> }) {
  return (
    <ul style={{ listStyle: 'none', margin: 'var(--dc-rhythm-example) 0', padding: 0, display: 'grid', gap: 'var(--dc-space-2)' }}>
      {items.map((it) => (
        <li
          key={it.label}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 220px) minmax(0, 1fr)',
            gap: 'var(--dc-space-5)',
            alignItems: 'center',
            padding: 'var(--dc-space-4) var(--dc-space-5)',
            border: '1px solid var(--envision-t2-color-border-default-default)',
            borderRadius: 'var(--envision-t2-border-radius-container-md)',
            background: 'var(--dc-surface-warm)',
          }}
        >
          <div>
            <code style={{ fontSize: 'var(--envision-t1-font-size-13)' }}>{it.label}</code>
            {it.note && (
              <span className="dc-small" style={{ display: 'block', marginBlockStart: 'var(--dc-space-1)' }}>{it.note}</span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: 0 }}>{it.node}</div>
        </li>
      ))}
    </ul>
  );
}

/** The public API as declared in the registry. */
function PropsTable({ props }: { props: NonNullable<Component['props']> }) {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
      <thead>
        <tr>
          {['Prop', 'Type', 'Default'].map((h) => (
            <th key={h} style={thStyle}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.map((p) => (
          <tr key={p.name}>
            {/* Name and default never wrap: with four columns they were breaking mid-word, so
                `count` rendered as "coun / t". Only the type column, which holds long unions, wraps. */}
            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
              <code>{p.name}</code>
              {p.required && <span className="dc-small"> required</span>}
            </td>
            <td style={tdStyle}><code>{p.type ?? 'unspecified'}</code></td>
            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
              {p.default ? <code>{p.default}</code> : <span className="dc-small">none</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The changelog tab.
 *
 * There is no per-component history in the registry and every package still sits at 0.1.0, so this
 * says that rather than rendering an invented version table. Part LVI: the site must not look more
 * finished than the system is.
 */
function ComponentChangelog({ name }: { name: string }) {
  return (
    <>
      <h2 className="dc-h2" id="changelog">Changelog</h2>
      <Callout type="Important" title="No per-component history yet">
        {name} has no recorded version history. Every Envision package is still at <code>0.1.0</code> and the
        registry does not carry per-component changes, so there is nothing here to show. Until releases are cut,
        the honest sources are the repository history and the system-wide changelog.
      </Callout>
      <DocGrid columns={2}>
        <DocCard to="/tools/changelog" title="System changelog">Chronological technical history for the system as a whole.</DocCard>
        <DocCard to="/governance/versioning" title="Versioning">What version numbers will mean, and what they mean today.</DocCard>
      </DocGrid>
    </>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)',
  fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--envision-t2-color-content-secondary-default)',
};
const tdStyle: React.CSSProperties = {
  padding: 'var(--dc-space-2) var(--dc-space-3)', verticalAlign: 'top',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)',
};

/** A real button for the hand-off to Storybook, which is the next place a developer goes. */
const storybookButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--dc-space-2)',
  padding: 'var(--dc-space-3) var(--dc-space-4)',
  textDecoration: 'none',
  fontSize: 'var(--envision-t1-font-size-14)',
  fontWeight: 'var(--envision-t1-font-weight-600)',
  color: 'var(--envision-t2-color-content-primary-default)',
  border: '1px solid var(--envision-t2-color-border-strong-default)',
  borderRadius: 'var(--envision-t2-border-radius-container-md)',
};

const quoteStyle: React.CSSProperties = {
  padding: 'var(--dc-space-3) var(--dc-space-4)', margin: '0 0 16px',
  background: 'var(--dc-surface-warm)',
  borderInlineStart: '3px solid var(--envision-t2-color-border-brand-default)',
  borderRadius: 'var(--envision-t2-border-radius-control-xs)',
  fontSize: 'var(--envision-t1-font-size-14)',
};

/** The registry stores `aria` as prose or a list, so both shapes are rendered. */
function ariaText(aria: unknown): string {
  return typeof aria === 'string' ? aria : JSON.stringify(aria);
}

/** Extracts the members of a union type string such as "'primary'|'outline'|'ghost'". */
function unionValues(type: string): string[] {
  return type.split('|').map((s) => s.trim().replace(/^'|'$/g, '')).filter((s) => /^[a-z0-9-]+$/i.test(s));
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Registry prop names are camelCase; the elements observe kebab-case attributes. */
const attrName = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const Pending = () => (
  <p className="dc-small">Implementation detail pending verification. The registry does not record this yet.</p>
);

/** Minimum attributes each real element needs to render meaningfully. */
const SAMPLE_ATTRS: Record<string, Record<string, string>> = {
  'envision-button': { variant: 'primary', label: 'Apply design' },
  'envision-icon-button': { icon: 'tune', 'accessible-name': 'Adjust' },
  'envision-badge': { tone: 'brand', count: '3', label: '3 items' },
  'envision-input': { label: 'Full name', placeholder: 'Ada Lovelace' },
  'envision-label': { text: 'Project name', 'html-for': 'demo' },
  'envision-checkbox': { label: 'Include lighting package' },
  'envision-radio': { label: 'Beadboard Shaker', name: 'sample', value: 'a' },
  'envision-switch': { label: 'Show upgrade pricing', checked: '' },
  'envision-link': { href: '#', label: 'Continue to Design Center', variant: 'standalone' },
  'envision-tab': { label: 'Customize', selected: '' },
  'envision-option-card': { title: 'Cabinet Style', note: 'Included', value: 'shaker' },
  'envision-right-rail': { heading: 'Kitchen' },
};

/**
 * Which product composition actually contains a given element.
 *
 * The page used to render the Design Center right rail for every component, which meant a Field
 * page illustrated itself with a rail containing no field. A surface is only offered here if its
 * composition genuinely includes that element; anything else gets an honest note instead.
 */
const PRODUCT_SURFACES: Array<{
  tags: string[];
  /** Components claimed by registry id, for those with no custom element of their own. */
  ids?: string[];
  title: string;
  surface: () => React.ReactNode;
  annotations: string[];
}> = [
  {
    tags: ['envision-option-card', 'envision-tab', 'envision-button'],
    title: 'Design Center · right rail',
    surface: () => <DesignCenterRail />,
    annotations: [
      'Tabs switch between Customize and Packages without leaving the room being configured.',
      'Each selection row shows the current choice and its cost delta.',
      'The running upgrade total stays visible while choices are made.',
      'The commit action is a real Button, so keyboard activation is the platform’s.',
    ],
  },
  {
    tags: ['envision-input', 'envision-label', 'envision-checkbox', 'envision-radio', 'envision-switch'],
    title: 'Quote request · form',
    surface: () => <FormPanel />,
    annotations: [
      'Every control carries its own label, so none depends on placeholder text to be understood.',
      'The invalid field shows its error beneath itself, next to the control that has to change.',
      'Checkbox, radio and switch each answer a different question: many, one of several, on or off.',
      'The commit action sits at the end of the flow, after every decision it depends on.',
    ],
  },
  {
    tags: ['envision-material-swatch'],
    title: 'Design Center · finish group',
    surface: () => <FinishGroup />,
    annotations: [
      'Swatches carry the real material color, so the choice is made on the material itself.',
      'Selection is a ring plus the caption beneath, never color alone.',
      'An unavailable finish stays visible rather than disappearing from the set.',
    ],
  },
  {
    tags: ['envision-package-card'],
    title: 'Design Center · packages',
    surface: () => <PackagesTab />,
    annotations: [
      'A package is one card: its name, what it changes, and what it adds to the price.',
      'The popular badge is a claim about demand, so it is a badge rather than a different card style.',
      'The Packages tab is an alternative to Customize, not an addition: choosing here replaces individual selections.',
    ],
  },
  {
    tags: ['envision-breadcrumbs'],
    title: 'Design Center · room header',
    surface: () => <RoomHeader />,
    annotations: [
      'The trail names where this room sits, so the current page never has to repeat its own ancestry in prose.',
      'The last crumb is the current page and is not a link, because it goes nowhere.',
      'The heading beneath is the page title; the trail is navigation, not a heading.',
    ],
  },
  {
    tags: [],
    ids: ['notification-badge', 'notification-bell'],
    title: 'Design Center · top bar',
    surface: () => <NotificationBell />,
    annotations: [
      'The count is a real Badge, anchored to the bell rather than placed beside it, so it reads as belonging to the bell.',
      'The number is the count of unread items, not a decoration: at zero the badge is not rendered at all.',
      'The bell carries the accessible name; the badge is announced through it rather than separately.',
    ],
  },
  {
    tags: ['envision-badge', 'envision-link', 'envision-icon-button'],
    title: 'Design Center · page chrome',
    surface: () => <PageChrome />,
    annotations: [
      'The badge counts outstanding decisions rather than decorating the heading.',
      'A standalone link is the way onward; it is not a button, because it navigates.',
      'Icon buttons carry an accessible name, since the glyph alone is not one.',
    ],
  },
];

/**
 * The composition to show on a component's page.
 *
 * Matching used to be by custom-element tag alone, which meant a component with no element of its
 * own could never be matched, and its page said it appears in no composition even when it plainly
 * does. Notification Badge is the case in point: it has no element, but the count on the bell is a
 * real `envision-badge`. Surfaces may therefore also claim components by registry id.
 */
const surfaceFor = (tag: string | null | undefined, id: string | null | undefined) =>
  PRODUCT_SURFACES.find((s) => (tag ? s.tags.includes(tag) : false) || (id ? (s.ids ?? []).includes(id) : false));

/**
 * Sample data for the elements whose API is a JS PROPERTY rather than an attribute.
 *
 * Six components take objects or arrays (a material, a package, a list of crumbs), which cannot be
 * expressed as markup attributes. Without this they fell through to "No safe default example", so
 * six built components documented themselves with a shrug.
 */
const SAMPLE_PROPS: Record<string, Record<string, unknown>> = {
  'envision-material-swatch': {
    option: { id: 'oak', name: 'White Oak', finish: 'Natural', priceLabel: 'Included', color: '#c9b28a' },
  },
  'envision-option-card': {
    options: [
      { id: 'shaker', name: 'Beadboard Shaker', color: '#c9b28a' },
      { id: 'flat', name: 'Flat Panel', color: '#5b4636' },
    ],
  },
  'envision-package-card': {
    pkg: {
      id: 'heritage', name: 'Heritage Package', description: 'Warm oak, brass hardware, quartz counters.',
      priceLabel: '+$4,280', popular: true, badgeLabel: 'Popular', color: '#c9b28a',
    },
  },
  'envision-breadcrumbs': {
    items: [{ label: 'Kitchen', href: '#' }, { label: 'Cabinets', href: '#' }, { label: 'Finish' }],
  },
};

/** The slotted body some elements need before they render as anything but an empty shell. */
const SAMPLE_SLOT: Record<string, React.ReactNode> = {
  'envision-right-rail': <envision-option-card title="Cabinet Style" note="Included" value="shaker" />,
};

/** Widths for elements that are built for a sized container rather than for their own content. */
const PREVIEW_WIDTH: Record<string, number> = {
  'envision-input': 320,
  'envision-right-rail': 320,
  'envision-option-card': 320,
  'envision-package-card': 320,
};

/** Renders the REAL custom element with its minimum attributes, properties and slotted content. */
/**
 * The glyph shown when documenting a component's icon props.
 *
 * These are the INSTANCE_SWAP defaults its Figma set carries, so the page and the library
 * demonstrate the same thing rather than each picking a favourite.
 */
const SAMPLE_GLYPH: Record<string, Record<string, string>> = {
  field: { leadingIcon: 'search', trailingIcon: 'close' },
  button: { leadingIcon: 'arrow_back', trailingIcon: 'arrow_forward' },
};

function Sample({ tag, overrides, bare }: { tag: string; overrides?: Record<string, string>; bare?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const props = SAMPLE_PROPS[tag];
  useEffect(() => {
    if (!ref.current || !props) return;
    // Properties, not attributes: an object cannot survive being stringified into markup.
    for (const [k, v] of Object.entries(props)) {
      (ref.current as unknown as Record<string, unknown>)[k] = v;
    }
  }, [props]);

  if (!SAMPLE_ATTRS[tag] && !props) {
    return <span className="dc-small">No safe default example for {tag}. See Storybook.</span>;
  }
  const attrs: Record<string, unknown> = { ...(SAMPLE_ATTRS[tag] ?? {}), ...(overrides ?? {}) };
  if (props) attrs.ref = ref;
  const el = createElement(tag, attrs, SAMPLE_SLOT[tag]);
  // Some elements are designed for a container of a known width (the right rail is 320). Left to
  // shrink to their content in a preview they lay out cramped, which documents them wrongly: the
  // OptionCard came out 213px against the 306px it actually gets in the rail.
  // `bare` is for the anatomy stage, which sets the width itself so the markers line up.
  const width = bare ? undefined : PREVIEW_WIDTH[tag];
  return width ? <div style={{ width }}>{el}</div> : el;
}

function sampleMarkup(tag: string): string {
  const attrs = SAMPLE_ATTRS[tag] ?? {};
  const s = Object.entries(attrs).map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${v}"`)).join('');
  return `<${tag}${s}></${tag}>`;
}

/* ------------------------------------------------------------------- states */

/**
 * States a specimen can be POSED in, because the component exposes them as an attribute.
 *
 * Every value here was checked against the element's own `observedAttributes`, so a pose either
 * drives the real component or is not offered. Anything absent from this table is either an
 * interaction state (below) or a state the component enters from its data, and neither can be
 * honestly staged by the documentation.
 */
const STATE_ATTRS: Record<string, Record<string, Record<string, string | undefined>>> = {
  'envision-button': {
    default: {},
    disabled: { disabled: '' },
    loading: { loading: '' },
  },
  'envision-icon-button': {
    default: {},
    selected: { selected: '' },
    disabled: { disabled: '' },
  },
  'envision-link': {
    default: {},
    'disabled(optional)': { disabled: '' },
  },
  'envision-input': {
    empty: { value: undefined, placeholder: 'Ada Lovelace' },
    filled: { value: 'Ada Lovelace' },
    invalid: { invalid: '', 'error-message': 'Enter a first and last name.' },
    required: { required: '' },
    'read-only': { readonly: '', value: 'Ada Lovelace' },
    disabled: { disabled: '', value: 'Ada Lovelace' },
  },
  'envision-checkbox': {
    checked: { checked: '' },
    unchecked: { checked: undefined },
    disabled: { disabled: '' },
    error: { invalid: '' },
  },
  'envision-radio': {
    selected: { checked: '' },
    unselected: { checked: undefined },
    disabled: { disabled: '' },
  },
  'envision-switch': {
    on: { checked: '' },
    off: { checked: undefined },
    disabled: { disabled: '' },
  },
  'envision-badge': { default: {} },
  // Breadcrumbs takes its trail from a property, so `current` is a position in that trail rather
  // than an attribute. The default specimen is the real trail, and its last item IS the current one.
  'envision-breadcrumbs': { default: {} },
  'envision-tab': {
    default: { selected: undefined },
    selected: { selected: '' },
    disabled: { selected: undefined, disabled: '' },
  },
  'envision-material-swatch': {
    default: {},
    selected: { selected: '' },
    unavailable: { unavailable: '' },
  },
  'envision-option-card': {
    default: {},
    'selected/active': { active: '' },
    loading: { loading: '' },
    'price-pending': { 'price-pending': '' },
  },
  'envision-package-card': {
    default: {},
    selected: { selected: '' },
    // `popular` is deliberately absent. PackageCard resolves it as `pkg?.popular ?? getBool(...)`,
    // so the fixture's property wins and the attribute would pose nothing.
  },
  'envision-right-rail': {
    default: {},
    loading: { loading: '' },
  },
};

/**
 * States the pointer and the keyboard own. They live as `:hover` and `:focus-visible` inside each
 * component's shadow root, so nothing outside can force them, and painting a fake one with a class
 * would document a screen the system never produces. The reader performs them on a real element
 * instead, which is the only honest demonstration available.
 */
const INTERACTION_STATES: Record<string, string> = {
  hover: 'hover',
  'hover(underline)': 'hover',
  focus: 'focus',
  'focus-visible': 'focus',
  pressed: 'pressed',
};

/** Chip that reports whether the live element is in a state right now. */
function StateChip({ label, on }: { label: string; on: boolean }) {
  return (
    <code
      style={{
        padding: 'var(--dc-space-1) var(--dc-space-3)',
        borderRadius: 'var(--envision-t2-border-radius-control)',
        fontSize: 'var(--envision-t1-font-size-12)',
        border: `1px solid ${on ? 'var(--envision-t2-color-border-strong-default)' : 'var(--envision-t2-color-border-default-default)'}`,
        background: on ? 'var(--envision-t2-color-background-info-subtle-default)' : 'transparent',
        color: on
          ? 'var(--envision-t2-color-content-primary-default)'
          : 'var(--envision-t2-color-content-secondary-default)',
        transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
      }}
    >
      {label}
    </code>
  );
}

/**
 * The real element, wired to a readout. Hovering, tabbing to, and pressing the specimen drives the
 * component's own states, and the chips report which one it is in as it happens.
 *
 * The handlers listen on a wrapper rather than the element: focus crosses the shadow boundary as a
 * composed `focusin`, and pointer events land on the host, so the wrapper sees all three.
 */
function InteractiveStates({ tag, labels }: { tag: string; labels: string[] }) {
  const [live, setLive] = useState<Record<string, boolean>>({});
  const set = (k: string, v: boolean) => setLive((s) => (s[k] === v ? s : { ...s, [k]: v }));
  return (
    <LivePreview caption="The running component. Hover it, Tab to it, and hold the pointer down — the chips light as it enters each state.">
      <div style={{ display: 'grid', gap: 'var(--dc-space-6)', justifyItems: 'center' }}>
        <div
          onPointerEnter={() => set('hover', true)}
          onPointerLeave={() => { set('hover', false); set('pressed', false); }}
          onPointerDown={() => set('pressed', true)}
          onPointerUp={() => set('pressed', false)}
          onFocus={() => set('focus', true)}
          onBlur={() => set('focus', false)}
        >
          <Sample tag={tag} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--dc-space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {labels.map((l) => <StateChip key={l} label={l} on={Boolean(live[INTERACTION_STATES[l]])} />)}
        </div>
      </div>
    </LivePreview>
  );
}

/**
 * The States section (Part XX): every state this site can show is shown running, not named.
 *
 * Three buckets, because a component's states are not one kind of thing. Attribute states are posed
 * on real elements. Interaction states are performed by the reader on a real element. What is left
 * is entered from data the documentation does not have, and saying so is better than staging it.
 */
function StatesSection({ c }: { c: Component }) {
  const states = (c.states ?? []) as string[];
  const poses = c.tag ? STATE_ATTRS[c.tag] ?? {} : {};
  const posed = states.filter((s) => s in poses);
  const performed = states.filter((s) => s in INTERACTION_STATES);
  const rest = states.filter((s) => !(s in poses) && !(s in INTERACTION_STATES));

  return (
    <>
      <p>
        {c.name} supports the states below. Any state not listed is not supported, and simulating one in
        product code puts a screen outside the system.
      </p>

      {performed.length > 0 && c.tag && <InteractiveStates tag={c.tag} labels={performed} />}

      {posed.length > 0 && c.tag && (
        <LivePreview caption="Each specimen is the running component with the state's own attribute set.">
          <SpecimenGrid
            items={posed.map((s) => ({
              label: s,
              node: <Sample tag={c.tag!} overrides={poses[s] as Record<string, string>} />,
            }))}
          />
        </LivePreview>
      )}

      {rest.length > 0 && (
        <>
          <p className="dc-small">
            {c.name} also enters {rest.length === 1 ? 'this state' : 'these states'} from its own data rather than
            from an attribute or the pointer, so there is nothing here for this page to pose. Storybook drives{' '}
            {rest.length === 1 ? 'it' : 'them'} with real fixtures.
          </p>
          <ul>{rest.map((s) => <li key={s}><code>{s}</code></li>)}</ul>
        </>
      )}
    </>
  );
}
