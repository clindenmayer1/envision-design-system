import { Callout, DoDont, LivePreview, TokenTable } from '../modules';
import { AnatomyDiagram, LayerStack } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { ResponsiveExample, FinishGroup } from '../modules/product';
import { DocArticle } from '../templates';
import { system } from '../data/generated';

/**
 * Cross-component guidance: the concepts that apply to every component rather than to one.
 * Ordered after the category pages in the Components navigation.
 */

const ORDER: Array<[string, string]> = [
  ['Component anatomy', '/components/anatomy'],
  ['Variants & states', '/components/variants-and-states'],
  ['Responsive behavior', '/components/responsive'],
  ['Accessibility', '/components/accessibility'],
  ['Usage guidelines', '/components/usage'],
];
const seq = (path: string) => {
  const i = ORDER.findIndex(([, p]) => p === path);
  const at = (n: number) => (ORDER[n] ? { title: ORDER[n][0], to: ORDER[n][1] } : undefined);
  return { prev: i > 0 ? at(i - 1) : { title: 'Components', to: '/components' }, next: at(i + 1) };
};
const trail = (leaf: string) => [
  { label: 'Envision Design System', to: '/' },
  { label: 'Components', to: '/components' },
  { label: leaf },
];

/* ------------------------------------------------------------------ anatomy */

export function ComponentAnatomy() {
  const button = system.components.find((c) => c.id === 'button');
  return (
    <DocArticle
      trail={trail('Component anatomy')}
      title="Component anatomy"
      lead="The vocabulary every component page uses. Learning these nine words once makes fifty component pages readable at a glance."
      toc={[
        { id: 'vocabulary', label: 'The vocabulary' },
        { id: 'parts', label: 'Parts' },
        { id: 'property', label: 'Properties' },
        { id: 'variant', label: 'Variants' },
        { id: 'state', label: 'States' },
        { id: 'slot', label: 'Slots' },
        { id: 'event', label: 'Events' },
        { id: 'tokens', label: 'Tokens' },
        { id: 'worked', label: 'One worked example' },
      ]}
      related={[
        { title: 'Variants & states', to: '/components/variants-and-states', note: 'The distinction in depth.' },
        { title: 'Component tokens', to: '/tokens/component', note: 'How values are scoped.' },
        { title: 'Button', to: '/components/button', note: 'The example used throughout.' },
      ]}
      {...seq('/components/anatomy')}
    >
      <h2 className="dc-h2" id="vocabulary">The vocabulary</h2>
      <ScrollTable head={['Term', 'Means', 'Button example']}>
        {[
          ['Part', 'A structural piece of the component', 'Container, label, leading icon'],
          ['Property', 'An input that configures it', 'variant, size, label, disabled'],
          ['Variant', 'A supported version, chosen by a property', 'primary, outline, ghost'],
          ['State', 'A condition it can be in, usually not chosen', 'hover, focus-visible, pressed, loading'],
          ['Slot', 'A place a consumer can insert their own content', 'leading, trailing'],
          ['Event', 'Something it tells you about', 'click'],
          ['Token', 'A value it consumes', '--envision-t3-button-*'],
          ['Semantics', 'The element it renders and the role it takes', 'A real <button>'],
          ['Anatomy', 'All the parts together', 'Container + label + optional icons'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="parts">Parts</h2>
      <p>
        A part is structural. Each part has exactly one responsibility, which is what lets a component be described
        without describing its appearance.
      </p>
      {button?.anatomy && (
        <AnatomyDiagram
          alt={`Button is composed of: ${button.anatomy.join(', ')}.`}
          parts={button.anatomy.map((p) => p.replace(/\?$/, ' (optional)'))}
          example={<envision-button variant="primary" label="Apply design" trailing-icon="arrow_forward" />}
        />
      )}

      <h2 className="dc-h2" id="property">Properties</h2>
      <p>
        Properties are how a consumer configures a component. Attributes carry primitives, properties carry objects,
        which is why MaterialSwatch's <code>option</code> must be assigned as a property.
      </p>

      <h2 className="dc-h2" id="variant">Variants</h2>
      <p>
        A variant is a supported version, chosen deliberately. Button has three: primary, outline, ghost. They differ
        in emphasis, not in behavior, and each is a system decision rather than a styling option.
      </p>
      <LivePreview caption="Three variants of one component. Same behavior, different emphasis.">
        <envision-button variant="primary" label="Primary" />
        <envision-button variant="outline" label="Outline" />
        <envision-button variant="ghost" label="Ghost" />
      </LivePreview>

      <h2 className="dc-h2" id="state">States</h2>
      <p>
        A state is a condition, usually entered rather than chosen: hover, focus, pressed. Some states are set by a
        property, such as disabled or loading, which is why they appear in both lists.
      </p>

      <h2 className="dc-h2" id="slot">Slots</h2>
      <p>
        A slot is an opening for consumer content. Button exposes leading and trailing slots for cases where an icon
        name is not enough. Slots are deliberate extension points, not escape hatches.
      </p>

      <h2 className="dc-h2" id="event">Events</h2>
      <p>
        Events are how a component reports outward. Envision components emit composed events so they cross the shadow
        boundary, and they carry a detail describing what happened.
      </p>

      <h2 className="dc-h2" id="tokens">Tokens</h2>
      <p>
        Every visual value a component uses is a token reference. If a component page shows tokens, those are the
        values to change; a hardcoded override in product code is always the wrong answer.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t3-button-primary-color-')} />

      <h2 className="dc-h2" id="worked">One worked example</h2>
      <p>
        Button as a complete anatomy: a container part, a label part, two optional icon parts, four properties, three
        variants, six states, two slots, one event, and {system.tokens.filter((t) => t.name.startsWith('--envision-t3-button-')).length} tokens.
        Every component page describes the same nine things in the same order.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------- variants and states */

export function VariantsAndStates() {
  return (
    <DocArticle
      trail={trail('Variants & states')}
      title="Variants &amp; states"
      lead="Variants are chosen; states are entered. Confusing them produces components with a “hover variant” and screens that cannot express what is actually happening."
      toc={[
        { id: 'difference', label: 'The difference' },
        { id: 'matrix', label: 'They multiply' },
        { id: 'variants', label: 'Choosing a variant' },
        { id: 'states', label: 'Supporting a state' },
        { id: 'combining', label: 'Invalid combinations' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Component anatomy', to: '/components/anatomy', note: 'The wider vocabulary.' },
        { title: 'Component tokens', to: '/tokens/component', note: 'How state values are stored.' },
        { title: 'Button', to: '/components/button', note: 'Three variants, six states.' },
      ]}
      {...seq('/components/variants-and-states')}
    >
      <h2 className="dc-h2" id="difference">The difference</h2>
      <ScrollTable head={['', 'Variant', 'State']}>
        {[
          ['Chosen by', 'The person building the screen', 'The person using it, or the system'],
          ['Set via', 'A property', 'Interaction, or a property for disabled and loading'],
          ['Answers', 'Which version of this component?', 'What is happening to it right now?'],
          ['Example', 'primary, outline, ghost', 'hover, focus-visible, pressed, disabled, loading'],
          ['Changes over time?', 'No, it is fixed at build time', 'Yes, constantly'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="matrix">They multiply</h2>
      <p>
        This is why the distinction matters practically. Variants and states are orthogonal: every variant must support
        every state. Button's three variants across six states is eighteen combinations, all of which must be designed,
        built and testable.
      </p>
      <LivePreview caption="Three variants in their default state. Each must also support hover, focus, pressed, disabled and loading.">
        <envision-button variant="primary" label="Primary" />
        <envision-button variant="outline" label="Outline" />
        <envision-button variant="ghost" label="Ghost" />
        <envision-button variant="primary" label="Disabled" disabled />
        <envision-button variant="primary" label="Saving…" loading />
      </LivePreview>
      <p>
        Adding a fourth variant does not add one thing; it adds six. That multiplication is the strongest argument
        against variants that exist only to look different.
      </p>

      <h2 className="dc-h2" id="variants">Choosing a variant</h2>
      <p>
        Choose by the job, not by appearance. Primary is the one action that moves the task forward, and there should
        be one per surface. Outline is a real alternative. Ghost is available but low-emphasis.
      </p>

      <h2 className="dc-h2" id="states">Supporting a state</h2>
      <p>
        A component supports the states its page lists and no others. Simulating an unlisted state in product code puts
        that screen outside the system, and it will not follow when the component changes.
      </p>

      <h2 className="dc-h2" id="combining">Invalid combinations</h2>
      <p>
        Some combinations are meaningless: disabled and loading at once, or selected on a control that is not
        selectable. The registry records invalid combinations per component where they exist, and component pages
        surface the supported states so the boundary is visible.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Express a supported difference as a variant property, so every state comes with it.' },
          { kind: 'dont', text: 'Create a variant for a state, such as a “hover version”. It cannot be entered by interaction and doubles the matrix.' },
          { kind: 'do', text: 'Use one primary action per surface, so the path forward is unambiguous.' },
          { kind: 'dont', text: 'Use variants for visual variety. Every variant multiplies the states that must be built and tested.' },
        ]}
      />
    </DocArticle>
  );
}

/* --------------------------------------------------------- responsive behavior */

export function ComponentResponsive() {
  return (
    <DocArticle
      trail={trail('Responsive behavior')}
      title="Responsive behavior"
      lead="A component knows how to adapt. The page should not have to teach it, and two pages should never teach it differently."
      toc={[
        { id: 'contract', label: 'Adaptation is a contract' },
        { id: 'strategies', label: 'Five strategies' },
        { id: 'tokens', label: 'What tokens do' },
        { id: 'transform', label: 'When a component transforms' },
        { id: 'touch', label: 'Touch' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Responsive design', to: '/foundations/responsive-design', note: 'The foundation.' },
        { title: 'Responsive tokens', to: '/tokens/responsive', note: 'What changes automatically.' },
        { title: 'Responsive patterns', to: '/patterns/responsive', note: 'Whole patterns adapting.' },
      ]}
      {...seq('/components/responsive')}
    >
      <h2 className="dc-h2" id="contract">Adaptation is part of the contract</h2>
      <p>
        If a component adapts, it adapts itself, using the same API. A page that reimplements a component's narrow
        behavior creates a version that drifts, and the drift is invisible until two screens disagree.
      </p>

      <h2 className="dc-h2" id="strategies">Five strategies</h2>
      <ScrollTable head={['Strategy', 'What changes', 'Envision example']}>
        {[
          ['Resize', 'A dimension', 'RightRail width via a responsive token'],
          ['Reflow', 'How content wraps', 'Swatch groups wrapping to more rows'],
          ['Stack', 'Direction', 'Card grids dropping to one column'],
          ['Wrap', 'Row count, not item size', 'Finish groups; swatches never shrink'],
          ['Transform', 'Presentation and behavior', 'RightRail becoming a modal sheet'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <ResponsiveExample
        widths={[420, 330, 270]}
        caption="Wrap in action: swatches move to more rows rather than shrinking below a judgeable size."
      >
        <FinishGroup />
      </ResponsiveExample>

      <h2 className="dc-h2" id="tokens">What tokens do, and do not</h2>
      <p>
        A responsive token changes a value. It cannot change structure, semantics or focus behavior. Resize is
        tokenizable; transform is not, which is why transform lives in the component.
      </p>
      <LayerStack
        alt="Responsive tokens handle value changes such as width and font size. Component behavior handles structural changes such as a rail becoming a modal sheet."
        layers={[
          { label: 'Component behavior', note: 'Structure, semantics, focus contract', tone: 'active' },
          { label: 'CSS layout', note: 'Wrapping and reflow', tone: 'abstract' },
          { label: 'Responsive tokens', note: 'Values that change at the breakpoint', tone: 'neutral' },
        ]}
      />

      <h2 className="dc-h2" id="transform">When a component transforms</h2>
      <p>
        A transform changes what someone can do, so it brings obligations. When RightRail becomes a modal sheet it
        acquires the full focus contract: focus moves in, Tab is trapped, Escape closes, focus returns.
      </p>
      <Callout type="Accessibility" title="A new presentation needs a new contract">
        Anything that becomes modal at a breakpoint owes the modal focus contract. This is the most common
        accessibility regression introduced by responsive work.
      </Callout>

      <h2 className="dc-h2" id="touch">Touch</h2>
      <p>
        Component padding does not shrink at narrow widths. Narrow means touch is more likely, so targets must not get
        smaller exactly where fingers replace a cursor.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Let the component own its adaptation, so it behaves identically everywhere it appears.' },
          { kind: 'dont', text: 'Reimplement a component’s narrow behavior in a page. The two versions drift within one release.' },
          { kind: 'do', text: 'Consume the semantic token and let the value change itself at the threshold.' },
          { kind: 'dont', text: 'Write a media query for something the token system already changes.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------- component accessibility */

export function ComponentAccessibility() {
  return (
    <DocArticle
      trail={trail('Accessibility')}
      title="Component accessibility"
      lead="What using an Envision component gets you for free, and what it cannot give you no matter how well it is built."
      toc={[
        { id: 'split', label: 'The split' },
        { id: 'guaranteed', label: 'What is guaranteed' },
        { id: 'yours', label: 'What stays yours' },
        { id: 'reading', label: 'Reading a component page' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Accessibility', to: '/accessibility', note: 'The full section.' },
        { title: 'Screen readers', to: '/accessibility/screen-readers', note: 'Name, role, state.' },
        { title: 'Keyboard navigation', to: '/accessibility/keyboard', note: 'Expected keys.' },
      ]}
      {...seq('/components/accessibility')}
    >
      <h2 className="dc-h2" id="split">The split</h2>
      <p>
        A component sees itself and nothing else. That single fact determines exactly what it can and cannot promise,
        and it is worth internalizing before reading any component page.
      </p>

      <h2 className="dc-h2" id="guaranteed">What is guaranteed</h2>
      <ScrollTable head={['Guarantee', 'How']}>
        {[
          ['Correct semantics', 'The component renders the native element matching its role'],
          ['Keyboard mechanics', 'Activation, roving tabindex, arrow keys, Home and End'],
          ['Visible focus', 'A 2px offset brand ring on :focus-visible, from a token'],
          ['Programmatic state', 'aria-selected, aria-invalid, aria-pressed, aria-busy'],
          ['State beyond color', 'Rings, checks and messages rather than color alone'],
          ['Disabled behavior', 'Removed from the tab order by the platform'],
          ['Reduced motion', 'Honored inside the component'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>
      <LivePreview caption="Tab through these. Focus, activation and state come from the components.">
        <envision-button variant="primary" label="Apply design" />
        <envision-checkbox label="Include lighting package" />
        <envision-switch label="Show upgrade pricing" checked />
      </LivePreview>

      <h2 className="dc-h2" id="yours">What stays yours</h2>
      <ScrollTable head={['Responsibility', 'Why the component cannot do it']}>
        {[
          ['A meaningful accessible name', 'Only you know what this instance does'],
          ['Heading hierarchy', 'The component does not know what surrounds it'],
          ['Landmarks and page structure', 'A page-level concern'],
          ['Reading order', 'Determined by your DOM, not the component'],
          ['Choosing the right component', 'A perfectly accessible Button used to navigate is still wrong'],
          ['Focus on route change', 'The component is unmounted by then'],
          ['Content that makes sense', 'The component renders your words, whatever they are'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="reading">Reading a component page</h2>
      <p>
        Every component page has an accessibility section generated from the registry, covering its semantic contract,
        keyboard behavior and ARIA. Where the registry has no data, the page says so rather than implying coverage
        that does not exist.
      </p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Give every icon-only control a name describing the action, since the component cannot invent one.' },
          { kind: 'dont', text: 'Assume using an accessible component makes the screen accessible. Most failures are decisions the component never sees.' },
          { kind: 'do', text: 'Use the component whose semantics match the job.' },
          { kind: 'dont', text: 'Style a Button to look like a link, or vice versa. Semantics are announced; appearance is not.' },
        ]}
      />
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- usage guidelines */

export function UsageGuidelines() {
  return (
    <DocArticle
      trail={trail('Usage guidelines')}
      title="Usage guidelines"
      lead="How to use the component library without quietly forking it. Most system erosion happens one reasonable-looking exception at a time."
      toc={[
        { id: 'existing', label: 'Use what exists first' },
        { id: 'compose', label: 'Compose before creating' },
        { id: 'detach', label: 'Do not detach' },
        { id: 'fork', label: 'Do not fork component CSS' },
        { id: 'chrome', label: 'Do not rebuild owned chrome' },
        { id: 'new', label: 'When a new component is justified' },
        { id: 'pattern', label: 'When a pattern is the answer' },
      ]}
      related={[
        { title: 'Requesting a component', to: '/governance/requesting-a-component', note: 'If it really is missing.' },
        { title: 'Patterns', to: '/patterns', note: 'The usual better answer.' },
        { title: 'Using tokens in components', to: '/tokens/using-tokens', note: 'Consuming correctly.' },
      ]}
      {...seq('/components/usage')}
    >
      <h2 className="dc-h2" id="existing">Use what exists first</h2>
      <p>
        {system.counts.public} components are registered. Search before building: the most common cause of duplicate
        work is a component existing under a name nobody thought to search for.
      </p>

      <h2 className="dc-h2" id="compose">Compose before creating</h2>
      <p>
        Most gaps are composition problems. Filtering has no dedicated component in Envision and does not need one: it
        is Checkbox, Switch and Button arranged according to a documented pattern.
      </p>

      <h2 className="dc-h2" id="detach">Do not detach design instances</h2>
      <p>
        A detached instance stops receiving changes, including accessibility fixes you will not notice are missing. It
        also becomes invisible to everyone downstream: nothing indicates that this screen opted out.
      </p>
      <p>If you need a state the component does not offer, the honest options are a different component or a proposal.</p>

      <h2 className="dc-h2" id="fork">Do not fork component CSS</h2>
      <p>
        Reaching into a component's internals to restyle it produces something that looks like the component and is
        not. It breaks on the next component change, and the breakage appears in one screen with no obvious cause.
      </p>
      <Callout type="Developer" title="Two things the registry explicitly prohibits">
        Restyling via descendant selectors into component internals, and inline hex values. Both are recorded as
        prohibited examples on Button, and both are documented because both have happened.
      </Callout>

      <h2 className="dc-h2" id="chrome">Do not rebuild chrome the system owns</h2>
      <p>
        If the system owns a surface, use it. A hand-built rail will not transform into a modal sheet at the
        breakpoint, will not trap focus, and will not restore it on close, and nobody will notice until someone tries
        to use it on a phone with a keyboard.
      </p>

      <h2 className="dc-h2" id="new">When a new component is justified</h2>
      <ul>
        <li><strong>Reuse.</strong> Two or three distinct contexts, behaving identically.</li>
        <li><strong>Not composable.</strong> Existing components genuinely cannot produce it.</li>
        <li><strong>Durable.</strong> Still needed after the current project ships.</li>
        <li><strong>Owned.</strong> Someone is accountable after the requester moves on.</li>
      </ul>
      <p>All four, not three. Full criteria are on <a href="/governance/requesting-a-component">Requesting a component</a>.</p>

      <h2 className="dc-h2" id="pattern">When a pattern is the answer</h2>
      <p>
        If the need is “how should this whole task work” rather than “what control is missing”, it is a pattern. A
        pattern is guidance rather than maintained code, so it costs far less and usually answers the question better.
      </p>
      <p>
        A component proposal converted into a pattern is a success, not a rejection: the requester usually needed
        guidance on assembling what already exists.
      </p>
    </DocArticle>
  );
}
