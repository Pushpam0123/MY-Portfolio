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

export const heroAvatar = image('avatar-hero');
export const heroAvatarChrome = image('avatar-hero-chrome');
export const deskAvatar = image('avatar-desk');
export const faceAvatars = [image('avatar-face-1'), image('avatar-face-2'), image('avatar-face-3')];
