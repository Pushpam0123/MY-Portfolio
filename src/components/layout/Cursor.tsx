import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useIsTouch, useReducedMotion } from '@/hooks/useMediaQuery';
import './Cursor.css';

/**
 * Custom cursor: an instant dot plus a ring that lags behind it.
 *
 * Elements opt into states declaratively with `data-cursor="…"`, so sections
 * never have to import or call into this component.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !isTouch && !reduced;

  useGSAP(
    () => {
      if (!enabled) return;
      const dotEl = dot.current!;
      const ringEl = ring.current!;

      gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50, opacity: 0 });

      const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.12, ease: 'power3.out' });
      const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.12, ease: 'power3.out' });
      const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.55, ease: 'power3.out' });
      const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.55, ease: 'power3.out' });

      let shown = false;
      const onMove = (e: PointerEvent) => {
        if (!shown) {
          shown = true;
          gsap.to([dotEl, ringEl], { opacity: 1, duration: 0.3 });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
      };

      const onOver = (e: PointerEvent) => {
        const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cursor]');
        const state = target?.dataset.cursor;

        if (state === 'drag' || state === 'view') {
          setLabel(state === 'drag' ? 'Drag' : 'View');
          gsap.to(ringEl, { scale: 3.4, borderColor: 'transparent', duration: 0.35 });
          gsap.to(dotEl, { scale: 0, duration: 0.25 });
        } else if (state === 'link') {
          setLabel('');
          gsap.to(ringEl, { scale: 1.9, borderColor: 'var(--c-violet-bright)', duration: 0.3 });
          gsap.to(dotEl, { scale: 0.4, duration: 0.3 });
        } else {
          setLabel('');
          gsap.to(ringEl, { scale: 1, borderColor: 'var(--c-line)', duration: 0.3 });
          gsap.to(dotEl, { scale: 1, duration: 0.3 });
        }
      };

      const onLeaveWindow = () => gsap.to([dotEl, ringEl], { opacity: 0, duration: 0.25 });

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerover', onOver, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeaveWindow);

      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerover', onOver);
        document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
      };
    },
    { dependencies: [enabled] },
  );

  if (!enabled) return null;

  return (
    <div aria-hidden="true">
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring}>
        <span className="cursor-ring__label">{label}</span>
      </div>
    </div>
  );
}
