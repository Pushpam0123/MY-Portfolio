import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { projects } from '@/data/projects';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Counter } from '@/components/ui/Counter';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { useReveal } from '@/hooks/useReveal';
import './Work.css';

export function Work() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useReveal(root);

  useGSAP(
    () => {
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>('.work__panel').forEach((panel) => {
        const media = panel.querySelector('.work__media-inner');

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
        <SectionHeading index="04" eyebrow="Work" title="Systems I designed and built.">
          <p className="lede">
            Four systems where the measurable outcome mattered more than the demo — each one open on
            GitHub.
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
              {}
              <div className="work__media" aria-hidden="true">
                <div className="work__media-inner">
                  <div className="work__media-glow" />
                  <span className="work__media-index">{project.index}</span>

                  <ol className="work__flow">
                    {project.pipeline.map((stage) => (
                      <li className="work__flow-step" key={stage}>
                        <span className="work__flow-dot" />
                        <span className="work__flow-label">{stage}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {}
                <ul className="work__media-stack">
                  {project.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>

              <div className="work__body">
                <div className="work__meta" data-reveal="up">
                  <span className="mono-label work__index">{project.index}</span>
                  <span className="mono-label">{project.year}</span>
                </div>

                <h3 className="work__title" data-reveal="up">
                  {project.title}
                </h3>

                {project.status && (
                  <p className="work__status" data-reveal="up">
                    <span className="work__status-dot" aria-hidden="true" />
                    {project.status}
                  </p>
                )}

                <p className="lede work__summary" data-reveal="up">
                  {project.summary}
                </p>

                <ul className="work__points" data-reveal="up">
                  {project.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                {}
                {project.metrics && (
                  <dl className="work__metrics" data-reveal="up">
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
                )}

                <ul className="work__chips" data-reveal="up">
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
                    data-reveal="up"
                  >
                    <span>View on GitHub</span>
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
