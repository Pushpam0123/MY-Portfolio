import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { projects } from '@/data/projects';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Counter } from '@/components/ui/Counter';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { useReveal } from '@/hooks/useReveal';
import './Work.css';

const pad = (n: number) => String(n).padStart(2, '0');

export function Work() {
  const root = useRef<HTMLElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useReveal(root);

  useGSAP(
    () => {
      if (reduced) return;

      const mm = gsap.matchMedia();

      // ---- Desktop: pinned deck of cards -------------------------------------------------
      mm.add('(min-width: 1024px)', () => {
        const stack = root.current?.querySelector<HTMLElement>('.work__stack');
        const panels = gsap.utils.toArray<HTMLElement>('.work__panel', root.current);
        const hudEl = hud.current;
        if (!stack || panels.length === 0) return;

        const topOf = (i: number) => 88 + i * 14;
        const last = panels.length - 1;
        // Each card pins just below the one before it so the deck edges peek out.
        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: () => `top top+=${topOf(i)}`,
            endTrigger: stack,
            end: 'bottom bottom',
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });

          // Previous card recedes as the next one slides over it.
          if (i < last) {
            const inner = panel.querySelector('.work__panel-inner');
            gsap.to(inner, {
              scale: 0.9,
              filter: 'blur(3px) brightness(0.5)',
              ease: 'none',
              transformOrigin: '50% 0%',
              scrollTrigger: {
                trigger: panels[i + 1],
                start: 'top 92%',
                end: () => `top top+=${topOf(i + 1)}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          }

          // Plate wipes open as the card arrives.
          const plate = panel.querySelector('.work__media');
          if (plate) {
            gsap.fromTo(
              plate,
              { clipPath: 'inset(0% 0% 100% 0% round 24px)' },
              {
                clipPath: 'inset(0% 0% 0% 0% round 24px)',
                duration: 1.1,
                ease: 'expo.out',
                clearProps: 'clipPath',
                scrollTrigger: { trigger: panel, start: 'top 75%', once: true },
              },
            );
          }
        });

        // ---- Scroll-reactive marquee bands ----
        const bandTweens = panels.map((panel, i) => {
          const track = panel.querySelector('.work__band-track');
          return gsap.fromTo(
            track,
            { xPercent: i % 2 ? -50 : 0 },
            { xPercent: i % 2 ? 0 : -50, duration: 28, ease: 'none', repeat: -1 },
          );
        });
        ScrollTrigger.create({
          trigger: stack,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 350);
            bandTweens.forEach((t) => {
              gsap.to(t, { timeScale: 1 + Math.abs(boost) * 2.5, duration: 0.2, overwrite: true });
              gsap.to(t, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
            });
          },
        });

        // ---- Progress HUD ----
        const count = hudEl?.querySelector<HTMLElement>('.work-hud__cur');
        const name = hudEl?.querySelector<HTMLElement>('.work-hud__name');
        const fill = hudEl?.querySelector<HTMLElement>('.work-hud__fill');
        let active = -1;
        const setActive = (i: number) => {
          if (i === active || !hudEl || !count || !name) return;
          active = i;
          gsap
            .timeline({ defaults: { duration: 0.25, ease: 'power3.out' } })
            .to([count, name], { yPercent: -60, opacity: 0, duration: 0.14 })
            .add(() => {
              count.textContent = pad(i + 1);
              name.textContent = projects[i].title.split(': ')[0];
              hudEl.style.setProperty('--hud-accent', projects[i].accent);
            })
            .fromTo([count, name], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1 });
        };

        if (hudEl && fill) {
          gsap.set(hudEl, { autoAlpha: 0, y: 20 });
          ScrollTrigger.create({
            trigger: stack,
            start: 'top 40%',
            end: 'bottom 85%',
            onToggle: (self) =>
              gsap.to(hudEl, {
                autoAlpha: self.isActive ? 1 : 0,
                y: self.isActive ? 0 : 20,
                duration: 0.4,
                overwrite: true,
              }),
          });
          gsap.fromTo(
            fill,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: { trigger: stack, start: 'top 40%', end: 'bottom 85%', scrub: true },
            },
          );
          panels.forEach((panel, i) =>
            ScrollTrigger.create({
              trigger: panel,
              start: 'top 60%',
              onEnter: () => setActive(i),
              onLeaveBack: () => setActive(Math.max(0, i - 1)),
            }),
          );
        }

        // ---- Spotlight + tilt (fine pointers only) ----
        const cleanups: Array<() => void> = [];
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          panels.forEach((panel) => {
            const media = panel.querySelector<HTMLElement>('.work__media');
            const rx = media
              ? gsap.quickTo(media, 'rotationX', { duration: 0.6, ease: 'power3' })
              : null;
            const ry = media
              ? gsap.quickTo(media, 'rotationY', { duration: 0.6, ease: 'power3' })
              : null;
            const move = (e: PointerEvent) => {
              const r = panel.getBoundingClientRect();
              panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
              panel.style.setProperty('--my', `${e.clientY - r.top}px`);
              if (media && rx && ry) {
                const m = media.getBoundingClientRect();
                const nx = (e.clientX - (m.left + m.width / 2)) / (m.width / 2);
                const ny = (e.clientY - (m.top + m.height / 2)) / (m.height / 2);
                ry(gsap.utils.clamp(-1, 1, nx) * 9);
                rx(gsap.utils.clamp(-1, 1, ny) * -9);
              }
            };
            const enter = () => panel.classList.add('is-hot');
            const leave = () => {
              panel.classList.remove('is-hot');
              rx?.(0);
              ry?.(0);
            };
            panel.addEventListener('pointermove', move);
            panel.addEventListener('pointerenter', enter);
            panel.addEventListener('pointerleave', leave);
            cleanups.push(() => {
              panel.removeEventListener('pointermove', move);
              panel.removeEventListener('pointerenter', enter);
              panel.removeEventListener('pointerleave', leave);
            });
          });
        }

        return () => {
          cleanups.forEach((fn) => fn());
          if (hudEl) gsap.set(hudEl, { clearProps: 'all' });
        };
      });

      return () => mm.revert();
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className="section work" id="work" ref={root}>
      <div className="shell">
        <SectionHeading index="04" eyebrow="Work" title="Systems I designed and built.">
          <p className="lede">
            Four of the 10+ projects I've shipped, picked because the measurable outcome mattered more
            than the demo. Each one is open on GitHub.
          </p>
        </SectionHeading>
      </div>

      <div className="shell work__stack">
        {projects.map((project) => (
          <article
            className="work__panel"
            key={project.id}
            style={{ '--panel-accent': project.accent } as React.CSSProperties}
          >
            <div className="work__panel-inner">
              <div className="work__spot" aria-hidden="true" />
              <div className="work__band" aria-hidden="true">
                <div className="work__band-track">
                  {[0, 1].map((half) => (
                    <div className="work__band-half" key={half}>
                      {Array.from({ length: 4 }, (_, k) => (
                        <span className="work__band-item" key={k}>
                          <span className={k % 2 ? 'is-solid' : 'is-outline'}>
                            {project.id.toUpperCase()}
                          </span>
                          <i>✦</i>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <span className="work__num" aria-hidden="true">
                {project.index}
              </span>

              <div className="work__body">
                <div className="work__meta" data-reveal="up">
                  <span className="mono-label work__index">
                    {project.index} / {pad(projects.length)}
                  </span>
                  <span className="mono-label">{project.year}</span>
                  {project.status && (
                    <span className="work__status">
                      <span className="work__status-dot" aria-hidden="true" />
                      {project.status}
                    </span>
                  )}
                </div>

                <h3 className="work__title" data-reveal="up">
                  {project.title}
                </h3>

                <p className="lede work__summary" data-reveal="up">
                  {project.summary}
                </p>

                <ul className="work__points" data-reveal="up">
                  {project.points.map((point, i) => (
                    <li key={i}>{point}</li>
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

              <div className="work__side">
                <div className="work__stage">
                  <div className="work__media" aria-hidden="true">
                    <div className="work__media-inner">
                      <div className="work__media-glow" />
                      <ol className="work__flow">
                        {project.pipeline.map((stage) => (
                          <li className="work__flow-step" key={stage}>
                            <span className="work__flow-dot" />
                            <span className="work__flow-label">{stage}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

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
              </div>
            </div>
          </article>
        ))}
      </div>

      {createPortal(
        <div className="work-hud" ref={hud} aria-hidden="true">
          <span className="work-hud__label">Work</span>
          <span className="work-hud__count">
            <span className="work-hud__cur">01</span>
            <span className="work-hud__sep"> / {pad(projects.length)}</span>
          </span>
          <span className="work-hud__bar">
            <span className="work-hud__fill" />
          </span>
          <span className="work-hud__name">{projects[0].title.split(': ')[0]}</span>
        </div>,
        document.body,
      )}
    </section>
  );
}
