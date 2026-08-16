/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface LoadingState {
  loading: boolean;
  ready: boolean;
  finish: () => void;
}

const LoadingContext = createContext<LoadingState | null>(null);

const SESSION_KEY = 'pr-intro-played';

const alreadyPlayed = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const rememberPlayed = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
};

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(() => !alreadyPlayed());
  const [ready, setReady] = useState(() => alreadyPlayed());

  const finish = useCallback(() => {
    rememberPlayed();
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
