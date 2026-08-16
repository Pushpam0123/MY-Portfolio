import { useRef, type ReactNode } from 'react';
import { ScrollSmoother, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useIsTouch, useReducedMotion } from '@/hooks/useMediaQuery';

export function Smoother({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !isTouch && !reduced;

  useGSAP(
    () => {
      document.body.dataset.smooth = enabled ? 'on' : 'off';
      if (!enabled) {
        ScrollTrigger.refresh();
        return;
      }

      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current,
        content: content.current,
        smooth: 1.15,
        effects: true,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });

      return () => smoother.kill();
    },
    { dependencies: [enabled] },
  );

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
