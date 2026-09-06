import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DocCard, DocGrid } from '../modules';
import { Pipeline } from '../modules/diagrams';
import { DotsLoader } from '../modules/dotsLoader';
import { CssAtom, DnaHelix, DotsSphere, GravityDots, SquareInCircle } from '../modules/artwork';
import { system } from '../data/generated';

/**
 * Envision Design landing page.
 *
 * The hero follows the approved Figma design (Envision Hero Screens, node 108-69): 1116x388 on
 * #f3f0ea at radius 12, headline over two lines, the exported material composition at 506x372.
 * Copy is transcribed from the design's text layers rather than rewritten.
 *
 * The ecosystem cards deliberately depart from that frame. The design gave each card a 56px icon
 * tile above the copy; they now lead with a full-width 16:9 media area instead, so each card can
 * carry a real image of what it links to rather than a generic glyph. Figma node 108-69 still shows
 * the older card, so treat this file as the current one until the frame is redrawn.
 */

/**
 * Every value that shapes how the hero composition responds to the cursor.
 *
 * Kept together so the feel can be tuned in one place rather than hunted through a transform
 * string. The restraint is deliberate: this is a physical object orienting itself, not a card
 * flipping about.
 */
const PARALLAX = {
  /** Depth of the viewing frustum, in px, set on the container. Lower exaggerates the perspective. */
  perspective: 780,
  /** Largest tilt on either axis, in degrees, reached at the edge of the viewport. */
  maxTilt: 9,
  /**
   * How far the object lifts toward the viewer, in px.
   *
   * The lift is on at rest, and perspective magnifies whatever it lifts, so this also sets how much
   * larger the hero sits than its layout box. Raising it costs size as well as depth.
   */
  depth: 20,
  /** How far the object drifts toward the pointer, in px. */
  follow: 14,
  /** Scale at full engagement. */
  scale: 1.025,
  /** Share of the remaining distance covered each 60fps frame. Lower is heavier and slower. */
  smoothing: 0.12,
} as const;

/**
 * The hero composition, and the cursor parallax that makes it feel suspended above the band.
 *
 * The materials are one flattened PNG, so the whole image is driven as a single rigid object
 * rather than split into layers: it turns toward the pointer, lifts slightly, and drifts a few
 * pixels after it. Its own shadows are painted into the pixels, and that is the only shadow the
 * hero gets — a cast shadow around the whole PNG sat behind a picture that was already lit, and
 * read as a second, wrong outline rather than as depth.
 *
 * The lift is not conditional on the cursor. It is applied at first paint and never withdrawn, so
 * the hero looks the way it is supposed to look on a page nobody has touched yet; the pointer only
 * decides which way the object is turned.
 *
 * The pointer is tracked on the window and measured against the centre of the VIEWPORT, not
 * against this image's own box. The object is meant to read as suspended in the room rather than
 * as a control that reacts when touched, so it keeps turning toward the cursor wherever the cursor
 * is on the page. Measuring against its own bounds would also make the effect stronger on small
 * screens and weaker on large ones, where the viewport keeps the strength predictable.
 *
 * The transform is written straight to the node from a requestAnimationFrame loop instead of being
 * held in state. A pointer moving sixty times a second would otherwise re-render the entire
 * landing page on every frame, and this motion has no business in the component tree.
 */
function HeroComposition() {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    // A tilt that follows a cursor means nothing without one, and a decorative flourish is never
    // worth a vestibular trigger. Both cases simply keep the image as it is.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Pointer position as -1..1 across the viewport, where 0,0 is its centre, and how engaged the
    // effect is. Engagement is 1 from the start and stays there: the lift, the scale and the
    // perspective are how the hero is meant to look, not a reward for moving the mouse. Waiting for
    // a first pointermove meant the object popped into its real appearance seconds after the page
    // had settled, on a page many people never move the cursor on at all.
    //
    // What the pointer still controls is ORIENTATION. With x and y at 0 the object sits square and
    // lifted; the cursor turns it from there, and losing the cursor returns it to square without
    // ever flattening it back out.
    const target = { x: 0, y: 0, engage: 1 };
    const shown = { x: 0, y: 0, engage: 1 };
    let raf = 0;
    let previous = 0;
    // Nothing to drive while the hero is scrolled away, and a long page should not spend a frame
    // on every mouse move to animate something nobody can see.
    let onScreen = true;

    const render = (now: number) => {
      // Clamped so a backgrounded tab does not resume with one enormous step.
      const elapsed = previous ? Math.min(now - previous, 64) : 1000 / 60;
      previous = now;
      // Framerate independent: the same journey on a 120Hz display as on a 60Hz one.
      const k = 1 - (1 - PARALLAX.smoothing) ** (elapsed / (1000 / 60));
      shown.x += (target.x - shown.x) * k;
      shown.y += (target.y - shown.y) * k;
      shown.engage += (target.engage - shown.engage) * k;

      const { maxTilt, depth, follow, scale } = PARALLAX;
      const e = shown.engage;
      image.style.transform = [
        `translate3d(${(shown.x * follow * e).toFixed(2)}px, ${(shown.y * follow * e).toFixed(2)}px, ${(depth * e).toFixed(2)}px)`,
        // Pointer below centre pushes the near edge down, which is the object looking at it.
        `rotateX(${(-shown.y * maxTilt * e).toFixed(3)}deg)`,
        `rotateY(${(shown.x * maxTilt * e).toFixed(3)}deg)`,
        `scale(${(1 + (scale - 1) * e).toFixed(4)})`,
      ].join(' ');
      // No drop-shadow here. The artwork already carries a shadow under every object in it, baked
      // in and lit from one direction; casting a second one around the whole PNG read as exactly
      // that — a duplicate outline behind a picture that had its own shadows already.

      const settled =
        Math.abs(target.x - shown.x) < 0.001 &&
        Math.abs(target.y - shown.y) < 0.001 &&
        Math.abs(target.engage - shown.engage) < 0.001;
      if (settled || !onScreen) {
        // Caught up with the pointer, so stop asking for frames until it moves again. Without this
        // the loop would spin forever now that the effect no longer ends when a pointer leaves.
        //
        // The transform STAYS on the element. It is the resting appearance now, not a leftover, so
        // there is nothing to hand back. Only the compositor hint is released, and wake() sets it
        // again on the next movement.
        image.style.willChange = '';
        raf = 0;
        previous = 0;
        return;
      }
      raf = requestAnimationFrame(render);
    };

    const wake = () => {
      if (raf || !onScreen) return;
      image.style.willChange = 'transform';
      raf = requestAnimationFrame(render);
    };

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      // Normalised against the viewport, so its centre is the neutral orientation and the reach is
      // the same fraction of the screen on any display.
      target.x = clamp((event.clientX / window.innerWidth) * 2 - 1);
      target.y = clamp((event.clientY / window.innerHeight) * 2 - 1);
      target.engage = 1;
      wake();
    };
    // Square again, still lifted. Engagement is deliberately untouched.
    const rest = () => {
      target.x = 0;
      target.y = 0;
      wake();
    };

    // On the window, not the hero: the object answers the cursor anywhere on the page.
    window.addEventListener('pointermove', onMove, { passive: true });
    // Only leaving the window itself sends it home. `pointerleave` on the document fires when the
    // cursor leaves the page entirely; blur covers tabbing or switching away mid-movement.
    document.addEventListener('pointerleave', rest);
    window.addEventListener('blur', rest);

    // First paint. The object has to be lifted and square before anyone touches the mouse, so the
    // loop runs once here instead of waiting for a pointermove that may never come.
    wake();

    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) wake();
      },
      { rootMargin: '120px' },
    );
    watcher.observe(image);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', rest);
      window.removeEventListener('blur', rest);
      watcher.disconnect();
      if (raf) cancelAnimationFrame(raf);
      // Unmount hands the element back untouched. Nothing sets `filter` any more, so there is
      // nothing to clear beyond what this effect actually wrote.
      image.style.transform = '';
      image.style.willChange = '';
    };
  }, []);

  return (
    // The frame carries the perspective and owns the layout the image used to hold, so nothing
    // about the hero's geometry changes and the transform can never shift the page.
    <div
      style={{
        justifySelf: 'end',
        inlineSize: '100%',
        maxInlineSize: 440,
        perspective: `${PARALLAX.perspective}px`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* landing-page-image2.png, shipped at 2x the 506px render width. The intrinsic size below
          matches its aspect ratio so the hero does not reflow once the image decodes. */}
      <img
        ref={imageRef}
        src="/hero-materials.png"
        alt="A fan of paint swatches, a paint roller, a brass faucet, a cabinet pull, a wood sample, marble and green tile, arranged together."
        width={506}
        height={496}
        style={{
          display: 'block',
          inlineSize: '100%',
          blockSize: 'auto',
          transformOrigin: 'center center',
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
}

/** Media area on top, then title and body. The whole card is the link. `media` fills the 16:9
 *  frame; the icon is the placeholder shown until artwork exists for a card. */
function EcosystemCard({
  icon, title, body, to, media,
}: { icon: string; title: string; body: string; to: string; media?: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="dc-eco-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        // No container gap: the space above the title and the space above the body are two
        // different decisions, and one `gap` could only ever set them to the same value.
        gap: 0,
        padding: 'var(--dc-space-6)',
        textDecoration: 'none',
        borderRadius: 'var(--envision-t1-border-radius-16)',
      }}
    >
      {/* The media frame is the card's subject, held at 1:1 so every card crops its artwork the
          same way and the grid's rows stay level. `overflow: hidden` clips whatever is dropped in
          to the same radius, so artwork needs no corner treatment of its own. */}
      <span
        className="dc-eco-media"
        aria-hidden={media ? undefined : 'true'}
        style={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          inlineSize: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--envision-t1-border-radius-8)',
          background: 'var(--dc-icon-tile)',
          overflow: 'hidden',
          flex: '0 0 auto',
        }}
      >
        {media ? (
          // The artwork sits inset from the frame rather than bleeding to its edges. It cannot be
          // done with padding on the frame: every artwork root is `position: absolute; inset: 0`,
          // and an absolutely positioned child resolves against its containing block's PADDING box,
          // so padding there would have no effect at all. This inset box is that containing block.
          // Sizing follows for free — each artwork declares `container-type: inline-size`, so its
          // `cqw` lengths now measure this box instead of the full frame.
          <span style={{ position: 'absolute', inset: 'var(--dc-media-pad)' }}>{media}</span>
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 'var(--envision-t1-font-size-56)', lineHeight: 1, opacity: 0.7 }}
          >
            {icon}
          </span>
        )}
      </span>

      <h3
        style={{
          margin: 0,
          marginBlockStart: 'var(--dc-space-4)',
          marginBlockEnd: 'var(--dc-space-2)',
          fontSize: 'var(--envision-t1-font-size-18)',
          fontWeight: 'var(--envision-t1-font-weight-700)',
          color: 'var(--envision-t2-color-content-primary-default)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--envision-t1-font-size-14)',
          lineHeight: 1.5,
          color: 'var(--envision-t2-color-content-secondary-default)',
          flex: 1,
        }}
      >
        {body}
      </p>
    </Link>
  );
}

export function Home() {
  return (
    <div className="dc-container">
      {/* ------------------------------------------------------ hero (Figma 111:184) */}
      <section
        className="dc-hero"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 506px',
          gap: 'var(--dc-space-6)',
          alignItems: 'center',
          minHeight: 388,
          padding: 'var(--dc-space-2) var(--dc-space-8)',
          background: 'var(--dc-surface-hero)',
          borderRadius: 'var(--envision-t1-border-radius-12)',
        }}
      >
        {/* Inset from the band's own padding so the copy sits off the rounded left edge. */}
        <div style={{ paddingBlock: 'var(--dc-space-8)', paddingInlineStart: 'var(--dc-space-4)' }}>
          <h1 className="dc-h1" style={{ maxWidth: 482, fontSize: 'var(--envision-t1-font-size-40)', marginBlockStart: 0 }}>
            Build better Envision experiences, together.
          </h1>
          <p
            style={{
              maxWidth: 482,
              margin: '16px 0 0',
              fontSize: 'var(--envision-t1-font-size-15)',
              lineHeight: 1.6,
              color: 'var(--envision-t2-color-content-secondary-default)',
            }}
          >
            A shared foundation of principles, tokens, components, and patterns for designing and building
            consistent, accessible experiences across Envision.
          </p>
        </div>

        <HeroComposition />
      </section>

      {/* ------------------------------------------------- ecosystem cards (Figma 112:72) */}
      <section style={{ marginBlockStart: 'var(--dc-space-6)' }}>
        {/* The design shows no heading here. It is kept for document structure and hidden
            visually, so heading order stays valid without altering the approved layout. */}
        <h2 className="dc-sr-only">Explore the ecosystem</h2>

        <div className="dc-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--dc-space-6)' }}>
          <EcosystemCard
            icon="palette"
            title="Foundations"
            body="The visual language of Envision: color, typography, spacing, layout and more."
            to="/foundations"
            media={<DnaHelix />}
          />
          <EcosystemCard
            icon="tune"
            title="Tokens"
            body="Design decisions encoded as tokens, the connection between design and code."
            to="/tokens"
            media={<DotsSphere />}
          />
          <EcosystemCard
            icon="view_in_ar"
            title="Components"
            body="Production-ready building blocks for creating consistent interfaces."
            to="/components"
            media={<CssAtom />}
          />
          <EcosystemCard
            icon="list"
            title="Patterns"
            body="Proven ways to combine components to solve common problems."
            to="/patterns"
            media={<SquareInCircle />}
          />
          <EcosystemCard
            icon="edit"
            title="Develop"
            body="Everything you need to build with Envision in your codebase."
            to="/get-started"
            media={<DotsLoader />}
          />
          <EcosystemCard
            icon="check_circle"
            title="Governance"
            body="How Envision is maintained, evolved and adopted."
            to="/governance"
            media={<GravityDots />}
          />
        </div>
      </section>

      {/* ---------------------------------------- how the ecosystem connects (Part XXI §3) */}
      <section style={{ marginBlockStart: 'var(--dc-space-16)' }}>
        <h2 className="dc-h2" style={{ marginBlockStart: 0 }}>One system from design to production</h2>
        <p style={{ maxWidth: '70ch' }}>
          Envision connects the decisions designers make with the components engineers ship.
        </p>

        <Pipeline
          chevron
          alt={
            'The Envision pipeline has six stages in order: Figma, holding the design foundations and components; ' +
            'Design Tokens, the shared design decisions; Code, the generated CSS and TypeScript; Components, the ' +
            'reusable production UI; Storybook, the component documentation and reference; and Envision, the ' +
            'consistent product experiences that result.'
          }
          steps={[
            { label: 'Figma', note: 'Design foundations and components', tone: 'info' },
            { label: 'Design Tokens', note: 'Shared design decisions', tone: 'info' },
            { label: 'Code', note: 'Generated CSS and TypeScript', tone: 'info' },
            { label: 'Components', note: 'Reusable production UI', tone: 'info' },
            { label: 'Storybook', note: 'Component documentation', tone: 'info' },
            { label: 'Envision', note: 'Consistent product experiences', tone: 'info' },
          ]}
        />

        <Link
          to="/tokens/pipeline"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--dc-space-2)',
            color: 'var(--envision-t2-color-content-brand-default)',
            fontWeight: 'var(--envision-t1-font-weight-600)', textDecoration: 'none',
          }}
        >
          See how the system works <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* ------------------------------------------------------------- role-based entry */}
      <section style={{ marginBlockStart: 'var(--dc-space-16)' }}>
        <h2 className="dc-h2" style={{ marginBlockStart: 0 }}>Start with what you need</h2>
        <DocGrid columns={3}>
          <DocCard to="/get-started/designers" title="Designers" icon="draw" cta="Start designing">
            Set up the Figma libraries, learn the foundations, use system components, and design with responsive and
            accessibility guidance.
          </DocCard>
          <DocCard to="/get-started/developers" title="Developers" icon="code" cta="Start developing">
            Install the system packages, consume tokens, implement components, and use Storybook as the executable
            reference.
          </DocCard>
          <DocCard to="/governance/contribution" title="Contributors" icon="group" cta="Learn how to contribute">
            Understand contribution criteria, reviews, lifecycle, releases, and ownership.
          </DocCard>
        </DocGrid>
      </section>

      {/* ------------------------------------------------------------ system resources */}
      <section style={{ marginBlockStart: 'var(--dc-space-16)' }}>
        <h2 style={{ fontSize: 'var(--envision-t1-font-size-20)', fontWeight: 'var(--envision-t1-font-weight-600)', margin: '0 0 16px' }}>
          System resources
        </h2>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--dc-space-3)', listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            // The design source, built from the file key the registry records, so this link cannot
            // drift from the library the docs are generated against.
            { label: 'Figma library', href: `https://www.figma.com/design/${system.figmaFileKey}/Envision-Design-System` },
            { label: 'Storybook', href: system.storybookUrl },
            { label: 'GitHub', href: 'https://github.com/clindenmayer1/envision-design-system' },
            { label: 'Design tokens', to: '/tokens/reference' },
            { label: 'Changelog', to: '/tools/changelog' },
          ].map((r) => {
            const style: React.CSSProperties = {
              display: 'inline-block', padding: 'var(--dc-space-2) var(--dc-space-4)', textDecoration: 'none',
              fontSize: 'var(--envision-t1-font-size-14)',
              border: '1px solid var(--envision-t2-color-border-default-default)',
              borderRadius: 'var(--envision-t1-border-radius-pill)',
            };
            return (
              <li key={r.label}>
                {r.href
                  ? <a href={r.href} target="_blank" rel="noreferrer" style={style}>{r.label} ↗</a>
                  : <Link to={r.to!} style={style}>{r.label}</Link>}
              </li>
            );
          })}
        </ul>
      </section>

      <style>{`
        @media (max-width: 1100px) {
          .dc-hero { grid-template-columns: minmax(0,1fr) !important; padding: var(--dc-space-6) !important; }
          .dc-hero img { justify-self: center !important; }
          .dc-card-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 700px) {
          .dc-card-grid { grid-template-columns: minmax(0,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
