import { useRef, useState } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { profile, socials } from '@/data/profile';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Contact.css';

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;

      const fills = gsap.utils.toArray<HTMLElement>('.contact__line', root.current);
      const fillTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.contact__headline',
          start: 'top 85%',
          end: 'bottom 45%',
          scrub: 0.7,
        },
      });
      fills.forEach((line, i) => {
        fillTl.fromTo(line, { '--fill': '0%' }, { '--fill': '100%', duration: 1 }, i * 0.9);
      });

      const mail = root.current?.querySelector<HTMLElement>('.contact__mail-text');
      if (!mail) return;

      const split = new SplitText(mail, {
        type: 'chars',
        charsClass: 'contact__mail-char',
        aria: 'none',
      });
      gsap.from(split.chars, {
        yPercent: 108,
        opacity: 0,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.018,
        scrollTrigger: { trigger: mail, start: 'top 88%', once: true },
      });

      return () => split.revert();
    },
    { dependencies: [reduced], scope: root },
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section contact" id="contact" ref={root}>
      <div className="bloom contact__bloom" aria-hidden="true" />

      <h2 className="contact__headline display" aria-label="Let's build something">
        <span className="contact__line" data-text="Let's build" aria-hidden="true">
          Let&apos;s build
        </span>
        <span className="contact__line" data-text="something" aria-hidden="true">
          something
        </span>
      </h2>

      <div className="shell contact__inner">
        <div className="contact__lead">
          <span className="eyebrow">Contact</span>
          <p className="lede contact__blurb">
            I&apos;m {profile.availabilityLabel.toLowerCase()} — AI/ML, data, cloud, forward
            deployed, or software engineering roles. The fastest way to reach me is email.
          </p>

          <a
            className="contact__mail"
            href={`mailto:${profile.email}`}
            data-cursor="link"
            aria-label={`Email ${profile.email}`}
          >
            <span className="contact__mail-text" aria-hidden="true">
              {profile.email}
            </span>
          </a>

          <div className="contact__actions">
            <button type="button" className="contact__copy" onClick={copyEmail} data-cursor="link">
              {copied ? 'Copied ✓' : 'Copy email'}
            </button>
            <a className="contact__copy" href={profile.phoneHref} data-cursor="link">
              {profile.phone}
            </a>
            <a className="contact__copy" href={profile.resumePath} download data-cursor="link">
              Resume (PDF)
            </a>
          </div>

          <ul className="contact__socials">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  data-cursor="link"
                  target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer noopener'}
                >
                  {social.label}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact__panel">
          <div className="contact__invite">
            <h3 className="contact__invite-title">Drop me a line</h3>
            <p className="body-copy">
              Tell me what you&apos;re working on and where I&apos;d fit. I read everything and
              usually reply within a day.
            </p>
            <div className="contact__cta">
              <MagneticButton
                as="a"
                className="contact__cta-btn"
                strength={0.45}
                href={`mailto:${profile.email}`}
                data-cursor="link"
              >
                Email me
                <span aria-hidden="true">&rarr;</span>
              </MagneticButton>
            </div>
            <p className="contact__invite-note mono-label">
              Or reach me on{' '}
              <a href={socials[1].href} target="_blank" rel="noreferrer noopener">
                LinkedIn
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
