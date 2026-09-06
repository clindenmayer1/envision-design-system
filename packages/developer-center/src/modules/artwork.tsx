import type React from 'react';

/**
 * The section artworks.
 *
 * These are the six marks that sit in the ecosystem cards on the home page and in the banner at the
 * top of each area's landing page. They live here rather than beside either one because they belong
 * to neither: a page that renders a mark should not have to import from another page to get it.
 *
 * Every mark is CSS-only and decorative. The geometry is generated here; everything that moves is
 * in app.css, under a comment block per mark. The one exception is DotsLoader, which is an anime.js
 * timeline and keeps its own module.
 */

/**
 * "Dots sphere", adapted from Milleus's CSS-only pen (https://codepen.io/Milleus/pen/eYOBMWj).
 *
 * The original hard-codes 100 nth-child rules, each holding a translate3d worked out ahead of time.
 * The positions follow a plain spiral on a sphere, so they are computed here instead: theta walks
 * from pole to pole in equal steps while phi advances 54 degrees per dot, which lays them along a
 * spiral rather than in stacked rings. Radius is 10em because .ds-sphere is 20em across, and the
 * em unit is what lets `beat` push a dot outward as it swells.
 *
 * The pen's markup is one span short of its own rule set; generating them gives the sphere its
 * hundredth dot, the one at the far pole.
 */
const SPHERE_DOTS = 100;
const SPHERE_RADIUS = 10;
/** Degrees of turn between one dot and the next, around the axis. */
const SPHERE_TURN = 54;

export function DotsSphere() {
  const dots = [];
  for (let i = 1; i <= SPHERE_DOTS; i += 1) {
    const theta = (Math.PI / SPHERE_DOTS) * i;
    const phi = ((SPHERE_TURN * Math.PI) / 180) * i;
    const x = SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi);
    const y = SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi);
    const z = SPHERE_RADIUS * Math.cos(theta);
    dots.push(
      <span
        key={i}
        className="ds-dot"
        style={{
          transform: `translate3d(${x.toFixed(5)}em, ${y.toFixed(5)}em, ${z.toFixed(5)}em)`,
          // Staggered so the beat chases the spiral instead of firing everywhere at once.
          animationDelay: `${-10 * i}ms`,
        }}
      >
        <span className="ds-dot-face" />
      </span>,
    );
  }
  // Decorative: it carries no information the card's own words do not already give.
  return (
    <span className="ds" aria-hidden="true">
      <span className="ds-tilt">
        <span className="ds-sphere">{dots}</span>
      </span>
    </span>
  );
}

/**
 * "100 dots into the void", adapted from Sandrina Pereira's CSS-only pen
 * (https://codepen.io/sandrina-p/pen/mdbRKgg), after a gif by beesandbombs.
 *
 * The original ships 156 hand-written nth-child rules to give every cell its opacity and its
 * animation delay. Both came from one number, so it is generated here instead: for a cell in row r
 * and column c the wave is 0.125 x (base - |c - 5|), where base climbs from 6 at the top row to 12
 * in the middle and back down. It drives the delay, which is what sends the pulse across the grid
 * on a diagonal rather than firing every cell at once. It no longer drives opacity: that produced
 * the original's vignette, and the field is drawn at an even strength here.
 *
 * Everything else lives in .dv in app.css, sized in container units so it fits whatever frame it
 * is dropped into.
 */
const DOTS_COLUMNS = 12;

// Not currently on a card. Kept and exported rather than deleted, so it survives intact and
// putting it back is a one-word change at a call site.
export function DotsVoid() {
  const cells = [];
  for (let row = 0; row < DOTS_COLUMNS; row += 1) {
    for (let column = 0; column < DOTS_COLUMNS; column += 1) {
      const base = 6 + (row <= 6 ? row : DOTS_COLUMNS - row);
      const wave = Math.max(0, 0.125 * (base - Math.abs(column - 5)));
      cells.push(
        <span key={`${row}-${column}`} className="dv-cell" style={{ '--wave': wave } as React.CSSProperties}>
          <span className="dv-dot" />
          <span className="dv-dot" />
        </span>,
      );
    }
  }
  // Decorative: it carries no information the card's own words do not already give.
  return (
    <span className="dv" aria-hidden="true">
      <span className="dv-grid">{cells}</span>
    </span>
  );
}

/**
 * A DNA double helix: two strands of dots crossing, each rung a fifth of a second behind the last.
 *
 * Ported from Neil Morgan's pen (https://codepen.io/NeilMo/pen/MmePoP). His stylesheet opens with
 * "Designed and coded by Neil Morgan, please credit the author" — so the credit is here, in the
 * file, rather than in a commit message nobody reads. Author's site: http://neilmorgan.site
 *
 * His version writes twelve `@keyframes` blocks, one per dot. They collapse to two. Every left-hand
 * dot runs the same journey and every right-hand dot runs its mirror; the only things that differ
 * between rungs are the row and the delay, and neither belongs in a keyframe. `top` is the giveaway
 * — it is declared at 0% and 100% and nowhere between, so it never actually animates. That makes it
 * a static property of the rung, which is what it is here.
 *
 * The two strands are offset half a cycle in SIZE, not in time: the left dot swells as the right
 * one shrinks. That is what reads as depth — the near strand passing in front of the far one.
 */
const DNA_RUNGS = 6;
const DNA_STAGGER = 0.2;

export function DnaHelix() {
  return (
    // Decorative: the card's heading and body already say what this is.
    <span className="dna" aria-hidden="true">
      <span className="dna-strand">
        {Array.from({ length: DNA_RUNGS }).flatMap((_, rung) =>
          (['a', 'b'] as const).map((strand) => (
            <span
              key={`${rung}-${strand}`}
              className="dna-dot"
              data-strand={strand}
              style={{
                '--dna-row': `${rung}em`,
                '--dna-delay': `${(rung * DNA_STAGGER).toFixed(2)}s`,
              } as React.CSSProperties}
            />
          )),
        )}
      </span>
    </span>
  );
}

/**
 * An atom: two shells of crossed orbital rings turning on different axes, each carrying an electron.
 *
 * Ported from Daniele Moraschi's "CSS Atom" (https://codepen.io/danielemoraschi/pen/DogxaW).
 *
 * Two things had to change to make it run today and fit a card.
 *
 * The pen is from the prefix era: every keyframe in it is declared ONLY as `@-webkit-keyframes` and
 * `@-moz-keyframes`, with no unprefixed copy, and `transform-style` is prefixed the same way. The
 * rules here are unprefixed, which is what browsers actually implement now.
 *
 * And every length in the pen is a pixel measured against a 250px stage. They are fractions of one
 * `em` here, so a single font-size scales the whole atom to whatever frame it is dropped into —
 * the ring at 0.56em is the pen's 140/250, the nucleus at 0.12em its 30/250, and so on.
 *
 * There is deliberately no `perspective`. The rings are flattened orthographically as they turn,
 * which is what makes them read as ellipses sweeping through each other rather than as tubes.
 */
const ATOM_SHELLS = [
  { shell: 'c1', reverse: false },
  { shell: 'c2', reverse: true },
] as const;

export function CssAtom() {
  return (
    // Decorative: the card's heading and body already say what this is.
    <span className="at" aria-hidden="true">
      <span className="at-stage">
        {ATOM_SHELLS.map(({ shell, reverse }) => (
          <span key={shell} className={`at-wrap${reverse ? ' at-wrap-reverse' : ''}`}>
            {(['h', 'v'] as const).map((axis) => (
              <span key={axis} className={`at-ring at-${axis} at-${shell}`}>
                <span className="at-orbit">
                  <span className="at-electron" />
                </span>
              </span>
            ))}
            {/* The nucleus rides the inner shell, exactly as the pen has it. */}
            {reverse && <span className="at-nucleus" />}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Square in a circle: a ring of spokes whose swing, offset one to the next, traces a rotating
 * square inside a circle.
 *
 * The technique is Raymond Yang's ("Square in a circle - Loading Animation", CodePen eWGewE). His
 * version hardcodes all 36 spokes and their delays; the geometry is arithmetic, so it is generated
 * here instead — the rotation is i * (360/n) and the delay is a fraction of the cycle, which is the
 * whole trick in two expressions rather than a few hundred lines of transcribed CSS.
 *
 * The delay spans FOUR cycles across the full ring, not one. That is what makes the wave close into
 * a four-cornered figure: one cycle would read as a single pulse chasing itself around the rim.
 */
const SQUARE_SPOKES = 36;
const SQUARE_CYCLE = 1.25;
const SQUARE_LOBES = 4;

export function SquareInCircle() {
  return (
    // Decorative: the card's heading and body already say what this is.
    <span className="sq" aria-hidden="true">
      {Array.from({ length: SQUARE_SPOKES }, (_, i) => (
        <span
          key={i}
          className="sq-spoke"
          style={{
            transform: `rotate(${i * (360 / SQUARE_SPOKES)}deg)`,
            // Negative, so every spoke starts already advanced into the cycle rather than waiting
            // its turn: the figure is complete on the first frame instead of assembling itself.
            '--sq-delay': `${(-i * ((SQUARE_CYCLE * SQUARE_LOBES) / SQUARE_SPOKES)).toFixed(4)}s`,
          } as React.CSSProperties}
        >
          <span className="sq-metronome">
            <span className="sq-bar" />
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Gravity: a core with three rings of dots that fall toward it and drift back out.
 *
 * Drawn here rather than borrowed. The idea came from a CodePen ("Gravity", Peter Nowell) whose
 * artwork is a Noun Project icon by Stephen Plaster, and that icon carries an attribution licence
 * — so this is an original construction of the same idea: positions computed from ring geometry,
 * no path data from anywhere else. Nothing to attribute, nothing to keep in sync with a third party.
 *
 * Each dot animates between its resting radius and 62% of it. The delay runs with the angle, so the
 * fall arrives as a sweep around the core instead of every ring collapsing at once.
 */
const GRAVITY_RINGS = [
  { count: 6, radius: 30, dot: 2.6 },
  { count: 12, radius: 52, dot: 2.1 },
  { count: 18, radius: 76, dot: 1.7 },
] as const;

export function GravityDots() {
  const dots = GRAVITY_RINGS.flatMap((ring, r) =>
    Array.from({ length: ring.count }, (_, i) => {
      // Each ring is offset so the dots never line up into spokes across rings.
      const angle = (i / ring.count) * Math.PI * 2 + r * 0.42;
      return {
        key: `${r}-${i}`,
        x: +(Math.cos(angle) * ring.radius).toFixed(2),
        y: +(Math.sin(angle) * ring.radius).toFixed(2),
        r: ring.dot,
        // Angle drives the delay, so the pull travels around the core as a wave.
        delay: +(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 0.5).toFixed(3),
      };
    }),
  );
  // Decorative: the card's heading and body already say what this is.
  return (
    <svg className="gv" viewBox="0 0 180 180" aria-hidden="true" focusable="false">
      <g transform="translate(90 90)">
        <circle className="gv-core" r="17" />
        {dots.map((d) => (
          <circle
            key={d.key}
            className="gv-dot"
            r={d.r}
            style={{ '--gx': `${d.x}px`, '--gy': `${d.y}px`, animationDelay: `${d.delay}s` } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Concentric rings of dots, each ring turned further than the last.
 *
 * After werls' pen (https://codepen.io/werls/pen/RwxYaJB), which is p5.js drawing spheres into a
 * WebGL canvas. This is CSS, not p5 — a megabyte of library and a canvas context is a lot to add
 * for one decorative mark, and the sketch is doing nothing that 3D transforms cannot.
 *
 * The counts and radii are the pen's own: six rings starting at 300 and stepping down by 30, with
 * `floor(radius / 12)` dots on each, expressed here as fractions of one em so a single font-size
 * scales the figure.
 *
 * Two things depart from the sketch, both forced by the medium.
 *
 * p5 draws SPHERES, which are round from any angle. A CSS dot is a flat disc: turn its plane
 * edge-on and it collapses to a sliver. The sketch turns each ring a full 360 on Y as well as Z,
 * which would pass through edge-on twice a cycle and make the whole figure disappear — it did,
 * before this was changed. So the full turn is kept on Z, which is in the screen plane and leaves
 * the discs facing the viewer, while X and Y are limited to a tilt that reads as tumbling without
 * ever going side-on.
 *
 * And the rings are SIBLINGS turning at different rates rather than nested. In the sketch the
 * rotations are applied inside the loop, so p5's transform stack compounds them and each ring is
 * turned further than the last. Nesting reproduces that exactly, but it also compounds the tilt,
 * which puts the inner rings edge-on again. Rate does the same job: each ring is further round
 * than the one outside it at any moment, and the tilt stays bounded.
 */
const RING_COUNT = 6;
const RING_OUTER = 300;
const RING_STEP = 30;

export function ConcentricRings() {
  // Decorative: the heading beside it already names the section.
  return (
    <span className="cr" aria-hidden="true">
      <span className="cr-stage">
        {Array.from({ length: RING_COUNT }, (_, i) => {
          const radius = RING_OUTER - i * RING_STEP;
          const steps = Math.floor(radius / 12);
          return (
            <span
              key={i}
              className="cr-ring"
              // Each ring inward turns one step faster, which is what keeps them out of phase.
              style={{ '--cr-rate': i + 1 } as React.CSSProperties}
            >
              {Array.from({ length: steps }, (_, j) => (
                <span
                  key={j}
                  className="cr-dot"
                  style={{
                    transform: `rotateZ(${((360 / steps) * j).toFixed(2)}deg) translateX(${(radius / RING_OUTER).toFixed(4)}em)`,
                  }}
                />
              ))}
            </span>
          );
        })}
      </span>
    </span>
  );
}
