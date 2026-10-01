import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { DUR, EASE, REVEAL_START, STAGGER } from '@/lib/motion';
import { useSplitReveal } from '@/hooks/useSplitReveal';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './SectionHeading.css';

interface Props {
  index: string;
  eyebrow: string;
  title: ReactNode;
  align?: 'left' | 'center';
  children?: ReactNode;
}

export function SectionHeading({ index, eyebrow, title, align = 'left', children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useSplitReveal(root, { selector: '.sec-head__title', linesClass: 'sec-head__line' });

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
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <div className={`sec-head sec-head--${align}`} ref={root}>
      <div className="sec-head__meta">
        <span className="mono-label sec-head__index">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="section-title sec-head__title">{title}</h2>
      {children ? <div className="sec-head__body">{children}</div> : null}
    </div>
  );
}
