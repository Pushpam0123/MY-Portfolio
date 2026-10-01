import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './ServiceGlyph.css';

// pathLength="1" on every shape normalises stroke-dash maths so the draw-in is uniform.
const glyphs: Record<string, React.ReactNode> = {
  'ai-ml': (
    <>
      <circle pathLength="1" cx="10" cy="12" r="3" />
      <circle pathLength="1" cx="10" cy="30" r="3" />
      <circle pathLength="1" cx="10" cy="48" r="3" />
      <path pathLength="1" d="M13 12 H30 M13 30 H30 M13 48 H30" />
      <rect pathLength="1" x="30" y="21" width="18" height="18" rx="5" />
      <path pathLength="1" d="M48 30 H62" />
      <circle pathLength="1" cx="65" cy="30" r="3" />
    </>
  ),
  software: (
    <>
      <rect pathLength="1" x="8" y="6" width="54" height="12" rx="4" />
      <rect pathLength="1" x="8" y="24" width="54" height="12" rx="4" />
      <rect pathLength="1" x="8" y="42" width="54" height="12" rx="4" />
      <path pathLength="1" d="M20 18 V24 M20 36 V42" />
      <path pathLength="1" d="M50 18 V24 M50 36 V42" />
    </>
  ),
};

/** Strokes draw in when scrolled into view; on hover they flow and glow (CSS). */
export function ServiceGlyph({ id }: { id: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const glyph = glyphs[id];

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const shapes = ref.current.querySelectorAll('circle, rect, path');
      gsap.fromTo(
        shapes,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.inOut',
          stagger: 0.12,
          clearProps: 'strokeDashoffset',
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        },
      );
    },
    { dependencies: [reduced], scope: ref },
  );

  if (!glyph) return null;

  return (
    <svg
      ref={ref}
      className="service-glyph"
      viewBox="0 0 70 60"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
