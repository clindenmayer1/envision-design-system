import {
  Callout, CodeBlock, Copyable, DoDont, LivePreview, TokenTable,
} from '../modules';
import { ScrollTable, SpacingScale, TABLE_CELL, TypeSpecimen, tokenCount } from '../modules/scales';
import { DesignCenterRail, FinishGroup, ProductExample, ResponsiveExample } from '../modules/product';
import { DocArticle } from '../templates';
import { system } from '../data/generated';

/**
 * The Foundations articles.
 *
 * Every scale, value and token name is generated from the token build rather than typed here. Where
 * the system has not made a decision (a motion easing scale, a formal column grid) the page says so
 * instead of inventing one, per the source-of-truth rule.
 */

/** Section order is fixed by the brief; previous/next is derived from it so it cannot drift. */
const ORDER: Array<[string, string]> = [
  ['Color', '/foundations/color'],
  ['Typography', '/foundations/typography'],
  ['Spacing', '/foundations/spacing'],
  ['Layout & grid', '/foundations/layout-grid'],
  ['Responsive design', '/foundations/responsive-design'],
  ['Breakpoints', '/foundations/breakpoints'],
  ['Radius', '/foundations/radius'],
  ['Elevation & shadows', '/foundations/elevation-shadows'],
  ['Iconography', '/foundations/iconography'],
  ['Motion', '/foundations/motion'],
  ['Imagery', '/foundations/imagery'],
];
const seq = (path: string) => {
  const i = ORDER.findIndex(([, p]) => p === path);
  const at = (n: number) => (ORDER[n] ? { title: ORDER[n][0], to: ORDER[n][1] } : undefined);
  return { prev: i > 0 ? at(i - 1) : { title: 'Foundations', to: '/foundations' }, next: at(i + 1) };
};
const trail = (leaf: string) => [
  { label: 'Envision Design System', to: '/' },
  { label: 'Foundations', to: '/foundations' },
  { label: leaf },
];

/* ------------------------------------------------------------------- overview */

/* ----------------------------------------------------------------- typography */

export function Typography() {
  const families = system.tokens.filter((t) => t.name.startsWith('--envision-t1-font-family-'));
  const weights = system.tokens.filter((t) => t.name.startsWith('--envision-t1-font-weight-'));
  const lineHeights = system.tokens.filter((t) => t.name.startsWith('--envision-t1-line-height-'));
  return (
    <DocArticle
      trail={trail('Typography')}
      title="Typography"
      lead="Typography establishes hierarchy, readability, and consistency across Envision while allowing users to quickly understand what information matters most."
      toc={[
        { id: 'overview', label: 'Overview' },
        { id: 'typeface', label: 'Typeface' },
        { id: 'scale', label: 'Type scale' },
        { id: 'roles', label: 'Responsive roles' },
        { id: 'hierarchy', label: 'Hierarchy' },
        { id: 'headings', label: 'Headings' },
        { id: 'body', label: 'Body text' },
        { id: 'controls', label: 'Labels and controls' },
        { id: 'numbers', label: 'Numbers and data' },
        { id: 'wrapping', label: 'Wrapping and truncation' },
        { id: 'responsive', label: 'Responsive typography' },
        { id: 'accessibility', label: 'Accessibility' },
        { id: 'tokens', label: 'Tokens' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Content', to: '/content', note: 'What the words should say.' },
        { title: 'Responsive design', to: '/foundations/responsive-design', note: 'How type behaves as space changes.' },
        { title: 'Accessibility', to: '/accessibility', note: 'Zoom, reflow and hierarchy.' },
      ]}
      {...seq('/foundations/typography')}
    >
      <h2 className="dc-h2" id="overview">Overview</h2>
      <p>
        Typography in a product interface does one job above all others: it tells someone what to read first. Envision
        adds a second constraint, because most screens are asking a person to compare things, and type has to establish
        hierarchy without competing with the materials being compared.
      </p>

      <h2 className="dc-h2" id="typeface">Typeface</h2>
      <p>Four families are declared as primitives. Each has a distinct job.</p>
      <ScrollTable head={['Token', 'Value', 'Used for']}>
        {families.map((f) => {
          const name = f.name.replace('--envision-t1-font-family-', '');
          const use: Record<string, string> = {
            inter: 'All interface text. The working typeface of the product.',
            'playfair-display': 'Display and editorial moments only, via the display family semantic.',
            georgia: 'The Envision wordmark.',
            mono: 'Code and tabular values in documentation.',
          };
          return (
            <tr key={f.name}>
              <td style={TABLE_CELL}><Copyable text={f.name} /></td>
              <td style={{ ...TABLE_CELL, fontFamily: `var(${f.name})` }}>{f.resolved}</td>
              <td style={TABLE_CELL}>{use[name] ?? 'Role not recorded in source.'}</td>
            </tr>
          );
        })}
      </ScrollTable>
      <Callout type="Developer" title="Fonts are not bundled by the system">
        The token records the family name; loading the font is the host application's job. Both this site and Storybook
        load Inter and Playfair Display over the network, which is also the reason the visual test threshold cannot be
        tightened. Self-hosting them is a known open item.
      </Callout>

      <h2 className="dc-h2" id="scale">Type scale</h2>
      <p>
        {tokenCount('--envision-t1-font-size-')} size steps, drawn below at true size. They are primitives: a component
        should reference a semantic role or its own component token rather than picking a step directly.
      </p>
      <TypeSpecimen />

      <h2 className="dc-h2" id="roles">Responsive type roles</h2>
      <p>
        Above the primitives sits a small set of semantic roles. These are the names product work should consume, and
        they are the only type tokens that change value at a breakpoint.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-font-size-')} />

      <h2 className="dc-h2" id="hierarchy">Hierarchy</h2>
      <p>
        Hierarchy comes from the combination of size, weight and space, not from size alone. In practice Envision leans
        harder on weight and spacing than on size, because interface density does not leave room for dramatic size
        jumps.
      </p>
      <ProductExample
        title="Design Center · right rail"
        surface={<DesignCenterRail />}
        annotations={[
          'The panel heading is the only strong-weight item at the top level.',
          'Row titles and cost deltas share a size; weight separates them.',
          'The total uses weight rather than a larger size, so the footer stays compact.',
          'Tab labels sit at the control size, not the heading size.',
        ]}
      />

      <h2 className="dc-h2" id="headings">Headings</h2>
      <p>
        Heading <em>level</em> and heading <em>size</em> are different decisions. Level is structure and is read by
        assistive technology; size is appearance. A section that is structurally third-level should be an{' '}
        <code>h3</code> even when it needs to look small, and CSS should carry the appearance.
      </p>
      <p>
        Never skip a level to get a size. If <code>h2</code> looks too large in a dense panel, reduce the size of that
        <code> h2</code> rather than promoting an <code>h3</code> into the gap.
      </p>

      <h2 className="dc-h2" id="body">Body text</h2>
      <p>
        Reading measure matters more than size. Envision documentation keeps body text near 60 to 75 characters per
        line; beyond that the eye loses the line return, which is why this article's column stops well short of the
        page width.
      </p>
      <p>
        Product interface text is a different problem. A rail is 340 to 390 wide and its text is scanned rather than
        read, so short labels at a control size beat paragraphs at a reading size.
      </p>

      <h2 className="dc-h2" id="controls">Labels and controls</h2>
      <p>
        Control typography is defined by the component, not by the page. Button, Tab, Field and Badge each carry their
        own type decisions so that a control looks the same everywhere it appears.
      </p>
      <LivePreview caption="Four components, four control type treatments, none set by the surrounding page.">
        <envision-button variant="primary" label="Apply design" />
        <envision-tab label="Customize" selected />
        <envision-badge tone="brand" count={3} label="3 items" />
        <div style={{ width: 200 }}><envision-input label="Project name" placeholder="Sonoma" /></div>
      </LivePreview>

      <h2 className="dc-h2" id="numbers">Numbers and data</h2>
      <p>
        Envision shows prices constantly, and prices are compared vertically. Where numbers stack, they are set with
        tabular figures so digits align in columns and a longer number does not shift its neighbours.
      </p>
      <CodeBlock language="css" filename="Applied where numbers stack" code={`font-variant-numeric: tabular-nums;`} />
      <p>
        There is no separate numeric type token. Tabular figures are a property applied where the layout needs them,
        which is honest to how the system is currently built.
      </p>

      <h2 className="dc-h2" id="wrapping">Wrapping and truncation</h2>
      <p>
        Wrap by default. Truncate only when the value is recognizable from its start and the full value is available
        elsewhere, which is almost never true of a material name.
      </p>
      <p>
        Never truncate a price. A clipped cost is worse than a wrapped one, because it is silently wrong rather than
        visibly long. PackageCard line-clamps a long name to two lines and does not clamp its price.
      </p>
      <DoDont
        items={[
          { kind: 'do', text: 'Let a long material name wrap to two lines, so someone can still tell walnut matte from walnut satin.' },
          { kind: 'dont', text: 'Truncate at one line to keep rows even. The distinguishing word is usually the one you removed.' },
        ]}
      />

      <h2 className="dc-h2" id="responsive">Responsive typography</h2>
      <p>
        Envision does not use fluid type. Sizes are fixed, and a small set of semantic roles step down once, at the
        tablet breakpoint. Everything else keeps its size at every width.
      </p>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`@media (max-width: 1024px) {\n  :root {\n    --envision-t2-font-size-display: var(--envision-t1-font-size-40);\n    --envision-t2-font-size-h1: var(--envision-t1-font-size-32);\n    --envision-t2-font-size-h2: var(--envision-t1-font-size-28);\n    --envision-t2-font-size-h3: var(--envision-t1-font-size-22);\n    --envision-t2-font-size-h4: var(--envision-t1-font-size-18);\n    --envision-t2-font-size-h5: var(--envision-t1-font-size-16);\n  }\n}`}
      />
      <p>
        Body and control sizes are deliberately absent from that block. Shrinking interface text is the fastest way to
        make a dense screen unusable, and the space problem it appears to solve is nearly always a layout problem.
      </p>

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Because sizes are fixed rather than viewport-scaled, browser zoom and user font settings work normally. A
        person zooming to 200% gets larger text and a reflowed layout rather than text that recalculates itself back
        down.
      </p>
      <p>
        Weight must never be the only carrier of meaning. “Bold means selected” fails for anyone who cannot compare two
        weights at a glance, which is why selection in Envision is a ring and a check.
      </p>
      <p>
        Contrast is a pairing decision, not a size decision. Small text does not get a lighter content role because it
        is small.
      </p>

      <h2 className="dc-h2" id="tokens">Tokens</h2>
      <p>
        Weights and line heights are primitives. Line heights are stored as unitless ratios, which matters: bound as a
        pixel value they would collapse, and the system has hit exactly that bug before.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t1-font-weight-') || n.startsWith('--envision-t1-line-height-')} />
      <p className="dc-small">
        {weights.length} weights and {lineHeights.length} line-height ratios are declared.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Build hierarchy from the existing steps, using weight and space before reaching for a larger size.' },
          { kind: 'dont', text: 'Introduce an intermediate size because one screen feels crowded. The next screen will need a different one, and the scale stops being a scale.' },
          { kind: 'do', text: 'Match heading level to document structure and control appearance with CSS.' },
          { kind: 'dont', text: 'Pick a heading level for how big it looks. Screen reader users navigate by that structure.' },
        ]}
      />
    </DocArticle>
  );
}

/* -------------------------------------------------------------------- spacing */

export function Spacing() {
  return (
    <DocArticle
      trail={trail('Spacing')}
      title="Spacing"
      lead="Spacing creates predictable rhythm and relationships between interface elements so Envision layouts remain understandable and consistent across screens."
      toc={[
        { id: 'why', label: 'Why systematic spacing' },
        { id: 'scale', label: 'The scale' },
        { id: 'structure', label: 'How the scale works' },
        { id: 'internal', label: 'Internal spacing' },
        { id: 'external', label: 'External spacing' },
        { id: 'relationship', label: 'Relationship spacing' },
        { id: 'rhythm', label: 'Page rhythm' },
        { id: 'ownership', label: 'Who owns component spacing' },
        { id: 'responsive', label: 'Responsive spacing' },
        { id: 'tokens', label: 'Tokens' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Layout & grid', to: '/foundations/layout-grid', note: 'Where spacing becomes structure.' },
        { title: 'Responsive tokens', to: '/tokens/responsive', note: 'The spacing that changes with width.' },
        { title: 'Components', to: '/components', note: 'Where internal spacing lives.' },
      ]}
      {...seq('/foundations/spacing')}
    >
      <h2 className="dc-h2" id="why">Why systematic spacing matters</h2>
      <p>
        Space is how an interface says what belongs together. Two controls 8 apart read as one thing; the same controls
        32 apart read as two. That judgment is made dozens of times per screen, and if each one is made by eye the
        result is a layout where grouping means nothing because it is inconsistent.
      </p>
      <p>
        A scale converts a continuous judgment into a small set of choices. The value is not the specific numbers; it is
        that everyone is choosing from the same short list.
      </p>

      <h2 className="dc-h2" id="scale">The spacing scale</h2>
      <p>Drawn at true width, so the relationships are visible rather than described.</p>
      <SpacingScale />

      <h2 className="dc-h2" id="structure">How the scale works</h2>
      <p>
        The scale is step-named rather than pixel-named: <code>spacing-200</code> resolves to 16px. The name is an
        index, not a measurement, which lets a value change without every reference becoming a lie.
      </p>
      <p>
        The steps are an 8-point rhythm with 4-point half-steps in the dense range, thinning out as the values grow: 4,
        8, 12, 16, 20, 24, 28, 32, then 40, 48 and 64. There is no single multiplier that generates the whole scale, and
        claiming one would be a tidier story than the truth.
      </p>
      <Callout type="Developer" title="A real failure this naming has caused">
        {/* verify-claims: allow --envision-t1-spacing-16 (named to state that it does not exist) */}
        Because the scale is step-named, <code>--envision-t1-spacing-16</code> does not exist. Components once
        referenced it, the declarations were dropped as invalid, and Button lost all of its vertical padding while
        still passing the visual suite. If a spacing variable resolves to nothing, check whether you used the value
        instead of the step.
      </Callout>

      <h2 className="dc-h2" id="internal">Internal spacing</h2>
      <p>
        Space inside a component, which the component owns: button padding, card padding, the gap between a field and
        its label. These are expressed as component tokens so they can change per component without moving the shared
        scale.
      </p>
      <TokenTable filter={(n) => /^--envision-t3-button-(small|medium|large)-padding/.test(n)} />

      <h2 className="dc-h2" id="external">External spacing</h2>
      <p>
        Space between components, which the layout owns. A component should not carry an outer margin: it cannot know
        what will sit next to it, and a margin it brings along will be wrong in half the places it is used.
      </p>

      <h2 className="dc-h2" id="relationship">Relationship spacing</h2>
      <p>The rule underneath every specific value: proximity is meaning.</p>
      <figure style={{ margin: '24px 0' }}>
        <p className="dc-sr-only">
          Two groups of three bars. In the first, all six bars are evenly spaced and read as one undifferentiated set.
          In the second, bars are tightly grouped in threes with a larger gap between groups, and read as two groups.
        </p>
        <div style={{ display: 'grid', gap: 'var(--dc-space-5)', padding: 'var(--dc-space-6)', background: 'var(--dc-surface-warm)', border: '1px solid var(--envision-t2-color-border-default-default)', borderRadius: 'var(--envision-t1-border-radius-10)' }}>
          {[
            { label: 'Even spacing: no grouping is communicated', gaps: [16, 16, 16, 16, 16] },
            { label: 'Grouped spacing: two sets, unmistakably', gaps: [8, 8, 40, 8, 8] },
          ].map((row) => (
            // minWidth: 0 is required. A grid child defaults to min-width:auto, which refuses to
            // shrink below its content, so the overflow-x on the row below never engages and the
            // whole document scrolls instead.
            <div key={row.label} style={{ minWidth: 0 }}>
              <p className="dc-small" style={{ margin: '0 0 8px' }}>{row.label}</p>
              {/* The bars are fixed width on purpose: the gap must be compared at true size. The
                  row therefore scrolls inside itself rather than forcing the page to scroll. */}
              <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBlockEnd: 'var(--dc-space-1)' }}>
                {row.gaps.map((g, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 52, height: 30, background: 'var(--envision-t1-color-neutral-200)', borderRadius: 'var(--envision-t1-border-radius-4)' }} />
                    <span style={{ width: g }} />
                  </span>
                ))}
                <span style={{ width: 52, height: 30, background: 'var(--envision-t1-color-neutral-200)', borderRadius: 'var(--envision-t1-border-radius-4)' }} />
              </div>
            </div>
          ))}
        </div>
      </figure>
      <p>
        Practical consequence: if a group is not reading as a group, increase the space around it rather than adding a
        border. A border is a second visual element solving a problem space already solves.
      </p>

      <h2 className="dc-h2" id="rhythm">Page rhythm</h2>
      <p>
        Vertical rhythm is the same rule applied down the page. This documentation uses roughly 72 between major
        sections, 16 from a heading to its paragraph, and 24 from a paragraph to an example. The specific numbers matter
        less than that a reader can feel where a section begins without reading it.
      </p>

      <h2 className="dc-h2" id="ownership">Who owns component spacing</h2>
      <p>
        The component. Overriding a component's internal padding from a page is the most common way a component stops
        looking like itself, and it is invisible in review because the override lives somewhere else.
      </p>
      <p>
        If a component's spacing is wrong in a context, that is worth raising: either the context is unusual, or the
        component is wrong everywhere and nobody has said so.
      </p>

      <h2 className="dc-h2" id="responsive">Responsive spacing</h2>
      <p>
        One spacing decision changes with width. The page gutter drops at the tablet breakpoint; component padding does
        not change at all.
      </p>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`@media (max-width: 1024px) {\n  :root {\n    --envision-t2-layout-page-gutter: var(--envision-t1-spacing-250);\n  }\n}`}
      />
      <p>
        That restraint is deliberate. Shrinking padding inside controls to reclaim space makes touch targets smaller
        exactly where touch is most likely.
      </p>

      <h2 className="dc-h2" id="tokens">Tokens</h2>
      <p>Semantic spacing roles are what layout code should consume; the primitives sit behind them.</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-spacing-')} />
      <CodeBlock language="css" filename="Consuming a spacing role" code={`.selection-row + .selection-row {\n  margin-block-start: var(--envision-t2-spacing-control-gap);\n}`} />

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Use a larger step to separate groups, so the layout communicates structure before anyone reads a word.' },
          { kind: 'dont', text: 'Nudge individual gaps until a screen looks balanced. That balance holds at one width and drifts at every other.' },
          { kind: 'do', text: 'Let the component own its internal padding, so it looks the same everywhere it appears.' },
          { kind: 'dont', text: 'Override component padding from a page to make one layout fit. The next person will not know the exception exists.' },
          { kind: 'do', text: 'Reach for space before a border when something needs separating.' },
          { kind: 'dont', text: 'Add a divider because the gap was too small. Two solutions to one problem is one too many.' },
        ]}
      />
    </DocArticle>
  );
}

/* -------------------------------------------------------------- layout & grid */

export function LayoutGrid() {
  return (
    <DocArticle
      trail={trail('Layout & grid')}
      title="Layout &amp; grid"
      lead="Layout organizes Envision content into predictable regions and relationships while allowing interfaces to adapt to different viewport sizes and workflows."
      toc={[
        { id: 'overview', label: 'Overview' },
        { id: 'principles', label: 'Layout principles' },
        { id: 'regions', label: 'Page regions' },
        { id: 'grid', label: 'Is there a grid?' },
        { id: 'width', label: 'Content width' },
        { id: 'rails', label: 'Rails and panels' },
        { id: 'bleed', label: 'Full-bleed content' },
        { id: 'responsive', label: 'Responsive transformation' },
        { id: 'implementation', label: 'Implementation' },
      ]}
      related={[
        { title: 'Responsive design', to: '/foundations/responsive-design', note: 'How these regions adapt.' },
        { title: 'Spacing', to: '/foundations/spacing', note: 'The rhythm inside regions.' },
        { title: 'Patterns', to: '/patterns', note: 'What fills these regions.' },
      ]}
      {...seq('/foundations/layout-grid')}
    >
      <h2 className="dc-h2" id="overview">Overview</h2>
      <p>
        Envision's layout problem is unusual. Most of the screen is a visualization the person is judging, and the
        controls that change it must stay beside it. That single constraint explains most of the structure below.
      </p>

      <h2 className="dc-h2" id="principles">Layout principles</h2>
      <ul>
        <li><strong>The subject stays visible.</strong> Controls sit beside what they change, never on top of it.</li>
        <li><strong>Navigation is stable.</strong> Chrome does not move as content changes; only the work area updates.</li>
        <li><strong>The work area is flexible, the reading area is not.</strong> A workspace can use all available width; prose cannot.</li>
        <li><strong>Regions have jobs.</strong> A region is defined by what it is for, not by how wide it is.</li>
      </ul>

      <h2 className="dc-h2" id="regions">Page regions</h2>
      <p>
        Envision composes from a small set of named regions. The right rail is the one carrying the most system
        behavior, because it is where decisions are made.
      </p>
      <ScrollTable head={['Region', 'Job', 'Encoded as']}>
        {[
          ['Top bar', 'Identity, global actions and context', '--envision-t2-layout-top-bar-height'],
          ['Main workspace', 'The visualization or content being worked on', 'Fills remaining space'],
          ['Right rail', 'Decisions that change the workspace', '--envision-t2-layout-right-rail-width'],
          ['Bottom action tray', 'Commit actions in constrained layouts', 'Component-owned'],
          ['Page gutter', 'Breathing room at the page edge', '--envision-t2-layout-page-gutter'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2].startsWith('--') ? <Copyable text={r[2]} /> : <span className="dc-small">{r[2]}</span>}</td>
          </tr>
        ))}
      </ScrollTable>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-layout-')} />

      <h2 className="dc-h2" id="grid">Is there a grid?</h2>
      <Callout type="Important" title="Envision has no formal column grid">
        The token source encodes column counts for two specific surfaces, the card grid and the swatch grid, and
        nothing else. There is no 12-column page grid, and documenting one would be inventing a system the product does
        not use.
      </Callout>
      <p>
        What exists instead is a region model plus two content grids whose column counts are responsive tokens. That is
        a smaller claim than a grid system, and it is the accurate one.
      </p>
      <TokenTable filter={(n) => n.includes('layout-card-grid') || n.includes('layout-swatch-grid')} />

      <h2 className="dc-h2" id="width">Content width</h2>
      <p>
        Reading width and workspace width solve opposite problems. Prose has an upper bound because the eye loses the
        line return past roughly 75 characters. A workspace has no such bound: more width is more room to see the thing
        being configured.
      </p>
      <p>
        This is why the documentation article you are reading stops well short of the window while the Design Center
        uses everything available. Applying one rule to both would damage whichever it was not designed for.
      </p>

      <h2 className="dc-h2" id="rails">Rails and panels</h2>
      <p>
        The right rail is a persistent region on desktop and a modal sheet below the tablet breakpoint. Critically it is
        the same component with the same API, not a second mobile implementation.
      </p>
      {/* The rail is bounded here on purpose: the annotations below describe a header that stays
          put, a body that scrolls and a footer that does not scroll away, and an unbounded rail
          demonstrates none of it. */}
      <ProductExample
        title="Design Center · rail beside workspace"
        surface={<DesignCenterRail height={560} />}
        annotations={[
          'Fixed width from a layout token, so the workspace gets everything else.',
          'Header and tabs stay put; only the body scrolls.',
          'The footer is sticky, so the total and commit action never scroll away.',
          'Below 1024 this same element becomes a focus-trapped modal sheet.',
        ]}
      />

      <h2 className="dc-h2" id="bleed">Full-bleed content</h2>
      <p>
        The 3D visualization and room imagery run edge to edge, with no gutter. Everything else respects the page
        gutter. The rule is narrow on purpose: full-bleed is for content where the crop carries meaning, not for
        emphasis.
      </p>

      <h2 className="dc-h2" id="responsive">Responsive transformation</h2>
      <p>Three region-level changes happen at the tablet breakpoint, all driven by responsive tokens.</p>
      <ul>
        <li>The rail stops being a rail and becomes a sheet.</li>
        <li>The card grid drops to a single column.</li>
        <li>The page gutter and top bar height both reduce.</li>
      </ul>
      <ResponsiveExample
        widths={[420, 340, 280]}
        caption="A selection surface at three container widths. Content reflows; it is never scaled down."
      >
        <FinishGroup />
      </ResponsiveExample>

      <h2 className="dc-h2" id="implementation">Implementation</h2>
      <CodeBlock
        language="css"
        filename="Consuming layout tokens"
        code={`.workspace {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) var(--envision-t2-layout-right-rail-width);\n  padding-inline: var(--envision-t2-layout-page-gutter);\n}`}
      />
      <p>
        No breakpoint appears in that rule. The rail width and gutter change themselves at 1024, which is the point of
        encoding them as responsive tokens.
      </p>
    </DocArticle>
  );
}
