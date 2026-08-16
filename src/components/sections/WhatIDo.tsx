import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { services } from '@/data/skills';
import { faceAvatars } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './WhatIDo.css';

export function WhatIDo() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.from('.wid__card', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.wid__grid', start: 'top 78%', once: true },
      });
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className="section wid" id="services" ref={root}>
      <div className="shell">
        <SectionHeading index="02" eyebrow="What I Do" title="Three ways I move a team forward.">
          <p className="lede">
            The through-line is the same in each: find the slow, manual step and replace it with
            something measured, repeatable, and shipped.
          </p>
        </SectionHeading>

        <div className="wid__grid">
          {services.map((service, i) => (
            <article className="wid__card" key={service.id}>
              <div className="wid__card-glow" aria-hidden="true" />

              <div className="wid__face">
                <Picture
                  image={faceAvatars[i]}
                  alt=""
                  sizes="(max-width: 767px) 120px, 160px"
                  width={180}
                  height={180}
                />
              </div>

              <span className="mono-label wid__index">{service.index}</span>
              <h3 className="wid__title">{service.title}</h3>
              <p className="body-copy wid__desc">{service.description}</p>

              <ul className="wid__list">
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
