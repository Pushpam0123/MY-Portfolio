import { useRef } from 'react';
import { achievements, certifications, simulations, type Certification } from '@/data/credentials';
import { issuerLogoUrl } from '@/assets/images';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReveal } from '@/hooks/useReveal';
import './Credentials.css';

const logo = (cert: Certification) => (cert.logo ? issuerLogoUrl(cert.logo) : undefined);

function CertList({ items }: { items: Certification[] }) {
  return (
    <ul className="cred__certs">
      {items.map((cert) => (
        <li
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
              aria-label={`${cert.title} — ${cert.issuer} (verify credential)`}
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
        </li>
      ))}
    </ul>
  );
}

export function Credentials() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

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
            <h3 className="cred__col-title mono-label">Achievements &amp; Leadership</h3>
            <ul className="cred__achievements">
              {achievements.map((item) => (
                <li className="cred__achievement" data-reveal="left" key={item.id}>
                  <span className="cred__marker" aria-hidden="true" />
                  <div>
                    <p className="cred__achievement-title">{item.title}</p>
                    <p className="cred__achievement-detail">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
