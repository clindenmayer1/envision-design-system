import { Callout, DocCard, DocGrid, SectionIntro, StatusBadge } from '../modules';
import { GravityDots } from '../modules/artwork';
import { Pipeline, ProcessDiagram } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { DocArticle, SectionLanding } from '../templates';
import { GOVERNANCE_ORDER, sectionNav } from './sections';
import { system } from '../data/generated';

const { seq, trail } = sectionNav(GOVERNANCE_ORDER, 'Governance', '/governance');

/** A review checklist rendered identically everywhere one appears. */
function Checklist({ items }: { items: Array<[string, string]> }) {
  return (
    <ScrollTable head={['Check', 'What good looks like']}>
      {items.map((r) => (
        <tr key={r[0]}>
          <td style={{ ...TABLE_CELL, fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
          <td style={TABLE_CELL}>{r[1]}</td>
        </tr>
      ))}
    </ScrollTable>
  );
}

const RECOMMENDED = (
  <Callout type="Important" title="Recommended model, not current organizational policy">
    No formal ownership, review board or approval authority is recorded in this repository. What follows is a
    recommended operating model derived from how the system is actually built. It is labeled as a recommendation so
    it is not mistaken for an established organizational fact.
  </Callout>
);

/** The contribution lifecycle, in order. Drawn on the landing page and named in the model. */
const LIFECYCLE = ['Need', 'Proposal', 'Review', 'Build', 'Test', 'Document', 'Release', 'Adopt', 'Maintain'];

/* ------------------------------------------------------------------ landing */

export function GovernanceLanding() {
  const candidate = system.components.filter((c) => c.maturity === 'candidate').length;
  const experimental = system.components.filter((c) => c.maturity === 'experimental').length;
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Governance' }]}
      title="Governance"
        media={<GravityDots />}
      lead="Governance defines how Envision system decisions are proposed, evaluated, implemented, released, adopted, and maintained over time."
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'The full lifecycle.' },
        { title: 'Components', to: '/components', note: 'Current status of everything.' },
        { title: 'Resources', to: '/tools', note: 'Packages and release state.' },
      ]}
      next={{ title: 'How the system is maintained', to: '/governance/maintenance' }}
      intro={
        <SectionIntro
          stacked
          heading="A system nobody can change becomes a bottleneck"
          body="Governance exists so change is possible without chaos: who decides, what gets reviewed, and how a decision reaches the products that depend on it."
          cta={{ label: 'Read the contribution model', to: '/governance/contribution' }}
          visual={
            /* The lifecycle reads as one ribbon, the same shape the landing page uses for the
               design-to-production flow. Stacked, the module is wide enough to carry all nine
               steps on a single line. */
            <Pipeline
              chevron
              flush
              alt={
                'The contribution lifecycle runs through nine steps in order: Need, Proposal, Review, '
                + 'Build, Test, Document, Release, Adopt, and Maintain.'
              }
              steps={LIFECYCLE.map((label) => ({ label, tone: 'info' as const }))}
            />
          }
        />
      }
      grid={
        <>
          <DocGrid columns={4}>
            <DocCard to="/governance/maintenance" title="How it is maintained">The system as a product.</DocCard>
            <DocCard to="/governance/ownership" title="Ownership">Who owns what, recommended.</DocCard>
            <DocCard to="/governance/contribution" title="Contribution model">Fourteen stages, by contribution type.</DocCard>
            <DocCard to="/governance/requesting-a-component" title="Requesting a component">The proposal fields.</DocCard>
            <DocCard to="/governance/design-review" title="Design review">System fit and duplication.</DocCard>
            <DocCard to="/governance/engineering-review" title="Engineering review">API, tests, compatibility.</DocCard>
            <DocCard to="/governance/lifecycle" title="Component lifecycle">What each status means.</DocCard>
            <DocCard to="/governance/adoption" title="Adoption">What can be measured today.</DocCard>
          </DocGrid>
          <Callout type="Important" title="Where Envision actually is">
            {candidate} components are <StatusBadge value="candidate" /> and {experimental} are{' '}
            <StatusBadge value="experimental" />. None is stable. {system.counts.implemented} of{' '}
            {system.counts.public} exist in code, all {system.packages.length} packages are private at 0.1.0, and
            nothing has been released. The system is real and early.
          </Callout>
        </>
      }
    />
  );
}

/* -------------------------------------------------------------- maintenance */

export function Maintenance() {
  return (
    <DocArticle
      trail={trail('How the system is maintained')}
      title="How the system is maintained"
      lead="A design system is a product with users, defects, releases and an adoption curve. Treating it as a shared folder is how it stalls."
      toc={[
        { id: 'product', label: 'The system as a product' },
        { id: 'truth', label: 'Sources of truth' },
        { id: 'work', label: 'The kinds of maintenance work' },
        { id: 'health', label: 'System health' },
      ]}
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'How change enters.' },
        { title: 'Adoption', to: '/governance/adoption', note: 'What can be measured.' },
        { title: 'Component lifecycle', to: '/governance/lifecycle', note: 'How things retire.' },
      ]}
      {...seq('/governance/maintenance')}
    >
      <h2 className="dc-h2" id="product">The system as a product</h2>
      <p>
        Envision has users (designers and engineers), a backlog, defects, documentation and consumers who depend on it
        not breaking. Every property of a product applies, including that neglect is invisible until adoption drops.
      </p>

      <h2 className="dc-h2" id="truth">Sources of truth</h2>
      <ScrollTable head={['Concern', 'Source of truth', 'Everything else is']}>
        {[
          ['Design decisions', 'Figma variable collections', 'A representation'],
          ['Token values', 'packages/tokens/src/*.tokens.json', 'Generated output'],
          ['Component inventory', 'component-registry.json', 'Derived: this site, Storybook titles, the verifier'],
          ['Component behavior', 'packages/components/src', 'Documentation of it'],
          ['Component API', 'Storybook', 'Guidance about it'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[1]}</code></td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        This matters operationally. The registry is not a document about the system; it is the system's inventory, and
        Storybook titles, this site's navigation and the taxonomy verifier all derive from it.
      </p>

      <h2 className="dc-h2" id="work">The kinds of maintenance work</h2>
      <ul>
        <li><strong>Defects.</strong> A component not behaving as documented. Highest priority, lowest ceremony.</li>
        <li><strong>Enhancements.</strong> An existing component needs to do more.</li>
        <li><strong>Documentation.</strong> Guidance that is wrong, missing or unclear. Cheapest contribution with the widest effect.</li>
        <li><strong>Foundations and tokens.</strong> Highest blast radius; smallest diffs.</li>
        <li><strong>Deprecation.</strong> Removing what is no longer right, which almost never happens without a process forcing it.</li>
      </ul>

      <h2 className="dc-h2" id="health">System health</h2>
      <p>
        Health is not component count. A system with forty components and eight consumers is less healthy than one with
        twelve components used everywhere. What matters is whether teams reach for the system by default, which is what
        the <a href="/governance/adoption">Adoption</a> page tries to measure.
      </p>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- ownership */

export function Ownership() {
  return (
    <DocArticle
      trail={trail('Ownership & responsibilities')}
      title="Ownership &amp; responsibilities"
      lead="Who decides what. Stated as a recommended operating model, because no formal ownership is recorded in this repository."
      toc={[
        { id: 'roles', label: 'Roles' },
        { id: 'matrix', label: 'Responsibility matrix' },
        { id: 'principle', label: 'The underlying principle' },
      ]}
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'How decisions are made.' },
        { title: 'Design review', to: '/governance/design-review', note: 'What design owns.' },
        { title: 'Engineering review', to: '/governance/engineering-review', note: 'What engineering owns.' },
      ]}
      {...seq('/governance/ownership')}
    >
      {RECOMMENDED}

      <h2 className="dc-h2" id="roles">Roles</h2>
      <p>Roles, not people. A role may be one person wearing several hats, which is normal at this stage.</p>
      <ScrollTable head={['Role', 'Accountable for']}>
        {[
          ['System owner', 'The system as a product: scope, coherence, the decision to add or retire'],
          ['Product designer', 'Using the system correctly, and raising what it cannot express'],
          ['Engineer', 'Implementation, tests, API shape, backwards compatibility'],
          ['Accessibility reviewer', 'Semantics, keyboard, focus, contrast, state communication'],
          ['Product team', 'Adoption, migration, and evidence from real use'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="matrix">Responsibility matrix</h2>
      <p><strong>D</strong> decides · <strong>C</strong> consulted · <strong>I</strong> informed</p>
      <ScrollTable head={['Area', 'System owner', 'Design', 'Engineering', 'Accessibility', 'Product']}>
        {[
          ['Foundations', 'D', 'C', 'C', 'C', 'I'],
          ['Tokens', 'D', 'C', 'C', 'I', 'I'],
          ['Components', 'D', 'C', 'C', 'C', 'C'],
          ['Patterns', 'D', 'C', 'I', 'C', 'C'],
          ['Accessibility', 'C', 'C', 'C', 'D', 'I'],
          ['Content', 'D', 'C', 'I', 'C', 'C'],
          ['Documentation', 'D', 'C', 'C', 'C', 'I'],
          ['Releases', 'D', 'I', 'C', 'I', 'I'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            {r.slice(1).map((c, i) => (
              <td key={i} style={{ ...TABLE_CELL, textAlign: 'center', fontWeight: c === 'D' ? 700 : 400 }}>{c}</td>
            ))}
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="principle">The underlying principle</h2>
      <p>
        Decisions belong with whoever bears their consequences over time. The system owner decides what enters the
        system because they maintain it afterwards. Accessibility decides accessibility because a wrong call there is
        not a matter of taste.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------- requesting a component */

export function RequestingAComponent() {
  return (
    <DocArticle
      trail={trail('Requesting a component')}
      title="Requesting a component"
      lead="New components carry permanent maintenance cost, so the bar is high and the proposal has to do real work. Most good requests end as a pattern instead, which is a success."
      toc={[
        { id: 'before', label: 'Before you propose' },
        { id: 'fields', label: 'Proposal fields' },
        { id: 'criteria', label: 'Evaluation criteria' },
        { id: 'outcomes', label: 'Possible outcomes' },
      ]}
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'The full path.' },
        { title: 'Components', to: '/components', note: 'Check what exists.' },
        { title: 'Patterns', to: '/patterns', note: 'The usual better answer.' },
      ]}
      {...seq('/governance/requesting-a-component')}
    >
      <h2 className="dc-h2" id="before">Before you propose</h2>
      <p>
        Search the component index and the pattern library. A large share of proposals describe something that exists
        under a name the proposer did not think to search for.
      </p>

      <h2 className="dc-h2" id="fields">Proposal fields</h2>
      <ScrollTable head={['Field', 'What it must answer']}>
        {[
          ['User problem', 'What was someone trying to do, and what got in the way? Describe the problem, not your solution.'],
          ['Existing solutions reviewed', 'Which components and patterns you checked.'],
          ['Why they are insufficient', 'Specifically what fails, not that it felt wrong.'],
          ['Product evidence', 'Where this appears. Screenshots or links from real work.'],
          ['Reuse potential', 'How many contexts and teams would use it. One caller is a product component.'],
          ['Proposed behavior', 'What it does, and what it deliberately does not.'],
          ['Variants and states', 'Which differences are supported, and which are not.'],
          ['Responsive behavior', 'What happens as space runs out.'],
          ['Accessibility considerations', 'Semantics, keyboard, focus, state communication.'],
          ['Content needs', 'What text it carries and who writes it.'],
          ['Engineering considerations', 'Anything unusual: async data, portals, third-party dependencies.'],
          ['Requester and context', 'Who is asking, for which product work, by when.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The field that most often decides the outcome is <strong>product evidence</strong>. One occurrence is a product
        need; three divergent solutions to the same problem is a system need.
      </p>

      <h2 className="dc-h2" id="criteria">Evaluation criteria</h2>
      <ul>
        <li><strong>Reuse.</strong> Would at least two or three distinct contexts use it, behaving identically?</li>
        <li><strong>Composition.</strong> Can existing components already solve it? If so, it is a pattern.</li>
        <li><strong>Durability.</strong> Will it still be needed after the current project ships?</li>
        <li><strong>Ownership.</strong> Is someone accountable once the requester moves on?</li>
        <li><strong>Coherence.</strong> Does it fit the taxonomy, or does it need a new category to exist?</li>
      </ul>

      <h2 className="dc-h2" id="outcomes">Possible outcomes</h2>
      <ScrollTable head={['Outcome', 'Means']}>
        {[
          ['Accepted', 'Enters design exploration and the full review path.'],
          ['Converted to a pattern', 'Composable from what exists; documented as guidance instead.'],
          ['Deferred', 'Real, but not yet enough evidence. Revisit when it recurs.'],
          ['Declined', 'Better solved in the product. The reasoning is recorded.'],
          ['Already exists', 'The most common outcome, and the fastest.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>
    </DocArticle>
  );
}

/* --------------------------------------------------------- proposing a change */

export function ProposingAChange() {
  return (
    <DocArticle
      trail={trail('Proposing a change')}
      title="Proposing a change"
      lead="Not every change needs the same scrutiny. What determines the review is blast radius, not diff size."
      toc={[
        { id: 'types', label: 'Change types' },
        { id: 'radius', label: 'Blast radius, not diff size' },
        { id: 'breaking', label: 'What counts as breaking' },
      ]}
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'The full path.' },
        { title: 'Versioning', to: '/governance/versioning', note: 'How changes are numbered.' },
        { title: 'Deprecation', to: '/governance/deprecation', note: 'Removing things safely.' },
      ]}
      {...seq('/governance/proposing-a-change')}
    >
      <h2 className="dc-h2" id="types">Change types</h2>
      <ScrollTable head={['Type', 'Example', 'Reviews required']}>
        {[
          ['Documentation', 'A correction or a clearer explanation', 'None for a correction; design if it changes a rule'],
          ['Token', 'A value or a new alias', 'Design + engineering, plus migration thinking'],
          ['Visual', 'A component looks different', 'Design + accessibility if contrast or state is affected'],
          ['Behavior', 'A component acts differently', 'Design + engineering + accessibility'],
          ['API', 'A prop is added, renamed or removed', 'Engineering, plus a compatibility plan'],
          ['Accessibility fix', 'Correcting semantics or keyboard behavior', 'Accessibility + engineering; usually expedited'],
          ['Breaking', 'Consumers must change code to adopt', 'All three, plus migration guidance'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="radius">Blast radius, not diff size</h2>
      <ul>
        <li><strong>Diff size:</strong> How big the code change is, five lines against five hundred.</li>
        <li><strong>Blast radius:</strong> How many things could break or behave differently because of it.</li>
      </ul>
      <p>
        The two rarely match, which is why the second decides the review and the first does not. A token change is
        often one line and reaches everything that references it. A new component variant may be hundreds of lines
        and affect nobody until someone opts in. The first needs more review than the second.
      </p>

      <h2 className="dc-h2" id="breaking">What counts as breaking</h2>
      <ul>
        <li>Removing or renaming a prop, attribute, event or export.</li>
        <li>Changing a default in a way that alters existing rendering.</li>
        <li>Removing a token, or changing what one means rather than what it resolves to.</li>
        <li>Changing semantics: a different element, role or keyboard behavior.</li>
        <li>Removing a component or a supported state.</li>
      </ul>
      <p>
        Changing a token's <em>value</em> is not breaking. That is the entire point of the token architecture: the
        contract is the name.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ reviews */

export function DesignReview() {
  return (
    <DocArticle
      trail={trail('Design review')}
      title="Design review"
      lead="Design review asks whether the thing belongs in the system at all, and whether it is built the way the system builds things."
      toc={[{ id: 'checklist', label: 'Checklist' }, { id: 'question', label: 'The question behind it' }]}
      related={[
        { title: 'Engineering review', to: '/governance/engineering-review', note: 'Can it be maintained?' },
        { title: 'Accessibility review', to: '/governance/accessibility-review', note: 'Can everyone use it?' },
        { title: 'Foundations', to: '/foundations', note: 'What it must inherit.' },
      ]}
      {...seq('/governance/design-review')}
    >
      {RECOMMENDED}
      <h2 className="dc-h2" id="checklist">Checklist</h2>
      <Checklist
        items={[
          ['Problem clarity', 'The user problem is stated without reference to a proposed solution'],
          ['Existing solutions', 'Components and patterns were checked, and why they fail is specific'],
          ['Reuse', 'At least two or three distinct contexts, behaving identically'],
          ['Anatomy', 'Every structural part is named and has one responsibility'],
          ['States', 'Every supported state is designed, including disabled and error'],
          ['Variants', 'Differences are expressed as properties, not as separate designs'],
          ['Responsive behavior', 'The adapted state is designed, not implied'],
          ['Token use', 'Bound to variables. No values picked by eye'],
          ['Content', 'Labels and messages are written, not lorem'],
          ['Accessibility', 'State is not color-only; focus and keyboard expectations are stated'],
          ['Product context', 'Shown in a real Envision arrangement, not on a blank artboard'],
          ['Figma construction', 'Component properties rather than detached variants'],
        ]}
      />

      <h2 className="dc-h2" id="question">The question behind it</h2>
      <p>
        Not “is this good design” but “is this a system decision”. A beautiful component solving a problem one team has
        once fails this review, and that is the review working.
      </p>
    </DocArticle>
  );
}

export function EngineeringReview() {
  return (
    <DocArticle
      trail={trail('Engineering review')}
      title="Engineering review"
      lead="Engineering review asks whether this can be maintained: whether the API will survive contact with real products, and whether a future change will be safe."
      toc={[{ id: 'checklist', label: 'Checklist' }, { id: 'api', label: 'API shape' }]}
      related={[
        { title: 'Using tokens in components', to: '/tokens/using-tokens', note: 'Token consumption rules.' },
        { title: 'Accessibility testing', to: '/accessibility/testing', note: 'What must pass.' },
        { title: 'Components', to: '/components', note: 'Existing architecture.' },
      ]}
      {...seq('/governance/engineering-review')}
    >
      {RECOMMENDED}
      <h2 className="dc-h2" id="checklist">Checklist</h2>
      <Checklist
        items={[
          ['Architecture', 'A Web Component extending the shared base, consistent with existing components'],
          ['API', 'Attributes for primitives, properties for objects, events for output'],
          ['Semantics', 'Renders the native element that matches its role'],
          ['Tokens', 'No raw values. Component tokens only where divergence is real'],
          ['React adapter', 'Exported from @envision/react where a React surface needs it'],
          ['Tests', 'Behavior and accessibility assertions, plus a visual baseline'],
          ['Accessibility', 'Keyboard, focus, ARIA state, disabled behavior'],
          ['Responsive behavior', 'Adapts without the consumer writing a media query'],
          ['Compatibility', 'Additive by default; breaking changes have a migration plan'],
          ['Performance', 'No layout thrash; no unnecessary work on every render'],
          ['Storybook', 'A default story with controls, and states that controls cannot reach'],
          ['Registry entry', 'Category, maturity, purpose, states, keyboard and ARIA recorded'],
          ['Documentation', 'An Envision Design page generated from the registry entry'],
        ]}
      />

      <h2 className="dc-h2" id="api">API shape</h2>
      <p>
        The rule that prevents most later pain: attributes carry primitives, properties carry objects, events carry
        output. MaterialSwatch's <code>option</code> is a property because an attribute would stringify it to{' '}
        <code>[object Object]</code>.
      </p>
    </DocArticle>
  );
}

export function AccessibilityReview() {
  return (
    <DocArticle
      trail={trail('Accessibility review')}
      title="Accessibility review"
      lead="Accessibility review happens before implementation is finished, not after. Retrofitting semantics is far more expensive than choosing the right element."
      toc={[{ id: 'checklist', label: 'Checklist' }, { id: 'when', label: 'When it happens' }]}
      related={[
        { title: 'Testing requirements', to: '/accessibility/testing', note: 'How to verify.' },
        { title: 'Focus management', to: '/accessibility/focus', note: 'The hardest item.' },
        { title: 'Screen readers', to: '/accessibility/screen-readers', note: 'Name, role, state.' },
      ]}
      {...seq('/governance/accessibility-review')}
    >
      {RECOMMENDED}
      <h2 className="dc-h2" id="checklist">Checklist</h2>
      <Checklist
        items={[
          ['Semantic element', 'A native element matching the role, not a div with ARIA'],
          ['Accessible name', 'Required where there is no visible text; never optional'],
          ['Keyboard', 'Every action reachable; grouped controls are one tab stop'],
          ['Focus', 'Visible ring; focus moved and restored around overlays'],
          ['Screen reader', 'Name, role and state announced; verified with a real reader'],
          ['Contrast', 'Text and non-text, including the focus ring on every surface'],
          ['State communication', 'Never color alone; a programmatic equivalent exists'],
          ['Zoom and reflow', 'Usable at 200% with no horizontal page scrolling'],
          ['Reduced motion', 'Honored; nothing meaningful is lost when motion is off'],
          ['Errors', 'Associated with their field and announced'],
          ['Touch targets', 'Not reduced at narrow widths, where touch is most likely'],
        ]}
      />

      <h2 className="dc-h2" id="when">When it happens</h2>
      <p>
        Before implementation is complete. Semantics and keyboard model are architectural: discovering at the end that
        a control should have been a native button is a rewrite, not a fix.
      </p>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- lifecycle */

export function Lifecycle() {
  const candidate = system.components.filter((c) => c.maturity === 'candidate').length;
  const experimental = system.components.filter((c) => c.maturity === 'experimental').length;
  return (
    <DocArticle
      trail={trail('Component lifecycle')}
      title="Component lifecycle"
      lead="What a component's status tells you about whether to depend on it."
      toc={[
        { id: 'actual', label: 'Statuses actually in use' },
        { id: 'proposed', label: 'The full recommended lifecycle' },
        { id: 'meaning', label: 'What each status means for you' },
      ]}
      related={[
        { title: 'Components', to: '/components', note: 'Current status of everything.' },
        { title: 'Deprecation', to: '/governance/deprecation', note: 'The end of the lifecycle.' },
        { title: 'Versioning', to: '/governance/versioning', note: 'How change is signaled.' },
      ]}
      {...seq('/governance/lifecycle')}
    >
      <h2 className="dc-h2" id="actual">Statuses actually in use</h2>
      <Callout type="Important" title="Two statuses exist in the registry, not five">
        The registry records only <StatusBadge value="candidate" /> and <StatusBadge value="experimental" />. There is
        no stable, deprecated or removed component, and no recorded promotion criteria. The five-stage lifecycle below
        is a <strong>recommended</strong> model, clearly separated from what the registry currently encodes.
      </Callout>
      <ScrollTable head={['Status', 'Count', 'In practice']}>
        {[
          ['candidate', String(candidate), 'Implemented and in use, but the API may still change'],
          ['experimental', String(experimental), 'Specified or early; do not depend on it without checking'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={TABLE_CELL}><StatusBadge value={r[0]} /></td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="proposed">The full recommended lifecycle</h2>
      <ProcessDiagram
        alt="A recommended five-stage lifecycle: proposed, experimental, stable, deprecated, removed."
        stages={[
          { name: 'Proposed', detail: 'Accepted in principle. Nothing to consume yet.' },
          { name: 'Experimental', detail: 'Built and usable, but the API may change without a major version.' },
          { name: 'Stable', detail: 'The API is a commitment. Breaking changes require a major version and migration guidance.' },
          { name: 'Deprecated', detail: 'Still works, with a named replacement and a migration path. Do not adopt.' },
          { name: 'Removed', detail: 'Gone. Only after a grace period in which the deprecation was visible.' },
        ]}
      />

      <h2 className="dc-h2" id="meaning">What each status means for you</h2>
      <ScrollTable head={['Status', 'Safe to adopt?', 'Change expectation', 'Support']}>
        {[
          ['Proposed', 'Nothing to adopt', 'Everything may change', 'None'],
          ['Experimental', 'For new work, with awareness', 'API may change in a minor release', 'Best effort'],
          ['Stable', 'Yes', 'Breaking changes only in a major release', 'Full'],
          ['Deprecated', 'No. Migrate away', 'Frozen except critical fixes', 'Migration help only'],
          ['Removed', 'No longer exists', 'N/A', 'None'],
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
        Every component page shows its actual registry status, and states plainly when a component is specified but not
        implemented. That is the honest signal to act on today.
      </p>
    </DocArticle>
  );
}

/* --------------------------------------------------------------- versioning */

export function Versioning() {
  return (
    <DocArticle
      trail={trail('Versioning')}
      title="Versioning"
      lead="What a version number would tell you, and what the current numbers actually tell you, which is almost nothing."
      toc={[
        { id: 'current', label: 'Current state' },
        { id: 'semver', label: 'Semantic versioning, recommended' },
        { id: 'breaking', label: 'What would be breaking' },
      ]}
      related={[
        { title: 'Proposing a change', to: '/governance/proposing-a-change', note: 'Change types.' },
        { title: 'Releases', to: '/governance/releases', note: 'How versions ship.' },
        { title: 'Code packages', to: '/tools/packages', note: 'Current versions.' },
      ]}
      {...seq('/governance/versioning')}
    >
      <h2 className="dc-h2" id="current">Current state</h2>
      <Callout type="Important" title="No versioning policy is implemented">
        All {system.packages.length} packages are <code>private: true</code> at <code>0.1.0</code>, and none has been
        published or versioned beyond its initial value. There is no changelog, no release tag history and no recorded
        versioning policy. The numbers currently carry no information.
      </Callout>

      <h2 className="dc-h2" id="semver">Semantic versioning, recommended</h2>
      <p>
        Semantic versioning is the conventional answer and is what this documentation recommends. It is a{' '}
        <strong>recommendation</strong>, not a recorded Envision policy.
      </p>
      <ScrollTable head={['Part', 'Increment when', 'Consumer action']}>
        {[
          ['Major', 'A change breaks existing usage', 'Read the migration guidance before upgrading'],
          ['Minor', 'Something is added, nothing breaks', 'Safe to adopt; new capability available'],
          ['Patch', 'A defect is fixed with no API change', 'Safe to adopt; should be automatic'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The version below 1.0.0 is itself meaningful: it signals that the API is not yet a commitment, which matches a
        registry in which nothing is stable.
      </p>

      <h2 className="dc-h2" id="breaking">What would be breaking</h2>
      <ul>
        <li>Removing or renaming a prop, attribute, event or export.</li>
        <li>Changing a default in a way that alters existing rendering.</li>
        <li>Removing a token or changing what it means.</li>
        <li>Changing an element, role or keyboard behavior.</li>
        <li>Removing a component or a supported state.</li>
      </ul>
      <p>
        Changing a token's resolved value is <strong>not</strong> breaking. The name is the contract; the value is an
        implementation detail. That distinction is the return on the token architecture.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------- deprecation */

export function Deprecation() {
  return (
    <DocArticle
      trail={trail('Deprecation')}
      title="Deprecation"
      lead="Removing something safely takes longer than adding it. A system that cannot retire anything accumulates until nobody can hold it in their head."
      toc={[
        { id: 'process', label: 'The process' },
        { id: 'treatment', label: 'Documentation treatment' },
        { id: 'current', label: 'Currently deprecated' },
      ]}
      related={[
        { title: 'Component lifecycle', to: '/governance/lifecycle', note: 'Where deprecation sits.' },
        { title: 'Versioning', to: '/governance/versioning', note: 'When removal is allowed.' },
        { title: 'Release notes', to: '/tools/releases', note: 'How it is communicated.' },
      ]}
      {...seq('/governance/deprecation')}
    >
      <h2 className="dc-h2" id="process">The process</h2>
      <ProcessDiagram
        alt="Deprecation has six stages: identify a replacement, mark deprecated, communicate the reason, provide migration guidance, maintain a compatibility window, and remove."
        stages={[
          { name: 'Identify the replacement', detail: 'Deprecating without an alternative just moves the problem to every consumer. If there is no replacement, it is not ready to deprecate.' },
          { name: 'Mark deprecated', detail: 'Status changes in the registry, so the signal reaches documentation, Storybook and tooling from one place.' },
          { name: 'Communicate the reason', detail: 'Why it is being retired, and what changed. A deprecation with no reason gets ignored or resented.' },
          { name: 'Provide migration guidance', detail: 'Concretely: this becomes that, these props map like so, this behavior differs.' },
          { name: 'Maintain a compatibility window', detail: 'The thing keeps working, receiving critical fixes only, long enough for consumers to migrate on their own schedule.' },
          { name: 'Remove', detail: 'Only in a major release, only after the window, only once adoption of the replacement is real.' },
        ]}
      />

      <h2 className="dc-h2" id="treatment">Documentation treatment</h2>
      <p>A deprecated component's page must make three things unmissable, above everything else:</p>
      <ul>
        <li><strong>Status.</strong> A deprecated badge in the metadata strip.</li>
        <li><strong>Replacement.</strong> What to use instead, linked.</li>
        <li><strong>Migration.</strong> How to move, specifically.</li>
      </ul>
      <p>
        Because component pages here are generated from the registry, a status change propagates automatically. The
        badge component already supports a deprecated tone.
      </p>

      <h2 className="dc-h2" id="current">Currently deprecated</h2>
      <Callout type="Note" title="Nothing is currently deprecated">
        No component in the registry carries a deprecated status. The system is early enough that nothing has been
        retired yet, and listing anything here would be inventing a history.
      </Callout>
    </DocArticle>
  );
}

/* ----------------------------------------------------------------- releases */

export function Releases() {
  return (
    <DocArticle
      trail={trail('Releases')}
      title="Releases"
      lead="How a merged change would reach the products that consume Envision, and what part of that actually exists today."
      toc={[
        { id: 'current', label: 'What exists today' },
        { id: 'pipeline', label: 'The release pipeline' },
        { id: 'gates', label: 'Quality gates' },
      ]}
      related={[
        { title: 'Versioning', to: '/governance/versioning', note: 'What the numbers mean.' },
        { title: 'Release notes', to: '/tools/releases', note: 'How changes are communicated.' },
        { title: 'Code packages', to: '/tools/packages', note: 'Current package state.' },
      ]}
      {...seq('/governance/releases')}
    >
      <h2 className="dc-h2" id="current">What exists today</h2>
      <Callout type="Important" title="There is build and test infrastructure, but no publishing">
        <p style={{ margin: '0 0 8px' }}>
          Verifiable and real: a token build, a component build, unit tests with accessibility assertions, a Storybook
          interaction runner, a Playwright visual suite, taxonomy and documentation verifiers, and Cloudflare Pages
          deployment for Storybook and Envision Design.
        </p>
        <p style={{ margin: 0 }}>
          Not present: package publishing, release tagging, a changelog, or automated version bumping. All{' '}
          {system.packages.length} packages remain private at 0.1.0.
        </p>
      </Callout>

      <h2 className="dc-h2" id="pipeline">The release pipeline</h2>
      <ProcessDiagram
        alt="A release pipeline: change merged, quality gates run, artifacts built, documentation deployed, package published, release notes written, and consumers adopt. Publishing and release notes do not yet exist."
        stages={[
          { name: 'Change merged', detail: 'After the reviews the change type requires.' },
          { name: 'Quality gates', detail: 'Taxonomy checks, token tests, component tests, Storybook tests, visual regression, documentation verification. All exist today.' },
          { name: 'Artifacts built', detail: 'Token build and component build. Both exist today.' },
          { name: 'Documentation deployed', detail: 'Storybook and Envision Design deploy to Cloudflare Pages. Exists today.' },
          { name: 'Package published', detail: 'Does not exist yet. Packages are private at 0.1.0.' },
          { name: 'Release notes written', detail: 'Does not exist yet. No release history to record.' },
          { name: 'Consumers adopt', detail: 'Currently via the workspace rather than a registry version.' },
        ]}
      />

      <h2 className="dc-h2" id="gates">Quality gates</h2>
      <p>These run today and are what a release would gate on:</p>
      <ScrollTable head={['Gate', 'Verifies']}>
        {[
          ['Taxonomy checks', 'Registry, Storybook titles and category order stay aligned'],
          ['Token tests', 'The responsive layer preserves references and units'],
          ['Component tests', 'Behavior and accessibility assertions per component'],
          ['Storybook tests', 'Stories render and interactions behave'],
          ['Visual regression', 'Committed screenshots per story'],
          ['Documentation verification', 'Routes exist, templates are canonical, no article rebuilds the shell'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>
      <Callout type="Developer" title="A known weakness in the visual gate">
        The visual suite's diff threshold is deliberately slack because fonts load over a network at test time. It has
        let real single-pixel geometry changes pass. A green visual run is not proof that geometry is unchanged.
      </Callout>
    </DocArticle>
  );
}

/* ----------------------------------------------------------------- adoption */

export function Adoption() {
  const withStorybook = system.counts.withStorybook;
  const impl = system.counts.implemented;
  return (
    <DocArticle
      trail={trail('Adoption')}
      title="Adoption"
      lead="Whether teams actually reach for the system. This page reports only what can be counted from source today, and names what would need instrumentation."
      toc={[
        { id: 'measurable', label: 'What can be measured now' },
        { id: 'cannot', label: 'What cannot be measured' },
        { id: 'meaning', label: 'What the numbers mean' },
      ]}
      related={[
        { title: 'Components', to: '/components', note: 'The inventory these numbers come from.' },
        { title: 'How the system is maintained', to: '/governance/maintenance', note: 'System health.' },
        { title: 'System roadmap', to: '/governance/roadmap', note: 'How gaps are prioritized.' },
      ]}
      {...seq('/governance/adoption')}
    >
      <h2 className="dc-h2" id="measurable">What can be measured now</h2>
      <p>Counted directly from the registry, the token build, the Storybook index and the package manifests.</p>
      <ScrollTable head={['Measure', 'Value', 'Source']}>
        {[
          ['Registered public components', String(system.counts.public), 'component-registry.json'],
          ['Implemented in code', `${impl} of ${system.counts.public}`, 'packages/components/src'],
          ['Specified but not built', String(system.counts.public - impl), 'Registry minus implementation'],
          ['Storybook coverage', `${withStorybook} of ${impl} implemented`, 'storybook-static/index.json'],
          ['Generated tokens', String(system.counts.tokens), 'packages/tokens/dist/tokens.css'],
          ['Components with tier 3 tokens', '10', 'Token output'],
          ['Packages', `${system.packages.length}, all private at 0.1.0`, 'Package manifests'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[2]}</code></td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        Storybook coverage is currently complete: every implemented component has built documentation. Implementation
        coverage is not: {system.counts.public - impl} components are designed and inventoried but not built.
      </p>

      <h2 className="dc-h2" id="cannot">What cannot be measured</h2>
      <Callout type="Important" title="No adoption telemetry exists">
        There is no instrumentation recording which products consume which components, how many hardcoded values
        remain in product code, how much bespoke UI has been replaced, or how long a feature takes to build with the
        system versus without. Presenting a chart of any of those would be fabrication.
      </Callout>
      <p>Measuring them would require, in rough order of effort:</p>
      <ul>
        <li><strong>Component usage scanning</strong> across consuming repositories.</li>
        <li><strong>Hardcoded-value linting</strong> to count raw values where a token exists.</li>
        <li><strong>Published package download data</strong>, which requires publishing first.</li>
        <li><strong>Accessibility coverage reporting</strong> beyond pass or fail per suite.</li>
      </ul>

      <h2 className="dc-h2" id="meaning">What the numbers mean</h2>
      <p>
        Component count is a vanity metric. A system with forty components and eight consumers is less healthy than one
        with twelve used everywhere. The most honest current read: the design side is well ahead of the implementation
        side, {impl} of {system.counts.public}, and closing that gap matters more than adding to either.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ roadmap */

export function Roadmap() {
  return (
    <DocArticle
      trail={trail('System roadmap')}
      title="System roadmap"
      lead="How roadmap decisions are organized. There is no committed roadmap with dates, and this page does not invent one."
      toc={[
        { id: 'status', label: 'Status' },
        { id: 'lanes', label: 'Capability lanes' },
        { id: 'known', label: 'Known gaps' },
        { id: 'prioritizing', label: 'How work is prioritized' },
      ]}
      related={[
        { title: 'Adoption', to: '/governance/adoption', note: 'The evidence prioritization uses.' },
        { title: 'Contribution model', to: '/governance/contribution', note: 'How work enters.' },
        { title: 'Components', to: '/components', note: 'The largest gap.' },
      ]}
      {...seq('/governance/roadmap')}
    >
      <h2 className="dc-h2" id="status">Status</h2>
      <Callout type="Important" title="No committed roadmap exists">
        There is no roadmap document, no dated commitments and no prioritized backlog recorded in this repository.
        Publishing invented dates would create commitments nobody made. This page documents how roadmap decisions are
        organized, and lists gaps that are demonstrable from source.
      </Callout>

      <h2 className="dc-h2" id="lanes">Capability lanes</h2>
      <p>Work is organized by capability rather than by feature list, so progress in one area is legible against the others.</p>
      <ScrollTable head={['Lane', 'Covers']}>
        {[
          ['Foundations', 'Shared visual and behavioral decisions'],
          ['Tokens', 'Token architecture, build, and outputs'],
          ['Components', 'Implementation of specified components'],
          ['Patterns', 'Recurring problem solutions'],
          ['Accessibility', 'Guarantees, testing, and coverage'],
          ['Content', 'Terminology and interface language'],
          ['Tooling', 'Build, verification, and design-tool integration'],
          ['Documentation', 'This site and Storybook'],
          ['Adoption', 'Migration and measurement'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="known">Known gaps, demonstrable from source</h2>
      <p>These are observations rather than commitments. Each is documented on the page where it belongs.</p>
      <ScrollTable head={['Lane', 'Gap', 'Documented on']}>
        {[
          ['Components', `${system.counts.public - system.counts.implemented} components specified but not implemented`, 'Each component page'],
          ['Tokens', 'No easing tokens; curves hardcoded in components', 'Motion'],
          ['Tokens', 'TypeScript tokens do not carry responsive overrides', 'TypeScript tokens'],
          ['Tokens', 'Responsive extension key named mobile, generates the tablet query', 'Naming conventions'],
          ['Foundations', 'Four of five breakpoints drive no generated CSS', 'Breakpoints'],
          ['Tooling', 'Figma library unpublished; workflow unverifiable end to end', 'Figma variables'],
          ['Tooling', 'Visual test threshold too slack to catch small geometry changes', 'Releases'],
          ['Documentation', 'No captured product screenshots in the repository', 'Imagery'],
          ['Adoption', 'No adoption telemetry of any kind', 'Adoption'],
          ['Governance', 'No publishing, release notes or changelog infrastructure', 'Releases'],
        ].map((r, i) => (
          <tr key={i}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="prioritizing">How work is prioritized</h2>
      <ul>
        <li><strong>Blocking product work</strong> first: a missing component stopping a team ships before a refinement.</li>
        <li><strong>Evidence of recurrence</strong> next: the same gap hit three times outranks a single request.</li>
        <li><strong>Blast radius</strong> after that: foundation and token work unblocks everything above it.</li>
        <li><strong>Correctness over surface</strong>: an accessibility or contract defect outranks new capability.</li>
      </ul>
    </DocArticle>
  );
}
