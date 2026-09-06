import { Copyable } from './index';
import { system } from '../data/generated';

/**
 * Scale visuals, every one generated from the token build (Part 33).
 *
 * None of these components contain a typed-out list of values. They filter `system.tokens`, which
 * is produced from `packages/tokens/dist/tokens.css`, so a token added or removed at source appears
 * or disappears here without anyone editing a page.
 */

const px = (v: string | null) => (v ? parseFloat(v) : 0);
const tokensByPrefix = (prefix: string) =>
  system.tokens.filter((t) => t.name.startsWith(prefix)).sort((a, b) => px(a.resolved) - px(b.resolved));

const TABLE_HEAD: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', whiteSpace: 'nowrap',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)',
  fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--envision-t2-color-content-secondary-default)',
};
export const TABLE_CELL: React.CSSProperties = {
  padding: 'var(--dc-space-3)', verticalAlign: 'top',
  borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)',
};

/** Wide reference tables scroll inside their own container, never the page. */
export function ScrollTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-14)' }}>
        <thead><tr>{head.map((h) => <th key={h} scope="col" style={TABLE_HEAD}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ typography */

/** The real type scale, drawn at true size from the primitive font-size tokens. */
export function TypeSpecimen() {
  const sizes = tokensByPrefix('--envision-t1-font-size-').filter((t) => t.resolved);
  return (
    <figure style={{ margin: '24px 0' }}>
      <p className="dc-sr-only">
        The Envision type scale, from {px(sizes[0]?.resolved)} to {px(sizes[sizes.length - 1]?.resolved)} pixels,
        rendered at true size. Each row shows the token name and its resolved value.
      </p>
      <div style={{
        display: 'grid', gap: 'var(--dc-space-1)', padding: 'var(--dc-space-5)', overflowX: 'auto',
        background: 'var(--dc-surface-warm)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}>
        {sizes.map((t) => (
          <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--dc-space-4)', padding: '4px 0' }}>
            <span style={{ fontSize: `var(${t.name})`, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Envision</span>
            <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-11)', whiteSpace: 'nowrap' }}>
              <Copyable text={t.name} /> · {t.resolved}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* --------------------------------------------------------------------- spacing */

/** The spacing scale drawn at true width, so 16 is visibly twice 8. */
export function SpacingScale() {
  const steps = tokensByPrefix('--envision-t1-spacing-').filter((t) => t.resolved);
  return (
    <figure style={{ margin: '24px 0' }}>
      <p className="dc-sr-only">
        The Envision spacing scale has {steps.length} steps, from {steps[0]?.resolved} to{' '}
        {steps[steps.length - 1]?.resolved}, each drawn at true width.
      </p>
      <div style={{ display: 'grid', gap: 'var(--dc-space-2)', overflowX: 'auto' }}>
        {steps.map((t) => (
          <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-3)', minWidth: 0 }}>
            <span style={{
              width: `var(${t.name})`, minWidth: 1, height: 16, flex: '0 0 auto',
              background: 'var(--envision-t2-color-background-brand-default)', borderRadius: 'var(--envision-t2-border-radius-control-xs)',
            }} />
            <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)', whiteSpace: 'nowrap' }}>
              {t.resolved} · <Copyable text={t.name} />
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ---------------------------------------------------------------------- radius */

/** Every radius primitive drawn on an identical tile, so the difference is the only variable. */
export function RadiusSheet() {
  const radii = tokensByPrefix('--envision-t1-border-radius-').filter((t) => t.resolved);
  return (
    <figure style={{ margin: '24px 0' }}>
      <p className="dc-sr-only">
        Every radius primitive in the system, drawn on identical tiles: {radii.map((r) => r.resolved).join(', ')}.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--dc-space-4)' }}>
        {radii.map((t) => (
          <span key={t.name} style={{ display: 'grid', gap: 'var(--dc-space-2)', justifyItems: 'center' }}>
            <span style={{
              width: 64, height: 52, borderRadius: `var(${t.name})`,
              background: 'var(--dc-surface-warm)',
              border: '1px solid var(--envision-t2-color-border-strong-default)',
            }} />
            <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{t.resolved}</span>
          </span>
        ))}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------- elevation */

/** Each semantic elevation applied to an identical surface. */
export function ElevationSheet() {
  const levels = system.tokens.filter((t) => t.name.startsWith('--envision-t2-elevation-'));
  return (
    <figure style={{ margin: '24px 0' }}>
      <p className="dc-sr-only">
        The {levels.length} semantic elevation tokens, each applied to an identical surface:{' '}
        {levels.map((l) => l.name.replace('--envision-t2-elevation-', '')).join(', ')}.
      </p>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 'var(--dc-space-6)', padding: 'var(--dc-space-7)',
        background: 'var(--dc-surface-sunken)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}>
        {levels.map((t) => (
          <span key={t.name} style={{ display: 'grid', gap: 'var(--dc-space-2)', justifyItems: 'center' }}>
            <span style={{
              width: 108, height: 68, borderRadius: 'var(--envision-t2-border-radius-container-md)',
              background: 'var(--dc-surface)',
              boxShadow: `var(${t.name})`,
            }} />
            <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-11)', textAlign: 'center' }}>
              {t.name.replace('--envision-t2-elevation-', '')}
            </span>
          </span>
        ))}
      </div>
    </figure>
  );
}

/* ----------------------------------------------------------------- breakpoints */

/** Breakpoint reference generated from the primitive breakpoint tokens. */
const BREAKPOINT_ROLE: Record<string, string> = {
  mobile: 'The narrowest supported layout. Single column; the rail is a modal sheet.',
  tablet: 'Where the token build re-declares responsive values. The rail stops being a rail.',
  dashboard: 'The width at which the dashboard composition has room for its full grid.',
  desktop: 'The standard workspace width the product is designed against.',
  wide: 'The widest declared target; layouts stop growing rather than stretching further.',
};

export function BreakpointTable() {
  const bps = tokensByPrefix('--envision-t1-breakpoint-');
  return (
    <ScrollTable head={['Name', 'Token', 'Value', 'Role']}>
      {bps.map((t) => {
        const name = t.name.replace('--envision-t1-breakpoint-', '');
        return (
          <tr key={t.name}>
            <td style={{ ...TABLE_CELL, fontWeight: 600, textTransform: 'capitalize' }}>{name}</td>
            <td style={TABLE_CELL}><Copyable text={t.name} /></td>
            <td style={TABLE_CELL}>{t.resolved}</td>
            <td style={TABLE_CELL}>{BREAKPOINT_ROLE[name] ?? 'Role not recorded in source.'}</td>
          </tr>
        );
      })}
    </ScrollTable>
  );
}

/* --------------------------------------------------------------- token groups */

/** Distinct groups under a prefix, e.g. the semantic color roles. Generated, never listed. */
export function tokenGroups(prefix: string, depth = 1): string[] {
  const set = new Set<string>();
  for (const t of system.tokens) {
    if (!t.name.startsWith(prefix)) continue;
    const rest = t.name.slice(prefix.length).split('-');
    if (rest.length >= depth) set.add(rest.slice(0, depth).join('-'));
  }
  return [...set].sort();
}

/** Count of tokens under a prefix, used so prose never states a number by hand. */
export const tokenCount = (prefix: string) => system.tokens.filter((t) => t.name.startsWith(prefix)).length;
