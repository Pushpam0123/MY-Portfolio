import { useRef } from 'react';
import { gsap, Observer, useGSAP } from '@/lib/gsap';
import { skillGroups } from '@/data/skills';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './TechStack.css';

/**
 * How many times to repeat a group's items inside one loop half.
 *
 * A half must exceed the widest realistic viewport, otherwise the -50% wrap
 * leaves empty space at the end of the rail. Chips average roughly 150px, so
 * ~14 chips comfortably clears a 2000px screen.
 */
const repeatsFor = (count: number) => Math.max(1, Math.ceil(14 / count));

export function TechStack() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      // Each rail is a seamless loop: the track holds two copies of the chips,
      // so animating it exactly -50% and wrapping is invisible.
      const loops = gsap.utils.toArray<HTMLElement>('.stack__track').map((track) => {
        const direction = track.dataset.direction === 'right' ? 1 : -1;
        return gsap.to(track, {
          xPercent: direction === -1 ? -50 : 0,
          x: 0,
          ease: 'none',
          duration: 26,
          repeat: -1,
          startAt: { xPercent: direction === -1 ? 0 : -50 },
        });
      });

      // Scroll velocity nudges the rails faster and can briefly reverse them.
      let settleTimer = 0;
      const observer = Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const boost = gsap.utils.clamp(-6, 6, self.velocityY / 320);
          loops.forEach((loop, i) => {
            const sign = skillGroups[i]?.direction === 'right' ? -1 : 1;
            gsap.to(loop, {
              timeScale: gsap.utils.clamp(-8, 8, 1 + boost * sign),
              duration: 0.4,
              overwrite: true,
            });
          });

          // Ease back to the resting speed once scrolling stops.
          window.clearTimeout(settleTimer);
          settleTimer = window.setTimeout(() => {
            loops.forEach((loop) => gsap.to(loop, { timeScale: 1, duration: 0.9 }));
          }, 220);
        },
      });

      return () => {
        window.clearTimeout(settleTimer);
        observer.kill();
        loops.forEach((loop) => loop.kill());
      };
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className="section stack" id="stack" ref={root}>
      <div className="shell">
        <SectionHeading index="05" eyebrow="Stack" title="The tools I reach for." />
      </div>

      <div className="stack__rails">
        {skillGroups.map((group) => (
          <div className="stack__group" key={group.id}>
            <h3 className="stack__group-title mono-label">{group.title}</h3>

            <div className="stack__rail">
              <ul className="stack__track" data-direction={group.direction}>
                {/*
                 * The loop animates the track by exactly -50%, so it must hold
                 * two identical halves — and each half has to be wider than the
                 * viewport or a gap appears at the wrap. Short groups therefore
                 * repeat their items within a half. Only the first half is
                 * exposed to assistive tech; the rest is decorative duplication.
                 */}
                {Array.from({ length: 2 }).flatMap((_, half) =>
                  Array.from({ length: repeatsFor(group.items.length) }).flatMap((__, rep) =>
                    group.items.map((item) => (
                      <li
                        className="stack__chip"
                        key={`${half}-${rep}-${item}`}
                        aria-hidden={half === 0 && rep === 0 ? undefined : 'true'}
                      >
                        {item}
                      </li>
                    )),
                  ),
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
