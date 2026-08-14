import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { profile, stats } from '@/data/profile';
import { deskAvatar } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { Counter } from '@/components/ui/Counter';
import { useIsMobile, useReducedMotion } from '@/hooks/useMediaQuery';
import './About.css';

export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useGSAP(
    () => {
      if (reduced) return;

      // Copy reveals line by line as the pinned portrait holds beside it.
      const paragraphs = gsap.utils.toArray<HTMLElement>('.about__para');
      const splits = paragraphs.map(
        (p) => new SplitText(p, { type: 'lines', linesClass: 'about__line', mask: 'lines' }),
      );

      splits.forEach((split, i) => {
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.95,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: paragraphs[i],
            start: 'top 85%',
            once: true,
          },
        });
      });

      // Pin the portrait through the copy. Skipped on mobile, where the single
      // column makes pinning feel like the page has jammed.
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
        splits.forEach((s) => s.revert());
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
              <Picture
                image={deskAvatar}
                alt="Illustrated portrait of Pushpam Raj working at his desk"
                sizes="(max-width: 767px) 70vw, (max-width: 1023px) 46vw, 36vw"
                width={1024}
                height={1536}
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
                    <Counter
                      value={stat.value}
                      decimals={stat.decimals}
                      suffix={stat.suffix}
                    />
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
