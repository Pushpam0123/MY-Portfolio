import type { ResponsiveImage } from '@/assets/images';

interface PictureProps {
  image: ResponsiveImage;
  alt: string;
  /** The `sizes` attribute — required for srcset to select correctly. */
  sizes: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

/**
 * <picture> with AVIF → WebP → PNG fallbacks. Explicit width/height (or the
 * asset's own max width) reserve layout space so images never cause CLS.
 */
export function Picture({
  image,
  alt,
  sizes,
  className,
  priority = false,
  width,
  height,
}: PictureProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={image.avif} sizes={sizes} />
      <source type="image/webp" srcSet={image.webp} sizes={sizes} />
      <img
        src={image.src}
        srcSet={image.png}
        sizes={sizes}
        alt={alt}
        className={className}
        width={width ?? image.maxWidth}
        height={height ?? image.maxWidth}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
      />
    </picture>
  );
}
