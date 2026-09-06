import {
  Callout, DoDont, DocCard, DocGrid, LivePreview, } from '../modules';
import { LifecycleRing } from '../modules/diagrams';
import { DocArticle } from '../templates';
import { DesignCenterRail, FinishGroup, ProductExample, ResponsiveExample } from '../modules/product';
import { system } from '../data/generated';
import { componentPath } from '../data/nav';

const TOC = [
  { id: 'problem', label: 'The user problem' },
  { id: 'example', label: 'Example' },
  { id: 'when', label: 'When to use' },
  { id: 'composition', label: 'Composition' },
  { id: 'flow', label: 'Interaction flow' },
  { id: 'types', label: 'Selection types' },
  { id: 'selected', label: 'The selected state' },
  { id: 'changing', label: 'Changing a selection' },
  { id: 'confirmation', label: 'Confirmation' },
  { id: 'price', label: 'Price and status' },
  { id: 'responsive', label: 'Responsive behavior' },
  { id: 'content', label: 'Content' },
  { id: 'product-examples', label: 'Product examples' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'components', label: 'Components used' },
];

/** Benchmark pattern article (Part XXVIII). */
export function Selection() {
  const used = ['MaterialSwatch', 'OptionCard', 'PackageCard', 'RightRail', 'Button']
    .map((n) => system.components.find((c) => c.name === n))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof system.components.find>>>;

  return (
    <DocArticle
      trail={[
              { label: 'Envision Design System', to: '/' },
              { label: 'Patterns', to: '/patterns' },
              { label: 'Selection' },
            ]}
      title="Selection"
      lead="Selection is the core interaction of the Envision product. Someone is choosing what their home will actually contain, and every choice has a price and a consequence they need to keep track of."
      related={[
            { title: 'Patterns', to: '/patterns', note: 'The rest of the pattern library.' },
            { title: 'Focus management', to: '/accessibility/focus', note: 'Where focus goes when a tray opens.' },
            { title: 'Color', to: '/foundations/color', note: 'Why selection is never color-only.' },
          ]}
      toc={TOC}
      prev={{ title: 'Patterns', to: '/patterns' }}
    >

      <h2 className="dc-h2" id="problem">The user problem</h2>
      <p>
        A buyer picking finishes is doing three things at once: comparing options, keeping a running sense of cost,
        and remembering what they already decided. Interfaces usually fail this by treating each choice as an
        isolated event. The person picks a countertop, the screen navigates somewhere else, and the context that
        made the choice meaningful is gone.
      </p>
      <p>
        The pattern's job is to let a selection happen without displacing the thing it affects. The visualization
        stays. The running total stays. The list of what has already been chosen stays.
      </p>

      <h2 className="dc-h2" id="example">Example</h2>
      <LivePreview caption="Real components: swatches carry a ring-and-check selected state, and the action is a real Button.">
        <div style={{ display: 'grid', gap: 'var(--dc-space-4)', width: 320 }}>
          <p className="dc-eyebrow" style={{ margin: 0 }}>Cabinet finish</p>
          <div style={{ display: 'flex', gap: 'var(--dc-space-3)' }}>
            <envision-material-swatch selected />
            <envision-material-swatch />
            <envision-material-swatch />
          </div>
          <envision-button variant="primary" label="Apply design" full-width />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="when">When to use</h2>
      <ul>
        <li>Someone must choose one option from a set that is easier to judge visually than by name.</li>
        <li>The choice changes something visible elsewhere on screen, such as a 3D visualization or a price.</li>
        <li>Options carry a cost difference the person should see before committing.</li>
        <li>Choices accumulate, and the person needs to review them together later.</li>
      </ul>
      <h3 className="dc-h3">When not to use</h3>
      <ul>
        <li>The options are purely textual and comparison adds nothing. Use a field with a select instead.</li>
        <li>The choice is binary and instant. A Switch communicates that faster.</li>
        <li>Selection triggers an irreversible action. That belongs to the Confirmation pattern.</li>
      </ul>

      <h2 className="dc-h2" id="composition">Composition</h2>
      <p>
        Selection is assembled from components that each own one responsibility, which is what keeps the pattern
        consistent across cabinets, flooring, countertops and lighting without a bespoke build each time.
      </p>
      <ol>
        <li><strong>A container</strong> that persists beside the thing being changed, normally the RightRail.</li>
        <li><strong>An opener row</strong> per decision, showing the current choice and its cost delta.</li>
        <li><strong>A set of options</strong>, shown as swatches or cards depending on whether the difference is material or configurational.</li>
        <li><strong>A running total</strong>, visible without scrolling.</li>
        <li><strong>A commit action</strong>, which is a real Button rather than an auto-save.</li>
      </ol>

      <h2 className="dc-h2" id="flow">Interaction flow</h2>
      <LifecycleRing
        alt="The selection flow has five stages in order: open a decision, compare the options, preview the effect, see the price change, and commit the choice."
        stages={['Open', 'Compare', 'Preview', 'See cost', 'Commit']}
        caption="Preview happens before commit. The person should never have to accept a choice to find out what it looks like."
      />

      <h2 className="dc-h2" id="types">Selection types</h2>
      <p>Envision uses three, and the choice is driven by what the person is comparing.</p>
      <ul>
        <li>
          <strong>Material selection.</strong> The difference is visual and cannot be judged from a name. Uses
          MaterialSwatch, sized so grain and finish are readable.
        </li>
        <li>
          <strong>Configuration selection.</strong> The difference is a named option with a cost. Uses OptionCard,
          which shows the current value and opens a tray.
        </li>
        <li>
          <strong>Bundle selection.</strong> A curated set chosen as one decision. Uses PackageCard, previewing the
          materials the bundle contains.
        </li>
      </ul>
      <p>
        Mixing them is the common failure. A cabinet finish presented as a dropdown of names removes the only
        information the person needed, and a bundle presented as loose swatches hides that the choice is a set.
      </p>

      <h2 className="dc-h2" id="selected">The selected state</h2>
      <p>
        Selection is signaled by a ring and a check mark together. Never by color, and never by the check alone at
        swatch sizes where a small glyph on a dark material is unreadable.
      </p>
      <p>
        The reason is specific to this product: the options are themselves colored surfaces. A colored selected
        state would be competing with the content it is marking, and on a deep navy swatch it would simply
        disappear.
      </p>
      <LivePreview caption="Selected, available and unavailable, using the real MaterialSwatch.">
        <FinishGroup />
      </LivePreview>

      <h2 className="dc-h2" id="changing">Changing a selection</h2>
      <p>
        Changing a choice must be as cheap as making it. Selection stays live: choosing a different finish updates
        the visualization and the total immediately, with no confirm step, because the person is comparing rather
        than committing.
      </p>
      <p>
        Nothing is destroyed by a change, so nothing needs a warning. Reserve confirmation for the point where
        selections leave the person's control, not for each adjustment.
      </p>

      <h2 className="dc-h2" id="confirmation">Confirmation</h2>
      <p>
        There is exactly one commit point, and it is explicit. Apply is a real Button in the rail footer, always
        visible, never auto-saving behind the person's back. Auto-save reads as helpful and removes the moment
        where someone can review what they chose before it becomes real.
      </p>

      <h2 className="dc-h2" id="price">Communicating price and status</h2>
      <p>
        Every option that changes cost states the delta on the option itself, before it is chosen. Deltas are
        written as a change from the included baseline (<code>+$120</code>), not as an absolute price, because the
        person is deciding about an upgrade rather than buying an item.
      </p>
      <p>
        Cost is content color on a neutral surface. It is never colored red or green: a more expensive finish is
        not an error, and a cheaper one is not a success.
      </p>
      <p>
        Unavailable options stay visible and are marked unavailable rather than removed. Removing them makes the
        set inconsistent between rooms and leaves the person wondering whether they missed something.
      </p>

      <h2 className="dc-h2" id="responsive">Responsive behavior</h2>
      <p>
        The rail is the pattern's anchor on desktop: selection happens beside the visualization. Below the rail
        breakpoint the same component re-composes into a modal sheet rather than shrinking, because a 320px-wide
        column beside a 3D view leaves neither usable.
      </p>
      <p>
        That is a real trade: the sheet covers the visualization. It is accepted because on a phone the alternative
        is two unusable regions instead of one usable one, and the sheet can be dismissed to check the result.
      </p>
      <ResponsiveExample
        widths={[420, 340, 280]}
        caption="The finish group at three widths. Swatches wrap; they are never scaled below a size where the material is judgeable."
      >
        <FinishGroup />
      </ResponsiveExample>

      <h2 className="dc-h2" id="content">Content</h2>
      <p>
        An option's name carries material and finish together, because “Walnut” alone does not distinguish matte
        from satin, and that difference is exactly what the person is choosing between.
      </p>
      <p>
        The baseline option is labeled <code>Included</code>, not <code>$0</code> or <code>Free</code>. It is part
        of what was already bought, and pricing it at zero invites the reading that it is a lesser choice.
      </p>

      <h2 className="dc-h2" id="product-examples">Product examples</h2>
      <ProductExample
        title="Design Center · selection rail"
        surface={<DesignCenterRail />}
        annotations={[
          'Each row is one decision, showing the current choice and its cost delta.',
          'The active row is the open tray, so the person can see where they are.',
          'The total accumulates every decision above it and stays visible.',
          'Apply is the single commit point for the whole set of choices.',
        ]}
        caption="Real production components in the arrangement the Design Center uses."
      />

      <h2 className="dc-h2" id="accessibility">Accessibility</h2>
      <p>
        Selection state is conveyed by a ring and a check mark, never by color alone. This is not only a contrast
        concern: material swatches are themselves colored, so a color-based selected state would be competing
        with the content it sits on.
      </p>
      <p>
        Each option's accessible name carries material, finish and price together, because those three facts are
        what the visual comparison conveys and a name of “swatch 3” conveys none of it.
      </p>
      <Callout type="Accessibility" title="Keyboard expectation">
        A group of options is a single tab stop with arrow-key movement between choices, not one tab stop per
        swatch. A finish group with twenty options should not cost twenty tab presses to pass.
      </Callout>

      <DoDont items={[
        { kind: 'do', text: 'Keep the visualization and the running total visible while the person chooses, so a selection can be judged in context.' },
        { kind: 'dont', text: 'Open a full-screen picker that hides the room being configured. The person then has to commit to find out whether they were right.' },
        { kind: 'do', text: 'Show the cost difference on the option itself, before it is chosen.' },
        { kind: 'dont', text: 'Reveal the price change only after commit. That turns a design decision into a billing surprise.' },
      ]} />

      <h2 className="dc-h2" id="components">Components used</h2>
      <DocGrid columns={3}>
        {used.map((c) => (
          <DocCard key={c.id} to={componentPath(c.name)} title={c.name}>{c.purpose}</DocCard>
        ))}
      </DocGrid>
    </DocArticle>  );
}
