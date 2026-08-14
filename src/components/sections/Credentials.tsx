import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { achievements, certifications } from '@/data/credentials';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Credentials.css';

export function Credentials() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.from('.cred__cert', {
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.cred__certs', start: 'top 82%', once: true },
      });

      gsap.from('.cred__achievement', {
        x: -28,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.cred__achievements', start: 'top 82%', once: true },
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
            <ul className="cred__certs">
              {certifications.map((cert) => (
                <li className="cred__cert" key={cert.id}>
                  <div className="cred__cert-top">
                    <span className="cred__cert-issuer">{cert.issuer}</span>
                    {cert.year && <span className="mono-label">{cert.year}</span>}
                  </div>
                  <p className="cred__cert-title">{cert.title}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="cred__col">
            <h3 className="cred__col-title mono-label">Achievements &amp; Leadership</h3>
            <ul className="cred__achievements">
              {achievements.map((item) => (
                <li className="cred__achievement" key={item.id}>
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
