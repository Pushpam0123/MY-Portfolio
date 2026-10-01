import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { DUR, EASE, REVEAL_FROM, REVEAL_START, STAGGER, type RevealVariant } from '@/lib/motion';

/**
 * Declarative scroll reveal: elements opt in with data-reveal="up" | "left" | "fade".
 * Batched, once-only, and reduced-motion aware (reduced = opacity fade only).
 * clearProps hands transform back to the stylesheet afterwards so :hover lifts work.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          full: '(prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const reduced = Boolean(ctx.conditions?.reduced);
          const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current);
          if (!items.length) return;

          items.forEach((el) => {
            const variant =
              (el.dataset.reveal as RevealVariant) in REVEAL_FROM
                ? (el.dataset.reveal as RevealVariant)
                : 'up';
            // Kill any CSS transform transition so it can't lag the tween.
            el.style.transition = 'none';
            gsap.set(el, { opacity: 0, ...(reduced ? {} : REVEAL_FROM[variant]) });
          });

          ScrollTrigger.batch(items, {
            start: REVEAL_START,
            once: true,
            interval: 0.1,
            batchMax: 6,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                x: 0,
                y: 0,
                duration: reduced ? DUR.fade : DUR.reveal,
                ease: reduced ? 'power1.out' : EASE.reveal,
                stagger: reduced ? 0 : STAGGER.base,
                overwrite: true,
                clearProps: 'transform,opacity,transition',
              }),
          });
        },
      );
      return () => mm.revert();
    },
    { scope },
  );
}
