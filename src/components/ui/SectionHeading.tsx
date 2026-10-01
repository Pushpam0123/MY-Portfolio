import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { DUR, EASE, REVEAL_START, STAGGER } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './SectionHeading.css';

interface Props {
  index: string;
  eyebrow: string;
  title: ReactNode;
  align?: 'left' | 'center';
  children?: ReactNode;
}

const DIM = 'rgba(244, 242, 255, 0.15)';
const TINT = '#a46bff';
const FULL = '#ffffff';

/**
 * One heading animation: a scroll-scrubbed word-by-word light-up (dim -> violet -> white).
 * Words are split in React (no SplitText), the h2 carries the real text via aria-label and the
 * visual words are aria-hidden. Reduced motion: words simply render at full colour.
 */
export function SectionHeading({ index, eyebrow, title, align = 'left', children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const words = typeof title === 'string' ? title.split(/\s+/).filter(Boolean) : null;

  useGSAP(
    () => {
      gsap.from('.sec-head__meta > *', {
        opacity: 0,
        y: reduced ? 0 : 18,
        duration: reduced ? DUR.fade : 0.7,
        ease: EASE.ui,
        stagger: STAGGER.base,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      });

      if (reduced || !words) return;
      const els = gsap.utils.toArray<HTMLElement>('.sec-head__word', root.current);
      gsap.set(els, { color: DIM });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.sec-head__title',
          start: 'top 88%',
          end: 'bottom 52%',
          scrub: 0.6,
        },
      });
      const n = els.length;
      els.forEach((el, i) => {
        tl.to(
          el,
          { keyframes: { color: [DIM, TINT, FULL], easeEach: 'none' }, duration: 1.4 },
          (i / Math.max(n, 1)) * 2.2,
        );
        tl.fromTo(el, { y: 10 }, { y: 0, duration: 1.2, ease: 'power2.out' }, (i / Math.max(n, 1)) * 2.2);
      });
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <div className={`sec-head sec-head--${align}`} ref={root}>
      <span className="sec-head__ghost" aria-hidden="true">
        {index}
      </span>
      <div className="sec-head__meta">
        <span className="mono-label sec-head__index">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2
        className={`section-title sec-head__title${words ? ' sec-head__title--words' : ''}`}
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {words
          ? words.map((w, i) => (
              <span className="sec-head__word" aria-hidden="true" key={i}>
                {w}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))
          : title}
      </h2>
      {children ? <div className="sec-head__body">{children}</div> : null}
    </div>
  );
}
