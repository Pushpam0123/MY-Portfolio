/**
 * Single GSAP registration point.
 *
 * Every plugin used here ships free under the standard GSAP licence as of
 * 3.13 — including ScrollSmoother and SplitText, which used to be Club-only.
 * That matters: the trial builds of those plugins log a console warning and
 * refuse to run on a deployed domain.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Observer, useGSAP);

/** Project-wide defaults so individual tweens stay terse. */
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

/** Matches the --e-out token, for animations that should feel like the CSS. */
export const EASE_OUT = 'expo.out';

/**
 * Dev-only handle for debugging from the console — e.g. settling every
 * in-flight animation with `__gsap.globalTimeline.progress(1)`. Also the only
 * way to inspect timeline state in a headless browser, where requestAnimationFrame
 * never fires and the ticker is therefore frozen. Stripped from production builds.
 */
if (import.meta.env.DEV) {
  (window as unknown as { __gsap?: typeof gsap }).__gsap = gsap;
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Observer, useGSAP };
