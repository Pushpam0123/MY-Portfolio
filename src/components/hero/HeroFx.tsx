import './hero-fx.css';

/** Slow-drifting aurora blobs behind the whole hero. */
export function HeroAurora() {
  return (
    <div className="hfx-aurora" aria-hidden="true">
      <span className="hfx-aurora__blob hfx-aurora__blob--a" />
      <span className="hfx-aurora__blob hfx-aurora__blob--b" />
      <span className="hfx-aurora__blob hfx-aurora__blob--c" />
    </div>
  );
}

/**
 * Glowing halo + rings + orbiting sparks behind the avatar. It leans toward the cursor via
 * --hx / --hy (set on the parent .hero__visual) and brightens on [data-hover='true'].
 */
export function HeroAura() {
  return (
    <div className="hfx-aura" aria-hidden="true">
      <div className="hfx-aura__lean">
        <span className="hfx-aura__halo" />
        <span className="hfx-aura__ring hfx-aura__ring--glow" />
        <span className="hfx-aura__ring" />
        <span className="hfx-aura__orbit">
          <i className="hfx-spark hfx-spark--1" />
          <i className="hfx-spark hfx-spark--2" />
          <i className="hfx-spark hfx-spark--3" />
        </span>
        <span className="hfx-aura__orbit hfx-aura__orbit--rev">
          <i className="hfx-spark hfx-spark--4" />
          <i className="hfx-spark hfx-spark--5" />
        </span>
      </div>
    </div>
  );
}
