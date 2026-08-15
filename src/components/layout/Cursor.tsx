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

      // Visibility has to be a two-way flag, not a one-shot latch. It used to be
      // `let shown = false` set true on the first move and never reset, so the
      // fade-out below was permanent: leave the window once — alt-tab, the tab
      // bar, the address bar, off the top edge of the screen — and the cursor
      // never came back. With the native cursor hidden underneath, that left the
      // visitor with no pointer at all until a reload.
      let visible = false;

      const show = () => {
        if (visible) return;
        visible = true;
        gsap.to([dotEl, ringEl], { opacity: 1, duration: 0.3, overwrite: 'auto' });
      };

      /**
       * Teleport both marks to a point with no easing.
       *
       * `gsap.set` on the elements does not work here: each `quickTo` holds its
       * own cached start value and would keep interpolating from the position it
       * last knew about, overwriting the set on the very next tick. Completing
       * the tweens instead moves them *and* updates that cache.
       */
      const jumpTo = (x: number, y: number) => {
        dotX(x).progress(1);
        dotY(y).progress(1);
        ringX(x).progress(1);
        ringY(y).progress(1);
      };

      const onMove = (e: PointerEvent) => {
        if (!visible) {
          // Re-entering: put both marks under the pointer before revealing them,
          // or they fade in wherever the pointer happened to exit and then sweep
          // across the screen to catch up.
          jumpTo(e.clientX, e.clientY);
          show();
          return;
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
          gsap.to(ringEl, { scale: 1, borderColor: 'var(--c-cursor-ring)', duration: 0.3 });
          gsap.to(dotEl, { scale: 1, duration: 0.3 });
        }
      };

      const onLeaveWindow = () => {
        if (!visible) return;
        visible = false;
        gsap.to([dotEl, ringEl], { opacity: 0, duration: 0.25, overwrite: 'auto' });
      };

      // Only hide the native cursor while this component is actually mounted and
      // driving the custom one — see Cursor.css. The CSS used to do it from a
      // media query alone, which meant every failure mode degraded to *no*
      // cursor instead of the ordinary one.
      const root = document.documentElement;
      root.dataset.customCursor = 'on';

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerover', onOver, { passive: true });
      root.addEventListener('pointerleave', onLeaveWindow);

      return () => {
        delete root.dataset.customCursor;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerover', onOver);
        root.removeEventListener('pointerleave', onLeaveWindow);
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
