import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Callout, CodeBlock, Copyable, PageHeader, TokenTable } from '../modules';
import { ArchitectureDiagram, LayerStack, Pipeline, TokenTierAnatomy } from '../modules/diagrams';
import { DocArticle } from '../templates';
import { system } from '../data/generated';
import { tokenSeq } from './TokenLayers';

/* -------------------------------------------------------------- architecture */

const ARCH_TOC: Array<{ id: string; label: string; level?: 2 | 3 }> = [
  { id: 'why', label: 'Why a name beats a value' },
  { id: 'tiers', label: 'The tiers' },
  { id: 'anatomy', label: 'Anatomy of a token name' },
  { id: 'which', label: 'Which tier to consume' },
  { id: 'build', label: 'How the build works' },
  { id: 'source-generated-consumer', label: 'Source vs generated', level: 3 },
];

/** Benchmark technical article (Part XXV). */
export function TokenArchitecture() {
  const resolved = system.tokens.find((t) => t.name === '--envision-t2-color-primary-500')?.resolved;

  return (
    <DocArticle
      trail={[
              { label: 'Envision Design System', to: '/' },
              { label: 'Design Tokens' },
              { label: 'Token architecture' },
            ]}
      title="Token architecture"
      lead="Envision separates tokens into layers so that a decision can be changed at the level it was actually made. The layer a token belongs to tells you who is allowed to change it and who is expected to consume it."
      related={[
              { title: 'Token reference', to: '/tokens/reference', note: 'Every token, with its alias chain.' },
              { title: 'Color', to: '/foundations/color', note: 'The clearest example of tiers in use.' },
              { title: 'Components', to: '/components', note: 'Where tier 3 tokens live.' },
            ]}
      toc={ARCH_TOC}
      {...tokenSeq('/tokens/architecture')}
    >

      <h2 className="dc-h2" id="why">Why a name beats a value</h2>
      <p>
        As a value, a decision is <code>#3a3835</code>: precise, and useless six months later. Nothing records why
        that color, or which of its forty appearances are one decision and which merely coincide &mdash; and on a
        white-label platform, it belongs to one builder.
      </p>
      <p>
        As a token it is <Copyable text="--envision-t2-color-background-brand-default" />: forty places, one
        decision, one edit. A reviewer can see at a glance whether a screen follows the system or improvises.
      </p>
      <Callout type="Note" title="The rule that follows">
        Use the most specific tier that describes your intent, never a raw value. If no token says what you mean,
        the system is missing a decision.
      </Callout>

      <h2 className="dc-h2" id="tiers">The tiers</h2>
      <p>
        A clear hierarchy that scales. Each layer may reference the one above it, and never the one below. The
        token on each row is the same decision followed down the stack: the background of a primary Button.
      </p>
      <LayerStack
        flow
        alt={
          'Four layers, top to bottom. Primitive holds raw values with no meaning. Brand assigns Envision’s ' +
          'identity to those values. Semantic assigns a role such as a brand background. Component holds values ' +
          'scoped to a single component. Responsive is a parallel layer that re-declares a small number of ' +
          'semantic tokens at narrower viewports. A token may reference the layer above it and never the layer ' +
          'below.'
        }
        layers={[
          {
            label: 'Primitive', icon: 'layers', tone: 'neutral',
            note: 'Raw values. Consumed by the layers below, not by products.',
            example: '--envision-t1-color-neutral-800',
          },
          {
            label: 'Brand', icon: 'brush', tone: 'warm',
            note: 'The builder’s color, supplied by the theme document.',
            example: '--envision-t2-color-primary-500',
          },
          {
            label: 'Semantic', icon: 'target', tone: 'abstract',
            note: 'Roles and intent. What product work should consume.',
            example: '--envision-t2-color-background-brand-default',
          },
          {
            label: 'Component', icon: 'deployed_code', tone: 'sage',
            note: 'Scoped to one component. Insulates it from broad changes.',
            example: '--envision-t3-button-primary-color-background-default',
          },
        ]}
        footnotes={[
          {
            icon: 'swap_horiz',
            title: 'Brand sits between primitive and semantic.',
            body: 'It is the white-label seam: a builder’s color is supplied here, separately from what that color is used for.',
          },
          {
            icon: 'moving',
            title: 'Responsive tokens are not a fifth layer.',
            body: 'A few semantic tokens re-declared at a breakpoint. Components never learn one exists.',
          },
        ]}
      />
      <p>
        A single flat list fails either way: names that describe appearance cannot be rebranded without renaming
        everything, and names that describe intent cannot express that two intents share a value today but need not
        tomorrow. Letting a token reference another token resolves both, and the chain records the reasoning.
      </p>

      <h2 className="dc-h2" id="anatomy">Anatomy of a token name</h2>
      <p>
        The stack above shows how the tiers relate. These show what a token in each tier actually is: what the
        tier holds, how its names are assembled, and the one rule that governs it. Every name below is real.
      </p>
      <TokenTierAnatomy
        alt={
          'Three reference cards, one per tier. Tier 1 holds raw values and is listed by category: colors, ' +
          'typography, spacing, border, elevation, motion, breakpoints, and z-index. Tier 2 maps a raw value to ' +
          'a role, and its name is built from a prefix, tier, category, property, role, and state. Tier 3 is ' +
          'scoped to a single component, and its name is built from a prefix, tier, component, variant, ' +
          'property, and state. A token may reference the tier above it and never the tier below, and names are ' +
          'identical in Figma and in code.'
        }
        tiers={[
          {
            badge: 'Tier 1 Tokens',
            title: 'Definitions',
            note: 'Tier 1 tokens define the raw ingredients available to the system. Products never consume them directly.',
            figma: 'color/green/500',
            css: '--envision-t1-color-green-500',
            categories: [
              ['Colors', 'Primitive color ramp values', 'green-500, taupe-300'],
              ['Typography', 'Families, sizes, weights, line heights', 'font-size-16, font-weight-600'],
              ['Spacing', 'Raw spacing values', 'spacing-100, spacing-200'],
              ['Border', 'Radius and width', 'border-radius-8, border-width-1'],
              ['Elevation', 'Shadow recipes', 'elevation-card, elevation-menu'],
              ['Motion', 'Durations', 'duration-200, duration-340'],
              ['Breakpoints', 'Responsive thresholds', 'breakpoint-md, breakpoint-lg'],
              ['Z-index', 'Stacking order', 'z-index-modal, z-index-menu'],
            ],
            footer: 'Tier 1 names carry the raw value, not a step. Renaming a primitive is safe because nothing in product code points at it.',
          },
          {
            badge: 'Tier 2 Tokens',
            title: 'Semantic',
            note: 'Tier 2 maps raw values to a role in the interface. This is the layer product work consumes.',
            figma: 'color/background/brand/default',
            css: '--envision-t2-color-background-brand-default',
            parts: [
              { label: 'Prefix', value: '--envision' },
              { label: 'Tier', value: 't2' },
              { label: 'Category', value: 'color' },
              { label: 'Property', value: 'background' },
              { label: 'Role', value: 'brand' },
              { label: 'State', value: 'default' },
            ],
            path: ['--envision', 't2', 'color', 'background', 'brand', 'default'],
            footer: 'Names reflect role, not appearance. Tier 2 also holds the brand ramp, which is where a builder’s color enters the system.',
          },
          {
            badge: 'Tier 3 Tokens',
            title: 'Component',
            note: 'Tier 3 is scoped to one component, so a change there cannot reach anything else. Use sparingly, and prefer Tier 2.',
            figma: 'button/primary/color/background/default',
            css: '--envision-t3-button-primary-color-background-default',
            parts: [
              { label: 'Prefix', value: '--envision' },
              { label: 'Tier', value: 't3' },
              { label: 'Component', value: 'button' },
              { label: 'Variant', value: 'primary' },
              { label: 'Property', value: 'color-background' },
              { label: 'State', value: 'default' },
            ],
            path: ['--envision', 't3', 'button', 'primary', 'color-background', 'default'],
            footer: 'Reach for Tier 3 only when a component needs a decision no other component should inherit. Most components need none.',
          },
        ]}
        footnotes={[
          {
            title: 'Flow',
            body: 'Tier 1 to Tier 2 to Tier 3. A token may reference the tier above it, never the tier below.',
          },
          {
            title: 'Responsive tokens',
            body: 'They run in parallel by re-declaring semantic tokens at breakpoints. Not a fourth tier.',
          },
          {
            title: 'Naming',
            body: 'Names stay identical in Figma and in code, so one search finds both.',
          },
        ]}
      />

      <h2 className="dc-h2" id="which">Which tier to consume</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead>
            <tr>{['Tier', 'Who changes it', 'Who consumes it'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)', fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--envision-t2-color-content-secondary-default)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[
              ['Tier 1 · Primitive', 'System team, rarely', 'Tier 2 only'],
              ['Tier 2 · Semantic', 'System team', 'Components and products'],
              ['Tier 3 · Component', 'System team, per component', 'That component'],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) => (
                  <td key={i} style={{ padding: 'var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)', verticalAlign: 'top' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="dc-h2" id="build">How the build works</h2>
      <p>
        Tokens are authored as a source and transformed by Style Dictionary into the formats each platform needs.
        The build preserves references rather than flattening them, which is what keeps the alias chain visible in
        the generated CSS instead of collapsing every token to a literal.
      </p>
      <Pipeline
        alt={
          'The token build takes a DTCG-compatible token source, runs Style Dictionary over it, and emits CSS ' +
          'custom properties and TypeScript exports, which components then consume.'
        }
        steps={[
          { label: 'Token source', note: 'DTCG-compatible', tone: 'abstract' },
          { label: 'Style Dictionary', note: 'Transforms, preserving references', tone: 'neutral' },
          { label: 'CSS + TypeScript', note: 'Generated output', tone: 'active' },
          { label: 'Components', note: 'Consume the output', tone: 'active' },
        ]}
      />
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`--envision-t2-color-primary-500: ${resolved ?? '#3a3835'};   /* the active theme */\n--envision-t2-color-background-brand-default: var(--envision-t2-color-primary-500);\n--envision-t3-button-primary-color-background-default: var(--envision-t2-color-background-brand-default);`}
      />
      <h3 className="dc-h3" id="source-generated-consumer">Source, generated output, and consumer</h3>
      <p>
        This distinction is the one to internalize, because getting it wrong is silent. Editing a generated file
        appears to work, survives a refresh, and is destroyed by the next build with no error.
      </p>
      <ArchitectureDiagram
        alt={
          'Three roles. Source files are edited by hand and are the origin of every value: the Figma variable ' +
          'collections and the token source. Generated files are produced by the build and must never be edited: ' +
          'the CSS custom properties, the TypeScript exports and the per-tier stylesheets. Consumers import the ' +
          'generated output: the component package, the Storybook preview, and Envision applications.'
        }
        caption="Anything in the Generated row is rewritten by the next build. To change it, edit the Source row and rebuild."
        groups={[
          {
            role: 'Source',
            note: 'Edited by hand. The origin of every value.',
            items: ['Figma variable collections', 'packages/tokens/src/'],
          },
          {
            role: 'Generated',
            note: 'Produced by the build. Never edit.',
            items: ['packages/tokens/dist/tokens.css', 'packages/tokens/dist/tokens.js', 'packages/tokens/dist/tokens.d.ts'],
          },
          {
            role: 'Consumer',
            note: 'Imports the generated output.',
            items: ['@envision/components', '@envision/storybook', 'Envision applications'],
          },
        ]}
      />
    </DocArticle>  );
}

/* ---------------------------------------------------------------- reference */

export function TokenReference() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [tier, setTier] = useState<'all' | 1 | 2 | 3>('all');

  const rows = useMemo(
    () => system.tokens.filter((t) => (tier === 'all' || t.tier === tier) && (!q || t.name.includes(q.toLowerCase()))),
    [q, tier],
  );

  return (
    <div className="dc-container">
      <PageHeader
        trail={[
          { label: 'Envision Design System', to: '/' },
          { label: 'Design Tokens' },
          { label: 'Token reference' },
        ]}
        title="Token reference"
        lead="Every token emitted by the build, with its reference chain and resolved value. Generated from packages/tokens/dist/tokens.css, so this page cannot describe a token that does not exist."
      />

      <div style={{ display: 'flex', gap: 'var(--dc-space-3)', flexWrap: 'wrap', alignItems: 'end', margin: 'var(--dc-space-2) 0 var(--dc-space-5)' }}>
        {/* The real Field component. */}
        <div style={{ minWidth: 280 }}>
          <envision-input
            type="search"
            label="Filter tokens"
            placeholder="Filter by token name"
            leading-icon="search"
            onInput={(e: React.FormEvent) => setQ((e.target as HTMLInputElement).value ?? '')}
          />
        </div>
        <div role="group" aria-label="Filter by tier" style={{ display: 'flex', gap: 'var(--dc-space-2)' }}>
          {/* Real Buttons: primary marks the active tier, outline the rest. */}
          {(['all', 1, 2, 3] as const).map((t) => (
            <envision-button
              key={String(t)}
              size="sm"
              variant={tier === t ? 'primary' : 'outline'}
              label={t === 'all' ? 'All tiers' : `Tier ${t}`}
              onClick={() => setTier(t)}
            />
          ))}
        </div>
        <span className="dc-small" aria-live="polite">{rows.length} shown</span>
      </div>

      <TokenTable filter={(n) => rows.some((r) => r.name === n)} limit={400} />
      {rows.length > 400 && (
        <p className="dc-small">Showing the first 400. Filter by name or tier to narrow the list.</p>
      )}
    </div>
  );
}
