import { Callout, CodeBlock, Copyable, DoDont, LivePreview, TokenTable } from '../modules';
import { ArchitectureDiagram, Pipeline } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { DesignCenterRail, ProductExample } from '../modules/product';
import { DocArticle } from '../templates';
import { system } from '../data/generated';
import { tokenSeq, tokenTrail } from './TokenLayers';

/**
 * Technical token articles: naming, Figma, DTCG, Style Dictionary, CSS, TypeScript, pipeline and
 * consumption. Every command, path, version and config detail is read from the repository.
 */

/** Central Figma destination. One place to add a real library URL once publishing exists. */
const FIGMA = { published: false, url: null as string | null };

/* --------------------------------------------------------------------- naming */

export function NamingConventions() {
  const example = '--envision-t3-button-primary-color-background-hover';
  const segments: Array<[string, string]> = [
    ['envision', 'Namespace. Every token carries it, so Envision tokens never collide with a host application’s.'],
    ['t3', 'Layer. t1 primitive, t2 brand and semantic, t3 component.'],
    ['button', 'Owner. At t3 this is the component; at t2 it is the role family.'],
    ['primary', 'Variant. Which version of the owner.'],
    ['color', 'Property. What kind of value this is.'],
    ['background', 'Sub-property. Which part of the element.'],
    ['hover', 'State. Omitted only when a token has no states; otherwise `default` is explicit.'],
  ];
  return (
    <DocArticle
      trail={tokenTrail('Naming conventions')}
      title="Token naming conventions"
      lead="Token names communicate scope, role, relationship, and state so design decisions remain understandable without relying on their current visual value."
      toc={[
        { id: 'why', label: 'Why names matter' },
        { id: 'anatomy', label: 'Name anatomy' },
        { id: 'layers', label: 'Layer conventions' },
        { id: 'property', label: 'Property terminology' },
        { id: 'state', label: 'State terminology' },
        { id: 'casing', label: 'Separators and casing' },
        { id: 'css', label: 'CSS transformation' },
        { id: 'ts', label: 'TypeScript transformation' },
        { id: 'strong', label: 'Strong names' },
        { id: 'weak', label: 'Weak naming patterns' },
        { id: 'inconsistencies', label: 'Known inconsistencies' },
      ]}
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'What the layers mean.' },
        { title: 'DTCG token structure', to: '/tokens/dtcg', note: 'How names are written at source.' },
        { title: 'Token reference', to: '/tokens/reference', note: 'Every name in the system.' },
      ]}
      {...tokenSeq('/tokens/naming')}
    >
      <h2 className="dc-h2" id="why">Why names matter</h2>
      <p>
        A token name is read far more often than its value. It appears in review, in DevTools, in a designer's variable
        picker and in every file that consumes it. If the name does not say what the token is for, every one of those
        readers has to resolve the value to find out, and the abstraction has failed.
      </p>

      <h2 className="dc-h2" id="anatomy">Name anatomy</h2>
      <p>
        Envision names are ordered from most general to most specific, so related tokens sort together and a prefix is
        always a meaningful group. Here is a real token broken into its segments.
      </p>
      <figure style={{ margin: '24px 0' }}>
        <p className="dc-sr-only">
          The token {example} breaks into seven segments: namespace, layer, owner, variant, property, sub-property and
          state.
        </p>
        <div style={{ display: 'grid', gap: 'var(--dc-space-2)' }}>
          {segments.map(([seg, meaning], i) => (
            <div key={seg} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 130px) minmax(0, 1fr)', gap: 'var(--dc-space-4)', alignItems: 'baseline' }}>
              <code style={{
                background: i % 2 ? 'var(--dc-diagram-abstract)' : 'var(--dc-diagram-active-surface)',
                padding: 'var(--dc-space-1) var(--dc-space-2)', borderRadius: 'var(--envision-t1-border-radius-4)', fontSize: 'var(--envision-t1-font-size-13)', textAlign: 'center',
              }}>{seg}</code>
              <span className="dc-small">{meaning}</span>
            </div>
          ))}
        </div>
        <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>
          <Copyable text={example} />
        </figcaption>
      </figure>

      <h2 className="dc-h2" id="layers">Layer conventions</h2>
      <ScrollTable head={['Layer', 'Prefix', 'Name says', 'Example']}>
        {[
          ['Primitive', 't1', 'The value or its index', '--envision-t1-color-neutral-800'],
          ['Brand', 't2', 'Which value is this builder’s', '--envision-t2-color-primary-500'],
          ['Semantic', 't2', 'What the value is for', '--envision-t2-color-background-brand-default'],
          ['Component', 't3', 'What one component uses', '--envision-t3-button-primary-color-background-default'],
        ].map((r) => (
          <tr key={r[3]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}><code>{r[1]}</code></td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[3]}</code></td>
          </tr>
        ))}
      </ScrollTable>
      <Callout type="Note" title="Brand and semantic share the t2 prefix">
        They are different collections at source but the same tier in the emitted name. Brand is identifiable by its
        namespace, <code>color-primary-*</code>, rather than by a distinct prefix. Responsive has no prefix at all: it
        re-declares existing t2 names rather than introducing new ones.
      </Callout>

      <h2 className="dc-h2" id="property">Property terminology</h2>
      <p>The vocabulary is small and consistent, which is what makes a name guessable.</p>
      <ScrollTable head={['Term', 'Means']}>
        {[
          ['content', 'Text and icon color'],
          ['background', 'Fill or surface color'],
          ['border', 'Stroke color or width'],
          ['surface', 'A background that hosts other content'],
          ['padding-block / padding-inline', 'Vertical / horizontal internal spacing'],
          ['gap', 'Space between items in a layout'],
          ['elevation', 'A shadow role'],
          ['layer', 'A stacking value'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL }}><code>{r[0]}</code></td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="state">State terminology</h2>
      <p>
        States are always the final segment, and <code>default</code> is written explicitly rather than implied. That
        makes a token with states visually distinct from one without, and it means adding a state later does not force
        a rename.
      </p>
      <p>The states in use: <code>default</code>, <code>hover</code>, <code>pressed</code>, <code>focus</code>, <code>selected</code>, <code>disabled</code>.</p>

      <h2 className="dc-h2" id="casing">Separators and casing</h2>
      <p>
        Source is nested JSON with kebab-case keys. The CSS platform flattens that nesting to a single kebab-case
        custom property; the TypeScript platform flattens it to PascalCase. Both are generated by transforms rather
        than written by hand.
      </p>

      <h2 className="dc-h2" id="css">CSS transformation</h2>
      <CodeBlock
        language="text"
        filename="Source path to CSS custom property"
        code={`envision.t2.color.background.brand.default\n            ↓  name/kebab transform\n--envision-t2-color-background-brand-default`}
      />

      <h2 className="dc-h2" id="ts">TypeScript transformation</h2>
      <CodeBlock
        language="text"
        filename="Source path to TypeScript export"
        code={`envision.t2.color.background.brand.default\n            ↓  js transform group\nEnvisionT2ColorBackgroundBrandDefault`}
      />
      <p>
        Same token, same source, two names. Neither is authored: change the source path and both regenerate.
      </p>

      <h2 className="dc-h2" id="strong">Strong names</h2>
      <ul>
        <li><code>--envision-t2-color-content-secondary-default</code>: layer, property, role and state, all readable without resolving anything.</li>
        <li><code>--envision-t3-button-medium-padding-block-default</code>: owner, variant, exact property, state.</li>
        <li><code>--envision-t2-spacing-control-gap</code>: a role, not a measurement.</li>
      </ul>

      <h2 className="dc-h2" id="weak">Weak naming patterns</h2>
      <p>Conceptual anti-patterns, described rather than fabricated as fake Envision examples.</p>
      <ul>
        <li><strong>Appearance at the semantic layer.</strong> A role named for how it looks rather than what it does cannot survive the look changing.</li>
        <li><strong>Ambiguous scope.</strong> A name that does not say who owns it leaves a reader unable to tell whether changing it is safe.</li>
        <li><strong>Unnecessary abbreviation.</strong> Saved characters cost comprehension, and tokens are read far more than typed.</li>
        <li><strong>Implied state.</strong> Omitting <code>default</code> makes a stateful token look stateless.</li>
      </ul>

      <h2 className="dc-h2" id="inconsistencies">Known inconsistencies</h2>
      <Callout type="Important" title="Recorded, not silently fixed">
        <p style={{ margin: '0 0 8px' }}>
          Documenting the system surfaced three naming inconsistencies. They are reported rather than changed, because
          renaming tokens is an architecture decision requiring governance, not a documentation task.
        </p>
        <ul style={{ margin: 0, paddingInlineStart: 'var(--dc-space-5)' }}>
          <li>
            <strong>Spacing is step-named, everything else is value-named.</strong>{' '}
            <code>font-size-16</code> is 16px but <code>spacing-200</code> is 16px. This has already caused a real
            defect, where components referenced a non-existent <code>spacing-16</code>.
          </li>
          <li>
            <strong>The responsive extension key is <code>mobile</code>.</strong> It generates a media query at the{' '}
            <em>tablet</em> breakpoint (1024), so a value labeled mobile applies from 1024 down.
          </li>
          <li>
            <strong><code>border-radius-pill</code> and <code>border-radius-full</code> both resolve to 999px.</strong>{' '}
            The duplication appears to be intentional, recording different intent, but the names give no way to
            confirm that from source alone.
          </li>
        </ul>
      </Callout>
    </DocArticle>
  );
}

/* ------------------------------------------------------------- figma variables */

export function FigmaVariables() {
  return (
    <DocArticle
      trail={tokenTrail('Figma variables')}
      title="Figma variables"
      lead="Figma variables provide the design-side representation of Envision system decisions and form the current starting point for the token workflow."
      toc={[
        { id: 'status', label: 'Publishing status' },
        { id: 'role', label: 'Role of Figma variables' },
        { id: 'collections', label: 'Collections' },
        { id: 'aliases', label: 'Aliases and modes' },
        { id: 'naming', label: 'Naming relationship' },
        { id: 'flow', label: 'Figma to token source' },
        { id: 'ownership', label: 'Source ownership' },
      ]}
      related={[
        { title: 'How the system works', to: '/get-started/how-the-system-works', note: 'The full journey.' },
        { title: 'DTCG token structure', to: '/tokens/dtcg', note: 'Where variables land in source.' },
        { title: 'Token pipeline', to: '/tokens/pipeline', note: 'Everything downstream.' },
      ]}
      {...tokenSeq('/tokens/figma-variables')}
    >
      <h2 className="dc-h2" id="status">Publishing status</h2>
      <Callout type="Important" title="The Envision Figma library is not published">
        <p style={{ margin: '0 0 8px' }}>
          The library exists and is used to author the system, but it has not been published, so the end-to-end design
          workflow cannot be verified from outside.
        </p>
        <p style={{ margin: 0 }}>
          Consequently this page documents confirmed architecture only. No Figma URL is offered anywhere on this site,
          no screenshots are presented as evidence, and the publishing workflow is described as intended rather than
          as verified. The destination is configured in one place so a real link can be added centrally later.
        </p>
      </Callout>
      {FIGMA.published && FIGMA.url && <p><a href={FIGMA.url}>Open the Envision library ↗</a></p>}

      <h2 className="dc-h2" id="role">Role of Figma variables</h2>
      <p>
        A Figma variable is the design-side expression of the same decision a token holds. Binding a fill to a variable
        creates a reference; picking a color from a picker creates a copy. Only the first stays connected.
      </p>
      <p>
        This is what makes design and code parity structural rather than procedural. Neither side stores its own value,
        so there is nothing to keep in sync.
      </p>

      <h2 className="dc-h2" id="collections">Collections</h2>
      <p>
        The collections mirror the code layers, which is why a variable name maps predictably onto a token name.
      </p>
      <ScrollTable head={['Collection', 'Holds', 'Maps to']}>
        {[
          ['T1 · Primitives', 'Raw ramps, scales and durations', '--envision-t1-*'],
          ['T2 · Brand', 'Envision identity decisions', '--envision-t2-color-primary-*'],
          ['T2 · Semantic Color', 'Color roles', '--envision-t2-color-*'],
          ['T2 · Semantic Layout', 'Spacing, radius, layout, elevation roles', '--envision-t2-spacing/layout/*'],
          ['T2 · Responsive', 'Values that change with width', 'the media-query overrides'],
          ['T3 · Components', 'Per-component values', '--envision-t3-*'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[2]}</code></td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="aliases">Aliases and modes</h2>
      <p>
        A Figma variable can reference another variable, which is the design-side equivalent of a token alias, and it
        is how the layers connect on the design side exactly as they do in code.
      </p>
      <p>
        <strong>Modes.</strong> Envision has no dark mode: the system is a single light environment and the theme
        selector was removed. Whether other modes are configured in the library cannot be confirmed while it is
        unpublished, so nothing further is claimed here.
      </p>

      <h2 className="dc-h2" id="naming">Naming relationship</h2>
      <p>
        A designer selecting <code>color/background/brand/default</code> and an engineer writing{' '}
        <Copyable text="var(--envision-t2-color-background-brand-default)" /> are naming the same decision. The path
        separator differs; the path does not.
      </p>

      <h2 className="dc-h2" id="flow">Figma to token source</h2>
      <Pipeline
        alt={
          'Figma variables are exported to a snapshot, which informs the DTCG token source, which the build ' +
          'transforms into CSS and TypeScript. The step from Figma to the snapshot is the part that cannot ' +
          'currently be verified end to end.'
        }
        caption="The first arrow is dashed: with the library unpublished, that step is not verifiable from outside."
        steps={[
          { label: 'Figma variables', note: 'Design source', tone: 'active' },
          { label: 'Export snapshot', note: 'Not currently verifiable', tone: 'neutral', dashedFromPrevious: true },
          { label: 'DTCG source', note: 'packages/tokens/src', tone: 'abstract' },
          { label: 'Generated output', note: 'CSS + TypeScript', tone: 'abstract' },
        ]}
      />
      <p className="dc-small">
        A snapshot of the Figma-derived token metadata is kept in the repository at{' '}
        <code>packages/tokens/src/_figma-export.txt</code>, which is why the token source can be described accurately
        even while the library itself is unpublished.
      </p>

      <h2 className="dc-h2" id="ownership">Source ownership</h2>
      <ArchitectureDiagram
        alt={
          'Designers edit the Figma variable collections. The DTCG token source in the repository is also edited by ' +
          'hand. Everything under packages/tokens/dist is generated and must not be edited. Components and ' +
          'applications consume the generated output.'
        }
        groups={[
          { role: 'Source', note: 'Edited by hand.', items: ['Figma variable collections', 'packages/tokens/src/*.tokens.json'] },
          { role: 'Generated', note: 'Never edit.', items: ['packages/tokens/dist/*'] },
          { role: 'Consumer', note: 'Imports the output.', items: ['@envision/components', 'Envision applications'] },
        ]}
      />
    </DocArticle>
  );
}

/* ----------------------------------------------------------------------- dtcg */

export function DTCG() {
  return (
    <DocArticle
      trail={tokenTrail('DTCG token structure')}
      title="DTCG token structure"
      lead="Envision uses a DTCG-compatible token structure so token data follows a predictable, interoperable format before it is transformed into platform-specific output."
      toc={[
        { id: 'what', label: 'What DTCG is' },
        { id: 'why', label: 'Why Envision uses it' },
        { id: 'example', label: 'A real Envision token' },
        { id: 'types', label: 'Token types in use' },
        { id: 'references', label: 'References' },
        { id: 'extensions', label: 'Extensions' },
        { id: 'not', label: 'What DTCG does not do' },
        { id: 'contributing', label: 'Contributor guidance' },
      ]}
      related={[
        { title: 'Style Dictionary', to: '/tokens/style-dictionary', note: 'What consumes this format.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'The layers this expresses.' },
        { title: 'Naming conventions', to: '/tokens/naming', note: 'How the paths are named.' },
      ]}
      {...tokenSeq('/tokens/dtcg')}
    >
      <h2 className="dc-h2" id="what">What DTCG is</h2>
      <p>
        DTCG is the Design Tokens Community Group format: an agreed JSON shape for describing design tokens. A token is
        an object with a <code>$type</code> and a <code>$value</code>; nesting creates groups; a value in braces is a
        reference to another token.
      </p>
      <p>That is effectively the whole format. Its value is not sophistication, it is that everyone agrees on it.</p>

      <h2 className="dc-h2" id="why">Why Envision uses a compatible structure</h2>
      <p>
        Because the alternative is a bespoke shape that only Envision's own build understands. A standard structure
        means design tools, transformation tools and validators can read the same files without a translation layer per
        tool, and replacing the build later does not mean rewriting the source.
      </p>

      <h2 className="dc-h2" id="example">A real Envision token</h2>
      <CodeBlock
        language="json"
        filename="packages/tokens/src/brand.tokens.json (excerpt)"
        code={`{\n  "envision": {          // ← group: the namespace\n    "t2": {              // ← group: the layer\n      "color": {         // ← group: the property family\n        "primary": {     // ← group: the role\n          "500": {       // ← the token itself\n            "$type": "color",\n            "$value": "{envision.t1.color.green.500}"\n          }\n        }\n      }\n    }\n  }\n}`}
      />
      <p>
        The nesting is not decoration: the path through the groups <em>is</em> the token name. This object becomes{' '}
        <Copyable text="--envision-t2-color-primary-500" /> because of where it sits, not because of a name field.
      </p>

      <h2 className="dc-h2" id="types">Token types in use</h2>
      <p>Five <code>$type</code> values appear across the source, counted directly from the token files.</p>
      <ScrollTable head={['$type', 'Occurrences', 'Used for']}>
        {[
          ['color', '214', 'Every color in every layer'],
          ['dimension', '165', 'Spacing, sizes, radii, breakpoints'],
          ['number', '31', 'Unitless values: weights, line-height ratios, z-index'],
          ['duration', '9', 'Motion durations'],
          ['shadow', '7', 'Elevation roles'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL }}><code>{r[0]}</code></td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The type is not cosmetic. It drives transformation: a <code>dimension</code> gains a <code>px</code> suffix and
        a <code>duration</code> gains <code>ms</code>, via custom transforms in the build. A wrong type produces a
        wrong unit.
      </p>

      <h2 className="dc-h2" id="references">References</h2>
      <p>
        A value in braces is a dot path to another token. This is how the layer architecture is expressed in the
        source: brand references primitive, semantic references brand, component references semantic.
      </p>
      <CodeBlock
        language="json"
        code={`"$value": "{envision.t1.color.green.500}"   // a reference\n"$value": "#29594f"                         // a literal, correct only in primitives`}
      />
      <p>
        An unresolvable reference is a build failure rather than a silent fallback, which is the behavior you want:
        the error arrives at build time instead of as a missing color in production.
      </p>

      <h2 className="dc-h2" id="extensions">Extensions</h2>
      <p>
        DTCG allows tool-specific data under <code>$extensions</code>. Envision uses this for responsive values, which
        the format has no native concept of.
      </p>
      <CodeBlock
        language="json"
        filename="packages/tokens/src/responsive.tokens.json (excerpt)"
        code={`"h1": {\n  "$type": "dimension",\n  "$value": "{envision.t1.font-size.40}",\n  "$extensions": {\n    "envision.responsive": {\n      "mobile": "{envision.t1.font-size.32}"\n    }\n  }\n}`}
      />
      <p>
        Style Dictionary does not process <code>$extensions</code>, so Envision's build reads them directly to emit the
        media-query block. That is a deliberate extension point, not a workaround.
      </p>

      <h2 className="dc-h2" id="not">What DTCG does not do</h2>
      <ul>
        <li><strong>It does not compile anything.</strong> The files are inert data; a build turns them into CSS.</li>
        <li><strong>It does not replace Style Dictionary.</strong> DTCG is the format; Style Dictionary is the transformer.</li>
        <li><strong>It does not define Envision's architecture.</strong> Four layers, role naming and state suffixes are Envision decisions the format merely stores.</li>
        <li><strong>It does not validate meaning.</strong> A well-formed token can still be a bad decision.</li>
      </ul>

      <h2 className="dc-h2" id="contributing">Contributor guidance</h2>
      <p>Editing token source, four things must stay true:</p>
      <ul>
        <li>Every token has a <code>$type</code> and a <code>$value</code>.</li>
        <li>References resolve. A typo in a dot path fails the build.</li>
        <li>Literals appear only in primitives. Above t1, a value should be a reference.</li>
        <li>The group path is the name. Moving a token renames it, and renames every generated output.</li>
      </ul>
    </DocArticle>
  );
}

/* --------------------------------------------------------- style dictionary */

export function StyleDictionary() {
  return (
    <DocArticle
      trail={tokenTrail('Style Dictionary')}
      title="Style Dictionary"
      lead="Style Dictionary transforms the Envision token source into the CSS and TypeScript formats consumed by the design system and product code."
      toc={[
        { id: 'does', label: 'What it does' },
        { id: 'not', label: 'What it is not' },
        { id: 'inputs', label: 'Inputs' },
        { id: 'config', label: 'Configuration' },
        { id: 'platforms', label: 'Platforms and formats' },
        { id: 'references', label: 'outputReferences' },
        { id: 'responsive', label: 'The responsive step' },
        { id: 'running', label: 'Running the build' },
        { id: 'verification', label: 'Verification' },
        { id: 'failures', label: 'Failure modes' },
      ]}
      related={[
        { title: 'DTCG token structure', to: '/tokens/dtcg', note: 'The input format.' },
        { title: 'CSS tokens', to: '/tokens/css', note: 'One of the outputs.' },
        { title: 'Token pipeline', to: '/tokens/pipeline', note: 'The whole journey.' },
      ]}
      {...tokenSeq('/tokens/style-dictionary')}
    >
      <h2 className="dc-h2" id="does">What Style Dictionary does</h2>
      <p>
        It reads the token source, applies transforms, and writes one output per platform. Envision runs version 4.4.0
        as a dev dependency of the tokens package.
      </p>

      <h2 className="dc-h2" id="not">What it is not</h2>
      <Callout type="Important" title="Style Dictionary is the build, not the source of truth">
        Deleting every file it produces changes nothing permanent: the next build recreates them. The source of truth
        is the DTCG token files, and behind those, the design decisions. Style Dictionary is a translator that has no
        opinions of its own.
      </Callout>

      <h2 className="dc-h2" id="inputs">Inputs</h2>
      <ScrollTable head={['File', 'Lines', 'Holds']}>
        {[
          ['primitives.tokens.json', '774', 'Raw ramps, scales, durations, breakpoints'],
          ['semantic.tokens.json', '626', 'Roles: content, background, border, spacing, layout, elevation'],
          ['components.tokens.json', '594', 'Per-component values'],
          ['responsive.tokens.json', '145', 'Tokens carrying responsive extensions'],
          ['brand.tokens.json', '74', 'Envision identity decisions'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL }}><code>{r[0]}</code></td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p className="dc-small">2,213 lines of token source in total, producing {system.counts.tokens} emitted tokens.</p>

      <h2 className="dc-h2" id="config">Configuration</h2>
      <p>
        The build is configured programmatically in <code>packages/tokens/sd.build.mjs</code> rather than through a
        JSON config file, because the responsive step needs logic a static config cannot express.
      </p>
      <p>Two custom transforms exist, both driven by <code>$type</code>:</p>
      <CodeBlock
        language="js"
        filename="packages/tokens/sd.build.mjs (excerpt)"
        code={`// dimension -> px\ntransform: (t) => \`\${t.$value}px\`,\n\n// duration -> ms\ntransform: (t) => \`\${t.$value}ms\`,`}
      />

      <h2 className="dc-h2" id="platforms">Platforms and formats</h2>
      <ScrollTable head={['Platform', 'Output', 'Format', 'Contains']}>
        {[
          ['css', 'tokens.css', 'css/variables', 'All tiers, the full chain'],
          ['css', 'primitives.css', 'css/variables', 'Tier 1 only'],
          ['css', 'semantic.css', 'css/variables', 'Tier 2 only'],
          ['css', 'components.css', 'css/variables', 'Tier 3 only'],
          ['ts', 'tokens.js', 'javascript/es6', 'Resolved values as ES exports'],
          ['ts', 'tokens.d.ts', 'typescript/es6-declarations', 'Type declarations'],
        ].map((r, i) => (
          <tr key={i}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}><code>{r[1]}</code></td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[2]}</code></td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The per-tier CSS files exist so a consumer can import only what it needs, though the combined{' '}
        <code>tokens.css</code> is the normal choice.
      </p>

      <h2 className="dc-h2" id="references">outputReferences</h2>
      <p>
        The CSS platform sets <code>outputReferences: true</code>, and this single option shapes how debuggable the
        whole system is.
      </p>
      <CodeBlock
        language="css"
        filename="With outputReferences (what Envision emits)"
        code={`--envision-t2-color-background-brand-default: var(--envision-t2-color-primary-500);`}
      />
      <CodeBlock
        language="css"
        filename="Without it (flattened, for comparison)"
        code={`--envision-t2-color-background-brand-default: #29594f;`}
      />
      <p>
        The flattened version works and destroys the reasoning. With references preserved, DevTools shows the chain and
        a reader can see <em>why</em> a value is what it is.
      </p>
      <p>
        Note the platform difference: the TypeScript output uses the <code>js</code> transform group, which resolves
        values. JavaScript has no equivalent of a lazily-resolved custom property, so those exports are literals.
      </p>

      <h2 className="dc-h2" id="responsive">The responsive step</h2>
      <p>
        Style Dictionary does not process <code>$extensions</code>, so the responsive media-query block is generated by
        Envision's own code after the standard build, reading the extensions directly from the DTCG source.
      </p>
      <p>
        That step also reads <code>envision.t1.breakpoint.tablet</code> to derive the media condition and fails the
        build if the token is missing, which is what keeps the literal <code>1024px</code> in the output aligned with
        the token.
      </p>

      <h2 className="dc-h2" id="running">Running the build</h2>
      <CodeBlock
        language="bash"
        filename="packages/tokens"
        code={`npm run build    # node src/build-dtcg.mjs && node sd.build.mjs\nnpm run test     # node test/tokens.test.mjs\nnpm run verify   # build, then test`}
      />

      <h2 className="dc-h2" id="verification">Verification</h2>
      <p>
        The token package has its own test suite covering the responsive layer: that references are preserved, no-op
        overrides are skipped, and raw dimensions gain their unit. It currently reports 13 passing tests.
      </p>

      <h2 className="dc-h2" id="failures">Failure modes</h2>
      <ScrollTable head={['Failure', 'Symptom', 'Cause']}>
        {[
          ['Unresolved reference', 'Build error naming the path', 'A typo or a moved token'],
          ['Missing breakpoint token', 'Build error before output', 'The responsive step cannot derive its media condition'],
          ['Malformed token', 'Build error or wrong unit', 'A missing or incorrect $type'],
          ['Stale output', 'Code sees old values', 'The build was not re-run after a source edit'],
          ['Hand-edited output', 'A change disappears silently', 'Someone edited dist/ instead of src/'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The last two are the dangerous ones, because they fail silently. Everything in{' '}
        <code>packages/tokens/dist</code> begins with an auto-generated header for exactly this reason.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ css / ts */

export function CssTokens() {
  return (
    <DocArticle
      trail={tokenTrail('CSS tokens')}
      title="CSS tokens"
      lead="Generated CSS custom properties make Envision system decisions available directly to browser-based components and application styles."
      toc={[
        { id: 'location', label: 'Where they live' },
        { id: 'importing', label: 'Importing' },
        { id: 'naming', label: 'Naming' },
        { id: 'references', label: 'References in the output' },
        { id: 'usage', label: 'Using a token' },
        { id: 'responsive', label: 'Responsive overrides' },
        { id: 'inheritance', label: 'Inheritance and shadow DOM' },
        { id: 'debugging', label: 'Debugging in DevTools' },
        { id: 'hardcode', label: 'What not to hardcode' },
      ]}
      related={[
        { title: 'Using tokens in components', to: '/tokens/using-tokens', note: 'Applying them well.' },
        { title: 'Responsive tokens', to: '/tokens/responsive', note: 'The override block.' },
        { title: 'TypeScript tokens', to: '/tokens/typescript', note: 'The other output.' },
      ]}
      {...tokenSeq('/tokens/css')}
    >
      <h2 className="dc-h2" id="location">Where they live</h2>
      <p>
        Generated into <code>packages/tokens/dist/</code>, published by <code>@envision/tokens</code>. The combined
        file declares {system.counts.tokens} custom properties on <code>:root</code>.
      </p>

      <h2 className="dc-h2" id="importing">Importing</h2>
      <CodeBlock
        language="ts"
        filename="Application entry, once"
        code={`import '@envision/tokens/css';            // everything (recommended)\nimport '@envision/tokens/css/primitives';  // tier 1 only\nimport '@envision/tokens/css/semantic';    // tier 2 only\nimport '@envision/tokens/css/components';  // tier 3 only\nimport '@envision/tokens/css/responsive';  // the overrides only`}
      />

      <h2 className="dc-h2" id="naming">Naming</h2>
      <p>
        The nested source path is flattened to a single kebab-case name, so{' '}
        <code>envision.t2.color.background.brand.default</code> becomes{' '}
        <Copyable text="--envision-t2-color-background-brand-default" />.
      </p>

      <h2 className="dc-h2" id="references">References in the output</h2>
      <p>
        Because the build preserves references, the chain is visible in the generated file rather than flattened away.
      </p>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`--envision-t2-color-primary-500: #3a3835;   /* supplied by the active theme */\n--envision-t2-color-background-brand-default: var(--envision-t2-color-primary-500);\n--envision-t3-button-primary-color-background-default: var(--envision-t2-color-background-brand-default);`}
      />

      <h2 className="dc-h2" id="usage">Using a token</h2>
      <CodeBlock
        language="css"
        code={`.panel {\n  background: var(--envision-t2-color-background-surface-default);\n  color: var(--envision-t2-color-content-primary-default);\n  padding: var(--envision-t2-spacing-container-padding-note);\n  border-radius: var(--envision-t2-border-radius-container-md);\n}`}
      />

      <h2 className="dc-h2" id="responsive">Responsive overrides</h2>
      <p>
        The same custom property is re-declared inside a media query, so consuming code needs no breakpoint of its own.
      </p>
      <CodeBlock
        language="css"
        code={`/* generated */\n@media (max-width: 1024px) {\n  :root { --envision-t2-layout-right-rail-width: 390px; }\n}\n\n/* your code, unchanged at every width */\n.rail { inline-size: var(--envision-t2-layout-right-rail-width); }`}
      />

      <h2 className="dc-h2" id="inheritance">Inheritance and shadow DOM</h2>
      <p>
        Custom properties inherit, and critically they cross the shadow boundary. That is why Envision components pick
        up tokens declared on <code>:root</code> without any per-component wiring, and why a component renders
        unstyled if the stylesheet was never imported.
      </p>
      <LivePreview caption="A real component in a shadow root, resolving tokens declared on :root by this page.">
        <envision-button variant="primary" label="Apply design" />
      </LivePreview>

      <h2 className="dc-h2" id="debugging">Debugging in DevTools</h2>
      <p>Four steps to answer “where did this color come from”:</p>
      <ol>
        <li>Inspect the element and find the property, for example <code>background</code>.</li>
        <li>Read the custom property it references. Inside a component this is a t3 token.</li>
        <li>Search that name in the Computed panel to find what it resolves to; with references preserved you will see another <code>var()</code>.</li>
        <li>Repeat until you reach a literal. That is the primitive, and the path you walked is the reasoning.</li>
      </ol>
      <p>
        If step 3 shows a literal where you expected a reference, the chain was broken: something hardcoded a value.
      </p>

      <h2 className="dc-h2" id="hardcode">What not to hardcode</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Reference the role, so this rule follows the system when the system moves.', example: <envision-button variant="primary" label="Apply design" /> },
          { kind: 'dont', text: 'Paste the resolved value. It is correct today, silently wrong after any system change, and invisible in review.' },
        ]}
      />
      <CodeBlock
        language="css"
        filename="The same rule, written both ways"
        code={`/* do */\nbackground: var(--envision-t2-color-background-brand-default);\n\n/* don't */\nbackground: #29594f;`}
      />
    </DocArticle>
  );
}

export function TypeScriptTokens() {
  return (
    <DocArticle
      trail={tokenTrail('TypeScript tokens')}
      title="TypeScript tokens"
      lead="Generated TypeScript exports expose Envision token values to code that needs system decisions outside ordinary CSS styling."
      toc={[
        { id: 'why', label: 'Why this output exists' },
        { id: 'location', label: 'Where it lives' },
        { id: 'importing', label: 'Importing' },
        { id: 'shape', label: 'Export shape' },
        { id: 'use-cases', label: 'Appropriate use cases' },
        { id: 'prefer-css', label: 'When CSS is better' },
        { id: 'relationship', label: 'Relationship to CSS' },
        { id: 'generated', label: 'Generated, never edited' },
      ]}
      related={[
        { title: 'CSS tokens', to: '/tokens/css', note: 'The output you should usually prefer.' },
        { title: 'Using tokens in components', to: '/tokens/using-tokens', note: 'Choosing correctly.' },
        { title: 'Style Dictionary', to: '/tokens/style-dictionary', note: 'How both are produced.' },
      ]}
      {...tokenSeq('/tokens/typescript')}
    >
      <h2 className="dc-h2" id="why">Why this output exists</h2>
      <p>
        Some code needs a token value as data rather than as a style: passing a color to a canvas or 3D renderer,
        computing something from a breakpoint, or handing a value to a library that takes a string.
      </p>
      <p>
        None of those can read a CSS custom property without a runtime lookup, so the same token source is also emitted
        as JavaScript with TypeScript declarations.
      </p>

      <h2 className="dc-h2" id="location">Where it lives</h2>
      <p>
        <code>packages/tokens/dist/tokens.js</code> with declarations in <code>tokens.d.ts</code>, exposed as the
        default export of <code>@envision/tokens</code>.
      </p>

      <h2 className="dc-h2" id="importing">Importing</h2>
      <CodeBlock language="ts" code={`import { EnvisionT2ColorBackgroundBrandDefault } from '@envision/tokens';`} />

      <h2 className="dc-h2" id="shape">Export shape</h2>
      <p>
        Flat named exports in PascalCase, one per token. Not a nested object: named exports are tree-shakeable, so
        importing one token does not pull in {system.counts.tokens}.
      </p>
      <CodeBlock
        language="ts"
        filename="packages/tokens/dist/tokens.js (generated)"
        code={`export const EnvisionT2ColorAccent500 = "#e67e22";\nexport const EnvisionT2ColorContentOnPrimaryDefault = "#ffffff";\nexport const EnvisionT2ColorContentBrandDefault = "#29594f";`}
      />
      <Callout type="Developer" title="These are resolved values, not references">
        The CSS output preserves <code>var()</code> chains; the TypeScript output cannot, because JavaScript has no
        equivalent of a lazily-resolved custom property. Values here are flattened at build time, which has a real
        consequence: <strong>a TypeScript token does not respond to the responsive override.</strong> Import a layout
        value and you get its desktop value at every width.
      </Callout>

      <h2 className="dc-h2" id="use-cases">Appropriate use cases</h2>
      <ul>
        <li><strong>Canvas or WebGL.</strong> The 3D visualizer cannot read a custom property; it needs a string.</li>
        <li><strong>Third-party libraries</strong> configured with color values in JavaScript.</li>
        <li><strong>Computed logic</strong> that genuinely needs a numeric token.</li>
        <li><strong>Documentation and tooling</strong> that reasons about tokens as data.</li>
      </ul>

      <h2 className="dc-h2" id="prefer-css">When CSS is better</h2>
      <p><strong>Almost always, for styling.</strong> Three reasons, in order of importance:</p>
      <ol>
        <li><strong>Responsive values work.</strong> A CSS token changes at the breakpoint; an imported value does not.</li>
        <li><strong>The chain stays inspectable.</strong> DevTools shows the reference; an inlined string shows nothing.</li>
        <li><strong>No JavaScript is required</strong> to apply a style.</li>
      </ol>
      <Callout type="Important" title="Existing is not a recommendation">
        The presence of this output does not mean styles should be written in JavaScript. If the value is going into a
        style, use the CSS custom property.
      </Callout>

      <h2 className="dc-h2" id="relationship">Relationship to CSS</h2>
      <p>
        Same source, same build, two platforms. The CSS platform uses kebab-case names and preserves references; the
        TypeScript platform uses PascalCase names and resolves values. Neither is more authoritative.
      </p>

      <h2 className="dc-h2" id="generated">Generated, never edited</h2>
      <p>
        Both files open with an auto-generated header. A hand edit survives until the next build and then disappears
        without an error.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------- pipeline */

export function TokenPipeline() {
  const brand = system.tokens.find((t) => t.name === '--envision-t2-color-primary-500')?.resolved ?? '#3a3835';
  return (
    <DocArticle
      trail={tokenTrail('Token pipeline')}
      title="Token pipeline"
      lead="The Envision token pipeline preserves design decisions as they move from the design source into formats that production components and applications can consume."
      toc={[
        { id: 'pipeline', label: 'The pipeline' },
        { id: 'stages', label: 'The eight stages' },
        { id: 'source', label: 'Source, generated, consumer' },
        { id: 'follow', label: 'Follow one real token' },
        { id: 'change', label: 'When a token changes' },
        { id: 'commands', label: 'Build commands' },
        { id: 'verification', label: 'Verification' },
        { id: 'failures', label: 'Failure scenarios' },
        { id: 'debugging', label: 'Debugging' },
      ]}
      related={[
        { title: 'How the system works', to: '/get-started/how-the-system-works', note: 'The same journey, less technical.' },
        { title: 'Style Dictionary', to: '/tokens/style-dictionary', note: 'The transformation stage.' },
        { title: 'Components', to: '/components', note: 'The consumers.' },
      ]}
      {...tokenSeq('/tokens/pipeline')}
    >
      <h2 className="dc-h2" id="pipeline">The pipeline</h2>
      <Pipeline
        alt={
          'Figma variables feed a DTCG token source, which Style Dictionary transforms into CSS and TypeScript. ' +
          'Components consume the output and the product consumes components. Storybook sits beside components as ' +
          'an executable reference rather than a transformation stage, shown with a dashed relationship.'
        }
        caption="Six transformations and one reference relationship. Storybook observes components; it does not transform them."
        steps={[
          { label: 'Figma variables', note: 'Design source', tone: 'active' },
          { label: 'DTCG source', note: 'packages/tokens/src', tone: 'abstract' },
          { label: 'Style Dictionary', note: 'Transformation', tone: 'neutral' },
          { label: 'CSS + TypeScript', note: 'Generated output', tone: 'abstract' },
          { label: 'Components', note: 'Consume the output', tone: 'active' },
          { label: 'Storybook', note: 'Executable reference', tone: 'neutral', dashedFromPrevious: true },
          { label: 'Product', note: 'Envision applications', tone: 'active' },
        ]}
      />

      <h2 className="dc-h2" id="stages">The eight stages</h2>
      <ScrollTable head={['#', 'Stage', 'What happens', 'Editable?']}>
        {[
          ['1', 'Design source', 'A decision is made as a Figma variable', 'Yes, by designers'],
          ['2', 'Token source', 'The decision exists as DTCG JSON with references', 'Yes, by hand'],
          ['3', 'Transformation', 'Style Dictionary applies transforms per platform', 'Config only'],
          ['4', 'CSS output', 'Custom properties with references preserved', 'No, generated'],
          ['5', 'TypeScript output', 'Named exports with resolved values', 'No, generated'],
          ['6', 'Components', 'Components reference their own tokens', 'Yes, component source'],
          ['7', 'Storybook', 'The same components rendered for inspection', 'Reference only'],
          ['8', 'Product', 'Applications compose components', 'Yes, product code'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="source">Source, generated, consumer</h2>
      <ArchitectureDiagram
        alt={
          'Source files are edited by hand: the Figma collections and the DTCG token source. Generated files are ' +
          'produced by the build and must never be edited: tokens.css, the per-tier CSS files, tokens.js and ' +
          'tokens.d.ts. Consumers import the generated output: the component package, Storybook, the Developer ' +
          'Center and Envision applications.'
        }
        caption="Anything in the Generated row is rewritten by the next build. To change it, edit the Source row and rebuild."
        groups={[
          { role: 'Source', note: 'Edited by hand.', items: ['Figma collections', 'src/primitives.tokens.json', 'src/brand.tokens.json', 'src/semantic.tokens.json', 'src/components.tokens.json', 'src/responsive.tokens.json'] },
          { role: 'Generated', note: 'Never edit.', items: ['dist/tokens.css', 'dist/primitives.css', 'dist/semantic.css', 'dist/components.css', 'dist/tokens.js', 'dist/tokens.d.ts'] },
          { role: 'Consumer', note: 'Imports the output.', items: ['@envision/components', '@envision/storybook', '@envision/developer-center', 'Envision applications'] },
        ]}
      />

      <h2 className="dc-h2" id="follow">Follow one real token</h2>
      <Callout type="Note" title="The trace begins in the repository">
        The Figma library is unpublished, so the design-source step cannot be verified from outside. The trace below
        therefore starts at the token source, which is verifiable, rather than fabricating the Figma step.
      </Callout>
      <p><strong>1. Token source.</strong> The primitive holds the only literal in the chain.</p>
      <CodeBlock language="json" filename="src/brand.tokens.json" code={`"primary": { "500": { "$type": "color", "$value": "${brand}" } }`} />
      <p><strong>2. Brand references it.</strong></p>
      <CodeBlock language="json" filename="src/brand.tokens.json" code={`"primary": { "500": { "$type": "color", "$value": "{envision.t1.color.green.500}" } }`} />
      <p><strong>3. Semantic gives it a job, 4. component scopes it, and the build emits the chain.</strong></p>
      <CodeBlock
        language="css"
        filename="dist/tokens.css (generated)"
        code={`--envision-t2-color-primary-500: ${brand};   /* supplied by the active theme */\n--envision-t2-color-background-brand-default: var(--envision-t2-color-primary-500);\n--envision-t3-button-primary-color-background-default: var(--envision-t2-color-background-brand-default);`}
      />
      <p><strong>5. TypeScript emits the same decision, flattened.</strong></p>
      <CodeBlock language="ts" filename="dist/tokens.js (generated)" code={`export const EnvisionT2ColorContentBrandDefault = "${brand}";`} />
      <p><strong>6. The component consumes its own token.</strong></p>
      <CodeBlock
        language="css"
        filename="packages/components/src/button/Button.ts"
        code={`:host([variant='primary']) .btn {\n  background: var(--envision-t3-button-primary-color-background-default);\n}`}
      />
      <p><strong>7 and 8. Storybook renders it for inspection, and the product composes it.</strong></p>
      <ProductExample
        title="Design Center · right rail"
        surface={<DesignCenterRail />}
        annotations={[
          'The commit action resolves through all four layers shown above.',
          'No color value appears anywhere in the product composition.',
          'Changing the primitive would move this button and everything else on the chain.',
          'Every element here is a real production component.',
        ]}
      />

      <h2 className="dc-h2" id="change">What happens when a token changes</h2>
      <ol>
        <li>The primitive value is edited in the token source.</li>
        <li>The build runs. Every referencing token regenerates; nothing else is touched.</li>
        <li>CSS updates. Because references are preserved, only the primitive line actually changes.</li>
        <li>TypeScript updates. Every export whose resolved value depended on it changes, since those are flattened.</li>
        <li>Components change with no source edit, because they reference names rather than values.</li>
        <li>The product changes on its next dependency update.</li>
      </ol>
      <p>
        The important property: steps 5 and 6 require no work. That is the entire return on the token architecture.
      </p>

      <h2 className="dc-h2" id="commands">Build commands</h2>
      <CodeBlock
        language="bash"
        code={`# tokens only\ncd packages/tokens && npm run verify   # build, then test\n\n# everything\nnpm run quality                        # taxonomy, tokens, components, storybook`}
      />

      <h2 className="dc-h2" id="verification">Verification</h2>
      <p>
        The token package's own tests cover the responsive layer: reference preservation, no-op skipping and unit
        transformation, currently 13 passing. Beyond that, a repository check fails on any{' '}
        <code>var(--envision-*)</code> reference with no definition and no fallback, which catches the class of typo
        that would otherwise reach production as a missing style.
      </p>

      <h2 className="dc-h2" id="failures">Failure scenarios</h2>
      <ScrollTable head={['Scenario', 'When it surfaces', 'How it presents']}>
        {[
          ['Invalid reference', 'Build', 'Error naming the unresolvable path'],
          ['Malformed source', 'Build', 'Error, or a wrong unit if $type is wrong'],
          ['Missing breakpoint token', 'Build', 'The responsive step fails explicitly'],
          ['Stale generated output', 'Runtime', 'Old values, no error at all'],
          ['Hand-edited output', 'Next build', 'The change vanishes silently'],
          ['Hardcoded value bypassing tokens', 'Never automatically', 'Only in review, or when a system change fails to reach one screen'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The bottom two are the ones to worry about. Build failures are loud and get fixed; silent divergence is what
        erodes a token system over time.
      </p>

      <h2 className="dc-h2" id="debugging">Debugging the pipeline</h2>
      <ul>
        <li><strong>A token resolves to nothing.</strong> Check the name against the reference. Step-named spacing is the usual culprit.</li>
        <li><strong>A change did not appear.</strong> The build was not re-run, or the edit went into <code>dist/</code>.</li>
        <li><strong>A value is right on desktop and wrong when narrow.</strong> You imported the TypeScript token; use the CSS custom property.</li>
        <li><strong>One screen did not follow a system change.</strong> Something hardcoded a value. Search the resolved literal.</li>
      </ul>
    </DocArticle>
  );
}

/* --------------------------------------------------------------- using tokens */

export function UsingTokens() {
  return (
    <DocArticle
      trail={tokenTrail('Using tokens in components')}
      title="Using tokens in components"
      lead="Envision components should consume shared token decisions rather than duplicating system values through hardcoded component styles."
      toc={[
        { id: 'intent', label: 'Start with intent' },
        { id: 'layer', label: 'Choosing the correct layer' },
        { id: 'progression', label: 'Hardcoded, semantic, component' },
        { id: 'states', label: 'States' },
        { id: 'responsive', label: 'Responsive tokens' },
        { id: 'trace', label: 'Following a reference' },
        { id: 'walkthrough', label: 'Walkthrough: Button' },
        { id: 'debugging', label: 'Debugging' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'The default layer to consume.' },
        { title: 'Component tokens', to: '/tokens/component', note: 'When a component needs its own.' },
        { title: 'Components', to: '/components', note: 'The components themselves.' },
      ]}
      {...tokenSeq('/tokens/using-tokens')}
    >
      <h2 className="dc-h2" id="intent">Start with intent</h2>
      <p>
        The wrong first question is “what color is this in the mock-up”. The right one is “what is this element
        doing”. Starting from the value leads you to search for a token that matches it, which is how a token gets
        chosen for the wrong reason and quietly breaks later.
      </p>

      <h2 className="dc-h2" id="layer">Choosing the correct layer</h2>
      <ScrollTable head={['Layer', 'Consume in product code?', 'Consume in a component?']}>
        {[
          ['Primitive (t1)', 'No', 'Only when documenting the scale itself'],
          ['Brand (t2)', 'No', 'No: it says which color, not what for'],
          ['Semantic (t2)', 'Yes, the default', 'Yes, unless the component needs to diverge'],
          ['Component (t3)', 'No, it belongs to that component', 'Yes, inside that component'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="progression">Hardcoded, semantic, component</h2>
      <p>The same rule written three ways, worst to best.</p>
      <CodeBlock
        language="css"
        filename="1. Incorrect: a hardcoded value"
        code={`.apply-button {\n  background: #29594f;\n  border-radius: 10px;\n  padding: 16px 20px;\n}\n/* Correct today. Silently wrong after any system change, and invisible in review. */`}
      />
      <CodeBlock
        language="css"
        filename="2. Better: semantic tokens"
        code={`.apply-button {\n  background: var(--envision-t2-color-background-brand-default);\n  border-radius: var(--envision-t2-border-radius-container-md);\n  padding: var(--envision-t2-spacing-container-padding-note) var(--envision-t2-spacing-control-padding-inline);\n}\n/* Follows the system. Correct for a one-off surface. */`}
      />
      <CodeBlock
        language="css"
        filename="3. Inside a component: its own tokens"
        code={`:host([variant='primary']) .btn {\n  background: var(--envision-t3-button-primary-color-background-default);\n  padding-block: var(--envision-t3-button-medium-padding-block-default);\n}\n/* Follows the system AND can diverge without moving shared roles. */`}
      />
      <Callout type="Note" title="Best is contextual">
        Option 3 is right inside Button. For a one-off product surface it would be wrong: you would be consuming
        another component's private tokens. Product code should stop at option 2.
      </Callout>

      <h2 className="dc-h2" id="states">States</h2>
      <p>
        Do not compute a state. Darkening a color in code produces a value the system never chose, and it will not
        track when the role changes.
      </p>
      <CodeBlock
        language="css"
        code={`/* do */\n.btn:hover  { background: var(--envision-t3-button-primary-color-background-hover); }\n.btn:active { background: var(--envision-t3-button-primary-color-background-pressed); }\n\n/* don't */\n.btn:hover { filter: brightness(0.9); }`}
      />

      <h2 className="dc-h2" id="responsive">Responsive tokens</h2>
      <p>
        Consume the semantic name and let it change itself. A media query in your own code duplicates a threshold the
        system already owns.
      </p>
      <CodeBlock
        language="css"
        code={`/* do */\n.rail { inline-size: var(--envision-t2-layout-right-rail-width); }\n\n/* don't */\n.rail { inline-size: 392px; }\n@media (max-width: 1024px) { .rail { inline-size: 390px; } }`}
      />

      <h2 className="dc-h2" id="trace">Following a reference</h2>
      <p>Any value in the product can be traced back to the decision that produced it:</p>
      <CodeBlock
        language="text"
        code={`background on .btn\n  → --envision-t3-button-primary-color-background-default   (component)\n  → --envision-t2-color-background-brand-default            (semantic: a brand background)\n  → --envision-t2-color-primary-500                         (brand: the white-label seam)\n  → #3a3835                                                 (whichever theme is active)`}
      />
      <p>
        Three hops, and each one is a separate decision that can change independently. The trace ends at the brand
        layer because that is the white-label seam: below it, the value belongs to whichever builder theme is loaded.
        If the trace ends early at a literal anywhere above that, someone broke the chain.
      </p>

      <h2 className="dc-h2" id="walkthrough">Walkthrough: Button</h2>
      <p>
        Button is the fullest example in the system. Its stylesheet contains no color, radius or spacing value: every
        one is a token reference.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t3-button-primary-')} />
      <p>Three things worth noticing in its source:</p>
      <ul>
        <li><strong>Size geometry is tokenized per size,</strong> so small, medium and large are decisions rather than ratios computed from a base.</li>
        <li><strong>The outline variant deliberately consumes semantic tokens,</strong> not the t3 outline tokens, because those resolve to brand green and do not match the shipped product. The divergence is documented in the source rather than hidden.</li>
        <li><strong>The 1px edge is an inset ring, not a border,</strong> so it does not add to the height. That is a geometry decision recorded in code with its reasoning.</li>
      </ul>
      <LivePreview caption="The real component, resolving every value through the chain above.">
        <envision-button variant="primary" label="Apply design" />
        <envision-button variant="outline" label="Cancel" />
        <envision-button variant="primary" label="Saving…" loading />
      </LivePreview>

      <h2 className="dc-h2" id="debugging">Debugging</h2>
      <ul>
        <li><strong>Style not applying.</strong> The custom property does not exist. Check the name; step-named spacing is the usual cause.</li>
        <li><strong>Value right, wrong at narrow widths.</strong> A TypeScript token was imported instead of the CSS property.</li>
        <li><strong>A system change missed one screen.</strong> Search the resolved literal in that screen's styles.</li>
        <li><strong>A component looks wrong in one place only.</strong> Something overrode its internals from outside.</li>
      </ul>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Choose a token by the role the element performs, so the choice stays correct when values change.' },
          { kind: 'dont', text: 'Choose a token because its resolved value matches the design. You picked a color and called it a decision.' },
          { kind: 'do', text: 'Let a component own its internal spacing so it looks the same everywhere it appears.' },
          { kind: 'dont', text: 'Override a component’s internals from a page. The exception is invisible to everyone who reads the component later.' },
          { kind: 'do', text: 'Reference a state token for hover and pressed.' },
          { kind: 'dont', text: 'Compute a state with a filter or opacity. You produced a value the system never chose.' },
          { kind: 'do', text: 'Raise it when no token expresses what you need.' },
          { kind: 'dont', text: 'Hardcode a value to move on. The gap becomes permanent and undiscoverable.' },
        ]}
      />
    </DocArticle>
  );
}
