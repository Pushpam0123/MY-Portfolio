import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AvatarPlane } from './AvatarPlane';
import { ParticleField } from './ParticleField';
import { Picture } from '@/components/ui/Picture';
import { heroAvatar } from '@/assets/images';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/** Cheap capability probe — some browsers/GPUs simply have no WebGL context. */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

/** Plain <img> used whenever the scene cannot or should not run. */
function StaticAvatar() {
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

/**
 * The hero's WebGL layer.
 *
 * Falls back to the static portrait on three separate conditions — no WebGL, a
 * reduced-motion preference, or a runtime context loss — because a hero that
 * renders nothing is far worse than one that renders a still image.
 */
export function AvatarScene() {
  const reduced = useReducedMotion();
  const [supported] = useState(hasWebGL);
  const [crashed, setCrashed] = useState(false);

  if (!supported || crashed || reduced) return <StaticAvatar />;

  return (
    <Canvas
      className="hero__canvas"
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        state.gl.domElement.addEventListener('webglcontextlost', () => setCrashed(true));
        // Dev-only: lets a headless browser force a draw, since R3F's render
        // loop depends on requestAnimationFrame, which never fires there.
        if (import.meta.env.DEV) {
          (window as unknown as { __r3f?: unknown }).__r3f = state;
        }
      }}
    >
      <Suspense fallback={null}>
        <ParticleField reduced={reduced} />
        <AvatarPlane reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
