import { createElement, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Real Envision product context (Part XXXIV).
 *
 * These compositions are assembled from the ACTUAL production components, arranged the way the
 * Envision product arranges them: a Design Center right rail of OptionCards over a total and an
 * apply action, a finish group of MaterialSwatches, a packages grid. They are not drawings of the
 * product and not screenshots; they are the product's own components in the product's own layout.
 *
 * KNOWN GAP, stated rather than hidden: this repository contains no captured screenshots of the
 * running Envision application, so a genuine annotated screenshot of the live Design Center is not
 * available here. When those assets exist, `ProductExample` should take an image plus annotations.
 */

const MATERIALS = [
  { id: 'walnut', name: 'Matte Walnut', finish: 'Matte', priceLabel: '+$120', color: '#5b4636' },
  { id: 'oak', name: 'White Oak', finish: 'Natural', priceLabel: 'Included', color: '#c9b28a' },
  { id: 'navy', name: 'Deep Navy', finish: 'Satin', priceLabel: '+$180', color: '#26364a' },
];

function useProp<T>(key: string, value: T) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) (ref.current as unknown as Record<string, unknown>)[key] = value;
  }, [key, value]);
  return ref;
}

/** One selection row exactly as the Design Center right rail composes it. */
function OptionRow({ title, note, active, color }: { title: string; note: string; active?: boolean; color?: string }) {
  // The thumbnail is product data. Passing one shared list made every card in the rail show the
  // same swatch, so three different selections looked like the same selection three times.
  const ref = useProp('options', [{ id: 'current', name: title, color: color ?? '#c9b28a' }]);
  return <envision-option-card ref={ref} title={title} note={note} value="current" active={active || undefined} />;
}

function Swatch({ index, selected, unavailable }: { index: number; selected?: boolean; unavailable?: boolean }) {
  const ref = useProp('option', MATERIALS[index]);
  return <envision-material-swatch ref={ref} selected={selected || undefined} unavailable={unavailable || undefined} />;
}

/**
 * A product example with numbered annotations beside it, so the reader can see which system
 * decision produced which part of the interface.
 */
export function ProductExample({
  title, surface, annotations, caption,
}: {
  title: string;
  surface: React.ReactNode;
  annotations: string[];
  caption?: string;
}) {
  return (
    // The figure is the container the layout below queries.
    <figure style={{ margin: '28px 0', containerType: 'inline-size' }}>
      <div style={{
        display: 'grid',
        // `auto` for the surface, so the column is exactly as wide as the composition inside it.
        // It was `minmax(0, 1fr)` against an annotations column that could take 280px, which left
        // the surface ~376px inside a 740px article — 16px narrower than the 392px rail, so the
        // rail was clipped down its right edge. A product example that crops the product is worse
        // than no example.
        gridTemplateColumns: 'auto minmax(210px, 1fr)',
        gap: 28,
        padding: 28, alignItems: 'start',
        background: 'var(--dc-surface-sunken)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }} className="dc-product">
        {/* The surface is a fixed-width product composition. It scrolls inside this container so
            the page body never scrolls horizontally at narrow widths. */}
        <div style={{ display: 'grid', placeItems: 'center', overflowX: 'auto', maxWidth: '100%' }}>{surface}</div>
        <div>
          <p style={{ margin: '0 0 var(--dc-space-4)' }}><envision-badge tone="brand" label={title} /></p>
          <ol style={{ margin: 0, paddingInlineStart: 'var(--dc-space-5)', fontSize: 'var(--envision-t1-font-size-13)' }}>
            {annotations.map((a) => <li key={a} style={{ marginBlockEnd: 'var(--dc-space-2)' }}>{a}</li>)}
          </ol>
        </div>
      </div>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}
      {/* A CONTAINER query, not a viewport one. The old rule asked how wide the window was, but
          what matters is how wide this figure is — and inside an article column narrowed by a table
          of contents, a wide window says nothing. Below the width the two columns actually need
          (28 + 392 + 28 + 210 + 28), the annotations move underneath. */}
      <style>{`@container (max-width: 700px){ .dc-product { grid-template-columns: minmax(0,1fr) !important; } }`}</style>
    </figure>
  );
}

/** The Design Center right rail, built from real components in the product's own arrangement. */
/**
 * The Design Center right rail, as the product actually composes it.
 *
 * The shape comes from the running application, not from a sketch: Customize / Packages tabs, then
 * a scroll region of category sections. A section is a heading, the currently selected option as an
 * OptionCard, and where the choice is a material, a six-column swatch grid under a header naming the
 * current selection and its price. Earlier this showed three bare OptionCards in a row, which is not
 * a shape the product has anywhere.
 */
/**
 * A metal finish as a CSS sphere: highlight, body, and the shaded edge that reads as a curve.
 *
 * MaterialSwatch takes its fill as product data and applies it straight to `background`, so a
 * gradient is as valid a fill as a photograph. It stays sharp at any size and needs no asset.
 */
const metal = (highlight: string, light: string, base: string, shade: string) =>
  `radial-gradient(circle at 34% 28%, ${highlight} 0%, ${light} 20%, ${base} 52%, ${shade} 92%)`;

const RAIL_SECTIONS = [
  {
    heading: 'Cabinets',
    card: { title: 'Classic Shaker', note: 'Included', color: '#d9d9d9' },
    group: { name: 'White', price: 'Included' },
    // The product's own CABINET_FINISHES, in order, so the mock and the running Design Center show
    // the same twelve options, each with the name the swatch announces to a screen reader.
    swatches: [
      { id: 'white', name: 'White', color: '#f6f4f0', priceLabel: 'Included' },
      { id: 'stonington-gray', name: 'Stonington Gray', color: '#d7d8d6', priceLabel: 'Included' },
      { id: 'warm-taupe', name: 'Warm Taupe', color: '#cbc2b3', priceLabel: 'Included' },
      { id: 'saybrook-sage', name: 'Saybrook Sage', color: '#9da391', priceLabel: 'Included' },
      { id: 'hale-navy', name: 'Hale Navy', color: '#2e3a4a', priceLabel: '+$240' },
      { id: 'kendall-charcoal', name: 'Kendall Charcoal', color: '#52544f', priceLabel: '+$240' },
      { id: 'black', name: 'Black', color: '#1b1b1b', priceLabel: '+$240' },
      { id: 'natural-oak', name: 'Natural Oak', color: '#c9a876', priceLabel: '+$480' },
      { id: 'white-oak', name: 'White Oak', color: '#d8c09a', priceLabel: '+$480' },
      { id: 'warm-walnut', name: 'Warm Walnut', color: '#8a5e3b', priceLabel: '+$620' },
      { id: 'smoked-walnut', name: 'Smoked Walnut', color: '#4a3528', priceLabel: '+$620' },
      { id: 'warm-maple', name: 'Warm Maple', color: '#6b5446', priceLabel: '+$480' },
    ],
  },
  {
    heading: 'Countertops',
    card: { title: 'Calacatta Marble', note: 'Included', color: '#efefec' },
  },
  {
    heading: 'Hardware',
    card: { title: 'Modern Bar', note: 'Included', color: '#b3934f' },
    group: { name: 'Chrome', price: 'Included' },
    // Finishes, not colors: the product renders each as a metal sphere, so these are circles.
    finish: true,
    swatches: [
      { id: 'chrome', name: 'Chrome', finish: 'Polished', color: metal('#ffffff', '#e6e9ea', '#c9ccce', '#6f7477'), priceLabel: 'Included' },
      { id: 'brushed-nickel', name: 'Brushed Nickel', finish: 'Brushed', color: metal('#dfe2e4', '#b6babd', '#8f9295', '#55585b'), priceLabel: 'Included' },
      { id: 'soft-gold', name: 'Soft Gold', finish: 'Satin', color: metal('#fbf7ec', '#eae4d3', '#d8d2c0', '#9a927c'), priceLabel: '+$180' },
      { id: 'brushed-brass', name: 'Brushed Brass', finish: 'Brushed', color: metal('#efe3b4', '#d3c48c', '#b7a768', '#7b6d38'), priceLabel: '+$180' },
      { id: 'copper', name: 'Copper', finish: 'Polished', color: metal('#f0b48c', '#cc8659', '#a9633c', '#6b3a1f'), priceLabel: '+$240' },
      { id: 'matte-black', name: 'Matte Black', finish: 'Matte', color: metal('#6a6a6a', '#3d3d3d', '#2a2a2a', '#141414'), priceLabel: 'Included' },
    ],
  },
];

interface SwatchOption { id: string; name: string; color: string; finish?: string; priceLabel?: string }

/**
 * One swatch: the real `<envision-material-swatch>`, not a colored div.
 *
 * The grid used to be plain spans with a box-shadow standing in for the selected ring, which meant
 * the rail documented a component that could not hover, take focus, or be chosen. `option` is an
 * object, so it is set as a property rather than an attribute.
 */
function RailSwatch({ option, selected, onSelect, shape }: {
  option: SwatchOption; selected: boolean; onSelect: (id: string) => void; shape: 'square' | 'circle';
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) (ref.current as unknown as Record<string, unknown>).option = option;
  }, [option]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => onSelect(option.id);
    el.addEventListener('select', handle);
    return () => el.removeEventListener('select', handle);
  }, [option.id, onSelect]);
  return createElement('envision-material-swatch', {
    ref,
    fluid: '',
    // The product shows selection as the ring alone, with no check glyph.
    'hide-check': '',
    shape,
    ...(selected ? { selected: '' } : {}),
  });
}

function RailSwatches({ options, finish }: { options: SwatchOption[]; finish?: boolean }) {
  const [chosen, setChosen] = useState(options[0]?.id);
  const select = useCallback((id: string) => setChosen(id), []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--dc-space-2)' }}>
      {options.map((o) => (
        <RailSwatch
          key={o.id}
          option={o}
          selected={o.id === chosen}
          onSelect={select}
          shape={finish ? 'circle' : 'square'}
        />
      ))}
    </div>
  );
}

export function DesignCenterRail({ loading, height }: { loading?: boolean; height?: number }) {
  return (
    <div style={{
      width: 392,
      background: 'var(--dc-surface)',
      border: '1px solid var(--envision-t2-color-border-default-default)',
      borderRadius: 'var(--envision-t2-border-radius-container-md)',
      overflow: 'hidden',
      // Given a height, the rail becomes the region it actually is in the product: a fixed frame
      // whose BODY scrolls between a header that stays put and a footer that does not scroll away.
      // Unbounded it is one long column, which is fine where the example is about the content but
      // wrong wherever the surrounding text describes the scrolling behaviour.
      ...(height ? { blockSize: height, display: 'flex', flexDirection: 'column' } : {}),
    }}>
      <div data-anatomy="1" className="dc-tabstrip dc-tabstrip--fitted" style={{ display: 'flex', gap: 'var(--dc-space-6)', padding: '0 var(--dc-space-5)' }}>
        <envision-tab label="Customize" selected />
        <envision-tab label="Packages" />
      </div>

      <div style={{
        display: 'grid', gap: 'var(--dc-space-8)', padding: 'var(--dc-space-5)', opacity: loading ? 0.5 : 1,
        // The only part that scrolls. `minBlockSize: 0` is what lets a flex child actually shrink
        // below its content and scroll, rather than pushing the footer off the bottom.
        ...(height ? { overflowY: 'auto', flex: '1 1 auto', minBlockSize: 0 } : {}),
      }}>
        {RAIL_SECTIONS.map((s) => (
          <div key={s.heading} style={{ display: 'grid', gap: 'var(--dc-space-3)' }}>
            <h3
              data-anatomy={s.heading === RAIL_SECTIONS[0].heading ? '2' : undefined}
              style={{ margin: 0, fontSize: 'var(--envision-t1-font-size-18)', fontWeight: 'var(--envision-t1-font-weight-600)' }}
            >
              {s.heading}
            </h3>
            <div data-anatomy={s.heading === RAIL_SECTIONS[0].heading ? '3' : undefined}>
              <OptionRow title={s.card.title} note={s.card.note} color={s.card.color} />
            </div>
            {s.group && s.swatches && (
              <>
                <div
                  data-anatomy={s.heading === RAIL_SECTIONS[0].heading ? '4' : undefined}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--dc-space-3)' }}
                >
                  <span className="dc-small">{s.group.name}</span>
                  <span className="dc-small">{s.group.price}</span>
                </div>
                <div data-anatomy={s.heading === RAIL_SECTIONS[0].heading ? '5' : undefined}>
                  <RailSwatches options={s.swatches} finish={'finish' in s ? s.finish : false} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div data-anatomy="6" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--dc-space-3)',
        padding: 'var(--dc-space-5)',
        // Held at the bottom of the frame while the body scrolls behind it.
        ...(height ? { flex: '0 0 auto' } : {}),
        borderBlockStart: '1px solid var(--envision-t2-color-border-default-default)',
        background: 'var(--dc-surface-warm)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span className="dc-small">Selected upgrades <strong style={{ color: 'var(--envision-t2-color-content-primary-default)' }}>+$4,280</strong></span>
        <envision-button variant="primary" label="Select this design" />
      </div>
    </div>
  );
}


/** A finish group: the selection surface used for cabinets, flooring, countertops and hardware. */
export function FinishGroup() {
  return (
    <div style={{ display: 'grid', gap: 12, padding: 20, width: 300, background: 'var(--dc-surface)', border: '1px solid var(--envision-t2-color-border-default-default)', borderRadius: 'var(--envision-t2-border-radius-container-md)' }}>
      <p className="dc-eyebrow" style={{ margin: 0 }}>Cabinet finish</p>
      <div style={{ display: 'flex', gap: 'var(--dc-space-4)' }}>
        <Swatch index={1} selected />
        <Swatch index={0} />
        <Swatch index={2} unavailable />
      </div>
      <p className="dc-small" style={{ margin: 0, fontSize: 'var(--envision-t1-font-size-12)' }}>
        White Oak · Natural · Included
      </p>
    </div>
  );
}

/**
 * The form panel: how Envision composes labeled inputs, toggles and a commit action.
 *
 * Built from the real elements, so a Field page shows an actual Field in an actual form rather than
 * a right rail it never appears in.
 */
export function FormPanel() {
  return (
    <div style={{ display: 'grid', gap: 16, padding: 20, width: 340, background: 'var(--dc-surface)', border: '1px solid var(--envision-t2-color-border-default-default)', borderRadius: 'var(--envision-t2-border-radius-container-md)' }}>
      <p style={{ margin: 0, fontWeight: 'var(--envision-t1-font-weight-600)' }}>Request a quote</p>
      <envision-input label="Full name" value="Dana Ruiz" required />
      <envision-input label="Email" type="email" value="dana@" invalid error-message="Enter a complete email address." />
      <envision-checkbox label="Include appliance upgrades" checked />
      {/* Field and Checkbox render their own labels. A standalone Label is for the case they cannot
          cover: naming a group of controls that has no single input to attach to. */}
      <envision-label text="Preferred contact" html-for="pe-contact" />
      <envision-radio label="Email" name="pe-contact" value="email" checked />
      <envision-radio label="Phone" name="pe-contact" value="phone" />
      <envision-switch label="Send me package updates" checked />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <envision-button variant="primary" label="Request quote" />
      </div>
    </div>
  );
}

/** Page chrome: where a person is, what is flagged, and the ways out. */
/**
 * The notification bell as it sits in the product's top bar.
 *
 * The count on it is a real `envision-badge`, which is what makes this a composition rather than a
 * drawing: the badge here is the same element the Notification Badge page documents. The bell glyph
 * and the account chip around it are chrome, drawn to give the badge somewhere true to sit.
 */
export function NotificationBell() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--dc-space-4)',
        /* Fits the column it is dropped into rather than forcing it to scroll. At a fixed 340 the
           right end of the bar, the bell and the account chip, sat outside the visible area on a
           page with a contents column, so the composition showed everything except its subject. */
        inlineSize: '100%',
        maxInlineSize: 340,
        padding: '12px 16px',
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}
    >
      <span style={{ fontWeight: 'var(--envision-t1-font-weight-600)' }}>Design Center</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-4)' }}>
        {/* The badge is anchored to the bell's top-right CORNER, and mostly outside it. A count
            badge is 32x28 at this size, so centring it on a 24px glyph hid the bell completely:
            the composition showed a number floating where its subject should have been. */}
        <span style={{ position: 'relative', display: 'inline-flex', marginInlineEnd: 'var(--dc-space-4)' }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>
            notifications
          </span>
          <span style={{ position: 'absolute', insetBlockStart: -10, insetInlineStart: 16 }}>
            <envision-badge tone="brand" count={2} label="2 unread notifications" />
          </span>
        </span>
        <span
          style={{
            inlineSize: 34, blockSize: 34, display: 'grid', placeItems: 'center',
            borderRadius: 'var(--envision-t2-border-radius-circular)',
            background: 'var(--envision-t3-avatar-color-background)',
            fontSize: 'var(--envision-t1-font-size-12)', fontWeight: 'var(--envision-t1-font-weight-600)',
          }}
        >
          TJ
        </span>
      </span>
    </div>
  );
}

/**
 * The Packages tab of the Design Center rail.
 *
 * The rail composition on this site shows its Customize tab, which is why Card-Package appeared in
 * no composition despite being one of the two things the rail is for. Cards are the real element,
 * given the package data the product supplies.
 */
const PACKAGES = [
  { id: 'heritage', name: 'Heritage Package', description: 'Warm oak, brass hardware, quartz counters.', priceLabel: '+$4,280', popular: true, badgeLabel: 'Popular', color: '#c9b28a' },
  { id: 'coastal', name: 'Coastal Package', description: 'Painted sage, matte black, honed marble.', priceLabel: '+$3,150', color: '#8fa294' },
];

export function PackagesTab() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // `pkg` is an object, so it is a property rather than an attribute: markup cannot carry it.
    ref.current?.querySelectorAll('envision-package-card').forEach((el, i) => {
      (el as unknown as Record<string, unknown>).pkg = PACKAGES[i];
    });
  }, []);
  return (
    <div
      ref={ref}
      style={{
        inlineSize: '100%', maxInlineSize: 392, padding: 'var(--dc-space-5)',
        display: 'grid', gap: 'var(--dc-space-5)',
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}
    >
      <div className="dc-tabstrip dc-tabstrip--fitted" style={{ display: 'flex', gap: 'var(--dc-space-6)' }}>
        <envision-tab label="Customize" />
        <envision-tab label="Packages" selected />
      </div>
      {PACKAGES.map((pk) => <envision-package-card key={pk.id} />)}
    </div>
  );
}

/**
 * The page header a Design Center room sits under.
 *
 * Breadcrumbs are the component here; the heading beside them is chrome, drawn so the trail has the
 * thing it is a trail to.
 */
export function RoomHeader() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const crumbs = ref.current?.querySelector('envision-breadcrumbs');
    if (crumbs) {
      (crumbs as unknown as Record<string, unknown>).items = [
        { label: 'Kitchen', href: '#' },
        { label: 'Cabinets', href: '#' },
        { label: 'Finish' },
      ];
    }
  }, []);
  return (
    <div
      ref={ref}
      style={{
        inlineSize: '100%', maxInlineSize: 392, padding: 'var(--dc-space-5)',
        display: 'grid', gap: 'var(--dc-space-3)',
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}
    >
      <envision-breadcrumbs />
      <p style={{ margin: 0, fontSize: 'var(--envision-t1-font-size-20)', fontWeight: 'var(--envision-t1-font-weight-600)' }}>Finish</p>
      <p className="dc-small" style={{ margin: 0 }}>Choose the cabinet finish for this room.</p>
    </div>
  );
}

export function PageChrome() {
  return (
    <div style={{ display: 'grid', gap: 'var(--dc-space-4)', padding: 20, width: 340, background: 'var(--dc-surface)', border: '1px solid var(--envision-t2-color-border-default-default)', borderRadius: 'var(--envision-t2-border-radius-container-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-3)' }}>
        <p style={{ margin: 0, fontWeight: 'var(--envision-t1-font-weight-600)' }}>Kitchen</p>
        <envision-badge tone="brand" count={3} label="3 pending selections" />
      </div>
      <p className="dc-small" style={{ margin: 0 }}>Three selections still need a decision before this design can be applied.</p>
      <envision-link href="#" label="Continue to Design Center" variant="standalone" />
      <div style={{ display: 'flex', gap: 8 }}>
        <envision-icon-button icon="favorite" accessible-name="Save this design" />
        <envision-icon-button icon="share" accessible-name="Share this design" />
        <envision-icon-button icon="tune" accessible-name="Adjust settings" />
      </div>
    </div>
  );
}

/**
 * Desktop / tablet / mobile shown together (Part XX, ResponsiveExample).
 *
 * Each frame is a real viewport-width container rendering the same children, so the reader sees
 * genuine reflow rather than three drawings of what reflow might look like.
 */
export function ResponsiveExample({
  children, widths = [420, 320, 260], labels = ['Desktop', 'Tablet', 'Mobile'], caption,
}: {
  children: React.ReactNode;
  widths?: [number, number, number];
  labels?: [string, string, string];
  caption?: string;
}) {
  return (
    <figure style={{ margin: '28px 0' }}>
      {/* Frames are deliberately wider than a phone viewport, so the ROW scrolls, not the page. */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', overflowX: 'auto', maxWidth: '100%', paddingBlockEnd: 4 }}>
        {widths.map((w, i) => (
          <div key={labels[i]} style={{ display: 'grid', gap: 8 }}>
            <envision-badge tone="brand" label={labels[i]} />
            <div style={{
              width: w, maxWidth: '86vw', padding: 16, overflow: 'hidden',
              background: 'var(--dc-surface-warm)',
              border: '1px solid var(--envision-t2-color-border-default-default)',
              borderRadius: 'var(--envision-t2-border-radius-container-md)',
            }}>
              {children}
            </div>
          </div>
        ))}
      </div>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * MaterialSwatch's two contents, side by side.
 *
 * The component renders a paint, wood or stone sample as a flat chip and a metal finish as a
 * rendered sphere. That is not decoration: the shape is how a reader tells a color apart from a
 * finish, so the page shows both rather than one and a sentence about the other.
 */
export function MaterialSwatchContents() {
  const paint: SwatchOption = { id: 'saybrook-sage', name: 'Saybrook Sage', color: '#9da391', priceLabel: 'Included' };
  const finish: SwatchOption = {
    id: 'brushed-brass', name: 'Brushed Brass', finish: 'Brushed',
    color: metal('#efe3b4', '#d3c48c', '#b7a768', '#7b6d38'), priceLabel: '+$180',
  };
  const noop = () => {};
  return (
    <div style={{ display: 'flex', gap: 'var(--dc-space-8)', alignItems: 'flex-start' }}>
      {([['Chip · paint, wood, stone', paint, 'square'], ['Sphere · metal finish', finish, 'circle']] as Array<[string, SwatchOption, 'square' | 'circle']>).map(
        ([label, option, shape]) => (
          <span key={label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-3)', inlineSize: 120 }}>
            <span style={{ inlineSize: 64 }}>
              <RailSwatch option={option} selected={false} onSelect={noop} shape={shape} />
            </span>
            <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)', textAlign: 'center' }}>{label}</span>
          </span>
        ),
      )}
    </div>
  );
}
