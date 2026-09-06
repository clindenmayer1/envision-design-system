import { Fragment, useEffect, useState } from 'react';

/**
 * Diagram primitives (Part XXXVI).
 *
 * Grammar, applied consistently everywhere:
 *   green            the production path: a real artifact that ships
 *   pale blue        a system abstraction or documentation concept
 *   neutral          supporting layers
 *   solid arrow      direct pipeline
 *   dashed arrow     optional or reference relationship
 *
 * Every diagram takes an `alt` describing it in words, rendered as a visually hidden paragraph, so
 * the information is available to screen readers rather than locked inside the visual (Part XLIX).
 * On narrow viewports the horizontal pipeline reflows into a vertical stack rather than shrinking
 * into unreadable text (Part XLVII).
 */

type StepTone = 'active' | 'abstract' | 'neutral' | 'warm' | 'sage' | 'info';

const toneStyle = (tone: StepTone): React.CSSProperties => ({
  active: {
    background: 'var(--dc-diagram-active-surface)',
    borderColor: 'var(--dc-diagram-active-line)',
  },
  abstract: {
    background: 'var(--dc-diagram-abstract)',
    borderColor: 'var(--dc-diagram-abstract-line)',
  },
  neutral: {
    background: 'var(--dc-diagram-neutral)',
    borderColor: 'var(--dc-border)',
  },
  // Categorical, for rows that need to be told apart rather than ranked. No emphasis is implied
  // by either one, so they carry the same hairline weight as neutral.
  warm: {
    background: 'var(--dc-diagram-warm)',
    borderColor: 'var(--dc-diagram-warm-line)',
  },
  sage: {
    background: 'var(--dc-diagram-sage)',
    borderColor: 'var(--dc-diagram-sage-line)',
  },
  // A fill with no hairline. The border is transparent rather than absent so the box keeps the
  // same metrics as every other tone — dropping the 1px outright would shift this diagram's
  // boxes 2px against the others and break the alignment of a row that mixes tones.
  info: {
    background: 'var(--envision-t2-color-background-info-subtle-default)',
    borderColor: 'transparent',
  },
}[tone]);

interface PipelineStep {
  label: string;
  note?: string;
  tone?: StepTone;
  /** Draw the arrow LEADING INTO this step as dashed: a reference or optional relationship. */
  dashedFromPrevious?: boolean;
}

export function Pipeline({
  steps, alt, caption, chevron = false, tracks, continues = false, continued = false, flush = false,
}: {
  steps: PipelineStep[]; alt: string; caption?: string;
  /**
   * Draw each step as an arrow instead of a box with an arrow beside it.
   *
   * The right edge slants to a point, so the shape itself carries the direction and the separate
   * glyphs are not drawn at all. `dashedFromPrevious` has nothing to draw in this mode.
   */
  chevron?: boolean;
  /**
   * Lay the row out on a fixed number of tracks rather than one per step.
   *
   * A flow too long for one line is split across several Pipelines, and those rows only line up if
   * each is divided the same way. A row with fewer steps than tracks simply leaves the remainder
   * empty instead of stretching its steps to fill it.
   */
  tracks?: number;
  /** The flow carries on past the last step here, so that step keeps its point. */
  continues?: boolean;
  /** The flow arrives from an earlier row, so the first step keeps its notch. */
  continued?: boolean;
  /**
   * Drop the figure's own vertical margin.
   *
   * A single diagram wants space around it; rows of one wrapped flow want to sit together, and
   * their own container decides how far apart. Two 28px margins between them read as two diagrams.
   */
  flush?: boolean;
}) {
  return (
    <figure style={{ margin: flush ? 0 : '28px 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <div
        className="dc-pipeline"
        data-chevron={chevron ? 'true' : undefined}
        data-continues={chevron && continues ? 'true' : undefined}
        data-continued={chevron && continued ? 'true' : undefined}
        style={tracks ? { gridAutoFlow: 'row', gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))` } : undefined}
        aria-hidden="true"
      >
        {steps.map((s, i) => (
          <div key={s.label} className="dc-pipeline-cell">
            <div
              className="dc-pipeline-box"
              style={{
                ...toneStyle(s.tone ?? 'active'),
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 'var(--envision-t2-border-radius-container-md)',
                padding: 'var(--dc-space-4) var(--dc-space-3)',
                textAlign: 'center',
                minHeight: 64,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 'var(--dc-space-1)',
                // Set after the padding shorthand so it wins. The point is carved out of the box's
                // own width, so without this the last word can sit under the slant.
                // Set after the padding shorthand so these win. The point is carved out of the box's
                // own width and the notch out of its left, so the copy has to clear both.
                ...(chevron
                  ? {
                      // Whatever carries a point or a notch has to leave room for it, including the
                      // ends of a row that continues into the next one.
                      ...(i < steps.length - 1 || continues
                        ? { paddingInlineEnd: 'calc(var(--dc-space-3) + var(--dc-chevron-point))' }
                        : {}),
                      ...(i > 0 || continued
                        ? { paddingInlineStart: 'calc(var(--dc-space-3) + var(--dc-chevron-point))' }
                        : {}),
                    }
                  : {}),
              }}
            >
              <strong style={{ fontSize: 'var(--envision-t1-font-size-14)' }}>{s.label}</strong>
              {s.note && (
                <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)', lineHeight: 1.4 }}>
                  {s.note}
                </span>
              )}
            </div>
            {!chevron && i < steps.length - 1 && (
              // Solid arrow = direct transformation. Dashed = a reference or optional relationship.
              //
              // The solid one is the system icon, because Iconography puts these glyphs on Material
              // Symbols. Material has no dashed arrow, and the dashed variant used to be the same
              // glyph with a repeating mask over it: the mask cut through the arrowhead as well as
              // the shaft, leaving a shape that read as a broken character. So the dashed one is
              // drawn: a dashed shaft and a solid head, matched to the glyph's own proportions.
              <span
                className="dc-pipeline-arrow"
                aria-hidden="true"
                data-dashed={steps[i + 1].dashedFromPrevious ? 'true' : undefined}
              >
                {steps[i + 1].dashedFromPrevious ? (
                  <svg
                    className="dc-arrow-icon"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* The shaft has to reach the head's vertex at x=19, because the chevron only
                        touches y=12 at that one point: a shaft that stops short leaves the head
                        floating, which is what "3.5 3.2" over a shaft ending at 18.5 did — the
                        pattern was cut mid-dash at 15.9-18.5 and never met the point.
                        3 -> 19 is 16 units, and 4 dashes of 2.8 with 3 gaps of 1.6 is exactly 16,
                        so the run ends flush ON the vertex: 3-5.8, 7.4-10.2, 11.8-14.6, 16.2-19.
                        Butt caps keep that arithmetic honest; round caps would add half a stroke
                        to both ends of every dash and close the gaps back up. */}
                    <path d="M3 12h16" strokeDasharray="2.8 1.6" strokeLinecap="butt" />
                    <path d="M13.6 6.6 19 12l-5.4 5.4" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined dc-arrow-icon">arrow_right_alt</span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}

      <style>{`
        .dc-pipeline {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(0, 1fr);
          align-items: stretch;
          gap: 0;
        }
        /* stretch, not center: the outer grid already makes every cell the height of the tallest, and
           centering let each box keep its own natural height so a two-line note produced a shorter box
           than a three-line one. The arrow centers itself inside the stretched cell. */
        .dc-pipeline-cell { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: stretch; gap: 0; }

        /* Chevron mode. The point is cut out of the box's own right edge rather than added beyond
           it, so the row's widths are unchanged and the steps stay on the same 1fr tracks.
           clip-path and border-radius compose — the visible area is their INTERSECTION — so the
           left corners keep their radius while the right two are replaced by the point. */
        .dc-pipeline[data-chevron='true'] {
          /* No track gap. The steps overlap instead, by margin, so each point sits inside the next
             step's notch. */
          gap: 0;
          --dc-chevron-point: 10px;
          /* The space left between a point and the notch it sits in. Both edges have the same
             slope, so a horizontal offset of this size reads as a constant gap along the slant. */
          --dc-chevron-gap: 6px;
          /* Rounding where the slant meets the top and bottom edges. polygon() only takes straight
             segments, so the corner is three points stepped along a quarter circle at 30 and 60
             degrees. The slant is steep — 10px of run against half the box height — so treating it
             as vertical for the purpose of the corner is accurate to well under a pixel. */
          --dc-chevron-round: 6px;
        }
        .dc-pipeline[data-chevron='true'] .dc-pipeline-cell { grid-template-columns: minmax(0, 1fr); }
        /* Each step slides back over the one before it. The overlap is the point depth less the gap
           we want to keep, so the tip stops short of the notch apex by exactly --dc-chevron-gap.
           Only the inline START is negative, so the row's overall width is unchanged. */
        .dc-pipeline[data-chevron='true'] .dc-pipeline-cell + .dc-pipeline-cell {
          margin-inline-start: calc(var(--dc-chevron-gap) - var(--dc-chevron-point));
        }
        .dc-pipeline[data-chevron='true'] .dc-pipeline-box {
          clip-path: polygon(
            0 0,
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round)) 0,
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.5) calc(var(--dc-chevron-round) * 0.134),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.134) calc(var(--dc-chevron-round) * 0.5),
            calc(100% - var(--dc-chevron-point)) var(--dc-chevron-round),
            100% 50%,
            calc(100% - var(--dc-chevron-point)) calc(100% - var(--dc-chevron-round)),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.134) calc(100% - var(--dc-chevron-round) * 0.5),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.5) calc(100% - var(--dc-chevron-round) * 0.134),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round)) 100%,
            0 100%,
            var(--dc-chevron-point) 50%
          );
        }
        /* The last step points nowhere, so it ends flat: the notch stays, the point does not. Its
           right corners are the element's own border-radius, showing through the clip the same way
           the first step's left corners do. */
        .dc-pipeline[data-chevron='true'] .dc-pipeline-cell:last-child .dc-pipeline-box {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, var(--dc-chevron-point) 50%);
        }
        /* A single step is both ends of the ribbon and needs neither cut. */
        .dc-pipeline[data-chevron='true'] .dc-pipeline-cell:only-child .dc-pipeline-box {
          clip-path: none;
        }
        /* The first step has nothing behind it to receive, so it keeps a flat leading edge. */
        .dc-pipeline[data-chevron='true'] .dc-pipeline-cell:first-child .dc-pipeline-box {
          clip-path: polygon(
            0 0,
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round)) 0,
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.5) calc(var(--dc-chevron-round) * 0.134),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.134) calc(var(--dc-chevron-round) * 0.5),
            calc(100% - var(--dc-chevron-point)) var(--dc-chevron-round),
            100% 50%,
            calc(100% - var(--dc-chevron-point)) calc(100% - var(--dc-chevron-round)),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.134) calc(100% - var(--dc-chevron-round) * 0.5),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.5) calc(100% - var(--dc-chevron-round) * 0.134),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round)) 100%,
            0 100%
          );
        }
        /* A row that continues into the next one ends the way a middle step does: the ribbon is
           not finished, it has only run out of line. Same for a row that carries on from one
           above, which keeps the notch that receives the previous row's point. Both selectors
           carry one attribute more than the :first-child / :last-child rules above, so they win
           without needing to be marked important. */
        .dc-pipeline[data-chevron='true'][data-continues='true'] .dc-pipeline-cell:last-child .dc-pipeline-box,
        .dc-pipeline[data-chevron='true'][data-continued='true'] .dc-pipeline-cell:first-child .dc-pipeline-box {
          clip-path: polygon(
            0 0,
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round)) 0,
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.5) calc(var(--dc-chevron-round) * 0.134),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.134) calc(var(--dc-chevron-round) * 0.5),
            calc(100% - var(--dc-chevron-point)) var(--dc-chevron-round),
            100% 50%,
            calc(100% - var(--dc-chevron-point)) calc(100% - var(--dc-chevron-round)),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.134) calc(100% - var(--dc-chevron-round) * 0.5),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round) * 0.5) calc(100% - var(--dc-chevron-round) * 0.134),
            calc(100% - var(--dc-chevron-point) - var(--dc-chevron-round)) 100%,
            0 100%,
            var(--dc-chevron-point) 50%
          );
        }
        /* A continued row's first step has no sibling to slide over, so it also needs the notch cut
           without the overlap that normally accompanies it. Nothing to do but leave it be. */

        .dc-pipeline-arrow {
          display: flex;
          align-items: center;
          padding-inline: var(--dc-space-2);
          color: var(--envision-t2-color-content-tertiary-default);
        }
        /* Optical size and weight are set explicitly so the glyph matches the 1px card borders it
           sits between rather than arriving at the font's default 400 weight. */
        .dc-arrow-icon {
          font-size: 24px;
          line-height: 1;
          font-variation-settings: 'opsz' 24, 'wght' 300, 'FILL' 0, 'GRAD' 0;
        }
        /* The drawn arrow shares the glyph's box so both sit on the same baseline in a row. */
        svg.dc-arrow-icon { display: block; }
        @media (max-width: 860px) {
          .dc-pipeline { grid-auto-flow: row; grid-auto-columns: auto; }
          .dc-pipeline-cell { grid-template-columns: minmax(0,1fr); justify-items: stretch; }
          /* Recomposed vertically rather than shrunk: the arrow rotates to point down. */
          .dc-pipeline-arrow { padding: var(--dc-space-2) 0; justify-content: center; transform: rotate(90deg); }
          /* Stacked, the steps are a column: the horizontal overlap has nothing to overlap, so it
             is reset and the ordinary gap returns. */
          .dc-pipeline[data-chevron='true'] { gap: var(--dc-space-3); }
          .dc-pipeline[data-chevron='true'] .dc-pipeline-cell + .dc-pipeline-cell { margin-inline-start: 0; }
          /* Same for the chevron: the point moves from the right edge to the bottom one, so the
             column of steps still reads downward. */
          .dc-pipeline[data-chevron='true'] .dc-pipeline-box,
          .dc-pipeline[data-chevron='true'] .dc-pipeline-cell:first-child .dc-pipeline-box {
            clip-path: polygon(
              0 0,
              100% 0,
              100% calc(100% - var(--dc-chevron-point)),
              50% 100%,
              0 calc(100% - var(--dc-chevron-point))
            );
            padding-inline: var(--dc-space-3);
            padding-block-end: calc(var(--dc-space-4) + var(--dc-chevron-point));
          }
          .dc-pipeline[data-chevron='true'] .dc-pipeline-cell:last-child .dc-pipeline-box {
            clip-path: none;
            padding-block-end: var(--dc-space-4);
          }
        }
      `}</style>
    </figure>
  );
}

/** A stacked hierarchy: foundations under tokens under components, and so on. */
export function LayerStack({
  layers, alt, caption, flow, footnotes,
}: {
  layers: Array<{ label: string; note?: string; tone?: StepTone; icon?: string; example?: string }>;
  alt: string;
  caption?: string;
  /**
   * Reads top-to-bottom as a sequence rather than as a pile: full-width rows, an icon and a rule
   * before the note, and an arrow between each pair. Use it where the order IS the argument (a
   * token tier referencing the one above it). The default inset stack stays for the cases where
   * the point is that a base supports what sits on it.
   */
  flow?: boolean;
  /** Points that qualify the stack rather than belonging to any one layer in it. */
  footnotes?: Array<{ icon?: string; title: string; body: string }>;
}) {
  return (
    <figure style={{ margin: 'var(--dc-rhythm-example) 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <div aria-hidden="true" style={{ display: 'grid', gap: flow ? 0 : 'var(--dc-space-2)' }}>
        {layers.map((l, i) => (
          <Fragment key={l.label}>
            <div
              style={{
                ...toneStyle(l.tone ?? 'neutral'),
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 'var(--envision-t2-border-radius-container-md)',
                padding: flow ? 'var(--dc-space-4) var(--dc-space-5)' : 'var(--dc-space-4) var(--dc-space-5)',
                // Without flow, each layer is inset slightly less than the one below it, so the
                // stack reads as a base supporting what sits on top rather than an unordered list.
                marginInline: flow ? 0 : `${(layers.length - 1 - i) * 14}px`,
                display: 'flex',
                alignItems: flow ? 'center' : 'baseline',
                justifyContent: flow ? 'flex-start' : 'space-between',
                gap: flow ? 'var(--dc-space-5)' : 'var(--dc-space-4)',
                flexWrap: 'wrap',
              }}
            >
              {flow && l.icon && (
                <span
                  className="material-symbols-outlined"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    inlineSize: 40,
                    blockSize: 40,
                    flex: '0 0 auto',
                    fontSize: 'var(--envision-t1-font-size-24)',
                    borderRadius: 'var(--envision-t1-border-radius-8)',
                    border: '1px solid currentColor',
                    opacity: 0.85,
                  }}
                >
                  {l.icon}
                </span>
              )}
              <strong style={{ fontSize: 'var(--envision-t1-font-size-15)', ...(flow ? { inlineSize: 140, flex: '0 0 auto' } : {}) }}>
                {l.label}
              </strong>
              {flow && (
                <span aria-hidden="true" style={{ alignSelf: 'stretch', inlineSize: 1, background: 'currentColor', opacity: 0.2 }} />
              )}
              {flow ? (
                (l.note || l.example) && (
                  // The note and the one real token it names belong together, so they stack in a
                  // single left-aligned column. Pushing the token to the end of the row instead
                  // left it ragging off the right edge once a row wrapped.
                  <span
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 'var(--dc-space-2)',
                      minWidth: 0,
                      flex: '1 1 0',
                    }}
                  >
                    {l.note && (
                      <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-13)' }}>{l.note}</span>
                    )}
                    {l.example && (
                      // A surface chip rather than bare monospace: the rows carry tinted
                      // backgrounds, and the token has to stay legible on all of them.
                      <code
                        style={{
                          background: 'var(--envision-t2-color-background-surface-default)',
                          border: '1px solid var(--envision-t2-color-border-subtle-default)',
                          borderRadius: 'var(--envision-t2-border-radius-container-sm)',
                          padding: 'var(--dc-space-1) var(--dc-space-2)',
                          fontSize: 'var(--envision-t1-font-size-12)',
                          overflowWrap: 'anywhere',
                          textTransform: 'none',
                          color: 'var(--envision-t2-color-content-secondary-default)',
                        }}
                      >
                        {l.example}
                      </code>
                    )}
                  </span>
                )
              ) : (
                l.note && (
                  <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-13)', minWidth: 0 }}>{l.note}</span>
                )
              )}
            </div>
            {flow && i < layers.length - 1 && (
              <span
                aria-hidden="true"
                className="material-symbols-outlined"
                style={{
                  justifySelf: 'center',
                  fontSize: 'var(--envision-t1-font-size-20)',
                  lineHeight: 1,
                  paddingBlock: 'var(--dc-space-1)',
                  color: 'var(--envision-t2-color-content-tertiary-default)',
                }}
              >
                arrow_downward
              </span>
            )}
          </Fragment>
        ))}
      </div>

      {footnotes && footnotes.length > 0 && (
        <div
          aria-hidden="true"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
            gap: 'var(--dc-space-5)',
            marginBlockStart: 'var(--dc-space-5)',
            padding: 'var(--dc-space-5)',
            border: '1px solid var(--envision-t2-color-border-default-default)',
            borderRadius: 'var(--envision-t2-border-radius-container-md)',
          }}
        >
          {footnotes.map((f) => (
            <div key={f.title} style={{ display: 'flex', gap: 'var(--dc-space-4)', alignItems: 'flex-start' }}>
              {f.icon && (
                <span
                  className="material-symbols-outlined"
                  style={{
                    display: 'grid', placeItems: 'center', inlineSize: 36, blockSize: 36, flex: '0 0 auto',
                    fontSize: 'var(--envision-t1-font-size-20)',
                    borderRadius: 'var(--envision-t1-border-radius-pill)',
                    background: 'var(--dc-surface-sunken)',
                    color: 'var(--envision-t2-color-content-secondary-default)',
                  }}
                >
                  {f.icon}
                </span>
              )}
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 'var(--envision-t1-font-size-14)' }}>{f.title}</strong>
                <span className="dc-small" style={{ display: 'block', marginBlockStart: 'var(--dc-space-1)' }}>{f.body}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}
    </figure>
  );
}


/** A labeled lifecycle loop, used by governance pages. */
export function LifecycleRing({ stages, alt, caption }: { stages: string[]; alt: string; caption?: string }) {
  return (
    <figure style={{ margin: '28px 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <ol
        aria-hidden="true"
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 'var(--dc-space-2)', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center',
        }}
      >
        {stages.map((s, i) => (
          <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-2)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--dc-space-2)',
              padding: 'var(--dc-space-2) var(--dc-space-4)', borderRadius: 'var(--envision-t1-border-radius-pill)',
              background: 'var(--dc-diagram-active-surface)',
              border: '1px solid var(--dc-diagram-active-line)',
              fontSize: 'var(--envision-t1-font-size-13)', fontWeight: 'var(--envision-t1-font-weight-600)',
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: 'var(--envision-t2-color-background-brand-default)', color: 'var(--envision-t1-color-neutral-0)',
                fontSize: 'var(--envision-t1-font-size-11)',
              }}>{i + 1}</span>
              {s}
            </span>
            {i < stages.length - 1 && <span style={{ color: 'var(--envision-t2-color-content-tertiary-default)' }}>→</span>}
          </li>
        ))}
      </ol>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}
    </figure>
  );
}

/** Numbered annotations over an arbitrary rendered example (component anatomy, Part XX). */
export function AnatomyDiagram({
  example, parts, alt,
}: { example: React.ReactNode; parts: string[]; alt: string }) {
  return (
    <figure style={{ margin: '28px 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(200px, 260px)', gap: 'var(--dc-space-6)', alignItems: 'center',
        padding: 'var(--dc-space-7)', background: 'var(--dc-surface-warm)',
        border: '1px solid var(--envision-t2-color-border-default-default)',
        borderRadius: 'var(--envision-t2-border-radius-container-md)',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>{example}</div>
        <ol style={{ margin: 0, paddingInlineStart: 'var(--dc-space-5)', fontSize: 'var(--envision-t1-font-size-13)' }}>
          {parts.map((p) => <li key={p} style={{ marginBlockEnd: 'var(--dc-space-2)' }}>{p}</li>)}
        </ol>
      </div>
    </figure>
  );
}

/** Sticky "On this page" rail (Part XIV), highlighting the section currently in view. */
export function TableOfContents({ items }: { items: Array<{ id: string; label: string; level?: 2 | 3 }> }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav className="dc-toc" aria-label="On this page">
      {/* A title for the rail, not a badge: it names this region of the page rather than tagging
          something in it, and it is the heading the nav landmark is labeled by. */}
      <h2
        style={{
          margin: '0 0 var(--dc-space-3)',
          fontSize: 'var(--envision-t1-font-size-14)',
          fontWeight: 'var(--envision-t1-font-weight-600)',
          color: 'var(--envision-t2-color-content-primary-default)',
        }}
      >
        On this page
      </h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              style={{
                display: 'block',
                padding: '4px 0 4px var(--dc-space-3)',
                paddingInlineStart: i.level === 3 ? 22 : 10,
                textDecoration: 'none',
                lineHeight: 1.4,
                borderInlineStart: `2px solid ${active === i.id ? 'var(--envision-t2-color-background-brand-default)' : 'var(--dc-border)'}`,
                color: active === i.id
                  ? 'var(--envision-t2-color-content-primary-default)'
                  : 'var(--envision-t2-color-content-secondary-default)',
                fontWeight: active === i.id ? 'var(--envision-t1-font-weight-600)' : 'var(--envision-t1-font-weight-400)',
              }}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------ process + architecture */

interface ProcessStage {
  name: string;
  detail: string;
  /** Who is accountable at this stage. Omitted when the system has not established ownership. */
  owner?: string;
}

/**
 * A numbered process with an explanation per stage (Part XXXII). Distinct from LifecycleRing,
 * which is a compact overview: this is the version used when every stage must be explained.
 */
export function ProcessDiagram({ stages, alt }: { stages: ProcessStage[]; alt: string }) {
  return (
    <figure style={{ margin: '28px 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <ol style={{ display: 'grid', gap: 0, listStyle: 'none', margin: 0, padding: 0 }}>
        {stages.map((s, i) => (
          <li key={s.name} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: 'var(--dc-space-4)' }}>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 'var(--dc-space-1)' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: 'var(--envision-t2-color-background-brand-default)', color: 'var(--envision-t1-color-neutral-0)',
                fontSize: 'var(--envision-t1-font-size-12)', fontWeight: 'var(--envision-t1-font-weight-600)', flex: '0 0 auto',
              }}>{i + 1}</span>
              {i < stages.length - 1 && (
                <span aria-hidden="true" style={{ width: 1, flex: 1, minHeight: 24, background: 'var(--dc-diagram-active-line)' }} />
              )}
            </div>
            <div style={{ paddingBlockEnd: i < stages.length - 1 ? 20 : 0 }}>
              <p style={{ margin: 'var(--dc-space-1) 0 4px', fontWeight: 'var(--envision-t1-font-weight-600)' }}>{s.name}</p>
              <p style={{ margin: 0, fontSize: 'var(--envision-t1-font-size-14)', color: 'var(--envision-t2-color-content-secondary-default)' }}>
                {s.detail}
              </p>
              {s.owner && (
                <p className="dc-small" style={{ margin: '4px 0 0', fontSize: 'var(--envision-t1-font-size-12)' }}>
                  Reviewed by: {s.owner}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * Source / Generated / Consumer architecture map (Part XXV).
 *
 * Three roles, stacked, with the relationship between them named. It was three narrow columns, but
 * the whole content is file paths, and a 220px column truncated every one of them: the reader could
 * see that a path existed without being able to read it. Full-width rows give a path the measure it
 * needs, and the arrows say what the columns only implied, which is that this flows one way.
 */
export function ArchitectureDiagram({
  groups, alt, caption,
}: {
  alt: string;
  caption?: string;
  groups: Array<{ role: 'Source' | 'Generated' | 'Consumer'; note: string; items: string[] }>;
}) {
  const roleTone: Record<string, React.CSSProperties> = {
    Source: { background: 'var(--dc-diagram-active-surface)', borderColor: 'var(--dc-diagram-active-line)' },
    Generated: { background: 'var(--dc-diagram-abstract)', borderColor: 'var(--dc-diagram-abstract-line)' },
    Consumer: { background: 'var(--dc-diagram-neutral)', borderColor: 'var(--dc-border)' },
  };
  // What the step between two roles actually is, so the arrow carries a verb rather than a vibe.
  const between: Record<string, string> = { Source: 'the build writes', Generated: 'is imported by' };
  const icon: Record<string, string> = { Source: 'edit', Generated: 'settings', Consumer: 'download' };

  return (
    <figure style={{ margin: 'var(--dc-rhythm-example) 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <div aria-hidden="true" style={{ display: 'grid' }}>
        {groups.map((g, i) => (
          <Fragment key={g.role}>
            <div
              style={{
                ...roleTone[g.role],
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 'var(--envision-t2-border-radius-container-md)',
                padding: 'var(--dc-space-4) var(--dc-space-5)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 220px) minmax(0, 1fr)',
                gap: 'var(--dc-space-5)',
                alignItems: 'start',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--dc-space-3)', alignItems: 'flex-start' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 'var(--envision-t1-font-size-20)', lineHeight: 1.2, flex: '0 0 auto', opacity: 0.75 }}
                >
                  {icon[g.role]}
                </span>
                <span style={{ minWidth: 0 }}>
                  <envision-badge tone="brand" label={g.role} />
                  <span className="dc-small" style={{ display: 'block', marginBlockStart: 'var(--dc-space-1)' }}>{g.note}</span>
                </span>
              </div>
              {/* Paths wrap rather than truncate, and each sits on its own line at full measure. */}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--dc-space-1)', minWidth: 0 }}>
                {g.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      fontFamily: 'ui-monospace, Menlo, monospace',
                      fontSize: 'var(--envision-t1-font-size-13)',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            {i < groups.length - 1 && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--dc-space-2)',
                  paddingBlock: 'var(--dc-space-2)',
                  paddingInlineStart: 'var(--dc-space-5)',
                  color: 'var(--envision-t2-color-content-tertiary-default)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 'var(--envision-t1-font-size-20)', lineHeight: 1 }}>
                  arrow_downward
                </span>
                <span className="dc-small">{between[g.role]}</span>
              </span>
            )}
          </Fragment>
        ))}
      </div>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}
    </figure>
  );
}

interface TokenTier {
  /** Short "Tier N · role" label, rendered as a Badge so tiers read as a set. */
  badge: string;
  title: string;
  note: string;
  /** The same token written both ways, which is the point: the two names are identical. */
  figma: string;
  css: string;
  /** Tier 1 answers "what exists", so it carries a category table instead of a name breakdown. */
  categories?: Array<[string, string, string]>;
  /** Tiers 2 and 3 answer "how is it named", so they break one real name into its segments. */
  parts?: Array<{ label: string; value: string }>;
  /** The same segments reassembled, so the breakdown resolves back into a name you can read. */
  path?: string[];
  footer?: string;
}

/**
 * The three tiers as reference cards: what each one holds, how its names are built, and the one
 * rule that governs it. Set beside the stack diagram, which answers a different question: the
 * stack shows how the tiers relate, and this shows what a token in each of them actually is.
 */
export function TokenTierAnatomy({
  tiers, footnotes, alt,
}: {
  tiers: TokenTier[];
  footnotes?: Array<{ title: string; body: string }>;
  alt: string;
}) {
  return (
    <figure className="dc-tiers" style={{ margin: 'var(--dc-rhythm-example) 0' }}>
      <p className="dc-sr-only">{alt}</p>
      <div aria-hidden="true" style={{ display: 'grid', gap: 'var(--dc-space-5)' }}>
        {tiers.map((t) => (
          <article key={t.badge} className="dc-tier-card">
            {/* Badge and title share one row: the badge names the tier, the title names its job,
                and the two only make sense read together. */}
            <div className="dc-tier-title">
              <envision-badge tone="brand" label={t.badge} />
              <h3 className="dc-h3" style={{ margin: 0 }}>{t.title}</h3>
            </div>
            <p className="dc-small" style={{ margin: 0 }}>{t.note}</p>

            <div className="dc-tier-names">
              <span><strong>Figma</strong> <code>{t.figma}</code></span>
              <span><strong>CSS</strong> <code>{t.css}</code></span>
            </div>

            {t.categories && (
              <div style={{ overflowX: 'auto' }}>
                <table className="dc-tier-table">
                  <thead>
                    <tr><th>Token category</th><th>What it covers</th><th>Examples</th></tr>
                  </thead>
                  <tbody>
                    {t.categories.map((row) => (
                      <tr key={row[0]}>
                        <td>{row[0]}</td>
                        <td>{row[1]}</td>
                        <td><code>{row[2]}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {t.parts && (
              <div className="dc-anatomy-grid">
                {t.parts.map((p) => (
                  <div key={p.label} className="dc-anatomy-cell">
                    <span className="dc-anatomy-label">{p.label}</span>
                    <code>{p.value}</code>
                  </div>
                ))}
              </div>
            )}

            {t.path && (
              <div className="dc-tier-path">
                {t.path.map((seg, i) => (
                  <Fragment key={seg + i}>
                    {i > 0 && <span className="dc-tier-slash">/</span>}
                    <code>{seg}</code>
                  </Fragment>
                ))}
              </div>
            )}

            {t.footer && <p className="dc-small" style={{ margin: 0 }}>{t.footer}</p>}
          </article>
        ))}

        {footnotes && footnotes.length > 0 && (
          <div className="dc-tier-card dc-tier-notes">
            {footnotes.map((f, i) => (
              <div key={f.title}>
                <strong style={{ display: 'block', fontSize: 'var(--envision-t1-font-size-13)' }}>
                  {i + 1}. {f.title}
                </strong>
                <span className="dc-small">{f.body}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .dc-tier-title {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--dc-space-2) var(--dc-space-4);
        }
        .dc-tier-card {
          display: grid;
          gap: var(--dc-space-4);
          padding: var(--dc-space-6);
          background: var(--dc-surface);
          border: 1px solid var(--envision-t2-color-border-default-default);
          border-radius: var(--envision-t2-border-radius-container-lg);
        }
        /* Inline code normally carries a sunken chip. Inside these cards the surrounding cell
           already does that work, so a chip on every segment would stack a tint on a tint. */
        .dc-tiers code:not(pre code) {
          font-family: ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: var(--envision-t1-font-size-12);
          overflow-wrap: anywhere;
          background: none;
          padding: 0;
          border-radius: 0;
        }
        /* The two spellings of one token, side by side. They wrap to separate lines rather than
           truncating, because a half-shown token name is worse than a taller row. */
        .dc-tier-names {
          display: flex;
          flex-wrap: wrap;
          gap: var(--dc-space-2) var(--dc-space-6);
          padding: var(--dc-space-3) var(--dc-space-4);
          background: var(--dc-surface-warm);
          border-radius: var(--envision-t2-border-radius-container-sm);
        }
        .dc-tier-names strong { font-size: var(--envision-t1-font-size-13); margin-inline-end: var(--dc-space-2); }
        .dc-tier-table { border-collapse: collapse; width: 100%; font-size: var(--envision-t1-font-size-13); }
        .dc-tier-table th, .dc-tier-table td {
          text-align: start;
          padding: var(--dc-space-2) var(--dc-space-3);
          border-block-end: 1px solid var(--envision-t2-color-border-subtle-default);
        }
        .dc-tier-table th { background: var(--dc-surface-warm); font-size: var(--envision-t1-font-size-12); }
        .dc-tier-table tr:last-child td { border-block-end: 0; }
        .dc-tier-table td { color: var(--envision-t2-color-content-secondary-default); }
        /* One name split into its segments. Six columns on a wide viewport, then three, then two,
           with the divider dropped at whichever cell now starts a row. */
        .dc-anatomy-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          border: 1px solid var(--envision-t2-color-border-subtle-default);
          border-radius: var(--envision-t2-border-radius-container-sm);
        }
        .dc-anatomy-cell {
          display: grid;
          gap: var(--dc-space-1);
          align-content: start;
          padding: var(--dc-space-3);
          border-inline-start: 1px solid var(--envision-t2-color-border-subtle-default);
        }
        .dc-anatomy-cell:nth-child(6n + 1) { border-inline-start: 0; }
        .dc-anatomy-label {
          font-size: var(--envision-t1-font-size-11);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .dc-anatomy-cell code { color: var(--envision-t2-color-content-secondary-default); }
        @media (max-width: 900px) {
          .dc-anatomy-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .dc-anatomy-cell:nth-child(6n + 1) { border-inline-start: 1px solid var(--envision-t2-color-border-subtle-default); }
          .dc-anatomy-cell:nth-child(3n + 1) { border-inline-start: 0; }
          .dc-anatomy-cell:nth-child(n + 4) { border-block-start: 1px solid var(--envision-t2-color-border-subtle-default); }
        }
        @media (max-width: 560px) {
          .dc-anatomy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dc-anatomy-cell:nth-child(3n + 1) { border-inline-start: 1px solid var(--envision-t2-color-border-subtle-default); }
          .dc-anatomy-cell:nth-child(2n + 1) { border-inline-start: 0; }
          .dc-anatomy-cell:nth-child(n + 3) { border-block-start: 1px solid var(--envision-t2-color-border-subtle-default); }
        }
        /* The segments reassembled. Pale blue marks it as the abstraction rather than an artifact,
           matching the grammar the other diagrams on this page use. */
        .dc-tier-path {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: var(--dc-space-2);
          padding: var(--dc-space-3) var(--dc-space-4);
          background: var(--dc-diagram-abstract);
          border-radius: var(--envision-t2-border-radius-container-sm);
        }
        .dc-tier-slash { color: var(--envision-t2-color-content-tertiary-default); }
        .dc-tier-notes {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--dc-space-6);
          background: var(--dc-surface-warm);
        }
        @media (max-width: 720px) {
          .dc-tier-notes { grid-template-columns: minmax(0, 1fr); gap: var(--dc-space-4); }
        }
      `}</style>
    </figure>
  );
}
