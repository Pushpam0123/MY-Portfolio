import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useMediaQuery';

export function useParallaxLayers<T extends HTMLElement>() {
  const scope = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = scope.current;
    if (!root || reduced) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]')).map((el) => ({
      el,
      speed: Number(el.dataset.parallax) || 0,
      current: 0,
    }));
    if (layers.length === 0) return;

    let frame = 0;
    let running = true;

    const tick = () => {
      if (!running) return;

      const content = document.getElementById('smooth-content');
      const transform = content ? getComputedStyle(content).transform : 'none';
      let scrolled = window.scrollY;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrixReadOnly(transform);
        scrolled = -matrix.m42;
      }

      for (const layer of layers) {
        const next = scrolled * layer.speed;

        if (Math.abs(next - layer.current) > 0.05) {
          layer.current = next;
          layer.el.style.transform = `translate3d(0, ${next.toFixed(2)}px, 0)`;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      for (const layer of layers) layer.el.style.transform = '';
    };
  }, [reduced]);

  return scope;
}
