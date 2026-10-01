import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { BorderBeam } from '@/components/fx/BorderBeam';
import { Spotlight } from '@/components/fx/Spotlight';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { services } from '@/data/skills';
import { ServiceGlyph } from '@/components/ui/ServiceGlyph';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReveal } from '@/hooks/useReveal';
import './WhatIDo.css';

export function WhatIDo() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(root);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>('.wid__card').forEach((card) => {
        gsap.from(card.querySelectorAll('.wid__list li'), {
          opacity: 0,
          x: -34,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.11,
          delay: 0.25,
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: card.querySelector('.wid__list'),
            start: 'top 92%',
            once: true,
          },
        });
      });
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className="section wid" id="services" ref={root}>
      <div className="shell">
        <SectionHeading index="02" eyebrow="What I Do" title="Two sides of the same job.">
          <p className="lede">
            The models are only half of it. The other half is the software, data and cloud work that
            gets them in front of people and keeps them running.
          </p>
        </SectionHeading>

        <div className="wid__grid">
          {services.map((service) => (
            <Spotlight as="article" className="wid__card" data-reveal="up" key={service.id}>
              <BorderBeam duration={9} />
              <div className="wid__card-glow" aria-hidden="true" />
              <div className="wid__grid-bg" aria-hidden="true" />
              <span className="wid__numeral" aria-hidden="true">
                {service.index}
              </span>

              <div className="wid__glyph">
                <ServiceGlyph id={service.id} />
              </div>

              <span className="mono-label wid__index">{service.index}</span>
              <h3 className="wid__title">{service.title}</h3>
              <p className="body-copy wid__desc">{service.description}</p>

              <ul className="wid__list">
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Spotlight>
          ))}
        </div>
      </div>
    </section>
  );
}
