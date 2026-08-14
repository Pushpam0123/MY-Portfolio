import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import {
  BallCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import { techBalls, type TechBall } from '@/data/skills';
import { techTextureUrl } from '@/assets/images';

/**
 * Physics-driven tech stack.
 *
 * The world runs at zero gravity; what keeps the spheres on screen is a
 * per-frame impulse toward the origin. That is deliberately not a container of
 * walls — an attractor lets the cluster breathe, drift apart when shoved, and
 * gather again, which reads as buoyant rather than boxed in.
 *
 * The cursor is a real kinematic body, not a post-hoc effect: it collides with
 * the spheres, so the scattering is solved by the simulation.
 */

/** Impulse pulling each body back toward the centre, scaled by its mass. */
const ATTRACTION = 0.42;

function Balloon({ ball, position }: { ball: TechBall; position: [number, number, number] }) {
  const body = useRef<RapierRigidBody>(null);
  const texture = useTexture(techTextureUrl(ball.id));

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const api = body.current;
    if (!api) return;
    // Clamp: a long frame (tab regains focus) would otherwise fire one huge
    // impulse and fling the whole cluster off screen.
    const step = Math.min(delta, 0.1);
    const t = api.translation();
    vec.set(t.x, t.y, t.z).negate().multiplyScalar(step * ATTRACTION * ball.scale);
    api.applyImpulse(vec, true);
  });

  return (
    <RigidBody
      ref={body}
      position={position}
      linearDamping={1.6}
      angularDamping={0.6}
      friction={0.12}
      restitution={0.35}
      colliders={false}
    >
      <BallCollider args={[ball.scale]} />
      <mesh scale={ball.scale} castShadow receiveShadow>
        <sphereGeometry args={[1, 42, 42]} />
        <meshPhysicalMaterial
          map={texture}
          roughness={0.18}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.12}
          iridescence={0.85}
          iridescenceIOR={1.28}
          envMapIntensity={1.15}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * The cursor's body in the simulation. Kinematic, so the spheres cannot push it
 * back — it moves exactly where the pointer is and they get out of the way.
 */
function Pointer() {
  const body = useRef<RapierRigidBody>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    target.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);
    body.current?.setNextKinematicTranslation(target);
  });

  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={body}>
      <BallCollider args={[0.85]} />
      <mesh>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshBasicMaterial color="#c9a6ff" toneMapped={false} />
      </mesh>
      <pointLight intensity={9} distance={7} color="#a855f7" />
    </RigidBody>
  );
}

/**
 * Start the spheres on a loose sphere shell rather than a grid, so the first
 * frames look like a cluster settling instead of a formation collapsing.
 */
function useStartPositions(count: number) {
  return useMemo(() => {
    const positions: [number, number, number][] = [];
    // Golden-angle distribution — evenly spread without visible banding.
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const spread = 5.5;
      positions.push([
        Math.cos(theta) * radius * spread,
        y * spread * 0.7,
        Math.sin(theta) * radius * spread * 0.6,
      ]);
    }
    return positions;
  }, [count]);
}

/** Approximate width of the settled cluster, in world units. */
const CLUSTER_WIDTH = 15;

/**
 * Pulls the camera back until the whole cluster fits horizontally.
 *
 * A perspective camera's `fov` is vertical, so on a narrow viewport the visible
 * width collapses and the outer spheres get cropped off both edges. Solving for
 * the distance that fits CLUSTER_WIDTH keeps the composition intact on a phone.
 */
function FitCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const vFov = (cam.fov * Math.PI) / 180;

    // On portrait screens, fitting the cluster's full width shrinks it to a
    // speck marooned in empty space. Framing a narrower slice keeps the spheres
    // large and lets the outermost ones run off the edges — which is how the
    // composition is meant to read anyway.
    const target = aspect < 1 ? CLUSTER_WIDTH * 0.7 : CLUSTER_WIDTH;
    const needed = target / 2 / (Math.tan(vFov / 2) * aspect);

    cam.position.z = Math.max(17, needed + 2);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function Scene() {
  const positions = useStartPositions(techBalls.length);

  return (
    <>
      <FitCamera />
      <ambientLight intensity={0.5} />
      <spotLight position={[16, 16, 14]} angle={0.35} penumbra={1} intensity={1.4} castShadow />
      <directionalLight position={[-10, -6, -8]} intensity={0.35} />

      <Physics gravity={[0, 0, 0]} timeStep="vary">
        <Pointer />
        {techBalls.map((ball, i) => (
          <Balloon key={ball.id} ball={ball} position={positions[i]} />
        ))}
      </Physics>

      {/*
        Environment built from Lightformers rather than a `preset`. Presets are
        fetched from a CDN at runtime — an external dependency this site does not
        otherwise have. These give the same studio sheen with nothing to download.
      */}
      <Environment resolution={256}>
        <Lightformer intensity={2.4} form="circle" scale={12} position={[0, 6, -9]} />
        <Lightformer intensity={1.6} form="ring" scale={9} position={[-8, 2, -6]} color="#c4b5fd" />
        <Lightformer intensity={1.2} form="rect" scale={[14, 6, 1]} position={[6, -5, -8]} color="#7c4dff" />
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
      camera={{ position: [0, 0, 18], fov: 34, near: 1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
