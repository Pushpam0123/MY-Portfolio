import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useMediaQuery';

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function Counter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  duration = 1.6,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const final = `${prefix}${value.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      el.textContent = `${prefix}${(0).toFixed(decimals)}${suffix}`;
      const proxy = { n: 0 };
      gsap.to(proxy, {
        n: value,
        duration,
        ease: 'power2.out',
        snap: decimals === 0 ? { n: 1 } : undefined,
        onUpdate: () => {
          el.textContent = `${prefix}${proxy.n.toFixed(decimals)}${suffix}`;
        },
        onComplete: () => {
          el.textContent = final;
        },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });

      return () => {
        el.textContent = final;
      };
    },
    { dependencies: [value, decimals, prefix, suffix, duration, reduced] },
  );

  return (
    <span className={className} ref={ref}>
      {final}
    </span>
  );
}
