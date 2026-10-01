import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { techBalls } from '@/data/skills';
import { techTextureUrl } from '@/assets/images';
import { createBody, defaultOptions, makeRng, stepSolver, type SphereBody } from './spherePhysics';

const CLUSTER_WIDTH = 17;

const FIXED_STEP = 1 / 120;

const POP_DURATION = 0.55;
const POP_STAGGER = 0.045;

const FOCUS_MARGIN = defaultOptions.pointerRadius + 0.5;

function useBallTextures() {
  const urls = useMemo(() => techBalls.map((ball) => techTextureUrl(ball.id)), []);
  const textures = useTexture(urls);

  useMemo(() => {
    for (const texture of textures) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
    }
  }, [textures]);

  return textures;
}

const RELAX_OPTIONS = {
  ...defaultOptions,
  attraction: 0.9,
  swirl: 0,
  restitution: 0,
  linearDamping: 6,
  pointerImpulse: 0,
};

const RELAX_STEPS = 900;

const NO_POINTER_VELOCITY = new THREE.Vector3();

function useStartBodies(): SphereBody[] {
  return useMemo(() => {
    const rng = makeRng(20260815);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const count = techBalls.length;

    const bodies = techBalls.map((ball, i) => {
      const radius = Math.sqrt((i + 0.5) / count);
      const theta = golden * i;
      const seed = 4.2;

      return createBody(
        new THREE.Vector3(
          Math.cos(theta) * radius * seed * 2.05,
          Math.sin(theta) * radius * seed * 0.6,
          (rng() - 0.5) * seed * 0.5,
        ),
        ball.scale,
        rng,
      );
    });

    for (let step = 0; step < RELAX_STEPS; step += 1) {
      stepSolver(bodies, null, NO_POINTER_VELOCITY, FIXED_STEP, RELAX_OPTIONS);
    }

    for (const body of bodies) {
      body.anchor.copy(body.position);
      body.velocity.set(0, 0, 0);
    }

    return bodies;
  }, []);
}

function FitCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const vFov = (cam.fov * Math.PI) / 180;

    const narrow = size.width < 768;
    const target = narrow ? CLUSTER_WIDTH * 0.62 : CLUSTER_WIDTH;
    const needed = target / 2 / (Math.tan(vFov / 2) * aspect);

    cam.position.z = Math.max(17, needed + 2);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

interface SceneProps {
  start: boolean;
  highlight?: string | null;
  onFocus?: (name: string | null) => void;
}

const GLOW_VIOLET = new THREE.Color('#9a6bff');
const GLOW_CYAN = new THREE.Color('#38d8ff');

const HALO_REACH = 4.5;

function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Additive fresnel rim: bolts a glow term onto the stock physical material, no new material. */
function addRimGlow(material: THREE.MeshPhysicalMaterial, color: THREE.Color) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: color };
    shader.uniforms.uRim = { value: 0.6 };
    material.userData.rim = shader.uniforms.uRim;
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform vec3 uRimColor;\nuniform float uRim;\nvoid main() {')
      .replace(
        '#include <opaque_fragment>',
        `float rimF = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 2.2);
        outgoingLight += uRimColor * rimF * uRim;
        #include <opaque_fragment>`,
      );
  };
}

const FULL_TINT = new THREE.Color('#ffffff');
const DIM_TINT = new THREE.Color('#8f8fa3');

function Cluster({ start, highlight, onFocus }: SceneProps) {
  const bodies = useStartBodies();
  const textures = useBallTextures();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const cursor = useRef<THREE.Mesh>(null);
  const halos = useRef<(THREE.Mesh | null)[]>([]);
  const glow = useRef<number[]>([]);
  const haloTexture = useMemo(makeHaloTexture, []);
  const rimColors = useMemo(
    () => techBalls.map((_, i) => (i % 2 ? GLOW_CYAN : GLOW_VIOLET)),
    [],
  );

  const pointerWorld = useMemo(() => new THREE.Vector3(), []);
  const pointerPrev = useMemo(() => new THREE.Vector3(), []);
  const pointerVelocity = useMemo(() => new THREE.Vector3(), []);
  const pointerActive = useRef(false);
  const accumulator = useRef(0);
  const elapsed = useRef(0);
  const focused = useRef<string | null>(null);
  const gl = useThree((state) => state.gl);

  const pointerInside = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const enter = () => {
      pointerInside.current = true;
    };
    const leave = () => {
      pointerInside.current = false;
    };
    canvas.addEventListener('pointermove', enter);
    canvas.addEventListener('pointerleave', leave);
    return () => {
      canvas.removeEventListener('pointermove', enter);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, [gl]);

  useFrame(({ pointer, viewport }, delta) => {
    pointerWorld.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);

    const live = pointerInside.current && (pointer.x !== 0 || pointer.y !== 0);
    if (live && !pointerActive.current) {
      pointerPrev.copy(pointerWorld);
    }
    pointerActive.current = live;

    const frame = Math.min(delta, 0.05);

    if (frame > 0) {
      pointerVelocity.subVectors(pointerWorld, pointerPrev).divideScalar(frame);
    }
    pointerPrev.copy(pointerWorld);

    accumulator.current = Math.min(accumulator.current + frame, 0.25);
    while (accumulator.current >= FIXED_STEP) {
      stepSolver(
        bodies,
        pointerActive.current ? pointerWorld : null,
        pointerVelocity,
        FIXED_STEP,
        defaultOptions,
      );
      accumulator.current -= FIXED_STEP;
    }

    if (start) elapsed.current += frame;

    let nearest: string | null = null;
    let nearestGap = Infinity;

    for (let i = 0; i < bodies.length; i += 1) {
      const mesh = meshes.current[i];
      if (!mesh) continue;

      const body = bodies[i];
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);

      const t = Math.min(1, Math.max(0, (elapsed.current - i * POP_STAGGER) / POP_DURATION));

      const eased = t >= 1 ? 1 : 1 - (1 - t) ** 3 * Math.cos(t * Math.PI * 0.9);
      mesh.scale.setScalar(body.radius * eased);

      const lit = !highlight || techBalls[i].group === highlight;
      const material = mesh.material as THREE.MeshPhysicalMaterial;
      material.color.lerp(lit ? FULL_TINT : DIM_TINT, 1 - Math.exp(-frame * 9));

      // Additive glow: brightens near the cursor and while a ball is moving.
      let near = 0;
      if (pointerActive.current) {
        const reach = body.position.distanceTo(pointerWorld) - body.radius;
        near = Math.max(0, 1 - reach / HALO_REACH);
      }
      const speed = Math.min(1, body.velocity.length() / 6);
      const target = (lit ? 0.7 : 0.15) + (lit ? near * 1.5 + speed * 1.1 : 0);
      const previous = glow.current[i] ?? 0.7;
      const level = previous + (target - previous) * (1 - Math.exp(-frame * 7));
      glow.current[i] = level;

      const rim = material.userData.rim as { value: number } | undefined;
      if (rim) rim.value = 0.55 + level * 1.25;

      const halo = halos.current[i];
      if (halo) {
        halo.position.set(body.position.x, body.position.y, body.position.z - body.radius * 0.6);
        halo.scale.setScalar(body.radius * eased * (2.9 + level * 0.9));
        (halo.material as THREE.MeshBasicMaterial).opacity = Math.min(0.85, 0.14 + level * 0.3);
      }

      if (pointerActive.current) {
        const gap = body.position.distanceTo(pointerWorld) - body.radius;
        if (gap < FOCUS_MARGIN && gap < nearestGap) {
          nearestGap = gap;
          nearest = techBalls[i].name;
        }
      }
    }

    if (nearest !== focused.current) {
      focused.current = nearest;
      onFocus?.(nearest);
    }

    if (cursor.current) {
      cursor.current.position.copy(pointerWorld);
      cursor.current.visible = pointerActive.current;
    }
  });

  return (
    <>
      {techBalls.map((ball, i) => (
        <mesh
          key={`${ball.id}-halo`}
          ref={(node) => {
            halos.current[i] = node;
          }}
          renderOrder={-1}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={haloTexture}
            color={rimColors[i]}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {techBalls.map((ball, i) => (
        <mesh
          key={ball.id}
          ref={(node) => {
            meshes.current[i] = node;
          }}

          scale={0}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 48, 48]} />
          {}
          <meshPhysicalMaterial
            ref={(m) => {
              if (m && !m.userData.rimAdded) {
                m.userData.rimAdded = true;
                addRimGlow(m, rimColors[i]);
              }
            }}
            map={textures[i]}
            roughness={0.26}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.16}
            iridescence={0.16}
            iridescenceIOR={1.22}
            envMapIntensity={0.75}
          />
        </mesh>
      ))}

      <mesh ref={cursor} visible={false}>
        <sphereGeometry args={[0.44, 24, 24]} />
        <meshBasicMaterial color="#c9a6ff" toneMapped={false} />
        <pointLight intensity={6} distance={7} color="#a855f7" />
      </mesh>
    </>
  );
}

function Scene({ start, highlight, onFocus }: SceneProps) {
  return (
    <>
      <FitCamera />
      <ambientLight intensity={1.05} />
      <spotLight position={[14, 15, 16]} angle={0.5} penumbra={1} intensity={1.1} castShadow />
      {}
      <directionalLight position={[-9, -7, -6]} intensity={0.5} color="#8b6cff" />

      <Cluster start={start} highlight={highlight} onFocus={onFocus} />

      {}
      <Environment resolution={256}>
        <Lightformer intensity={1.1} form="circle" scale={14} position={[0, 7, -9]} />
        <Lightformer
          intensity={0.9}
          form="ring"
          scale={10}
          position={[-8, 2, -6]}
          color="#c4b5fd"
        />
        <Lightformer
          intensity={0.8}
          form="rect"
          scale={[16, 7, 1]}
          position={[6, -5, -8]}
          color="#7c4dff"
        />
        <Lightformer intensity={0.5} form="rect" scale={[14, 14, 1]} position={[0, 0, 12]} />
      </Environment>
    </>
  );
}

export default function TechBalloons({ start, highlight, onFocus }: SceneProps) {
  return (
    <Canvas
      className="stack__canvas"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 18], fov: 34, near: 1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Scene start={start} highlight={highlight} onFocus={onFocus} />
      </Suspense>
    </Canvas>
  );
}
