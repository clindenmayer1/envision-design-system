import { Link } from 'react-router-dom';
import { Callout, CodeBlock, Copyable, DocCard, DocGrid, LivePreview } from '../modules';
import { ProcessDiagram } from '../modules/diagrams';
import { DocArticle } from '../templates';
import { system } from '../data/generated';

/**
 * Role onboarding, installation, Figma, Storybook and the short contribution path.
 *
 * Package names, versions, export paths and element names are read from the generated data layer
 * and the real package manifests. Where infrastructure does not exist yet (a published Figma
 * library, a public npm registry) the page says so rather than inventing a command that fails.
 */

const TRAIL = (leaf: string) => [
  { label: 'Envision Design System', to: '/' },
  { label: 'Getting Started', to: '/get-started' },
  { label: leaf },
];

/** A numbered onboarding step with its rationale and onward link. */
function Step({ n, title, children, why, link }: {
  n: number; title: string; children: React.ReactNode; why: string;
  link?: { label: string; to: string };
}) {
  return (
    <section>
      <h2 className="dc-h2" id={`step-${n}`}>{n}. {title}</h2>
      {children}
      {/* The reason reads as the closing sentence of the step, not as a labelled aside.
          Boxed and prefixed "Why:" on every step, it repeated ten times down a page: the treatment
          shouted where the sentence only needed to explain, and the label said nothing the sentence
          did not already say. */}
      <p style={{
        margin: 'var(--dc-space-3) 0 0',
        maxWidth: '72ch',
        color: 'var(--envision-t2-color-content-secondary-default)',
      }}>
        {why}
      </p>
      {link && <p style={{ marginBlockStart: 'var(--dc-space-3)' }}><Link to={link.to}>{link.label} →</Link></p>}
    </section>
  );
}

const stepsToc = (titles: string[]) => titles.map((t, i) => ({ id: `step-${i + 1}`, label: `${i + 1}. ${t}` }));

/* ------------------------------------------------------------------ designers */

const DESIGNER_STEPS = [
  'Open the Envision library', 'Understand the foundations', 'Work with variables', 'Use system components',
  'Configure variants rather than detaching', 'Use patterns for recurring interactions', 'Design responsively',
  'Check accessibility', 'Prepare handoff', 'Contribute missing system needs',
];

export function Designers() {
  return (
    <DocArticle
      trail={TRAIL('Designers: getting started')}
      title="Getting started for designers"
      lead="Ten steps from opening the library to contributing back. Each one explains what to do and why the system asks for it, because a rule you understand is one you can apply to a case it did not anticipate."
      toc={stepsToc(DESIGNER_STEPS)}
      related={[
        { title: 'Foundations', to: '/foundations', note: 'The decisions you will be using.' },
        { title: 'Figma libraries', to: '/get-started/figma', note: 'The design source in detail.' },
        { title: 'Components', to: '/components', note: 'What already exists.' },
      ]}
      prev={{ title: 'How the system works', to: '/get-started/how-the-system-works' }}
      next={{ title: 'Developers: getting started', to: '/get-started/developers' }}
    >
      <Callout type="Important" title="Figma access is not yet verifiable">
        The Envision Figma library has not been published, so this page documents the intended workflow without
        fabricating an access URL, an enable flow, or screenshots of a library that cannot currently be opened. Steps
        that depend on publishing are marked. The conceptual workflow below is accurate and will not change when
        publishing happens.
      </Callout>

      <Step n={1} title="Open the Envision library" why="Working from the library rather than a copied frame is what makes your file update when the system does." >
        <p>
          Envision's design source is a Figma library containing variable collections and component sets. Enabling it
          in your file gives you the components and the variables that drive them.
        </p>
        <p className="dc-small">
          Publishing status pending verification. Once published, this step becomes: enable the Envision Design System
          library from the Assets panel.
        </p>
      </Step>

      <Step n={2} title="Understand the foundations" why="Foundations are the vocabulary. Most design decisions in Envision are choosing among decisions that already exist rather than making new ones."
        link={{ label: 'Read Foundations', to: '/foundations' }}>
        <p>
          Before placing a component, read Color and Spacing. They explain the two things most often improvised: which
          role a color should perform, and what a gap is supposed to communicate.
        </p>
      </Step>

      <Step n={3} title="Work with variables, not values" why="A bound variable is a reference to a decision. A picked value is a copy, and copies drift.">
        <p>
          Bind fills, spacing and radius to variables rather than entering values. If a variable does not exist for what
          you need, that is a signal worth raising, not a reason to type a number.
        </p>
        <p>
          The system carries {system.counts.tokens} generated tokens, organized in four layers. Consume the semantic
          layer by default.
        </p>
      </Step>

      <Step n={4} title="Use system components" why="A detached copy stops receiving fixes, including accessibility fixes you will not notice are missing."
        link={{ label: 'Browse components', to: '/components' }}>
        <p>
          {system.counts.public} components are registered. Search before drawing: the most common cause of duplicate
          work is a component existing under a name the designer did not think to search for.
        </p>
      </Step>

      <Step n={5} title="Configure variants rather than detaching" why="Detaching solves today's frame and creates a permanent exception that nobody will remember to maintain.">
        <p>
          Every supported difference is expressed as a component property. If you need a state the component does not
          offer, the honest options are to use a different component or to propose the state, not to detach.
        </p>
      </Step>

      <Step n={6} title="Use patterns for recurring interactions" why="Patterns carry decisions that no single component can: sequencing, content rules and what happens between steps."
        link={{ label: 'Read the Selection pattern', to: '/patterns/selection' }}>
        <p>
          If you are designing a selection flow, the pattern already answers where the total goes, when price is shown
          and how the selected state reads. Re-deciding those produces a flow that is subtly different from every other
          Envision flow.
        </p>
      </Step>

      <Step n={7} title="Design responsively" why="A layout that only exists at 1440 is a layout somebody else will have to finish, usually under time pressure."
        link={{ label: 'Breakpoints', to: '/foundations/breakpoints' }}>
        <p>
          Envision's declared breakpoints are 390, 1024, 1080, 1280 and 1440. The one that changes composition most is
          1024, where the right rail becomes a modal sheet.
        </p>
      </Step>

      <Step n={8} title="Check accessibility while designing" why="Contrast and color-only meaning are cheap to fix in a file and expensive to fix in production."
        link={{ label: 'Accessibility', to: '/accessibility' }}>
        <p>
          Two checks catch most issues: is any state conveyed by color alone, and does every interactive element have a
          name that makes sense read aloud out of context.
        </p>
      </Step>

      <Step n={9} title="Prepare handoff" why="Engineers need to know which decision you referenced, not which pixel you landed on.">
        <p>
          A handoff that names variables is unambiguous. A handoff annotated with hex values forces the engineer to
          guess which token you meant, and they will sometimes guess wrong.
        </p>
      </Step>

      <Step n={10} title="Contribute what the system is missing" why="An unmet need that is worked around silently is a need the system never learns about."
        link={{ label: 'Contributing', to: '/get-started/contributing' }}>
        <p>
          If you worked around a gap, say so. Evidence from real work is the most valuable input the system receives.
        </p>
      </Step>

      <h2 className="dc-h2" id="checklist">Designer checklist</h2>
      <ul>
        <li>Every fill, gap and radius is bound to a variable.</li>
        <li>No detached instances.</li>
        <li>Every state is a component property, not a manual override.</li>
        <li>No meaning conveyed by color alone.</li>
        <li>The layout is designed at 1024 as well as at desktop width.</li>
        <li>Interactive elements have names that read sensibly aloud.</li>
      </ul>
    </DocArticle>
  );
}

/* ----------------------------------------------------------------- developers */

const DEV_STEPS = [
  'Understand the package architecture', 'Install the packages', 'Consume tokens', 'Render components',
  'Use Storybook', 'Know the Web Component and React boundary', 'Build responsively',
  'Meet accessibility requirements', 'Test', 'Contribute improvements',
];

export function Developers() {
  return (
    <DocArticle
      trail={TRAIL('Developers: getting started')}
      title="Getting started for developers"
      lead="The developer path through Envision, using only commands and APIs that exist in this repository. Where the infrastructure is not there yet, this page says so instead of giving you something that fails."
      toc={stepsToc(DEV_STEPS)}
      related={[
        { title: 'Installation and setup', to: '/get-started/installation', note: 'The commands themselves.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'Which layer to consume.' },
        { title: 'Storybook', to: '/get-started/storybook', note: 'The executable reference.' },
      ]}
      prev={{ title: 'Designers: getting started', to: '/get-started/designers' }}
      next={{ title: 'Installation and setup', to: '/get-started/installation' }}
    >
      <Step n={1} title="Understand the package architecture" why="Knowing which package owns what stops you importing the wrong layer and coupling to something that will move.">
        <p>The workspace publishes {system.packages.length} packages. All are currently private.</p>
        <div style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
            <thead><tr>{['Package', 'Version', 'Owns'].map((h) => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {system.packages.map((p) => (
                <tr key={p.name}>
                  <td style={TD}><Copyable text={p.name} /></td>
                  <td style={TD}>{p.version}</td>
                  <td style={TD}>{p.description ?? <span className="dc-small">No description in manifest</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Step>

      <Step n={2} title="Install the packages" why="Envision packages are workspace-private, so the install story is a workspace dependency rather than a registry install."
        link={{ label: 'Installation and setup', to: '/get-started/installation' }}>
        <p>
          Every package is marked <code>private: true</code> and versioned <code>0.1.0</code>. There is no public
          registry install, and inventing an <code>npm install</code> line would give you a command that fails.
        </p>
      </Step>

      <Step n={3} title="Consume tokens" why="Tokens are plain CSS custom properties, so they work in any framework and inherit through shadow roots.">
        <CodeBlock language="ts" filename="Application entry" code={`import '@envision/tokens/css';`} />
        <p>
          Sub-entries exist if you need a subset: <code>@envision/tokens/css/primitives</code>,{' '}
          <code>/css/semantic</code>, <code>/css/components</code> and <code>/css/responsive</code>. The default entry
          includes everything and is almost always what you want.
        </p>
      </Step>

      <Step n={4} title="Render components" why="Importing the package registers every custom element as a side effect, so there is nothing to wire up per component.">
        <CodeBlock
          language="ts"
          filename="Application entry"
          code={`import '@envision/tokens/css';\nimport '@envision/components';`}
        />
        <CodeBlock language="html" filename="Anywhere in markup" code={`<envision-button variant="primary" label="Apply design"></envision-button>`} />
        <LivePreview caption="Rendered here by the same import, on this page.">
          <envision-button variant="primary" label="Apply design" />
        </LivePreview>
      </Step>

      <Step n={5} title="Use Storybook as the reference" why="Envision Design tells you which component to use; Storybook tells you what its API actually is."
        link={{ label: 'Storybook', to: '/get-started/storybook' }}>
        <p>
          {system.counts.withStorybook} components have built Storybook documentation. Controls there are exhaustive by
          design, which is why this site does not duplicate them.
        </p>
      </Step>

      <Step n={6} title="Know the Web Component and React boundary" why="Both wrap the same element, so behavior and tokens are identical; the adapter only smooths the React ergonomics.">
        <p>
          <code>@envision/components</code> ships framework-neutral custom elements. <code>@envision/react</code> is a
          thin adapter with React 18 or 19 as a peer dependency. Properties that are objects rather than strings, such
          as MaterialSwatch's <code>option</code>, must be set as properties, which is the main thing the adapter
          simplifies.
        </p>
      </Step>

      <Step n={7} title="Build responsively" why="A small set of semantic tokens changes value at 1024, so components adapt without your layout knowing a breakpoint exists."
        link={{ label: 'Breakpoints', to: '/foundations/breakpoints' }}>
        <p>
          The responsive layer re-declares font sizes, page gutter, rail width, top-bar height and grid column counts
          under <code>@media (max-width: 1024px)</code>. Consume the semantic name and you inherit the change.
        </p>
      </Step>

      <Step n={8} title="Meet accessibility requirements" why="The system guarantees mechanics; it cannot supply a meaningful name or a correct heading structure."
        link={{ label: 'Focus management', to: '/accessibility/focus' }}>
        <p>
          Components render native elements, so activation, disabled focus behavior and form semantics come from the
          platform. What remains yours: accessible names, heading order, reading order and choosing the right component.
        </p>
      </Step>

      <Step n={9} title="Test" why="A component with no test is a component that will regress without anyone noticing.">
        <p>
          The repository runs unit tests with accessibility assertions, a Storybook interaction runner, and a
          Playwright visual suite keyed by story id. Run them with <code>npm run quality</code> from the workspace root.
        </p>
        <Callout type="Developer" title="A known weakness, stated plainly">
          The visual suite's diff threshold is deliberately slack because three fonts load from a network at test time.
          It has let real single-pixel geometry changes pass. Do not treat a green visual run as proof that geometry is
          unchanged.
        </Callout>
      </Step>

      <Step n={10} title="Contribute improvements" why="Most valuable contributions are evidence that a need appears in more than one place."
        link={{ label: 'Contributing', to: '/get-started/contributing' }}>
        <p>A bug is a component not behaving as documented. That is the cheapest and most useful thing to report.</p>
      </Step>
    </DocArticle>
  );
}

const TH: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', whiteSpace: 'nowrap',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)',
  fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--envision-t2-color-content-secondary-default)',
};
const TD: React.CSSProperties = {
  padding: 'var(--dc-space-3)', verticalAlign: 'top',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)',
};

/* --------------------------------------------------------------- installation */

export function Installation() {
  return (
    <DocArticle
      trail={TRAIL('Installation and setup')}
      title="Installation and setup"
      lead="What it takes to render an Envision component, stated exactly as the repository supports it today."
      toc={[
        { id: 'install', label: 'Install' },
        { id: 'minimal', label: 'Minimal implementation' },
        { id: 'tokens', label: 'Tokens' },
        { id: 'components', label: 'Components' },
        { id: 'react', label: 'React' },
        { id: 'verify', label: 'Verify installation' },
        { id: 'problems', label: 'Common problems' },
        { id: 'next', label: 'Next steps' },
      ]}
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'Which layer to consume.' },
        { title: 'Components', to: '/components', note: 'What is available.' },
        { title: 'Storybook', to: '/get-started/storybook', note: 'The executable reference.' },
      ]}
      prev={{ title: 'Developers: getting started', to: '/get-started/developers' }}
      next={{ title: 'Figma libraries', to: '/get-started/figma' }}
    >
      <h2 className="dc-h2" id="install">Install</h2>
      <Callout type="Important" title="There is no registry install command yet">
        All {system.packages.length} Envision packages are marked <code>private: true</code> at version{' '}
        <code>0.1.0</code>. They are consumed through the npm workspace, not installed from a registry. A published
        <code> npm install @envision/components</code> line would look authoritative and fail, so it is not given here.
      </Callout>
      <p>Inside the workspace, add the packages as workspace dependencies:</p>
      <CodeBlock
        language="json"
        filename="your-app/package.json"
        code={`{\n  "dependencies": {\n    "@envision/components": "*",\n    "@envision/tokens": "*"\n  }\n}`}
      />
      <CodeBlock language="bash" filename="Workspace root" code={`npm install`} />

      <h2 className="dc-h2" id="minimal">Minimal implementation</h2>
      <p>The smallest thing that renders a real, correctly styled Envision component:</p>
      <CodeBlock
        language="ts"
        filename="src/main.ts"
        code={`import '@envision/tokens/css';   // design tokens as CSS custom properties\nimport '@envision/components';  // registers every <envision-*> element\n\ndocument.body.innerHTML = \`\n  <envision-button variant="primary" label="Apply design"></envision-button>\n\`;`}
      />
      <LivePreview caption="The result, rendered on this page by those same two imports.">
        <envision-button variant="primary" label="Apply design" />
      </LivePreview>

      <h2 className="dc-h2" id="tokens">Tokens</h2>
      <p>
        Import the token stylesheet once, at the application root. It declares custom properties on{' '}
        <code>:root</code>, which inherit everywhere, including through shadow roots, which is how components pick them
        up without extra wiring.
      </p>
      <CodeBlock
        language="ts"
        filename="Available entry points"
        code={`import '@envision/tokens/css';            // everything (recommended)\nimport '@envision/tokens/css/primitives';  // tier 1 only\nimport '@envision/tokens/css/semantic';    // tier 2 only\nimport '@envision/tokens/css/components';  // tier 3 only\nimport '@envision/tokens/css/responsive';  // the 1024px overrides only`}
      />
      <p>
        A TypeScript entry is also generated, for cases where a token value is needed in JavaScript rather than CSS:
      </p>
      <CodeBlock language="ts" code={`import { EnvisionT2ColorBackgroundBrandDefault } from '@envision/tokens';`} />

      <h2 className="dc-h2" id="components">Components</h2>
      <p>
        Importing <code>@envision/components</code> registers every element as a side effect. There is no per-component
        registration step. The package also re-exports element classes if you need them typed.
      </p>
      <p>
        Object-valued properties must be set as <em>properties</em>, not attributes. This affects MaterialSwatch,
        OptionCard and PackageCard:
      </p>
      <CodeBlock
        language="ts"
        code={`const swatch = document.querySelector('envision-material-swatch')!;\n// correct: a property, because the value is an object\nswatch.option = { id: 'oak', name: 'White Oak', finish: 'Natural', color: '#c9b28a' };`}
      />

      <h2 className="dc-h2" id="react">React</h2>
      <p>
        <code>@envision/react</code> is a thin adapter over the same elements, with React 18 or 19 as a peer
        dependency. It exists mainly to make object properties and typing ergonomic; it does not reimplement anything.
      </p>

      <h2 className="dc-h2" id="verify">Verify installation</h2>
      <p>Two checks tell you whether both halves landed:</p>
      <ul>
        <li>
          <strong>Components registered.</strong> In the console,{' '}
          <code>customElements.get('envision-button')</code> returns a class rather than <code>undefined</code>.
        </li>
        <li>
          <strong>Tokens loaded.</strong>{' '}
          <code>getComputedStyle(document.documentElement).getPropertyValue('--envision-t2-color-background-brand-default')</code>{' '}
          returns a value rather than an empty string.
        </li>
      </ul>

      <h2 className="dc-h2" id="problems">Common problems</h2>
      <p>Only problems this project has actually produced are listed.</p>
      <h3 className="dc-h3">The component renders but looks unstyled</h3>
      <p>
        The element registered but the token stylesheet was not imported. Custom properties resolve to nothing, so
        colors, radius and spacing fall away. Import <code>@envision/tokens/css</code> at the root.
      </p>
      <h3 className="dc-h3">An icon shows as the literal word, such as “chevron_right”</h3>
      <p>
        Consumer-supplied icons are Material Symbols ligature names, and the host application has not loaded that font.
        Icons a component draws for <em>itself</em> ship as inline SVG precisely because this happened in the Envision
        product; icons <em>you</em> pass in still require the font.
      </p>
      <h3 className="dc-h3">Object properties appear to be ignored</h3>
      <p>
        They were set as attributes. An attribute value is a string, so an object becomes{' '}
        <code>[object Object]</code>. Assign the property instead.
      </p>

      <h2 className="dc-h2" id="next">Next steps</h2>
      <DocGrid columns={3}>
        <DocCard to="/tokens/architecture" title="Token architecture">Which layer your code should consume.</DocCard>
        <DocCard to="/components" title="Components">Everything registered, with live examples.</DocCard>
        <DocCard href={system.storybookUrl} title="Storybook">The executable API reference.</DocCard>
      </DocGrid>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------------- figma */

export function FigmaLibraries() {
  return (
    <DocArticle
      trail={TRAIL('Figma libraries')}
      title="Figma libraries"
      lead="The design source of the Envision system: what it contains, how it relates to code, and exactly which parts of the workflow can be verified today."
      toc={[
        { id: 'status', label: 'Publishing status' },
        { id: 'contains', label: 'What the library contains' },
        { id: 'variables', label: 'Variables' },
        { id: 'components', label: 'Components and variants' },
        { id: 'relationship', label: 'Design and code relationship' },
        { id: 'workflow', label: 'Intended workflow' },
      ]}
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'What variables become.' },
        { title: 'Components', to: '/components', note: 'The code side of the same components.' },
        { title: 'Designers: getting started', to: '/get-started/designers', note: 'The design workflow.' },
      ]}
      prev={{ title: 'Installation and setup', to: '/get-started/installation' }}
      next={{ title: 'Storybook', to: '/get-started/storybook' }}
    >
      <h2 className="dc-h2" id="status">Publishing status</h2>
      <Callout type="Important" title="Figma library publishing is not yet available for end-to-end verification">
        <p style={{ margin: '0 0 8px' }}>
          The Envision library exists and is actively used to author the system, but it has not been published. Until
          it is, library consumption cannot be verified from outside, so this page documents architecture rather than
          claiming a working install flow.
        </p>
        <p style={{ margin: 0 }}>
          Consequences, stated plainly: components in other Figma files consume the last published snapshot rather than
          current work; no verified library URL is offered anywhere on this site; and no screenshots are presented as
          evidence of a live library.
        </p>
      </Callout>

      <h2 className="dc-h2" id="contains">What the library contains</h2>
      <p>Two kinds of asset, with different jobs.</p>
      <ul>
        <li>
          <strong>Variable collections.</strong> The design-side representation of the token system, organized into the
          same layers as the code: primitives, brand, semantic and component, plus a responsive collection.
        </li>
        <li>
          <strong>Component sets.</strong> The design-side counterpart of the component library, with properties
          matching the implemented API where a component has been built.
        </li>
      </ul>
      <p>
        {system.counts.public} components are registered in total, {system.counts.implemented} of them implemented in
        code. The remainder exist in design and inventory only, which the component pages state explicitly.
      </p>

      <h2 className="dc-h2" id="variables">Variables</h2>
      <p>
        Variables are the mechanism that makes design and code reference one decision rather than two copies. A fill
        bound to a variable is a reference; a fill picked from a color picker is a copy that will drift.
      </p>
      <p>
        The collections mirror the code layers exactly, so a variable name maps predictably onto a token name. A
        designer selecting the brand background role and an engineer writing{' '}
        <Copyable text="var(--envision-t2-color-background-brand-default)" /> are naming the same thing.
      </p>

      <h2 className="dc-h2" id="components">Components and variants</h2>
      <p>
        Differences a component supports are expressed as component properties, so a variant is selectable rather than
        recreated. Button, for example, carries Type and Size properties whose values correspond to the{' '}
        <code>variant</code> and <code>size</code> attributes in code.
      </p>
      <p>
        This correspondence is the reason detaching an instance is costly: a detached copy no longer receives changes,
        and its differences are invisible to everyone downstream.
      </p>

      <h2 className="dc-h2" id="relationship">Design and code relationship</h2>
      <p>
        The relationship is a reference, not a sync. Neither side pushes to the other on a schedule; both name the same
        decision, and the token build is what carries a value from the design source into implementation formats.
      </p>
      <p>
        The practical consequence for a designer: changing a variable is a system change with real reach, and changing
        a value on one layer is a local override that will look correct and communicate nothing.
      </p>

      <h2 className="dc-h2" id="workflow">Intended workflow</h2>
      <ProcessDiagram
        alt={
          'The intended Figma workflow has five stages: enable the library in a file, use components rather than ' +
          'recreating them, bind properties to variables, publish updates from the library, and accept updates in ' +
          'consuming files. The publish and accept stages are not currently verifiable.'
        }
        stages={[
          { name: 'Enable the library', detail: 'A consuming file subscribes to the Envision library. Pending verification until publishing exists.' },
          { name: 'Use components', detail: 'Place instances rather than recreating UI, so downstream fixes reach the file.' },
          { name: 'Bind to variables', detail: 'Fills, spacing and radius reference variables rather than literal values.' },
          { name: 'Publish updates', detail: 'Library changes are published as a set with a description of what changed. Not currently verifiable.' },
          { name: 'Accept updates', detail: 'Consuming files take the update. Instances keep local overrides; detached copies get nothing.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ storybook */

export function StorybookGuide() {
  return (
    <DocArticle
      trail={TRAIL('Storybook')}
      title="Storybook"
      lead="Storybook is the executable reference for Envision components. Use it to inspect components running in code, explore supported states, and understand implementation behavior."
      actions={
        <a
          href={system.storybookUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--dc-space-2)', padding: 'var(--dc-space-3) var(--dc-space-4)', textDecoration: 'none',
            fontSize: 'var(--envision-t1-font-size-14)', fontWeight: 'var(--envision-t1-font-weight-600)',
            border: '1px solid var(--envision-t2-color-border-strong-default)',
            borderRadius: 'var(--envision-t2-border-radius-container-md)',
          }}
        >
          Open Envision Storybook ↗
        </a>
      }
      toc={[
        { id: 'contains', label: 'What Storybook contains' },
        { id: 'vs', label: 'Envision Design vs Storybook' },
        { id: 'finding', label: 'Finding a component' },
        { id: 'stories', label: 'Stories and states' },
        { id: 'controls', label: 'Controls' },
        { id: 'a11y', label: 'Accessibility tooling' },
        { id: 'when-back', label: 'When to come back here' },
      ]}
      related={[
        { title: 'Components', to: '/components', note: 'The guidance half of the same components.' },
        { title: 'Installation and setup', to: '/get-started/installation', note: 'Running them in your own app.' },
        { title: 'Developers: getting started', to: '/get-started/developers', note: 'The wider developer path.' },
      ]}
      prev={{ title: 'Figma libraries', to: '/get-started/figma' }}
      next={{ title: 'Contributing', to: '/get-started/contributing' }}
    >
      <h2 className="dc-h2" id="contains">What Storybook contains</h2>
      <p>
        The Envision Storybook renders the real production components from{' '}
        <code>@envision/components</code> with the real production tokens. It is not a separate implementation, which
        is why what you see there is what your application will render.
      </p>
      <p>
        {system.counts.withStorybook} of the {system.counts.implemented} implemented components have built
        documentation pages there, alongside foundations pages and a token explorer.
      </p>

      <h2 className="dc-h2" id="vs">Envision Design versus Storybook</h2>
      <p>
        Both document components, and the split is deliberate. Asking the wrong one is the fastest way to conclude the
        documentation is missing something it never owned.
      </p>
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead><tr>{['Question', 'Answered by'].map((h) => <th key={h} style={TH}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['Which component solves my problem?', 'Envision Design'],
              ['When should I not use this one?', 'Envision Design'],
              ['How does it behave in the Envision product?', 'Envision Design'],
              ['What accessibility rules apply?', 'Envision Design'],
              ['What props does it take?', 'Storybook'],
              ['What does it look like when loading and disabled at once?', 'Storybook'],
              ['Does it still work if I set this combination?', 'Storybook'],
              ['What does the rendered markup look like?', 'Storybook'],
            ].map((r) => (
              <tr key={r[0]}>
                <td style={TD}>{r[0]}</td>
                <td style={{ ...TD, fontWeight: 600 }}>{r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="dc-h2" id="finding">Finding a component</h2>
      <p>
        Storybook's sidebar uses the same seven-category taxonomy as this site, so a component sits in the same place in
        both. Every component page here links directly to its Storybook page, and those links are generated from the
        built Storybook index rather than hand-maintained, so they resolve.
      </p>

      <h2 className="dc-h2" id="stories">Stories and states</h2>
      <p>
        A story is one component in one configuration. Envision keeps a story per meaningful case, but single-state
        stories no longer appear as separate sidebar pages: they are reachable by changing a control on the default
        story. They still exist, so the docs page embeds them and the visual suite screenshots them.
      </p>
      <p>
        Two kinds of story remain their own page because no control can produce them: a focus-visible state, which
        requires real keyboard focus, and a breakpoint presentation such as the RightRail's mobile sheet.
      </p>

      <h2 className="dc-h2" id="controls">Controls</h2>
      <p>
        Controls change a component's props live. Enum controls render as one horizontal switcher across the whole
        site, so moving between variants is a single click rather than a navigation.
      </p>

      <h2 className="dc-h2" id="a11y">Accessibility tooling</h2>
      <p>
        Storybook runs an accessibility checker against each story. Treat a pass as evidence of the mechanical rules
        only: no automated tool can confirm that an accessible name is meaningful or that focus landed somewhere useful.
      </p>

      <h2 className="dc-h2" id="when-back">When to come back here</h2>
      <p>
        Return to Envision Design when the question stops being “what can this component do” and becomes “should I
        be using this component at all”. Storybook can show you every state of the wrong component perfectly.
      </p>
    </DocArticle>
  );
}

/* --------------------------------------------------------------- contributing */

export function Contributing() {
  return (
    <DocArticle
      trail={TRAIL('Contributing')}
      title="Contributing"
      lead="The short path. Enough to raise something useful without reading the full governance model first."
      toc={[
        { id: 'before', label: 'Before proposing something new' },
        { id: 'problem', label: 'Identify the problem' },
        { id: 'evidence', label: 'Provide evidence' },
        { id: 'path', label: 'What happens next' },
        { id: 'full', label: 'The full model' },
      ]}
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'The complete process.' },
        { title: 'Governance', to: '/governance', note: 'How the system is run.' },
        { title: 'Components', to: '/components', note: 'Check what already exists.' },
      ]}
      prev={{ title: 'Storybook', to: '/get-started/storybook' }}
      next={{ title: 'Foundations', to: '/foundations' }}
    >
      <h2 className="dc-h2" id="before">Before proposing something new</h2>
      <p>Search four places. Most proposals stop here, which is a good outcome rather than a wasted trip.</p>
      <DocGrid columns={4}>
        <DocCard to="/components" title="Components">{system.counts.public} registered, searchable by name and category.</DocCard>
        <DocCard to="/patterns" title="Patterns">Composition problems are usually solved here, not by a new component.</DocCard>
        <DocCard to="/tokens/reference" title="Tokens">{system.counts.tokens} tokens. The value you need may exist.</DocCard>
        <DocCard to="/get-started/introduction" title="Documentation">The guidance may exist under a different name.</DocCard>
      </DocGrid>

      <h2 className="dc-h2" id="problem">Identify the problem, not the solution</h2>
      <p>
        Describe what someone was trying to do and what got in the way. Proposals written as solutions arrive
        pre-committed to one design, and the review then argues about that design instead of the underlying need.
      </p>
      <p>
        “We need a compact card variant” is a solution. “Three rooms of selections do not fit on a laptop without
        scrolling past the total” is a problem, and it may well have a better answer than a new variant.
      </p>

      <h2 className="dc-h2" id="evidence">Provide evidence</h2>
      <p>
        The single most valuable thing you can attach is the same problem appearing in more than one place. One
        occurrence is a product need; three occurrences solved three different ways is a system need, and that
        distinction decides whether anything happens.
      </p>

      <h2 className="dc-h2" id="path">What happens next</h2>
      <ProcessDiagram
        alt={
          'The short contribution path has seven stages: identify the problem, provide evidence, review, build, ' +
          'test, document, and release.'
        }
        stages={[
          { name: 'Identify the problem', detail: 'What someone was trying to do, and what blocked them.' },
          { name: 'Provide evidence', detail: 'Where else this appears, and how it was worked around.' },
          { name: 'Review', detail: 'Triage against the reuse bar. May convert into a pattern instead of a component.' },
          { name: 'Build', detail: 'Implemented against tokens, with no raw values, and registered in the registry.' },
          { name: 'Test', detail: 'Behavior, accessibility assertions and a visual baseline.' },
          { name: 'Document', detail: 'An Envision Design page and a Storybook reference. Not optional.' },
          { name: 'Release', detail: 'Versioned and published with notes on what changed.' },
        ]}
      />

      <h2 className="dc-h2" id="full">The full model</h2>
      <p>
        The complete lifecycle runs to fourteen stages, with different entry points by contribution type: a bug enters
        at implementation, a token change at proposal, and only a new component runs the whole path.
      </p>
      <p><Link to="/governance/contribution">View the full contribution model →</Link></p>
    </DocArticle>
  );
}
