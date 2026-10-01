import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { profile, stats } from '@/data/profile';
import { DeskVideo } from '@/components/ui/DeskVideo';
import { Counter } from '@/components/ui/Counter';
import { useSplitReveal } from '@/hooks/useSplitReveal';
import { useIsMobile, useReducedMotion } from '@/hooks/useMediaQuery';
import './About.css';

export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useSplitReveal(root, {
    selector: '.about__title, .about__para',
    linesClass: 'about__line',
    start: 'top 85%',
    stagger: 0.07,
    yPercent: 110,
  });

  useGSAP(
    () => {
      if (reduced) return;

      let pin: ScrollTrigger | undefined;
      if (!isMobile) {
        pin = ScrollTrigger.create({
          trigger: '.about__grid',
          start: 'top 18%',
          end: 'bottom 88%',
          pin: '.about__visual',
          pinSpacing: false,
        });
      }

      gsap.to('.about__portrait', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about__grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      return () => {
        pin?.kill();
      };
    },
    { dependencies: [reduced, isMobile], scope: root },
  );

  return (
    <section className="section about" id="about" ref={root}>
      <div className="bloom about__bloom" aria-hidden="true" />

      <div className="shell">
        <div className="about__grid">
          <div className="about__visual">
            <div className="about__portrait">
              <DeskVideo
                alt="Illustrated portrait of Pushpam Raj working at his desk"
                sizes="(max-width: 767px) 70vw, (max-width: 1023px) 46vw, 36vw"
              />
            </div>
            <p className="mono-label about__caption">Currently — Silicofeller Quantum</p>
          </div>

          <div className="about__body">
            <div className="about__meta">
              <span className="mono-label">01</span>
              <span className="eyebrow">About</span>
            </div>

            <h2 className="section-title about__title">
              Turning research ideas into systems that ship.
            </h2>

            {profile.about.map((paragraph, i) => (
              <p className="body-copy about__para" key={i}>
                {paragraph}
              </p>
            ))}

            <dl className="about__stats">
              {stats.map((stat) => (
                <div className="about__stat" key={stat.label}>
                  <dt className="about__stat-value">
                    <Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                  </dt>
                  <dd className="about__stat-label mono-label">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
