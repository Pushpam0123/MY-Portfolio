/** Single source for JS motion values. CSS counterparts live in styles/tokens.css. */
export const EASE = {
  reveal: 'expo.out',
  ui: 'power3.out',
  move: 'power3.inOut',
} as const;

export const DUR = { press: 0.14, fast: 0.22, mid: 0.45, reveal: 0.9, fade: 0.35 } as const;
export const STAGGER = { tight: 0.05, base: 0.08, loose: 0.12 } as const;
export const REVEAL_START = 'top 86%';

/** Offsets (px) for `data-reveal` variants. */
export const REVEAL_FROM = {
  up: { y: 40 },
  left: { x: -28 },
  fade: {},
} as const;

export type RevealVariant = keyof typeof REVEAL_FROM;
