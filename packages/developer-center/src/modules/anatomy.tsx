import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

/**
 * The design system's anatomy: numbered markers drawn over the real element, with a legend naming
 * each part.
 *
 * The markers are absolutely positioned DOM, not a screenshot. That is the whole point: the
 * specimen is the component itself, so it stays crisp at any zoom, follows the active theme, and
 * cannot drift from what the component actually renders. The numbers and their copy come from the
 * Figma anatomy frame, so the two documents agree without one being a picture of the other.
 *
 * Two axes, because the components need different ones. A wide element (OptionCard) is annotated
 * along its bottom edge, where the parts sit side by side. A tall element (RightRail) is annotated
 * down its left edge, where the parts stack.
 */
export interface AnatomyPart {
  n: number;
  name: string;
  note?: string | null;
  /** Position along the specimen, as a percentage of its width (x axis). */
  x?: number | null;
  /** Position down the specimen, as a percentage of its height (y axis). */
  y?: number | null;
  /**
   * CSS Shadow Part names this marker points at, for a specimen that is a custom element.
   *
   * Parts are the component's public styling surface, so measuring them is supported in a way that
   * reaching for a private class name would not be. Several names union into one box, which is how
   * a marker names a group such as Title + Note.
   */
  part?: string[] | null;
}

/** The gutter the markers live in, and the length of the leader that reaches the specimen. */
const GUTTER = 44;
const LEADER = 14;
const DOT = 22;
/** How far short of the part the leader stops, so its dot touches without covering the part. */
const STANDOFF = 6;

export function AnatomyFigure({
  parts, axis, children, caption, specimenWidth,
}: {
  parts: AnatomyPart[];
  axis: 'x' | 'y';
  children: React.ReactNode;
  caption?: string;
  /**
   * The width the Figma anatomy specimen was measured at. The marker positions are percentages of
   * that box, so rendering the specimen at any other width slides every marker off its part.
   */
  specimenWidth?: number | null;
}) {
  const ordered = [...parts].sort((a, b) => a.n - b.n);
  const stageRef = useRef<HTMLDivElement>(null);
  // Where each numbered part actually is, measured from the rendered specimen.
  //
  // A stored percentage is a guess about a width: change the type scale, the theme, or the
  // viewport and the marker slides off the part it names. Measuring the real element instead means
  // the markers cannot drift, and they re-place themselves when the specimen reflows. It only works
  // where the parts are reachable, so a specimen built from light DOM measures and a custom element
  // with a closed shadow root falls back to the percentages recorded from Figma.
  const [measured, setMeasured] = useState<Record<number, { x: number; y: number; left: number; bottom: number }>>({});
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const next: Record<number, { x: number; y: number; left: number; bottom: number }> = {};
    const place = (n: number, rects: DOMRect[]) => {
      if (!rects.length) return;
      const left = Math.min(...rects.map((r) => r.left));
      const right = Math.max(...rects.map((r) => r.right));
      const top = Math.min(...rects.map((r) => r.top));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      next[n] = {
        x: (((left + right) / 2 - box.left) / box.width) * 100,
        y: (((top + bottom) / 2 - box.top) / box.height) * 100,
        left: ((left - box.left) / box.width) * 100,
        bottom: ((bottom - box.top) / box.height) * 100,
      };
    };
    // A specimen built here tags its parts directly.
    stage.querySelectorAll('[data-anatomy]').forEach((el) => {
      const n = Number(el.getAttribute('data-anatomy'));
      if (Number.isFinite(n)) place(n, [el.getBoundingClientRect()]);
    });
    // A specimen that is a custom element exposes them as CSS Shadow Parts instead.
    const textBox = (el: Element): DOMRect => {
      const box = el.getBoundingClientRect();
      if (!el.textContent?.trim()) return box;
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      return r.width && r.height ? r : box;
    };
    const roots: (Element | ShadowRoot)[] = [stage];
    stage.querySelectorAll('*').forEach((el) => {
      const sr = (el as HTMLElement).shadowRoot;
      if (sr) roots.push(sr);
    });
    for (const p of parts) {
      if (next[p.n] || !p.part?.length) continue;
      const rects: DOMRect[] = [];
      for (const name of p.part) {
        for (const root of roots) {
          const el = root.querySelector(`[part~="${name}"]`);
          if (el) { rects.push(textBox(el)); break; }
        }
      }
      place(p.n, rects);
    }
    setMeasured(next);
  }, [parts]);
  useEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [measure, children]);
  return (
    <figure className="dc-anatomy" style={{ margin: 'var(--dc-rhythm-example) 0' }}>
      <div className="dc-anatomy-grid">
        <div
          ref={stageRef}
          className={`dc-anatomy-stage dc-anatomy-stage--${axis}`}
          // Width only matters on the x axis, where the fallback positions are percentages of it.
          style={specimenWidth && axis === 'x' ? { inlineSize: specimenWidth, maxInlineSize: '100%' } : undefined}
        >
          <div className="dc-anatomy-specimen">{children}</div>
          {ordered.map((p) => {
            const m = measured[p.n];
            const pos = m ? (axis === 'x' ? m.x : m.y) : (axis === 'x' ? p.x : p.y);
            if (pos == null) return null;
            // Where the leader stops: the part's near edge, so the line reaches the part and the
            // dot sits against it without covering it. Ending on the center hid small parts such as
            // the chevron entirely.
            const reach = m ? (axis === 'x' ? m.bottom : m.left) : null;
            return (
              <Fragment key={p.n}>
                <span
                  aria-hidden="true"
                  className="dc-anatomy-leader"
                  style={axis === 'x'
                    ? {
                        insetInlineStart: `${pos}%`,
                        insetBlockStart: reach != null ? `calc(${reach}% + ${STANDOFF}px)` : undefined,
                        blockSize: reach != null ? undefined : LEADER,
                        insetBlockEnd: reach != null ? DOT : GUTTER - LEADER,
                        inlineSize: 1,
                      }
                    : {
                        insetBlockStart: `${pos}%`,
                        insetInlineStart: DOT,
                        inlineSize: reach != null ? `calc(${reach}% - ${DOT + STANDOFF}px)` : LEADER,
                        blockSize: 1,
                      }}
                />
                {/* The end of the leader, sitting on the part it names. */}
                {reach != null && (
                  <span
                    aria-hidden="true"
                    className="dc-anatomy-tip"
                    style={axis === 'x'
                      ? { insetInlineStart: `${pos}%`, insetBlockStart: `calc(${reach}% + ${STANDOFF}px)` }
                      : { insetBlockStart: `${pos}%`, insetInlineStart: `calc(${reach}% - ${STANDOFF}px)` }}
                  />
                )}
                <span
                  aria-hidden="true"
                  className="dc-anatomy-marker"
                  style={axis === 'x'
                    ? { insetInlineStart: `${pos}%`, insetBlockEnd: 0 }
                    : { insetBlockStart: `${pos}%`, insetInlineStart: 0 }}
                >
                  {p.n}
                </span>
              </Fragment>
            );
          })}
        </div>

        {/* The legend is an ordered list, so the numbering is the document's rather than painted on,
            and a screen reader reads the parts in order without seeing the markers at all. */}
        <ol className="dc-anatomy-legend">
          {ordered.map((p) => (
            <li key={p.n}>
              <span aria-hidden="true" className="dc-anatomy-marker dc-anatomy-marker--legend">{p.n}</span>
              <span>
                <strong>{p.name}</strong>
                {p.note && <span className="dc-small">{p.note}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {caption && <figcaption className="dc-small" style={{ marginBlockStart: 'var(--dc-space-3)' }}>{caption}</figcaption>}
      <style>{`
        .dc-anatomy-grid {
          display: grid;
          grid-template-columns: max-content minmax(220px, 1fr);
          gap: var(--dc-space-6);
          align-items: start;
          padding: var(--dc-space-6);
          background: var(--dc-surface);
          border: 1px solid var(--envision-t2-color-border-default-default);
          border-radius: var(--envision-t2-border-radius-container-md);
        }
        .dc-anatomy { container-type: inline-size; }
        /* Below this the two columns cannot both hold their width, so the legend moves under the
           specimen rather than being squeezed into a column too narrow to read. Measured against
           the figure itself: the article column is much narrower than the window. */
        @container (max-width: 700px) {
          .dc-anatomy-grid { grid-template-columns: minmax(0, 1fr); }
          .dc-anatomy-stage { max-inline-size: 100%; }
        }
        @supports not (container-type: inline-size) {
          @media (max-width: 1200px) {
            .dc-anatomy-grid { grid-template-columns: minmax(0, 1fr); }
            .dc-anatomy-stage { max-inline-size: 100%; }
          }
        }
        .dc-anatomy-stage { position: relative; }
        /* The gutter the markers occupy. Reserved rather than overlaid, so a marker never sits on
           top of the component it is pointing at. */
        .dc-anatomy-stage--x { padding-block-end: ${GUTTER}px; }
        .dc-anatomy-stage--y { padding-inline-start: ${GUTTER}px; }
        .dc-anatomy-specimen { position: relative; }
        .dc-anatomy-marker {
          display: grid;
          place-items: center;
          inline-size: ${DOT}px;
          block-size: ${DOT}px;
          border-radius: var(--envision-t2-border-radius-circular);
          background: var(--envision-t2-color-content-primary-default);
          color: var(--envision-t2-color-content-on-primary-default);
          font-size: var(--envision-t1-font-size-11);
          font-weight: var(--envision-t1-font-weight-600);
          line-height: 1;
        }
        .dc-anatomy-stage .dc-anatomy-marker { position: absolute; }
        .dc-anatomy-stage--x .dc-anatomy-marker { transform: translateX(-50%); }
        .dc-anatomy-stage--y .dc-anatomy-marker { transform: translateY(-50%); }
        .dc-anatomy-leader {
          position: absolute;
          background: var(--envision-t2-color-border-strong-default);
        }
        .dc-anatomy-tip {
          position: absolute;
          inline-size: 6px;
          block-size: 6px;
          border-radius: var(--envision-t2-border-radius-circular);
          background: var(--envision-t2-color-content-primary-default);
          transform: translate(-50%, -50%);
        }
        .dc-anatomy-stage--x .dc-anatomy-leader { transform: translateX(-50%); }
        .dc-anatomy-stage--y .dc-anatomy-leader { transform: translateY(-50%); }
        .dc-anatomy-legend {
          display: grid;
          gap: var(--dc-space-4);
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .dc-anatomy-legend li {
          display: grid;
          grid-template-columns: ${DOT}px minmax(0, 1fr);
          gap: var(--dc-space-3);
          align-items: start;
        }
        .dc-anatomy-legend strong {
          display: block;
          font-size: var(--envision-t1-font-size-14);
        }
        .dc-anatomy-legend .dc-small {
          display: block;
          font-size: var(--envision-t1-font-size-13);
        }
      `}</style>
    </figure>
  );
}
