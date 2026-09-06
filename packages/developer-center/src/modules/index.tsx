import { useEffect, useState } from 'react';
import { ICON } from '@envision/components';
import { Link } from 'react-router-dom';
import { ExternalIcon } from '../shell/Shell';
import { system } from '../data/generated';

/**
 * The documentation module library (Part XX).
 *
 * Every page on this site is assembled from these modules rather than bespoke layout, which is
 * what keeps 130 routes looking like one system instead of 130 landing pages (Part LVI).
 */

/* ------------------------------------------------------------------ page header */

export function Breadcrumbs({ trail }: { trail: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 'var(--dc-space-2)', listStyle: 'none', margin: 0, padding: 0,
          fontSize: 'var(--envision-t1-font-size-13)', color: 'var(--envision-t2-color-content-secondary-default)',
        }}
      >
        {trail.map((t, i) => (
          <li key={i} style={{ display: 'flex', gap: 'var(--dc-space-2)' }}>
            {t.to ? <Link to={t.to} style={{ color: 'inherit' }}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}
            {i < trail.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface MetaField { label: string; value: React.ReactNode }

/** Part XV: a quiet metadata strip. Fields with no reliable source are simply not passed in. */
export function PageHeader({
  trail, title, lead, meta, actions, media,
}: {
  trail: Array<{ label: string; to?: string }>;
  title: string;
  lead?: React.ReactNode;
  meta?: MetaField[];
  actions?: React.ReactNode;
  /**
   * An area's mark. Supplying it turns the header into the banner that opens a section landing
   * page: the same title and lead, set on the dark green with the mark beside them.
   *
   * The title and lead are not written twice. They are the ones the page was already passing, so a
   * page gains its banner by adding this one prop and changes nothing else.
   */
  media?: React.ReactNode;
}) {
  return (
    <header style={{ marginBlockEnd: 'var(--dc-rhythm-block)' }}>
      <Breadcrumbs trail={trail} />
      {media ? (
        <div className="dc-banner">
          <div className="dc-banner-copy">
            <h1 className="dc-banner-title">{title}</h1>
            {lead && <p className="dc-banner-lead">{lead}</p>}
          </div>
          {/* Decorative: the heading beside it already names the section. */}
          <div className="dc-banner-media" aria-hidden="true">
            <div className="dc-banner-well">{media}</div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="dc-h1">{title}</h1>
          {lead && <p className="dc-lead">{lead}</p>}
        </>
      )}
      {meta && meta.length > 0 && (
        <dl
          style={{
            display: 'flex', flexWrap: 'wrap',
            gap: 'var(--dc-space-2) var(--dc-space-7)',
            margin: 'var(--dc-space-6) 0 0', padding: 'var(--dc-space-4) 0 0',
            borderBlockStart: '1px solid var(--dc-border)',
            fontSize: 'var(--envision-t1-font-size-13)',
          }}
        >
          {meta.map((m) => (
            <div key={m.label} style={{ minWidth: 0 }}>
              <dt className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{m.label}</dt>
              <dd style={{ margin: 0, fontWeight: 'var(--envision-t1-font-weight-500)', overflowWrap: 'anywhere' }}>
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div style={{ display: 'flex', gap: 'var(--dc-space-3)', flexWrap: 'wrap', marginBlockStart: 'var(--dc-space-5)' }}>{actions}</div>}
    </header>
  );
}

/** Status chip. Only values the registry actually carries are ever rendered. */
export function StatusChip({ value }: { value: string }) {
  // Every tone is a semantic feedback role. No component renders arbitrary status text
  // (Badge is count/dot only), so this stays a primitive, but its colors are system colors.
  const tone: Record<string, [string, string]> = {
    candidate: ['var(--envision-t2-color-background-brand-subtle-default)', 'var(--envision-t2-color-content-brand-default)'],
    experimental: ['var(--envision-t2-color-background-info-subtle-default)', 'var(--envision-t2-color-content-info-default)'],
    deprecated: ['var(--envision-t2-color-background-error-subtle-default)', 'var(--envision-t2-color-content-error-default)'],
  };
  const [bg, fg] = tone[value] ?? ['var(--dc-surface-sunken)', 'var(--envision-t2-color-content-primary-default)'];
  return (
    <span style={{
      display: 'inline-block', padding: 'var(--dc-space-1) var(--dc-space-2)',
      borderRadius: 'var(--envision-t1-border-radius-pill)', background: bg, color: fg,
      fontSize: 'var(--envision-t1-font-size-12)', fontWeight: 'var(--envision-t1-font-weight-600)',
    }}>
      {value}
    </span>
  );
}

/* ---------------------------------------------------------------------- cards */

export function DocGrid({ columns = 4, children }: { columns?: 2 | 3 | 4; children: React.ReactNode }) {
  return (
    <div
      className="dc-grid"
      style={{ display: 'grid', gap: 'var(--dc-space-6)', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
      <style>{`
        @media (max-width: 1100px) { .dc-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 640px)  { .dc-grid { grid-template-columns: minmax(0,1fr) !important; } }
      `}</style>
    </div>
  );
}

/**
 * The trailing affordance on a card link.
 *
 * Material's `arrow_forward` rather than a literal arrow character: the text glyph renders in the
 * body face at the body's own weight and sits slightly off the baseline of the label beside it,
 * where the icon is drawn for this purpose. `1.15em` and an inherited weight keep it matched to
 * whatever label it follows.
 */
export function CtaArrow({ weight = 500 }: { weight?: number }) {
  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
      style={{
        fontSize: '1.15em',
        lineHeight: 1,
        fontVariationSettings: `'opsz' 20, 'wght' ${weight}, 'FILL' 0, 'GRAD' 0`,
      }}
    >
      arrow_forward
    </span>
  );
}

export function DocCard({
  to, href, title, children, tone = 'default', cta, icon,
}: {
  to?: string; href?: string; title: string; children?: React.ReactNode;
  tone?: 'default' | 'accent'; cta?: string;
  /** A Material Symbols name, set beside the title. Optional: cards without one are unchanged. */
  icon?: string;
}) {
  const inner = (
    <>
      <h3 style={{
        margin: '0 0 var(--dc-space-2)', fontSize: 'var(--envision-t1-font-size-16)',
        fontWeight: 'var(--envision-t1-font-weight-600)',
        display: 'flex', alignItems: 'center', gap: 'var(--dc-space-2)',
      }}>
        {icon && (
          // A tile, not a bare glyph. Decorative either way: the title beside it is the accessible
          // name, so announcing the glyph as well would make a screen reader read the heading twice.
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              inlineSize: 32, blockSize: 32,
              background: 'var(--dc-surface-sunken)',
              borderRadius: 'var(--envision-t1-border-radius-8)',
              // The tile is square, so it must not be allowed to shrink or stretch with the row.
              flex: '0 0 auto',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 'var(--envision-t1-font-size-20)', lineHeight: 1,
                color: 'var(--envision-t2-color-content-brand-default)',
              }}
            >
              {icon}
            </span>
          </span>
        )}
        {title}
      </h3>
      {children && <p className="dc-small" style={{ margin: 0, lineHeight: 1.55 }}>{children}</p>}
      {cta && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--dc-space-2)',
          // `auto` eats the leftover height, which is what pins the call to action to the bottom of
          // the card and lines it up with its neighbours whatever length their copy runs to. The
          // padding is the gap: on the tallest card in a row there is no leftover height for the
          // auto margin to claim, and the call to action would otherwise sit flush against the copy.
          marginBlockStart: 'auto',
          paddingBlockStart: 'var(--dc-space-4)',
          // Without this the flex column stretches it to the full width and the arrow drifts far
          // from its label.
          alignSelf: 'flex-start',
          color: 'var(--envision-t2-color-content-brand-default)',
          fontSize: 'var(--envision-t1-font-size-14)', fontWeight: 'var(--envision-t1-font-weight-600)',
        }}>
          {cta} <CtaArrow weight={600} />
        </span>
      )}
    </>
  );
  const style: React.CSSProperties = {
    // A column, so the call to action can be pushed to the bottom. `height: 100%` was already
    // making every card in a row the same height; nothing was using that height to align anything.
    display: 'flex', flexDirection: 'column',
    padding: 'var(--dc-space-5)', textDecoration: 'none', height: '100%',
    background: tone === 'accent' ? 'var(--dc-diagram-abstract)' : 'var(--dc-surface)',
    border: `1px solid ${tone === 'accent' ? 'var(--dc-diagram-abstract-line)' : 'var(--dc-border)'}`,
    borderRadius: 'var(--envision-t2-border-radius-container-md)',
  };
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={style}>{inner}</a>;
  return <Link to={to ?? '#'} style={style}>{inner}</Link>;
}

/* ------------------------------------------------------------------- guidance */

const CALLOUT_TONE = {
  Note: ['var(--dc-surface-warm)', 'var(--dc-border)'],
  Accessibility: ['var(--dc-diagram-abstract)', 'var(--dc-diagram-abstract-line)'],
  Important: ['var(--dc-tone-warning-surface)', 'var(--dc-tone-warning-line)'],
  Developer: ['var(--dc-surface-warm)', 'var(--dc-border)'],
  Designer: ['var(--dc-diagram-active-surface)', 'var(--dc-diagram-active-line)'],
} as const;

/**
 * Each role gets its own badge tone, and each tone is solid rather than subtle.
 *
 * The subtle tone backgrounds the Badge ships with are the right choice on a white page, but they
 * are the WRONG choice here: measured against the five callout surfaces, every one of them lands
 * between 1.00 and 1.10 contrast, so the pill dissolves into the callout and only the text is left.
 * That is why this badge was hard-coded to `brand` — it was the only tone that stayed visible.
 *
 * So the tone is chosen for the role, and the tone's own T3 background is re-pointed at a ramp step
 * dark enough to (a) carry white label text at AA and (b) hold a 3:1 boundary against every callout
 * surface. The override is set on the badge's wrapper, not on the callout, so it reaches this one
 * badge and cannot leak into anything a callout happens to contain. Storybook and the product get
 * the shipped tones, untouched.
 *
 * Measured, white label text / worst case against the five surfaces:
 *   neutral-700 #555555  7.46 / 6.44      info-700    #265cb3  6.43 / 5.56
 *   warning-800 #5a451d  9.12 / 7.88      success-700 #26713d  5.98 / 5.17
 *   promotional #3a3835 11.69 / 10.11 (shipped token, already solid — left alone)
 *
 * warning-700 is deliberately skipped: at 3.59 it fails AA for white text. It has to be 800.
 */
const CALLOUT_BADGE = {
  // Severity roles take the tone that matches what they are saying.
  Note: { tone: 'neutral', token: 'neutral', bg: 'var(--envision-t1-color-neutral-700)' },
  Accessibility: { tone: 'info', token: 'info', bg: 'var(--envision-t1-color-info-700)' },
  Important: { tone: 'warning', token: 'warning', bg: 'var(--envision-t1-color-warning-800)' },
  // Developer and Designer name an AUDIENCE, not a severity. They take the two remaining tones only
  // so the two are told apart at a glance; no success/brand meaning is implied by either.
  Developer: { tone: 'success', token: 'success', bg: 'var(--envision-t1-color-success-700)' },
  Designer: { tone: 'brand', token: 'promotional', bg: null },
} as const;

export function Callout({ type = 'Note', title, children }: { type?: keyof typeof CALLOUT_TONE; title?: string; children: React.ReactNode }) {
  const [bg, border] = CALLOUT_TONE[type];
  const badge = CALLOUT_BADGE[type];
  // T3 component tokens are the badge's own styling surface, so re-pointing them is theming rather
  // than reaching past the shadow boundary. Custom properties inherit into the shadow root, which is
  // what lets this work at all.
  const badgeVars = badge.bg
    ? ({
        [`--envision-t3-badge-${badge.token}-color-background-default`]: badge.bg,
        [`--envision-t3-badge-${badge.token}-color-content-default`]: 'var(--envision-t1-color-neutral-0)',
      } as React.CSSProperties)
    : undefined;
  return (
    <aside style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 'var(--envision-t2-border-radius-container-md)',
      padding: 'var(--dc-space-4) var(--dc-space-5)', margin: 'var(--dc-rhythm-example) 0', maxWidth: '72ch',
    }}>
      <p style={{ margin: '0 0 var(--dc-space-4)', ...badgeVars }}>
        <envision-badge tone={badge.tone} label={type} />
      </p>
      {title && <p style={{ margin: '0 0 var(--dc-space-2)', fontWeight: 'var(--envision-t1-font-weight-600)' }}>{title}</p>}
      <div style={{ fontSize: 'var(--envision-t1-font-size-14)' }}>{children}</div>
    </aside>
  );
}

/** Part XXXVII: do/don't must explain a decision, never state the obvious. */
export function DoDont({ items }: { items: Array<{ kind: 'do' | 'dont'; text: string; example?: React.ReactNode }> }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--dc-space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', margin: 'var(--dc-rhythm-example) 0' }}>
      {items.map((it, i) => {
        const good = it.kind === 'do';
        return (
          <div key={i} style={{
            border: `1px solid ${good ? 'var(--dc-tone-do-border)' : 'var(--dc-tone-dont-border)'}`,
            borderRadius: 'var(--envision-t2-border-radius-container-md)', overflow: 'hidden',
          }}>
            {it.example && (
              <div style={{ padding: 'var(--dc-space-5)', background: 'var(--dc-surface-warm)', borderBlockEnd: '1px solid var(--dc-border)' }}>
                {it.example}
              </div>
            )}
            <div style={{ padding: 'var(--dc-space-3) var(--dc-space-4) var(--dc-space-4)' }}>
              {/* The glyph repeats what the label and the outline already say, which is the point:
                  the pair is scanned, not read, and one of the three cues survives on a monochrome
                  print, a colour-blind reader, or a screenshot pasted into a deck. It is decorative
                  because the word beside it carries the meaning. */}
              <p style={{
                display: 'flex', alignItems: 'center', gap: 'var(--dc-space-2)',
                margin: '0 0 var(--dc-space-2)', fontWeight: 'var(--envision-t1-font-weight-600)',
                fontSize: 'var(--envision-t1-font-size-13)', letterSpacing: '0.04em', textTransform: 'uppercase',
                color: good ? 'var(--dc-tone-do)' : 'var(--dc-tone-dont)',
              }}>
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: 'var(--envision-t1-font-size-18)', lineHeight: 1, letterSpacing: 'normal' }}
                >
                  {good ? 'check_circle' : 'block'}
                </span>
                {good ? 'Do' : "Don't"}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--envision-t1-font-size-14)' }}>{it.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ code + tokens */

export function CodeBlock({ code, language = 'ts', filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <figure style={{ margin: 'var(--dc-rhythm-example) 0', border: '1px solid var(--dc-border)', borderRadius: 'var(--envision-t2-border-radius-container-md)', overflow: 'hidden' }}>
      <figcaption style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--dc-space-3)',
        padding: 'var(--dc-space-2) var(--dc-space-3)', background: 'var(--dc-surface-warm)',
        borderBlockEnd: '1px solid var(--dc-border)',
        fontSize: 'var(--envision-t1-font-size-12)',
      }}>
        <span className="dc-small">{filename ?? language}</span>
        {/* The real Button, small size, rather than a bespoke chrome button. */}
        <envision-button
          variant="outline"
          size="sm"
          label={copied ? 'Copied' : 'Copy'}
          onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); }}
        />
      </figcaption>
      <pre style={{
        margin: 0, padding: 'var(--dc-space-4)', overflowX: 'auto',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 'var(--envision-t1-font-size-13)', lineHeight: 1.65,
      }}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}

/** Copy-to-clipboard token name, used across token tables and swatches (Part XXXIX). */
export function Copyable({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); }}
      title={`Copy ${text}`}
      style={{
        font: 'inherit', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 'var(--envision-t1-font-size-12)', textAlign: 'left', cursor: 'pointer',
        background: 'none', border: 0, padding: 0, color: 'inherit',
      }}
    >
      {copied ? 'Copied' : text}
    </button>
  );
}

export function TokenTable({ filter, limit }: { filter: (name: string) => boolean; limit?: number }) {
  const rows = system.tokens.filter((t) => filter(t.name)).slice(0, limit ?? 500);
  if (!rows.length) return <p className="dc-small">No tokens match this group.</p>;
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--envision-t1-font-size-13)' }}>
        <thead>
          <tr>
            {['', 'Token', 'References', 'Resolved value'].map((h) => (
              <th key={h} style={{
                textAlign: 'left', padding: 'var(--dc-space-2) var(--dc-space-3)', whiteSpace: 'nowrap',
                borderBlockEnd: '1px solid var(--envision-t2-color-border-strong-default)',
                fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--envision-t2-color-content-secondary-default)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.name}>
              <td style={cell}>
                {isColor(t) && (
                  <span style={{
                    display: 'inline-block', width: 22, height: 22, borderRadius: 5,
                    background: `var(${t.name})`, border: '1px solid var(--envision-t2-color-border-default-default)',
                  }} />
                )}
              </td>
              <td style={cell}><Copyable text={t.name} /></td>
              <td style={{ ...cell, color: 'var(--envision-t2-color-content-secondary-default)' }}>
                {t.alias ? <Copyable text={t.alias} /> : <span className="dc-small">literal</span>}
              </td>
              <td style={{ ...cell, fontFamily: 'ui-monospace, monospace' }}>
                {t.resolved ?? <span className="dc-small">via alias</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cell: React.CSSProperties = {
  padding: 'var(--dc-space-2) var(--dc-space-3)',
  borderBlockEnd: '1px solid var(--dc-border)',
  verticalAlign: 'middle',
};

const isColor = (t: { name: string; resolved: string | null }) =>
  t.name.includes('color') && !!t.resolved && /^#|^rgb|^oklch/.test(t.resolved);

/* --------------------------------------------------------------- live preview */

/**
 * Renders the REAL production component. @envision/components is imported once in main.tsx, so
 * these are genuine custom elements, not screenshots or approximations (Part XX, LivePreview).
 */
export function LivePreview({
  children, caption, background = 'plain',
}: { children: React.ReactNode; caption?: string; background?: 'warm' | 'plain' | 'sunken' }) {
  const bg = {
    warm: 'var(--dc-surface-warm)',
    plain: 'var(--dc-surface)',
    sunken: 'var(--dc-surface-sunken)',
  }[background];
  return (
    <figure style={{ margin: 'var(--dc-rhythm-example) 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--dc-space-4)', flexWrap: 'wrap',
        minHeight: 104, padding: 'var(--dc-space-6)', background: bg,
        border: '1px solid var(--dc-border)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}>
        {children}
      </div>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-2)' }}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * A labeled row of specimens inside a LivePreview.
 *
 * Every specimen sits in a box of the same height and the labels hang below it, so the samples share
 * a baseline and the labels line up as a row even when the components themselves differ in height.
 * Laying each one out on its own left the labels stepping up and down across the box.
 */
export function SpecimenGrid({
  items,
}: { items: Array<{ label: string; node: React.ReactNode }> }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 'var(--dc-space-6) var(--dc-space-8)',
      }}
    >
      {items.map((it) => (
        <div key={it.label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-3)' }}>
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 48 }}>{it.node}</div>
          <code
            style={{
              fontSize: 'var(--envision-t1-font-size-12)',
              color: 'var(--envision-t2-color-content-secondary-default)',
            }}
          >
            {it.label}
          </code>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ hand-offs */

export function StorybookCTA({ name, url }: { name: string; url: string | null }) {
  if (!url) {
    return (
      <Callout type="Developer" title="No Storybook reference yet">
        {name} is specified in the registry but has no built Storybook story, so there is nothing to link to.
        Implementation detail pending verification.
      </Callout>
    );
  }
  return (
    <section style={{
      marginBlockStart: 'var(--dc-rhythm-related)', padding: 'var(--dc-space-7)',
      background: 'var(--dc-diagram-active-surface)',
      border: '1px solid var(--dc-diagram-active-line)',
      borderRadius: 'var(--envision-t2-border-radius-container-md)',
    }}>
      <h2 className="dc-h2" style={{ margin: '0 0 8px', fontSize: 'var(--envision-t1-font-size-24)' }}>Explore the implementation in Storybook</h2>
      <p style={{ margin: '0 0 16px', maxWidth: '62ch' }}>
        Use Storybook to inspect live states, controls, implementation details, accessibility behavior and the
        executable component reference.
      </p>
      <a href={url} target="_blank" rel="noreferrer" style={ctaStyle}>
        Open {name} in Storybook <ExternalIcon />
      </a>
    </section>
  );
}

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 'var(--dc-space-2)', padding: 'var(--dc-space-3) var(--dc-space-5)',
  background: 'var(--envision-t2-color-background-brand-default)',
  color: 'var(--envision-t1-color-neutral-0)', textDecoration: 'none',
  borderRadius: 'var(--envision-t2-border-radius-container-md)',
  fontWeight: 'var(--envision-t1-font-weight-600)', fontSize: 'var(--envision-t1-font-size-14)',
};

export function RelatedGuidance({ links }: { links: Array<{ title: string; to: string; note?: string }> }) {
  return (
    <section style={{ marginBlockStart: 'var(--dc-rhythm-related)' }}>
      <h2 className="dc-h2" style={{ marginBlockStart: 0, fontSize: 'var(--envision-t1-font-size-24)' }}>Related guidance</h2>
      <DocGrid columns={links.length >= 4 ? 4 : 3}>
        {links.map((l) => (
          <DocCard key={l.to} to={l.to} title={l.title}>{l.note}</DocCard>
        ))}
      </DocGrid>
    </section>
  );
}

export function PrevNext({ prev, next }: { prev?: { title: string; to: string }; next?: { title: string; to: string } }) {
  return (
    <nav aria-label="Section" style={{
      display: 'flex', justifyContent: 'space-between', gap: 'var(--dc-space-4)', flexWrap: 'wrap',
      marginBlockStart: 'var(--dc-space-12)', paddingBlockStart: 'var(--dc-space-6)',
      borderBlockStart: '1px solid var(--dc-border)',
    }}>
      <div>{prev && <Link to={prev.to} style={{ textDecoration: 'none' }}><span className="dc-small">Previous</span><br /><strong>{prev.title}</strong></Link>}</div>
      <div style={{ textAlign: 'right' }}>{next && <Link to={next.to} style={{ textDecoration: 'none' }}><span className="dc-small">Next</span><br /><strong>{next.title}</strong></Link>}</div>
    </nav>
  );
}

/**
 * The single intentional state for a route that exists in the information architecture but has not
 * been authored (audit brief §15). It states what the page will cover, fabricates no guidance, and
 * routes the reader to pages in the same section that ARE finished, so the visit is not wasted.
 */
export function NotYetWritten({
  title, trail, section, willCover, alternatives = [],
}: {
  title: string;
  trail: Array<{ label: string; to?: string }>;
  section: string;
  willCover?: string;
  alternatives?: Array<{ title: string; to: string; note?: string }>;
}) {
  return (
    <div className="dc-container">
      <PageHeader
        trail={trail}
        title={title}
      />
      <Callout type="Important" title="Documentation in progress">
        <p style={{ margin: '0 0 8px' }}>
          {willCover
            ? willCover
            : `This page will cover ${title} as part of ${section}.`}
        </p>
        <p style={{ margin: 0 }}>
          It is listed in the navigation rather than hidden so the shape of the system stays visible. Nothing here
          should be treated as guidance, and no content has been generated to fill the space.
        </p>
      </Callout>

      {alternatives.length > 0 && (
        <section style={{ marginBlockStart: 'var(--dc-space-10)' }}>
          <h2 className="dc-h2" style={{ marginBlockStart: 0, fontSize: 'var(--envision-t1-font-size-24)' }}>Finished pages in {section}</h2>
          <DocGrid columns={alternatives.length >= 3 ? 3 : 2}>
            {alternatives.map((a) => (
              <DocCard key={a.to} to={a.to} title={a.title}>{a.note}</DocCard>
            ))}
          </DocGrid>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------- section intro module */

/**
 * The large educational module beneath a section title (Part XXII section hero).
 *
 * One canonical implementation, used by every section landing page, so the shape of a section
 * landing is decided once. Content sits left at roughly 40% and the educational visual right.
 */
export function SectionIntro({
  heading, body, cta, visual, stacked = false,
}: {
  /**
   * Text, or a fragment when the break matters. The heading is held to a measure and wraps on its
   * own; passing a node is how a heading that reads better broken at a specific point — after a
   * comma, say — says so, rather than depending on where the measure happens to fall.
   */
  heading: React.ReactNode;
  body: string;
  cta?: { label: string; to: string };
  visual: React.ReactNode;
  /**
   * Give the visual the module's full width instead of a column beside the copy.
   *
   * A visual that runs left to right, such as a flow, has nowhere to go in a 60% column: it either
   * wraps or shrinks its steps until the labels stop fitting. Stacked, the heading takes a line of
   * its own, the lede and the call to action share the next one, and the visual gets the width.
   */
  stacked?: boolean;
}) {
  const surface: React.CSSProperties = {
    padding: 'var(--dc-space-10)',
    background: 'var(--dc-surface-warm)',
    border: '1px solid var(--envision-t2-color-border-default-default)',
    borderRadius: 'var(--envision-t2-border-radius-container-md)',
  };
  if (stacked) {
    return (
      <section className="dc-section-intro dc-section-intro--stacked" style={{ display: 'grid', gap: 'var(--dc-space-8)', ...surface }}>
        <div className="dc-intro-lede">
          {/* Held to a measure so the heading breaks across two lines. Run the full width of a
              stacked module it sets as a single long line, which reads as a banner rather than as
              a title with a lede under it. */}
          <h2
            style={{
              maxWidth: '28ch',
              fontSize: 'var(--envision-t1-font-size-28)',
              lineHeight: 1.2,
              fontWeight: 'var(--envision-t1-font-weight-600)',
              margin: '0 0 12px',
            }}
          >
            {heading}
          </h2>
          {/* The lede keeps a readable measure while the button sits at the far edge, so the two
              share a line without the copy running the full width of the module. */}
          <div className="dc-intro-row">
            {/* Body size, not the 16px the module inherits: at 16 this lede runs to three lines in
                anything narrower than a wide desktop, and it shares its row with the button so it
                cannot have the width back. */}
            <p
              style={{
                margin: 0,
                fontSize: 'var(--envision-t2-font-size-body)',
                // Smaller glyphs, same rhythm: 1.7 x 15 is the 25.6px line box the module had at
                // 16px, so dropping a size does not also tighten the spacing.
                lineHeight: 1.7,
                color: 'var(--envision-t2-color-content-secondary-default)',
              }}
            >
              {body}
            </p>
            {cta && (
              <Link to={cta.to} style={{ textDecoration: 'none', flex: '0 0 auto' }}>
                <envision-button variant="primary" label={cta.label} />
              </Link>
            )}
          </div>
        </div>
        <div style={{ minWidth: 0, overflowX: 'auto' }}>{visual}</div>
        <style>{`
          .dc-intro-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--dc-space-8);
          }
          /* Narrow enough and the two no longer share a line: the button drops under the copy
             rather than squeezing it to a column too narrow to read. */
          @media (max-width: 760px) {
            .dc-intro-row { flex-direction: column; align-items: flex-start; gap: var(--dc-space-4); }
          }
          @media (max-width: 900px) {
            .dc-section-intro--stacked { padding: var(--dc-space-6) !important; }
          }
        `}</style>
      </section>
    );
  }
  return (
    <section
      className="dc-section-intro"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 40fr) minmax(0, 60fr)',
        gap: 'var(--dc-space-10)',
        alignItems: 'center',
        minHeight: 300,
        ...surface,
      }}
    >
      <div>
        <h2 style={{ fontSize: 'var(--envision-t1-font-size-28)', lineHeight: 1.2, fontWeight: 'var(--envision-t1-font-weight-600)', margin: '0 0 12px' }}>
          {heading}
        </h2>
        <p style={{ margin: '0 0 20px', color: 'var(--envision-t2-color-content-secondary-default)' }}>{body}</p>
        {cta && (
          <Link to={cta.to} style={{ textDecoration: 'none' }}>
            <envision-button variant="primary" label={cta.label} />
          </Link>
        )}
      </div>
      {/* A visual may be a fixed-width product composition. minWidth:0 lets the grid column shrink,
          and the scroll container keeps any overflow inside the module rather than on the page. */}
      <div style={{ minWidth: 0, overflowX: 'auto' }}>{visual}</div>
      <style>{`
        @media (max-width: 900px) {
          .dc-section-intro { grid-template-columns: minmax(0,1fr) !important; padding: var(--dc-space-6) !important; }
        }
      `}</style>
    </section>
  );
}

/* --------------------------------------------------------------------- aliases */
// The specification names some modules differently from their original implementation here.
// These aliases make the spec's vocabulary importable without maintaining two components.

export const Breadcrumb = Breadcrumbs;
export const StatusBadge = StatusChip;

/* ------------------------------------------------------------------------ icon set */

/**
 * Every Material Symbols name the system's own surfaces use.
 *
 * Not "every icon": consumer-supplied icons are any name in the Material Symbols set, and that set
 * is thousands of glyphs the host loads, not something Envision ships. This is the vocabulary
 * Envision itself draws from — collected from the component registry and from this site — so a
 * reader has somewhere to start other than the whole library.
 */
export const SYSTEM_GLYPHS: string[] = [
  'add', 'arrow_back', 'arrow_downward', 'arrow_forward', 'arrow_right_alt', 'bookmark',
  'brush', 'calendar_today', 'check_circle', 'close', 'code', 'deployed_code', 'draw',
  'edit', 'favorite', 'group', 'layers', 'list', 'moving', 'palette', 'search', 'share',
  'swap_horiz', 'target', 'tune', 'view_in_ar',
];

/** One glyph in a tile, with its name underneath: the unit both grids below are built from. */
function IconCell({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <li style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-2)', listStyle: 'none' }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          inlineSize: 48, blockSize: 48,
          background: 'var(--dc-surface-sunken)',
          borderRadius: 'var(--envision-t1-border-radius-8)',
          color: 'var(--envision-t2-color-content-brand-default)',
        }}
      >
        {children}
      </span>
      <code style={{ fontSize: 'var(--envision-t1-font-size-11)', overflowWrap: 'anywhere', textAlign: 'center' }}>
        {name}
      </code>
    </li>
  );
}

const ICON_GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
  gap: 'var(--dc-space-5) var(--dc-space-3)',
  margin: 'var(--dc-rhythm-example) 0',
  padding: 0,
};

/**
 * The glyphs a component draws for itself, rendered from the library's own ICON export rather than
 * transcribed — a copy in the documentation is a copy that drifts from what actually ships.
 */
export function InlineIconGrid() {
  return (
    <ul style={ICON_GRID}>
      {Object.entries(ICON as Record<string, string>).map(([name, markup]) => (
        <IconCell key={name} name={name}>
          <span
            style={{ display: 'inline-flex', inlineSize: 24, blockSize: 24 }}
            // The library hands these over as SVG source strings.
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        </IconCell>
      ))}
    </ul>
  );
}

/** The Material Symbols names Envision's own surfaces use. */
export function SystemGlyphGrid() {
  return (
    <ul style={ICON_GRID}>
      {SYSTEM_GLYPHS.map((name) => (
        <IconCell key={name} name={name}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, lineHeight: 1 }}>{name}</span>
        </IconCell>
      ))}
    </ul>
  );
}
