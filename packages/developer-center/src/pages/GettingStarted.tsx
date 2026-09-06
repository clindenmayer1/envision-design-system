import { Link } from 'react-router-dom';
import { DotsLoader } from '../modules/dotsLoader';
import {
  Callout, CodeBlock, Copyable, DocCard, DocGrid, LivePreview, SectionIntro, StatusBadge,
} from '../modules';
import { ArchitectureDiagram, LayerStack, Pipeline } from '../modules/diagrams';
import { DesignCenterRail, ProductExample } from '../modules/product';
import { DocArticle, SectionLanding } from '../templates';
import { system } from '../data/generated';

/**
 * The Getting Started section.
 *
 * Every technical claim here is checked against the repository: package names and versions come
 * from the generated data layer, breakpoints and token names from the token build, and the Figma
 * limitation is stated rather than papered over. Where something cannot be verified it says so.
 */

const TRAIL = (leaf: string) => [
  { label: 'Envision Design System', to: '/' },
  { label: 'Getting Started', to: '/get-started' },
  { label: leaf },
];

/** The ecosystem visual, distinct from the Foundations composition by design. */

/* ------------------------------------------------------------------- landing */

export function GettingStartedLanding() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Getting Started' }]}
      title="Getting started for developers"
      lead="The developer path through Envision, using only commands and APIs that exist in this repository. Where the infrastructure is not there yet, this page says so instead of giving you something that fails."
      // The same mark the Develop card carries, since that card is what links here.
      media={<DotsLoader />}
      related={[
        { title: 'Foundations', to: '/foundations', note: 'The decisions everything inherits.' },
        { title: 'Design Tokens', to: '/tokens', note: 'How those decisions become data.' },
        { title: 'Components', to: '/components', note: 'What you will actually build with.' },
      ]}
      next={{ title: 'Introduction', to: '/get-started/introduction' }}
      intro={
        <SectionIntro
          // The flow runs left to right, so it takes the module's full width rather than a column
          // beside the copy — which is what `stacked` is for.
          stacked
          heading={<>Start with the system,<br />then follow your workflow</>}
          body="Envision gives designers and engineers a shared foundation for building the product. Begin with how the ecosystem works, then follow the guidance for your role."
          cta={{ label: 'Read the introduction', to: '/get-started/introduction' }}
          visual={
            <Pipeline
              chevron
              // flush, matching the governance module: without it the figure
              // keeps its own 28px block margins inside a card that already
              // pads itself, so the ribbon sits lower in the box than the
              // one on that page.
              flush
              alt={
                'Five stages in order: Figma, Tokens, Components, Storybook, and the Envision '
                + 'product that results.'
              }
              steps={[
                { label: 'Figma', tone: 'info' },
                { label: 'Tokens', tone: 'info' },
                { label: 'Components', tone: 'info' },
                { label: 'Storybook', tone: 'info' },
                { label: 'Product', tone: 'info' },
              ]}
            />
          }
        />
      }
      grid={
        <>
          <DocGrid columns={4}>
            <DocCard to="/get-started/introduction" title="Introduction">
              Understand what this documentation contains and how to navigate it.
            </DocCard>
            <DocCard to="/get-started/what-is-envision" title="What is Envision?">
              Learn what the design system includes, why it exists, and the problems it solves.
            </DocCard>
            <DocCard to="/get-started/how-the-system-works" title="How the system works">
              Follow a design decision from Figma through tokens, components, Storybook, and production.
            </DocCard>
            <DocCard to="/get-started/designers" title="Designers">
              Set up the design libraries and learn how to work with components, variables, patterns and handoff.
            </DocCard>
            <DocCard to="/get-started/developers" title="Developers">
              Install the system, consume tokens and components, and use Storybook as the executable reference.
            </DocCard>
            <DocCard to="/get-started/installation" title="Installation">
              Get the actual Envision packages running in an application.
            </DocCard>
            <DocCard to="/get-started/figma" title="Figma libraries">
              Understand the design-side source and library workflow.
            </DocCard>
            <DocCard to="/get-started/storybook" title="Storybook">
              Use the live executable reference for Envision components.
            </DocCard>
          </DocGrid>

          <p className="dc-small" style={{ marginBlockStart: 'var(--dc-space-6)' }}>
            Also in this section: <Link to="/get-started/principles">Design system principles</Link> and{' '}
            <Link to="/get-started/contributing">Contributing</Link>.
          </p>
        </>
      }
    >
      <section>
        <h2 className="dc-h2" id="paths">Choose your path</h2>
        <p>
          The same documentation, entered from three directions. Follow the one that matches what you are about to do.
        </p>
        <PathList
          paths={[
            {
              role: 'Designer',
              steps: [
                ['Introduction', '/get-started/introduction'],
                ['Figma libraries', '/get-started/figma'],
                ['Foundations', '/foundations'],
                ['Components', '/components'],
                ['Patterns', '/patterns'],
              ],
            },
            {
              role: 'Developer',
              steps: [
                ['Introduction', '/get-started/introduction'],
                ['Installation', '/get-started/installation'],
                ['Tokens', '/tokens'],
                ['Components', '/components'],
                ['Storybook', '/get-started/storybook'],
              ],
            },
            {
              role: 'Contributor',
              steps: [
                ['How the system works', '/get-started/how-the-system-works'],
                ['Contributing', '/get-started/contributing'],
                ['Governance', '/governance'],
              ],
            },
          ]}
        />
      </section>
    </SectionLanding>
  );
}

/** Linked steps rather than decorative cards, as the brief requires. */
function PathList({ paths }: { paths: Array<{ role: string; steps: Array<[string, string]> }> }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--dc-space-4)', margin: '24px 0' }}>
      {paths.map((p) => (
        <div
          key={p.role}
          style={{
            display: 'grid', gridTemplateColumns: 'minmax(110px, 140px) minmax(0, 1fr)', gap: 'var(--dc-space-5)',
            alignItems: 'center', padding: 'var(--dc-space-4) var(--dc-space-5)',
            background: 'var(--dc-surface-warm)',
            border: '1px solid var(--envision-t2-color-border-default-default)',
            borderRadius: 'var(--envision-t2-border-radius-container-md)',
          }}
          className="dc-path"
        >
          <strong>{p.role}</strong>
          <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--dc-space-2)', listStyle: 'none', margin: 0, padding: 0 }}>
            {p.steps.map(([label, to], i) => (
              <li key={to} style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-2)' }}>
                <Link to={to} style={{ fontSize: 'var(--envision-t1-font-size-14)' }}>{label}</Link>
                {i < p.steps.length - 1 && <span aria-hidden="true" style={{ color: 'var(--envision-t2-color-content-tertiary-default)' }}>→</span>}
              </li>
            ))}
          </ol>
        </div>
      ))}
      <style>{`@media (max-width: 720px){ .dc-path { grid-template-columns: minmax(0,1fr) !important; } }`}</style>
    </div>
  );
}

/* -------------------------------------------------------------- introduction */

export function Introduction() {
  return (
    <DocArticle
      trail={TRAIL('Introduction')}
      title="Introduction"
      lead="The Envision Design System provides the shared foundations, components, patterns, tooling, and guidance used to design and build consistent Envision experiences."
      toc={[
        { id: 'what', label: "What you'll find here" },
        { id: 'who', label: 'Who this is for' },
        { id: 'organized', label: 'How it is organized' },
        { id: 'where', label: 'Where implementation lives' },
        { id: 'next', label: 'Next steps' },
      ]}
      related={[
        { title: 'What is Envision?', to: '/get-started/what-is-envision', note: 'The longer answer.' },
        { title: 'How the system works', to: '/get-started/how-the-system-works', note: 'The technical path.' },
        { title: 'Components', to: '/components', note: 'What you will build with.' },
      ]}
      prev={{ title: 'Getting Started', to: '/get-started' }}
      next={{ title: 'What is the Envision Design System?', to: '/get-started/what-is-envision' }}
    >
      <h2 className="dc-h2" id="what">What you&rsquo;ll find here</h2>
      <p>
        Nine domains, each answering a different kind of question. They are not equally sized and are not meant to be
        read in order.
      </p>
      <DocGrid columns={3}>
        <DocCard to="/get-started" title="Getting Started">How to enter the system, by role.</DocCard>
        <DocCard to="/foundations" title="Foundations">The shared visual and behavioral decisions.</DocCard>
        <DocCard to="/tokens" title="Design Tokens">Those decisions encoded as data.</DocCard>
        <DocCard to="/components" title="Components">{system.counts.public} registered interface building blocks.</DocCard>
        <DocCard to="/patterns" title="Patterns">Recurring problems and their proven solutions.</DocCard>
        <DocCard to="/accessibility" title="Accessibility">What the system guarantees and what you own.</DocCard>
        <DocCard to="/content" title="Content">How Envision writes interface copy.</DocCard>
        <DocCard to="/tools" title="Resources">Libraries, packages and where to get help.</DocCard>
        <DocCard to="/governance" title="Governance">How the system changes over time.</DocCard>
      </DocGrid>

      <h2 className="dc-h2" id="who">Who this is for</h2>
      <p>
        Four audiences use this documentation differently, and knowing which one you are saves reading the wrong half.
      </p>
      <p>
        <strong>Designers</strong> spend most time in Foundations and Components, deciding which existing piece solves
        the problem in front of them. The most valuable skill this documentation can teach a designer is recognizing
        when a need is already met by something named differently.
      </p>
      <p>
        <strong>Developers</strong> live in Design Tokens and Storybook. Envision Design tells you which token
        layer to consume and why; Storybook tells you what the component's API actually is. Both matter, and neither
        substitutes for the other.
      </p>
      <p>
        <strong>Product teams</strong> mostly need Patterns. A product decision is rarely “which component” and almost
        always “how should this whole task work”, which is exactly what a pattern answers.
      </p>
      <p>
        <strong>Contributors</strong> need Governance and How the system works. Before proposing anything, understanding
        how a decision propagates is what separates a useful proposal from one that has to be reworked.
      </p>

      <h2 className="dc-h2" id="organized">How the documentation is organized</h2>
      <p>
        The structure mirrors how a decision actually travels. Each layer depends only on the layers beneath it, and
        two concerns cut across all of them.
      </p>
      <LayerStack
        alt={
          'Five layers, bottom to top: Foundations establish design decisions; Tokens encode those decisions; ' +
          'Components implement reusable UI; Patterns combine components into solutions; Product uses those ' +
          'solutions in real workflows. Accessibility and Content apply across every layer rather than sitting at ' +
          'the end, and Governance surrounds the whole stack.'
        }
        caption="Accessibility and Content cross the whole stack. Governance surrounds it. Neither is a final step."
        layers={[
          { label: 'Product', note: 'Real Envision workflows', tone: 'neutral' },
          { label: 'Patterns', note: 'Components combined into solutions', tone: 'neutral' },
          { label: 'Components', note: 'Reusable production UI', tone: 'abstract' },
          { label: 'Tokens', note: 'Decisions encoded as data', tone: 'abstract' },
          { label: 'Foundations', note: 'The decisions themselves', tone: 'active' },
        ]}
      />
      <Callout type="Note" title="Why accessibility is not the top layer">
        Drawing accessibility as a final layer implies it is applied after the fact. In Envision it is a property of
        each layer: contrast lives in Foundations, focus behavior in Components, and flow in Patterns.
      </Callout>

      <h2 className="dc-h2" id="where">Where implementation lives</h2>
      <p>Four surfaces, four jobs. Using the wrong one is the most common reason a question goes unanswered.</p>
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead>
            <tr>{['Surface', 'Owns', 'Go here for', 'Not for'].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              ['Envision Design', 'Guidance and ecosystem knowledge', 'When and why to use something', 'Exhaustive API reference'],
              ['Storybook', 'Executable component reference', 'Live states, controls, props', 'Deciding which component to use'],
              ['Figma', 'Design source', 'Variables, components, variants', 'Implementation truth'],
              ['Repository', 'Production implementation', 'Source, tests, token build', 'Learning the system'],
            ].map((r) => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} style={{ ...TD, fontWeight: i === 0 ? 600 : 400 }}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="dc-h2" id="next">Next steps</h2>
      <PathList
        paths={[
          { role: 'Designer', steps: [['Figma libraries', '/get-started/figma'], ['Foundations', '/foundations'], ['Components', '/components']] },
          { role: 'Developer', steps: [['Installation', '/get-started/installation'], ['Tokens', '/tokens'], ['Storybook', '/get-started/storybook']] },
          { role: 'Contributor', steps: [['How the system works', '/get-started/how-the-system-works'], ['Contributing', '/get-started/contributing']] },
        ]}
      />
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

/* ------------------------------------------------------- what is the system */

export function WhatIsEnvision() {
  return (
    <DocArticle
      trail={TRAIL('What is the Envision Design System?')}
      title="What is the Envision Design System?"
      lead="Envision is more than a component library. It is the shared language, architecture, implementation, and operating model used to create the Envision product ecosystem."
      toc={[
        { id: 'why', label: 'Why Envision needs a system' },
        { id: 'contains', label: 'What the system contains' },
        { id: 'more-than', label: 'More than a component library' },
        { id: 'parity', label: 'Design and code share a language' },
        { id: 'product', label: 'The system is itself a product' },
        { id: 'belongs', label: 'What belongs in the system' },
        { id: 'product-decision', label: 'What stays a product decision' },
      ]}
      related={[
        { title: 'How the system works', to: '/get-started/how-the-system-works', note: 'The mechanics behind the story.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'Where parity actually comes from.' },
        { title: 'Governance', to: '/governance', note: 'How the system is run.' },
      ]}
      prev={{ title: 'Introduction', to: '/get-started/introduction' }}
      next={{ title: 'Design system principles', to: '/get-started/principles' }}
    >
      <h2 className="dc-h2" id="why">Why Envision needs a system</h2>
      <p>
        Envision sells decisions. A buyer picks a cabinet style, a finish, a countertop, and each choice changes both a
        3D visualization and a price. The same selection interaction has to work for cabinets, flooring, countertops,
        backsplash, lighting and hardware, in a dashboard, in a Design Center, and on a phone in a showroom.
      </p>
      <p>Built without a system, that produces a predictable set of failures:</p>
      <ul>
        <li><strong>Inconsistent interface decisions.</strong> Six teams solve “choose one of these” six ways.</li>
        <li><strong>Duplicate implementation.</strong> The same swatch grid gets written repeatedly, each with its own defects.</li>
        <li><strong>Design and code drift.</strong> A green is nudged in Figma, and the product keeps the old one for a year.</li>
        <li><strong>Repeated accessibility work.</strong> Focus and keyboard behavior are re-solved per feature, badly.</li>
        <li><strong>Fragmented responsive behavior.</strong> Each surface invents its own breakpoint.</li>
        <li><strong>Unclear ownership.</strong> Nobody can change a shared thing without asking everybody.</li>
        <li><strong>Slower development.</strong> Every feature re-litigates decisions that were settled a year ago.</li>
      </ul>
      <p>
        None of these are aesthetic problems. They are the reason a design system is engineering infrastructure rather
        than a style guide.
      </p>

      <h2 className="dc-h2" id="contains">What the system contains</h2>
      <LayerStack
        alt={
          'The Envision stack, bottom to top: Foundations, Tokens, Components, Patterns, and Product experiences. ' +
          'Each layer consumes only the layers beneath it.'
        }
        layers={[
          { label: 'Product experiences', note: 'Dashboard, Design Center, selections', tone: 'neutral' },
          { label: 'Patterns', note: 'Selection, forms, navigation', tone: 'neutral' },
          { label: 'Components', note: `${system.counts.public} registered, ${system.counts.implemented} implemented`, tone: 'abstract' },
          { label: 'Tokens', note: `${system.counts.tokens} generated`, tone: 'abstract' },
          { label: 'Foundations', note: 'Color, type, spacing, layout', tone: 'active' },
        ]}
      />
      <p>Around that stack sit the tools that move decisions through it.</p>
      <ArchitectureDiagram
        alt={
          'Supporting tools by role. Source: the Figma library and the DTCG token source. Generated: the Style ' +
          'Dictionary build output as CSS and TypeScript. Consumer: the component package, Storybook, the ' +
          'Envision Design and Envision applications.'
        }
        groups={[
          { role: 'Source', note: 'Where decisions are authored.', items: ['Figma library', 'packages/tokens/src'] },
          { role: 'Generated', note: 'Produced by the build.', items: ['Style Dictionary output', 'CSS + TypeScript'] },
          { role: 'Consumer', note: 'What uses the output.', items: ['@envision/components', '@envision/storybook', 'Envision applications'] },
        ]}
      />

      <h2 className="dc-h2" id="more-than">More than a component library</h2>
      <p>
        A component library ships UI. It cannot tell you which component to pick, what to write inside it, whether it
        should still exist next year, or who decides. Those gaps are where products drift apart despite every team
        using the same library.
      </p>
      <p>
        Envision adds the parts that make components usable as a system: the <strong>decisions</strong> underneath them,
        the <strong>behavior</strong> they guarantee, the <strong>guidance</strong> on when to reach for each,
        <strong> accessibility</strong> built in rather than reviewed on, <strong>content</strong> rules so labels read
        consistently, and a <strong>governance</strong> and <strong>lifecycle</strong> model so change is possible
        without breaking everyone.
      </p>

      <h2 className="dc-h2" id="parity">Design and code share the same language</h2>
      <p>
        Parity is not achieved by discipline or by re-checking. It comes from both surfaces referencing the same named
        decision, so there is no second copy to fall out of date.
      </p>
      <p>
        A designer selects the variable <code>color/background/brand/default</code>. An engineer writes{' '}
        <Copyable text="var(--envision-t2-color-background-brand-default)" />. Neither states the value. Change it once
        and both move together, because there was only ever one decision.
      </p>

      <h2 className="dc-h2" id="product">The system is itself a product</h2>
      <p>
        It has users (designers and engineers), releases, defects, a backlog, an adoption curve and an owner. Treating
        it as a shared folder is how design systems stall: nothing can change, so teams route around it, and the
        duplication it existed to prevent returns.
      </p>
      <Callout type="Important" title="Where Envision actually is">
        Stated plainly: {system.counts.implemented} of {system.counts.public} registered components exist in code, and
        none are marked stable. <StatusBadge value="candidate" /> and <StatusBadge value="experimental" /> are the only
        maturity levels in use. This is a real system in early operation, not a finished one.
      </Callout>

      <h2 className="dc-h2" id="belongs">What belongs in the system?</h2>
      <p>
        The test is reuse across contexts, not usefulness. Something used in three places, by different teams, that
        behaves identically each time belongs in the system. Something used twice by the same team, differently each
        time, is a product component wearing a system costume.
      </p>
      <p>
        The full criteria live in the <Link to="/governance/contribution">contribution model</Link>. The short version:
        a new component must be reusable, not composable from what exists, durable beyond the current project, and
        owned by someone after the requester moves on.
      </p>

      <h2 className="dc-h2" id="product-decision">What remains a product decision?</h2>
      <p>
        The system supplies vocabulary, not sentences. It will not tell you what belongs on the dashboard, in what
        order a buyer should make decisions, or what happens when a selection is unavailable in their region.
      </p>
      <p>
        Product designers still own hierarchy, task flow, information architecture, context, business logic, and which
        pattern composition fits the problem. A system that tried to own those would be making product decisions
        without product knowledge.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ principles */

const PRINCIPLES = [
  {
    name: 'Reuse before reinvention',
    statement: 'Compose what exists before adding to the system.',
    means:
      'Every new component is a permanent maintenance cost and one more thing a designer has to know about. The ' +
      'default answer to a new need is composition, and the bar for adding is deliberately high.',
    matters:
      'A library nobody can hold in their head stops being a shared language. Growth has to be earned, because the ' +
      'cost of an unnecessary component is paid forever by everyone.',
    design: 'Search the component index before sketching. A need met by something named differently is still met.',
    engineering: 'A proposal that can be built from existing components is a pattern, not a component.',
    evidence:
      'The registry marks 18 entries as inventory only, designed but deliberately not implemented, rather than ' +
      'building everything that has been drawn.',
  },
  {
    name: 'Design and code reference the same decision',
    statement: 'Neither surface stores its own copy of a value.',
    means:
      'A Figma variable and a CSS custom property are two views of one decision, not two decisions kept in sync. ' +
      'Sync is a process that fails; a shared reference cannot drift.',
    matters:
      'Drift is invisible until it is expensive. When a green exists in two places, they diverge quietly and nobody ' +
      'knows which is correct.',
    design: 'Bind to variables rather than picking values, even when the value is obviously right.',
    engineering: 'Never hardcode a value that a token expresses, even a value that will “obviously never change”.',
    evidence:
      `All ${system.counts.tokens} generated tokens are produced from one source by the token build; the CSS and ` +
      'TypeScript outputs are generated, never hand-authored.',
  },
  {
    name: 'Accessibility is structural, not a review stage',
    statement: 'The system carries what it can guarantee, and says what it cannot.',
    means:
      'Semantics, keyboard mechanics, focus rings and non-color state live inside components, so they are correct ' +
      'by default rather than by inspection. What the system cannot know, such as an accessible name, is named as ' +
      'the consumer’s responsibility.',
    matters:
      'Anything left to per-feature review eventually gets skipped under deadline. Building it in is the only ' +
      'approach that survives.',
    design: 'Selection is a ring and a check, never color alone, because meaning must survive without hue.',
    engineering: 'Components render native elements so platform behavior is inherited rather than reimplemented.',
    evidence:
      'Component tests include accessibility assertions, and the registry records keyboard and ARIA behavior per ' +
      'component as part of its specification.',
  },
  {
    name: 'Responsive behavior belongs to the component',
    statement: 'A component knows how to adapt; the page should not have to teach it.',
    means:
      'Adaptation is part of a component’s contract, not something each screen re-solves. Where a component ' +
      'changes presentation at a breakpoint, it does so itself, using the same API.',
    matters:
      'When every page implements its own responsive rules, the same component behaves differently in different ' +
      'places, and the system stops being predictable.',
    design: 'Design the adapted state as a real state, not as an afterthought of the desktop layout.',
    engineering: 'The RightRail re-composes into a modal sheet below its breakpoint using the same element and API.',
    evidence:
      'A small set of semantic tokens is re-declared under a max-width 1024px media query, so components adapt ' +
      'without knowing a breakpoint exists.',
  },
  {
    name: 'Product context decides correctness',
    statement: 'A component is only right in the situation it was designed for.',
    means:
      'Envision’s constraints are specific: most on-screen color is product material, and choices carry prices. ' +
      'Guidance is written against those facts rather than against generic interface advice.',
    matters:
      'Generic guidance produces generically wrong interfaces. The reason selection avoids color fills is not a ' +
      'style preference, it is that the options are themselves colored.',
    design: 'Judge a decision beside real material samples, not on a white artboard.',
    engineering: 'Do not restyle product data. Material color is data the system must not own.',
    evidence:
      'MaterialSwatch takes its fill from product data passed as a property, and no token controls it.',
  },
  {
    name: 'Abstractions earn their complexity',
    statement: 'Add a layer only when it removes more work than it creates.',
    means:
      'Token layers, component tokens and templates all add indirection. Each is justified by a specific failure it ' +
      'prevents, and one that cannot name its failure does not get added.',
    matters:
      'Unjustified abstraction is the most common way a design system becomes harder to use than the duplication it ' +
      'replaced.',
    design: 'A new token group needs a reason a role does not already cover.',
    engineering: 'Component tokens exist to insulate a component from broad semantic changes, which is a real, nameable failure.',
    evidence:
      'The token architecture is four layers, not more, and Responsive is a parallel declaration rather than an ' +
      'additional alias tier.',
  },
];

export function Principles() {
  return (
    <DocArticle
      trail={TRAIL('Design system principles')}
      title="Design system principles"
      lead="Six principles, each derived from a decision the system has already made rather than from aspiration. Every one names the evidence in the repository that supports it."
      toc={PRINCIPLES.map((p, i) => ({ id: `p${i}`, label: p.name }))}
      related={[
        { title: 'What is Envision?', to: '/get-started/what-is-envision', note: 'Why the system exists at all.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'Parity in practice.' },
        { title: 'Accessibility', to: '/accessibility', note: 'The structural commitment.' },
      ]}
      prev={{ title: 'What is the Envision Design System?', to: '/get-started/what-is-envision' }}
      next={{ title: 'How the system works', to: '/get-started/how-the-system-works' }}
    >
      <Callout type="Note" title="Derived, not invented">
        These are written from observable behavior in the repository. Where a principle could not be defended from
        something the system actually does, it was left out rather than written aspirationally.
      </Callout>

      {PRINCIPLES.map((p, i) => (
        <section key={p.name}>
          <h2 className="dc-h2" id={`p${i}`}>{p.name}</h2>
          {/* The statement leads the section on its own weight. Boxed, it became a callout under
              every one of these headings, which is the treatment shouting on a page where nothing
              is unusual: each principle is simply the next principle. */}
          <p style={{
            fontSize: 'var(--envision-t1-font-size-18)',
            fontWeight: 'var(--envision-t1-font-weight-600)',
            margin: '0 0 16px',
            maxWidth: '72ch',
          }}>
            {p.statement}
          </p>
          <h3 className="dc-h3">What it means</h3>
          <p>{p.means}</p>
          <h3 className="dc-h3">Why it matters</h3>
          <p>{p.matters}</p>
          <h3 className="dc-h3">How it affects work</h3>
          <p><strong>Design.</strong> {p.design}</p>
          <p><strong>Engineering.</strong> {p.engineering}</p>
          <h3 className="dc-h3">Evidence in Envision</h3>
          <p className="dc-small">{p.evidence}</p>
        </section>
      ))}
    </DocArticle>
  );
}

/* ------------------------------------------------------- how the system works */

export function HowTheSystemWorks() {
  const brand = system.tokens.find((t) => t.name === '--envision-t2-color-primary-500')?.resolved ?? '#3a3835';
  return (
    <DocArticle
      trail={TRAIL('How the system works')}
      title="How the system works"
      lead="A design decision should be able to travel from the design source to production without losing its meaning. This page follows one decision the whole way."
      toc={[
        { id: 'pipeline', label: 'The pipeline' },
        { id: 'decision', label: '1. A design decision' },
        { id: 'token', label: '2. Represented as a token' },
        { id: 'layers', label: '3. Layers preserve meaning' },
        { id: 'build', label: '4. The build transforms it' },
        { id: 'components', label: '5. Components consume it' },
        { id: 'storybook', label: '6. Storybook inspects it' },
        { id: 'product', label: '7. Product uses it' },
        { id: 'source', label: 'Source vs generated' },
      ]}
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'The layers in detail.' },
        { title: 'Token reference', to: '/tokens/reference', note: 'Every generated token.' },
        { title: 'Storybook', to: '/get-started/storybook', note: 'The executable reference.' },
      ]}
      prev={{ title: 'Design system principles', to: '/get-started/principles' }}
      next={{ title: 'Designers: getting started', to: '/get-started/designers' }}
    >
      <h2 className="dc-h2" id="pipeline">The pipeline</h2>
      {/* Seven steps on one line gave each box about 66px inside the article column, which broke the
          labels to one word per line and ran them into the arrows. Split across two rows on the same
          four tracks, so the two rows align and each step keeps a readable width. The dashed
          Components-to-Storybook relationship sits inside the second row, so it survives the split. */}
      <div style={{ display: 'grid', gap: 'var(--dc-space-3)', margin: '28px 0' }}>
        <Pipeline
          flush
          tracks={4}
          alt={
            'The first four stages: Figma variables as the design source, a DTCG-compatible token source, ' +
            'the Style Dictionary build, and the generated CSS and TypeScript.'
          }
          steps={[
            { label: 'Figma variables', note: 'The design source', tone: 'active' },
            { label: 'Token source', note: 'DTCG-compatible JSON', tone: 'abstract' },
            { label: 'Style Dictionary', note: 'The build', tone: 'neutral' },
            { label: 'CSS + TypeScript', note: 'Generated output', tone: 'abstract' },
          ]}
        />
        <Pipeline
          flush
          tracks={4}
          alt={
            'The remaining three stages: Envision components consume the generated output, Storybook inspects ' +
            'that implementation, and the Envision product is the result. Storybook is a reference relationship ' +
            'rather than a transformation, shown with a dashed arrow.'
          }
          caption="Six transformations and one reference relationship. Storybook observes the components; it does not change them."
          steps={[
            { label: 'Components', note: 'Consume the output', tone: 'active' },
            { label: 'Storybook', note: 'Inspect implementation', tone: 'neutral', dashedFromPrevious: true },
            { label: 'Product', note: 'Envision applications', tone: 'active' },
          ]}
        />
      </div>

      <h2 className="dc-h2" id="decision">1. A design decision begins in Figma</h2>
      <p>
        Someone decides Envision's primary action color is a deep green. That is a judgment about the brand, not a
        hex code: the decision is “this is the color of committing to something”, and <code>{brand}</code> is only its
        current expression.
      </p>
      <p>
        In Figma this is stored as a variable in a collection rather than as a fill on a layer. That difference is the
        whole reason the rest of the pipeline is possible: a fill is a value on one object, a variable is a decision
        many objects can reference.
      </p>

      <h2 className="dc-h2" id="token">2. The decision is represented as a token</h2>
      <p>
        The same decision leaves Figma as a token: a name, a type and a value. The name is the durable part. A value
        answers “what color”; a name answers “what for”, and only the second survives a rebrand.
      </p>
      <CodeBlock
        language="json"
        filename="packages/tokens/src/semantic.tokens.json (excerpt)"
        code={`"background": {\n  "brand": {\n    "default": {\n      "$type": "color",\n      "$value": "{envision.t2.color.primary.500}"\n    }\n  }\n}`}
      />
      <p>
        Note the value is a reference, not a color. The decision points at another decision, which is what lets the
        chain be inspected later.
      </p>

      <h2 className="dc-h2" id="layers">3. Layers preserve the reasoning</h2>
      <p>
        Four layers, each answering one question. The chain below is real and generated from the token build.
      </p>
      <LayerStack
        alt="Four layers: Primitive holds raw values such as the neutral ramp; Brand supplies the active builder's colors; Semantic states what a color is for; Component scopes it to one component."
        layers={[
          { label: 'Component', note: '--envision-t3-button-primary-color-background-default', tone: 'active' },
          { label: 'Semantic', note: '--envision-t2-color-background-brand-default', tone: 'abstract' },
          { label: 'Brand', note: `--envision-t2-color-primary-500 = ${brand} (per theme)`, tone: 'abstract' },
          { label: 'Primitive', note: '--envision-t1-color-neutral-800 (neutrals, invariant)', tone: 'neutral' },
        ]}
      />

      <h2 className="dc-h2" id="build">4. The build transforms tokens for each platform</h2>
      <p>
        Style Dictionary reads the token source and writes one output per platform. It is a transformer, not a source:
        deleting its output changes nothing permanent, because the next build recreates it.
      </p>
      <p>
        The build preserves references rather than flattening them, which is why the generated CSS still shows the
        chain instead of collapsing every token to a literal color.
      </p>
      <CodeBlock
        language="css"
        filename="packages/tokens/dist/tokens.css (generated)"
        code={`--envision-t2-color-primary-500: ${brand};   /* supplied by the active theme */\n--envision-t2-color-background-brand-default: var(--envision-t2-color-primary-500);\n--envision-t3-button-primary-color-background-default: var(--envision-t2-color-background-brand-default);`}
      />

      <h2 className="dc-h2" id="components">5. Components consume system decisions</h2>
      <p>
        A component references its own token and never a value. Nothing in Button's source mentions a color, which is
        why a brand change reaches it without anyone editing it.
      </p>
      <CodeBlock
        language="css"
        filename="packages/components/src/button/Button.ts (excerpt)"
        code={`:host([variant='primary']) .btn {\n  background: var(--envision-t3-button-primary-color-background-default);\n  color: var(--envision-t3-button-primary-color-content-default);\n}`}
      />
      <LivePreview caption="The end of the chain: a real Button, resolving through four token layers.">
        <envision-button variant="primary" label="Apply design" />
      </LivePreview>

      <h2 className="dc-h2" id="storybook">6. Storybook makes implementation inspectable</h2>
      <p>
        Storybook renders the same components with controls, so an engineer can exercise every supported state without
        building a page. It is a reference view of the implementation rather than another implementation, which is why
        it appears with a dashed arrow above.
      </p>
      <p>
        <a href={system.storybookUrl} target="_blank" rel="noreferrer">Open the Envision Storybook ↗</a>
      </p>

      <h2 className="dc-h2" id="product">7. Product teams consume the result</h2>
      <p>
        By the time a decision reaches the product, it has been through four layers and a build, and none of that is
        visible in the product code. That is the point: the application composes components, and the decisions arrive
        with them.
      </p>
      <ProductExample
        title="Design Center · right rail"
        surface={<DesignCenterRail />}
        annotations={[
          'The commit action resolves through the full token chain shown above.',
          'Tabs, option rows and the total are all system components.',
          'No color, radius or spacing value appears in the product code.',
          'A brand change would reach every element here without touching this composition.',
        ]}
        caption="Real production components in the product's own arrangement."
      />

      <h2 className="dc-h2" id="source">What is source and what is generated?</h2>
      <p>
        This is the distinction most worth remembering, because getting it wrong fails silently: editing generated
        output appears to work and is destroyed by the next build.
      </p>
      <ArchitectureDiagram
        alt={
          'Three roles. Source is edited by hand: the Figma variable collections and the token source JSON. ' +
          'Generated is produced by the build and must never be edited: tokens.css, tokens.js and tokens.d.ts. ' +
          'Consumers import the generated output: the component package, Storybook and Envision applications.'
        }
        caption="Anything in the Generated row is rewritten by the next build. To change it, edit the Source row and rebuild."
        groups={[
          { role: 'Source', note: 'Edited by hand.', items: ['Figma variable collections', 'packages/tokens/src/*.tokens.json'] },
          { role: 'Generated', note: 'Produced by the build.', items: ['dist/tokens.css', 'dist/tokens.js', 'dist/tokens.d.ts'] },
          { role: 'Consumer', note: 'Imports the output.', items: ['@envision/components', '@envision/storybook', 'Envision applications'] },
        ]}
      />
      <Callout type="Developer" title="How to tell at a glance">
        Every generated file begins with a comment saying it was auto-generated. If you see that header, your edit will
        not survive.
      </Callout>
    </DocArticle>
  );
}
