import { useSyncExternalStore } from 'react';

/**
 * Media query as reactive state.
 *
 * `useSyncExternalStore` rather than useState+useEffect: it reads the current
 * match during render, so the first paint is already correct instead of
 * flashing the desktop layout on mobile.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // SSR / prerender default
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTouch = () => useMediaQuery('(hover: none), (pointer: coarse)');
