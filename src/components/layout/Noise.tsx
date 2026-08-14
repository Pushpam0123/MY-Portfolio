import './Noise.css';

/**
 * Fixed film-grain overlay. Uses the pre-rendered noise.png from the asset
 * pipeline rather than an SVG feTurbulence filter, which has to be rasterised
 * on every paint and shows up clearly in a profile.
 */
export function Noise() {
  return <div className="noise" aria-hidden="true" />;
}
