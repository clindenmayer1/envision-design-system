import {
  Callout, CodeBlock, DoDont, LivePreview, TokenTable, } from '../modules';
import { Pipeline } from '../modules/diagrams';
import { DocArticle } from '../templates';
import { DesignCenterRail, ProductExample } from '../modules/product';
import { system } from '../data/generated';

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'why', label: 'Why color exists here' },
  { id: 'architecture', label: 'Color architecture' },
  { id: 'palette', label: 'Palette' },
  { id: 'roles', label: 'Semantic roles' },
  { id: 'using', label: 'Using color' },
  { id: 'states', label: 'Interaction states' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'dodont', label: 'Do and don’t' },
  { id: 'implementation', label: 'Implementation' },
] as const;

/** Benchmark foundation article (Part XXIV / Foundation depth target). */
export function Color() {
  const ramps = ['green', 'neutral', 'brown'] as const;

  return (
    <DocArticle
      trail={[
              { label: 'Envision Design System', to: '/' },
              { label: 'Foundations', to: '/foundations' },
              { label: 'Color' },
            ]}
      title="Color"
      lead="Envision uses color to tell someone what a thing is and what will happen if they touch it. Which specific green that turns out to be is a detail the system owns, and product code should never need to know it."
      related={[
              { title: 'Token architecture', to: '/tokens/architecture', note: 'Why roles sit between palette and component.' },
              { title: 'Token reference', to: '/tokens/reference', note: 'Every color token, searchable.' },
              { title: 'Foundations', to: '/foundations', note: 'The other shared decisions.' },
            ]}
      toc={TOC as unknown as Array<{ id: string; label: string }>}
      prev={{ title: 'Foundations', to: '/foundations' }}
      next={{ title: 'Typography', to: '/foundations/typography' }}
    >

      <h2 className="dc-h2" id="overview">Overview</h2>
      <p>
        Most color problems in a product are not aesthetic. They happen because two screens made the same decision
        independently and landed a shade apart, or because a color was chosen for how it looked next to something
        and then reused somewhere that context no longer applied.
      </p>
      <p>
        Envision avoids both by separating the palette from its meaning. The palette is a small set of uniform
        ramps. Meaning is assigned separately, as named roles such as “the background of a brand action” or “border
        around a resting control”. Product code references the role. The role decides the value.
      </p>
      <p>
        The practical consequence: when Envision adjusts its green, nothing in product code changes. When a
        designer needs a color that no role describes, that is a signal the system is missing a decision, not an
        invitation to reach into the palette.
      </p>

      <h2 className="dc-h2" id="why">Why color exists in the Envision system</h2>
      <p>
        Envision has a harder color problem than most products, because most of the color on screen is not the
        interface. It is the product: walnut, white oak, deep navy, honed stone. Those are photographic and
        data-driven values that the system does not own and must never restyle.
      </p>
      <p>
        That constraint drives the whole approach. Interface color has to stay quiet enough that a material
        sample reads accurately next to it, and distinct enough that a person can still tell what is interactive.
        It is why the palette is warm neutrals and a single deep green rather than a broad accent range, and why
        selection is expressed as a ring and a check rather than a color fill that would compete with the swatch
        underneath it.
      </p>
      <p>
        So color here does three jobs and no more: it says what is interactive, it says what state something is
        in, and it stays out of the way of the product being sold.
      </p>

      <h2 className="dc-h2" id="architecture">Color architecture</h2>
      <p>
        Color moves through three stages before it reaches a screen. Each stage answers a different question, and
        keeping them apart is what lets the system change one without disturbing the others.
      </p>
      <Pipeline
        alt={
          'Color architecture has three stages. First, the raw palette: uniform ramps such as green 50 through ' +
          '900, which carry no meaning. Second, semantic roles, which assign a job to a palette value, such as ' +
          'brand background or default border. Third, component use, where a component references the role. ' +
          'Product code consumes the third stage only.'
        }
        caption="Product code consumes the right-hand stage. Reaching further left couples a screen to a value instead of a decision."
        steps={[
          { label: 'Raw palette', note: 'Uniform ramps. No meaning attached.', tone: 'neutral' },
          { label: 'Semantic role', note: 'A job: brand background, default border.', tone: 'abstract' },
          { label: 'Component use', note: 'What a component actually references.', tone: 'active' },
        ]}
      />

      <h2 className="dc-h2" id="palette">Palette</h2>
      <p>
        Every family is a uniform ramp from 50 to 900 with the base at 500. Uniformity is the point: a designer can
        predict what 600 will look like without checking, and a contrast relationship that holds in one family
        holds in the others.
      </p>
      {ramps.map((ramp) => (
        <div key={ramp} style={{ margin: '20px 0' }}>
          <p style={{ margin: '0 0 var(--dc-space-4)' }}><envision-badge tone="brand" label={ramp} /></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--dc-space-2)' }}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => {
              const name = `--envision-t1-color-${ramp}-${step}`;
              const found = system.tokens.find((t) => t.name === name);
              if (!found) return null;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(name)}
                  title={`Copy ${name}`}
                  style={{
                    width: 76, padding: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left',
                    background: 'none', border: 0,
                  }}
                >
                  <span style={{
                    display: 'block', height: 52, borderRadius: 6, background: `var(${name})`,
                    border: '1px solid var(--envision-t2-color-border-default-default)',
                  }} />
                  <span className="dc-small" style={{ display: 'block', fontSize: 'var(--envision-t1-font-size-11)', marginBlockStart: 4 }}>
                    {step}<br />{found.resolved}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="dc-small">Select any swatch to copy its token name.</p>

      <h2 className="dc-h2" id="roles">Semantic roles</h2>
      <p>
        Roles are the layer product work should consume. Each one names a job rather than an appearance, which is
        why they survive a rebrand and a raw hex value does not.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-content-')} />
      <p>Surface and border roles follow the same shape:</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-background-surface') || n.startsWith('--envision-t2-color-border-')} />

      <h2 className="dc-h2" id="using">Using color in the product</h2>
      <p>
        The Design Center right rail is where every rule above has to hold at once. Product color and interface
        color sit inches apart, and the interface has to stay legible without shouting over the materials.
      </p>
      <ProductExample
        title="Design Center · right rail"
        surface={<DesignCenterRail />}
        annotations={[
          'The surface is a warm neutral, not white, so material samples are judged against a consistent ground.',
          'Green appears exactly once, on the commit action, so the primary path is unambiguous.',
          'Selection uses a ring and a check, never a color fill, because the swatch itself is colored.',
          'Cost deltas are content color on a neutral surface, never red or green for cheaper or dearer.',
        ]}
        caption="Real production components in the product's own arrangement."
      />
      <p>
        Notice what is absent. There is no second accent, no colored category chips, no tinted panel per section.
        Each of those would be defensible in isolation and would collectively make the materials harder to compare,
        which is the one thing this product cannot afford.
      </p>

      <h2 className="dc-h2" id="states">Interaction states</h2>
      <p>
        Where a role changes on interaction, the variants are part of the role rather than separate colors. A
        component references <code>-default</code>, <code>-hover</code> and <code>-pressed</code> of the same role,
        so the relationship between the three is decided once.
      </p>
      <LivePreview caption="One component, three states, three variants of a single semantic role.">
        <envision-button variant="primary" label="Default" />
        <envision-button variant="outline" label="Secondary" />
        <envision-button variant="ghost" label="Low emphasis" />
        <envision-button variant="primary" label="Disabled" disabled />
      </LivePreview>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-background-brand-')} />

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Two rules constrain every color decision in Envision, and both are the system's responsibility rather
        than something each product team re-checks.
      </p>
      <p>
        <strong>Contrast.</strong> Content roles are paired with the surfaces they are intended to sit on. Using a
        content role on a surface it was not designed for is the most common way contrast quietly fails, which is
        why roles are named for their pairing rather than for their darkness.
      </p>
      <p>
        <strong>Color is never the only signal.</strong> Selection in Envision is a ring plus a check, not a
        color change. An error is an icon and a message, not red text alone. This is a design rule before it is an
        accessibility rule: it keeps meaning legible in a screenshot, in grayscale, and to someone who does not
        perceive the hue difference.
      </p>
      <Callout type="Accessibility" title="What automated checks will not catch">
        A contrast checker will pass a selected swatch that is distinguished only by a green border. It measures
        the ratio, not whether the meaning survives without color. That judgment stays with the reviewer.
      </Callout>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          {
            kind: 'do',
            text: 'Reference the semantic role that describes the job, so a change to Envision’s brand color reaches this screen automatically.',
            example: <envision-button variant="primary" label="Apply design" />,
          },
          {
            kind: 'dont',
            text: 'Reach past the role to a palette step because it happened to match a mock-up. The screen then keeps the old green after the system moves on.',
            example: (
              <button style={{
                background: '#29594f', color: 'var(--envision-t1-color-neutral-0)', border: 0, padding: '16px 20px',
                borderRadius: 10, font: 'inherit', fontWeight: 600,
              }}>Apply design</button>
            ),
          },
          {
            kind: 'do',
            text: 'Pair a content role with the surface role it was designed against, so contrast is decided by the system rather than by the screen.',
          },
          {
            kind: 'dont',
            text: 'Move a content role onto an unrelated surface because it looked acceptable in one layout. Contrast failures introduced this way are invisible until someone tests the page.',
          },
        ]}
      />

      <h2 className="dc-h2" id="implementation">Implementation</h2>
      <p>
        Color tokens are plain CSS custom properties. Import the token stylesheet once, then reference roles
        anywhere, including inside a shadow root, since custom properties inherit through it.
      </p>
      <CodeBlock
        language="css"
        filename="Consuming a color role"
        code={`/* once, at the application root */\n@import '@envision/tokens/css';\n\n.promo-banner {\n  /* the role, not the value: this follows a rebrand automatically */\n  background: var(--envision-t2-color-background-brand-subtle-default);\n  color: var(--envision-t2-color-content-primary-default);\n  border: 1px solid var(--envision-t2-color-border-default-default);\n}`}
      />
    </DocArticle>  );
}
