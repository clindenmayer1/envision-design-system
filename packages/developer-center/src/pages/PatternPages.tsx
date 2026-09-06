import { Callout, DoDont, DocCard, DocGrid, LivePreview, SectionIntro } from '../modules';
import { SquareInCircle } from '../modules/artwork';
import { LifecycleRing, Pipeline } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { DesignCenterRail, FinishGroup, ProductExample, ResponsiveExample } from '../modules/product';
import { DocArticle, SectionLanding } from '../templates';
import { PATTERN_ORDER, sectionNav } from './sections';

const { seq, trail } = sectionNav(PATTERN_ORDER, 'Patterns', '/patterns');

/**
 * The Patterns section. Every example is composed from real production components; nothing here
 * describes an interaction Envision does not actually have.
 */

/* ------------------------------------------------------------------- landing */

export function PatternsLanding() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Patterns' }]}
      title="Patterns"
        media={<SquareInCircle />}
      lead="Patterns describe how Envision components, content, interaction, and responsive behavior work together to solve recurring user problems."
      related={[
        { title: 'Components', to: '/components', note: 'The parts patterns compose.' },
        { title: 'Accessibility', to: '/accessibility', note: 'Constraints every pattern must meet.' },
        { title: 'Content', to: '/content', note: 'The words patterns depend on.' },
      ]}
      next={{ title: 'Navigation', to: '/patterns/navigation' }}
      intro={
        <SectionIntro
          heading="Components solve parts. Patterns solve problems."
          body="A component does one job anywhere it appears. A pattern decides which components appear, in what order, what happens between them, and what the interface says while it happens."
          cta={{ label: 'Explore patterns', to: '/patterns/navigation' }}
          visual={<DesignCenterRail />}
        />
      }
      grid={
        <>
          <DocGrid columns={4}>
            <DocCard to="/patterns/navigation" title="Navigation">Moving between places without losing position.</DocCard>
            <DocCard to="/patterns/forms" title="Forms">Structure, validation timing and error recovery.</DocCard>
            <DocCard to="/patterns/selection" title="Selection">Choosing packages, materials and finishes.</DocCard>
            <DocCard to="/patterns/filtering" title="Filtering">Narrowing a set without hiding that you did.</DocCard>
            <DocCard to="/patterns/search" title="Search">Finding something by name rather than by browsing.</DocCard>
            <DocCard to="/patterns/empty-states" title="Empty states">Six different reasons nothing is here.</DocCard>
            <DocCard to="/patterns/loading" title="Loading">Waiting without losing context.</DocCard>
            <DocCard to="/patterns/errors" title="Errors">Where a problem is reported and how it is recovered.</DocCard>
          </DocGrid>
          <p className="dc-small" style={{ marginBlockStart: 'var(--dc-space-6)' }}>
            Also in this section: Confirmation, Progressive disclosure, Responsive patterns and Complex workflows.
          </p>
        </>
      }
    >
      <section>
        <h2 className="dc-h2" id="ladder">Where patterns sit</h2>
        <p>Five levels, each answering a different question. Confusing them is what produces bespoke interactions.</p>
        <Pipeline
          alt={
            'Five levels: a foundation defines a rule, a token encodes it, a component implements reusable UI, a ' +
            'pattern solves a recurring interaction problem, and a workflow combines patterns to complete a product task.'
          }
          steps={[
            { label: 'Foundation', note: 'Defines a rule', tone: 'neutral' },
            { label: 'Token', note: 'Encodes the rule', tone: 'neutral' },
            { label: 'Component', note: 'Reusable UI', tone: 'abstract' },
            { label: 'Pattern', note: 'Solves a recurring problem', tone: 'active' },
            { label: 'Workflow', note: 'Completes a product task', tone: 'active' },
          ]}
        />
      </section>
      {/* Absorbed from the former /patterns/overview, which repeated this page title. */}
      <section>
        <h2 className="dc-h2" id="what">What a pattern is</h2>
        <p>
          A pattern names a problem that keeps recurring and records the answer. “Someone must choose one of several
          material options, see what it costs, and keep track of what they already chose” is a problem Envision solves in
          cabinets, flooring, countertops, backsplash, lighting and hardware. Solving it once is the Selection pattern.
        </p>

        <h2 className="dc-h2" id="vs-component">Pattern versus component</h2>
        <ScrollTable head={['', 'Component', 'Pattern']}>
          {[
            ['Answers', 'What is this control?', 'How should this task work?'],
            ['Scope', 'One element', 'Several elements, plus content and sequence'],
            ['Example', 'MaterialSwatch', 'Selection'],
            ['Shipped as', 'Code in @envision/components', 'Guidance plus a recommended composition'],
            ['Owned by', 'The component library', 'This documentation'],
          ].map((r) => (
            <tr key={r[0]}>
              <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
              <td style={TABLE_CELL}>{r[1]}</td>
              <td style={TABLE_CELL}>{r[2]}</td>
            </tr>
          ))}
        </ScrollTable>
        <p>
          The practical test: if you can npm install it, it is a component. If following it requires judgment about
          sequence and content, it is a pattern.
        </p>

        <h2 className="dc-h2" id="vs-workflow">Pattern versus workflow</h2>
        <p>
          A workflow is product-specific and finite: configuring a kitchen has a beginning and an end. A pattern is
          reusable and appears many times inside many workflows. Selection appears six times in one kitchen
          configuration.
        </p>
        <p>
          Workflows belong to the product; patterns belong to the system. That boundary is why the system does not tell
          you what order a buyer should make decisions in.
        </p>

        <h2 className="dc-h2" id="why">Why patterns exist</h2>
        <p>
          Because component consistency is not experience consistency. Six teams can each use the correct components and
          still produce six different selection experiences, because the components never decided where the total goes or
          whether choosing commits.
        </p>

        <h2 className="dc-h2" id="compose">How patterns compose components</h2>
        <p>
          A pattern assigns each component one responsibility. Selection uses a Panel to persist, an OptionCard per
          decision, MaterialSwatch for material choice, and a Button to commit. No component is doing two jobs.
        </p>
        <ProductExample
          title="Selection, composed"
          surface={<DesignCenterRail />}
          annotations={[
            'RightRail: persists beside the thing being changed.',
            'Tab: switches between Customize and Packages.',
            'OptionCard: one row per decision, showing current choice and cost.',
            'Button: the single commit point.',
          ]}
        />

        <h2 className="dc-h2" id="content">How content participates</h2>
        <p>
          Content is part of the pattern, not decoration on top. Selection specifies that the baseline option reads
          <code> Included</code> rather than <code>$0</code>, and that a cost is written as a delta. Change those words
          and the pattern behaves differently even with identical components.
        </p>

        <h2 className="dc-h2" id="a11y">How accessibility participates</h2>
        <p>
          Patterns carry the accessibility decisions no single component can make: that an option group is one tab stop
          with arrow keys, that focus returns to the opener when a tray closes, that selection is never color alone.
        </p>

        <h2 className="dc-h2" id="responsive">How responsive behavior participates</h2>
        <p>
          A pattern states what survives when space runs out. Selection keeps the running total and the judgeable swatch
          size, and gives up the side-by-side layout. That priority is a pattern decision, not a layout accident.
        </p>

        <h2 className="dc-h2" id="choosing">Choosing a pattern</h2>
        <ScrollTable head={['The person is trying to', 'Pattern']}>
          {[
            ['Choose one of several visible options', 'Selection'],
            ['Provide information the product does not have', 'Forms'],
            ['Move to another place in the product', 'Navigation'],
            ['Narrow a large set they can already see', 'Filtering'],
            ['Find something specific by name', 'Search'],
            ['Understand why nothing is here', 'Empty states'],
            ['Wait for something', 'Loading'],
            ['Recover from a problem', 'Errors'],
            ['Commit to something consequential', 'Confirmation'],
            ['Reach detail without being shown all of it', 'Progressive disclosure'],
          ].map((r) => (
            <tr key={r[0]}>
              <td style={TABLE_CELL}>{r[0]}</td>
              <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[1]}</td>
            </tr>
          ))}
        </ScrollTable>

        <h2 className="dc-h2" id="new">When a new pattern is needed</h2>
        <p>
          When the same problem has been solved differently in three places and none of the existing patterns describes
          it. One occurrence is a product decision; three divergent ones are a missing pattern.
        </p>
        <p>
          A new pattern costs far less than a new component: it is guidance, not maintained code, which is why converting
          a rejected component proposal into a pattern is usually the right outcome.
        </p>
      </section>
    </SectionLanding>
  );
}

/* ------------------------------------------------------------------ overview */

/* ---------------------------------------------------------------- navigation */

export function NavigationPattern() {
  return (
    <DocArticle
      trail={trail('Navigation')}
      title="Navigation"
      lead="Navigation moves someone between places in Envision without losing the context that made where they were meaningful."
      toc={[
        { id: 'purpose', label: 'Purpose' },
        { id: 'hierarchy', label: 'Navigation hierarchy' },
        { id: 'global-local', label: 'Global versus local' },
        { id: 'active', label: 'Active state and location' },
        { id: 'back', label: 'Back behavior' },
        { id: 'tabs', label: 'Tabs' },
        { id: 'mobile', label: 'Mobile adaptation' },
        { id: 'keyboard', label: 'Keyboard' },
        { id: 'semantics', label: 'Screen-reader semantics' },
        { id: 'labels', label: 'Labels' },
        { id: 'components', label: 'Components used' },
      ]}
      related={[
        { title: 'Keyboard navigation', to: '/accessibility/keyboard', note: 'Expected keys.' },
        { title: 'Labels', to: '/content/labels', note: 'Naming destinations.' },
        { title: 'Responsive patterns', to: '/patterns/responsive', note: 'How navigation adapts.' },
      ]}
      {...seq('/patterns/navigation')}
    >
      <h2 className="dc-h2" id="purpose">Purpose</h2>
      <p>
        Envision navigation has an unusual constraint: most movement happens <em>within</em> a screen rather than
        between screens. Someone configuring a kitchen switches between rooms and categories without ever leaving the
        Design Center, so navigation is often a change of context inside a persistent layout.
      </p>

      <h2 className="dc-h2" id="hierarchy">Navigation hierarchy</h2>
      <ScrollTable head={['Level', 'Moves between', 'Persistence']}>
        {[
          ['Global', 'Major areas of the product', 'Always visible'],
          ['Contextual', 'Rooms or areas within a workspace', 'Visible while in that workspace'],
          ['Local', 'Views inside one panel, such as Customize and Packages', 'Visible while the panel is open'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>Three levels is the ceiling. A fourth means the information architecture needs work, not another control.</p>

      <h2 className="dc-h2" id="global-local">Global versus local</h2>
      <p>
        Global navigation changes what you are working on. Local navigation changes how you are looking at it. The
        distinction decides persistence: global chrome never moves, local controls disappear with their container.
      </p>

      <h2 className="dc-h2" id="active">Active state and current location</h2>
      <p>
        Exactly one item per level is active, and the active state is never color alone. This documentation site uses
        weight plus a green left indicator plus a warm background, so the current section survives grayscale.
      </p>
      <LivePreview caption="Real Tab components. The selected tab carries weight and an indicator, not just color.">
        <div role="tablist" style={{ display: 'flex', gap: 'var(--dc-space-5)' }}>
          <envision-tab label="Customize" selected />
          <envision-tab label="Packages" />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="back">Back behavior</h2>
      <p>
        Prefer the browser's back button over a bespoke one. Where a tray or sheet is open, Escape and the close
        control return to the previous state and restore focus to whatever opened it.
      </p>
      <p>
        Never trap someone. If a step can be entered, it can be left, and leaving must not silently discard work.
      </p>

      <h2 className="dc-h2" id="tabs">Tabs</h2>
      <p>
        Tabs are for peer views of the same subject. Customize and Packages are two ways to configure one kitchen,
        which is what makes them tabs rather than navigation. Tabs are the wrong control for sequential steps.
      </p>

      <h2 className="dc-h2" id="mobile">Mobile adaptation</h2>
      <p>
        Persistent navigation becomes a drawer behind a menu button, and that drawer is a modal surface: focus moves
        in, Tab is trapped, Escape closes, focus returns to the trigger. Local tabs stay tabs; they are already
        compact.
      </p>

      <h2 className="dc-h2" id="keyboard">Keyboard</h2>
      <p>
        A navigation list is a list of links: Tab moves through it, Enter follows. A tab list is a single tab stop with
        arrow keys moving between tabs and Home and End jumping to the ends. Envision Tab implements roving tabindex
        for exactly this reason.
      </p>

      <h2 className="dc-h2" id="semantics">Screen-reader semantics</h2>
      <p>
        Navigation regions are <code>nav</code> landmarks with distinct accessible names, so a screen reader user can
        jump between them and tell them apart. Two unnamed <code>nav</code> elements are worse than one.
      </p>
      <p>
        Tabs use <code>role="tablist"</code> with <code>aria-selected</code> and <code>aria-controls</code>, which the
        Tab component provides when wrapped in a tablist.
      </p>

      <h2 className="dc-h2" id="labels">Labels</h2>
      <p>
        Name the destination, not the action. “Packages” tells someone what they will find; “View packages” describes
        the click. Keep labels stable: a destination that renames itself by context is unlearnable.
      </p>

      <h2 className="dc-h2" id="components">Components used</h2>
      <DocGrid columns={3}>
        <DocCard to="/components/rightrail-tab" title="Tab">Local view switching with roving tabindex.</DocCard>
        <DocCard to="/components/link" title="Link">Navigation between places.</DocCard>
        <DocCard to="/components/category/navigation" title="Navigation components">Everything in the category.</DocCard>
      </DocGrid>
    </DocArticle>
  );
}

/* --------------------------------------------------------------------- forms */

export function FormsPattern() {
  return (
    <DocArticle
      trail={trail('Forms')}
      title="Forms"
      lead="A form asks someone for information the product does not have. Every question costs the person something, so the pattern is mostly about asking for less and recovering well when something is wrong."
      toc={[
        { id: 'anatomy', label: 'Form anatomy' },
        { id: 'order', label: 'Field order' },
        { id: 'labels', label: 'Labels and helper text' },
        { id: 'required', label: 'Required versus optional' },
        { id: 'grouping', label: 'Grouping' },
        { id: 'validation', label: 'Validation timing' },
        { id: 'errors', label: 'Inline and form-level errors' },
        { id: 'submission', label: 'Submission and progress' },
        { id: 'multistep', label: 'Multi-step forms' },
        { id: 'keyboard', label: 'Keyboard and screen readers' },
        { id: 'responsive', label: 'Responsive behavior' },
        { id: 'components', label: 'Components used' },
      ]}
      related={[
        { title: 'Content: Forms', to: '/content/forms', note: 'What the words should say.' },
        { title: 'Accessible forms', to: '/accessibility/forms', note: 'Association and announcement.' },
        { title: 'Validation & errors', to: '/content/errors', note: 'Error copy.' },
      ]}
      {...seq('/patterns/forms')}
    >
      <h2 className="dc-h2" id="anatomy">Form anatomy</h2>
      <p>Five parts, in this order: a heading, optional instructions, the fields, the errors when they exist, and the actions.</p>
      <LivePreview caption="Real Field components: persistent label, helper text, and an error that replaces it.">
        <div style={{ display: 'grid', gap: 'var(--dc-space-5)', width: 320 }}>
          <envision-input label="Project name" placeholder="Sonoma" />
          <envision-input label="Email" type="email" helper-text="We'll only use this to send your selections." />
          <envision-input label="Email" type="email" value="not-an-email" invalid error-message="Enter a valid email address." />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="order">Field order</h2>
      <p>
        Order by the person's mental model, not the database schema. Ask for what they already know first: someone
        entering a project can name it before they can specify a lot number.
      </p>

      <h2 className="dc-h2" id="labels">Labels and helper text</h2>
      <p>
        Labels are always visible. A placeholder is not a label: it disappears exactly when someone needs it, fails for
        screen readers, and is often too low-contrast to read.
      </p>
      <p>
        Helper text explains a constraint before it is violated. If helper text is only useful after an error, it
        should be an error message instead.
      </p>

      <h2 className="dc-h2" id="required">Required versus optional</h2>
      <p>
        Mark whichever is rarer. If most fields are required, mark the optional ones. Marking every field with an
        asterisk communicates nothing.
      </p>
      <p>
        Envision Field marks required fields with an asterisk before the label, hidden from assistive technology, and
        sets <code>aria-required</code> on the control, so the requirement is conveyed twice without being announced
        twice.
      </p>

      <h2 className="dc-h2" id="grouping">Grouping</h2>
      <p>
        Related fields sit closer together, with a larger gap between groups. Where a group is a single question with
        several answers, such as a set of radios, it needs a group label that names the question.
      </p>

      <h2 className="dc-h2" id="validation">Validation timing</h2>
      <ScrollTable head={['When', 'Validate?', 'Why']}>
        {[
          ['While typing', 'No', 'An incomplete email is not an invalid one. Interrupting mid-entry is hostile.'],
          ['On blur', 'Yes, if the field was touched', 'The person has finished; feedback is timely and expected.'],
          ['On submit', 'Yes, everything', 'The last chance to catch what blur missed.'],
          ['After a fix', 'Yes, immediately', 'Clear the error the moment it stops being true.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="errors">Inline and form-level errors</h2>
      <p>
        A field error sits with its field and is associated by <code>aria-describedby</code>, so a screen reader reads
        the problem with the control rather than somewhere else.
      </p>
      <p>
        A form-level error summary is useful on long forms, but it never replaces inline errors. On failed submit,
        move focus to the first invalid field: an error summary nobody is looking at helps nobody.
      </p>

      <h2 className="dc-h2" id="submission">Submission and progress</h2>
      <p>
        Disable nothing until submit is pressed. A disabled submit button that waits for validity gives no explanation
        of what is missing.
      </p>
      <p>
        During submission the action shows a loading state that blocks re-activation while remaining focusable, so the
        person is not thrown out of the form.
      </p>
      <LivePreview caption="Real Button, loading. It stays focusable and announces aria-busy.">
        <envision-button variant="primary" label="Saving…" loading />
      </LivePreview>

      <h2 className="dc-h2" id="multistep">Multi-step forms</h2>
      <p>
        Split only when steps are genuinely independent. Show where someone is and how many steps remain, never
        discard entered data when moving backward, and validate each step on leaving it rather than all at the end.
      </p>

      <h2 className="dc-h2" id="keyboard">Keyboard and screen readers</h2>
      <p>
        Tab order follows DOM order, which must follow visual order. Enter submits from a text field. A radio group is
        one tab stop with arrow keys.
      </p>
      <p>
        Envision Field wires <code>aria-invalid</code>, <code>aria-required</code> and{' '}
        <code>aria-describedby</code> automatically, which removes the most commonly forgotten wiring.
      </p>

      <h2 className="dc-h2" id="responsive">Responsive behavior</h2>
      <p>
        Forms are single column at every width. Multi-column forms create ambiguous reading order and break down at
        narrow widths anyway. Fields stretch; labels stay above.
      </p>

      <h2 className="dc-h2" id="components">Components used</h2>
      <DocGrid columns={4}>
        <DocCard to="/components/field" title="Field">Text input with label, helper and error.</DocCard>
        <DocCard to="/components/checkbox" title="Checkbox">Boolean choice.</DocCard>
        <DocCard to="/components/radio" title="Radio">One of several.</DocCard>
        <DocCard to="/components/button" title="Button">Submit and cancel.</DocCard>
      </DocGrid>
    </DocArticle>
  );
}

/* ----------------------------------------------------------------- filtering */

export function FilteringPattern() {
  return (
    <DocArticle
      trail={trail('Filtering')}
      title="Filtering"
      lead="Filtering narrows a set the person can already see. The hardest part is making it obvious that a filter is active, so an empty result is never mistaken for missing data."
      toc={[
        { id: 'problem', label: 'The user problem' },
        { id: 'when', label: 'When to filter' },
        { id: 'controls', label: 'Filter controls' },
        { id: 'applied', label: 'Showing applied filters' },
        { id: 'count', label: 'Result count' },
        { id: 'clear', label: 'Clear and reset' },
        { id: 'empty', label: 'No matching results' },
        { id: 'updating', label: 'Updating results' },
        { id: 'mobile', label: 'Mobile behavior' },
        { id: 'a11y', label: 'Keyboard and screen readers' },
        { id: 'components', label: 'Components used' },
      ]}
      related={[
        { title: 'Search', to: '/patterns/search', note: 'Finding rather than narrowing.' },
        { title: 'Empty states', to: '/patterns/empty-states', note: 'When a filter matches nothing.' },
        { title: 'Selection', to: '/patterns/selection', note: 'What filtering usually precedes.' },
      ]}
      {...seq('/patterns/filtering')}
    >
      <h2 className="dc-h2" id="problem">The user problem</h2>
      <p>
        A person facing forty cabinet finishes does not want to read forty labels. They want to see only the matte
        ones, or only the ones included at no extra cost, and they want to know they are looking at a subset.
      </p>

      <h2 className="dc-h2" id="when">When to filter</h2>
      <p>
        When the set is large enough to be tiring but small enough to be worth browsing, and when the person can name
        an attribute they care about. Below roughly a dozen items, filtering adds a control and removes nothing.
      </p>
      <p>Filter when they know a property. Search when they know a name.</p>

      <h2 className="dc-h2" id="controls">Filter controls</h2>
      <Callout type="Important" title="Envision has no dedicated filter component">
        There is no filter chip, filter bar or filter panel in the component registry. Filtering is composed from
        existing controls: Checkbox for multi-select attributes, Radio for exclusive choices, Switch for a single
        boolean, and Button to clear. Describing a chip component here would be inventing one.
      </Callout>
      <LivePreview caption="A filter group composed from real Checkbox and Switch components.">
        <div style={{ display: 'grid', gap: 'var(--dc-space-3)', width: 260 }}>
          <p className="dc-eyebrow" style={{ margin: 0 }}>Finish</p>
          <envision-checkbox label="Matte" checked />
          <envision-checkbox label="Satin" />
          <envision-switch label="Included only" />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="applied">Showing applied filters</h2>
      <p>
        Active filters must be visible from the results, not only inside the control that set them. Someone who
        scrolled past the filter panel and sees three items needs to know why.
      </p>

      <h2 className="dc-h2" id="count">Result count</h2>
      <p>
        Always show how many results there are and, when filtered, how many exist in total. “6 of 42 finishes” answers
        both “is this everything” and “is my filter too narrow” at once.
      </p>

      <h2 className="dc-h2" id="clear">Clear and reset</h2>
      <p>
        A single clear-all control is required whenever more than one filter can be active. Removing filters one at a
        time to get back to the full set is a chore, and people abandon rather than do it.
      </p>

      <h2 className="dc-h2" id="empty">No matching results</h2>
      <p>
        This is a different empty state from “there is nothing here”. It must say what was filtered, and offer a way
        back. See <a href="/patterns/empty-states">Empty states</a> for the content model.
      </p>

      <h2 className="dc-h2" id="updating">Updating results</h2>
      <p>
        Apply filters immediately rather than behind an Apply button. Immediate feedback lets someone learn what each
        filter does, which is most of what makes filtering usable.
      </p>
      <p>
        Do not move the scroll position when results change. If someone is looking at row twenty and the list
        re-renders at the top, they have lost their place.
      </p>

      <h2 className="dc-h2" id="mobile">Mobile behavior</h2>
      <p>
        Filters move into a sheet, following the same modal contract as the rail: focus in, Tab trapped, Escape closes,
        focus returns. The result count belongs on the trigger, so it is visible without opening the sheet.
      </p>

      <h2 className="dc-h2" id="a11y">Keyboard and screen readers</h2>
      <p>
        The result count is a live region, so a change is announced without moving focus. Never move focus to the
        results when a filter changes: the person is still filtering.
      </p>
      <p>Each filter group needs a group label naming the attribute, not just labels on the individual options.</p>

      <h2 className="dc-h2" id="components">Components used</h2>
      <DocGrid columns={3}>
        <DocCard to="/components/checkbox" title="Checkbox">Multi-select attributes.</DocCard>
        <DocCard to="/components/switch" title="Switch">A single boolean filter.</DocCard>
        <DocCard to="/components/badge" title="Badge">Counts.</DocCard>
      </DocGrid>
    </DocArticle>
  );
}

/* -------------------------------------------------------------------- search */

export function SearchPattern() {
  return (
    <DocArticle
      trail={trail('Search')}
      title="Search"
      lead="Search finds something by name when the person already knows what they are looking for. It is not a better filter, and using it as one produces an interface where nothing can be browsed."
      toc={[
        { id: 'vs-filter', label: 'Search versus filtering' },
        { id: 'input', label: 'Query input' },
        { id: 'timing', label: 'Immediate versus explicit' },
        { id: 'results', label: 'Results' },
        { id: 'no-results', label: 'No results' },
        { id: 'clearing', label: 'Clearing a query' },
        { id: 'loading', label: 'Loading and errors' },
        { id: 'keyboard', label: 'Keyboard' },
        { id: 'a11y', label: 'Accessible labeling' },
        { id: 'doc-search', label: 'Product search versus this site' },
      ]}
      related={[
        { title: 'Filtering', to: '/patterns/filtering', note: 'Narrowing instead of finding.' },
        { title: 'Empty states', to: '/patterns/empty-states', note: 'The no-results case.' },
        { title: 'Field', to: '/components/field', note: 'The input itself.' },
      ]}
      {...seq('/patterns/search')}
    >
      <h2 className="dc-h2" id="vs-filter">Search versus filtering</h2>
      <ScrollTable head={['', 'Search', 'Filtering']}>
        {[
          ['The person knows', 'A name', 'An attribute'],
          ['Input', 'Free text', 'Predefined choices'],
          ['Discovers new options?', 'No', 'Yes'],
          ['Fails when', 'They spell it differently', 'The attribute is not offered'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        For material selection, filtering is usually the better tool: people rarely know a finish is called “Matte
        Walnut” before they see it.
      </p>

      <h2 className="dc-h2" id="input">Query input</h2>
      <p>
        A search field is a Field with <code>type="search"</code> and a leading icon. It needs a real label, visually
        hidden if the design cannot show one; a magnifier icon is not a label.
      </p>
      <LivePreview caption="Real Field, search type, with a leading icon.">
        <div style={{ width: 300 }}>
          <envision-input type="search" label="Search finishes" placeholder="e.g. matte walnut" leading-icon="search" />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="timing">Immediate versus explicit</h2>
      <p>
        Search as the person types when results are local and fast. Require an explicit submit when the query is
        expensive or the result set is large enough that partial queries produce noise.
      </p>
      <p>
        Do not search on the first keystroke. Two characters is the practical minimum before results mean anything.
      </p>

      <h2 className="dc-h2" id="results">Results</h2>
      <p>
        Each result needs enough to be identified without opening it: what it is, what kind of thing it is, and where
        it lives. The search on this site follows exactly that shape, showing title, content type, snippet and
        breadcrumb.
      </p>

      <h2 className="dc-h2" id="no-results">No results</h2>
      <p>
        Say what was searched, because people mistype and cannot see their own typo. Then offer a way forward: clear
        the query, or browse the full set.
      </p>

      <h2 className="dc-h2" id="clearing">Clearing a query</h2>
      <p>
        Clearing must return to the unfiltered state, not to an empty screen. Escape should clear or dismiss, which is
        what people try first.
      </p>

      <h2 className="dc-h2" id="loading">Loading and errors</h2>
      <p>
        Keep the previous results visible while new ones load rather than blanking the area; a flash of empty reads as
        “nothing found”. If search fails, say the search failed. An empty result list would be a lie.
      </p>

      <h2 className="dc-h2" id="keyboard">Keyboard</h2>
      <p>
        Arrow keys move through results while focus stays in the input, Enter opens the highlighted result, Escape
        dismisses. This is the combobox pattern, and it is what people expect from every search they have used.
      </p>

      <h2 className="dc-h2" id="a11y">Accessible labeling</h2>
      <p>
        The input is a <code>combobox</code> with <code>aria-expanded</code>, <code>aria-controls</code> and{' '}
        <code>aria-activedescendant</code> pointing at the highlighted option. Results are a <code>listbox</code> of{' '}
        <code>option</code>s. Focus never leaves the input, which is why activedescendant is required rather than
        optional.
      </p>

      <h2 className="dc-h2" id="doc-search">Product search versus this site's search</h2>
      <p>
        The search in Envision Design is documentation search: it indexes pages, components and token names.
        Product search inside Envision searches materials, packages and selections. Same pattern, different corpus, and
        the two should not be described interchangeably.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------- empty states */

export function EmptyStates() {
  return (
    <DocArticle
      trail={trail('Empty states')}
      title="Empty states"
      lead="Nothing is here for at least six different reasons, and each needs a different response. Treating them identically is the most common empty-state failure."
      toc={[
        { id: 'why', label: 'Why classification matters' },
        { id: 'types', label: 'The six types' },
        { id: 'first-use', label: 'First use' },
        { id: 'no-data', label: 'No data' },
        { id: 'no-results', label: 'No search results' },
        { id: 'filtered', label: 'No filtered results' },
        { id: 'cleared', label: 'Cleared state' },
        { id: 'error', label: 'Error-related' },
        { id: 'anatomy', label: 'Anatomy and visual treatment' },
        { id: 'a11y', label: 'Accessibility' },
      ]}
      related={[
        { title: 'Content: Empty states', to: '/content/empty-states', note: 'The copy formulas.' },
        { title: 'Filtering', to: '/patterns/filtering', note: 'Where filtered-empty comes from.' },
        { title: 'Errors', to: '/patterns/errors', note: 'When empty means broken.' },
      ]}
      {...seq('/patterns/empty-states')}
    >
      <h2 className="dc-h2" id="why">Why classification matters</h2>
      <p>
        “No results found” is correct for a search and actively misleading for a brand-new project, where nothing is
        wrong and the person simply has not started. The reason determines the message, the action, and whether
        anything is wrong at all.
      </p>

      <h2 className="dc-h2" id="types">The six types</h2>
      <ScrollTable head={['Type', 'Cause', 'Tone', 'Primary action']}>
        {[
          ['First use', 'Nothing has been created yet', 'Inviting', 'Start the main task'],
          ['No data', 'This area legitimately has nothing', 'Neutral', 'Add, or nothing'],
          ['No search results', 'The query matched nothing', 'Helpful', 'Clear the query'],
          ['No filtered results', 'Filters excluded everything', 'Helpful', 'Clear filters'],
          ['Cleared', 'The person emptied it deliberately', 'Quiet', 'Undo, if available'],
          ['Error-related', 'Loading failed', 'Direct', 'Retry'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="first-use">First use</h2>
      <p>
        The only empty state that is an opportunity. Nothing has gone wrong, so do not apologize. Explain what this
        area is for and give one action.
      </p>
      <p>Example: “No selections yet. Choose a package to get started.” with a single primary action.</p>

      <h2 className="dc-h2" id="no-data">No data</h2>
      <p>
        Sometimes correct and permanent: a room with no upgrades available genuinely has nothing. State it plainly and
        do not offer an action that does not exist.
      </p>

      <h2 className="dc-h2" id="no-results">No search results</h2>
      <p>
        Repeat the query, because people cannot see their own typo. “No finishes match ‘walnutt’.” Then offer clearing.
      </p>

      <h2 className="dc-h2" id="filtered">No filtered results</h2>
      <p>
        Different from search-empty: the person did not type anything, so echoing a query makes no sense. Say which
        filters are active and offer to clear them.
      </p>
      <p>
        This is the state most often mistaken for a bug, which is why the applied filters must be visible from the
        empty area itself.
      </p>

      <h2 className="dc-h2" id="cleared">Cleared state</h2>
      <p>
        The person did this on purpose, so celebrating or explaining is condescending. Stay quiet, and offer undo if
        the action was destructive.
      </p>

      <h2 className="dc-h2" id="error">Error-related empty state</h2>
      <p>
        The critical one to get right. If loading failed, the area is not empty; it is unknown. Saying “No selections”
        when the request failed tells the person their work is gone. Say loading failed and offer retry.
      </p>

      <h2 className="dc-h2" id="anatomy">Anatomy and visual treatment</h2>
      <p>
        A heading stating the situation, one line of supporting copy, and at most one primary action. Illustration is
        optional and usually unnecessary: reserve it for first use, where there is genuinely room and a reason.
      </p>
      <p>
        An empty state occupies the space its content would have, so the layout does not jump when content arrives.
      </p>

      <h2 className="dc-h2" id="a11y">Accessibility</h2>
      <p>
        When an area becomes empty after an action, announce it through a live region. A sighted person sees the list
        vanish; someone using a screen reader gets nothing unless it is announced.
      </p>
      <p>Empty-state headings participate in the page heading hierarchy and must not skip a level.</p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------- loading */

export function LoadingPattern() {
  return (
    <DocArticle
      trail={trail('Loading')}
      title="Loading"
      lead="Waiting is unavoidable; losing your place is not. Envision loading patterns keep the surrounding context intact so a person can see what is happening and where they were."
      toc={[
        { id: 'hierarchy', label: 'The loading hierarchy' },
        { id: 'context', label: 'Preserve context' },
        { id: 'shift', label: 'Avoid layout shift' },
        { id: 'determinate', label: 'Progress versus indeterminate' },
        { id: 'copy', label: 'Loading copy' },
        { id: 'a11y', label: 'Accessibility announcements' },
        { id: 'motion', label: 'Reduced motion' },
        { id: 'error', label: 'Transition to error' },
      ]}
      related={[
        { title: 'Errors', to: '/patterns/errors', note: 'When loading fails.' },
        { title: 'Motion', to: '/foundations/motion', note: 'Duration tokens.' },
        { title: 'Empty states', to: '/patterns/empty-states', note: 'Empty is not loading.' },
      ]}
      {...seq('/patterns/loading')}
    >
      <h2 className="dc-h2" id="hierarchy">The loading hierarchy</h2>
      <p>Scope determines treatment. The larger the region, the more context must survive.</p>
      <ScrollTable head={['Scope', 'Treatment', 'Envision example']}>
        {[
          ['Interaction feedback', 'The control shows a spinner and blocks re-activation', 'Button loading state'],
          ['Component', 'The component dims and marks itself busy', 'RightRail loading'],
          ['Content region', 'The region indicates loading, chrome stays put', 'A rail body while selections resolve'],
          ['Whole page', 'Rare. Only on first entry', 'Initial Design Center load'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <Callout type="Developer" title="Envision has no skeleton component">
        There is no skeleton or shimmer placeholder in the registry. Loading is expressed by the Button loading state
        and by the RightRail dimming its body with <code>aria-busy</code>. Skeletons are not documented here because
        they do not exist.
      </Callout>
      <LivePreview caption="The two loading affordances that actually exist.">
        <envision-button variant="primary" label="Saving…" loading />
        <envision-button variant="outline" label="Apply design" />
      </LivePreview>

      <h2 className="dc-h2" id="context">Preserve context</h2>
      <p>
        Replace as little as possible. If a selection is being applied, the rail, the totals and the other decisions
        should all remain: only the part that is actually changing should indicate it.
      </p>
      <p>
        Replacing a whole screen with a spinner discards everything the person could still read, and makes the wait
        feel longer than it is.
      </p>

      <h2 className="dc-h2" id="shift">Avoid layout shift</h2>
      <p>
        A loading state should occupy the same space as the content that will replace it. Nothing is more disorienting
        than content arriving and pushing what you were reading off-screen.
      </p>
      <p>
        The RightRail's approach is instructive: it keeps the body in place and reduces its opacity, so nothing moves
        when the content resolves.
      </p>

      <h2 className="dc-h2" id="determinate">Progress versus indeterminate</h2>
      <p>
        Show real progress only when the total is genuinely known. A progress bar that jumps to 90% and waits is worse
        than a spinner, because it made a promise.
      </p>
      <p>Under a second, show nothing: a spinner that flashes is noise.</p>

      <h2 className="dc-h2" id="copy">Loading copy</h2>
      <p>
        Say what is happening, in the present tense, when the wait is long enough to warrant text. “Saving…” is
        better than “Please wait”. Below a couple of seconds, the spinner alone is enough.
      </p>

      <h2 className="dc-h2" id="a11y">Accessibility announcements</h2>
      <p>
        A loading region sets <code>aria-busy="true"</code> and clears it when done. A control that is loading must
        stay focusable: disabling it moves focus to the body and the person loses their place mid-task. Envision Button
        does exactly this, blocking activation while remaining focusable and announcing <code>aria-busy</code>.
      </p>

      <h2 className="dc-h2" id="motion">Reduced motion</h2>
      <p>
        Under <code>prefers-reduced-motion</code>, the spinner slows rather than stopping, so it still communicates
        activity without rapid rotation. Envision implements this in the component itself.
      </p>

      <h2 className="dc-h2" id="error">Transition to error</h2>
      <p>
        Every loading state needs a failure path. A spinner that never resolves is the worst outcome available: the
        person cannot tell whether to wait or retry. Give the wait a timeout and an error state.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------------- errors */

export function ErrorsPattern() {
  return (
    <DocArticle
      trail={trail('Errors')}
      title="Errors"
      lead="Where an error appears tells someone how much of their work is affected. Getting the level wrong turns a field-level typo into a page-level panic."
      toc={[
        { id: 'hierarchy', label: 'The error hierarchy' },
        { id: 'field', label: 'Field errors' },
        { id: 'component', label: 'Component errors' },
        { id: 'workflow', label: 'Workflow errors' },
        { id: 'page', label: 'Page-level errors' },
        { id: 'system', label: 'System failures' },
        { id: 'focus', label: 'Focus and announcement' },
        { id: 'retry', label: 'Retry and persistence' },
        { id: 'content', label: 'Content' },
      ]}
      related={[
        { title: 'Validation & errors', to: '/content/errors', note: 'The copy model.' },
        { title: 'Accessible forms', to: '/accessibility/forms', note: 'Association and announcement.' },
        { title: 'Forms', to: '/patterns/forms', note: 'Where most errors happen.' },
      ]}
      {...seq('/patterns/errors')}
    >
      <h2 className="dc-h2" id="hierarchy">The error hierarchy</h2>
      <ScrollTable head={['Level', 'Scope', 'Placement', 'Recovery']}>
        {[
          ['Field', 'One input', 'With the field', 'Fix the value'],
          ['Component', 'One component', 'Inside the component', 'Retry that part'],
          ['Workflow', 'A task in progress', 'At the step', 'Change something and continue'],
          ['Page', 'Everything on screen', 'Replacing the content', 'Reload or go back'],
          ['System', 'The product', 'Global', 'Wait, or contact support'],
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
        Choose the smallest level that is true. Escalating a field error to a page banner implies the whole screen is
        broken and destroys trust in every other error you show.
      </p>

      <h2 className="dc-h2" id="field">Field errors</h2>
      <p>
        Sit with the field, replace the helper text, and are associated by <code>aria-describedby</code>. Envision
        Field wires this and sets <code>aria-invalid</code>, so the error is announced with the control.
      </p>
      <LivePreview caption="Real Field. The error replaces helper text and is associated with the input.">
        <div style={{ width: 320 }}>
          <envision-input label="Email" type="email" value="not-an-email" invalid error-message="Enter a valid email address." />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="component">Component errors</h2>
      <p>
        When one component fails but the page is fine, the error stays inside it. A finish group that could not load
        should say so in its own space, leaving the rest of the rail usable.
      </p>

      <h2 className="dc-h2" id="workflow">Workflow errors</h2>
      <p>
        The person's task cannot continue, but nothing is broken: a selection is unavailable in their region, or a
        package conflicts with a previous choice. State what conflicts and what can be changed. Never discard the rest
        of the work.
      </p>

      <h2 className="dc-h2" id="page">Page-level errors</h2>
      <p>
        Only when nothing on the page is usable. Say what failed, offer retry, and offer a way back to somewhere that
        works.
      </p>

      <h2 className="dc-h2" id="system">System failures</h2>
      <p>
        Something is wrong beyond this screen. Be honest that it is not the person's fault and not something they can
        fix. Do not offer a retry that cannot succeed.
      </p>

      <h2 className="dc-h2" id="focus">Focus and announcement</h2>
      <p>
        On failed submit, move focus to the first invalid field. For an error that appears without a user action, use a
        live region: moving focus for an unrequested error interrupts whatever they were doing.
      </p>
      <p>
        Errors must never be color alone. Envision pairs the error color with a message, and Field sets{' '}
        <code>aria-invalid</code> so the state is programmatic rather than visual.
      </p>

      <h2 className="dc-h2" id="retry">Retry and persistence</h2>
      <p>
        A retry should be one action, not a re-navigation. Field errors persist until fixed; transient errors clear
        when the condition resolves. An error that outlives its cause teaches people to ignore errors.
      </p>

      <h2 className="dc-h2" id="content">Content</h2>
      <p>
        Three parts: what happened, what needs attention, how to fix it. “Enter a valid email address” does all three
        in five words. Full guidance is on <a href="/content/errors">Validation &amp; errors</a>.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------- confirmation */

export function ConfirmationPattern() {
  return (
    <DocArticle
      trail={trail('Confirmation')}
      title="Confirmation"
      lead="Confirmation tells someone what happened, or asks whether they meant it. Most interfaces over-use the second and under-use the first."
      toc={[
        { id: 'types', label: 'Five kinds of confirmation' },
        { id: 'inline', label: 'Inline feedback' },
        { id: 'passive', label: 'Passive confirmation' },
        { id: 'before', label: 'Confirm before acting' },
        { id: 'destructive', label: 'Destructive confirmation' },
        { id: 'completion', label: 'Completion states' },
        { id: 'not-modal', label: 'When not to interrupt' },
        { id: 'actions', label: 'Action hierarchy and cancel' },
        { id: 'a11y', label: 'Focus and keyboard' },
      ]}
      related={[
        { title: 'Selection', to: '/patterns/selection', note: 'Where Envision commits.' },
        { title: 'Buttons & actions', to: '/content/actions', note: 'Naming the commit.' },
        { title: 'Errors', to: '/patterns/errors', note: 'When confirmation fails.' },
      ]}
      {...seq('/patterns/confirmation')}
    >
      <h2 className="dc-h2" id="types">Five kinds of confirmation</h2>
      <ScrollTable head={['Kind', 'When', 'Interrupts?']}>
        {[
          ['Inline feedback', 'The result is visible immediately', 'No'],
          ['Passive confirmation', 'Something succeeded but is not visible', 'No'],
          ['Confirm before acting', 'The action is consequential and hard to undo', 'Yes'],
          ['Destructive confirmation', 'The action destroys something', 'Yes, with friction'],
          ['Completion state', 'A whole task finished', 'Replaces the view'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="inline">Inline feedback</h2>
      <p>
        The best confirmation is the change itself. When someone selects a finish and the visualization updates and the
        total changes, no message is needed: they can see it worked.
      </p>
      <p>Adding “Finish updated” on top of a visible change is noise.</p>

      <h2 className="dc-h2" id="passive">Passive confirmation</h2>
      <p>
        Needed when success is real but invisible, such as selections saved to a record the person cannot see. State it
        briefly, near the action, without blocking anything.
      </p>

      <h2 className="dc-h2" id="before">Confirm before acting</h2>
      <p>
        Justified only when the action is consequential and cannot easily be undone. Submitting selections to a builder
        qualifies. Choosing a countertop does not: it is reversible, and confirming every reversible choice makes
        exploration exhausting.
      </p>
      <p>The dialog must say what will happen, not ask “Are you sure?”. Certainty is not information.</p>

      <h2 className="dc-h2" id="destructive">Destructive confirmation</h2>
      <p>
        Name the thing being destroyed and what is lost. The confirming action carries the verb (“Delete selections”),
        never “OK”, so someone reading only the button still knows what it does.
      </p>
      <p>Where undo is possible, prefer undo over confirmation. Undo respects the person's time; confirmation taxes it.</p>

      <h2 className="dc-h2" id="completion">Completion states</h2>
      <p>
        A finished task earns a real completion view: what was accomplished, what happens next, and a way onward. This
        is the one place a larger, more celebratory treatment is appropriate.
      </p>

      <h2 className="dc-h2" id="not-modal">When not to interrupt</h2>
      <p>Do not use a modal when the action is reversible, low-consequence, immediately visible, or repeated often.</p>
      <p>
        Envision's Selection pattern deliberately has no confirmation per choice. Changing a finish updates everything
        instantly, because someone comparing six options would otherwise dismiss six dialogs.
      </p>

      <h2 className="dc-h2" id="actions">Action hierarchy and cancel</h2>
      <p>
        One primary action, one cancel. Cancel is always available, never disabled, and never the primary. For
        destructive actions, cancel is the safer default.
      </p>
      <LivePreview caption="Real Buttons: primary confirms, ghost cancels.">
        <envision-button variant="ghost" label="Cancel" />
        <envision-button variant="primary" label="Apply design" />
      </LivePreview>

      <h2 className="dc-h2" id="a11y">Focus and keyboard</h2>
      <p>
        A confirmation dialog takes focus on open, traps Tab, closes on Escape, and returns focus to the trigger. Focus
        goes to the dialog or its heading, not to the confirming button: focus on the destructive action makes Enter
        immediately dangerous.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------- progressive disclosure */

export function ProgressiveDisclosure() {
  return (
    <DocArticle
      trail={trail('Progressive disclosure')}
      title="Progressive disclosure"
      lead="Showing less at once, without making anything unfindable. The failure mode is not hiding too much; it is hiding things people never discover."
      toc={[
        { id: 'why', label: 'Why disclose progressively' },
        { id: 'discoverable', label: 'Preserving discoverability' },
        { id: 'techniques', label: 'Techniques' },
        { id: 'envision', label: 'Where Envision uses it' },
        { id: 'nesting', label: 'The risk of nesting' },
        { id: 'defaults', label: 'Choosing defaults' },
        { id: 'mobile', label: 'Mobile' },
        { id: 'a11y', label: 'Accessibility' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Selection', to: '/patterns/selection', note: 'Disclosure per decision.' },
        { title: 'Forms', to: '/patterns/forms', note: 'Advanced options.' },
        { title: 'Responsive patterns', to: '/patterns/responsive', note: 'Disclosure under pressure.' },
      ]}
      {...seq('/patterns/progressive-disclosure')}
    >
      <h2 className="dc-h2" id="why">Why disclose progressively</h2>
      <p>
        A kitchen has dozens of decisions across six categories. Showing them all at once is technically complete and
        practically unusable: the person cannot tell what needs attention now.
      </p>
      <p>Disclosure sequences complexity so someone can work through it rather than face all of it.</p>

      <h2 className="dc-h2" id="discoverable">Preserving discoverability</h2>
      <p>
        Hidden is not the same as absent. Someone must be able to tell that more exists and roughly what it is. A row
        showing the current choice tells you a decision exists and what it currently is, without showing the options.
      </p>
      <p>
        The test: could someone use the product for a week without discovering it? If yes, it is hidden too well.
      </p>

      <h2 className="dc-h2" id="techniques">Techniques</h2>
      <ScrollTable head={['Technique', 'Shows', 'Use when']}>
        {[
          ['Summary row', 'Current value; opens the options', 'Every decision has a current state'],
          ['Expand / collapse', 'A heading; reveals detail in place', 'Detail is supplementary'],
          ['Tray or sheet', 'A trigger; opens a focused surface', 'The choice needs room'],
          ['Tabs', 'One view; peers are visible', 'Views are equal alternatives'],
          ['Advanced section', 'Common options; rare ones on request', 'Most people never need the rest'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="envision">Where Envision uses it</h2>
      <p>
        OptionCard is the clearest case: a row shows the decision, its current value and its cost, and opens a tray
        containing the options. The decision is always visible; only the choosing is deferred.
      </p>
      <ProductExample
        title="Design Center · disclosure per decision"
        surface={<DesignCenterRail />}
        annotations={[
          'Each row discloses one decision without showing its options.',
          'The current choice and cost stay visible, so nothing is hidden that matters.',
          'The active row is the open tray, so the person can see where they are.',
          'Tabs disclose a whole alternative view rather than more detail.',
        ]}
      />

      <h2 className="dc-h2" id="nesting">The risk of nesting</h2>
      <p>
        One level of disclosure helps. Two is usually a sign the information architecture is wrong. Three is a maze:
        people cannot form a mental model of where things are, and they stop looking.
      </p>

      <h2 className="dc-h2" id="defaults">Choosing defaults</h2>
      <p>
        Default open when the content is needed to make the current decision. Default closed when it is supplementary.
        If you cannot decide, the content is probably in the wrong place.
      </p>

      <h2 className="dc-h2" id="mobile">Mobile</h2>
      <p>
        Narrow screens need more disclosure, and that raises the discoverability risk. Compensate by making triggers
        more explicit, not by hiding more aggressively.
      </p>

      <h2 className="dc-h2" id="a11y">Accessibility</h2>
      <p>
        A disclosure trigger is a button with <code>aria-expanded</code>. Collapsed content is genuinely hidden, not
        visually clipped: content hidden only visually is still reachable by keyboard and screen reader, which produces
        focus landing on something invisible.
      </p>
      <p>Expanding must not move focus. The person asked to see more, not to be relocated.</p>

      <h2 className="dc-h2" id="dodont">Do and don’t</h2>
      <DoDont
        items={[
          { kind: 'do', text: 'Show the current value on the collapsed trigger, so a hidden decision is still legible at a glance.' },
          { kind: 'dont', text: 'Collapse a decision behind a label alone. The person has to open every row to find out where they are.' },
          { kind: 'do', text: 'Keep disclosure to one level.' },
          { kind: 'dont', text: 'Nest disclosure inside disclosure. Nobody builds a mental model of the second level.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------- responsive patterns */

export function ResponsivePatterns() {
  return (
    <DocArticle
      trail={trail('Responsive patterns')}
      title="Responsive patterns"
      lead="Foundations covers how layouts adapt. This page covers how complete interaction patterns adapt, which is a different problem: behavior and sequence change, not only geometry."
      toc={[
        { id: 'difference', label: 'Why patterns differ from layout' },
        { id: 'navigation', label: 'Navigation' },
        { id: 'forms', label: 'Forms' },
        { id: 'selection', label: 'Selection' },
        { id: 'filtering', label: 'Filtering' },
        { id: 'confirmation', label: 'Confirmation' },
        { id: 'panels', label: 'Panels and rails' },
        { id: 'principles', label: 'Common principles' },
      ]}
      related={[
        { title: 'Responsive design', to: '/foundations/responsive-design', note: 'The layout foundation.' },
        { title: 'Breakpoints', to: '/foundations/breakpoints', note: 'The thresholds.' },
        { title: 'Responsive tokens', to: '/tokens/responsive', note: 'What changes automatically.' },
      ]}
      {...seq('/patterns/responsive')}
    >
      <h2 className="dc-h2" id="difference">Why patterns differ from layout</h2>
      <p>
        A layout adapts by changing values: a column narrows, a gutter shrinks, a grid stacks. A pattern may have to
        change what someone can do at once, in what order, and how they get back.
      </p>
      <p>
        That is why layout adaptation can be tokenized and pattern adaptation cannot. A token cannot make a rail become
        a focus-trapped dialog.
      </p>

      <h2 className="dc-h2" id="navigation">Navigation</h2>
      <ScrollTable head={['Width', 'Behavior', 'Why']}>
        {[
          ['Desktop', 'Persistent sidebar, always visible', 'Space is available; orientation is free'],
          ['Tablet', 'Sidebar persists; content column narrows', 'Chrome yields before content does'],
          ['Mobile', 'Drawer behind a menu button, focus-trapped', 'A persistent sidebar would leave no content'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The behavioral change is the important part: the drawer acquires a modal contract the sidebar never had. Same
        destinations, different interaction model.
      </p>

      <h2 className="dc-h2" id="forms">Forms</h2>
      <p>
        Forms change least, because they are already single column. What changes is the action area: on narrow screens
        submit actions become full width and stick to the bottom so they are reachable without scrolling.
      </p>

      <h2 className="dc-h2" id="selection">Selection</h2>
      <p>
        The most affected pattern. On desktop, choosing happens beside the visualization. On mobile the sheet covers
        it, so the person chooses, dismisses, and evaluates, turning a simultaneous comparison into a sequential one.
      </p>
      <p>
        What is protected: swatch size, the running total, and touch target size. What is given up: side-by-side
        comparison.
      </p>
      <ResponsiveExample
        widths={[420, 330, 270]}
        caption="A finish group at three widths. Swatches wrap rather than shrink, because a swatch below a judgeable size defeats its purpose."
      >
        <FinishGroup />
      </ResponsiveExample>

      <h2 className="dc-h2" id="filtering">Filtering</h2>
      <p>
        Filters move from beside the results into a sheet. The active filter count must move onto the trigger,
        otherwise a person on a phone cannot tell that results are filtered at all, which is exactly when a filtered
        empty state gets mistaken for a bug.
      </p>

      <h2 className="dc-h2" id="confirmation">Confirmation</h2>
      <p>
        Dialogs become full-height sheets. The action hierarchy must survive: the primary action stays visually
        primary, and cancel stays available. Stacking buttons vertically is fine; reversing their order is not.
      </p>

      <h2 className="dc-h2" id="panels">Panels and rails</h2>
      <p>
        The rail transform is the reference implementation: the same component and API re-composes into a modal dialog
        below 1024, with focus moved in, Tab trapped, Escape closing, and focus restored on close.
      </p>

      <h2 className="dc-h2" id="principles">Common principles</h2>
      <ul>
        <li><strong>Decide priority first.</strong> What must stay visible determines everything else.</li>
        <li><strong>Never shrink a touch target.</strong> Narrow width means touch is more likely, not less.</li>
        <li><strong>A new presentation needs its own contract.</strong> Anything that becomes modal owes the full focus contract.</li>
        <li><strong>Keep the consequence visible.</strong> Cost, count and status are the last things to hide.</li>
        <li><strong>Reuse the component.</strong> A separate mobile implementation drifts within one release.</li>
      </ul>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- workflows */

export function ComplexWorkflows() {
  return (
    <DocArticle
      trail={trail('Complex workflows')}
      title="Complex workflows"
      lead="A workflow is where the whole system has to work at once. This page follows one real Envision task end to end and names the pattern, components, content and accessibility behavior at every step."
      toc={[
        { id: 'what', label: 'What a workflow is' },
        { id: 'journey', label: 'The Design Center journey' },
        { id: 'map', label: 'Step by step' },
        { id: 'across', label: 'What runs across every step' },
        { id: 'responsive', label: 'The workflow on a phone' },
        { id: 'lessons', label: 'What this shows about the system' },
      ]}
      related={[
        { title: 'Selection', to: '/patterns/selection', note: 'The pattern used most in this workflow.' },
        { title: 'Components', to: '/components', note: 'Everything used here.' },
        { title: 'Confirmation', to: '/patterns/confirmation', note: 'The commit step.' },
      ]}
      {...seq('/patterns/workflows')}
    >
      <h2 className="dc-h2" id="what">What a workflow is</h2>
      <p>
        A product-specific sequence that completes a task. Workflows belong to the product rather than the system: the
        system supplies the patterns, and the product decides the order.
      </p>
      <p>
        Documenting one here is worthwhile because it shows the system operating as an ecosystem rather than as a
        catalog.
      </p>

      <h2 className="dc-h2" id="journey">The Design Center journey</h2>
      <LifecycleRing
        alt={
          'The Design Center workflow has seven stages: enter the Design Center, choose a package, choose a ' +
          'category, select a material or option, review the price impact, confirm the selection, and review all ' +
          'selections.'
        }
        stages={['Enter', 'Choose package', 'Choose category', 'Select option', 'Review impact', 'Confirm', 'Review all']}
        caption="Seven steps, four patterns, and roughly a dozen components."
      />

      <h2 className="dc-h2" id="map">Step by step</h2>
      <ScrollTable head={['Step', 'Pattern', 'Components', 'Content', 'Accessibility']}>
        {[
          ['Enter the Design Center', 'Navigation', 'GlobalNav, Tab', 'Name the room, not the action', 'Landmarks; one active item per level'],
          ['Choose a package', 'Selection (bundle)', 'PackageCard, Badge', '“Popular” is a badge, not a claim in prose', 'Card is one button; badge has an accessible name'],
          ['Choose a category', 'Navigation (local)', 'Tab, OptionCard', 'Category names match the product vocabulary', 'Tablist with roving tabindex'],
          ['Select a material', 'Selection (material)', 'MaterialSwatch, OptionCard', 'Material plus finish plus cost', 'Ring and check, never color; group is one tab stop'],
          ['Review price impact', 'Selection (feedback)', 'PriceAdjustment, Badge', 'Delta from included, not absolute', 'Tabular figures; not color-coded'],
          ['Confirm', 'Confirmation', 'Button, BottomActionTray', 'Verb names the outcome: “Apply design”', 'Focus stays; loading blocks re-activation'],
          ['Review all selections', 'Selection (summary)', 'SelectionSummary, OptionCard', '“Included” rather than “$0”', 'List semantics; totals announced'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
            <td style={TABLE_CELL}>{r[4]}</td>
          </tr>
        ))}
      </ScrollTable>
      <Callout type="Note" title="Not every component here is implemented">
        PriceAdjustment, SelectionSummary, BottomActionTray and GlobalNav are specified in the registry but not built
        in <code>@envision/components</code>. They appear in this map because they are part of the designed workflow;
        their component pages state their implementation status.
      </Callout>

      <h2 className="dc-h2" id="across">What runs across every step</h2>
      <ProductExample
        title="Design Center · the workflow surface"
        surface={<DesignCenterRail />}
        annotations={[
          'The rail persists across every step, so context is never lost.',
          'The running total accumulates decisions from all categories.',
          'Tabs switch between Customize and Packages without leaving the room.',
          'One commit point serves the whole set of choices.',
        ]}
        caption="Real production components in the product's own arrangement."
      />
      <ul>
        <li><strong>The visualization stays.</strong> Every decision is judged against the thing it changes.</li>
        <li><strong>Cost accumulates visibly.</strong> The total is never more than a glance away.</li>
        <li><strong>Nothing commits until Apply.</strong> Exploration is free; commitment is explicit and singular.</li>
        <li><strong>Focus returns.</strong> Every tray and sheet gives focus back to what opened it.</li>
      </ul>

      <h2 className="dc-h2" id="responsive">The workflow on a phone</h2>
      <p>
        Below 1024 the rail becomes a modal sheet, and the workflow changes from simultaneous to sequential: choose,
        dismiss, evaluate, repeat. The steps are identical; the rhythm is not.
      </p>
      <p>
        Two things are protected: swatches never shrink below a judgeable size, and the running total stays visible.
        Everything else is negotiable.
      </p>

      <h2 className="dc-h2" id="lessons">What this shows about the system</h2>
      <p>
        One workflow uses four patterns and about a dozen components, and no step required a bespoke interaction. That
        is the return on the system: the product team decided the <em>order</em> of decisions, and the system supplied
        everything about how each decision behaves.
      </p>
      <p>
        It also shows the honest gap. Four of the components in this workflow are specified but not built, so the
        workflow is currently designed end to end and implemented in part.
      </p>
    </DocArticle>
  );
}
