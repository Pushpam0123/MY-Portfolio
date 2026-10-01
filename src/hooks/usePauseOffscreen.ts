import { useEffect, useRef } from 'react';

/** Pauses every CSS loop under `root` (via [data-paused]) while it is off-screen. */
export function usePauseOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? 'false' : 'true';
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
