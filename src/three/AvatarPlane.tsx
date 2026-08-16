import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { imageUrl } from '@/assets/images';
import { fragmentShader, vertexShader } from './shaders/reveal';

const BASE = imageUrl('avatar-hero', 1024, 'webp');
const CHROME = imageUrl('avatar-hero-chrome', 1024, 'webp');

export function AvatarPlane({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const gl = useThree((state) => state.gl);

  const pointerOnCanvas = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const enter = () => {
      pointerOnCanvas.current = true;
    };
    const leave = () => {
      pointerOnCanvas.current = false;
    };
    canvas.addEventListener('pointermove', enter);
    canvas.addEventListener('pointerleave', leave);
    return () => {
      canvas.removeEventListener('pointermove', enter);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, [gl]);

  const [base, chrome] = useTexture([BASE, CHROME]);

  useMemo(() => {
    for (const tex of [base, chrome]) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
    }
  }, [base, chrome]);

  const size = Math.min(viewport.width, viewport.height) * 0.88;

  const uniforms = useMemo(
    () => ({
      uBase: { value: base },
      uReveal: { value: chrome },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uActive: { value: 0 },
      uTime: { value: 0 },

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

    if (!pointerOnCanvas.current) {
      targetActive.current = 0;
    } else {
      state.raycaster.setFromCamera(state.pointer, state.camera);
      const hits = mesh.current ? state.raycaster.intersectObject(mesh.current) : [];

      if (hits.length > 0 && hits[0].uv) {
        target.current.copy(hits[0].uv);
        targetActive.current = 1;
      } else {
        targetActive.current = 0;
      }
    }

    const ease = 1 - Math.exp(-9 * delta);
    const easeActive = 1 - Math.exp(-5 * delta);

    mat.uniforms.uPointer.value.lerp(target.current, ease);
    mat.uniforms.uActive.value += (targetActive.current - mat.uniforms.uActive.value) * easeActive;
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
