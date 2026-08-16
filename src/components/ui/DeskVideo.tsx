import { useEffect, useRef, useState } from 'react';
import { deskAvatar } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import './DeskVideo.css';

const SRC = '/media/desk-scene.mp4';

const WRAP_WINDOW = 0.5;

const savesData = () =>
  typeof navigator !== 'undefined' &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

interface DeskVideoProps {
  alt: string;
  sizes: string;
}

export function DeskVideo({ alt, sizes }: DeskVideoProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '200px' });
  const video = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [wrapping, setWrapping] = useState(false);

  const animate = !reduced && !savesData();

  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  useEffect(() => {
    if (!animate || !armed) return;
    const el = video.current;
    if (!el) return;

    if (inView) el.play().catch(() => undefined);
    else el.pause();
  }, [animate, armed, inView]);

  useEffect(() => {
    if (!animate || !inView) return;
    const el = video.current;
    if (!el) return;

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!el.duration) return;
      setWrapping(el.duration - el.currentTime < WRAP_WINDOW);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, inView]);

  const state = ['desk-video'];
  if (ready) state.push('is-ready');
  if (wrapping) state.push('is-wrapping');

  return (
    <div className={state.join(' ')} ref={ref}>
      <Picture image={deskAvatar} alt={alt} sizes={sizes} width={1080} height={1080} />

      {animate && (
        <video
          ref={video}
          className="desk-video__media"
          src={armed ? SRC : undefined}
          preload="none"
          loop
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
