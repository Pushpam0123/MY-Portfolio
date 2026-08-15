import { imageWidths, type ImageName } from './generated/manifest';

/**
 * Resolves every generated image to its hashed build URL up front. `eager` is
 * correct here — there are only ~80 tiny URL strings, and the alternative
 * (dynamic import per image) would delay the hero paint.
 */
const files = import.meta.glob('./generated/*.{avif,webp,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const url = (name: string, width: number, ext: string): string => {
  const key = `./generated/${name}-${width}.${ext}`;
  const resolved = files[key];
  if (!resolved) {
    throw new Error(
      `Missing generated image "${key}". Run \`npm run assets\` to rebuild the pipeline.`,
    );
  }
  return resolved;
};

export interface ResponsiveImage {
  /** Largest PNG — the universally safe <img src> fallback. */
  src: string;
  avif: string;
  webp: string;
  png: string;
  widths: readonly number[];
  maxWidth: number;
}

const srcset = (name: ImageName, ext: string): string =>
  imageWidths[name].map((w) => `${url(name, w, ext)} ${w}w`).join(', ');

/**
 * Builds the three parallel srcsets for a generated asset. Consumers render
 * them as <picture><source type="image/avif"> … which lets the browser pick
 * both the best format and the right density in one pass.
 */
export function image(name: ImageName): ResponsiveImage {
  const widths = imageWidths[name];
  const maxWidth = widths[widths.length - 1];
  return {
    src: url(name, maxWidth, 'png'),
    avif: srcset(name, 'avif'),
    webp: srcset(name, 'webp'),
    png: srcset(name, 'png'),
    widths,
    maxWidth,
  };
}

/** Raw URL for a single variant — used by WebGL texture loading. */
export function imageUrl(name: ImageName, width: number, ext: 'png' | 'webp' | 'avif' = 'png') {
  return url(name, width, ext);
}

/**
 * Equirectangular sphere texture for a tech-stack ball. Generated at a single
 * width by scripts/prepare-assets.mjs, so there is no srcset to pick from.
 */
export function techTextureUrl(id: string): string {
  return url(`tech-${id}`, 1536, 'webp');
}

/**
 * Issuer logos for the Credentials section, supplied by Pushpam as SVG.
 *
 * Separate from the generated pipeline: these are vendor marks shipped as-is,
 * not derived from anything. Kept eager for the same reason as above — they are
 * four URL strings.
 */
const logoFiles = import.meta.glob('./source/logos/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Resolves an issuer logo, or `undefined` when that issuer has no file yet. */
export function issuerLogoUrl(slug: string): string | undefined {
  return logoFiles[`./source/logos/${slug}.svg`];
}

export const heroAvatar = image('avatar-hero');
export const deskAvatar = image('avatar-desk');
// Note: avatar-hero-chrome is intentionally not exposed via image() — it exists
// as a single WebGL texture only, so it has no AVIF/PNG variants to build a
// srcset from. Reach it through imageUrl('avatar-hero-chrome', 1024, 'webp').
export const faceAvatars = [image('avatar-face-1'), image('avatar-face-2'), image('avatar-face-3')];
