import {
  useEffect,
  useRef,
  type ComponentType,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

import './fx.css';

interface Props {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  /** Max 3D tilt in degrees (0 = off). */
  tilt?: number;
  /** Diagonal shine sweep on hover. */
  shine?: boolean;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Card wrapper: radial glow + border highlight that follow the cursor, optional 3D tilt and
 * shine sweep. Only active for a fine, hovering pointer and when motion is allowed; all
 * visuals are CSS driven from the --fx-x / --fx-y / --fx-rx / --fx-ry custom properties.
 */
export function Spotlight({
  as = 'div',
  className = '',
  children,
  tilt = 0,
  shine = false,
  ...rest
}: Props) {
  const Tag = as as ComponentType<Record<string, unknown>>;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches) return;

    let raf = 0;
    let ev: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      if (!ev) return;
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width;
      const py = (ev.clientY - r.top) / r.height;
      el.style.setProperty('--fx-x', `${(px * r.width).toFixed(1)}px`);
      el.style.setProperty('--fx-y', `${(py * r.height).toFixed(1)}px`);
      if (tilt && !calm.matches) {
        el.style.setProperty('--fx-ry', `${((px - 0.5) * 2 * tilt).toFixed(2)}deg`);
        el.style.setProperty('--fx-rx', `${((0.5 - py) * 2 * tilt).toFixed(2)}deg`);
      }
    };
    const onMove = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = () => el.classList.add('is-hot');
    const onLeave = () => {
      el.classList.remove('is-hot');
      el.style.setProperty('--fx-rx', '0deg');
      el.style.setProperty('--fx-ry', '0deg');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [tilt]);

  return (
    <Tag ref={ref} className={`fx-spot ${tilt ? 'fx-spot--tilt' : ''} ${className}`} {...rest}>
      {children}
      {shine && <span className="fx-shine" aria-hidden="true" />}
    </Tag>
  );
}
