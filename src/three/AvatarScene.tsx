import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AvatarPlane } from './AvatarPlane';
import { ParticleField } from './ParticleField';
import { StaticAvatar } from '@/components/ui/StaticAvatar';
import { useReducedMotion } from '@/hooks/useMediaQuery';

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

export default function AvatarScene() {
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
