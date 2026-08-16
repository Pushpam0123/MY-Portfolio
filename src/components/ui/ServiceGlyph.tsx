import './ServiceGlyph.css';

const glyphs: Record<string, React.ReactNode> = {
  'ai-ml': (
    <>
      <circle cx="10" cy="12" r="3" />
      <circle cx="10" cy="30" r="3" />
      <circle cx="10" cy="48" r="3" />
      <path d="M13 12 H30 M13 30 H30 M13 48 H30" />
      <rect x="30" y="21" width="18" height="18" rx="5" />
      <path d="M48 30 H62" />
      <circle cx="65" cy="30" r="3" />
    </>
  ),
  automation: (
    <>
      <rect x="6" y="10" width="20" height="14" rx="4" />
      <rect x="44" y="36" width="20" height="14" rx="4" />
      <path d="M26 17 H56 A6 6 0 0 1 62 23 V33" />
      <path d="M44 43 H14 A6 6 0 0 1 8 37 V27" />
      <path d="M58 30 L62 36 L66 30" />
      <path d="M4 30 L8 24 L12 30" />
    </>
  ),
  fullstack: (
    <>
      <rect x="8" y="6" width="54" height="12" rx="4" />
      <rect x="8" y="24" width="54" height="12" rx="4" />
      <rect x="8" y="42" width="54" height="12" rx="4" />
      <path d="M20 18 V24 M20 36 V42" />
      <path d="M50 18 V24 M50 36 V42" />
    </>
  ),
};

export function ServiceGlyph({ id }: { id: string }) {
  const glyph = glyphs[id];
  if (!glyph) return null;

  return (
    <svg className="service-glyph" viewBox="0 0 70 60" aria-hidden="true" focusable="false">
      {glyph}
    </svg>
  );
}
