import { lazy, Suspense, useCallback, useState } from 'react';
import { skillGroups, techBalls } from '@/data/skills';
import { useInView } from '@/hooks/useInView';
import { useIsTouch, useReducedMotion } from '@/hooks/useMediaQuery';
import './TechStack.css';

const TechBalloons = lazy(() => import('@/three/TechBalloons'));

const capabilities = skillGroups.find((g) => g.id === 'ai')!;

const logolessGroups = skillGroups.filter((g) => g.id !== 'ai');

const ballGroups = skillGroups
  .map((group) => ({
    id: group.id,
    title: group.title,
    count: techBalls.filter((ball) => ball.group === group.id).length,
  }))
  .filter((group) => group.count > 0);

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
  const [focused, setFocused] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  const { ref, inView } = useInView<HTMLElement>({ rootMargin: '500px', once: true });

  const { ref: stageRef, inView: onScreen } = useInView<HTMLDivElement>({
    rootMargin: '-20% 0px',
    once: true,
  });

  const interactive = supported && !reduced;

  const handleFocus = useCallback((name: string | null) => setFocused(name), []);

  return (
    <section className="section stack" id="stack" ref={ref}>
      <div className="stack__heading">
        <span className="mono-label stack__index">05</span>
        <h2 className="stack__title">My Tech Stack</h2>
      </div>

      {interactive ? (
        <div className="stack__stage" ref={stageRef}>
          {inView && (
            <Suspense fallback={null}>
              <TechBalloons start={onScreen} highlight={highlight} onFocus={handleFocus} />
            </Suspense>
          )}
        </div>
      ) : (
        <div className="shell">
          <StaticStack />
        </div>
      )}

      {interactive && (
        <div className="shell stack__footer">
          {}
          <p className={`stack__hint mono-label${focused ? ' is-focused' : ''}`} aria-hidden="true">
            {focused ?? (isTouch ? 'Touch to push them around' : 'Move your cursor through them')}
          </p>

          <ul className="stack__legend">
            {ballGroups.map((group) => (
              <li key={group.id}>
                <button
                  type="button"
                  className={
                    highlight === group.id ? 'stack__legend-item is-active' : 'stack__legend-item'
                  }
                  aria-pressed={highlight === group.id}
                  data-cursor="link"
                  onPointerEnter={() => setHighlight(group.id)}
                  onPointerLeave={() => setHighlight(null)}
                  onFocus={() => setHighlight(group.id)}
                  onBlur={() => setHighlight(null)}
                  onClick={() =>
                    setHighlight((current) => (current === group.id ? null : group.id))
                  }
                >
                  <span className="stack__legend-count">{group.count}</span>
                  <span>{group.title}</span>
                </button>
              </li>
            ))}
          </ul>

          {}
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

          {}
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
