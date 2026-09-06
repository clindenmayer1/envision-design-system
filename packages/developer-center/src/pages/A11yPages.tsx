import { Callout, DoDont, DocCard, DocGrid, LivePreview, SectionIntro, TokenTable } from '../modules';
import { LayerStack } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { FinishGroup } from '../modules/product';
import { DocArticle, SectionLanding } from '../templates';
import { A11Y_ORDER, sectionNav } from './sections';
import { system } from '../data/generated';

const { seq, trail } = sectionNav(A11Y_ORDER, 'Accessibility', '/accessibility');

/* ------------------------------------------------------------------ landing */

export function AccessibilityLanding() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Accessibility' }]}
      title="Accessibility"
      lead="Accessibility is a system-level quality requirement that shapes Envision foundations, components, patterns, content, and testing."
      related={[
        { title: 'Foundations', to: '/foundations', note: 'Where contrast and motion are decided.' },
        { title: 'Components', to: '/components', note: 'Per-component behavior.' },
        { title: 'Content', to: '/content', note: 'Language people can act on.' },
      ]}
      next={{ title: 'Accessibility principles', to: '/accessibility/principles' }}
      intro={
        <SectionIntro
          heading="Not a stage. A property of every stage."
          body="Contrast is decided in Foundations. Focus behavior lives in Components. Flow belongs to Patterns. Clarity belongs to Content. Drawing accessibility as a final checklist is how it becomes one."
          cta={{ label: 'Accessibility principles', to: '/accessibility/principles' }}
          visual={
            <div style={{ display: 'grid', gap: 'var(--dc-space-2)' }}>
              {['Foundations', 'Tokens', 'Components', 'Patterns', 'Content', 'Testing'].map((l) => (
                <div key={l} style={{
                  display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'var(--dc-space-3)', alignItems: 'center',
                  padding: 'var(--dc-space-3) var(--dc-space-4)', borderRadius: 'var(--envision-t1-border-radius-8)',
                  background: 'var(--dc-surface)',
                  border: '1px solid var(--envision-t2-color-border-default-default)',
                }}>
                  <strong style={{ fontSize: 'var(--envision-t1-font-size-14)' }}>{l}</strong>
                  <span style={{
                    fontSize: 'var(--envision-t1-font-size-11)', padding: 'var(--dc-space-1) var(--dc-space-2)', borderRadius: 'var(--envision-t1-border-radius-pill)',
                    background: 'var(--dc-diagram-active-surface)',
                    border: '1px solid var(--dc-diagram-active-line)',
                  }}>accessibility</span>
                </div>
              ))}
            </div>
          }
        />
      }
      grid={
        <DocGrid columns={4}>
          <DocCard to="/accessibility/overview" title="Overview">What the system guarantees, and what you own.</DocCard>
          <DocCard to="/accessibility/principles" title="Principles">Derived from what Envision actually does.</DocCard>
          <DocCard to="/accessibility/wcag" title="WCAG standards">The framework, and Envision's stated position.</DocCard>
          <DocCard to="/accessibility/contrast" title="Color &amp; contrast">Pairing rules, and product material.</DocCard>
          <DocCard to="/accessibility/keyboard" title="Keyboard navigation">Expected keys by control family.</DocCard>
          <DocCard to="/accessibility/focus" title="Focus management">Where focus goes when things change.</DocCard>
          <DocCard to="/accessibility/screen-readers" title="Screen readers">Names, roles, states, announcements.</DocCard>
          <DocCard to="/accessibility/testing" title="Testing requirements">What to run, and what it cannot prove.</DocCard>
        </DocGrid>
      }
    >
      {/* Absorbed from the former /accessibility/overview, which repeated this page title. */}
      <section>
        <h2 className="dc-h2" id="system">Accessibility as system architecture</h2>
        <p>
          Anything left to per-feature review eventually gets skipped under deadline. Envision's approach is to build in
          what can be built in, so the default path is accessible and deviating takes effort.
        </p>
        <LayerStack
          alt="Accessibility applies at every layer: foundations decide contrast, tokens carry focus values, components own keyboard and semantics, patterns own flow, content owns clarity, and testing verifies all of it."
          layers={[
            { label: 'Testing', note: 'Verifies what the others claim', tone: 'neutral' },
            { label: 'Content', note: 'Language someone can act on', tone: 'neutral' },
            { label: 'Patterns', note: 'Flow, focus transitions, sequence', tone: 'abstract' },
            { label: 'Components', note: 'Semantics, keyboard, state', tone: 'abstract' },
            { label: 'Tokens', note: 'Focus ring, contrast pairings', tone: 'active' },
            { label: 'Foundations', note: 'Contrast, motion, color independence', tone: 'active' },
          ]}
        />

        <h2 className="dc-h2" id="guarantees">What Envision provides</h2>
        <ul>
          <li><strong>Native semantics.</strong> Components render real buttons, inputs and labels, so platform behavior is inherited rather than reimplemented.</li>
          <li><strong>Keyboard mechanics.</strong> Activation, roving tabindex in groups, arrow keys, Home and End.</li>
          <li><strong>A visible focus ring</strong> drawn from a token, offset so it is never clipped.</li>
          <li><strong>State beyond color.</strong> Selection is a ring and a check; errors carry a message and <code>aria-invalid</code>.</li>
          <li><strong>Contrast pairings.</strong> Content roles are designed against the surfaces they sit on.</li>
          <li><strong>Reduced motion.</strong> Honored inside components rather than left to the page.</li>
        </ul>

        <h2 className="dc-h2" id="cannot">What components cannot guarantee</h2>
        <p>
          A component sees itself and nothing else. It cannot know what it is for, what surrounds it, or whether it was
          the right choice.
        </p>
        <ul>
          <li><strong>A meaningful accessible name.</strong> Only you know what the button does.</li>
          <li><strong>Heading hierarchy and landmarks</strong> across the page.</li>
          <li><strong>Reading order</strong> matching visual order.</li>
          <li><strong>Choosing the right component.</strong> A perfectly accessible Button used for navigation is still wrong.</li>
          <li><strong>Focus on route change</strong> and after removing the focused element.</li>
        </ul>

        <h2 className="dc-h2" id="roles">Responsibility by discipline</h2>
        <ScrollTable head={['Discipline', 'Owns']}>
          {[
            ['Design', 'Contrast in composition, color-independent state, target size, focus visibility in context, heading structure'],
            ['Engineering', 'Correct component choice, accessible names, DOM order, focus on route change, live regions'],
            ['Content', 'Labels that describe outcomes, errors that say how to recover, links that make sense out of context'],
            ['Testing', 'Keyboard passes, screen-reader spot checks, zoom and reflow, contrast verification'],
          ].map((r) => (
            <tr key={r[0]}>
              <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
              <td style={TABLE_CELL}>{r[1]}</td>
            </tr>
          ))}
        </ScrollTable>

        <h2 className="dc-h2" id="where">Where guidance appears</h2>
        <p>
          Accessibility guidance is not confined to this section. Every component page has an accessibility section
          generated from the registry, every pattern states its focus and keyboard expectations, and Foundations covers
          contrast and reduced motion. This section holds what applies across all of them.
        </p>
      </section>
    </SectionLanding>
  );
}

/* ----------------------------------------------------------------- overview */

/* --------------------------------------------------------------- principles */

const A11Y_PRINCIPLES = [
  {
    name: 'Native semantics first',
    rule: 'Use the platform element that already does the job.',
    why: 'A real button is focusable, activates on Enter and Space, announces its role and works with every assistive technology without configuration. Recreating that with a div and ARIA reproduces a fraction of it.',
    design: 'If it behaves like a button, draw it as a button rather than a styled surface.',
    engineering: 'Envision components render native elements inside their shadow root for exactly this reason.',
    evidence: 'The registry records the semantic contract per component, and Button renders a real <button>.',
  },
  {
    name: 'Everything is keyboard operable',
    rule: 'Any task possible with a mouse is possible with a keyboard.',
    why: 'Keyboard operability is the foundation other assistive technology sits on. Switch access, voice control and screen readers all depend on it.',
    design: 'Design the focus state, not just hover. Hover-only affordances do not exist for keyboard or touch.',
    engineering: 'Grouped controls are one tab stop with arrow keys, not one stop per option.',
    evidence: 'Tab implements roving tabindex with arrow, Home and End handling.',
  },
  {
    name: 'Focus is always visible',
    rule: 'Never remove an outline without replacing it.',
    why: 'For a keyboard user the focus ring is the cursor. Removing it makes the interface unusable while looking tidier.',
    design: 'The ring is 2px, brand-colored and offset, so it is never clipped by a corner or a neighbor.',
    engineering: 'Drawn on :focus-visible, so it appears for keyboard use without ringing every mouse click.',
    evidence: 'Every focusable element in the system and in this documentation uses the same focus token.',
  },
  {
    name: 'State is never color alone',
    rule: 'Anything color communicates must also be communicated another way.',
    why: 'In Envision this is not only about color vision. Material swatches are themselves colored, so a color-based selected state competes with the content it marks.',
    design: 'Selection is a ring plus a check. Errors carry a message. Cost is never red or green.',
    engineering: 'Set the programmatic state as well: aria-selected, aria-invalid, aria-pressed.',
    evidence: 'MaterialSwatch signals selection with a ring and a check mark.',
  },
  {
    name: 'Layouts reflow rather than shrink',
    rule: 'Adapt to available space instead of scaling down.',
    why: 'Reflow and zoom are the same mechanism. A layout that reflows properly is usable at 200% zoom without horizontal scrolling.',
    design: 'Design the adapted state as a real state, not as a squeezed desktop.',
    engineering: 'Wide content scrolls inside its own container; the document never scrolls horizontally.',
    evidence: 'Every route in this documentation is verified for document-level overflow at five widths.',
  },
  {
    name: 'Motion is never required to understand',
    rule: 'Honor reduced motion, and never carry meaning in animation alone.',
    why: 'Motion can cause physical discomfort. Someone who has turned it off must lose nothing but the movement.',
    design: 'If a change is only announced by an animation, it is not announced.',
    engineering: 'prefers-reduced-motion removes transitions and slows the spinner rather than stopping it.',
    evidence: 'Implemented inside Button and in this site’s stylesheet.',
  },
];

export function A11yPrinciples() {
  return (
    <DocArticle
      trail={trail('Accessibility principles')}
      title="Accessibility principles"
      lead="Six principles, each derived from something the system already does rather than from aspiration, with the supporting evidence named."
      toc={A11Y_PRINCIPLES.map((p, i) => ({ id: `p${i}`, label: p.name }))}
      related={[
        { title: 'Overview', to: '/accessibility/overview', note: 'The responsibility split.' },
        { title: 'Focus management', to: '/accessibility/focus', note: 'Principle three in depth.' },
        { title: 'Color & contrast', to: '/accessibility/contrast', note: 'Principle four in depth.' },
      ]}
      {...seq('/accessibility/principles')}
    >
      <Callout type="Note" title="Derived, not aspirational">
        Each principle below is supported by something observable in the repository. Candidates that could not be
        defended from the system were left out.
      </Callout>
      {A11Y_PRINCIPLES.map((p, i) => (
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
          }}>{p.rule}</p>
          <h3 className="dc-h3">Why it matters</h3>
          <p>{p.why}</p>
          <h3 className="dc-h3">In practice</h3>
          <p><strong>Design.</strong> {p.design}</p>
          <p><strong>Engineering.</strong> {p.engineering}</p>
          <p className="dc-small"><strong>Evidence:</strong> {p.evidence}</p>
        </section>
      ))}
    </DocArticle>
  );
}

/* ---------------------------------------------------------------------- wcag */

export function Wcag() {
  return (
    <DocArticle
      trail={trail('WCAG standards')}
      title="WCAG standards"
      lead="WCAG is the framework accessibility requirements are written against. This page explains it in Envision terms and states plainly what Envision has and has not formally committed to."
      toc={[
        { id: 'what', label: 'What WCAG is' },
        { id: 'target', label: 'Envision’s conformance target' },
        { id: 'perceivable', label: 'Perceivable' },
        { id: 'operable', label: 'Operable' },
        { id: 'understandable', label: 'Understandable' },
        { id: 'robust', label: 'Robust' },
        { id: 'automated', label: 'What automation cannot prove' },
      ]}
      related={[
        { title: 'Testing requirements', to: '/accessibility/testing', note: 'How conformance is checked.' },
        { title: 'Color & contrast', to: '/accessibility/contrast', note: 'The most cited criteria.' },
        { title: 'Principles', to: '/accessibility/principles', note: 'Envision’s own position.' },
      ]}
      {...seq('/accessibility/wcag')}
    >
      <h2 className="dc-h2" id="what">What WCAG is</h2>
      <p>
        The Web Content Accessibility Guidelines, published by the W3C: a set of testable success criteria organized
        under four principles, at three conformance levels (A, AA, AAA). It is the vocabulary accessibility
        requirements are written in, including most legal requirements.
      </p>
      <p>
        <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noreferrer">
          W3C Web Accessibility Initiative: WCAG ↗
        </a>
      </p>

      <h2 className="dc-h2" id="target">Envision's conformance target</h2>
      <Callout type="Important" title="No formal conformance target is recorded in this repository">
        <p style={{ margin: '0 0 8px' }}>
          The component registry records per-component keyboard, ARIA and semantic expectations, and the test suites
          include accessibility assertions. What does not exist in source is a stated WCAG version and level that
          Envision claims to meet, or an audit backing such a claim.
        </p>
        <p style={{ margin: 0 }}>
          Claiming AA here would be inventing a commitment. WCAG 2.2 AA is the conventional target for a product like
          this and is what the guidance in this section is written against, but it is a <strong>recommendation</strong>,
          not a recorded organizational position.
        </p>
      </Callout>

      <h2 className="dc-h2" id="perceivable">Perceivable</h2>
      <p>Information must be presentable in ways people can perceive. In Envision this mostly means three things:</p>
      <ul>
        <li>Contrast pairings between content roles and the surfaces they sit on.</li>
        <li>State never carried by color alone, which matters doubly where product material is itself colored.</li>
        <li>Text alternatives that describe what an image is evidence of, not what it depicts.</li>
      </ul>

      <h2 className="dc-h2" id="operable">Operable</h2>
      <p>
        Interface components must be operable by keyboard and not create traps. Envision components carry the keyboard
        mechanics; products own focus on route change and after removing focused elements. Overlays owe the full focus
        contract: in, trapped, Escape, returned.
      </p>

      <h2 className="dc-h2" id="understandable">Understandable</h2>
      <p>
        Content and operation must be predictable. This is where Content guidance does accessibility work: an error
        that says what happened and how to fix it satisfies a WCAG criterion and is simply better writing.
      </p>

      <h2 className="dc-h2" id="robust">Robust</h2>
      <p>
        Content must work with current and future assistive technology, which in practice means correct semantics.
        Envision's native-element approach is the robustness strategy: a real button will keep working.
      </p>

      <h2 className="dc-h2" id="automated">What automation cannot prove</h2>
      <p>
        Automated checks reliably catch missing names, invalid ARIA and contrast on solid backgrounds. They cannot tell
        you whether a name is meaningful, whether focus landed somewhere sensible, whether reading order matches visual
        order, or whether the right component was used.
      </p>
      <p>A green automated run is a floor, not a conclusion.</p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ contrast */

export function Contrast() {
  return (
    <DocArticle
      trail={trail('Color & contrast')}
      title="Color &amp; contrast"
      lead="Envision has a contrast problem most products do not: much of the screen is product material the system must not restyle. That constraint shapes every rule on this page."
      toc={[
        { id: 'text', label: 'Text contrast' },
        { id: 'nontext', label: 'Non-text contrast' },
        { id: 'focus', label: 'Focus' },
        { id: 'states', label: 'States and disabled content' },
        { id: 'independence', label: 'Color-independent communication' },
        { id: 'material', label: 'Product material versus chrome' },
        { id: 'testing', label: 'Testing' },
      ]}
      related={[
        { title: 'Color', to: '/foundations/color', note: 'The foundation.' },
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'The roles that encode pairings.' },
        { title: 'Imagery', to: '/foundations/imagery', note: 'Why material must not be restyled.' },
      ]}
      {...seq('/accessibility/contrast')}
    >
      <h2 className="dc-h2" id="text">Text contrast</h2>
      <p>
        Content roles are designed against the surfaces they are meant to sit on. Using a role on its intended surface
        is the reliable path; moving it elsewhere is where contrast quietly fails.
      </p>
      <TokenTable filter={(n) => n.startsWith('--envision-t2-color-content-')} />

      <h2 className="dc-h2" id="nontext">Non-text contrast</h2>
      <p>
        Borders, control edges, icons and focus indicators all carry meaning and all need to be perceivable. A hairline
        that is beautiful on a designer's monitor can be invisible on a laptop at an angle.
      </p>
      <p>
        This is why Envision draws a real border on controls that need a boundary rather than relying on a shadow: a
        shadow never counts toward contrast.
      </p>

      <h2 className="dc-h2" id="focus">Focus</h2>
      <p>
        The focus ring must be perceivable against every surface it can appear on. Envision uses one brand-colored
        2px ring with an offset, so it is never clipped and never sits directly on top of the element's own border.
      </p>
      <LivePreview caption="Tab to these to see the ring against two different surfaces.">
        <envision-button variant="primary" label="Primary" />
        <envision-button variant="outline" label="Outline" />
      </LivePreview>

      <h2 className="dc-h2" id="states">States and disabled content</h2>
      <p>
        Hover and pressed states must remain readable, not just different. A hover that lightens a button until its
        label fails contrast has traded feedback for legibility.
      </p>
      <p>
        Disabled content is conventionally exempt from contrast requirements, which is a license to make it unreadable.
        Envision's position: disabled still needs to be legible, because someone has to understand what is unavailable
        in order to work out how to enable it.
      </p>

      <h2 className="dc-h2" id="independence">Color-independent communication</h2>
      <p>
        Every state that color communicates is communicated another way: selection is a ring plus a check, errors
        carry a message and <code>aria-invalid</code>, and cost deltas are neutral text rather than red or green.
      </p>
      <LivePreview caption="Selected, available and unavailable, distinguishable without color.">
        <FinishGroup />
      </LivePreview>

      <h2 className="dc-h2" id="material">Product material versus interface chrome</h2>
      <Callout type="Important" title="Do not restyle product material to satisfy palette rules">
        A deep navy cabinet finish is product data. Lightening it to improve contrast against a label changes the
        product someone is buying. The rule is to move the interface, not the material: put text on a solid surface
        beside the swatch rather than over it, and mark states at the edge rather than as a tint.
      </Callout>
      <p>
        This is the practical difference between <strong>content</strong> and <strong>chrome</strong>. Chrome must meet
        contrast requirements. Content must be accurate, and the chrome around it must be arranged so accuracy and
        legibility do not compete.
      </p>

      <h2 className="dc-h2" id="testing">Testing</h2>
      <p>
        Automated checks verify text against solid backgrounds. They cannot evaluate text over an image, a gradient, or
        a material swatch, which is exactly where Envision's hardest cases live. Those need manual review.
      </p>
      <DoDont
        items={[
          { kind: 'do', text: 'Place text on a solid surface beside material imagery, so legibility does not depend on the photograph.' },
          { kind: 'dont', text: 'Put text over a material image with a scrim. The scrim tuned to one material fails on the next, and it alters how the material reads.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------------------ keyboard */

export function KeyboardNavigation() {
  return (
    <DocArticle
      trail={trail('Keyboard navigation')}
      title="Keyboard navigation"
      lead="Every task possible with a mouse must be possible with a keyboard. This page states what each key is expected to do, by control family, so a component behaves the way someone already expects."
      toc={[
        { id: 'reference', label: 'Key reference' },
        { id: 'order', label: 'Focus order' },
        { id: 'activation', label: 'Activation' },
        { id: 'groups', label: 'Grouped controls' },
        { id: 'tabs', label: 'Tabs' },
        { id: 'dialogs', label: 'Dialogs and sheets' },
        { id: 'escape', label: 'Escape' },
        { id: 'product', label: 'What the product owns' },
      ]}
      related={[
        { title: 'Focus management', to: '/accessibility/focus', note: 'Where focus goes.' },
        { title: 'Navigation pattern', to: '/patterns/navigation', note: 'Applied to navigation.' },
        { title: 'Components', to: '/components', note: 'Per-component keyboard notes.' },
      ]}
      {...seq('/accessibility/keyboard')}
    >
      <h2 className="dc-h2" id="reference">Key reference</h2>
      <ScrollTable head={['Key', 'Expected behavior', 'Applies to']}>
        {[
          ['Tab', 'Move to the next focusable control', 'Everywhere. One stop per control, not per option in a group.'],
          ['Shift + Tab', 'Move to the previous control', 'Everywhere'],
          ['Enter', 'Activate; submit from a text field', 'Button, IconButton, Link, Field'],
          ['Space', 'Activate or toggle', 'Button, Checkbox, Switch'],
          ['Arrow keys', 'Move within a group', 'Tab lists, radio groups, swatch groups'],
          ['Home / End', 'First or last item in a group', 'Tab lists and option groups'],
          ['Escape', 'Dismiss and restore focus', 'Sheets, trays, dialogs, search'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontFamily: 'ui-monospace, Menlo, monospace' }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="order">Focus order</h2>
      <p>
        DOM order is focus order, and DOM order must match visual order. A positive <code>tabindex</code> creates an
        ordering every future change has to maintain and fails silently when someone adds a control. Envision
        components never use one.
      </p>

      <h2 className="dc-h2" id="activation">Activation</h2>
      <p>
        Enter and Space both activate a button; Enter follows a link. This difference is inherited free from native
        elements and is one of the strongest arguments for using them: reimplementing it correctly is fiddly and
        usually done incompletely.
      </p>
      <LivePreview caption="Real controls. Tab to them and try Enter and Space.">
        <envision-button variant="primary" label="Apply design" />
        <envision-checkbox label="Include lighting package" />
        <envision-switch label="Show upgrade pricing" checked />
      </LivePreview>

      <h2 className="dc-h2" id="groups">Grouped controls</h2>
      <p>
        A group of related options is <strong>one</strong> tab stop. Arrow keys move within it, Home and End jump to the
        ends. This is the rule most often broken, and the cost is severe: a finish group with twenty swatches becomes
        twenty tab presses to pass.
      </p>

      <h2 className="dc-h2" id="tabs">Tabs</h2>
      <p>
        Envision Tab implements roving tabindex: only the selected tab is in the tab order, and arrow keys move
        selection. Wrap tabs in an element with <code>role="tablist"</code> for full semantics.
      </p>
      <LivePreview caption="A real tab list. Arrow keys move; Home and End jump.">
        <div role="tablist" style={{ display: 'flex', gap: 'var(--dc-space-5)' }}>
          <envision-tab label="Customize" selected />
          <envision-tab label="Packages" />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="dialogs">Dialogs and sheets</h2>
      <p>
        Four obligations: focus moves in on open, Tab is trapped while open, Escape closes, and focus returns to the
        trigger. The RightRail implements this in its sheet presentation below the tablet breakpoint, and this site's
        navigation drawer does the same.
      </p>

      <h2 className="dc-h2" id="escape">Escape</h2>
      <p>
        Escape means “get me out of this” and should work everywhere something is open. It should never destroy work
        beyond dismissing the transient thing.
      </p>

      <h2 className="dc-h2" id="product">What the product owns</h2>
      <ul>
        <li>DOM order matching visual order.</li>
        <li>Focus on route change.</li>
        <li>Focus after removing the element that had it.</li>
        <li>Not introducing hover-only affordances.</li>
        <li>Not adding custom gestures or shortcuts that conflict with assistive technology.</li>
      </ul>
    </DocArticle>
  );
}

/* ------------------------------------------------------------ screen readers */

export function ScreenReaders() {
  return (
    <DocArticle
      trail={trail('Screen readers')}
      title="Screen readers"
      lead="A screen reader conveys an interface through name, role, state and structure. If any of those is missing or wrong, the interface is wrong, however it looks."
      toc={[
        { id: 'nrs', label: 'Name, role, state' },
        { id: 'names', label: 'Accessible names' },
        { id: 'descriptions', label: 'Descriptions' },
        { id: 'states', label: 'States' },
        { id: 'live', label: 'Announcements and live regions' },
        { id: 'hidden', label: 'Hidden content' },
        { id: 'order', label: 'Reading order' },
        { id: 'images', label: 'Images' },
        { id: 'errors', label: 'Form errors' },
      ]}
      related={[
        { title: 'Semantic structure', to: '/accessibility/semantics', note: 'Where roles come from.' },
        { title: 'Accessible forms', to: '/accessibility/forms', note: 'Association and announcement.' },
        { title: 'Content', to: '/content', note: 'The words being announced.' },
      ]}
      {...seq('/accessibility/screen-readers')}
    >
      <h2 className="dc-h2" id="nrs">Name, role, state</h2>
      <p>Every interactive element must convey three things. Envision splits ownership of them precisely:</p>
      <ScrollTable head={['', 'What it answers', 'Provided by']}>
        {[
          ['Name', 'What is this?', 'You. The component cannot know.'],
          ['Role', 'What kind of thing is it?', 'The component, via the native element.'],
          ['State', 'What condition is it in?', 'The component, via ARIA attributes.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="names">Accessible names</h2>
      <p>
        A name must make sense read aloud, alone, with no surrounding context. “Edit” read out of context tells someone
        nothing; “Edit cabinet finish” tells them everything.
      </p>
      <p>
        For icon-only controls the name is mandatory, which is why Envision IconButton requires{' '}
        <code>accessible-name</code> rather than treating it as optional.
      </p>
      <LivePreview caption="Each of these carries a name that is not visible on screen.">
        <envision-icon-button icon="tune" accessible-name="Adjust settings" />
        <envision-icon-button icon="bookmark" accessible-name="Save design" selected />
      </LivePreview>

      <h2 className="dc-h2" id="descriptions">Descriptions</h2>
      <p>
        A description supplements a name with detail: helper text on a field, a constraint, a consequence. It is
        associated with <code>aria-describedby</code> and read after the name. Use it for detail, never for the name
        itself.
      </p>

      <h2 className="dc-h2" id="states">States</h2>
      <p>
        Visual state must have a programmatic equivalent. A swatch that looks selected must be{' '}
        <code>aria-selected</code>; a field showing an error must be <code>aria-invalid</code>; a toggled control must
        be <code>aria-pressed</code>. Envision components set these, which is a large part of what they buy you.
      </p>

      <h2 className="dc-h2" id="live">Announcements and live regions</h2>
      <p>
        Content that changes without a user action needs a live region, because a screen reader announces what is
        focused and what is polite-announced, not everything that changes.
      </p>
      <p>
        Use <code>polite</code> for almost everything: a result count updating, a total changing, a save confirming.
        Reserve <code>assertive</code> for something that must interrupt, which is rare and mostly means errors.
      </p>
      <Callout type="Accessibility" title="Announce, do not steal focus">
        Moving focus to announce something interrupts whatever the person was doing. Move focus only when their next
        action must happen somewhere specific. Otherwise announce and leave them alone.
      </Callout>

      <h2 className="dc-h2" id="hidden">Hidden content</h2>
      <p>
        Three different kinds of hidden, and mixing them up causes real defects. <code>display: none</code> hides from
        everyone. <code>aria-hidden</code> hides from assistive technology only, correct for decorative icons.
        Visually-hidden text is available to screen readers but not visible, correct for a label a design cannot show.
      </p>
      <p>
        The dangerous combination is content hidden only visually but still focusable: focus lands on something
        invisible and the person is lost.
      </p>

      <h2 className="dc-h2" id="order">Reading order</h2>
      <p>
        DOM order is reading order. CSS can move things visually without moving them in the DOM, which produces an
        interface that reads in a different order than it looks. If the two diverge, change the DOM.
      </p>

      <h2 className="dc-h2" id="images">Images</h2>
      <p>
        Alt text describes what the image is evidence <em>of</em>. For a material swatch that means material, finish
        and price, because that is what the visual comparison conveys. “Wood texture” conveys none of it.
      </p>
      <p>Decorative images take an empty alt so they are skipped rather than announced as unlabeled.</p>

      <h2 className="dc-h2" id="errors">Form errors</h2>
      <p>
        An error must be associated with its field, not merely near it. Envision Field wires{' '}
        <code>aria-describedby</code> and <code>aria-invalid</code> automatically, so the error is read with the
        control rather than encountered separately.
      </p>
      <Callout type="Note" title="On screen-reader transcripts">
        This documentation does not print sample screen-reader output. Announcements vary by reader, browser and
        verbosity setting, and a fabricated transcript would read as tested behavior. Test with a real screen reader
        instead.
      </Callout>
    </DocArticle>
  );
}

/* ----------------------------------------------------------------- semantics */

export function SemanticStructure() {
  return (
    <DocArticle
      trail={trail('Semantic structure')}
      title="Semantic structure"
      lead="Semantics are how an interface describes itself. Get them right and most accessibility follows; get them wrong and no amount of ARIA repairs it."
      toc={[
        { id: 'native', label: 'Native HTML first' },
        { id: 'headings', label: 'Headings' },
        { id: 'landmarks', label: 'Landmarks' },
        { id: 'lists', label: 'Lists' },
        { id: 'buttons-links', label: 'Buttons versus links' },
        { id: 'tables', label: 'Tables' },
        { id: 'aria', label: 'ARIA' },
        { id: 'example', label: 'This site as an example' },
      ]}
      related={[
        { title: 'Screen readers', to: '/accessibility/screen-readers', note: 'What semantics produce.' },
        { title: 'Typography', to: '/foundations/typography', note: 'Heading level versus size.' },
        { title: 'Components', to: '/components', note: 'Per-component semantic contracts.' },
      ]}
      {...seq('/accessibility/semantics')}
    >
      <h2 className="dc-h2" id="native">Native HTML first</h2>
      <p>
        A native element arrives with role, keyboard behavior, focus management and state built in. A div with ARIA
        arrives with a role and nothing else, and every remaining behavior must be written and maintained by hand.
      </p>
      <p>
        Envision components render native elements inside their shadow roots for this reason. The registry records
        each component's semantic contract, and it is a contract, not an implementation detail.
      </p>

      <h2 className="dc-h2" id="headings">Headings</h2>
      <p>
        Headings are the document outline, and screen reader users navigate by them more than by anything else. One
        <code> h1</code> per page, never skip a level, and choose level by structure rather than by size.
      </p>
      <p>
        This is verified rather than asserted here: every route in this documentation is checked for exactly one{' '}
        <code>h1</code> and zero heading-level jumps.
      </p>

      <h2 className="dc-h2" id="landmarks">Landmarks</h2>
      <p>
        Landmarks let someone jump straight to a region. <code>nav</code>, <code>main</code>, <code>header</code>,{' '}
        <code>aside</code>. Where there is more than one of a landmark type, each needs a distinct accessible name, or
        the person gets a list of identical entries.
      </p>

      <h2 className="dc-h2" id="lists">Lists</h2>
      <p>
        A list announces how many items it contains, which is information a stack of divs does not carry. If it reads
        as a list, mark it up as one.
      </p>

      <h2 className="dc-h2" id="buttons-links">Buttons versus links</h2>
      <ScrollTable head={['', 'Button', 'Link']}>
        {[
          ['Does', 'Performs an action', 'Goes somewhere'],
          ['Keyboard', 'Enter and Space', 'Enter'],
          ['Right-click', 'Nothing useful', 'Open in new tab, copy address'],
          ['Envision', 'Button, IconButton', 'Link'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        A link styled as a button is fine. A button that navigates is not: it removes the ability to open in a new tab
        and announces the wrong thing.
      </p>

      <h2 className="dc-h2" id="tables">Tables</h2>
      <p>
        Use a table for tabular data, and give it real header cells with <code>scope</code>. Without headers, a screen
        reader reads a cell as a value with no indication of what it is a value of. Every reference table in this
        documentation uses <code>th scope="col"</code>.
      </p>

      <h2 className="dc-h2" id="aria">ARIA</h2>
      <Callout type="Important" title="ARIA supplements semantics; it does not replace HTML">
        The first rule of ARIA is not to use it if a native element will do. ARIA adds information; it never adds
        behavior. <code>role="button"</code> on a div does not make it focusable, does not make Space activate it, and
        does not make it a button.
      </Callout>
      <p>
        Where ARIA is genuinely needed, Envision uses it: <code>aria-selected</code> on tabs,{' '}
        <code>aria-invalid</code> and <code>aria-describedby</code> on fields, <code>aria-busy</code> on loading
        surfaces, <code>aria-pressed</code> on toggles.
      </p>

      <h2 className="dc-h2" id="example">This site as an example</h2>
      <p>
        Envision Design is built the way this page describes: a skip link, a named <code>nav</code> landmark, a
        focusable <code>main</code> that receives focus on route change, one <code>h1</code> per route, no heading
        jumps, and real header cells on every table. Documentation that failed its own guidance would not be worth
        much.
      </p>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- a11y forms */

export function AccessibleForms() {
  return (
    <DocArticle
      trail={trail('Accessible forms')}
      title="Accessible forms"
      lead="Forms concentrate more accessibility failures than any other interface. Most of them come from three things: labels that are not labels, errors that are not associated, and focus that goes nowhere on submit."
      toc={[
        { id: 'labels', label: 'Labels' },
        { id: 'descriptions', label: 'Descriptions and helper text' },
        { id: 'required', label: 'Required fields' },
        { id: 'grouping', label: 'Grouped controls' },
        { id: 'errors', label: 'Error association and announcement' },
        { id: 'focus', label: 'Focus on submit' },
        { id: 'autocomplete', label: 'Autocomplete' },
        { id: 'zoom', label: 'Zoom and reflow' },
      ]}
      related={[
        { title: 'Forms pattern', to: '/patterns/forms', note: 'Structure and validation timing.' },
        { title: 'Content: Forms', to: '/content/forms', note: 'What the words should say.' },
        { title: 'Field', to: '/components/field', note: 'The component that wires this.' },
      ]}
      {...seq('/accessibility/forms')}
    >
      <h2 className="dc-h2" id="labels">Labels</h2>
      <p>
        Every control needs a programmatically associated label. A placeholder is not a label: it disappears on typing,
        is often too low-contrast, and is announced inconsistently.
      </p>
      <p>
        Envision Field renders a real <code>label</code> associated by id. Envision Label renders in light DOM
        specifically so <code>for</code> can associate across no shadow boundary, which is a deliberate architectural
        decision in service of this.
      </p>

      <h2 className="dc-h2" id="descriptions">Descriptions and helper text</h2>
      <p>
        Helper text is associated with <code>aria-describedby</code>, so it is read after the label rather than
        floating unattached. Put the constraint here before it is violated.
      </p>

      <h2 className="dc-h2" id="required">Required fields</h2>
      <p>
        Requirement must be conveyed programmatically, not only with an asterisk. Envision Field marks the asterisk
        <code> aria-hidden</code> and sets <code>aria-required</code> on the control, so it is stated once visually and
        once programmatically rather than twice in speech.
      </p>

      <h2 className="dc-h2" id="grouping">Grouped controls</h2>
      <p>
        A set of radios answering one question needs a group label naming the question. Without it, someone hears the
        option labels with no idea what is being asked.
      </p>
      <LivePreview caption="A radio group. The question belongs to the group, not to any single option.">
        <div role="radiogroup" aria-label="Cabinet style" style={{ display: 'grid', gap: 'var(--dc-space-3)', width: 260 }}>
          <envision-radio label="Beadboard Shaker" name="style" value="shaker" checked />
          <envision-radio label="Flat Panel" name="style" value="flat" />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="errors">Error association and announcement</h2>
      <p>
        An error must be associated with its field via <code>aria-describedby</code>, and the field marked{' '}
        <code>aria-invalid</code>. Envision Field does both, which removes the most commonly forgotten wiring in any
        form.
      </p>
      <LivePreview caption="Real Field. The error is associated with the input, not merely positioned near it.">
        <div style={{ width: 320 }}>
          <envision-input label="Email" type="email" value="not-an-email" invalid error-message="Enter a valid email address." />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="focus">Focus on submit</h2>
      <p>
        On failed submit, move focus to the first invalid field. An error summary at the top of a long form helps
        nobody who is at the bottom and cannot see it.
      </p>

      <h2 className="dc-h2" id="autocomplete">Autocomplete</h2>
      <p>
        Where a field collects information about the person, set an appropriate <code>autocomplete</code> value. It
        reduces typing for everyone and is a genuine accessibility benefit for anyone for whom typing is expensive.
      </p>

      <h2 className="dc-h2" id="zoom">Zoom and reflow</h2>
      <p>
        Forms are single column at every width, which is also what makes them survive 200% zoom. Multi-column forms
        create ambiguous reading order and break down under zoom, which is one reason Envision does not use them.
      </p>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- a11y motion */

export function A11yMotion() {
  return (
    <DocArticle
      trail={trail('Motion & reduced motion')}
      title="Motion &amp; reduced motion"
      lead="Motion can clarify a change or cause physical discomfort. Envision's position is that it should always be the first and never be required to understand anything."
      toc={[
        { id: 'helps', label: 'When motion helps' },
        { id: 'barrier', label: 'When motion becomes a barrier' },
        { id: 'preference', label: 'The reduced-motion preference' },
        { id: 'implementation', label: 'Current implementation' },
        { id: 'never', label: 'Never carry meaning in motion' },
        { id: 'gap', label: 'What is not yet specified' },
      ]}
      related={[
        { title: 'Motion', to: '/foundations/motion', note: 'The foundation and its tokens.' },
        { title: 'Loading', to: '/patterns/loading', note: 'The most common motion.' },
        { title: 'Principles', to: '/accessibility/principles', note: 'Why this is a principle.' },
      ]}
      {...seq('/accessibility/motion')}
    >
      <h2 className="dc-h2" id="helps">When motion helps</h2>
      <p>
        When something appears, moves or replaces something else, a short transition tells the eye what happened and
        where it came from. A sheet rising from the edge it is anchored to is legible; the same sheet appearing
        instantly is a jump cut.
      </p>

      <h2 className="dc-h2" id="barrier">When motion becomes a barrier</h2>
      <p>
        Vestibular disorders make large or unexpected movement genuinely unpleasant, sometimes physically so. Large
        translations, parallax, zoom and spinning are the usual triggers; a 150ms color fade is not.
      </p>
      <p>
        Motion also delays interaction. In a product where someone compares options rapidly, an animation repeated per
        selection becomes friction rather than polish.
      </p>

      <h2 className="dc-h2" id="preference">The reduced-motion preference</h2>
      <p>
        <code>prefers-reduced-motion</code> is a person telling you directly that movement is a problem for them. It is
        not a stylistic preference and should never be treated as optional.
      </p>
      <p>
        Reduced does not mean removed. Remove transitions, keep state changes instant, and slow rather than stop
        anything that communicates ongoing activity.
      </p>

      <h2 className="dc-h2" id="implementation">Current implementation</h2>
      <p>
        Honored in components and in this documentation site. Button removes its transitions and slows the spinner to
        1600ms rather than stopping it, so activity is still communicated without rapid rotation.
      </p>
      <LivePreview caption="Loading, honoring reduced motion if you have it enabled.">
        <envision-button variant="primary" label="Saving…" loading />
      </LivePreview>

      <h2 className="dc-h2" id="never">Never carry meaning in motion alone</h2>
      <p>
        If a change is announced only by an animation, someone with reduced motion enabled receives nothing. Every
        motion must accompany a change that is also visible statically, and where it matters, announced.
      </p>

      <h2 className="dc-h2" id="gap">What is not yet specified</h2>
      <Callout type="Important" title="Durations are tokenized; easing is not">
        The token build defines {system.tokens.filter((t) => t.name.startsWith('--envision-t1-duration-')).length}{' '}
        duration primitives and {system.tokens.filter((t) => t.name.startsWith('--envision-t2-motion-')).length}{' '}
        semantic motion roles. It defines <strong>no easing tokens</strong>: components declare curves inline, and
        Button contains a hardcoded cubic-bezier. There is also no displacement scale and no named entrance or exit
        patterns. Envision does not have a complete motion system, and this documentation does not claim one.
      </Callout>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- a11y testing */

export function A11yTesting() {
  return (
    <DocArticle
      trail={trail('Testing requirements')}
      title="Testing requirements"
      lead="What to run, what each thing can prove, and what it cannot. Automated accessibility testing is necessary and nowhere near sufficient."
      toc={[
        { id: 'layers', label: 'Layers of testing' },
        { id: 'automated', label: 'Automated checks' },
        { id: 'keyboard', label: 'Keyboard testing' },
        { id: 'screen-reader', label: 'Screen-reader testing' },
        { id: 'visual', label: 'Visual and contrast' },
        { id: 'zoom', label: 'Zoom and reflow' },
        { id: 'responsive', label: 'Responsive' },
        { id: 'product', label: 'Product-context testing' },
        { id: 'checklist', label: 'Release checklist' },
      ]}
      related={[
        { title: 'WCAG standards', to: '/accessibility/wcag', note: 'What is being tested against.' },
        { title: 'Engineering review', to: '/governance/engineering-review', note: 'Where this is enforced.' },
        { title: 'Focus management', to: '/accessibility/focus', note: 'The thing automation cannot check.' },
      ]}
      {...seq('/accessibility/testing')}
    >
      <h2 className="dc-h2" id="layers">Layers of testing</h2>
      <ScrollTable head={['Layer', 'Catches', 'Cannot catch']}>
        {[
          ['Automated', 'Missing names, invalid ARIA, contrast on solid backgrounds', 'Whether a name is meaningful'],
          ['Keyboard', 'Traps, unreachable controls, lost focus', 'Whether announcements are right'],
          ['Screen reader', 'Wrong roles, missing state, bad reading order', 'Visual defects'],
          ['Visual / contrast', 'Text over images, low-contrast borders', 'Semantics'],
          ['Zoom / reflow', 'Horizontal scrolling, clipped content', 'Interaction defects'],
          ['Product context', 'The wrong component used correctly', 'Everything already covered above'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="automated">Automated checks</h2>
      <p>What actually exists in this repository, rather than what a mature setup would have:</p>
      <ul>
        <li><strong>Component unit tests</strong> including accessibility assertions ({system.counts.implemented} implemented components, 86 tests).</li>
        <li><strong>An accessibility checker in Storybook</strong>, run per story.</li>
        <li><strong>Interaction tests</strong> asserting focus and keyboard activation on a small number of stories.</li>
        <li><strong>A visual regression suite</strong> of 66 screenshots.</li>
        <li><strong>Documentation checks</strong> verifying heading integrity, route registration and template use.</li>
      </ul>
      <Callout type="Important" title="A green run is a floor">
        Automated tools verify mechanical rules. They cannot confirm a meaningful accessible name, sensible focus
        placement, reading order matching visual order, or correct component choice. Reporting a clean automated run as
        "accessible" is the most common overstatement in the field.
      </Callout>

      <h2 className="dc-h2" id="keyboard">Keyboard testing</h2>
      <p>
        Put the mouse away and complete a real task. This single exercise finds more defects than every automated tool
        combined, because it tests transitions rather than snapshots.
      </p>
      <ul>
        <li>Can you reach everything?</li>
        <li>Can you see where you are at every step?</li>
        <li>Can you escape everything you can open?</li>
        <li>Does focus return sensibly after something closes?</li>
      </ul>

      <h2 className="dc-h2" id="screen-reader">Screen-reader testing</h2>
      <p>
        Test with at least one real screen reader on the platform your users have. Check that every control announces a
        meaningful name, that state is announced, and that dynamic changes are announced without stealing focus.
      </p>

      <h2 className="dc-h2" id="visual">Visual and contrast</h2>
      <p>
        Automated contrast checks cover solid backgrounds. Envision's hardest cases, text near or over material
        imagery, need manual verification. Also check the focus ring against every surface it can appear on.
      </p>

      <h2 className="dc-h2" id="zoom">Zoom and reflow</h2>
      <p>
        Zoom to 200% and confirm nothing is clipped and the page does not scroll horizontally. This is the same
        mechanism as narrow-viewport reflow, so a layout that handles one usually handles the other.
      </p>

      <h2 className="dc-h2" id="responsive">Responsive</h2>
      <p>
        This documentation is verified at 1440, 1024, 768, 430 and 375 for document-level horizontal overflow on every
        route. Wide tables and code scroll inside their own containers; the page never does.
      </p>

      <h2 className="dc-h2" id="product">Product-context testing</h2>
      <p>
        The final check no tool performs: was this the right component, in the right place, with the right words? A
        perfectly accessible control used for the wrong job is still an accessibility problem.
      </p>

      <h2 className="dc-h2" id="checklist">Release checklist</h2>
      <ol>
        <li>Automated suites pass.</li>
        <li>The primary task completes using only the keyboard.</li>
        <li>Focus is visible at every step and returns correctly after every overlay.</li>
        <li>Every interactive element announces a meaningful name.</li>
        <li>No state is communicated by color alone.</li>
        <li>Text contrast verified, including anything near imagery.</li>
        <li>Usable at 200% zoom with no horizontal page scrolling.</li>
        <li>Reduced motion respected.</li>
        <li>Errors are associated, announced, and say how to recover.</li>
      </ol>
    </DocArticle>
  );
}
