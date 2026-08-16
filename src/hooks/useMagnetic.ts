import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useIsTouch, useReducedMotion } from './useMediaQuery';

export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || isTouch || reduced) return;

      const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]') ?? el;
      const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

      const innerX = gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3.out' });
      const innerY = gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3.out' });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        moveX(dx * strength);
        moveY(dy * strength);
        if (inner !== el) {
          innerX(dx * strength * 0.4);
          innerY(dy * strength * 0.4);
        }
      };

      const onLeave = () => {
        moveX(0);
        moveY(0);
        if (inner !== el) {
          innerX(0);
          innerY(0);
        }
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { dependencies: [isTouch, reduced, strength], scope: ref },
  );

  return ref;
}
