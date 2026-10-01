import type { RefObject } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { DUR, EASE, REVEAL_START } from '@/lib/motion';

interface Options {
  /** Element(s) inside scope to split, e.g. '.sec-head__title'. */
  selector: string;
  linesClass: string;
  start?: string;
  stagger?: number;
  yPercent?: number;
}

/**
 * Masked line-by-line text reveal. Waits for fonts, re-splits automatically when
 * width/fonts change (autoSplit), plays once on scroll, then drops its inline transform.
 * Reduced motion: text is simply visible.
 */
export function useSplitReveal(scope: RefObject<HTMLElement | null>, o: Options) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
        const targets = gsap.utils.toArray<HTMLElement>(o.selector, scope.current);
        const splits: SplitText[] = [];
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled) return;
          ctx.add(() => {
            targets.forEach((el) => {
              splits.push(
                SplitText.create(el, {
                  type: 'lines',
                  linesClass: o.linesClass,
                  mask: 'lines',
                  aria: 'none',
                  autoSplit: true,
                  onSplit: (self) => {
                    // Already revealed once: a re-split (resize / font swap) must not replay.
                    if (el.dataset.revealed) return;
                    return gsap.from(self.lines, {
                      yPercent: o.yPercent ?? 118,
                      duration: DUR.reveal + 0.1,
                      ease: EASE.reveal,
                      stagger: o.stagger ?? 0.09,
                      clearProps: 'transform',
                      onComplete: () => {
                        el.dataset.revealed = '1';
                      },
                      scrollTrigger: { trigger: el, start: o.start ?? REVEAL_START, once: true },
                    });
                  },
                }),
              );
            });
          });
          ScrollTrigger.refresh();
        });

        return () => {
          cancelled = true;
          splits.forEach((s) => s.revert());
          targets.forEach((el) => delete el.dataset.revealed);
        };
      });
      return () => mm.revert();
    },
    { scope },
  );
}
