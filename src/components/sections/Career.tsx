import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { timeline } from '@/data/experience';

const work = timeline.filter((entry) => entry.kind === 'work');
const education = timeline.filter((entry) => entry.kind === 'education');
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Career.css';

export function Career() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.fromTo(
        '.career__rail-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.career__list',
            start: 'top 62%',
            end: 'bottom 78%',
            scrub: 0.6,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>('.career__item').forEach((item) => {
        gsap.from(item, {
          y: 48,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: item, start: 'top 84%', once: true },
        });

        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => item.classList.toggle('is-active', self.isActive),
        });
      });
    },
    { dependencies: [reduced], scope: root },
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
          </div>

          {work.map((entry) => (
            <li className={`career__item career__item--${entry.kind}`} key={entry.id}>
              <span className="career__node" aria-hidden="true">
                {entry.current && <span className="career__node-pulse" />}
              </span>

              <div className="career__period">
                <span className="mono-label">{entry.period}</span>
                {entry.current && <span className="career__badge">Now</span>}
              </div>

              <div className="career__card">
                <div className="career__card-head">
                  <h3 className="career__org">{entry.org}</h3>
                  <p className="career__role">{entry.title}</p>
                  <p className="career__place mono-label">
                    {entry.location}
                    {entry.meta ? ` — ${entry.meta}` : ''}
                  </p>
                </div>

                <ul className="career__points">
                  {entry.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        {education.length > 0 && (
          <div className="career__edu">
            <h3 className="career__edu-heading mono-label">Education</h3>
            {education.map((entry) => (
              <div className="career__card career__edu-card" key={entry.id}>
                <div className="career__card-head">
                  <h4 className="career__org">{entry.org}</h4>
                  <p className="career__role">{entry.title}</p>
                  <p className="career__place mono-label">
                    {entry.period} — {entry.location}
                    {entry.meta ? ` — ${entry.meta}` : ''}
                  </p>
                </div>
                <ul className="career__points">
                  {entry.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
