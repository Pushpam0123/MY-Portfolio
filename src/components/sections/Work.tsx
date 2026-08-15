import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { projects } from '@/data/projects';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Counter } from '@/components/ui/Counter';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Work.css';

export function Work() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>('.work__panel').forEach((panel) => {
        const media = panel.querySelector('.work__media-inner');

        gsap.from(panel.querySelectorAll('[data-work-reveal]'), {
          y: 42,
          opacity: 0,
          duration: 0.95,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: panel, start: 'top 74%', once: true },
        });

        // Slow counter-scroll on the panel art, for depth against the copy.
        if (media) {
          gsap.fromTo(
            media,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          );
        }
      });
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className="section work" id="work" ref={root}>
      <div className="shell">
        <SectionHeading index="04" eyebrow="Work" title="Systems I designed and shipped.">
          <p className="lede">
            Two projects where the measurable outcome mattered more than the demo.
          </p>
        </SectionHeading>
      </div>

      <div className="work__panels">
        {projects.map((project) => (
          <article
            className="work__panel"
            key={project.id}
            style={{ '--panel-accent': project.accent } as React.CSSProperties}
          >
            <div className="shell work__panel-inner">
              <div className="work__media" aria-hidden="true">
                <div className="work__media-inner">
                  <span className="work__media-index">{project.index}</span>
                  <div className="work__media-glow" />
                  <ul className="work__media-stack">
                    {project.stack.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="work__body">
                <div className="work__meta" data-work-reveal>
                  <span className="mono-label work__index">{project.index}</span>
                  <span className="mono-label">{project.year}</span>
                </div>

                <h3 className="work__title" data-work-reveal>
                  {project.title}
                </h3>

                <p className="lede work__summary" data-work-reveal>
                  {project.summary}
                </p>

                <ul className="work__points" data-work-reveal>
                  {project.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <dl className="work__metrics" data-work-reveal>
                  {project.metrics.map((metric) => (
                    <div className="work__metric" key={metric.label}>
                      <dt className="work__metric-value">
                        <Counter
                          value={metric.value}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </dt>
                      <dd className="work__metric-label mono-label">{metric.label}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="work__chips" data-work-reveal>
                  {project.stack.map((tech) => (
                    <li className="work__chip" key={tech}>
                      {tech}
                    </li>
                  ))}
                </ul>

                {project.repo && (
                  <a
                    className="work__link"
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="link"
                    data-work-reveal
                  >
                    <span>{project.repoLabel ?? 'View on GitHub'}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
