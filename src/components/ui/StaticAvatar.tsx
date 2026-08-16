import { Picture } from './Picture';
import { heroAvatar } from '@/assets/images';

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
