import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { techBalls } from '@/data/skills';
import { techTextureUrl } from '@/assets/images';
import {
  createBody,
  defaultOptions,
  makeRng,
  stepSolver,
  type SphereBody,
} from './spherePhysics';

/**
 * Physics-driven tech stack.
 *
 * Zero gravity plus a spring toward the origin: the spheres hang together as a
 * cluster, scatter when the cursor drives through them, then re-gather. The
 * cursor is a real collider in the simulation, not a visual effect layered on
 * top, so the scattering is genuinely solved rather than faked.
 *
 * The solver lives in ./spherePhysics — see the note there on why this does not
 * use a physics engine.
 */

/** Approximate width of the settled cluster, in world units. */
const CLUSTER_WIDTH = 15;

/** Fixed timestep; the frame's elapsed time is consumed in chunks of this. */
const FIXED_STEP = 1 / 120;

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

/**
 * Starting layout: a golden-angle shell rather than a grid, so the opening
 * frames read as a cluster settling instead of a formation collapsing.
 */
function useStartBodies(): SphereBody[] {
  return useMemo(() => {
    const rng = makeRng(20260815);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const count = techBalls.length;

    return techBalls.map((ball, i) => {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const spread = 5.4;

      return createBody(
        new THREE.Vector3(
          Math.cos(theta) * ring * spread,
          y * spread * 0.72,
          Math.sin(theta) * ring * spread * 0.55,
        ),
        ball.scale,
        rng,
      );
    });
  }, []);
}

/**
 * Pulls the camera back until the cluster fits.
 *
 * A perspective camera's `fov` is vertical, so on a narrow viewport the visible
 * width collapses and the outer spheres get cropped off both edges.
 */
function FitCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const vFov = (cam.fov * Math.PI) / 180;

    // On portrait screens, fitting the full width shrinks the cluster to a speck
    // marooned in empty space. Framing a narrower slice keeps the spheres large
    // and lets the outermost ones run off the edges — which is how the
    // composition is meant to read anyway.
    const target = aspect < 1 ? CLUSTER_WIDTH * 0.7 : CLUSTER_WIDTH;
    const needed = target / 2 / (Math.tan(vFov / 2) * aspect);

    cam.position.z = Math.max(17, needed + 2);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function Cluster() {
  const bodies = useStartBodies();
  const textures = useBallTextures();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const cursor = useRef<THREE.Mesh>(null);

  const pointerWorld = useMemo(() => new THREE.Vector3(), []);
  const pointerPrev = useMemo(() => new THREE.Vector3(), []);
  const pointerVelocity = useMemo(() => new THREE.Vector3(), []);
  const pointerActive = useRef(false);
  const accumulator = useRef(0);

  useFrame(({ pointer, viewport }, delta) => {
    // Project the pointer onto the z=0 plane in world units.
    pointerWorld.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);

    // A pointer parked exactly at the origin means "never moved" — R3F's default.
    // Treating that as a collider would punch a hole in the middle of the cluster
    // before the visitor has touched anything.
    if (!pointerActive.current && (pointer.x !== 0 || pointer.y !== 0)) {
      pointerActive.current = true;
      pointerPrev.copy(pointerWorld);
    }

    // Clamp: a long frame (tab regains focus) would otherwise teleport the
    // cursor across the scene and fling everything off screen.
    const frame = Math.min(delta, 0.05);

    if (frame > 0) {
      pointerVelocity.subVectors(pointerWorld, pointerPrev).divideScalar(frame);
    }
    pointerPrev.copy(pointerWorld);

    // Fixed-timestep integration, so behaviour is identical at 60 and 144 Hz.
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

    for (let i = 0; i < bodies.length; i += 1) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      mesh.position.copy(bodies[i].position);
      mesh.quaternion.copy(bodies[i].quaternion);
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
          key={ball.id}
          ref={(node) => {
            meshes.current[i] = node;
          }}
          scale={ball.scale}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 42, 42]} />
          <meshPhysicalMaterial
            map={textures[i]}
            roughness={0.18}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.12}
            iridescence={0.85}
            iridescenceIOR={1.28}
            envMapIntensity={1.15}
          />
        </mesh>
      ))}

      <mesh ref={cursor} visible={false}>
        <sphereGeometry args={[0.44, 24, 24]} />
        <meshBasicMaterial color="#c9a6ff" toneMapped={false} />
        <pointLight intensity={8} distance={7} color="#a855f7" />
      </mesh>
    </>
  );
}

function Scene() {
  return (
    <>
      <FitCamera />
      <ambientLight intensity={0.5} />
      <spotLight position={[16, 16, 14]} angle={0.35} penumbra={1} intensity={1.4} castShadow />
      <directionalLight position={[-10, -6, -8]} intensity={0.35} />

      <Cluster />

      {/*
        Environment built from Lightformers rather than a `preset`. Presets are
        fetched from a CDN at runtime — an external dependency this site does not
        otherwise have. These give the same studio sheen with nothing to download.
      */}
      <Environment resolution={256}>
        <Lightformer intensity={2.4} form="circle" scale={12} position={[0, 6, -9]} />
        <Lightformer intensity={1.6} form="ring" scale={9} position={[-8, 2, -6]} color="#c4b5fd" />
        <Lightformer
          intensity={1.2}
          form="rect"
          scale={[14, 6, 1]}
          position={[6, -5, -8]}
          color="#7c4dff"
        />
        <Lightformer intensity={0.9} form="rect" scale={[12, 12, 1]} position={[0, 0, 10]} />
      </Environment>
    </>
  );
}

export default function TechBalloons() {
  return (
    <Canvas
      className="stack__canvas"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 18], fov: 34, near: 1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
