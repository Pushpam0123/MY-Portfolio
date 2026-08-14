import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './SectionHeading.css';

interface Props {
  index: string;
  eyebrow: string;
  title: ReactNode;
  align?: 'left' | 'center';
  children?: ReactNode;
}

/**
 * Section header with a line-by-line masked reveal driven by SplitText.
 *
 * The split is reverted on cleanup so the DOM returns to plain text — otherwise
 * re-running the effect would split the already-split markup.
 */
export function SectionHeading({ index, eyebrow, title, align = 'left', children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const heading = root.current?.querySelector<HTMLElement>('.sec-head__title');
      if (!heading) return;

      const split = new SplitText(heading, {
        type: 'lines',
        linesClass: 'sec-head__line',
        mask: 'lines',
        aria: 'none', // the heading text remains in the DOM and reads normally
      });

      gsap.from(split.lines, {
        yPercent: 118,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
      });

      gsap.from(root.current!.querySelectorAll('.sec-head__meta > *'), {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
      });

      return () => split.revert();
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
