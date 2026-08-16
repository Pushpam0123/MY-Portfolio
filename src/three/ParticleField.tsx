import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function ParticleField({ count = 900, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const { positions, scales, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.2 + Math.pow(Math.random(), 0.6) * 6.5;
      const angle = Math.random() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;

      scales[i] = 0.4 + Math.random() * 1.6;
      seeds[i] = Math.random() * Math.PI * 2;
    }

    return { positions, scales, seeds };
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 } }), []);

  useFrame((state, delta) => {
    if (!points.current) return;
    const mat = points.current.material as THREE.ShaderMaterial;
    mat.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    if (reduced) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    points.current.rotation.z += delta * 0.012;
    points.current.position.x += (state.pointer.x * 0.35 - points.current.position.x) * 0.03;
    points.current.position.y += (state.pointer.y * 0.25 - points.current.position.y) * 0.03;
  });

  return (
    <points ref={points} scale={Math.max(viewport.width, viewport.height) / 9}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aScale;
          attribute float aSeed;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vAlpha;

          void main() {
            vec3 pos = position;
            pos.y += sin(uTime * 0.35 + aSeed) * 0.28;
            pos.x += cos(uTime * 0.24 + aSeed) * 0.22;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aScale * uPixelRatio * (14.0 / -mv.z);

            vAlpha = (0.35 + 0.65 * (sin(uTime * 0.9 + aSeed) * 0.5 + 0.5))
                   * smoothstep(14.0, 3.0, -mv.z);
          }
        `}
        fragmentShader={`
          precision mediump float;
          varying float vAlpha;

          void main() {
            float d = length(gl_PointCoord - 0.5);
            float mask = smoothstep(0.5, 0.05, d);
            if (mask < 0.01) discard;
            gl_FragColor = vec4(vec3(0.62, 0.42, 1.0), mask * vAlpha * 0.7);
          }
        `}
      />
    </points>
  );
}
