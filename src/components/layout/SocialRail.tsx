import { useEffect, useState } from 'react';
import { socials } from '@/data/profile';
import './SocialRail.css';

export function SocialRail() {
  // The footer already lists these links and carries a full-width wordmark;
  // fade the fixed rail out there so it doesn't cut across the type.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <aside className={`rail${hidden ? ' rail--hidden' : ''}`} aria-label="Social links">
      <ul className="rail__list">
        {socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.href}
              className="rail__link"
              data-cursor="link"
              tabIndex={hidden ? -1 : undefined}
              target={social.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer noopener'}
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
      <span className="rail__line" aria-hidden="true" />
    </aside>
  );
}
