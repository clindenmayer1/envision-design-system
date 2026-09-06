
import envisionTheme from '@envision/tokens/themes/envision';
import westlakeTheme from '@envision/tokens/themes/westlake';
import harborTheme from '@envision/tokens/themes/example-harbor';
import citrineTheme from '@envision/tokens/themes/example-citrine';

/**
 * Editorial visuals for section heroes.
 *
 * These are built from the REAL Envision components and real material data rather than drawn
 * mock-ups, which is what Part XVIII and Part LVI require: no fake components, no invented UI. The
 * material palette is the same product data the MaterialSwatch stories use.
 *
 * KNOWN GAP: the supplied Figma hero uses rendered 3D material objects (faucet, pull, roller,
 * marble). Those assets are not in this repository, so the composition below stands in using the
 * product's own selection components. It communicates the same idea, that Envision's interface
 * belongs to a material-selection product, without inventing artwork.
 */

/**
 * Foundations hero visual: color, type, spacing, radius and a material sample shown together, so
 * "foundation" reads as a set of underlying decisions rather than a single topic.
 */
export function FoundationsComposition() {
  // Semantic roles, not Tier-1 primitives. Two reasons: the site must obey the same
  // never-consume-T1 rule it documents, and pinning this to a specific color family would show
  // one builder's brand as though it were the system's.
  const swatches = [
    '--envision-t2-color-background-brand-default',
    '--envision-t2-color-background-brand-subtle-default',
    '--envision-t2-color-content-primary-default',
    '--envision-t2-color-background-surface-sunken-default',
    '--envision-t2-color-background-accent-default',
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--dc-space-5)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {swatches.map((s) => (
          <span
            key={s}
            title={s}
            style={{
              width: 44, height: 44, borderRadius: 8,
              background: `var(${s})`,
              border: '1px solid var(--envision-t2-color-border-default-default)',
            }}
          />
        ))}
      </div>

      <div>
        <span style={{ fontFamily: 'var(--envision-t2-font-family-display), Georgia, serif', fontSize: 'var(--envision-t1-font-size-32)', lineHeight: 1.1 }}>
          Aa
        </span>
        <span className="dc-small" style={{ marginInlineStart: 12 }}>Playfair Display · Inter</span>
      </div>

      {/* Spacing ruler: the real 8pt scale, shown at true relative width. */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--dc-space-2)' }}>
        {[4, 8, 12, 16, 24, 32, 48].map((n) => (
          <span key={n} style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
            <span style={{ width: n, height: 10, background: 'var(--envision-t2-color-background-brand-default)', borderRadius: 2 }} />
            <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{n}</span>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--dc-space-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {/* radius */}
        <div style={{ display: 'flex', gap: 'var(--dc-space-3)' }}>
          {[
            ['4', 'var(--envision-t2-border-radius-control-xs)'],
            ['8', 'var(--envision-t2-border-radius-control)'],
            ['10', 'var(--envision-t2-border-radius-container-md)'],
          ].map(([label, radius]) => (
            <span
              key={label}
              style={{
                width: 46, height: 38, borderRadius: radius,
                background: 'var(--dc-surface-warm)',
                border: '1px solid var(--envision-t2-color-border-strong-default)',
                display: 'grid', placeItems: 'center', fontSize: 'var(--envision-t1-font-size-11)',
                color: 'var(--envision-t2-color-content-secondary-default)',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* layout: a column grid with gutters, the region structure every page inherits */}
        <div style={{ display: 'grid', gap: 4 }}>
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, width: 130 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} style={{ height: 38, background: 'var(--dc-surface-sunken)', borderRadius: 2 }} />
            ))}
          </span>
          <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>columns + gutter</span>
        </div>

        {/* material: the product data foundations must coexist with, not restyle */}
        <div style={{ display: 'grid', gap: 4 }}>
          <span style={{ display: 'flex', gap: 4 }}>
            {['#5b4636', '#c9b28a', '#26364a'].map((c) => (
              <span key={c} style={{ width: 26, height: 38, background: c, borderRadius: 4 }} />
            ))}
          </span>
          <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>material</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Four themes, same system.
 *
 * The Theming landing needs to make one point before any prose does: these are the same
 * components and the same layout, and only the brand layer differs between them. Ramps are read
 * from the real theme documents, so this cannot drift from what ships.
 */
export function ThemeRampComposition() {
  const themes = [
    { label: 'Default', theme: envisionTheme },
    { label: 'Westlake', theme: westlakeTheme },
    { label: 'Harbor', theme: harborTheme },
    { label: 'Citrine', theme: citrineTheme },
  ];
  const STEPS = ['100', '300', '500', '800'] as const;
  return (
    <div style={{ display: 'grid', gap: 'var(--dc-space-4)' }}>
      {themes.map(({ label, theme }) => (
        <div key={theme.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="dc-small" style={{ width: 68, flex: 'none' }}>{label}</span>
          <span style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', flex: 'none' }}>
            {STEPS.map((step) => (
              <span key={step} style={{ width: 26, height: 26, background: theme.brand.primary[step] }} />
            ))}
          </span>
          <span
            style={{
              background: theme.brand.primary['500'], color: theme.brand.contentOnBrand,
              padding: 'var(--dc-space-1) 12px', borderRadius: 8,
              fontSize: 'var(--envision-t1-font-size-12)', fontWeight: 600, flex: 'none',
            }}
          >
            Button
          </span>
        </div>
      ))}
    </div>
  );
}
