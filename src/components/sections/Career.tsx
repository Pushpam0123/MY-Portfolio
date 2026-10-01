import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { timeline } from '@/data/experience';

const work = timeline.filter((entry) => entry.kind === 'work');
const education = timeline.filter((entry) => entry.kind === 'education');
import { Spotlight } from '@/components/fx/Spotlight';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useIsTouch, useReducedMotion } from '@/hooks/useMediaQuery';
import { useReveal } from '@/hooks/useReveal';
import './Career.css';

export function Career() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const smooth = !useIsTouch() && !reduced; // same rule as Smoother.tsx

  useReveal(root);

  useGSAP(
    () => {
      if (reduced) return;

      // Rail fill + travelling light dot share one scrubbed timeline.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.career__list',
            start: 'top 62%',
            end: 'bottom 78%',
            scrub: smooth ? true : 0.5,
          },
        })
        .fromTo('.career__rail-fill', { scaleY: 0 }, { scaleY: 1 }, 0)
        .fromTo('.career__rail-dot', { top: '0%' }, { top: '100%' }, 0);

      // Ghost year drifts as each card passes.
      gsap.utils.toArray<HTMLElement>('.career__ghost').forEach((ghost) => {
        gsap.fromTo(
          ghost,
          { yPercent: -18, xPercent: 6 },
          {
            yPercent: 18,
            xPercent: -4,
            ease: 'none',
            scrollTrigger: {
              trigger: ghost.closest('.career__card'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: smooth ? true : 0.5,
            },
          },
        );
      });

      // Education: line draws, card unmasks, points follow.
      const edu = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: '.career__edu', start: 'top 80%', once: true },
      });
      edu
        .fromTo('.career__edu', { '--edu-line': 0 }, { '--edu-line': 1, duration: 1.4 }, 0)
        .fromTo(
          '.career__edu-card',
          { clipPath: 'inset(0 100% 0 0 round 20px)', opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0 round 20px)',
            opacity: 1,
            duration: 1.3,
            clearProps: 'clipPath,opacity',
          },
          0.15,
        )
        .from(
          '.career__edu-card .career__points li',
          { opacity: 0, x: -24, duration: 0.8, stagger: 0.1, clearProps: 'transform,opacity' },
          0.7,
        );

      gsap.utils.toArray<HTMLElement>('.career__item').forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => item.classList.toggle('is-active', self.isActive),
        });
      });
    },
    { dependencies: [reduced, smooth], scope: root },
  );

  return (
    <section className="section career" id="career" ref={root}>
      <div className="shell">
        <SectionHeading index="03" eyebrow="Career" title="Where I've built things.">
          <p className="lede">
            Two engineering roles so far, most recent first. Education is listed separately below.
          </p>
        </SectionHeading>

        <ol className="career__list">
          <div className="career__rail" aria-hidden="true">
            <span className="career__rail-fill" />
            <span className="career__rail-dot" />
          </div>

          {work.map((entry) => (
            <li
              className={`career__item career__item--${entry.kind}`}
              data-reveal="up"
              key={entry.id}
            >
              <span className="career__node" aria-hidden="true">
                {entry.current && <span className="career__node-pulse" />}
              </span>

              <div className="career__period">
                <span className="mono-label">{entry.period}</span>
                {entry.current && <span className="career__badge">Now</span>}
              </div>

              <Spotlight className="career__card">
                <span className="career__ghost" aria-hidden="true">
                  {entry.period.match(/\d{4}/)?.[0]}
                </span>
                <div className="career__card-head">
                  <h3 className="career__org">{entry.org}</h3>
                  <p className="career__role">{entry.title}</p>
                  <p className="career__place mono-label">
                    {entry.location}
                    {entry.meta ? ` · ${entry.meta}` : ''}
                  </p>
                </div>

                <ul className="career__points">
                  {entry.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </Spotlight>
            </li>
          ))}
        </ol>

        {education.length > 0 && (
          <div className="career__edu">
            <h3 className="career__edu-heading mono-label" data-reveal="up">
              Education
            </h3>
            {education.map((entry) => (
              <Spotlight className="career__card career__edu-card" key={entry.id}>
                <span className="career__ghost" aria-hidden="true">
                  {entry.period.match(/\d{4}/g)?.[1] ?? entry.period.match(/\d{4}/)?.[0]}
                </span>
                <div className="career__card-head">
                  <h4 className="career__org">{entry.org}</h4>
                  <p className="career__role">{entry.title}</p>
                  <p className="career__place mono-label">
                    {entry.period} · {entry.location}
                    {entry.meta ? ` · ${entry.meta}` : ''}
                  </p>
                </div>
                <ul className="career__points">
                  {entry.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </Spotlight>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
