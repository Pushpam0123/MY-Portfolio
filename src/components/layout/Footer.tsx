import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollSmoother, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { profile, socials } from '@/data/profile';
import './Footer.css';

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return time;
}

export function Footer() {
  const time = useLocalTime(profile.timezone);
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        '.footer__mark-text',
        { yPercent: 105 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.footer__mark',
            start: 'top bottom',
            end: 'clamp(bottom bottom)',
            scrub: 0.8,
          },
        },
      );
    },
    { dependencies: [reduced], scope: root },
  );

  const toTop = () => {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(0, true);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" ref={root}>
      <div className="shell footer__inner">
        <div className="footer__col">
          <span className="mono-label">Local time</span>
          <span className="footer__value">
            {time ? `${time} IST` : ''}
            <span className="footer__pulse" aria-hidden="true" />
          </span>
        </div>

        <div className="footer__col footer__col--links">
          <span className="mono-label">Elsewhere</span>
          <ul className="footer__links">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  data-cursor="link"
                  target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer noopener'}
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col footer__col--end">
          <button type="button" className="footer__top" onClick={toTop} data-cursor="link">
            Back to top
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>

      <div className="shell footer__base">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="footer__built">Built with React, GSAP &amp; Three.js</p>
      </div>

      <div className="footer__mark" aria-hidden="true">
        <span className="footer__mark-text">PUSHPAM RAJ</span>
      </div>
    </footer>
  );
}
