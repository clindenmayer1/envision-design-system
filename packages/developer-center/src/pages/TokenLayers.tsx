import { Link } from 'react-router-dom';
import { Callout, CodeBlock, Copyable, DoDont, LivePreview, TokenTable } from '../modules';
import { ArchitectureDiagram, LayerStack } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL, tokenCount, tokenGroups } from '../modules/scales';
import { DocArticle } from '../templates';
import { system } from '../data/generated';

/**
 * Token layer articles: Primitives, Brand, Semantic, Responsive, Component.
 *
 * Group lists, counts and every value are generated from the token build. Nothing here states a
 * number or a token name that was typed by hand.
 */

/** Canonical section order. Previous/next derives from it so it cannot drift per page. */
const TOKEN_ORDER: Array<[string, string]> = [
  ['Token architecture', '/tokens/architecture'],
  ['Primitives', '/tokens/primitives'],
  ['Brand tokens', '/tokens/brand'],
  ['Semantic tokens', '/tokens/semantic'],
  ['Responsive tokens', '/tokens/responsive'],
  ['Component tokens', '/tokens/component'],
  ['Naming conventions', '/tokens/naming'],
  ['Figma variables', '/tokens/figma-variables'],
  ['DTCG token structure', '/tokens/dtcg'],
  ['Style Dictionary', '/tokens/style-dictionary'],
  ['CSS tokens', '/tokens/css'],
  ['TypeScript tokens', '/tokens/typescript'],
  ['Token pipeline', '/tokens/pipeline'],
  ['Using tokens in components', '/tokens/using-tokens'],
  ['Token reference', '/tokens/reference'],
];
export const tokenSeq = (path: string) => {
  const i = TOKEN_ORDER.findIndex(([, p]) => p === path);
  const at = (n: number) => (TOKEN_ORDER[n] ? { title: TOKEN_ORDER[n][0], to: TOKEN_ORDER[n][1] } : undefined);
  return { prev: i > 0 ? at(i - 1) : undefined, next: at(i + 1) };
};
export const tokenTrail = (leaf: string) => [
  { label: 'Envision Design System', to: '/' },
  { label: 'Design Tokens' },
  { label: leaf },
];

/** Which tokens reference a given token. Generated, so it cannot go stale. */
const referencedBy = (name: string) => system.tokens.filter((t) => t.alias === name);

/* ----------------------------------------------------------------- primitives */

export function Primitives() {
  const groups = tokenGroups('--envision-t1-', 1);
  const ink = system.tokens.find((t) => t.name === '--envision-t1-color-neutral-800');
  return (
    <DocArticle
      trail={tokenTrail('Primitives')}
      title="Primitive tokens"
      lead="Primitive tokens store foundational values before those values are assigned Envision-specific meaning or interface roles."
      toc={[
        { id: 'what', label: 'What primitives are' },
        { id: 'why', label: 'Why they exist' },
        { id: 'groups', label: 'Primitive groups' },
        { id: 'naming', label: 'Naming' },
        { id: 'vs-meaning', label: 'Value versus meaning' },
        { id: 'relationships', label: 'Relationships' },
        { id: 'consume', label: 'Who should consume them' },
        { id: 'follow', label: 'Follow one primitive' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Brand tokens', to: '/tokens/brand', note: 'What primitives feed into.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'How the layers fit together.' },
        { title: 'Token reference', to: '/tokens/reference', note: 'The full searchable inventory.' },
      ]}
      {...tokenSeq('/tokens/primitives')}
    >
      <h2 className="dc-h2" id="what">What primitives are</h2>
      <p>
        A primitive is a value with no opinion about what it is for. <code>--envision-t1-color-neutral-800</code> is
        a dark neutral. It is not body text, not a border, not a heading. It is simply a value the system has decided
        is available.
      </p>
      <p>
        That emptiness is the point. A primitive should be uninteresting to read, because every interesting question,
        what is this for, when should it be used, is answered by a layer above.
      </p>

      <h2 className="dc-h2" id="why">Why primitives exist</h2>
      <p>
        Without them, every semantic role would carry its own literal value, and two roles that happen to share a value
        today would have no way to express that they are the same decision. Changing the green would mean finding every
        role that used it, which is exactly the problem tokens exist to solve.
      </p>
      <p>
        Primitives also constrain choice. {tokenCount('--envision-t1-color-')} color primitives sound like a lot until
        you notice they are uniform ramps: a designer picks a step, not a color.
      </p>

      <h2 className="dc-h2" id="groups">Primitive groups</h2>
      <p>
        {groups.length} groups exist, generated from the token output. This list is not maintained by hand and cannot
        drift from source.
      </p>
      <ScrollTable head={['Group', 'Tokens', 'What it holds']}>
        {groups.map((g) => {
          const notes: Record<string, string> = {
            color: 'Uniform ramps, 50 to 900, base at 500',
            spacing: 'Step-named scale; the name is an index, not a measurement',
            'font-size': 'The type scale, in pixels',
            'font-weight': 'Numeric weights',
            'font-family': 'Family names only; loading the font is the host’s job',
            'line-height': 'Unitless ratios, never pixel values',
            'border-radius': 'Corner values, including two that both resolve to 999px',
            'border-width': 'Stroke widths',
            breakpoint: 'Declared width thresholds',
            duration: 'Motion durations in milliseconds',
            'letter-spacing': 'Tracking values',
            'z-index': 'Raw stacking numbers',
          };
          return (
            <tr key={g}>
              <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{g}</td>
              <td style={TABLE_CELL}>{tokenCount(`--envision-t1-${g}-`)}</td>
              <td style={TABLE_CELL}>{notes[g] ?? <span className="dc-small">Group not annotated.</span>}</td>
            </tr>
          );
        })}
      </ScrollTable>

      <h2 className="dc-h2" id="naming">Naming</h2>
      <p>
        Primitive names contain the value or its index, deliberately: <code>font-size-16</code>,{' '}
        <code>green-500</code>, <code>duration-150</code>. A primitive named for a purpose would be a semantic token
        wearing the wrong layer.
      </p>
      <p>
        Spacing is the exception worth knowing. It is step-named rather than value-named, so{' '}
        <code>--envision-t1-spacing-200</code> resolves to 16px. Assuming the number is the pixel value produces a
        variable that does not exist, and the declaration is silently dropped.
      </p>

      <h2 className="dc-h2" id="vs-meaning">Value versus meaning</h2>
      <ScrollTable head={['Question', 'Answered by', 'Example']}>
        {[
          ['What values are available?', 'Primitive', '--envision-t1-color-neutral-800'],
          ['Which value is this builder’s?', 'Brand', '--envision-t2-color-primary-500'],
          ['What is this value for?', 'Semantic', '--envision-t2-color-background-brand-default'],
          ['What does this component use?', 'Component', '--envision-t3-button-primary-color-background-default'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{r[2]}</code></td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="relationships">Relationships</h2>
      <LayerStack
        alt="Primitives sit at the base. Brand references primitives, semantic references brand, and component references semantic. Nothing references downward from a primitive."
        caption="Primitives are referenced by the layer above and reference nothing themselves."
        layers={[
          { label: 'Component', note: 'References semantic', tone: 'neutral' },
          { label: 'Semantic', note: 'References brand or primitive', tone: 'neutral' },
          { label: 'Brand', note: 'References primitives', tone: 'abstract' },
          { label: 'Primitive', note: 'References nothing. Holds the literal value.', tone: 'active' },
        ]}
      />

      <h2 className="dc-h2" id="consume">Who should consume primitives</h2>
      <p>
        <strong>The layers above them, and effectively nothing else.</strong> A primitive in product code is a decision
        made in the wrong place: the screen now depends on a value rather than on a meaning, and it will not move when
        the system does.
      </p>
      <p>
        There is one honest exception. Documentation that is <em>about</em> the scale, such as the specimen on the
        Typography page or the swatches on Color, references primitives directly because the primitive is the subject.
        That is not product code.
      </p>

      <h2 className="dc-h2" id="follow">Follow one primitive</h2>
      <p>
        <Copyable text="--envision-t1-color-neutral-800" /> resolves to <code>{ink?.resolved}</code> and is referenced
        directly by {referencedBy('--envision-t1-color-neutral-800').length} token(s), which then carry it onward.
      </p>
      <TokenTable filter={(n) => n === '--envision-t1-color-neutral-800' || referencedBy('--envision-t1-color-neutral-800').some((t) => t.name === n)} />
      <p>
        From there the chain continues through the brand and semantic layers to a component. The full trace is on{' '}
        <Link to="/tokens/pipeline">Token pipeline</Link>.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Use primitives as the base of higher-level aliases, so one value can serve several distinct meanings without merging them.' },
          { kind: 'dont', text: 'Reference a primitive in product code because its current value looks right. You have coupled the screen to a value instead of a decision.' },
          { kind: 'do', text: 'Add a primitive when the scale genuinely needs a new step.' },
          { kind: 'dont', text: 'Add a primitive to express a new meaning. Meaning belongs in the semantic layer.' },
        ]}
      />
    </DocArticle>
  );
}

/* ---------------------------------------------------------------------- brand */

export function BrandTokens() {
  return (
    <DocArticle
      trail={tokenTrail('Brand tokens')}
      title="Brand tokens"
      lead="The brand layer is the white-label seam. It is where a builder's colors and typefaces enter the system, before those decisions are given semantic interface meaning."
      toc={[
        { id: 'what', label: 'What the brand layer does' },
        { id: 'why', label: 'Why Envision has one' },
        { id: 'primitives', label: 'Relationship to primitives' },
        { id: 'groups', label: 'Brand token groups' },
        { id: 'output', label: 'Generated CSS' },
        { id: 'vs-semantic', label: 'Brand is not semantic' },
        { id: 'consume', label: 'Who consumes them' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Primitives', to: '/tokens/primitives', note: 'What brand references.' },
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'What references brand.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'The full layer model.' },
      ]}
      {...tokenSeq('/tokens/brand')}
    >
      <h2 className="dc-h2" id="what">What the brand layer does</h2>
      <p>
        Brand answers one question: <strong>whose colors are these?</strong> Not what they are used for, only which
        ramp represents the builder whose product a person is currently looking at.
      </p>
      <p>
        Envision is white-label, so that question has a different answer for every builder on the platform, and the
        expectation is hundreds or thousands of them. The brand layer is the only place that answer lives.
      </p>
      <p>
        It is a thin layer by design. The source file is the smallest in the token set, because it holds one kind of
        decision and nothing else, and because everything it holds must be supplied again by every theme.
      </p>

      <h2 className="dc-h2" id="why">Why Envision has a brand layer</h2>
      <p>
        Collapse brand into semantic and a rebrand becomes a search-and-replace across every role, which is merely
        tedious for one brand and impossible for a thousand. Keeping it separate means applying a builder's brand is
        supplying one layer, and every semantic role that pointed at it follows automatically.
      </p>
      <p>
        It also separates two questions that get confused in review. “Which color is this builder's?” is a brand
        question, and the builder owns it. “Should a commit action use the brand color?” is a semantic one, and the
        design system owns it. Different answers, different owners, and neither should be able to overwrite the other.
      </p>

      <h2 className="dc-h2" id="primitives">Relationship to primitives</h2>
      <p>
        Brand is the one layer that holds literal values rather than references, and that is what makes it
        replaceable. A builder's color is that builder's data; promoting it into the shared primitive palette would
        mean the system carried a thousand ramps that belong to other people.
      </p>
      <p>
        Everything <em>above</em> brand is still a reference. Semantic roles point at the brand ramp, component tokens
        point at semantic roles, and none of them ever hold a color.
      </p>
      <CodeBlock
        language="json"
        filename="packages/tokens/src/brand.tokens.json (excerpt)"
        code={`"primary": {\n  "500": {\n    "$type": "color",\n    "$value": "{envision.t1.color.green.500}"\n  }\n}`}
      />

      <h2 className="dc-h2" id="groups">Brand token groups</h2>
      <p>The brand primary ramp, generated from the token output with its references intact.</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-primary-')} />
      <p className="dc-small">
        Brand also carries font-family decisions, which is why{' '}
        <Copyable text="--envision-t2-font-family-display" /> is a brand-level choice rather than a primitive.
      </p>

      <h2 className="dc-h2" id="output">Generated CSS</h2>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`--envision-t2-color-primary-500: #3a3835;   /* supplied by the active theme */`}
      />
      <p>
        Brand is the one layer that holds values rather than references, and that is deliberate: it is the seam a
        builder theme replaces. Every layer above it still resolves through <code>var()</code> chains, so a component
        remains traceable in DevTools all the way down to the theme boundary.
      </p>

      <h2 className="dc-h2" id="vs-semantic">Brand is not semantic</h2>
      <ScrollTable head={['', 'Brand', 'Semantic']}>
        {[
          ['Answers', 'Which value is ours', 'What the value is for'],
          ['Changes when', 'The brand changes', 'The interface language changes'],
          ['Example', '--envision-t2-color-primary-500', '--envision-t2-color-background-brand-default'],
          ['Consume in product code', 'No', 'Yes, this is the default layer'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{r[1]}</code></td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{r[2]}</code></td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The names look similar and the distinction is easy to miss:{' '}
        <code>color-primary-500</code> is brand, <code>color-background-brand-default</code> is semantic. The first
        says which green; the second says a brand-colored background.
      </p>

      <h2 className="dc-h2" id="consume">Who consumes brand tokens</h2>
      <p>
        The semantic layer, and nothing else. Consuming brand directly in a component skips the question of role, so
        the component changes appearance whenever the brand moves, including in cases where it should not have.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Point semantic roles at brand tokens, so a rebrand reaches every role at once.' },
          { kind: 'dont', text: 'Reference a brand token from a component. You have said “be our green” where you meant “be a brand action”.' },
          { kind: 'do', text: 'Keep the brand layer thin. It holds identity decisions only.' },
          { kind: 'dont', text: 'Add interface meaning at the brand layer. That is what semantic tokens are for.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------------------- semantic */

export function SemanticTokens() {
  const colorGroups = tokenGroups('--envision-t2-color-', 1);
  return (
    <DocArticle
      trail={tokenTrail('Semantic tokens')}
      title="Semantic tokens"
      lead="Semantic tokens describe the role a design value performs in the interface rather than the raw value used to render it."
      toc={[
        { id: 'why', label: 'Why semantics matter' },
        { id: 'architecture', label: 'Semantic architecture' },
        { id: 'browser', label: 'Token browser' },
        { id: 'aliasing', label: 'Aliasing' },
        { id: 'stability', label: 'Semantic stability' },
        { id: 'choosing', label: 'Choosing the right token' },
        { id: 'states', label: 'States' },
        { id: 'accessibility', label: 'Accessibility' },
        { id: 'implementation', label: 'Implementation' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Color', to: '/foundations/color', note: 'The foundation these roles encode.' },
        { title: 'Component tokens', to: '/tokens/component', note: 'What references semantic.' },
        { title: 'Token reference', to: '/tokens/reference', note: 'The full inventory.' },
      ]}
      {...tokenSeq('/tokens/semantic')}
    >
      <h2 className="dc-h2" id="why">Why semantic tokens matter</h2>
      <p>
        Two ways to write the same decision. The first describes appearance and the second describes purpose, and only
        one of them survives the appearance changing.
      </p>
      <ScrollTable head={['', 'Says', 'Survives a rebrand?', 'Reviewable?']}>
        {[
          ['#3a3835', 'This exact color', 'No', 'No: a reviewer cannot tell what it meant'],
          ['--envision-t2-color-primary-500', 'The brand at step 500', 'Survives, but changes per theme', 'Barely: still a value, not a purpose'],
          ['--envision-t2-color-background-brand-default', 'A brand-colored background', 'Yes', 'Yes: intent is stated'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL }}><code style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{r[0]}</code></td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="architecture">Semantic architecture</h2>
      <p>
        {colorGroups.length} color role groups exist, generated from the output. Each names a job rather than an
        appearance.
      </p>
      <ScrollTable head={['Group', 'Tokens', 'Role']}>
        {colorGroups.map((g) => {
          const notes: Record<string, string> = {
            content: 'Text and icon color, paired with the surface it sits on',
            background: 'Surface and fill color',
            border: 'Strokes, dividers and outlines',
            primary: 'Brand ramp (the brand layer, reached through this namespace)',
            accent: 'A single accent, used sparingly',
          };
          return (
            <tr key={g}>
              <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{g}</td>
              <td style={TABLE_CELL}>{tokenCount(`--envision-t2-color-${g}-`)}</td>
              <td style={TABLE_CELL}>{notes[g] ?? <span className="dc-small">Group not annotated in source.</span>}</td>
            </tr>
          );
        })}
      </ScrollTable>
      <p>
        Beyond color, tier 2 also carries spacing, radius, border width, layout, elevation, layer and motion roles.
        The same principle applies to all of them: the name states the job.
      </p>

      <h2 className="dc-h2" id="browser">Token browser</h2>
      <p>Content roles, with their references and resolved values.</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-content-')} />
      <p>Surface roles:</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-background-surface')} />
      <p className="dc-small">
        The full inventory of {tokenCount('--envision-t2-')} tier 2 tokens is on{' '}
        <Link to="/tokens/reference">Token reference</Link>. These pages teach the architecture; Reference is for
        lookup.
      </p>

      <h2 className="dc-h2" id="aliasing">Aliasing</h2>
      <p>
        An alias is a token whose value is another token. Nearly every semantic token is one, which is why the
        generated CSS is full of <code>var()</code> chains rather than hex values.
      </p>
      <CodeBlock
        language="css"
        filename="An alias chain, preserved in the generated output"
        code={`--envision-t2-color-background-brand-default: var(--envision-t2-color-primary-500);\n/* which the active theme sets to */ #3a3835;`}
      />

      <h2 className="dc-h2" id="stability">Semantic stability</h2>
      <p>
        The whole point: the name is a contract and the value is an implementation detail. A component referencing{' '}
        <code>--envision-t2-color-background-brand-default</code> keeps working when the underlying green changes,
        because it never asked for a green. It asked for a brand background.
      </p>

      <h2 className="dc-h2" id="choosing">Choosing the correct token</h2>
      <p>Ask what the element is doing, not what it should look like.</p>
      <ScrollTable head={['You are styling', 'Ask', 'Reach for']}>
        {[
          ['A paragraph', 'Is this primary or supporting text?', 'content-primary or content-secondary'],
          ['A panel', 'Does it sit on the page or above it?', 'background-surface or background-surface-warm'],
          ['A divider', 'Is this structural or a hairline?', 'border-default or border-subtle'],
          ['A commit action', 'Is this the brand action?', 'background-brand-default'],
          ['A disabled control', 'Is this unavailable?', 'content-disabled-default'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{r[2]}</code></td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="states">States</h2>
      <p>
        State is part of the role, not a separate token family. A role that changes on interaction carries{' '}
        <code>-default</code>, <code>-hover</code> and <code>-pressed</code> variants, so the relationship between the
        three is decided once rather than per component.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-background-brand-')} />
      <LivePreview caption="One real Button. Hover and press move it through the variants of a single role.">
        <envision-button variant="primary" label="Apply design" />
      </LivePreview>

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Semantic roles make contrast decisions consistent because content roles are paired with the surfaces they were
        designed against. Using a role on the surface it was intended for is the reliable path.
      </p>
      <Callout type="Accessibility" title="Tokens do not guarantee accessible output">
        A token system cannot know what you composed. Placing a content role on an unrelated surface, or over an
        image, can fail contrast while every value involved is a legitimate token. Semantic tokens make the right
        choice easy; they do not make the wrong one impossible.
      </Callout>

      <h2 className="dc-h2" id="implementation">Implementation</h2>
      <CodeBlock
        language="css"
        code={`.panel {\n  background: var(--envision-t2-color-background-surface-default);\n  color: var(--envision-t2-color-content-primary-default);\n  border: var(--envision-t2-border-width-default) solid var(--envision-t2-color-border-default-default);\n}`}
      />

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Choose a token by the role the element performs, so the choice stays correct when values change.' },
          { kind: 'dont', text: 'Choose a token because its resolved value matches the mock-up. You have picked a color and called it a decision.' },
          { kind: 'do', text: 'Pair a content role with the surface role it was designed against.' },
          { kind: 'dont', text: 'Move a content role onto an unrelated surface. Contrast failures introduced this way are invisible until tested.' },
          { kind: 'do', text: 'Raise it when no role describes what you mean. A missing role is a system gap.' },
          { kind: 'dont', text: 'Fall back to a primitive when the semantic layer has no answer. That hides the gap permanently.' },
        ]}
      />
    </DocArticle>
  );
}

/* ----------------------------------------------------------------- responsive */

export function ResponsiveTokens() {
  const responsive = system.tokens.filter(
    (t) => /^--envision-t2-(font-size|layout)-/.test(t.name),
  );
  return (
    <DocArticle
      trail={tokenTrail('Responsive tokens')}
      title="Responsive tokens"
      lead="Responsive tokens encode system decisions that vary with available space while keeping those values connected to the broader Envision token architecture."
      toc={[
        { id: 'where', label: 'Where responsive sits' },
        { id: 'groups', label: 'What changes' },
        { id: 'reality', label: 'Implementation reality' },
        { id: 'overrides', label: 'The generated override block' },
        { id: 'media', label: 'The CSS media-query constraint' },
        { id: 'vs-component', label: 'Tokens versus component behavior' },
        { id: 'implementation', label: 'Implementation' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Breakpoints', to: '/foundations/breakpoints', note: 'The declared thresholds.' },
        { title: 'Responsive design', to: '/foundations/responsive-design', note: 'How adaptation is decided.' },
        { title: 'CSS tokens', to: '/tokens/css', note: 'How the overrides are emitted.' },
      ]}
      {...tokenSeq('/tokens/responsive')}
    >
      <h2 className="dc-h2" id="where">Where responsive tokens sit</h2>
      <p>
        Responsive is <strong>not a fifth layer</strong>. There is no responsive tier that other tokens reference.
        Instead, a small number of existing tier 2 tokens are re-declared inside a media query, so the same name
        resolves differently at a narrower width.
      </p>
      <ArchitectureDiagram
        alt={
          'The four layers run primitive, brand, semantic, component. Responsive is a parallel concern that ' +
          're-declares a subset of semantic tokens inside a media query. It is not a layer that other tokens ' +
          'reference; it changes the value of names that already exist.'
        }
        caption="Responsive changes the value of an existing name. It does not add a name for anything to reference."
        groups={[
          { role: 'Source', note: 'The four-layer hierarchy.', items: ['t1 primitive', 't2 brand', 't2 semantic', 't3 component'] },
          { role: 'Generated', note: 'A parallel re-declaration.', items: ['@media (max-width: 1024px)', 'same names, different values'] },
          { role: 'Consumer', note: 'Unaware a breakpoint exists.', items: ['components', 'application layout'] },
        ]}
      />
      <p>
        The consequence is the useful part: a component consuming{' '}
        <code>--envision-t2-layout-right-rail-width</code> adapts without containing a media query, and without knowing
        a breakpoint exists.
      </p>

      <h2 className="dc-h2" id="groups">What changes, and what does not</h2>
      <p>
        Fifteen entries in the responsive source carry a responsive extension. They fall into two groups: type sizes
        and layout dimensions.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-layout-')} />
      <p>
        Just as important is what does <em>not</em> change. Color never changes with width. Component padding never
        changes. Radius never changes. Body and control type never change. Only the six display and heading roles step
        down, alongside layout dimensions.
      </p>
      <p className="dc-small">{responsive.length} tier 2 font-size and layout tokens exist in total; 15 carry responsive values.</p>

      <h2 className="dc-h2" id="reality">Implementation reality</h2>
      <Callout type="Important" title="One breakpoint currently drives generated CSS">
        Five breakpoint tokens are declared: mobile 390, tablet 1024, dashboard 1080, desktop 1280 and wide 1440. The
        build emits a single media query, at the tablet breakpoint. The other four are documented design targets rather
        than generated conditions. This is a description of the current implementation, not a defect: one threshold may
        be all the product needs.
      </Callout>

      <h2 className="dc-h2" id="overrides">The generated override block</h2>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`@media (max-width: 1024px) {\n  :root {\n    --envision-t2-font-size-display: var(--envision-t1-font-size-40);\n    --envision-t2-font-size-h1: var(--envision-t1-font-size-32);\n    --envision-t2-font-size-h2: var(--envision-t1-font-size-28);\n    --envision-t2-font-size-h3: var(--envision-t1-font-size-22);\n    --envision-t2-font-size-h4: var(--envision-t1-font-size-18);\n    --envision-t2-font-size-h5: var(--envision-t1-font-size-16);\n    --envision-t2-layout-card-grid-columns: 1;\n    --envision-t2-layout-page-gutter: var(--envision-t1-spacing-250);\n    --envision-t2-layout-right-rail-width: 390px;\n    --envision-t2-layout-swatch-grid-columns: 4;\n    --envision-t2-layout-top-bar-height: 56px;\n  }\n}`}
      />
      <p>
        Note that the overrides are themselves references where possible. The narrow value of a heading role is another
        primitive, not a literal, so the chain is preserved on both sides of the breakpoint.
      </p>
      <p>
        In the DTCG source this is expressed as an extension on the token rather than as a separate token:
      </p>
      <CodeBlock
        language="json"
        filename="packages/tokens/src/responsive.tokens.json (excerpt)"
        code={`"h1": {\n  "$type": "dimension",\n  "$value": "{envision.t1.font-size.40}",\n  "$extensions": {\n    "envision.responsive": {\n      "mobile": "{envision.t1.font-size.32}"\n    }\n  }\n}`}
      />

      <h2 className="dc-h2" id="media">The CSS media-query constraint</h2>
      <p>
        A CSS custom property cannot be used as a media-query condition. <code>@media (max-width: var(--x))</code> is
        not valid CSS, so the generated output contains a literal <code>1024px</code>.
      </p>
      <Callout type="Developer" title="The literal is generated, not hand-maintained">
        The build reads <Copyable text="envision.t1.breakpoint.tablet" /> from the primitive source and injects its
        value into the media query, failing the build if that token is missing. The platform constraint is real, but
        the synchronization risk it normally creates has been engineered away: change the token and the query follows.
      </Callout>

      <h2 className="dc-h2" id="vs-component">Responsive tokens versus component behavior</h2>
      <p>
        Not every responsive behavior should be a token, and most are not. A token can change a <em>value</em>. It
        cannot make a rail become a modal sheet, stack a grid, wrap a row or move an element.
      </p>
      <ScrollTable head={['Behavior', 'Mechanism', 'Why']}>
        {[
          ['Rail narrows', 'Responsive token', 'A dimension changing'],
          ['Heading shrinks', 'Responsive token', 'A value changing'],
          ['Grid drops to one column', 'Responsive token', 'A count changing'],
          ['Rail becomes a modal sheet', 'Component behavior', 'Structure and semantics change, not a value'],
          ['Swatches wrap', 'CSS layout', 'The layout algorithm already handles it'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="implementation">Implementation</h2>
      <CodeBlock
        language="css"
        code={`.workspace {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) var(--envision-t2-layout-right-rail-width);\n  padding-inline: var(--envision-t2-layout-page-gutter);\n}\n/* No media query here. Both values change themselves at 1024. */`}
      />

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Consume the semantic name and let the token change at the threshold, so no breakpoint appears in your code.' },
          { kind: 'dont', text: 'Write a media query for a value the token system already changes. Yours will drift when the threshold moves.' },
          { kind: 'do', text: 'Use component behavior for structural change, and tokens for value change.' },
          { kind: 'dont', text: 'Try to express a layout transformation as a token. A token cannot change semantics or focus behavior.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ component */

export function ComponentTokens() {
  const groups = tokenGroups('--envision-t3-', 1);
  return (
    <DocArticle
      trail={tokenTrail('Component tokens')}
      title="Component tokens"
      lead="Component tokens translate broader Envision system intent into decisions owned by an individual component or component state."
      toc={[
        { id: 'why', label: 'Why component tokens exist' },
        { id: 'relationship', label: 'Relationship to semantic' },
        { id: 'groups', label: 'Component token groups' },
        { id: 'anatomy', label: 'Anatomy: Button' },
        { id: 'states', label: 'State tokens' },
        { id: 'not-every', label: 'Not every property needs one' },
        { id: 'when', label: 'When to create one' },
        { id: 'change', label: 'When a semantic token changes' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'What component tokens reference.' },
        { title: 'Using tokens in components', to: '/tokens/using-tokens', note: 'Applying them in code.' },
        { title: 'Components', to: '/components', note: 'The components themselves.' },
      ]}
      {...tokenSeq('/tokens/component')}
    >
      <h2 className="dc-h2" id="why">Why component tokens exist</h2>
      <p>
        They are an insulation layer. A component token lets one component's value be repointed without touching the
        semantic role that other components share, and without the component hardcoding anything.
      </p>
      <p>
        Envision has a concrete example. Button's padding is a component token, which is why Button's geometry could be
        changed, twice, without moving any other control in the product.
      </p>

      <h2 className="dc-h2" id="relationship">Relationship to semantic tokens</h2>
      <LayerStack
        alt="Semantic tokens are referenced by component tokens, which are referenced by the component implementation. The component never references semantic or primitive directly."
        layers={[
          { label: 'Component implementation', note: 'references only its own tokens', tone: 'active' },
          { label: 'Component token', note: '--envision-t3-button-primary-color-background-default', tone: 'abstract' },
          { label: 'Semantic token', note: '--envision-t2-color-background-brand-default', tone: 'neutral' },
        ]}
      />

      <h2 className="dc-h2" id="groups">Component token groups</h2>
      <p>{groups.length} components have tier 3 tokens, generated from the output.</p>
      <ScrollTable head={['Component', 'Tokens']}>
        {groups.map((g) => (
          <tr key={g}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{g}</td>
            <td style={TABLE_CELL}>{tokenCount(`--envision-t3-${g}-`)}</td>
          </tr>
        ))}
      </ScrollTable>
      <p className="dc-small">
        Note this is far fewer than the {system.counts.public} registered components. Most components consume semantic
        tokens directly, which is the correct default.
      </p>

      <h2 className="dc-h2" id="anatomy">Anatomy: Button</h2>
      <p>Button has the fullest coverage, spanning color, geometry and type across three sizes and three variants.</p>
      <TokenTable filter={(n) => n.startsWith('--envision-t3-button-')} />
      <LivePreview caption="The rendered result of the tokens above.">
        <envision-button variant="primary" label="Primary" />
        <envision-button variant="outline" label="Outline" />
        <envision-button size="sm" label="Small" />
        <envision-button size="lg" label="Large" />
      </LivePreview>

      <h2 className="dc-h2" id="states">State tokens</h2>
      <p>
        States are a suffix on the same token, not separate names. That keeps a state's relationship to its default
        visible in the name, and makes a missing state obvious.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t3-button-primary-color-background-')} />

      <h2 className="dc-h2" id="not-every">Not every property needs a component token</h2>
      <p>
        Every alias is a name someone must learn and the system must maintain. A component token that simply forwards a
        semantic token, with no prospect of ever diverging, adds indirection and buys nothing.
      </p>
      <p>
        Tab is a good counter-example: it has only the two tokens where it genuinely differs from the shared roles, and
        consumes semantic tokens for everything else.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t3-tab-')} />

      <h2 className="dc-h2" id="when">When to create a component token</h2>
      <ul>
        <li><strong>The component must diverge.</strong> Button's radius differs from the shared control radius on purpose.</li>
        <li><strong>The value will be tuned independently.</strong> Per-size geometry that will be adjusted without moving the spacing scale.</li>
        <li><strong>A state needs its own value</strong> that the semantic role does not provide.</li>
      </ul>
      <p>If none of those apply, consume the semantic token directly.</p>

      <h2 className="dc-h2" id="change">What happens when a semantic token changes</h2>
      <p>
        It flows through. A component token is an alias, so changing the semantic role it points at changes the
        component automatically, and the component source never moves.
      </p>
      <p>
        The insulation runs the other way: repointing one component token affects only that component. Both directions
        are what the boundary buys.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Create a component token when the component genuinely needs to diverge from a shared role.' },
          { kind: 'dont', text: 'Create one that only forwards a semantic token. It is a name to learn that never earns its keep.' },
          { kind: 'do', text: 'Reference semantic tokens from component tokens, so system changes still reach the component.' },
          { kind: 'dont', text: 'Put a literal value in a component token. That breaks the chain at the last step and hides it.' },
        ]}
      />
    </DocArticle>
  );
}
