import {
  Callout, DoDont, LivePreview, } from '../modules';
import { LifecycleRing } from '../modules/diagrams';
import { DocArticle } from '../templates';

const TOC: Array<{ id: string; label: string; level?: 2 | 3 }> = [
  { id: 'what', label: 'What focus is' },
  { id: 'why', label: 'Why it is the hard part' },
  { id: 'order', label: 'Natural order' },
  { id: 'visible', label: 'Visible focus' },
  { id: 'moving', label: 'Moving focus deliberately' },
  { id: 'returning', label: 'Returning focus' },
  { id: 'overlays', label: 'Dialogs and overlays' },
  { id: 'keyboard', label: 'Keyboard expectations' },
  { id: 'screen-readers', label: 'Screen readers' },
  { id: 'route-changes', label: 'Route changes' },
  { id: 'responsibility', label: 'Responsibility' },
  { id: 'async', label: 'Asynchronous updates' },
  { id: 'testing', label: 'Testing it' },
];

/** Benchmark accessibility article (Part XXIX). */
export function FocusManagement() {
  return (
    <DocArticle
      trail={[
              { label: 'Envision Design System', to: '/' },
              { label: 'Accessibility', to: '/accessibility' },
              { label: 'Focus management' },
            ]}
      title="Focus management"
      lead="Focus is the keyboard user's cursor. If your interface moves, opens or replaces something without deciding where focus goes, you have moved their cursor for them, usually somewhere useless."
      related={[
            { title: 'Accessibility', to: '/accessibility', note: 'What the system guarantees.' },
            { title: 'Selection pattern', to: '/patterns/selection', note: 'A real flow with focus transitions.' },
            { title: 'Components', to: '/components', note: 'Per-component keyboard behavior.' },
          ]}
      toc={TOC}
      prev={{ title: 'Accessibility', to: '/accessibility' }}
    >

      <h2 className="dc-h2" id="what">What focus is</h2>
      <p>
        Focus is the single element that will receive the next keystroke. Exactly one element has it at any moment,
        the browser decides which by default, and any script can move it.
      </p>
      <p>
        For someone using a mouse, focus is nearly invisible and rarely matters. For someone navigating by
        keyboard, by switch, or with a screen reader, focus <em>is</em> the interface: it is simultaneously the
        cursor, the scroll position, and the answer to “where am I”. Losing it is closer to a page reloading
        unexpectedly than to a cosmetic defect.
      </p>
      <p>
        Focus is also not the same as selection. A tab can be focused without being selected, and a swatch can be
        selected while focus is elsewhere. Conflating the two produces interfaces where arrowing through options
        commits a choice the person only meant to look at.
      </p>

      <h2 className="dc-h2" id="why">Why focus is the hard part</h2>
      <p>
        Most accessibility rules can be satisfied by a component in isolation. Focus cannot, because focus is
        about the transition between states, and transitions belong to the product. A dialog component can trap
        focus correctly and still leave someone stranded if the product opened it from a button that then
        disappeared.
      </p>
      <p>
        The mental model that makes this tractable: focus should always be somewhere a sighted keyboard user would
        expect to look next. If you can describe where their eye would go, that is where focus belongs.
      </p>

      <h2 className="dc-h2" id="order">Natural order is the default, and it is usually right</h2>
      <p>
        DOM order is focus order. The overwhelming majority of the time the correct action is to not intervene:
        write the markup in the order the page reads, and focus follows for free.
      </p>
      <p>
        Intervening has a cost. A positive <code>tabindex</code> creates an ordering that every future change must
        maintain, and it fails silently when someone adds a control. Envision components never use one, and product
        code should not either.
      </p>

      <h2 className="dc-h2" id="visible">Visible focus is not optional</h2>
      <p>
        Every focusable thing in Envision draws a two-pixel brand ring, offset from the control so it is never
        clipped by a rounded corner or an adjacent surface. It is drawn on <code>:focus-visible</code>, so it
        appears for keyboard users without adding a ring to every mouse click.
      </p>
      <Callout type="Developer" title="Never remove the outline">
        <code>outline: none</code> without a replacement is the single most common way a product breaks keyboard
        accessibility, and it usually happens while tidying up a mouse-driven design.
      </Callout>

      <h2 className="dc-h2" id="moving">Moving focus deliberately</h2>
      <p>Focus should be moved by the product in exactly three situations.</p>
      <ol>
        <li><strong>Something opened.</strong> A dialog, a sheet or a tray takes focus, because it is now the only thing the person can interact with.</li>
        <li><strong>Something was destroyed.</strong> If the focused element is removed, focus must be placed somewhere sensible, or the browser drops it to the document body and the person restarts from the top.</li>
        <li><strong>An error needs attention.</strong> On a failed submit, focus moves to the first field that needs fixing.</li>
      </ol>

      <LifecycleRing
        alt={
          'The focus lifecycle for an overlay has five stages: a trigger is activated, focus moves into the ' +
          'overlay, focus is trapped inside it while it is open, the overlay closes, and focus returns to the ' +
          'trigger that opened it.'
        }
        stages={['Trigger activated', 'Focus moves in', 'Focus trapped', 'Overlay closes', 'Focus returns']}
        caption="The RightRail implements this cycle in its sheet presentation: focus moves in, Tab is trapped, Escape closes, and focus returns to the opener."
      />

      <h2 className="dc-h2" id="returning">Returning focus is the step people forget</h2>
      <p>
        Opening an overlay is usually handled. Closing it usually is not. When a sheet closes and focus is not
        restored, a keyboard user is silently returned to the top of the document and has to traverse the entire
        page again to get back to where they were.
      </p>
      <p>
        Store the element that had focus before opening, and restore it on close, including when the overlay is
        dismissed with Escape or by clicking outside rather than by its close button.
      </p>

      <DoDont items={[
        { kind: 'do', text: 'Return focus to the control that opened an overlay, so dismissing it puts the person back exactly where they were.' },
        { kind: 'dont', text: 'Let focus fall to the document body on close. The person loses their position and has to tab through the whole page to recover it.' },
        { kind: 'do', text: 'Move focus to the first invalid field after a failed submit, so the problem is where the cursor already is.' },
        { kind: 'dont', text: 'Only render an error summary at the top of the form. A keyboard user has no reason to know it appeared.' },
      ]} />

      <h2 className="dc-h2" id="overlays">Dialogs, sheets and overlays</h2>
      <p>
        An overlay that blocks the page owes the person four things: focus moves in when it opens, Tab cannot
        escape while it is open, Escape closes it, and focus returns to whatever opened it. Any one of those
        missing produces a keyboard trap or a lost position.
      </p>
      <p>
        Envision's RightRail implements exactly this contract in its sheet presentation below the rail breakpoint,
        where it becomes a modal dialog. The same component is not a trap on desktop, because there it is a
        complementary region rather than a modal, and trapping focus in a non-modal region is its own defect.
      </p>
      <Callout type="Developer" title="This site honors the same contract">
        Envision Design's own mobile navigation drawer moves focus in on open, traps Tab while open, closes on
        Escape and restores focus to the menu button. Documenting the contract while breaking it would be the most
        embarrassing possible failure.
      </Callout>

      <h2 className="dc-h2" id="keyboard">Keyboard expectations</h2>
      <p>
        What each key should do is decided by the component family, not per component, so that learning one
        Envision control teaches you the rest.
      </p>
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
          <thead>
            <tr>{['Key', 'Expected behavior', 'Where it applies'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)', fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--envision-t2-color-content-secondary-default)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[
              ['Tab', 'Move to the next focusable control', 'Everywhere. One stop per control, not per option in a group.'],
              ['Shift + Tab', 'Move to the previous control', 'Everywhere'],
              ['Enter', 'Activate', 'Button, IconButton, Link'],
              ['Space', 'Activate or toggle', 'Button, Checkbox, Switch'],
              ['Arrow keys', 'Move within a group', 'Tab lists, radio groups, swatch groups'],
              ['Home / End', 'First or last item in a group', 'Tab lists and option groups'],
              ['Escape', 'Dismiss and restore focus', 'Sheets, trays, dialogs'],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) => (
                  <td key={i} style={{ padding: 'var(--dc-space-3)', verticalAlign: 'top', borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)', fontFamily: i === 0 ? 'ui-monospace, Menlo, monospace' : undefined }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The group rule matters most. A finish group with twenty swatches is one tab stop with arrow-key movement
        inside it. Twenty tab stops is technically operable and practically unusable.
      </p>
      <LivePreview caption="A real tab list: one tab stop, arrow keys move between tabs, Home and End jump to the ends.">
        <div style={{ display: 'flex', gap: 'var(--dc-space-5)' }} role="tablist">
          <envision-tab label="Customize" selected />
          <envision-tab label="Packages" />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="screen-readers">How focus relates to screen readers</h2>
      <p>
        These are two different cursors, and assuming they are one causes real defects. A screen reader has its own
        reading cursor that can move through content without moving focus at all.
      </p>
      <p>
        The consequence: moving focus is not how you announce something. Moving focus interrupts, and if the person
        was reading elsewhere you have just yanked them away. To announce a change without stealing position, use a
        live region. To direct attention because the person's next action must happen somewhere specific, move
        focus. Choosing the wrong one is the most common screen-reader defect in otherwise accessible products.
      </p>

      <h2 className="dc-h2" id="route-changes">Route changes</h2>
      <p>
        In a single-page application, following a link replaces the content without a page load, so the browser
        does not reset focus. Left alone, focus stays on a link that no longer exists in the new view, and a screen
        reader announces nothing at all.
      </p>
      <p>
        The fix is to move focus to the new page's main region or its heading on navigation. This site does that:
        the main landmark is focusable and receives focus on route change, which is also why the skip link has
        somewhere real to skip to.
      </p>

      <h2 className="dc-h2" id="responsibility">System and product responsibility</h2>
      <div style={{ display: 'grid', gap: 'var(--dc-space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', margin: '24px 0' }}>
        <div style={{ padding: 'var(--dc-space-5)', background: 'var(--dc-diagram-active-surface)', border: '1px solid var(--dc-diagram-active-line)', borderRadius: 'var(--envision-t1-border-radius-10)' }}>
          <h3 style={{ margin: '0 0 var(--dc-space-3)', fontSize: 'var(--envision-t1-font-size-16)' }}>Envision guarantees</h3>
          <ul style={{ margin: 0, paddingInlineStart: 'var(--dc-space-5)', fontSize: 'var(--envision-t1-font-size-14)' }}>
            <li>A visible focus ring on every focusable element.</li>
            <li>Roving tabindex and arrow-key movement inside grouped controls.</li>
            <li>Focus trapping and restoration inside its own modal surfaces.</li>
            <li>Disabled controls removed from the tab order by the platform.</li>
          </ul>
        </div>
        <div style={{ padding: 'var(--dc-space-5)', background: 'var(--dc-diagram-abstract)', border: '1px solid var(--dc-diagram-abstract-line)', borderRadius: 'var(--envision-t1-border-radius-10)' }}>
          <h3 style={{ margin: '0 0 var(--dc-space-3)', fontSize: 'var(--envision-t1-font-size-16)' }}>Your product owns</h3>
          <ul style={{ margin: 0, paddingInlineStart: 'var(--dc-space-5)', fontSize: 'var(--envision-t1-font-size-14)' }}>
            <li>Focus on route change.</li>
            <li>Focus after removing the element that had it.</li>
            <li>Focus to the first error after a failed submit.</li>
            <li>DOM order matching visual order.</li>
          </ul>
        </div>
      </div>

      <h2 className="dc-h2" id="async">Asynchronous updates</h2>
      <p>
        Content arriving after a delay must not steal focus. Someone may have moved on while it loaded, and pulling
        them back is disorienting. Announce the change with a live region instead, and leave focus alone.
      </p>
      <p>
        The exception is content the person explicitly asked for and is waiting on, such as a search result list
        they just submitted. Even then, prefer announcing over moving.
      </p>

      <h2 className="dc-h2" id="testing">Testing it</h2>
      <p>
        Put the mouse away and complete a real task using only the keyboard. That single exercise finds more focus
        defects than any automated rule, because automated tools can verify that a focus style exists but not that
        focus went somewhere sensible.
      </p>
      <Callout type="Accessibility" title="What automated tests cannot tell you">
        No automated check can confirm that focus landed in a useful place. Envision's component tests assert that
        activation and focus mechanics work; they cannot assert that a product's transition made sense.
      </Callout>
    </DocArticle>  );
}
