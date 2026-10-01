import { useEffect, useRef } from 'react';
import './fx.css';

/**
 * Light beams that orbit the parent's border (conic-gradient + mask, angle driven by an
 * @property animation). The parent must be `position: relative` with a border-radius.
 * Animation pauses while off-screen.
 */
export function BorderBeam({
  duration = 7,
  className = '',
}: {
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? 'false' : 'true';
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`fx-beam ${className}`}
      style={{ ['--fx-beam-dur' as string]: `${duration}s` }}
      aria-hidden="true"
    >
      <span className="fx-beam__glow" />
      <span className="fx-beam__line" />
    </span>
  );
}
