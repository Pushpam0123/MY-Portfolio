import { lazy, Suspense, useRef, useState } from 'react';
import { gsap, ScrollSmoother, SplitText, useGSAP } from '@/lib/gsap';
import { profile } from '@/data/profile';
import { useLoading } from '@/context/LoadingContext';
import { useParallaxLayers } from '@/hooks/useParallaxLayers';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { StaticAvatar } from '@/components/ui/StaticAvatar';
import './Landing.css';

/*
 * Three.js is ~1 MB minified — by far the heaviest thing on the page, and the
 * hero must not wait on it. Loading the scene lazily keeps it out of the initial
 * bundle: the static portrait paints immediately and the WebGL version swaps in
 * once it arrives. Visitors on reduced motion or without WebGL never fetch it.
 */
const AvatarScene = lazy(() => import('@/three/AvatarScene'));

export function Landing() {
  const scope = useParallaxLayers<HTMLElement>();
  const inner = useRef<HTMLDivElement>(null);
  const { ready } = useLoading();
  const reduced = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);

  // Entrance — runs only after the preloader has handed over.
  useGSAP(
    () => {
      if (!ready) return;

      if (reduced) {
        gsap.set('[data-hero-fade]', { opacity: 1, y: 0 });
        return;
      }

      const title = inner.current!.querySelector<HTMLElement>('.hero__title');
      // aria: 'none' — the <h1> carries its own aria-label (below). Letting
      // SplitText derive one would announce "PushpamRaj", since the two line
      // spans concatenate without whitespace.
      const split = title
        ? new SplitText(title, { type: 'chars', charsClass: 'hero__char', aria: 'none' })
        : null;

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      if (split) {
        tl.from(split.chars, {
          yPercent: 118,
          duration: 1.15,
          stagger: { each: 0.028, from: 'start' },
        });
      }

      tl.from(
        '[data-hero-fade]',
        { opacity: 0, y: 26, duration: 0.9, stagger: 0.09 },
        split ? '-=0.75' : 0,
      ).from('.hero__visual', { opacity: 0, scale: 0.94, duration: 1.4 }, '-=1.1');

      return () => split?.revert();
    },
    { dependencies: [ready, reduced], scope: inner },
  );

  // Role rotator under the headline.
  //
  // Driven by a single repeating GSAP timeline rather than setInterval: the
  // ticker pauses with document visibility, whereas an interval keeps firing in
  // a hidden tab and would queue swaps that can never render.
  useGSAP(
    () => {
      if (!ready || reduced) return;
      const el = inner.current?.querySelector<HTMLElement>('.hero__role-value');
      if (!el) return;

      const tl = gsap.timeline({ repeat: -1 });
      // Long hold, quick swap — the label should read as settled text most of
      // the time rather than something perpetually in motion.
      tl.to({}, { duration: 3.2 })
        .to(el, { yPercent: -110, opacity: 0, duration: 0.34, ease: 'power3.in' })
        .call(() => setRoleIndex((i) => (i + 1) % profile.roles.length))
        .fromTo(
          el,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' },
        );

      return () => tl.kill();
    },
    { dependencies: [ready, reduced], scope: inner },
  );

  const scrollToWork = () => {
    const target = document.getElementById('work');
    if (!target) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(target, true, 'top 80px');
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="top" ref={scope}>
      {/* Slowest layer — the bloom barely moves, which sets the depth floor. */}
      <div className="hero__bloom" data-parallax="0.08" aria-hidden="true" />
      <div className="hero__grid-lines" aria-hidden="true" />

      <div className="shell hero__inner" ref={inner}>
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow" data-hero-fade data-parallax="0.14">
            {profile.location} — Available worldwide
          </p>

          {/* Each line is its own masked block: the char reveal slides up from
              behind it, and nowrap stops the name breaking mid-word. */}
          <h1 className="display hero__title" data-parallax="0.2" aria-label={profile.name}>
            <span className="hero__title-line" aria-hidden="true">
              {profile.firstName}
            </span>
            <span className="hero__title-line" aria-hidden="true">
              {profile.lastName}
            </span>
          </h1>

          <div className="hero__role" data-hero-fade data-parallax="0.3">
            <span className="mono-label hero__role-key">Currently</span>
            <span className="hero__role-window">
              <span className="hero__role-value">{profile.roles[roleIndex]}</span>
            </span>
          </div>

          <p className="lede hero__tagline" data-hero-fade data-parallax="0.36">
            {profile.tagline}
          </p>

          <div className="hero__actions" data-hero-fade data-parallax="0.44">
            <MagneticButton as="button" onClick={scrollToWork} data-cursor="link">
              View my work
              <span aria-hidden="true">↓</span>
            </MagneticButton>
            <MagneticButton
              as="a"
              variant="ghost"
              href={profile.resumePath}
              download
              data-cursor="link"
            >
              Download résumé
            </MagneticButton>
          </div>

          {profile.available && (
            <p className="hero__status" data-hero-fade data-parallax="0.5">
              <span className="hero__status-dot" aria-hidden="true" />
              {profile.availabilityLabel}
            </p>
          )}
        </div>

        {/* Fastest layer — the portrait lifts off the page as you scroll. */}
        <div className="hero__visual" data-parallax="0.24" data-cursor="drag">
          <div className="hero__visual-glow" aria-hidden="true" />
          {reduced ? (
            <StaticAvatar />
          ) : (
            <Suspense fallback={<StaticAvatar />}>
              <AvatarScene />
            </Suspense>
          )}
          <p className="hero__hint mono-label" aria-hidden="true">
            Move your cursor across the portrait
          </p>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="mono-label">Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
