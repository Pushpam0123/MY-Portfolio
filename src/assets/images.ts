import { imageWidths, type ImageName } from './generated/manifest';

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
  src: string;
  avif: string;
  webp: string;
  png: string;
  widths: readonly number[];
  maxWidth: number;
}

const srcset = (name: ImageName, ext: string): string =>
  imageWidths[name].map((w) => `${url(name, w, ext)} ${w}w`).join(', ');

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

export function imageUrl(name: ImageName, width: number, ext: 'png' | 'webp' | 'avif' = 'png') {
  return url(name, width, ext);
}

export function techTextureUrl(id: string): string {
  return url(`tech-${id}`, 1536, 'webp');
}

const logoFiles = import.meta.glob('./source/logos/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function issuerLogoUrl(slug: string): string | undefined {
  return logoFiles[`./source/logos/${slug}.svg`];
}

export const heroAvatar = image('avatar-hero');
export const deskAvatar = image('avatar-desk');

export const faceAvatars = [image('avatar-face-1'), image('avatar-face-2'), image('avatar-face-3')];
