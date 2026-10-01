import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { profile, stats } from '@/data/profile';
import { DeskVideo } from '@/components/ui/DeskVideo';
import { Counter } from '@/components/ui/Counter';
import { BorderBeam } from '@/components/fx/BorderBeam';
import { Spotlight } from '@/components/fx/Spotlight';
import { achievements } from '@/data/credentials';
import { useSplitReveal } from '@/hooks/useSplitReveal';
import { useIsTouch, useReducedMotion } from '@/hooks/useMediaQuery';
import './About.css';

const contributions = parseInt(achievements.find((a) => a.id === 'open-source')?.title ?? '0', 10);
const cgpa = stats.find((s) => s.label.includes('CGPA'));
const accuracy = stats.find((s) => s.label.includes('accuracy'));
const shipped = stats.find((s) => s.label === 'Projects shipped');
const certs = stats.find((s) => s.label === 'Certifications');

export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const smooth = !isTouch && !reduced; // same rule as Smoother.tsx

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

      // No pin on the portrait: a pinned, constantly re-transformed layer under the glow effects
      // could intermittently drop out of compositing and vanish mid-scroll.
      gsap.fromTo(
        '.about__portrait-inner',
        { yPercent: -7, scale: 1.14 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: {
            trigger: '.about__grid',
            start: 'top bottom',
            end: 'bottom top',
            scrub: smooth ? true : 0.5,
          },
        },
      );

      gsap.to('.about__portrait', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about__grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: smooth ? true : 0.5,
        },
      });

      gsap.from('.about__tile', {
        opacity: 0,
        y: 46,
        scale: 0.92,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.09,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.about__bento', start: 'top 86%', once: true },
      });

    },
    { dependencies: [reduced, smooth], scope: root },
  );

  return (
    <section className="section about" id="about" ref={root}>
      <div className="bloom about__bloom" aria-hidden="true" />

      <div className="shell">
        <div className="about__grid">
          <div className="about__visual">
            <div className="about__float">
              <div className="about__portrait">
                <div className="about__portrait-inner">
                  <DeskVideo
                    alt="Illustrated portrait of Pushpam Raj working at his desk"
                    sizes="(max-width: 767px) 70vw, (max-width: 1023px) 46vw, 36vw"
                  />
                </div>
                <BorderBeam duration={6} />
              </div>
            </div>
            <p className="mono-label about__caption">Currently at Silicofeller Quantum</p>
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

          </div>
        </div>

        <div className="about__bento">
          <Spotlight className="about__tile about__tile--hero">
            <BorderBeam duration={8} />
            <span className="about__tile-glyph" aria-hidden="true">
              {'</>'}
            </span>
            <p className="about__tile-value">
              <Counter value={contributions} suffix="+" duration={2.2} />
            </p>
            <p className="about__tile-label mono-label">Open-source contributions this year</p>
          </Spotlight>

          <Spotlight className="about__tile about__tile--w2">
            <p className="about__tile-value">
              <Counter value={shipped?.value ?? 0} suffix={shipped?.suffix} />
            </p>
            <span className="about__tile-ghost" aria-hidden="true">
              //
            </span>
            <p className="about__tile-label mono-label">Projects shipped</p>
          </Spotlight>

          <Spotlight className="about__tile about__tile--w2">
            <p className="about__tile-value">
              <Counter value={certs?.value ?? 0} />
            </p>
            <span className="about__tile-ghost" aria-hidden="true">
              ✓
            </span>
            <p className="about__tile-label mono-label">Certifications</p>
          </Spotlight>

          {cgpa && (
            <Spotlight className="about__tile about__tile--w2">
              <p className="about__tile-value">
                <Counter value={cgpa.value} decimals={cgpa.decimals} />
              </p>
              <span className="about__tile-ghost" aria-hidden="true">
                GPA
              </span>
              <p className="about__tile-label mono-label">{cgpa.label}</p>
            </Spotlight>
          )}

          {accuracy && (
            <Spotlight className="about__tile about__tile--w3">
              <p className="about__tile-value">
                <Counter value={accuracy.value} suffix={accuracy.suffix} />
              </p>
              <span className="about__tile-ghost" aria-hidden="true">
                %
              </span>
              <p className="about__tile-label mono-label">{accuracy.label}</p>
            </Spotlight>
          )}

          <Spotlight className="about__tile about__tile--now about__tile--w3">
            <span className="about__live" aria-hidden="true">
              <i />
            </span>
            <p className="about__now-label mono-label">Currently</p>
            <p className="about__now-value">@ Silicofeller Quantum</p>
          </Spotlight>
        </div>
      </div>
    </section>
  );
}
