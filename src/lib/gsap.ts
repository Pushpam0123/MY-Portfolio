import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Observer, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export const EASE_OUT = 'expo.out';

if (import.meta.env.DEV) {
  (window as unknown as { __gsap?: typeof gsap }).__gsap = gsap;
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Observer, useGSAP };
