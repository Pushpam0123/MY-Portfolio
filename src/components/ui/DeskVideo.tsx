import { useEffect, useRef, useState } from 'react';
import { deskAvatar } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './DeskVideo.css';

const SRC = '/media/desk-scene.mp4';

const savesData = () =>
  typeof navigator !== 'undefined' &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

interface DeskVideoProps {
  alt: string;
  sizes: string;
}

export function DeskVideo({ alt, sizes }: DeskVideoProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '200px', once: true });
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const animate = !reduced && !savesData();

  useEffect(() => {
    if (!animate || !inView) return;
    video.current?.play().catch(() => undefined);
  }, [animate, inView]);

  return (
    <div className={ready ? 'desk-video is-ready' : 'desk-video'} ref={ref}>
      <Picture image={deskAvatar} alt={alt} sizes={sizes} width={1080} height={1080} />

      {animate && (
        <video
          ref={video}
          className={ready ? 'desk-video__media is-ready' : 'desk-video__media'}
          src={inView ? SRC : undefined}
          preload="none"
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
        />
      )}
    </div>
  );
}
