import { Callout } from '../modules';
import { ProcessDiagram } from '../modules/diagrams';
import { DocArticle } from '../templates';

const TOC = [
  { id: 'philosophy', label: 'Contribution philosophy' },
  { id: 'kinds', label: 'Kinds of contribution' },
  { id: 'path', label: 'The path' },
  { id: 'bar', label: 'The bar for a new component' },
  { id: 'reviews', label: 'What review checks' },
];

/** Benchmark governance article (Part XXXII). */
export function ContributionModel() {
  return (
    <DocArticle
      trail={[
              { label: 'Envision Design System', to: '/' },
              { label: 'Governance', to: '/governance' },
              { label: 'Contribution model' },
            ]}
      title="Contribution model"
      lead="A design system that only its owners can change becomes a bottleneck, and one that anyone can change without review becomes a component library with extra steps. The contribution model exists to keep both failures away."
      related={[
            { title: 'Governance', to: '/governance', note: 'The full lifecycle.' },
            { title: 'Components', to: '/components', note: 'What already exists.' },
            { title: 'Patterns', to: '/patterns', note: 'Where compositions are documented.' },
          ]}
      toc={TOC}
      prev={{ title: 'Governance', to: '/governance' }}
    >

      <h2 className="dc-h2" id="philosophy">Contribution philosophy</h2>
      <p>
        Envision assumes the people closest to a product problem understand it best, and that the system team
        understands best whether a solution generalizes. A contribution is a conversation between those two kinds
        of knowledge, not a request submitted to a queue.
      </p>
      <p>
        The most valuable contribution is usually not a new component. It is evidence: three places where the same
        problem was solved three different ways. That evidence is what turns a preference into a system decision.
      </p>

      <h2 className="dc-h2" id="kinds">Kinds of contribution</h2>
      <p>Different contributions carry different risk, so they take different paths.</p>
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead>
            <tr>{['Kind', 'What it is', 'Review needed'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)', fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--envision-t2-color-content-secondary-default)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[
              ['Documentation change', 'Guidance is wrong, missing or unclear', 'None for a correction; design review if it changes a rule'],
              ['Bug', 'A component does not behave as documented', 'Engineering'],
              ['Enhancement', 'An existing component needs to do more', 'Design + engineering'],
              ['New component', 'Nothing in the system solves this', 'Full: design, engineering, accessibility'],
              ['New pattern', 'A recurring composition needs guidance', 'Design + accessibility'],
              ['Foundation or token change', 'A shared decision changes', 'Full, plus migration planning'],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td key={i} style={{ padding: 'var(--dc-space-3)', verticalAlign: 'top', borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)', fontWeight: i === 0 ? 600 : 400 }}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        A token change looks small and is not. Because tokens are consumed everywhere, changing one is the highest
        blast-radius contribution in the system, which is why it carries the heaviest review despite often being a
        one-line diff.
      </p>

      <h2 className="dc-h2" id="path">The path</h2>
      <p>
        Fourteen stages, which sounds heavy until you notice most contributions skip most of them. A bug fix
        enters at implementation. A token change enters at proposal. Only a new component runs the whole path,
        and that is deliberate, because a new component is the only contribution the system can never take back.
      </p>
      <ProcessDiagram
        alt={
          'The contribution lifecycle has fourteen stages in order: identify need, check existing system, ' +
          'submit proposal, system review, design exploration, design review, engineering review, accessibility ' +
          'review, implementation, testing, documentation, release, adoption, and maintenance.'
        }
        stages={[
          { name: 'Identify need', detail: 'Something in a product could not be built from what exists. Record what you were trying to do, not what you think should be added.' },
          { name: 'Check existing system', detail: 'Search the component index and patterns. A large share of proposals describe something that already exists under a different name.' },
          { name: 'Submit proposal', detail: 'The problem, why current components do not solve it, evidence from more than one context, and the accessibility and responsive expectations.' },
          { name: 'System review', detail: 'Triage against the reuse bar. The outcome is a decision on the path, which may be to convert the proposal into a pattern instead.' },
          { name: 'Design exploration', detail: 'Anatomy, variants, states and responsive behavior are worked out against real product cases, not in isolation.' },
          { name: 'Design review', detail: 'System fit, duplication, token use, content, and Figma construction. Checks that the thing belongs in the system at all.' },
          { name: 'Engineering review', detail: 'API shape, semantics, tests, browser behavior and backwards compatibility. Checks that it can be maintained.' },
          { name: 'Accessibility review', detail: 'Semantics, keyboard, focus, accessible naming, contrast and touch targets. Runs before implementation is finished, not after.' },
          { name: 'Implementation', detail: 'Built against the token system with no raw values, and registered in the component registry so the rest of the system can see it.' },
          { name: 'Testing', detail: 'Unit behavior, accessibility assertions and a visual baseline. A component with no test is a component that will regress unnoticed.' },
          { name: 'Documentation', detail: 'An Envision Design page and a Storybook reference. Not optional: an undocumented component is one nobody adopts and everybody rebuilds.' },
          { name: 'Release', detail: 'Versioned and published with notes stating what changed and what consumers must do.' },
          { name: 'Adoption', detail: 'Existing bespoke implementations are migrated. Until they are, the system has added surface without removing duplication.' },
          { name: 'Maintenance', detail: 'Ongoing ownership: defects, questions and eventual deprecation. This stage never ends, which is why the bar to enter it is high.' },
        ]}
      />

      <h3 className="dc-h3">1. Check what already exists</h3>
      <p>
        Search the component index and the pattern library first. A surprising number of proposals describe a
        component that exists under a name the proposer did not think to search for.
      </p>
      <h3 className="dc-h3">2. State the problem, not the solution</h3>
      <p>
        Describe what someone was trying to do and what got in the way. Proposals written as solutions tend to
        arrive pre-committed to one design, and the review then argues about the design instead of the need.
      </p>
      <h3 className="dc-h3">3. Propose</h3>
      <p>
        A proposal needs the problem, why existing components do not solve it, evidence of the need appearing in
        more than one place, and the accessibility and responsive expectations. Product examples make a proposal
        dramatically more likely to move.
      </p>
      <h3 className="dc-h3">4. Review, 5. Build, 6. Document and release</h3>
      <p>
        A contribution is not finished when the code merges. It is finished when it has documentation, a Storybook
        reference, and a registry entry, because a component nobody can find is a component nobody adopts.
      </p>

      <h2 className="dc-h2" id="bar">The bar for a new component</h2>
      <p>New components carry permanent maintenance cost, so the bar is deliberately high.</p>
      <ul>
        <li><strong>Reuse.</strong> Would at least two or three distinct contexts use it? One caller is a product component.</li>
        <li><strong>Composition.</strong> Can existing components already be composed to solve it? If so, it is a pattern.</li>
        <li><strong>Durability.</strong> Will it still be needed after the current project ships?</li>
        <li><strong>Ownership.</strong> Is someone accountable for it once the original requester moves on?</li>
      </ul>
      <Callout type="Note" title="Failing the bar is a useful outcome">
        A rejected component proposal usually converts into a pattern page, which is often what the requester
        actually needed: guidance on assembling what already exists.
      </Callout>

      <h2 className="dc-h2" id="reviews">What review checks</h2>
      <p>
        Reviews are checklists, not opinions. Design review checks system fit, duplication, anatomy, variants,
        states, responsive behavior and token use. Engineering review checks API shape, semantics, tests and
        backwards compatibility. Accessibility review checks semantics, keyboard, focus, accessible naming,
        contrast and touch targets.
      </p>
      <p>
        All three exist so that the reasons for a decision are recorded. That record is what lets a future
        contributor understand why the system is shaped the way it is instead of relitigating it.
      </p>
    </DocArticle>  );
}
