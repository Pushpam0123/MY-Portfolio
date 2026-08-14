import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { imageUrl } from '@/assets/images';
import { fragmentShader, vertexShader } from './shaders/reveal';

const BASE = imageUrl('avatar-hero', 1024, 'webp');
const CHROME = imageUrl('avatar-hero-chrome', 1024, 'webp');

/**
 * The avatar itself: a single plane running the reveal shader.
 *
 * Pointer position is tracked in the plane's own UV space so the ripple lands
 * exactly under the cursor regardless of viewport size, and both the pointer
 * and the presence value are damped per-frame rather than snapped, which is
 * what makes the effect feel like a fluid rather than a spotlight.
 */
export function AvatarPlane({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const [base, chrome] = useTexture([BASE, CHROME]);

  // Colour space must be set explicitly or the textures render washed out.
  useMemo(() => {
    for (const tex of [base, chrome]) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
    }
  }, [base, chrome]);

  // Fit the plane to the smaller viewport dimension, leaving breathing room.
  const size = Math.min(viewport.width, viewport.height) * 0.88;

  const uniforms = useMemo(
    () => ({
      uBase: { value: base },
      uReveal: { value: chrome },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uActive: { value: 0 },
      uTime: { value: 0 },
      // Kept small on purpose: the reveal should read as a lens tracking the
      // cursor, not as the whole portrait swapping material.
      uRadius: { value: 0.26 },
      uAspect: { value: 1 },
    }),
    [base, chrome],
  );

  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const targetActive = useRef(0);

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;

    if (reduced) {
      mat.uniforms.uActive.value = 0;
      return;
    }

    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Raycast the pointer against this plane to get true UV coordinates.
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const hits = mesh.current ? state.raycaster.intersectObject(mesh.current) : [];

    if (hits.length > 0 && hits[0].uv) {
      target.current.copy(hits[0].uv);
      targetActive.current = 1;
    } else {
      targetActive.current = 0;
    }

    // Frame-rate independent damping — `1 - exp(-k*dt)` keeps the feel
    // identical at 60 and 144 Hz, which a plain lerp factor does not.
    const ease = 1 - Math.exp(-9 * delta);
    const easeActive = 1 - Math.exp(-5 * delta);

    mat.uniforms.uPointer.value.lerp(target.current, ease);
    mat.uniforms.uActive.value +=
      (targetActive.current - mat.uniforms.uActive.value) * easeActive;
  });

  return (
    <mesh ref={mesh} scale={[size, size, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
