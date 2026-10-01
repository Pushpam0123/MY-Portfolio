import { lazy, Suspense, useRef, useState } from 'react';
import { gsap, ScrollSmoother, SplitText, useGSAP } from '@/lib/gsap';
import { profile } from '@/data/profile';
import { useLoading } from '@/context/LoadingContext';
import { useParallaxLayers } from '@/hooks/useParallaxLayers';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { StaticAvatar } from '@/components/ui/StaticAvatar';
import { BorderBeam } from '@/components/fx/BorderBeam';
import { HeroAura, HeroAurora } from '@/components/hero/HeroFx';
import { usePauseOffscreen } from '@/hooks/usePauseOffscreen';
import './Landing.css';

const AvatarScene = lazy(() => import('@/three/AvatarScene'));

export function Landing() {
  const scope = useParallaxLayers<HTMLElement>();
  const pauseRef = usePauseOffscreen<HTMLElement>();
  const setRefs = (node: HTMLElement | null) => {
    (scope as { current: HTMLElement | null }).current = node;
    (pauseRef as { current: HTMLElement | null }).current = node;
  };
  const inner = useRef<HTMLDivElement>(null);
  const { ready } = useLoading();
  const reduced = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);

  useGSAP(
    () => {
      if (!ready) return;

      if (reduced) {
        gsap.set('[data-hero-fade]', { opacity: 1, y: 0 });
        return;
      }

      const title = inner.current!.querySelector<HTMLElement>('.hero__title');

      const split = title
        ? new SplitText(title, { type: 'chars', charsClass: 'hero__char', aria: 'none' })
        : null;

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      if (split && title) {
        // Per-character offset so one shared --hfx-shine sweep reads as a single light pass.
        const origin = title.getBoundingClientRect().left;
        split.chars.forEach((c) => {
          const el = c as HTMLElement;
          const line = el.closest<HTMLElement>('.hero__title-line');
          const left = line ? line.getBoundingClientRect().left : origin;
          el.style.setProperty('--ox', `${el.offsetLeft + (left - origin)}px`);
        });
        title.style.setProperty('--hfx-end', `${title.offsetWidth + 320}px`);
        tl.call(() => title.classList.add('is-shining'), [], 1.6);
      }

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

      return () => {
        title?.classList.remove('is-shining');
        split?.revert();
      };
    },
    { dependencies: [ready, reduced], scope: inner },
  );

  useGSAP(
    () => {
      if (!ready || reduced) return;
      const el = inner.current?.querySelector<HTMLElement>('.hero__role-value');
      if (!el) return;

      const tl = gsap.timeline({ repeat: -1 });

      tl.set(el, { yPercent: 0, opacity: 1 })
        .to({}, { duration: 3.2 })
        .to(el, { yPercent: -110, opacity: 0, duration: 0.34, ease: 'power3.in' })
        .call(() => setRoleIndex((i) => (i + 1) % profile.roles.length))
        .fromTo(
          el,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.45,
            ease: 'expo.out',
            immediateRender: false,
          },
        );

      return () => tl.kill();
    },
    { dependencies: [ready, reduced], scope: inner },
  );

  const visual = useRef<HTMLDivElement>(null);
  const onVisualMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = visual.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--hx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--hy', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    el.dataset.hover = 'true';
  };
  const onVisualLeave = () => {
    const el = visual.current;
    if (!el) return;
    el.style.setProperty('--hx', '0');
    el.style.setProperty('--hy', '0');
    el.dataset.hover = 'false';
  };

  const scrollToWork = () => {
    const target = document.getElementById('work');
    if (!target) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(target, true, 'top 80px');
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="top" ref={setRefs}>
      <HeroAurora />
      <div className="hero__bloom" data-parallax="0.08" aria-hidden="true" />
      <div className="hero__grid-lines" aria-hidden="true" />

      <div className="shell hero__inner" ref={inner}>
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow" data-hero-fade data-parallax="0.14">
            {profile.location} · Available worldwide
          </p>

          {}
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
            <span className="hero__cta">
              <MagneticButton as="button" onClick={scrollToWork} data-cursor="link">
                View my work
                <span aria-hidden="true">↓</span>
              </MagneticButton>
              <BorderBeam duration={5} />
            </span>
            <MagneticButton
              as="a"
              variant="ghost"
              href={profile.resumePath}
              download
              data-cursor="link"
            >
              Download resume
            </MagneticButton>
          </div>

          {profile.available && (
            <p className="hero__status" data-hero-fade data-parallax="0.5">
              <span className="hero__status-dot" aria-hidden="true" />
              {profile.availabilityLabel}
            </p>
          )}
        </div>

        {}
        <div
          className="hero__visual"
          data-parallax="0.24"
          data-cursor="drag"
          ref={visual}
          onPointerMove={onVisualMove}
          onPointerLeave={onVisualLeave}
        >
          <div className="hero__visual-glow" aria-hidden="true" />
          <HeroAura />
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
