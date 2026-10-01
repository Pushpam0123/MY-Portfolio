import { useRef } from 'react';
import { achievements, certifications, simulations, type Certification } from '@/data/credentials';
import { issuerLogoUrl } from '@/assets/images';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Counter } from '@/components/ui/Counter';
import { Spotlight } from '@/components/fx/Spotlight';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReveal } from '@/hooks/useReveal';
import './Credentials.css';

const logo = (cert: Certification) => (cert.logo ? issuerLogoUrl(cert.logo) : undefined);

function CertList({ items }: { items: Certification[] }) {
  return (
    <ul className="cred__certs">
      {items.map((cert) => (
        <Spotlight
          as="li"
          tilt={9}
          shine
          className={`cred__cert ${cert.url ? 'cred__cert--has-link' : ''}`}
          data-reveal="up"
          key={cert.id}
        >
          {cert.url && (
            <a
              className="cred__cert-overlay-link"
              href={cert.url}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
              aria-label={`${cert.title}, ${cert.issuer} (verify credential)`}
            />
          )}
          <div className="cred__cert-top">
            {logo(cert) ? (
              <img
                className="cred__cert-logo"
                src={logo(cert)}
                alt={cert.issuer}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="cred__cert-issuer">{cert.issuer}</span>
            )}
            <div className="cred__cert-meta">
              {cert.year && <span className="mono-label">{cert.year}</span>}
              {cert.url && (
                <span className="cred__cert-arrow" aria-hidden="true">
                  ↗
                </span>
              )}
            </div>
          </div>
          <p className="cred__cert-title">{cert.title}</p>
        </Spotlight>
      ))}
    </ul>
  );
}

/** Leading figure of a title, e.g. "250+ open-source…" -> ["250", "+", rest]. */
const leadingFigure = (title: string) => {
  const m = title.match(/^(\d+)(\+?)\s+(.*)$/);
  return m ? { value: Number(m[1]), suffix: m[2], rest: m[3] } : null;
};

export function Credentials() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(root);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from('.cred__medal', {
        scale: 0,
        rotate: -24,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(2.4)',
        stagger: 0.12,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.cred__achievements', start: 'top 80%', once: true },
      });
      gsap.from('.cred__big', {
        scale: 0.4,
        opacity: 0,
        duration: 1,
        ease: 'back.out(2)',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.cred__big', start: 'top 88%', once: true },
      });
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className="section cred" id="credentials" ref={root}>
      <div className="shell">
        <SectionHeading
          index="06"
          eyebrow="Credentials"
          title="Certified, and occasionally competitive."
        />

        <div className="cred__grid">
          <div className="cred__col">
            <h3 className="cred__col-title mono-label">Certifications</h3>
            <CertList items={certifications} />

            <h3 className="cred__col-title cred__col-title--sub mono-label">Job Simulations</h3>
            <CertList items={simulations} />
          </div>

          <div className="cred__col">
            <h3 className="cred__col-title mono-label">Achievements</h3>
            <ul className="cred__achievements">
              {achievements.map((item) => {
                const fig = leadingFigure(item.title);
                const place = item.place;
                return (
                  <li className="cred__achievement" data-reveal="left" key={item.id}>
                    {place ? (
                      <span className="cred__medal" aria-hidden="true">
                        {place}
                      </span>
                    ) : (
                      <span className="cred__marker" aria-hidden="true" />
                    )}
                    <div>
                      <p className="cred__achievement-title">
                        {fig ? (
                          <>
                            <span className="cred__big">
                              <Counter value={fig.value} suffix={fig.suffix} duration={2} />
                            </span>{' '}
                            {fig.rest}
                          </>
                        ) : item.highlight && item.title.includes(item.highlight) ? (
                          <>
                            {item.title.split(item.highlight)[0]}
                            <span className="cred__glow">{item.highlight}</span>
                            {item.title.split(item.highlight)[1]}
                          </>
                        ) : (
                          item.title
                        )}
                      </p>
                      {item.detail && <p className="cred__achievement-detail">{item.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
