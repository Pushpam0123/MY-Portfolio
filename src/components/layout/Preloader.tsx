import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useLoading } from '@/context/LoadingContext';
import { profile } from '@/data/profile';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Preloader.css';

/**
 * Intro screen. The counter is driven by real progress: it tracks how many of
 * the page's images have settled, then eases the last stretch to 100 so a fast
 * cache hit still reads as a deliberate intro rather than a flash.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const { loading, finish } = useLoading();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!loading) return;
      document.body.dataset.loading = 'true';

      const progress = { value: 0 };
      const setCounter = () => setCount(Math.round(progress.value));

      // Real asset progress, polled against the document's images.
      const assetProgress = () => {
        const images = Array.from(document.images);
        if (images.length === 0) return 1;
        return images.filter((img) => img.complete).length / images.length;
      };

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.dataset.loading = 'false';
          finish();
          ScrollTrigger.refresh();
        },
      });

      if (reduced) {
        setCount(100);
        tl.to(root.current, { autoAlpha: 0, duration: 0.3 });
        return () => {
          tl.kill();
          document.body.dataset.loading = 'false';
        };
      }

      tl.to(progress, {
        value: 92,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          // Never run ahead of what has actually loaded by more than a nudge.
          progress.value = Math.min(progress.value, assetProgress() * 100 + 18);
          setCounter();
        },
      })
        .to(progress, {
          value: 100,
          duration: 0.55,
          ease: 'power2.out',
          onUpdate: setCounter,
        })
        .to('.preload__bar-fill', { scaleX: 1, duration: 0.4, ease: 'power2.out' }, '<')
        .to('.preload__word', {
          yPercent: -110,
          duration: 0.7,
          ease: 'expo.inOut',
          stagger: 0.06,
        })
        .to('.preload__meta', { autoAlpha: 0, duration: 0.35 }, '<')
        .to(
          root.current,
          { yPercent: -100, duration: 1, ease: 'expo.inOut' },
          '-=0.25',
        )
        .set(root.current, { autoAlpha: 0 });

      return () => {
        tl.kill();
        document.body.dataset.loading = 'false';
      };
    },
    { dependencies: [loading, reduced, finish], scope: root },
  );

  if (!loading) return null;

  return (
    <div className="preload" ref={root} role="status" aria-live="polite">
      <span className="sr-only">Loading portfolio, {count} percent</span>

      <div className="preload__center" aria-hidden="true">
        <div className="preload__name">
          <span className="preload__word-mask">
            <span className="preload__word">{profile.firstName}</span>
          </span>
          <span className="preload__word-mask">
            <span className="preload__word">{profile.lastName}</span>
          </span>
        </div>
      </div>

      <div className="preload__meta" aria-hidden="true">
        <span className="mono-label">{profile.role}</span>
        <div className="preload__bar">
          <div className="preload__bar-fill" />
        </div>
        <span className="preload__count">{String(count).padStart(3, '0')}</span>
      </div>
    </div>
  );
}
