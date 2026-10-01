import { useRef } from 'react';
import { services } from '@/data/skills';
import { ServiceGlyph } from '@/components/ui/ServiceGlyph';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReveal } from '@/hooks/useReveal';
import './WhatIDo.css';

export function WhatIDo() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

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
            <article className="wid__card" data-reveal="up" key={service.id}>
              <div className="wid__card-glow" aria-hidden="true" />

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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
