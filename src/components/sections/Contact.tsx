import { useRef, useState, type FormEvent } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { profile, socials } from '@/data/profile';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Contact.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Public form endpoint (Formspree / Web3Forms). Safe to ship in the bundle —
 * it is a submission URL, not a secret. When it is absent the form is replaced
 * by a plain mailto link rather than silently failing on submit.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT?.trim();

if (import.meta.env.DEV && !ENDPOINT) {
  console.info(
    '[contact] VITE_CONTACT_ENDPOINT is not set — showing the email fallback instead of the form. ' +
      'See .env.example to enable it.',
  );
}

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;
      const mail = root.current?.querySelector<HTMLElement>('.contact__mail-text');
      if (!mail) return;

      // The wrapping <a> already carries the accessible name, and aria-label is
      // prohibited on a plain <span> — so keep SplitText out of the ARIA layer.
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
      // Clipboard can be blocked by permissions; the mailto link still works.
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ENDPOINT) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot — real people leave this hidden field empty.
    if (data.get('company')) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    setError('');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error
          ? `${err.message}. You can email me directly instead.`
          : 'Something went wrong. You can email me directly instead.',
      );
    }
  };

  return (
    <section className="section contact" id="contact" ref={root}>
      <div className="bloom contact__bloom" aria-hidden="true" />

      <div className="shell contact__inner">
        <div className="contact__lead">
          <span className="eyebrow">Contact</span>
          {/* aria-label supplies the spacing the two visual lines lack. */}
          <h2 className="contact__headline display" aria-label="Let's build something">
            <span aria-hidden="true">Let&apos;s build</span>
            <span aria-hidden="true">something</span>
          </h2>
          <p className="lede contact__blurb">
            I&apos;m {profile.availabilityLabel.toLowerCase()} — AI/ML engineering, automation, or
            full-stack work. The fastest way to reach me is email.
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
              Résumé (PDF)
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
          {ENDPOINT ? (
            <form className="contact__form" onSubmit={onSubmit} noValidate={false}>
              <div className="contact__field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  placeholder="What are you building?"
                />
              </div>

              {/* Honeypot: hidden from people, irresistible to bots. */}
              <div className="contact__honey" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <MagneticButton as="button" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
                <span aria-hidden="true">→</span>
              </MagneticButton>

              <p
                className={`contact__status contact__status--${status}`}
                role="status"
                aria-live="polite"
              >
                {status === 'sent' && 'Thanks — message received. I usually reply within a day.'}
                {status === 'error' && error}
              </p>
            </form>
          ) : (
            /*
             * Visitor-facing fallback. Deliberately says nothing about missing
             * configuration — that is the site owner's problem, not something a
             * recruiter reading the page should ever see. The setup hint goes to
             * the console in development instead.
             */
            <div className="contact__fallback">
              <h3 className="contact__fallback-title">Drop me a line</h3>
              <p className="body-copy">
                Tell me what you&apos;re working on and where I&apos;d fit. I read everything and
                usually reply within a day.
              </p>
              <MagneticButton as="a" href={`mailto:${profile.email}`} data-cursor="link">
                Email me
                <span aria-hidden="true">→</span>
              </MagneticButton>
              <p className="contact__fallback-note mono-label">
                Or reach me on{' '}
                <a href={socials[1].href} target="_blank" rel="noreferrer noopener">
                  LinkedIn
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
