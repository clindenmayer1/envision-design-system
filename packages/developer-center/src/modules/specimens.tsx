/**
 * Specimens for components the Figma library has drawn but code has not implemented yet.
 *
 * These are built from the design system's own tokens, in React and CSS, so they stay crisp at any
 * zoom, follow the active theme, and reskin for a builder the way the real component will. They are
 * not screenshots and they are not invention: every dimension, label and rule below is transcribed
 * from the component's Figma page, which is a complete specification for each of them.
 *
 * The distinction from a live example is kept explicit on the page: a specimen documents what the
 * component IS, and the page still says the component has no implementation yet. When one ships,
 * its entry here is deleted and the real element takes over.
 */

import { useMemo, useState } from 'react';
import { FinishGroup } from './product';

const card: React.CSSProperties = {
  background: 'var(--dc-surface)',
  border: '1px solid var(--envision-t2-color-border-default-default)',
  borderRadius: 'var(--envision-t2-border-radius-container-md)',
  padding: 'var(--dc-space-6)',
  display: 'grid',
  gap: 'var(--dc-space-4)',
};

const heading: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--envision-t1-font-size-16)',
  fontWeight: 'var(--envision-t1-font-weight-600)',
};

const muted: React.CSSProperties = {
  color: 'var(--envision-t2-color-content-secondary-default)',
  fontSize: 'var(--envision-t1-font-size-13)',
};

/** The calendar glyph Card-Header uses on the dashboard cards. */
function CalendarIcon() {
  return (
    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>
      calendar_today
    </span>
  );
}

/** Card-Header: an icon and title, with an optional link on the end. */
function CardHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--dc-space-3)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-2)' }}>
        <CalendarIcon />
        <h3 style={heading}>{title}</h3>
      </span>
      {link && <envision-link href="#" label={link} />}
    </div>
  );
}

/**
 * ProgressRing: percent and caption inside a ring whose sweep matches the value.
 *
 * A conic gradient rather than SVG, so the track and the arc are token colors that follow the
 * theme, and the ring stays sharp at any size.
 */
function ProgressRing({ percent = 20, size = 108 }: { percent?: number; size?: number }) {
  return (
    <div
      role="img"
      aria-label={`${percent} percent complete`}
      style={{
        inlineSize: size,
        blockSize: size,
        borderRadius: 'var(--envision-t2-border-radius-circular)',
        display: 'grid',
        placeItems: 'center',
        background: `conic-gradient(var(--envision-t2-color-content-primary-default) ${percent}%, var(--envision-t2-color-background-surface-sunken-default) 0)`,
      }}
    >
      <span
        style={{
          inlineSize: size - 22,
          blockSize: size - 22,
          borderRadius: 'var(--envision-t2-border-radius-circular)',
          background: 'var(--dc-surface)',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        <span>
          <strong style={{ display: 'block', fontSize: 'var(--envision-t1-font-size-20)' }}>{percent}%</strong>
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>Complete</span>
        </span>
      </span>
    </div>
  );
}

const ROOMS: Array<[number, string, string]> = [
  [1, 'Kitchen', 'In Progress'],
  [2, 'Primary Bathroom', 'Get Started'],
  [3, 'Secondary Bathroom', 'Complete'],
  [4, 'Flooring', 'Get Started'],
  [5, 'Interior Finishes', 'Get Started'],
];

/** RoomProgressItem: number, name, and the room's state on the end. */
function RoomProgressItem({ n, name, state }: { n: number; name: string; state: string }) {
  const done = state === 'Complete';
  const current = state === 'In Progress';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--dc-space-3)',
        padding: 'var(--dc-space-2) var(--dc-space-3)',
        borderRadius: 'var(--envision-t2-border-radius-control)',
        background: current ? 'var(--dc-surface-sunken)' : 'transparent',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          inlineSize: 20,
          blockSize: 20,
          flex: '0 0 auto',
          borderRadius: 'var(--envision-t2-border-radius-circular)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 'var(--envision-t1-font-size-11)',
          background: done ? 'var(--envision-t2-color-content-primary-default)' : 'transparent',
          color: done ? 'var(--envision-t2-color-content-on-primary-default)' : 'inherit',
          border: done ? 'none' : '1px solid var(--envision-t2-color-border-default-default)',
        }}
      >
        {done ? '✓' : ''}
      </span>
      <span style={{ flex: '0 0 auto', ...muted }}>{n}</span>
      <span style={{ flex: 1, minWidth: 0, fontWeight: current ? 'var(--envision-t1-font-weight-600)' : 'var(--envision-t1-font-weight-400)' }}>
        {name}
      </span>
      <span style={muted}>{state}</span>
    </div>
  );
}

/** KeyDateRow: a label with its date, optionally over a divider. */
function KeyDateRow({ label, date, divider }: { label: string; date: string; divider?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 'var(--dc-space-4)',
        paddingBlock: 'var(--dc-space-3)',
        borderBlockStart: divider ? '1px solid var(--envision-t2-color-border-subtle-default)' : 'none',
      }}
    >
      <span>{label}</span>
      <span style={{ ...muted, fontVariantNumeric: 'tabular-nums' }}>{date}</span>
    </div>
  );
}

export const SPECIMENS: Record<string, () => React.ReactElement> = {
  'card-header': () => (
    <div style={{ ...card, inlineSize: 360 }}>
      <CardHeader title="Key Dates" link="View Full Schedule" />
    </div>
  ),

  'progress-ring': () => <ProgressRing percent={20} />,

  'room-progress-item': () => (
    <div style={{ inlineSize: 360, display: 'grid', gap: 'var(--dc-space-1)' }}>
      {ROOMS.slice(0, 3).map(([n, name, state]) => (
        <RoomProgressItem key={n} n={n} name={name} state={state} />
      ))}
    </div>
  ),

  'key-date-row': () => (
    <div style={{ inlineSize: 360 }}>
      <KeyDateRow label="Design Center Appointment" date="Mar 14, 2026" />
      <KeyDateRow label="Selections Due" date="Apr 02, 2026" divider />
      <KeyDateRow label="Construction Start" date="May 19, 2026" divider />
    </div>
  ),

  'progress-card': () => (
    <div style={{ ...card, inlineSize: 560 }}>
      <CardHeader title="Design Progress" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-6)' }}>
        <ProgressRing percent={20} />
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 'var(--dc-space-1)' }}>
          {ROOMS.map(([n, name, state]) => (
            <RoomProgressItem key={n} n={n} name={name} state={state} />
          ))}
        </div>
      </div>
    </div>
  ),

  'key-date-card': () => (
    <div style={{ ...card, inlineSize: 380 }}>
      <CardHeader title="Key Dates" link="View Full Schedule" />
      <div>
        <KeyDateRow label="Design Center Appointment" date="Mar 14, 2026" />
        <KeyDateRow label="Selections Due" date="Apr 02, 2026" divider />
        <KeyDateRow label="Construction Start" date="May 19, 2026" divider />
        <KeyDateRow label="Estimated Completion" date="Nov 08, 2026" divider />
      </div>
    </div>
  ),

  'whats-next-card': () => (
    <div style={{ ...card, inlineSize: 360 }}>
      <CardHeader title="What's Next?" />
      {/* Media preview with the CTA as a full-bleed bar pinned to its bottom, which is how the
          product builds it: the bar is square-cornered and rounded only by the preview clipping it. */}
      <div
        style={{
          position: 'relative',
          blockSize: 190,
          borderRadius: 'var(--envision-t2-border-radius-container-md)',
          overflow: 'hidden',
          background: 'var(--envision-t2-color-background-surface-sunken-default)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            insetInline: 0,
            insetBlockEnd: 0,
            blockSize: 46,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--envision-t2-color-background-brand-default)',
            color: 'var(--envision-t2-color-content-on-primary-default)',
            fontSize: 'var(--envision-t1-font-size-15)',
            fontWeight: 'var(--envision-t1-font-weight-600)',
          }}
        >
          Continue to Kitchen Selections
        </div>
      </div>
    </div>
  ),

  divider: () => (
    <div style={{ inlineSize: 420, display: 'grid', gap: 'var(--dc-space-4)' }}>
      <span>Cabinets</span>
      <hr style={{ margin: 0, border: 0, borderBlockStart: '1px solid var(--envision-t2-color-border-default-default)' }} />
      <span>Countertops</span>
    </div>
  ),

  thumbnail: () => (
    <div style={{ display: 'flex', gap: 'var(--dc-space-5)', alignItems: 'flex-end' }}>
      {([['Door', 96, 128], ['Square', 112, 112]] as Array<[string, number, number]>).map(([label, w, h]) => (
        <span key={label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-2)' }}>
          <span
            style={{
              inlineSize: w,
              blockSize: h,
              borderRadius: 'var(--envision-t2-border-radius-container-sm)',
              background: 'var(--envision-t2-color-background-surface-sunken-default)',
              border: '1px solid var(--envision-t2-color-border-subtle-default)',
            }}
          />
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>{label}</span>
        </span>
      ))}
    </div>
  ),

  table: () => (
    <div style={{ inlineSize: 480, overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
        <thead>
          <tr>
            {['Selection', 'Option', 'Price'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'start',
                  padding: 'var(--dc-space-2) var(--dc-space-3)',
                  borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)',
                  fontSize: 'var(--envision-t1-font-size-12)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  ...muted,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[['Cabinets', 'Beadboard Shaker', 'Included'], ['Countertops', 'Calacatta Marble', '+$1,200'], ['Hardware', 'Modern Bar', 'Included']].map((r) => (
            <tr key={r[0]}>
              {r.map((cell, i) => (
                <td
                  key={i}
                  style={{
                    padding: 'var(--dc-space-3)',
                    borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)',
                    fontVariantNumeric: i === 2 ? 'tabular-nums' : undefined,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

/* ------------------------------------------------------------------ shared parts */

/** A material preview: portrait for cabinet doors, square for everything else. */
function Thumb({ shape = 'square', selected, color = '#c9b28a', size = 72 }: {
  shape?: 'door' | 'square'; selected?: boolean; color?: string; size?: number;
}) {
  return (
    <span
      style={{
        inlineSize: size,
        blockSize: shape === 'door' ? Math.round(size * 1.34) : size,
        display: 'block',
        borderRadius: 'var(--envision-t2-border-radius-container-sm)',
        background: color,
        // Selection is a ring, never color alone.
        boxShadow: selected
          ? '0 0 0 2px var(--dc-surface), 0 0 0 3px var(--envision-t2-color-border-ring-selected-default)'
          : 'inset 0 0 0 1px var(--envision-t2-color-border-subtle-default)',
      }}
    />
  );
}

/** SelectionTile: a Material Thumbnail with a centered name and its Included or +$ note. */
function Tile({ shape = 'square', name = 'Material Name', note = 'Included', selected }: {
  shape?: 'door' | 'square'; name?: string; note?: string; selected?: boolean;
}) {
  return (
    <span style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-2)', inlineSize: 96 }}>
      <Thumb shape={shape} selected={selected} size={88} />
      <span style={{ fontSize: 'var(--envision-t1-font-size-13)', fontWeight: 'var(--envision-t1-font-weight-600)', textAlign: 'center', minBlockSize: 34 }}>{name}</span>
      <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>{note}</span>
    </span>
  );
}

const field: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--dc-space-2)',
  inlineSize: 300,
  padding: 'var(--dc-space-3) var(--dc-space-4)',
  background: 'var(--dc-surface)',
  border: '1px solid var(--envision-t2-color-border-default-default)',
  borderRadius: 'var(--envision-t2-border-radius-control)',
  fontSize: 'var(--envision-t1-font-size-14)',
};

function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

Object.assign(SPECIMENS, {
  // Already built here for the product pages, so the specimen is that component rather than a
  // second drawing of the same thing.
  'finish-group': () => <FinishGroup />,

  /* --------------------------------------------------------------- data display */

  avatar: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--dc-space-5)' }}>
      {([['Small', 28], ['Medium', 34], ['Large', 40]] as Array<[string, number]>).map(([label, px]) => (
        <span key={label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-2)' }}>
          <span style={{ blockSize: 40, display: 'grid', placeItems: 'center' }}>
            <span
              style={{
                inlineSize: px,
                blockSize: px,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--envision-t2-border-radius-circular)',
                background: 'var(--envision-t3-avatar-color-background)',
                fontSize: Math.round(px * 0.36),
                fontWeight: 'var(--envision-t1-font-weight-600)',
              }}
            >
              TJ
            </span>
          </span>
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>{label} · {px}</span>
        </span>
      ))}
    </div>
  ),

  'notification-badge': () => {
    /*
     * Every tone the library defines, in both shapes. The colors come from the component's own
     * token family, the same variables the Figma variants bind to, so a tone cannot drift here
     * without drifting in the design too. Brand is the exception the system intends: it has no
     * t3 entry because it takes the T2 brand role, which is what makes it re-theme per builder.
     */
    const TONES: Array<[string, string, string]> = [
      ['Neutral', 'var(--envision-t3-notification-badge-neutral-color-background)', 'var(--envision-t2-color-content-primary-default)'],
      ['Brand', 'var(--envision-t2-color-background-brand-default)', 'var(--envision-t2-color-content-on-brand-default)'],
      ['Info', 'var(--envision-t3-notification-badge-info-color-background)', 'var(--envision-t2-color-content-on-brand-default)'],
      ['Success', 'var(--envision-t3-notification-badge-success-color-background)', 'var(--envision-t2-color-content-on-brand-default)'],
      ['Warning', 'var(--envision-t3-notification-badge-warning-color-background)', 'var(--envision-t2-color-content-on-brand-default)'],
      ['Critical', 'var(--envision-t3-notification-badge-error-color-background)', 'var(--envision-t2-color-content-on-brand-default)'],
      ['Accent', 'var(--envision-t3-notification-badge-accent-color-background)', 'var(--envision-t2-color-content-on-brand-default)'],
    ];
    const caption: React.CSSProperties = { ...muted, fontSize: 'var(--envision-t1-font-size-11)' };
    return (
      <div style={{ display: 'grid', gap: 'var(--dc-space-6)' }}>
        {(['Count', 'Dot'] as const).map((shape) => (
          <div key={shape} style={{ display: 'grid', gap: 'var(--dc-space-3)' }}>
            <span style={caption}>Shape: {shape}</span>
            <div style={{ display: 'flex', gap: 'var(--dc-space-6)', flexWrap: 'wrap' }}>
              {TONES.map(([name, background, color]) => (
                <span key={name} style={{ display: 'grid', justifyItems: 'start', gap: 'var(--dc-space-3)' }}>
                  {shape === 'Count' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minInlineSize: 'var(--envision-t1-spacing-250)',
                        paddingInline: 'var(--envision-t1-spacing-100)',
                        paddingBlock: 'var(--envision-t1-spacing-50)',
                        borderRadius: 'var(--envision-t2-border-radius-pill)',
                        fontSize: 'var(--envision-t1-font-size-12)',
                        fontWeight: 'var(--envision-t1-font-weight-600)',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                        background,
                        color,
                      }}
                    >
                      9
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        inlineSize: 'var(--envision-t3-badge-notification-dot-size)',
                        blockSize: 'var(--envision-t3-badge-notification-dot-size)',
                        borderRadius: 'var(--envision-t2-border-radius-circular)',
                        background,
                      }}
                    />
                  )}
                  <span style={caption}>{name}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },

  'notification-bell': () => (
    <span style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', inlineSize: 40, blockSize: 40 }}>
      <Glyph name="notifications" size={24} />
      <span style={{ position: 'absolute', insetBlockStart: 2, insetInlineEnd: 2 }}>
        <envision-badge tone="brand" count={3} label="3 notifications" />
      </span>
    </span>
  ),

  /* ---------------------------------------------------------- inputs & selection */

  'material-thumb': () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--dc-space-6)' }}>
      {([['Door', 'door'], ['Square', 'square']] as Array<[string, 'door' | 'square']>).map(([label, shape]) => (
        <span key={label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-3)' }}>
          <span style={{ display: 'flex', gap: 'var(--dc-space-3)', alignItems: 'flex-end' }}>
            <Thumb shape={shape} />
            <Thumb shape={shape} selected />
          </span>
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>{label}: default, selected</span>
        </span>
      ))}
    </div>
  ),

  'selection-tile': () => (
    <div style={{ display: 'flex', gap: 'var(--dc-space-5)', alignItems: 'flex-start' }}>
      <Tile shape="door" name="Beadboard Shaker" note="Included" selected />
      <Tile shape="door" name="Flat Panel" note="Included" />
      <Tile shape="door" name="Raised Panel" note="+$240" />
    </div>
  ),

  'style-tile': () => (
    <div style={{ display: 'flex', gap: 'var(--dc-space-5)', alignItems: 'flex-start' }}>
      <Tile name="Classic Shaker" note="Included" selected />
      <Tile name="Flat Panel" note="Included" />
      <Tile name="Raised Panel" note="+$240" />
    </div>
  ),

  'selection-tray': () => (
    <div
      style={{
        inlineSize: 520,
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-lg)',
        padding: 'var(--dc-space-5)',
        display: 'grid',
        gap: 'var(--dc-space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={heading}>Cabinet Style</h3>
        <Glyph name="close" />
      </div>
      <div style={{ display: 'flex', gap: 'var(--dc-space-4)', overflowX: 'auto' }}>
        <Tile shape="door" name="Material Name" note="Included" selected />
        <Tile shape="door" name="Material Name" note="Included" />
        <Tile shape="door" name="Material Name" note="+$240" />
        <Tile shape="door" name="Material Name" note="+$310" />
      </div>
    </div>
  ),

  'selection-indicator': () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-5)' }}>
      {([['Medium', 24], ['Small', 18]] as Array<[string, number]>).map(([label, px]) => (
        <span key={label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-2)' }}>
          <span
            style={{
              inlineSize: px,
              blockSize: px,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 'var(--envision-t2-border-radius-circular)',
              background: 'var(--envision-t2-color-content-primary-default)',
              color: 'var(--envision-t2-color-content-on-primary-default)',
              fontSize: Math.round(px * 0.6),
            }}
          >
            ✓
          </span>
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>{label}</span>
        </span>
      ))}
    </div>
  ),

  dropdown: () => (
    <div style={{ display: 'grid', gap: 'var(--dc-space-3)', inlineSize: 300 }}>
      <div style={{ ...field, justifyContent: 'space-between' }}>
        <span>Kitchen</span>
        <Glyph name="expand_more" />
      </div>
      <div
        style={{
          background: 'var(--dc-surface)',
          border: '1px solid var(--envision-t2-color-border-default-default)',
          borderRadius: 'var(--envision-t2-border-radius-container-menu)',
          padding: 'var(--dc-space-2)',
          display: 'grid',
        }}
      >
        {[['Kitchen', 'In Progress'], ['Living Room', 'Complete'], ['Dining Room', 'Not Started']].map(([room, status], i) => (
          <span
            key={room}
            style={{
              display: 'flex', justifyContent: 'space-between', gap: 'var(--dc-space-4)',
              padding: 'var(--dc-space-2) var(--dc-space-3)',
              borderRadius: 'var(--envision-t2-border-radius-control-sm)',
              background: i === 0 ? 'var(--dc-surface-sunken)' : 'transparent',
              fontSize: 'var(--envision-t1-font-size-14)',
            }}
          >
            <span>{room}</span>
            <span style={muted}>{status}</span>
          </span>
        ))}
      </div>
    </div>
  ),

  'menu-item': () => (
    <div style={{ inlineSize: 300, display: 'grid', gap: 2 }}>
      {[['Kitchen', 'In Progress', true], ['Living Room', 'Complete', false], ['Dining Room', 'Not Started', false]].map(([room, status, sel]) => (
        <span
          key={room as string}
          style={{
            display: 'flex', justifyContent: 'space-between', gap: 'var(--dc-space-4)',
            padding: 'var(--dc-space-2) var(--dc-space-3)',
            borderRadius: 'var(--envision-t2-border-radius-control-sm)',
            background: sel ? 'var(--dc-surface-sunken)' : 'transparent',
            fontSize: 'var(--envision-t1-font-size-14)',
          }}
        >
          <span>{room as string}</span>
          <span style={muted}>{status as string}</span>
        </span>
      ))}
    </div>
  ),

  'form-field': () => (
    <div style={{ display: 'grid', gap: 'var(--dc-space-6)' }}>
      <div style={{ display: 'grid', gap: 'var(--dc-space-2)' }}>
        <envision-label text="First name" />
        <div style={field}><span style={muted}>Placeholder</span></div>
        <span style={{ ...muted, display: 'flex', alignItems: 'center', gap: 'var(--dc-space-1)', fontSize: 'var(--envision-t1-font-size-12)' }}>
          <Glyph name="info" size={14} /> Helper text
        </span>
      </div>
      <div style={{ display: 'grid', gap: 'var(--dc-space-2)' }}>
        <envision-label text="First name" />
        <div style={{ ...field, borderColor: 'var(--envision-t2-color-border-error-default)' }}>
          <span style={muted}>Placeholder</span>
        </div>
        {/* Error replaces helper text rather than joining it. */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-1)', fontSize: 'var(--envision-t1-font-size-12)', color: 'var(--envision-t2-color-content-error-default)' }}>
          <Glyph name="error" size={14} /> Please enter a valid value.
        </span>
      </div>
    </div>
  ),

  'search-field': () => (
    <div style={field}>
      <Glyph name="search" />
      <span style={muted}>Search finishes…</span>
    </div>
  ),

  'view-preset-control': () => (
    <div
      style={{
        display: 'inline-flex',
        gap: 'var(--dc-space-1)',
        padding: 'var(--dc-space-1)',
        background: 'var(--dc-surface-sunken)',
        borderRadius: 'var(--envision-t2-border-radius-pill)',
      }}
    >
      {['Overview', 'Range Wall', 'Island'].map((v, i) => (
        <span
          key={v}
          style={{
            padding: 'var(--dc-space-2) var(--dc-space-4)',
            borderRadius: 'var(--envision-t2-border-radius-pill)',
            fontSize: 'var(--envision-t1-font-size-13)',
            fontWeight: i === 0 ? 'var(--envision-t1-font-weight-600)' : 'var(--envision-t1-font-weight-400)',
            background: i === 0 ? 'var(--dc-surface)' : 'transparent',
          }}
        >
          {v}
        </span>
      ))}
    </div>
  ),

  // The real panel, and a working one: the categories switch, the search filters, the swatches
  // hover and take focus, and choosing one moves the ring and the check. A picker documented as a
  // still image cannot show any of that, and those states are most of what the component IS.
  'color-picker-modal': () => <ColorPickerModalSpecimen />,

  /* ----------------------------------------------------------------- navigation */

  'tab-bar': () => (
    <div className="dc-tabstrip" style={{ display: 'flex', gap: 'var(--dc-space-6)', paddingInline: 'var(--dc-space-4)' }}>
      <envision-tab label="Customize" selected />
      <envision-tab label="Packages" />
      <envision-tab label="Summary" />
    </div>
  ),

  navigation: () => (
    <div style={{ inlineSize: 240, display: 'grid', gap: 2 }}>
      {['Dashboard', 'Design Center', 'Packages', 'Settings'].map((item, i) => (
        <span
          key={item}
          aria-current={i === 1 ? 'page' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--dc-space-3)',
            padding: 'var(--dc-space-3) var(--dc-space-4)',
            borderRadius: 'var(--envision-t2-border-radius-control)',
            background: i === 1 ? 'var(--dc-surface-sunken)' : 'transparent',
            fontWeight: i === 1 ? 'var(--envision-t1-font-weight-600)' : 'var(--envision-t1-font-weight-400)',
            fontSize: 'var(--envision-t1-font-size-14)',
          }}
        >
          {/* Current is marked by weight and an indicator, not by color alone. */}
          <span aria-hidden="true" style={{ inlineSize: 3, blockSize: 16, borderRadius: 2, background: i === 1 ? 'var(--envision-t2-color-background-brand-default)' : 'transparent' }} />
          {item}
        </span>
      ))}
    </div>
  ),

  'top-bar': () => (
    <div
      style={{
        inlineSize: 560,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--dc-space-4) var(--dc-space-5)',
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-3)' }}>
        <Glyph name="arrow_back" />
        <strong style={{ fontSize: 'var(--envision-t1-font-size-16)' }}>Kitchen</strong>
      </span>
      <span style={muted}>Lot 42 · Maple Ridge</span>
    </div>
  ),

  'global-nav': () => (
    <div
      style={{
        inlineSize: 640,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--dc-space-6)',
        padding: '0 var(--dc-space-5)',
        blockSize: 64,
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}
    >
      {/* The wordmark slot is the builder's, not the system's: a white-label seam, so it is drawn
          as a neutral placeholder rather than any one brand. */}
      <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-12)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Builder logo</span>
      <span style={{ display: 'flex', gap: 'var(--dc-space-5)', alignItems: 'center' }}>
        <envision-tab label="Overview" selected />
        <envision-tab label="Design" />
        <envision-tab label="Documents" />
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-3)' }}>
        <Glyph name="notifications" />
        <span style={{ inlineSize: 34, blockSize: 34, display: 'grid', placeItems: 'center', borderRadius: 'var(--envision-t2-border-radius-circular)', background: 'var(--envision-t3-avatar-color-background)', fontSize: 12, fontWeight: 'var(--envision-t1-font-weight-600)' }}>TJ</span>
        <Glyph name="expand_more" size={18} />
      </span>
    </div>
  ),

  // The canvas region in both of its states. The loading bar is drawn part-way on purpose: in the
  // product it is driven by real downloaded bytes, so it is never shown full until the scene has
  // actually rendered.
  'three-d-viewport-shell': () => (
    <div style={{ display: 'flex', gap: 'var(--dc-space-5)', alignItems: 'flex-start' }}>
      {([['Ready', false], ['Loading', true]] as Array<[string, boolean]>).map(([label, loading]) => (
        <span key={label} style={{ display: 'grid', gap: 'var(--dc-space-3)', justifyItems: 'start' }}>
          <span
            style={{
              position: 'relative',
              display: 'block',
              inlineSize: 300,
              blockSize: 188,
              borderRadius: 'var(--envision-t2-border-radius-container-md)',
              background: 'var(--envision-t2-color-background-surface-sunken-default)',
              overflow: 'hidden',
            }}
          >
            <span style={{ ...muted, position: 'absolute', insetBlockStart: 14, insetInlineStart: 14, fontSize: 'var(--envision-t1-font-size-11)' }}>
              {loading ? 'model downloading' : 'live model'}
            </span>
            {loading && (
              <>
                <span style={{ position: 'absolute', insetBlockEnd: 40, insetInlineStart: 36, inlineSize: 228, blockSize: 4, borderRadius: 2, background: 'var(--envision-t2-color-border-default-default)' }} />
                <span style={{ position: 'absolute', insetBlockEnd: 40, insetInlineStart: 36, inlineSize: 139, blockSize: 4, borderRadius: 2, background: 'var(--envision-t2-color-content-primary-default)' }} />
              </>
            )}
          </span>
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-11)' }}>{label}</span>
        </span>
      ))}
    </div>
  ),

  /* --------------------------------------------------------------------- panels */

  dialog: () => (
    <div
      style={{
        inlineSize: 420,
        background: 'var(--dc-surface)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-modal)',
        padding: 'var(--dc-space-6)',
        display: 'grid',
        gap: 'var(--dc-space-4)',
      }}
    >
      <h3 style={heading}>Discard these selections?</h3>
      <p style={{ ...muted, margin: 0 }}>Your cabinet and countertop choices will go back to the included options.</p>
      <div style={{ display: 'flex', gap: 'var(--dc-space-3)', justifyContent: 'flex-end' }}>
        <envision-button variant="outline" label="Cancel" />
        <envision-button variant="primary" label="Discard" />
      </div>
    </div>
  ),

  'home-hero': () => (
    <div
      style={{
        inlineSize: 560,
        padding: 'var(--dc-space-8) var(--dc-space-6)',
        background: 'var(--dc-surface-warm)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-lg)',
        display: 'grid',
        gap: 'var(--dc-space-2)',
      }}
    >
      {/* Type matches the HomeHero component in the library: Display/Eyebrow 22, Display/Hero 56
          in the display face, Body/XLarge 18. */}
      <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-22)' }}>Welcome home,</span>
      <strong
        style={{
          fontFamily: 'var(--envision-t2-font-family-display), Georgia, serif',
          fontSize: 'var(--envision-t1-font-size-56)',
          fontWeight: 'var(--envision-t1-font-weight-600)',
          lineHeight: 1.1,
        }}
      >
        The Johnsons!
      </strong>
      <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-18)' }}>
        We're excited to help you personalize your new home.
      </span>
    </div>
  ),

  'rail-footer': () => (
    <div
      style={{
        inlineSize: 392,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--dc-space-3)',
        padding: 'var(--dc-space-5)',
        background: 'var(--dc-surface-warm)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span className="dc-small">
        Selected upgrades <strong style={{ color: 'var(--envision-t2-color-content-primary-default)' }}>+$4,280</strong>
      </span>
      <envision-button variant="primary" label="Select this design" />
    </div>
  ),
});

/* ------------------------------------------------------- color picker modal */

/** A slice of the real Benjamin Moore library, so the categories and search have something true to work on. */
const WALL_COLORS: Record<string, Array<[string, string, string]>> = {
  "Whites": [
    ["White Zinfandel", "BM 880", '#f4efea'],
    ["Summer Peach", "BM 2167-70", '#fcf1e4'],
    ["Snowfall White", "BM OC-118", '#f6f7ee'],
    ["Chantilly Lace", "BM OC-65", '#f4f6f1'],
    ["Pink Bliss", "BM 2093-70", '#f5eae7'],
    ["Whitewater Bay", "BM OC-70", '#f4efea'],
    ["Vintage Taupe", "BM 2110-70", '#f2ede8'],
    ["Atrium White", "BM OC-145", '#f2efe8'],
    ["White Diamond", "BM OC-61", '#ecefec'],
    ["Sugar Cookie", "BM OC-93", '#f9f2e0'],
  ],
  "Grays": [
    ["Classic Gray", "BM OC-23", '#e3e0d7'],
    ["Wind's Breath", "BM OC-24", '#dfdbcd'],
    ["Swiss Coffee", "BM OC-45", '#eeece1'],
    ["Moonshine", "BM OC-56", '#d6d8cf'],
    ["Bunny Gray", "BM 2124-50", '#d6dbdc'],
    ["Alaskan Skies", "BM 972", '#d9d3c4'],
    ["Nature's Essentials", "BM 1521", '#dad5c6'],
    ["Perspective&reg;", "BM CSP-5", '#cbcdca'],
    ["Sweet Innocence", "BM 2125-50", '#c7cdd1'],
    ["Feather Gray", "BM 2127-60", '#c4cbd0'],
  ],
  "Beiges & Taupes": [
    ["Pale Almond", "BM OC-2", '#e7dbc3'],
    ["Gentle Cream", "BM OC-96", '#e9ddc5'],
    ["Bone White", "BM OC-143", '#e7deca'],
    ["Fog Mist", "BM OC-31", '#e2ddd0'],
    ["Prentis Cream", "BM CW-100", '#e8e1cc'],
    ["Basking Ridge Beige", "BM 1158", '#e0c8b6'],
    ["Kitsilano Beach", "BM CC-278", '#ead2b1'],
    ["Lighthouse Landing", "BM 1044", '#e7d9be'],
    ["Papaya", "BM CC-248", '#e5d7b9'],
    ["Ashwood", "BM OC-47", '#dbd8c9'],
  ],
  "Earth Tones": [
    ["Wythe Rose", "BM CW-225", '#c08e7f'],
    ["Pecos Spice", "BM AC-14", '#c39d87'],
    ["Butternut Squash", "BM 1090", '#c39b74'],
    ["Roxbury Caramel", "BM HC-42", '#caa378'],
    ["Wilmington Tan", "BM HC-34", '#ccb084'],
    ["Coral Bells", "BM CSP-1135", '#bd7a64'],
    ["Gaucho Brown", "BM 2096-40", '#a98573'],
    ["Tuscany", "BM 1208", '#bc8b6e'],
    ["Saddle Tan", "BM 1124", '#b99978'],
    ["Elk", "BM CC-362", '#a58d72'],
  ],
  "Greens": [
    ["Hancock Green", "BM HC-117", '#d4dabf'],
    ["New Retro", "BM 422", '#d8edc4'],
    ["O'Reilly Green", "BM 555", '#ceebb9'],
    ["Leisure Green", "BM 2035-60", '#c8e3d2'],
    ["Winter Green", "BM 2045-60", '#b3ede2'],
    ["Dusty Miller", "BM CSP-755", '#cecec0'],
    ["Wind Chime", "BM AF-465", '#c7cab6'],
    ["Budding Green", "BM CSP-790", '#c8d0b7'],
    ["Douglas Fern", "BM 563", '#aad0ac'],
    ["Biscayne Shore", "BM 604", '#afe4d4'],
  ],
  "Blues": [
    ["Iced Green", "BM 673", '#c6deda'],
    ["Iceberg", "BM 2122-50", '#d6e0e0'],
    ["Skyscraper", "BM 765", '#b7dfe5'],
    ["Watercolor", "BM CC-788", '#bcd4dd'],
    ["Ice Sculpture", "BM CC-938", '#c7d5e4'],
    ["Annapolis Green", "BM 687", '#c1d2ce'],
    ["Sea Isle", "BM 751", '#a5d7dc'],
    ["Hawaiian Breeze", "BM 772", '#abd3e2'],
    ["Grand Rapids", "BM 835", '#bad1dc'],
    ["Grandma's Sweater", "BM 787", '#94cce7'],
  ],
  "Dark & Moody": [
    ["Tucker Chocolate", "BM CW-175", '#4a403e'],
    ["Dark Teal", "BM 2053-20", '#255a5e'],
    ["Washington Blue", "BM CW-630", '#304656'],
    ["Midnight Navy", "BM 2067-10", '#333356'],
    ["Purplicious", "BM CSP-465", '#4d3354'],
    ["Windsor Green", "BM CW-505", '#484f32'],
    ["Emerald Isle", "BM 2039-20", '#008158'],
    ["Notre Dame", "BM CSP-570", '#404343'],
    ["Gal\u00e1pagos Turquoise", "BM 2057-20", '#1f5763'],
    ["Dark Purple", "BM 2073-10", '#4b3540'],
  ],};

/**
 * Value, then intensity, then hue: the same ordering the picker applies to the full library.
 *
 * Duplicated here rather than imported because the library lives in the product, not the design
 * system. The rule is the design system's, so the specimen has to demonstrate it, and OKLCH is what
 * makes "value" mean what the eye sees rather than a channel average.
 */
function orderByValue(rows: Array<[string, string, string]>): Array<[string, string, string]> {
  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const key = (hex: string) => {
    const h = hex.replace('#', '');
    const r = toLinear(parseInt(h.slice(0, 2), 16) / 255);
    const g = toLinear(parseInt(h.slice(2, 4), 16) / 255);
    const b = toLinear(parseInt(h.slice(4, 6), 16) / 255);
    const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
    const c = Math.sqrt(A * A + B * B);
    return { band: Math.round(L * 40), c, h: c < 0.004 ? -1 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
  };
  return rows
    .map((row) => ({ row, ...key(row[2]) }))
    .sort((a, b) => {
      if (a.band !== b.band) return b.band - a.band;
      if (Math.abs(a.c - b.c) > 0.012) return a.c - b.c;
      return a.h - b.h;
    })
    .map((x) => x.row);
}

function ColorPickerModalSpecimen() {
  const CATEGORIES = ['All Colors', ...Object.keys(WALL_COLORS)];
  const [category, setCategory] = useState('All Colors');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState('Sugar Cookie');

  const rows = useMemo(() => {
    const base = category === 'All Colors'
      ? Object.values(WALL_COLORS).flat()
      : WALL_COLORS[category] ?? [];
    const q = query.trim().toLowerCase();
    const hit = ([name, code]: [string, string, string]) =>
      !q || name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
    return orderByValue(base.filter(hit));
  }, [category, query]);

  return (
    <div className="dc-cpm">
      <div className="dc-cpm-head">
        <span style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ ...heading, fontSize: 'var(--envision-t1-font-size-20)' }}>Choose Wall Color</h3>
          <span style={{ ...muted, fontSize: 'var(--envision-t1-font-size-12)' }}>Benjamin Moore · full library</span>
        </span>
        <label className="dc-cpm-search">
          <Glyph name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search colors"
            aria-label="Search colors"
          />
        </label>
        <button type="button" className="dc-cpm-icon" aria-label="Close">
          <Glyph name="close" />
        </button>
      </div>

      <div className="dc-cpm-body">
        <div className="dc-cpm-side">
          <span className="dc-cpm-eyebrow">Browse by</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="dc-cpm-cat"
              aria-pressed={cat === category}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="dc-cpm-content">
          <div className="dc-cpm-count">
            <h4 style={{ ...heading, fontSize: 'var(--envision-t1-font-size-15)' }}>
              {category} ({rows.length})
            </h4>
            <span style={{ ...muted, display: 'flex', alignItems: 'center', gap: 'var(--dc-space-1)' }}>
              Sort by: Value <Glyph name="expand_more" size={16} />
            </span>
          </div>
          {rows.length === 0 ? (
            <p className="dc-small" style={{ margin: 0 }}>No color matches “{query}”.</p>
          ) : (
            <div className="dc-cpm-grid">
              {rows.map(([name, code, hex]) => (
                <button
                  key={name + code}
                  type="button"
                  className="dc-cpm-swatch"
                  aria-pressed={name === picked}
                  onClick={() => setPicked(name)}
                >
                  <span className="dc-cpm-chip" style={{ background: hex }}>
                    {name === picked && (
                      <span className="dc-cpm-check" aria-hidden="true">
                        <Glyph name="check" size={13} />
                      </span>
                    )}
                  </span>
                  <span className="dc-cpm-name">{name}</span>
                  <span className="dc-cpm-code">{code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dc-cpm-foot">
        {/* The bookmark is part of the action, not decoration: it is what distinguishes saving a
            colour for later from applying it now. */}
        <button type="button" className="dc-cpm-save">
          <Glyph name="bookmark" size={18} />
          Save Color
        </button>
        <envision-button variant="primary" label="Select This Color" />
      </div>

      <style>{`
        .dc-cpm {
          inline-size: 720px;
          max-inline-size: 100%;
          background: var(--dc-surface);
          border: 1px solid var(--envision-t2-color-border-default-default);
          border-radius: var(--envision-t2-border-radius-modal);
          overflow: hidden;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          text-align: start;
        }
        .dc-cpm-head { display: flex; align-items: center; gap: var(--dc-space-5); padding: var(--dc-space-5) var(--dc-space-6); }
        .dc-cpm-search {
          display: flex; align-items: center; gap: var(--dc-space-2);
          inline-size: 240px; padding: 0 var(--dc-space-4);
          border: 1px solid var(--envision-t2-color-border-default-default);
          border-radius: var(--envision-t2-border-radius-control);
          color: var(--envision-t2-color-content-secondary-default);
        }
        .dc-cpm-search:focus-within {
          border-color: var(--envision-t2-color-border-focus-default);
          outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default);
          outline-offset: 1px;
        }
        .dc-cpm-search input {
          flex: 1; min-inline-size: 0; border: 0; outline: none; background: none; font: inherit;
          font-size: var(--envision-t1-font-size-14);
          padding: var(--dc-space-3) 0;
          color: var(--envision-t2-color-content-primary-default);
        }
        .dc-cpm-icon {
          display: grid; place-items: center; inline-size: 32px; block-size: 32px;
          border: 0; background: none; cursor: pointer; border-radius: var(--envision-t2-border-radius-circular);
          color: var(--envision-t2-color-content-secondary-default);
        }
        .dc-cpm-icon:hover { background: var(--dc-surface-sunken); }
        .dc-cpm-body {
          display: grid; grid-template-columns: 176px minmax(0, 1fr);
          border-block-start: 1px solid var(--envision-t2-color-border-subtle-default);
        }
        .dc-cpm-side { padding: var(--dc-space-4); display: grid; gap: 2px; align-content: start; }
        .dc-cpm-eyebrow {
          font-size: var(--envision-t1-font-size-11); letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--envision-t2-color-content-secondary-default);
          padding: 0 var(--dc-space-3) var(--dc-space-2);
        }
        .dc-cpm-cat {
          text-align: start; border: 0; background: none; cursor: pointer; font: inherit;
          font-size: var(--envision-t1-font-size-14);
          padding: var(--dc-space-2) var(--dc-space-3);
          border-radius: var(--envision-t2-border-radius-control-sm);
          color: var(--envision-t2-color-content-primary-default);
        }
        .dc-cpm-cat:hover { background: var(--dc-surface-warm); }
        .dc-cpm-cat[aria-pressed='true'] { background: var(--dc-surface-sunken); font-weight: var(--envision-t1-font-weight-600); }
        .dc-cpm-cat:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 1px; }
        .dc-cpm-content { padding: var(--dc-space-5); display: grid; gap: var(--dc-space-4); align-content: start; }
        .dc-cpm-count { display: flex; align-items: baseline; justify-content: space-between; }
        .dc-cpm-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--dc-space-4); }
        .dc-cpm-swatch {
          display: grid; gap: var(--dc-space-2); align-content: start; justify-items: stretch;
          border: 0; background: none; padding: 0; cursor: pointer; font: inherit; text-align: start;
        }
        .dc-cpm-chip {
          position: relative; display: block; block-size: 62px;
          border-radius: var(--envision-t2-border-radius-container-sm);
          box-shadow: inset 0 0 0 1px var(--envision-t2-color-border-subtle-default);
          transition: box-shadow var(--envision-t2-motion-micro-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .dc-cpm-swatch:hover .dc-cpm-chip {
          box-shadow: 0 0 0 2px var(--dc-surface), 0 0 0 3px var(--envision-t3-material-swatch-ring-hover-color);
        }
        .dc-cpm-swatch[aria-pressed='true'] .dc-cpm-chip {
          box-shadow: 0 0 0 2px var(--dc-surface), 0 0 0 3px var(--envision-t2-color-border-ring-selected-default);
        }
        .dc-cpm-swatch:focus-visible { outline: none; }
        .dc-cpm-swatch:focus-visible .dc-cpm-chip {
          box-shadow: 0 0 0 2px var(--dc-surface), 0 0 0 4px var(--envision-t2-color-border-focus-default);
        }
        /* Selection is a check AND a ring: these cells differ from each other only by colour. */
        .dc-cpm-check {
          position: absolute; inset-block-start: -7px; inset-inline-end: -7px;
          inline-size: 20px; block-size: 20px; display: grid; place-items: center;
          border-radius: var(--envision-t2-border-radius-circular);
          background: var(--envision-t2-color-background-brand-default);
          color: var(--envision-t2-color-content-on-brand-default);
        }
        .dc-cpm-name { font-size: var(--envision-t1-font-size-12); font-weight: var(--envision-t1-font-weight-600); line-height: 1.25; }
        .dc-cpm-code { font-size: var(--envision-t1-font-size-11); color: var(--envision-t2-color-content-secondary-default); }
        .dc-cpm-foot {
          display: flex; align-items: center; justify-content: flex-end; gap: var(--dc-space-4);
          padding: var(--dc-space-4) var(--dc-space-6);
          border-block-start: 1px solid var(--envision-t2-color-border-subtle-default);
        }
        .dc-cpm-save {
          display: inline-flex; align-items: center; gap: var(--dc-space-2);
          border: 0; background: none; cursor: pointer; font: inherit;
          font-size: var(--envision-t1-font-size-15); font-weight: var(--envision-t1-font-weight-600);
          padding: var(--dc-space-3) var(--dc-space-4);
          border-radius: var(--envision-t2-border-radius-control);
          color: var(--envision-t2-color-content-primary-default);
        }
        .dc-cpm-save:hover { background: var(--dc-surface-sunken); }
        .dc-cpm-save:focus-visible { outline: var(--envision-t2-border-width-focus) solid var(--envision-t2-color-border-focus-default); outline-offset: 1px; }
      `}</style>
    </div>
  );
}
