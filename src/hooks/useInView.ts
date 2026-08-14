import { useEffect, useRef, useState } from 'react';

/**
 * Reports whether the element is near the viewport.
 *
 * Used to gate expensive scenes: a physics simulation has no business stepping
 * while it is three screens away. `rootMargin` gives the scene a head start so
 * it is already warm by the time it scrolls into view.
 *
 * Once `once` is set the hook latches on first entry — for content that should
 * not tear down and re-initialise every time it scrolls past.
 */
export function useInView<T extends HTMLElement>(
  { rootMargin = '400px', once = false }: { rootMargin?: string; once?: boolean } = {},
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true); // no support: show it rather than hide it forever
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return { ref, inView };
}
