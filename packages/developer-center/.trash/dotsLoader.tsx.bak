import { useEffect, useRef } from 'react';
import anime from 'animejs';

/**
 * "Dots Loader", ported from AlikinVV's pen (https://codepen.io/AlikinVV/pen/pXpYwm).
 *
 * Unlike the other two card artworks this one is not CSS: its motion is 112 sequenced steps with
 * 104 relative offsets, choreographed in anime.js, and there is no honest way to express that as
 * keyframes. The pen's engine is therefore a real dependency of this file. Its jQuery use was one
 * `$(window).on('load')` and is gone.
 *
 * The timeline is transcribed step for step, with one change: every `targets` selector is resolved
 * against this component's own root rather than the document. The pen owns the whole page and can
 * afford to write `.d7`; inside a documentation site that would reach into any other instance on
 * the page, and the card is not the only thing on it.
 */

/** The dots, in the pen's own order, and the circle each one carries. There is no d6. */
const LOADER_PARTS: Array<[string, string | null]> = [
  ['d1', 'c4'], ['d2', 'c1'], ['d3', 'c2'], ['d4', 'c3'], ['d5', null], ['d7', null], ['d8', 'c6'],
  ['d9', null], ['d10', 'c5'], ['d11', 'c8'], ['d12', 'c7'], ['d13', null], ['d14', null], ['d15', null],
  ['d16', null], ['d17', null], ['d18', null], ['d19', null], ['d20', null], ['d21', null], ['d22', null],
  ['d23', null], ['d24', null], ['d25', null],
];

export function DotsLoader() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // A looping decorative animation is exactly what this setting is for. The composition still
    // draws, it simply holds its opening position.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /** Scopes a selector to this instance, so one card's timeline cannot drive another's. */
    const q = (selector: string) => root.querySelectorAll(selector);
    const tl = anime.timeline({ loop: true });

    tl.
      add({
        targets: q('.four'),
        width: 50,
        height: 50,
        rotate: 180,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' }).

      add({
        targets: q('.d7'),
        translateX: -50,
        duration: 300,
        easing: 'linear' }).

      add({
        targets: q('.c2'),
        width: 30,
        height: 30,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d5, .d8'),
        translateX: 50,
        duration: 150,
        easing: 'linear' },
      '-=150').
      add({
        targets: q('.c1'),
        width: 30,
        height: 30,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' },
      '-=145').
      add({
        targets: q('.d9'),
        translateX: -50,
        duration: 150,
        easing: 'linear' },
      '-=290').
      add({
        targets: q('.c3'),
        width: 30,
        height: 30,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.c4'),
        width: 30,
        height: 30,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.c5'),
        opacity: 1,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 1,
        easing: 'linear' }).

      add({
        targets: q('.c5'),
        width: 0,
        height: 0,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' }).

      add({
        targets: q('.d10'),
        width: 4,
        height: 4,
        duration: 1,
        easing: 'linear' },
      '-=50').
      add({
        targets: q('.c6'),
        width: 30,
        height: 30,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' },
      '-=270').
      add({
        targets: q('.d11'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d11'),
        translateX: 50,
        translateY: 50,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d12'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=230').
      add({
        targets: q('.d12'),
        translateX: -50,
        translateY: -50,
        duration: 150,
        easing: 'linear' },
      '-=230').
      add({
        targets: q('.d13'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.d13'),
        translateY: -42,
        duration: 150,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.c7, .c8'),
        width: 30,
        height: 30,
        opacity: 0,
        translateX: ['-50%', '-50%'],
        translateY: ['-50%', '-50%'],
        duration: 300,
        easing: 'linear' },
      '-=70').
      add({
        targets: q('.d14'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.d14'),
        translateX: 50,
        duration: 150,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.d15'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.d15'),
        translateX: -50,
        duration: 150,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.d16'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=150').
      add({
        targets: q('.d16'),
        translateY: 42,
        duration: 150,
        easing: 'linear' },
      '-=150').
      add({
        targets: q('.d13'),
        width: 10,
        height: 10,
        right: -45,
        top: -5,
        duration: 200,
        easing: 'linear' },
      '-=350').
      add({
        targets: q('.d13'),
        width: 4,
        height: 4,
        right: -42,
        top: -2,
        duration: 200,
        easing: 'linear' }).

      add({
        targets: q('.d16'),
        width: 15,
        height: 15,
        left: -48,
        bottom: -7,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d16'),
        width: 4,
        height: 4,
        left: -41,
        bottom: -2,
        duration: 200,
        easing: 'linear' }).

      add({
        targets: q('.d3'),
        width: 60,
        height: 60,
        left: -35,
        bottom: -35,
        duration: 200,
        easing: 'linear' },
      '-=180').
      add({
        targets: q('.d1'),
        width: 60,
        height: 60,
        left: -35,
        top: -35,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d4'),
        width: 60,
        height: 60,
        right: -35,
        bottom: -35,
        duration: 200,
        easing: 'linear' },
      '-=210').
      add({
        targets: q('.d2'),
        width: 60,
        height: 60,
        right: -35,
        top: -35,
        duration: 200,
        easing: 'linear' },
      '-=210').
      add({
        targets: q('.d17'),
        opacity: 1,
        duration: 150,
        easing: 'linear' },
      '-=220').
      add({
        targets: q('.d10'),
        width: 36,
        height: 36,
        right: -85,
        bottom: -85,
        duration: 200,
        easing: 'linear' },
      '-=110').
      add({
        targets: q('.d14'),
        width: 36,
        height: 36,
        left: -17,
        bottom: -85,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d11'),
        width: 36,
        height: 36,
        left: -67,
        bottom: -25,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d5'),
        width: 36,
        height: 36,
        right: -35,
        bottom: -15,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d8'),
        width: 36,
        height: 36,
        right: -35,
        top: -16,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d13'),
        width: 36,
        height: 36,
        right: -85,
        top: -44,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d12'),
        width: 36,
        height: 36,
        right: -66,
        top: -36,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d15'),
        width: 36,
        height: 36,
        right: -16,
        top: -86,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d17'),
        width: 36,
        height: 36,
        right: 102,
        top: -85,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d16'),
        width: 36,
        height: 36,
        left: -85,
        bottom: -43,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d9'),
        width: 36,
        height: 36,
        left: -35,
        top: -15,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d7'),
        width: 36,
        height: 36,
        left: -35,
        bottom: -17,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d4'),
        width: 36,
        height: 36,
        right: -17,
        bottom: -17,
        duration: 200,
        easing: 'linear' },
      '-=110').
      add({
        targets: q('.d3'),
        width: 36,
        height: 36,
        left: -17,
        bottom: -17,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d2'),
        width: 36,
        height: 36,
        right: -17,
        top: -17,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d1'),
        width: 36,
        height: 36,
        left: -17,
        top: -17,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d18'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d18'),
        translateY: 70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d19'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d19'),
        translateY: 70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d20'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d20'),
        translateX: -70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d21'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d21'),
        translateX: -70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d22'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d22'),
        translateY: -70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d23'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d23'),
        translateY: -70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d24'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d24'),
        translateX: 70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d25'),
        opacity: 1,
        duration: 1,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d25'),
        translateX: 70,
        duration: 150,
        easing: 'linear' },
      '-=250').
      add({
        targets: q('.d24'),
        translateX: 50,
        width: 12,
        height: 12,
        bottom: 42,
        right: -56,
        duration: 200,
        easing: 'linear' },
      '-=100').
      add({
        targets: q('.d25'),
        translateX: 50,
        width: 12,
        height: 12,
        top: 42,
        right: -56,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d20'),
        translateX: -50,
        width: 12,
        height: 12,
        bottom: -9,
        left: -56,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d21'),
        translateX: -50,
        width: 12,
        height: 12,
        top: -7,
        left: -56,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d22'),
        translateY: -50,
        width: 12,
        height: 12,
        top: -58,
        right: -7,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d23'),
        translateY: -50,
        width: 12,
        height: 12,
        right: 42,
        top: -57,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d18'),
        translateY: 50,
        width: 12,
        height: 12,
        left: 41,
        bottom: -56,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d19'),
        translateY: 50,
        width: 12,
        height: 12,
        left: -9,
        bottom: -57,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d14'),
        width: 22,
        height: 22,
        left: -14,
        bottom: -62,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d11'),
        width: 22,
        height: 22,
        left: -63,
        bottom: -12,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d16'),
        width: 22,
        height: 22,
        left: -61,
        bottom: -20,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d7'),
        width: 22,
        height: 22,
        left: -11,
        bottom: -13,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d9'),
        width: 22,
        height: 22,
        left: -11,
        top: -11,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d17'),
        width: 22,
        height: 22,
        right: 85,
        top: -61,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d15'),
        width: 22,
        height: 22,
        right: -12,
        top: -62,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d12'),
        width: 22,
        height: 22,
        right: -62,
        top: -12,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d13'),
        width: 22,
        height: 22,
        right: -61,
        top: -20,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d8'),
        width: 22,
        height: 22,
        right: -11,
        top: -12,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d5'),
        width: 22,
        height: 22,
        right: -11,
        bottom: -11,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d10'),
        width: 22,
        height: 22,
        right: -61,
        bottom: -61,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d19'),
        width: 4,
        height: 4,
        left: 24,
        bottom: 22,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '+=300').
      add({
        targets: q('.d18'),
        width: 4,
        height: 4,
        left: 24,
        bottom: 22,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d25'),
        width: 4,
        height: 4,
        right: 24,
        top: 22,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d24'),
        width: 4,
        height: 4,
        right: 24,
        bottom: 24,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d22'),
        width: 4,
        height: 4,
        right: 24,
        top: 22,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d23'),
        width: 4,
        height: 4,
        right: 24,
        top: 22,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d21'),
        width: 4,
        height: 4,
        left: 22,
        top: 22,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d20'),
        width: 4,
        height: 4,
        left: 22,
        bottom: 24,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d11'),
        width: 4,
        height: 4,
        left: 24,
        bottom: 22,
        translateX: 0,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=100').
      add({
        targets: q('.d14'),
        width: 4,
        height: 4,
        left: 24,
        bottom: 22,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d9'),
        width: 4,
        height: 4,
        left: 24,
        top: 24,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d7'),
        width: 4,
        height: 4,
        left: 24,
        bottom: 22,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d16'),
        width: 4,
        height: 4,
        left: 24,
        bottom: 22,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d17'),
        width: 4,
        height: 4,
        right: 22,
        top: 24,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d15'),
        width: 4,
        height: 4,
        right: 22,
        top: 24,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d10'),
        width: 4,
        height: 4,
        right: 22,
        bottom: 22,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d5'),
        width: 4,
        height: 4,
        right: 22,
        bottom: 22,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d8'),
        width: 4,
        height: 4,
        right: 22,
        top: 24,
        translateX: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d13'),
        width: 4,
        height: 4,
        right: 22,
        top: 24,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d12'),
        width: 4,
        height: 4,
        right: 22,
        top: 24,
        translateX: 0,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d12, .d12, .d13, .d11, .d18, .d19, .d8, .d5, .d10, .d15, .d20, .d21, .d23, .d22, .d24, .d25, .d17, .d16, .d7, .d9, .d14'),
        opacity: 0,
        duration: 1 }).

      add({
        targets: q('.d1'),
        width: 4,
        height: 4,
        left: -2,
        top: -2,
        translateX: 0,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=100').
      add({
        targets: q('.d2'),
        width: 4,
        height: 4,
        right: -2,
        top: -2,
        translateX: 0,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d3'),
        width: 4,
        height: 4,
        left: -2,
        bottom: -2,
        translateX: 0,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.d4'),
        width: 4,
        height: 4,
        right: -2,
        bottom: -2,
        translateX: 0,
        translateY: 0,
        duration: 200,
        easing: 'linear' },
      '-=200').
      add({
        targets: q('.four'),
        width: 0,
        height: 0,
        rotate: {
          value: 0, duration: 1 },

        duration: 200,
        easing: 'linear' },
      '-=200');

    return () => {
      tl.pause();
    };
  }, []);

  // Decorative: it carries no information the card's own words do not already give.
  return (
    <span className="dl" aria-hidden="true" ref={rootRef}>
      <span className="dl-stage">
        <span className="four">
          {LOADER_PARTS.map(([dot, circle]) => (
            <span key={dot} className={`dot ${dot}`}>
              {circle ? <span className={`circle ${circle}`} /> : null}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
