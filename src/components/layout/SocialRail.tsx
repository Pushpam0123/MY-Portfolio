import { socials } from '@/data/profile';
import './SocialRail.css';

export function SocialRail() {
  return (
    <aside className="rail" aria-label="Social links">
      <ul className="rail__list">
        {socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.href}
              className="rail__link"
              data-cursor="link"
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
