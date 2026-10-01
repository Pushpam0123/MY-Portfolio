import { Fragment, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { profile } from '@/data/profile';
import { techBalls } from '@/data/skills';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './RoleMarquee.css';

const ROLES = profile.roles.map((r) => r.toUpperCase());
const TECH = techBalls.slice(0, 12).map((b) => b.name.toUpperCase());

function Group({ items, startOutlined }: { items: string[]; startOutlined?: boolean }) {
  return (
    <div className="rmq__group">
      {items.map((text, i) => {
        const outlined = (i % 2 === 1) !== Boolean(startOutlined);
        return (
          <Fragment key={text}>
            <span className={`rmq__item ${outlined ? 'rmq__item--outline' : 'rmq__item--solid'}`}>
              {text}
            </span>
            <span className="rmq__sep">✦</span>
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * Decorative full-bleed band: two counter-scrolling rows of display type. Scroll velocity
 * drives timeScale (and a little skew); scroll direction flips the travel. The whole band is
 * aria-hidden — the same roles are real text in the hero.
 */
export function RoleMarquee() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      const tracks = gsap.utils.toArray<HTMLElement>('.rmq__track', root.current);
      const band = root.current.querySelector<HTMLElement>('.rmq__band');
      const tweens = tracks.map((track, i) =>
        gsap.fromTo(
          track,
          { xPercent: i % 2 === 0 ? 0 : -50 },
          {
            xPercent: i % 2 === 0 ? -50 : 0,
            duration: i % 2 === 0 ? 38 : 46,
            ease: 'none',
            repeat: -1,
          },
        ),
      );

      let dir = 1;
      let boost = 0;
      let skew = 0;
      let visible = false;
      const setSkew = band ? gsap.quickSetter(band, 'skewX', 'deg') : null;

      const tick = (_t: number, dt: number) => {
        if (!visible) return;
        const k = Math.min(dt / 16.7, 3);
        boost *= Math.pow(0.94, k);
        const ts = dir * (1 + boost);
        tweens.forEach((tw) => tw.timeScale(ts));
        skew += (Math.max(-7, Math.min(7, -dir * boost * 0.9)) - skew) * Math.min(0.12 * k, 1);
        setSkew?.(skew);
      };
      gsap.ticker.add(tick);

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          visible = self.isActive;
          tweens.forEach((tw) => (visible ? tw.resume() : tw.pause()));
        },
        onUpdate: (self) => {
          dir = self.direction;
          boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) / 260, 14));
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        st.kill();
        tweens.forEach((tw) => tw.kill());
      };
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section className={`rmq${reduced ? ' rmq--static' : ''}`} ref={root} aria-hidden="true">
      <div className="rmq__band">
        <div className="rmq__row">
          <div className="rmq__track">
            <Group items={ROLES} />
            <Group items={ROLES} />
          </div>
        </div>
        <div className="rmq__row rmq__row--tech">
          <div className="rmq__track">
            <Group items={TECH} startOutlined />
            <Group items={TECH} startOutlined />
          </div>
        </div>
      </div>
    </section>
  );
}
