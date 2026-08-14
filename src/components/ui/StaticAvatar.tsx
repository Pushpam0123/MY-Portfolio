import { Picture } from './Picture';
import { heroAvatar } from '@/assets/images';

/**
 * The hero portrait as a plain image.
 *
 * Lives in its own module — free of any Three.js import — so it can be the
 * Suspense fallback while the WebGL scene is still being fetched, and the
 * lazy boundary actually keeps Three out of the initial bundle.
 */
export function StaticAvatar() {
  return (
    <Picture
      image={heroAvatar}
      alt="3D illustrated portrait of Pushpam Raj"
      sizes="(max-width: 767px) 78vw, (max-width: 1279px) 42vw, 38vw"
      priority
      className="hero__avatar-img"
    />
  );
}
