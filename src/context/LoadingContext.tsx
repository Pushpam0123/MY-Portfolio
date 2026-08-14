import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface LoadingState {
  /** True until the preloader has finished its exit animation. */
  loading: boolean;
  /** True once the intro is done — sections use this to trigger entrance tweens. */
  ready: boolean;
  finish: () => void;
}

const LoadingContext = createContext<LoadingState | null>(null);

/** The intro runs once per browser session, not on every route/refresh. */
const SESSION_KEY = 'pr-intro-played';

const alreadyPlayed = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    // Private-mode Safari throws on sessionStorage access. Play the intro.
    return false;
  }
};

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(() => !alreadyPlayed());
  const [ready, setReady] = useState(() => alreadyPlayed());

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* non-fatal */
    }
    setLoading(false);
    setReady(true);
  }, []);

  const value = useMemo(() => ({ loading, ready, finish }), [loading, ready, finish]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading(): LoadingState {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used inside <LoadingProvider>');
  return ctx;
}
