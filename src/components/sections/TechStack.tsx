import { lazy, Suspense, useState } from 'react';
import { skillGroups, techBalls } from '@/data/skills';
import { useInView } from '@/hooks/useInView';
import { useIsTouch, useReducedMotion } from '@/hooks/useMediaQuery';
import './TechStack.css';

/*
 * Rapier ships its physics engine as WebAssembly, and Three.js is already the
 * heaviest dependency here — neither belongs in the initial bundle for a section
 * most visitors reach only after scrolling past four others.
 */
const TechBalloons = lazy(() => import('@/three/TechBalloons'));

/**
 * The skill group whose entries are concepts rather than products, so none of
 * them has a brand mark to put on a sphere. Surfaced as text beneath the scene.
 */
const capabilities = skillGroups.find((g) => g.id === 'ai')!;

/** Any other group the spheres do not fully cover, for the screen-reader list. */
const logolessGroups = skillGroups.filter((g) => g.id !== 'ai');

/** Cheap capability probe; some GPUs and browsers have no WebGL context. */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

/**
 * Static fallback: the résumé's four skill groups as plain chips.
 *
 * Shown whenever the simulation should not run — reduced motion, or no WebGL.
 * It is the same information, just not interactive.
 */
function StaticStack() {
  return (
    <div className="stack__static">
      {skillGroups.map((group) => (
        <div className="stack__group" key={group.id}>
          <h3 className="stack__group-title mono-label">{group.title}</h3>
          <ul className="stack__chips">
            {group.items.map((item) => (
              <li className="stack__chip" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function TechStack() {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const [supported] = useState(hasWebGL);
  // `once` — the scene keeps its settled state instead of re-simulating from
  // scratch every time the section scrolls back into view.
  const { ref, inView } = useInView<HTMLElement>({ rootMargin: '500px', once: true });

  const interactive = supported && !reduced;

  return (
    <section className="section stack" id="stack" ref={ref}>
      <div className="stack__heading">
        <span className="mono-label stack__index">05</span>
        <h2 className="stack__title">My Tech Stack</h2>
      </div>

      {interactive ? (
        <div className="stack__stage">
          {inView && (
            <Suspense fallback={null}>
              <TechBalloons />
            </Suspense>
          )}

          <p className="stack__hint mono-label" aria-hidden="true">
            {isTouch ? 'Touch to push them around' : 'Move your cursor through them'}
          </p>
        </div>
      ) : (
        <div className="shell">
          <StaticStack />
        </div>
      )}

      {interactive && (
        <div className="shell stack__footer">
          {/*
            The spheres can only carry technologies that have a logo, which
            leaves out the AI and automation work — the most important part of
            this résumé. Listing those here keeps them on the visible page
            instead of hiding them behind a hover.
          */}
          <h3 className="stack__footer-title mono-label">{capabilities.title}</h3>
          <p className="stack__capabilities">
            {capabilities.items.map((item, i) => (
              <span key={item}>
                {item}
                {i < capabilities.items.length - 1 && (
                  <span className="stack__sep" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </p>

          {/*
            The canvas is pixels to assistive tech and crawlers, so everything it
            depicts is also stated as real text here.
          */}
          <ul className="sr-only">
            {techBalls.map((ball) => (
              <li key={ball.id}>{ball.name}</li>
            ))}
            {logolessGroups.flatMap((group) =>
              group.items.map((item) => <li key={`${group.id}-${item}`}>{item}</li>),
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
