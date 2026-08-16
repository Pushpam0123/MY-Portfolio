import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, ScrollSmoother, useGSAP } from '@/lib/gsap';
import { navItems } from '@/data/nav';
import { profile } from '@/data/profile';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './Navbar.css';

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(target, true, 'top 80px');
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function Navbar() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>('');
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onToggle: (self) => root.current?.classList.toggle('nav--pinned', self.isActive),
      });

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (progress.current) {
            progress.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      const triggers = navItems
        .map((item) => ({ item, el: document.getElementById(item.id) }))
        .filter((entry): entry is { item: (typeof navItems)[number]; el: HTMLElement } =>
          Boolean(entry.el),
        )
        .map(({ item, el }) =>
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && setActive(item.id),
          }),
        );

      return () => triggers.forEach((t) => t.kill());
    },
    { scope: root },
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  useGSAP(
    () => {
      if (!open || reduced) return;
      gsap.from('.nav-overlay__item', {
        yPercent: 110,
        opacity: 0,
        duration: 0.65,
        ease: 'expo.out',
        stagger: 0.055,
      });
    },
    { dependencies: [open, reduced], scope: root },
  );

  const go = (id: string) => {
    setOpen(false);

    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <header className="nav" ref={root}>
      <div className="nav__progress" ref={progress} aria-hidden="true" />

      <div className="nav__inner">
        <a
          className="nav__brand"
          href="#top"
          data-cursor="link"
          onClick={(e) => {
            e.preventDefault();
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.scrollTo(0, true);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="nav__mark" aria-hidden="true">
            PR
          </span>
          <span className="nav__name">{profile.name}</span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav__link${active === item.id ? ' is-active' : ''}`}
              onClick={() => go(item.id)}
              data-cursor="link"
              aria-current={active === item.id ? 'true' : undefined}
            >
              <span className="nav__link-index">{item.index}</span>
              <span className="nav__link-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="nav__actions">
          <a
            className="nav__resume"
            href={profile.resumePath}
            download
            data-cursor="link"
            aria-label="Download résumé as PDF"
          >
            Résumé
          </a>
          <button
            type="button"
            className={`nav__burger${open ? ' is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-overlay"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-overlay" id="nav-overlay">
          <nav aria-label="Sections">
            <ul>
              {navItems.map((item) => (
                <li key={item.id} className="nav-overlay__row">
                  <button type="button" className="nav-overlay__item" onClick={() => go(item.id)}>
                    <span className="nav-overlay__index">{item.index}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <a className="nav-overlay__resume" href={profile.resumePath} download>
            Download résumé →
          </a>
        </div>
      )}
    </header>
  );
}
