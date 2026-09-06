import {
  Callout, CodeBlock, Copyable, DoDont, InlineIconGrid, LivePreview, SystemGlyphGrid, TokenTable,
} from '../modules';
import {
  BreakpointTable, ElevationSheet, RadiusSheet, ScrollTable, TABLE_CELL,
} from '../modules/scales';
import { FinishGroup, ResponsiveExample } from '../modules/product';
import { DocArticle } from '../templates';
import { system } from '../data/generated';

const ORDER: Array<[string, string]> = [
  ['Overview', '/foundations/overview'],
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

/* ---------------------------------------------------------- responsive design */

export function ResponsiveDesign() {
  return (
    <DocArticle
      trail={trail('Responsive design')}
      title="Responsive design"
      lead="Responsive Envision experiences adapt their structure, priority, and interaction to available space instead of simply shrinking a desktop interface."
      toc={[
        { id: 'philosophy', label: 'Philosophy' },
        { id: 'space', label: 'Space, not devices' },
        { id: 'priority', label: 'Content priority' },
        { id: 'techniques', label: 'The five techniques' },
        { id: 'hide', label: 'Hide and reveal' },
        { id: 'navigation', label: 'Navigation adaptation' },
        { id: 'rails', label: 'Rails and panels' },
        { id: 'type-space', label: 'Type and spacing' },
        { id: 'imagery', label: 'Imagery' },
        { id: 'touch', label: 'Touch interaction' },
        { id: 'sequence', label: 'One experience, three widths' },
        { id: 'accessibility', label: 'Accessibility' },
        { id: 'testing', label: 'Testing' },
      ]}
      related={[
        { title: 'Breakpoints', to: '/foundations/breakpoints', note: 'The declared thresholds.' },
        { title: 'Responsive tokens', to: '/tokens/responsive', note: 'What changes automatically.' },
        { title: 'Layout & grid', to: '/foundations/layout-grid', note: 'The regions being adapted.' },
      ]}
      {...seq('/foundations/responsive-design')}
    >
      <h2 className="dc-h2" id="philosophy">Responsive philosophy</h2>
      <p>
        Shrinking is not adapting. A desktop layout scaled to 375 is technically responsive and practically unusable:
        the same information, at the same relative importance, in a tenth of the room.
      </p>
      <p>
        Envision's position is that narrow space changes what matters, not just how much fits. On a phone, someone is
        usually checking one decision rather than comparing six, and the layout should reflect that rather than
        compress the comparison view.
      </p>

      <h2 className="dc-h2" id="space">Available space, not named devices</h2>
      <p>
        A breakpoint is a statement about a layout, not about hardware. “The rail no longer fits beside the
        visualization” is true at a width, regardless of whether that width is a small laptop, a split window or a
        tablet.
      </p>
      <p>
        Designing for named devices fails immediately: a window at 900 is not a tablet, and a foldable is not any of
        the categories. Designing for widths always holds.
      </p>

      <h2 className="dc-h2" id="priority">Content priority</h2>
      <p>
        As space decreases, decide what stays primary before deciding what moves. In the Design Center the order is:
        the thing being configured, the decision being made, the running cost, then everything else.
      </p>
      <p>
        That order is why the rail becomes a full sheet rather than a narrow column. A narrow column would preserve the
        layout and destroy the priority.
      </p>

      <h2 className="dc-h2" id="techniques">The five techniques</h2>
      <p>Envision uses five, and naming them makes design review much faster.</p>
      <ScrollTable head={['Technique', 'What it does', 'Where Envision uses it']}>
        {[
          ['Reflow', 'Content rewraps into the space available, no structural change', 'Swatch groups and card grids'],
          ['Resize', 'An element keeps its role but changes dimension', 'Rail width, page gutter, top bar height'],
          ['Stack', 'Side-by-side content becomes vertical', 'Card grid drops to one column at 1024'],
          ['Wrap', 'A row becomes several rows rather than shrinking its items', 'Finish groups; swatches never shrink below a judgeable size'],
          ['Transform', 'A component adopts a different presentation entirely', 'The rail becomes a modal sheet'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        Transform is the expensive one and the most valuable. It is also the only one that changes behavior rather than
        appearance, which is why it is a component's decision rather than a page's.
      </p>

      <h2 className="dc-h2" id="hide">Hide and reveal</h2>
      <p>
        Hiding is acceptable when the content is genuinely secondary and remains reachable. It is not acceptable when
        it changes what someone can do, or when it hides the consequence of a decision.
      </p>
      <DoDont
        items={[
          { kind: 'do', text: 'Collapse a supporting description behind a disclosure, so the decision itself stays visible.' },
          { kind: 'dont', text: 'Hide the running cost total on narrow screens. It is the single fact a person most needs while choosing.' },
        ]}
      />

      <h2 className="dc-h2" id="navigation">Navigation adaptation</h2>
      <p>
        This site is its own example. Above 900 the sidebar is persistent at 256. Below, it becomes a drawer behind a
        menu button, and that drawer is a modal surface: focus moves in, Tab is trapped, Escape closes, focus returns.
      </p>
      <p>
        Navigation that becomes a drawer without that contract is the most common accessibility regression introduced
        by responsive work.
      </p>

      <h2 className="dc-h2" id="rails">Rails and panels</h2>
      <p>
        The rail transform is the clearest case of adaptation over shrinking. Below 1024 the same element re-composes as
        a modal dialog rather than a narrow column.
      </p>
      <p>
        This costs something and is worth being honest about: the sheet covers the visualization. The alternative,
        keeping both at a third of the space each, leaves neither usable, so the trade is accepted and the sheet is
        dismissible.
      </p>

      <h2 className="dc-h2" id="type-space">Type and spacing</h2>
      <p>
        Six semantic type roles step down once at 1024. Body and control text do not change at any width, because
        shrinking interface text to reclaim space makes a dense screen unusable exactly when it is hardest to read.
      </p>
      <p>
        Spacing changes even less: only the page gutter. Component padding is fixed, which keeps touch targets intact
        where touch is most likely.
      </p>

      <h2 className="dc-h2" id="imagery">Imagery</h2>
      <p>
        Material images are re-cropped rather than scaled, because a material sample scaled to a third of its size stops
        conveying grain and texture, which is the only reason it is on screen.
      </p>

      <h2 className="dc-h2" id="touch">Touch interaction</h2>
      <p>
        Narrow width implies touch, though the two are not the same thing. Three consequences follow.
      </p>
      <ul>
        <li><strong>Target size.</strong> Component padding is not reduced at narrow widths, which keeps targets large.</li>
        <li><strong>No hover-only information.</strong> Anything available only on hover is unavailable on touch. Tooltips supplement; they never carry the only copy of something.</li>
        <li><strong>No custom gestures.</strong> Envision uses taps and scrolling. A swipe-to-delete that exists nowhere else is undiscoverable and unannounceable.</li>
      </ul>

      <h2 className="dc-h2" id="sequence">One experience at three widths</h2>
      <ResponsiveExample
        widths={[420, 330, 270]}
        caption="A finish group at three container widths, rendered with the real MaterialSwatch component."
      >
        <FinishGroup />
      </ResponsiveExample>
      <ScrollTable head={['Width', 'What changed', 'What stayed', 'Why']}>
        {[
          ['Desktop', 'Nothing. The reference composition.', 'Rail beside the workspace', 'Comparison is the primary task and there is room for it'],
          ['Tablet', 'Type roles step down; gutter and top bar shrink; card grid stacks', 'Swatch size, component padding, the total', 'Chrome yields before content does'],
          ['Mobile', 'The rail becomes a modal sheet; swatches wrap', 'Swatch size, touch targets, cost visibility', 'A swatch below judgeable size defeats the purpose of showing it'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Responsive behavior and zoom are the same mechanism. A person at 200% zoom on a desktop produces the same
        effective width as a narrower window, so a layout that reflows properly is also a layout that zooms properly.
      </p>
      <p>
        Two hard rules. Content order must stay logical when things reflow, because DOM order is reading order and focus
        order. And the page must never scroll horizontally: wide tables and code scroll inside their own container.
      </p>

      <h2 className="dc-h2" id="testing">Testing</h2>
      <p>
        This documentation is verified at <strong>1440, 1024, 768, 430 and 375</strong> for document-level horizontal
        overflow on every built route.
      </p>
      <Callout type="Note" title="Test widths are not the same as breakpoints">
        768 and 430 are not declared breakpoints. They are test targets chosen to land between thresholds, which is
        where layout failures actually occur. The declared breakpoints are 390, 1024, 1080, 1280 and 1440.
      </Callout>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- breakpoints */

export function Breakpoints() {
  return (
    <DocArticle
      trail={trail('Breakpoints')}
      title="Breakpoints"
      lead="Breakpoints are the widths at which Envision changes how a layout is composed, encoded as tokens so the same thresholds are used everywhere."
      toc={[
        { id: 'what', label: 'What a breakpoint is' },
        { id: 'reference', label: 'Breakpoint reference' },
        { id: 'not-devices', label: 'Not device classes' },
        { id: 'why-many', label: 'Why five' },
        { id: 'choosing', label: 'Choosing when to change' },
        { id: 'tokens', label: 'Responsive token relationship' },
        { id: 'css', label: 'CSS implementation' },
        { id: 'testing', label: 'Testing around a threshold' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Responsive design', to: '/foundations/responsive-design', note: 'How adaptation is decided.' },
        { title: 'Responsive tokens', to: '/tokens/responsive', note: 'What actually changes.' },
        { title: 'Layout & grid', to: '/foundations/layout-grid', note: 'The regions affected.' },
      ]}
      {...seq('/foundations/breakpoints')}
    >
      <h2 className="dc-h2" id="what">What a breakpoint is</h2>
      <p>
        A width at which a layout decision changes. It is a property of the design, not of a screen: the threshold
        exists because a composition stops working, and it should be placed where that happens.
      </p>

      <h2 className="dc-h2" id="reference">Breakpoint reference</h2>
      <p>Generated from the primitive breakpoint tokens, so this table cannot drift from the source.</p>
      <BreakpointTable />

      <h2 className="dc-h2" id="not-devices">Breakpoints are not device classes</h2>
      <p>
        The tokens carry device-flavoured names, which is a naming convenience rather than a claim about hardware. A
        browser window at 1024 on a large monitor gets tablet behavior, and that is correct: the layout constraint is
        real regardless of the device causing it.
      </p>

      <h2 className="dc-h2" id="why-many">Why there are five</h2>
      <p>
        Only one of them currently drives a token change. <code>tablet</code> at 1024 is where the generated CSS
        re-declares responsive values, and it is the threshold where the rail stops being a rail.
      </p>
      <Callout type="Important" title="A system finding, stated rather than smoothed over">
        The other four breakpoints, mobile 390, dashboard 1080, desktop 1280 and wide 1440, are declared as tokens but
        do not appear in any generated media query. They document intended design targets rather than encoded
        behavior. Treating them as active thresholds would overstate what the implementation does.
      </Callout>

      <h2 className="dc-h2" id="choosing">Choosing when a layout changes</h2>
      <p>
        Let content decide. Resize until something breaks: a column becomes unreadable, two things collide, a target
        gets too small. That width is the candidate, and it should then be reconciled with the declared thresholds
        rather than becoming a sixth number.
      </p>
      <p>
        Adding a breakpoint is a system change. Every additional threshold multiplies the states that must be designed,
        built and tested.
      </p>

      <h2 className="dc-h2" id="tokens">Responsive token relationship</h2>
      <p>
        Most responsive behavior should not need a media query in product code at all. The token build re-declares a
        small set of semantic tokens at 1024, so a component consuming the semantic name changes with it.
      </p>

      <h2 className="dc-h2" id="css">CSS implementation</h2>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`@media (max-width: 1024px) {\n  :root {\n    --envision-t2-layout-page-gutter: var(--envision-t1-spacing-250);\n    --envision-t2-layout-right-rail-width: 390px;\n    --envision-t2-layout-top-bar-height: 56px;\n    --envision-t2-layout-card-grid-columns: 1;\n    --envision-t2-layout-swatch-grid-columns: 4;\n  }\n}`}
      />
      <Callout type="Developer" title="The literal 1024px is generated from the token, not typed">
        CSS custom properties are not valid inside a media condition, so the threshold appears as a literal{' '}
        <code>1024px</code> in the output. It is not maintained by hand: the build reads{' '}
        <Copyable text="--envision-t1-breakpoint-tablet" /> from the primitive source and fails the build if that
        token is missing. The platform constraint is real; the synchronization risk it would normally create has been
        engineered away.
      </Callout>

      <h2 className="dc-h2" id="testing">Testing around a threshold</h2>
      <p>
        Test at three widths per threshold: just below, exactly at, and just above. Bugs cluster at the boundary,
        because that is where two layouts are both nearly valid.
      </p>
      <p>
        For 1024 that means 1023, 1024 and 1025. Note that <code>max-width: 1024px</code> is inclusive, so 1024 gets
        the narrow layout, which surprises people often enough to be worth stating.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Consume the semantic token and let the value change at the threshold, so no breakpoint appears in your layout code.' },
          { kind: 'dont', text: 'Write your own media query for a value the token system already changes. It will drift the moment the threshold moves.' },
          { kind: 'do', text: 'Place a new adaptation where the content actually breaks, then reconcile it with the declared thresholds.' },
          { kind: 'dont', text: 'Add a breakpoint to fix a single screen. Every threshold multiplies what has to be designed and tested forever.' },
        ]}
      />
    </DocArticle>
  );
}

/* --------------------------------------------------------------------- radius */

export function Radius() {
  return (
    <DocArticle
      trail={trail('Radius')}
      title="Radius"
      lead="Radius gives Envision controls and surfaces a consistent shape language while helping distinguish interactive elements, containers, and larger interface regions."
      toc={[
        { id: 'overview', label: 'Overview' },
        { id: 'scale', label: 'The scale' },
        { id: 'why-many', label: 'Why several radii' },
        { id: 'controls', label: 'Controls' },
        { id: 'containers', label: 'Containers' },
        { id: 'nested', label: 'Nested surfaces' },
        { id: 'pill', label: 'Fully rounded' },
        { id: 'tokens', label: 'Tokens' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Component tokens', to: '/tokens/component', note: 'Where a component records its radius.' },
        { title: 'Elevation & shadows', to: '/foundations/elevation-shadows', note: 'The other shape signal.' },
        { title: 'Components', to: '/components', note: 'Radius in use.' },
      ]}
      {...seq('/foundations/radius')}
    >
      <h2 className="dc-h2" id="overview">Overview</h2>
      <p>
        Radius is a quiet signal that does real work: it tells someone whether they are looking at a thing they can
        press or a region that holds things. Envision uses it as a category marker rather than as decoration.
      </p>

      <h2 className="dc-h2" id="scale">The radius scale</h2>
      <p>Every primitive, drawn on identical tiles so the difference is the only variable.</p>
      <RadiusSheet />

      <h2 className="dc-h2" id="why-many">Why several radii exist</h2>
      <p>
        Not for variety. Each value marks a category, and the useful question when choosing one is “what kind of thing
        is this”, not “how round should this look”.
      </p>
      <ScrollTable head={['Kind of thing', 'Radius role', 'Example']}>
        {[
          ['Small control', 'control-xs', 'Inline code, small chips'],
          ['Control', 'control', 'Fields, secondary controls'],
          ['Container', 'container-md', 'Cards, panels, the primary button'],
          ['Fully rounded', 'pill / full', 'Badges, filter chips, avatars'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}><code>{r[1]}</code></td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="controls">Controls</h2>
      <p>
        Envision's primary button uses the container radius rather than the control radius, which is a deliberate
        exception: the brand CTA reads as a solid object rather than as a form control.
      </p>
      <LivePreview caption="Real components. Button takes container-md; the field takes the control radius.">
        <envision-button variant="primary" label="Apply design" />
        <envision-button variant="outline" label="Cancel" />
        <div style={{ width: 220 }}><envision-input label="Project name" placeholder="Sonoma" /></div>
      </LivePreview>

      <h2 className="dc-h2" id="containers">Containers</h2>
      <p>
        Cards, panels and trays share the container radius, so any surface holding other content is recognizable as a
        container before its contents are read.
      </p>

      <h2 className="dc-h2" id="nested">Nested surfaces</h2>
      <p>
        When a rounded thing sits inside another rounded thing, the inner radius should be smaller. Equal radii make
        the inner element look like it is escaping its container, because the visual gap narrows toward the corner.
      </p>
      <figure style={{ margin: '24px 0' }}>
        <p className="dc-sr-only">
          Two nested examples. On the left the inner surface has a smaller radius than its container and the corners
          look concentric. On the right both share the same radius and the inner surface appears to bulge at the corner.
        </p>
        <div style={{ display: 'flex', gap: 'var(--dc-space-6)', flexWrap: 'wrap' }}>
          {[
            ['Inner radius smaller', 12, 6],
            ['Equal radii', 12, 12],
          ].map(([label, outer, inner]) => (
            <span key={label as string} style={{ display: 'grid', gap: 'var(--dc-space-2)' }}>
              <span style={{ padding: 'var(--dc-space-3)', width: 180, borderRadius: outer as number, background: 'var(--dc-surface-sunken)', border: '1px solid var(--envision-t2-color-border-default-default)' }}>
                <span style={{ display: 'block', height: 56, borderRadius: inner as number, background: 'var(--dc-surface)', border: '1px solid var(--envision-t2-color-border-strong-default)' }} />
              </span>
              <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{label}</span>
            </span>
          ))}
        </div>
      </figure>

      <h2 className="dc-h2" id="pill">Fully rounded</h2>
      <p>
        <code>pill</code> and <code>full</code> both resolve to 999px, which is a deliberate duplicate: the name records
        intent. A pill is a stretched shape such as a badge; full is a circle such as an avatar.
      </p>
      <LivePreview caption="Badge, using the fully rounded radius.">
        <envision-badge tone="brand" count={3} label="3 items" />
        <envision-badge tone="error" shape="dot" label="Unread" />
      </LivePreview>

      <h2 className="dc-h2" id="tokens">Tokens</h2>
      <p>Consume the semantic roles. The primitives exist to define the scale, not to be referenced by product code.</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-border-radius-')} />

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Choose radius by what kind of thing the element is, so shape stays a reliable category signal.' },
          { kind: 'dont', text: 'Pick a radius by eye per screen. Shape stops meaning anything and starts being noise.' },
          { kind: 'do', text: 'Give a nested surface a smaller radius than its container so the corners read as concentric.' },
          { kind: 'dont', text: 'Reuse the container radius on an element inside it. The inner element appears to bulge out of the corner.' },
        ]}
      />
    </DocArticle>
  );
}

/* -------------------------------------------------------- elevation & shadows */

export function ElevationShadows() {
  const elevations = system.tokens.filter((t) => t.name.startsWith('--envision-t2-elevation-'));
  const layers = system.tokens.filter((t) => t.name.startsWith('--envision-t2-layer-'));
  return (
    <DocArticle
      trail={trail('Elevation & shadows')}
      title="Elevation &amp; shadows"
      lead="Elevation communicates layering and temporary spatial relationships when borders and position alone are not enough."
      toc={[
        { id: 'overview', label: 'Overview' },
        { id: 'communicates', label: 'What elevation communicates' },
        { id: 'scale', label: 'The elevation set' },
        { id: 'borders', label: 'Borders versus shadows' },
        { id: 'floating', label: 'Floating and overlay surfaces' },
        { id: 'zorder', label: 'Z-order is a different system' },
        { id: 'accessibility', label: 'Accessibility' },
        { id: 'implementation', label: 'Implementation' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Radius', to: '/foundations/radius', note: 'The other surface signal.' },
        { title: 'Panels', to: '/components/category/panels', note: 'The components that use elevation.' },
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'Where these roles live.' },
      ]}
      {...seq('/foundations/elevation-shadows')}
    >
      <h2 className="dc-h2" id="overview">Overview</h2>
      <p>
        Envision is a flat, warm, paper-like environment. Shadow is used sparingly and only where something genuinely
        sits above the page, because in an interface full of material photography, decorative shadow reads as visual
        noise competing with the product.
      </p>

      <h2 className="dc-h2" id="communicates">What elevation communicates</h2>
      <p>
        One thing: this surface is temporarily above the others, and dismissing it returns you to what is underneath.
        That is why elevation belongs on menus, trays and overlays, and not on a card that is simply important.
      </p>
      <p>
        Importance is a hierarchy problem, solved with position, size and weight. Using shadow for emphasis produces a
        page where everything floats and nothing is actually above anything.
      </p>

      <h2 className="dc-h2" id="scale">The elevation set</h2>
      <p>
        {elevations.length} semantic elevations, each applied below to an identical surface. There is no numbered
        scale: each token names a role.
      </p>
      <ElevationSheet />
      <TokenTable filter={(n) => n.startsWith('--envision-t2-elevation-')} />

      <h2 className="dc-h2" id="borders">Borders versus shadows</h2>
      <p>
        This is the decision the page exists to settle. A border separates; a shadow lifts. Most surfaces in Envision
        need separating, not lifting.
      </p>
      <ScrollTable head={['Situation', 'Use', 'Why']}>
        {[
          ['A card in a grid', 'Border', 'It sits in the page, not above it. A shadow would imply it can be dismissed.'],
          ['The right rail', 'Border', 'Persistent structure. Elevation would suggest it is temporary.'],
          ['A menu or popover', 'Shadow', 'Genuinely above the page and dismissible.'],
          ['A modal sheet', 'Shadow plus scrim', 'Above everything, and the scrim states the page is inert.'],
          ['A hovered card', 'Border change, or the raised-hover role', 'Feedback, not a change in layer.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        Default to a border. Reach for elevation only when the surface is genuinely temporary and dismissible.
      </p>

      <h2 className="dc-h2" id="floating">Floating and overlay surfaces</h2>
      <p>
        The tray and menu roles exist for surfaces that appear over content and go away. The overlay-dark role is the
        scrim behind a modal, which is doing a different job: it is not lifting the dialog, it is stating that
        everything behind it is currently inert.
      </p>

      <h2 className="dc-h2" id="zorder">Z-order is a different system</h2>
      <p>
        Elevation is visual; stacking is structural. They are related but not interchangeable, and Envision encodes
        them separately: {layers.length} layer tokens govern what is on top of what.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-layer-')} />
      <p>
        A surface can be visually flat and structurally on top, such as sticky navigation. Conversely a shadow does not
        put anything above anything; only stacking does. Using a big shadow to fix an overlap problem never works.
      </p>

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Shadow is not a reliable signal. It can be invisible in high-contrast modes, on low-quality displays, and to
        anyone with reduced contrast sensitivity. Anything a shadow communicates must also be communicated another way:
        a modal is announced by its role, not by its shadow.
      </p>
      <p>
        A shadow also never counts toward contrast. A surface separated from its background only by a shadow may fail
        non-text contrast; if the boundary matters, draw a border.
      </p>

      <h2 className="dc-h2" id="implementation">Implementation</h2>
      <CodeBlock
        language="css"
        filename="Consuming an elevation role"
        code={`.menu {\n  background: var(--envision-t2-color-background-surface-default);\n  border-radius: var(--envision-t2-border-radius-container-md);\n  box-shadow: var(--envision-t2-elevation-menu);\n  z-index: var(--envision-t2-layer-menu);\n}`}
      />

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Use a border for anything that lives in the page, and reserve shadow for surfaces that can be dismissed.' },
          { kind: 'dont', text: 'Add elevation to make something feel important. Everything ends up floating and the signal stops meaning anything.' },
          { kind: 'do', text: 'Pair an elevation role with the matching layer token so visual and structural stacking agree.' },
          { kind: 'dont', text: 'Invent an elevation value between two existing roles. The set is small so that layering stays readable.' },
        ]}
      />
    </DocArticle>
  );
}

/* --------------------------------------------------------------- iconography */

export function Iconography() {
  return (
    <DocArticle
      trail={trail('Iconography')}
      title="Iconography"
      lead="Icons provide compact visual cues for actions, status, navigation, and structure while remaining understandable alongside text and assistive technology."
      toc={[
        { id: 'architecture', label: 'Current icon architecture' },
        { id: 'sources', label: 'Two icon sources' },
        { id: 'the-set', label: 'The icon set' },
        { id: 'style', label: 'Style' },
        { id: 'size', label: 'Size and alignment' },
        { id: 'with-labels', label: 'Icons with labels' },
        { id: 'icon-only', label: 'Icon-only controls' },
        { id: 'decorative', label: 'Decorative versus semantic' },
        { id: 'color', label: 'Color' },
        { id: 'implementation', label: 'Implementation' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'IconButton', to: '/components/iconbutton', note: 'The icon-only control.' },
        { title: 'Accessibility', to: '/accessibility', note: 'Naming and labeling.' },
        { title: 'Color', to: '/foundations/color', note: 'Icon color roles.' },
      ]}
      {...seq('/foundations/iconography')}
    >
      <h2 className="dc-h2" id="architecture">Current icon architecture</h2>
      <p>
        Envision splits icons by who owns them, and that split exists because of a real production failure rather than
        as a theoretical preference.
      </p>
      <Callout type="Developer" title="Why the architecture is split">
        System-owned chrome originally used Material Symbols ligatures. In any host application that had not loaded the
        font, a ligature name such as <code>chevron_right</code> rendered as the literal words. This happened in the
        Envision product when OptionCard was first adopted. Glyphs a component draws for <em>itself</em> now ship as
        inline SVG inside the component, so a component cannot depend on the host loading anything.
      </Callout>

      <h2 className="dc-h2" id="sources">Two icon sources</h2>
      <ScrollTable head={['Source', 'Used for', 'Requires a font?', 'Where it lives']}>
        {[
          ['Inline SVG', 'Glyphs a component draws for itself: chevrons, checks', 'No', 'packages/components/src/base/icons.ts'],
          ['Material Symbols ligatures', 'Icons a consumer passes in, such as Button leadingIcon or IconButton icon', 'Yes, loaded by the host', 'The host application'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}><code>{r[3]}</code></td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The boundary is deliberate. Inlining an open-ended icon set into the component library is not the library's
        job, so consumer-supplied icons remain ligature-based and the host is responsible for loading the font. If you
        pass an icon name and see the word instead, that is the missing font, not a broken component.
      </p>

      <h2 className="dc-h2" id="the-set">The icon set</h2>
      <p>
        Two groups, because the two sources above are owned by different people. The first is
        finite and shipped; the second is a vocabulary, not a library.
      </p>

      <h3 className="dc-h3">Component-owned glyphs</h3>
      <p>
        Everything a component draws for itself. These are rendered here from the library&rsquo;s own{' '}
        <code>ICON</code> export, so this grid cannot show a glyph the components do not actually
        ship, and cannot miss one they do.
      </p>
      <InlineIconGrid />

      <h3 className="dc-h3">Material Symbols in use</h3>
      <p>
        Consumer-supplied icons are any name in Material Symbols, which is thousands of glyphs the
        host loads rather than anything Envision ships &mdash; so there is no complete set to print.
        These are the names Envision&rsquo;s own surfaces use, collected from the component registry
        and from this site. Treat it as the vocabulary to reach for first, not as a limit.
      </p>
      <SystemGlyphGrid />

      <h2 className="dc-h2" id="style">Style</h2>
      <p>
        System glyphs are stroked, not filled: <code>fill="none"</code>, a 2px stroke, round caps and joins, on a 24
        viewBox. They inherit <code>currentColor</code>, so an icon takes the color of the text beside it without being
        told.
      </p>

      <h2 className="dc-h2" id="size">Size and alignment</h2>
      <p>Three semantic icon sizes exist. Consume these rather than setting pixel dimensions.</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-size-icon-')} />
      <p>
        Inside a control, an icon is sized relative to the label rather than fixed, so it scales with the button size.
        Button renders consumer icons at <code>1.25em</code> with <code>line-height: 1</code>, which keeps the glyph
        optically balanced against the text baseline.
      </p>

      <h2 className="dc-h2" id="with-labels">Icons with labels</h2>
      <p>
        When an icon accompanies text, the text is the accessible name and the icon is decorative. Announcing both
        produces “arrow forward Continue”, which is worse than either alone.
      </p>
      <LivePreview caption="Real Buttons. The icon is hidden from assistive technology; the label carries the meaning.">
        <envision-button variant="primary" label="New design" leading-icon="add" />
        <envision-button variant="outline" label="Continue" trailing-icon="arrow_forward" />
      </LivePreview>

      <h2 className="dc-h2" id="icon-only">Icon-only controls</h2>
      <p>
        An icon-only control has no visible text, so it must carry an explicit accessible name. IconButton makes this
        required rather than optional, which is the system enforcing something it can actually enforce.
      </p>
      <LivePreview caption="IconButton. Each carries an accessible name that is not visible on screen.">
        <envision-icon-button icon="tune" accessible-name="Adjust settings" />
        <envision-icon-button icon="bookmark" accessible-name="Save design" selected />
      </LivePreview>
      <p>
        Be skeptical of icon-only controls generally. Outside a small set of near-universal glyphs, an icon alone is
        ambiguous, and the space saved is rarely worth the ambiguity introduced.
      </p>

      <h2 className="dc-h2" id="decorative">Decorative versus semantic</h2>
      <p>
        A decorative icon repeats what adjacent text already says and is hidden with <code>aria-hidden</code>. A
        semantic icon carries information nothing else carries, and needs a name.
      </p>
      <p>
        The test: delete the icon. If nothing is lost, it was decorative. If information disappeared, it was semantic
        and needs a text alternative, and probably needs visible text instead.
      </p>

      <h2 className="dc-h2" id="color">Color</h2>
      <p>
        Icons inherit <code>currentColor</code> by default, which is almost always right: an icon should match the text
        it sits with. Give an icon its own color only when it is carrying status, and never rely on that color as the
        only signal.
      </p>

      <h2 className="dc-h2" id="implementation">Implementation</h2>
      <CodeBlock
        language="html"
        filename="Consumer-supplied icons (Material Symbols names)"
        code={`<envision-button variant="primary" label="New design" leading-icon="add"></envision-button>\n<envision-icon-button icon="tune" accessible-name="Adjust settings"></envision-icon-button>`}
      />
      <Callout type="Important" title="Load the font if you pass icon names">
        Consumer icons need Material Symbols loaded by the host application. Without it the ligature renders as its
        literal name. Component-owned glyphs are unaffected because they are inline SVG.
      </Callout>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Give every icon-only control an accessible name describing the action, not the picture.' },
          { kind: 'dont', text: 'Name an icon-only control after its glyph. “Tune” tells someone nothing about what will happen.' },
          { kind: 'do', text: 'Hide an icon from assistive technology when adjacent text already says the same thing.' },
          { kind: 'dont', text: 'Assume an icon alone is understood. Outside a handful of universal glyphs, it is a guess.' },
        ]}
      />
    </DocArticle>
  );
}

/* --------------------------------------------------------------------- motion */

export function Motion() {
  const durations = system.tokens.filter((t) => t.name.startsWith('--envision-t1-duration-'));
  const motionRoles = system.tokens.filter((t) => t.name.startsWith('--envision-t2-motion-'));
  return (
    <DocArticle
      trail={trail('Motion')}
      title="Motion"
      lead="Motion should clarify change, preserve context, and reinforce interaction without becoming a distraction or a requirement for understanding the interface."
      toc={[
        { id: 'purpose', label: 'Purpose of motion' },
        { id: 'status', label: 'Current system status' },
        { id: 'durations', label: 'Durations' },
        { id: 'easing', label: 'Easing' },
        { id: 'transitions', label: 'State transitions' },
        { id: 'entering', label: 'Entering and exiting' },
        { id: 'loading', label: 'Loading' },
        { id: 'camera', label: 'Camera motion' },
        { id: 'decorative', label: 'Avoiding decorative motion' },
        { id: 'reduced', label: 'Reduced motion' },
        { id: 'future', label: 'What is not yet specified' },
      ]}
      related={[
        { title: 'Accessibility', to: '/accessibility', note: 'Reduced motion and vestibular safety.' },
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'Where motion roles live.' },
        { title: 'Governance', to: '/governance', note: 'What standardizing motion would require.' },
      ]}
      {...seq('/foundations/motion')}
    >
      <h2 className="dc-h2" id="purpose">Purpose of motion</h2>
      <p>
        Motion in Envision has one job: make a change comprehensible. When something appears, moves or replaces
        something else, a short transition tells the eye what happened and where the thing came from.
      </p>
      <p>
        Anything beyond that is cost. Motion delays interaction, and in a product where someone is comparing options
        rapidly, a delay repeated on every selection becomes friction.
      </p>

      <h2 className="dc-h2" id="status">Current system status</h2>
      <Callout type="Important" title="Envision has durations, but not a complete motion system">
        The token build defines {durations.length} duration primitives and {motionRoles.length} semantic motion roles.
        It defines <strong>no easing tokens</strong>, no distance or displacement scale, and no named entrance or exit
        patterns. Components currently hardcode their own easing curves. This page documents what exists and marks
        what does not, rather than presenting a motion system the implementation does not have.
      </Callout>

      <h2 className="dc-h2" id="durations">Durations</h2>
      <p>
        Durations are the one part of motion that is fully tokenized. Four semantic roles sit over five primitives, and
        the roles are what components consume.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-motion-')} />
      <ScrollTable head={['Role', 'Duration', 'Used for']}>
        {[
          ['micro', '150ms', 'Hover and press feedback on controls. Fast enough to feel immediate.'],
          ['dismiss', '180ms', 'Something going away. Slightly quicker than arrival: nobody waits to watch a dismissal.'],
          ['panel', '260ms', 'A surface arriving, such as a tray or sheet. Long enough to show direction.'],
          ['loading', '340ms', 'The spinner cycle. A rhythm rather than a transition.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The pattern worth noticing: dismissal is faster than arrival. Arrival needs to explain where something came
        from; departure only needs to get out of the way.
      </p>

      <h2 className="dc-h2" id="easing">Easing</h2>
      <p>
        There are no easing tokens. Components declare curves inline. Button, for example, uses{' '}
        <code>cubic-bezier(0.2, 0.8, 0.2, 1)</code>, a fast-out curve, written directly in its stylesheet.
      </p>
      <CodeBlock
        language="css"
        filename="packages/components/src/button/Button.ts (excerpt)"
        code={`transition: background-color var(--envision-t2-motion-micro-duration)\n    cubic-bezier(0.2, 0.8, 0.2, 1),\n  box-shadow var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);`}
      />
      <p>
        The duration is a token and the curve is not, which is an inconsistency rather than a design decision. It is
        recorded as a system finding rather than fixed here, because changing token architecture during a documentation
        task is out of scope.
      </p>

      <h2 className="dc-h2" id="transitions">State transitions</h2>
      <p>
        Hover and press use the micro duration and animate color only. Nothing moves, resizes or shifts position on
        hover, because in a grid of swatches even a small movement makes the whole grid feel unstable.
      </p>
      <LivePreview caption="Hover these. Only color changes, over 150ms.">
        <envision-button variant="primary" label="Primary" />
        <envision-button variant="outline" label="Outline" />
        <envision-button variant="ghost" label="Ghost" />
      </LivePreview>

      <h2 className="dc-h2" id="entering">Entering and exiting</h2>
      <p>
        A surface arriving should come from where it will live: a sheet rises from the edge it is anchored to, so its
        origin is legible. Fading alone tells the eye that something appeared but not where from.
      </p>

      <h2 className="dc-h2" id="loading">Loading</h2>
      <p>
        The spinner uses the loading duration for its rotation. Loading motion should be steady and unremarkable; a
        loading indicator that draws attention makes waiting feel longer.
      </p>
      <LivePreview caption="A real Button in its loading state.">
        <envision-button variant="primary" label="Saving…" loading />
      </LivePreview>

      <h2 className="dc-h2" id="camera">Camera motion</h2>
      <p>
        The Design Center moves a camera, not an element, and the rules above still hold: the move exists to keep the
        viewer oriented when the subject changes. Opening the hardware tray reframes the pulls, opening the backsplash
        reframes the wall. Without the move, the model would appear to teleport and you would have to re-find your place.
      </p>
      <p>
        A camera move is judged differently from a UI transition, though. A panel that snaps into place reads as
        responsive; a camera that stops dead reads as a collision, because nothing physical arrives at speed and halts.
        So the trip is quick and the arrival is not.
      </p>
      <h3 className="dc-h3">The trip is fast, the landing is slow</h3>
      <p>
        The move runs on one curve, and its tail is stretched rather than the whole thing being slowed. Three quarters
        of the distance is covered on the original timing, and the last quarter is given three times as long with a
        further ease-out on top, so the camera keeps decelerating the whole way in instead of levelling off and stopping.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead>
            <tr>{['Progress', 'Reached at', 'Note'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)', fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--envision-t2-color-content-secondary-default)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[
              ['25% of the distance', '0.32s', 'Full speed, unchanged'],
              ['50%', '0.46s', 'Full speed, unchanged'],
              ['75%', '0.61s', 'Handover to the landing'],
              ['100%', '1.76s', 'The last quarter takes 1.15s on its own'],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) => (
                  <td key={i} style={{ padding: 'var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)', fontVariantNumeric: i === 1 ? 'tabular-nums' : undefined }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The stretch is applied to <strong>time</strong>, not to the position curve. Both phases ride the same curve and
        meet at the same point, so there is no seam where the motion changes speed or direction. Slowing the curve as a
        whole was the obvious alternative and it was wrong: it makes every trip feel sluggish to buy a softer stop.
      </p>
      <CodeBlock
        language="ts"
        filename="src/three/KitchenScene.tsx (excerpt)"
        code={`const BASE_DURATION = 1.0\nconst SPLIT = 0.62        // hand over with a quarter of the distance left\nconst TAIL_STRETCH = 3.0  // and give that quarter three times as long\n\nlet u\nif (t <= BASE_DURATION * SPLIT) {\n  u = t / BASE_DURATION                       // unchanged timing\n} else {\n  const r = (t - BASE_DURATION * SPLIT) / (tailBase * TAIL_STRETCH)\n  u = SPLIT + (1 - SPLIT) * (1 - (1 - r) ** 3) // keeps slowing all the way in\n}`}
      />
      <h3 className="dc-h3">The camera stays in the room</h3>
      <p>
        Zoom-out is capped at the room's own shell. Past it the walls show their outside faces and the floor shows its
        cut edge, and the room stops reading as a room. The cap is computed from the model rather than typed in: from
        the orbit target, along the current view direction, to the point where it would leave the room's bounds. Because
        it follows the live direction, you can pull back further along the room's length than across its width, which is
        what the space actually allows.
      </p>

      <h2 className="dc-h2" id="decorative">Avoiding decorative motion</h2>
      <p>
        No entrance animations on page load, no staggered list reveals, no parallax. Each of those delays access to
        content in exchange for an impression, and they age badly in a tool people use daily.
      </p>
      <p>
        Motion must never be the only way something is communicated. If a change is announced solely by an animation,
        anyone with reduced motion enabled receives nothing.
      </p>

      <h2 className="dc-h2" id="reduced">Reduced motion</h2>
      <p>
        <code>prefers-reduced-motion</code> is honored in components and in this documentation site. Transitions are
        removed rather than shortened; the spinner slows to a rate that still communicates activity without spinning
        rapidly.
      </p>
      <CodeBlock
        language="css"
        filename="packages/components/src/button/Button.ts (excerpt)"
        code={`@media (prefers-reduced-motion: reduce) {\n  .btn { transition: none; }\n  .spinner { animation-duration: 1600ms; }\n}`}
      />
      <p>
        This is not a preference to treat as cosmetic. Motion can cause genuine physical discomfort, and the setting is
        a person telling you that directly.
      </p>

      <h2 className="dc-h2" id="future">What is not yet specified</h2>
      <p>Recorded honestly, because a reader deciding how to animate something needs to know what the system will not tell them.</p>
      <ul>
        <li><strong>Easing tokens.</strong> None exist. Curves are hardcoded per component.</li>
        <li><strong>Displacement.</strong> No tokens for how far something travels.</li>
        <li><strong>Named entrance and exit patterns.</strong> Not defined; components decide individually.</li>
        <li><strong>Choreography.</strong> No guidance on sequencing multiple simultaneous transitions.</li>
      </ul>
      <p>
        Standardizing these would be a foundation change requiring governance review, not something to settle by adding
        tokens quietly.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------------- imagery */

export function Imagery() {
  return (
    <DocArticle
      trail={trail('Imagery')}
      title="Imagery"
      lead="Imagery connects Envision's interface to the physical materials, spaces, fixtures, and design decisions users are exploring."
      toc={[
        { id: 'role', label: 'Imagery’s role in Envision' },
        { id: 'taxonomy', label: 'The five kinds' },
        { id: 'architectural', label: 'Architectural imagery' },
        { id: 'material', label: 'Material imagery' },
        { id: 'fixture', label: 'Fixture imagery' },
        { id: 'visualizer', label: 'Visualizer imagery' },
        { id: 'swatches', label: 'Swatches and thumbnails' },
        { id: 'editorial', label: 'Editorial imagery' },
        { id: 'handling', label: 'Cropping, ratio and resolution' },
        { id: 'responsive', label: 'Responsive behavior' },
        { id: 'text', label: 'Text over imagery' },
        { id: 'accessibility', label: 'Accessibility' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Color', to: '/foundations/color', note: 'Why interface color stays quiet.' },
        { title: 'MaterialSwatch', to: '/components/materialswatch', note: 'Where material imagery is rendered.' },
        { title: 'Selection', to: '/patterns/selection', note: 'The flow imagery serves.' },
      ]}
      {...seq('/foundations/imagery')}
    >
      <h2 className="dc-h2" id="role">Imagery’s role in Envision</h2>
      <p>
        In most products imagery is supporting material. In Envision it is the product. Someone is deciding whether they
        want matte walnut in their kitchen, and the image is the only evidence they have.
      </p>
      <p>
        That raises the stakes on things usually treated as production details. If a walnut sample is photographed
        warmer than it is, that is not a visual inconsistency, it is a person choosing something they did not intend and
        finding out at installation.
      </p>
      <Callout type="Important" title="Imagery is data, not decoration">
        The system does not own material imagery and must never restyle it. No token controls a material color, and no
        filter, overlay or color adjustment should ever be applied to a material image.
      </Callout>

      <h2 className="dc-h2" id="taxonomy">The five kinds</h2>
      <ScrollTable head={['Kind', 'Shows', 'Job', 'Owned by']}>
        {[
          ['Architectural', 'Rooms, elevations, spaces', 'Context: how a selection reads in a room', 'Product'],
          ['Material', 'Wood, stone, tile, finishes', 'Evidence for a decision', 'Product data'],
          ['Fixture', 'Faucets, hardware, lighting', 'Identifying a specific product', 'Product data'],
          ['Visualizer', 'The live 3D configuration', 'Consequence: this is your kitchen', 'The application'],
          ['Editorial', 'Documentation and marketing illustration', 'Explanation, never evidence', 'Design system'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The last row is the one to be careful about. Editorial imagery explains a concept; it is never evidence about a
        real product, and the two must not be mixed.
      </p>

      <h2 className="dc-h2" id="architectural">Architectural imagery</h2>
      <p>
        Rooms and elevations give a selection context. Shoot straight on rather than at a dramatic angle: the person is
        assessing proportion and relationship, and perspective distortion makes cabinet runs read as the wrong size.
      </p>
      <p>
        Keep lighting neutral and consistent across a set. A warmly lit room makes every finish in it look warmer, which
        contaminates the comparison the image exists to support.
      </p>

      <h2 className="dc-h2" id="material">Material imagery</h2>
      <p>Four properties matter, in this order.</p>
      <ul>
        <li><strong>Color accuracy</strong> above everything. This is the property a decision is made on.</li>
        <li><strong>Texture fidelity.</strong> Grain and finish must be readable at the size actually displayed, not just at full resolution.</li>
        <li><strong>Consistent scale.</strong> Grain must be photographed at comparable scale across a set, or one option looks coarser purely because it was shot closer.</li>
        <li><strong>Consistent lighting.</strong> A matte and a satin finish differ in how they handle light; that difference must come from the material, not the lighting setup.</li>
      </ul>

      <h2 className="dc-h2" id="fixture">Fixture and product imagery</h2>
      <p>
        Fixtures are identified rather than judged for texture, so they are shot on a plain neutral background, isolated,
        at consistent scale within a category. A faucet that appears larger than its neighbor because it was framed
        tighter implies a size difference that does not exist.
      </p>

      <h2 className="dc-h2" id="visualizer">Visualizer imagery</h2>
      <p>
        The 3D visualization is generated, not photographed, and it is the one place imagery updates live as selections
        change. Its job is consequence rather than evidence: the material swatch shows what walnut looks like, the
        visualizer shows what walnut looks like in this room.
      </p>
      <p>
        Both must agree. A swatch that does not match its rendered result destroys trust in both.
      </p>

      <h2 className="dc-h2" id="swatches">Swatches and thumbnails</h2>
      <p>
        A swatch is a crop of material imagery at a size where the material is still judgeable. This constraint drives
        real layout decisions: swatches wrap rather than shrink, because below a certain size the image stops doing its
        job.
      </p>
      <LivePreview caption="Real MaterialSwatch components. Selection is a ring and a check, never a color change over the material.">
        <FinishGroup />
      </LivePreview>
      <p>
        The selected treatment must not obscure the material. A tint or a heavy overlay would hide exactly the thing
        being chosen, which is why selection sits at the edge as a ring plus a check.
      </p>

      <h2 className="dc-h2" id="editorial">Editorial documentation imagery</h2>
      <p>
        The material-object compositions used in Envision Design are editorial. They communicate that Envision
        belongs to a material-selection product, and they are appropriate on section heroes and landing pages.
      </p>
      <Callout type="Note" title="What this site does instead of screenshots">
        This repository contains no captured screenshots of the running Envision application. Product examples here are
        assembled from the real production components in the product's own arrangement, and are labeled as such rather
        than presented as photographs of the product. When real annotated screenshots exist, the ProductExample module
        is built to take them without page changes.
      </Callout>

      <h2 className="dc-h2" id="handling">Cropping, ratio and resolution</h2>
      <p>
        Crop material images to the center of a representative area, avoiding edges, knots and features that read as
        defects at thumbnail size. Keep aspect ratios consistent within a set so a grid does not appear ragged.
      </p>
      <p>
        Serve at least twice the displayed dimension for material imagery. A soft grain reads as a lower-quality
        material, so under-resolved images actively misinform.
      </p>

      <h2 className="dc-h2" id="responsive">Responsive behavior</h2>
      <p>
        Architectural imagery is re-cropped toward its subject as space narrows. Material imagery is never scaled below
        its judgeable size; the grid wraps instead. Visualizer imagery keeps its aspect ratio and yields space from the
        surrounding chrome.
      </p>

      <h2 className="dc-h2" id="text">Text over imagery</h2>
      <p>
        Avoid it on material imagery entirely: any treatment that makes text readable also changes how the material
        appears. Where text must sit over an architectural image, place it on a solid surface rather than relying on a
        gradient, because a gradient tuned to one photograph fails on the next.
      </p>

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Alt text should describe what the image is evidence <em>of</em>. For a material swatch that means material,
        finish and price, which is exactly what the visual comparison conveys, rather than “wood texture”.
      </p>
      <p>
        Purely decorative imagery takes an empty alt so it is skipped. Never let color or image alone carry a state:
        an unavailable material is marked as unavailable in text, not by graying the image.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Keep lighting and grain scale consistent across a material set, so differences the person sees are real differences.' },
          { kind: 'dont', text: 'Color-correct a material image to look better in the interface. You have changed the product they are buying.' },
          { kind: 'do', text: 'Let swatch grids wrap so every sample stays large enough to judge.' },
          { kind: 'dont', text: 'Shrink swatches to fit a row. Below a certain size the image no longer supports the decision it exists for.' },
        ]}
      />
    </DocArticle>
  );
}
