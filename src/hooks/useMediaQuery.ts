import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
/** Below this width the two-column section layouts collapse to one column. */
export const useIsSingleColumn = () => useMediaQuery('(max-width: 1023px)');
export const useIsTouch = () => useMediaQuery('(hover: none), (pointer: coarse)');
