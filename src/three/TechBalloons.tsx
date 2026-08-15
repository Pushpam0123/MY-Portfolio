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
 * Zero gravity plus a spring per sphere toward its own slot in the layout: the
 * spheres hang together as a cluster, scatter when the cursor drives through
 * them, then re-gather into the same arrangement. The cursor is a real collider
 * in the simulation, not a visual effect layered on top, so the scattering is
 * genuinely solved rather than faked.
 *
 * The solver lives in ./spherePhysics — see the note there on why this does not
 * use a physics engine.
 */

/** Approximate width of the settled cluster, in world units. */
const CLUSTER_WIDTH = 17;

/** Fixed timestep; the frame's elapsed time is consumed in chunks of this. */
const FIXED_STEP = 1 / 120;

/** Seconds each ball takes to swell to full size, and the gap between them. */
const POP_DURATION = 0.55;
const POP_STAGGER = 0.045;

/**
 * How far beyond a ball's surface the pointer still counts as "on" it.
 *
 * Must clear the cursor's own collider radius: the cursor shoves bodies away,
 * so the gap between the pointer and the nearest surface never closes below
 * that radius and a tighter threshold would simply never match.
 */
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
      const spread = 5.9;

      // Wider than it is tall, and flatter still in depth. A round cloud leaves
      // dead black margins on a landscape stage, and depth spread is the axis
      // that costs the most legibility — a ball pushed far back is small and
      // its mark unreadable.
      return createBody(
        new THREE.Vector3(
          Math.cos(theta) * ring * spread * 1.34,
          y * spread * 0.64,
          Math.sin(theta) * ring * spread * 0.42,
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

    // On a phone, fitting the full width shrinks the cluster to a speck marooned
    // in empty space. Framing a narrower slice keeps the spheres large and lets
    // the outermost ones run off the edges — which is how the composition is
    // meant to read anyway. Only slightly narrower, though: cropped hard enough
    // that the outer balls are sliced clean in half, it stops reading as a pit
    // that overflows the frame and starts reading as a layout mistake.
    //
    // Keyed to viewport width, matching the CSS breakpoint, rather than to the
    // canvas aspect: the stage is short enough on a phone that its aspect sits
    // right on 1.0, so an aspect test flips branches — and yanks the camera
    // back mid-scroll — on a few pixels of address-bar movement.
    const narrow = size.width < 768;
    const target = narrow ? CLUSTER_WIDTH * 0.86 : CLUSTER_WIDTH;
    const needed = target / 2 / (Math.tan(vFov / 2) * aspect);

    cam.position.z = Math.max(17, needed + 2);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

interface SceneProps {
  /**
   * Gate for the entry animation. The canvas is mounted well before the section
   * is on screen so it is never caught rendering blank, which means "mounted" is
   * the wrong cue to animate on — the balls would finish arriving while still
   * below the fold. The parent flips this only once the section is genuinely in
   * view.
   */
  start: boolean;
  onFocus?: (name: string | null) => void;
}

function Cluster({ start, onFocus }: SceneProps) {
  const bodies = useStartBodies();
  const textures = useBallTextures();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const cursor = useRef<THREE.Mesh>(null);

  const pointerWorld = useMemo(() => new THREE.Vector3(), []);
  const pointerPrev = useMemo(() => new THREE.Vector3(), []);
  const pointerVelocity = useMemo(() => new THREE.Vector3(), []);
  const pointerActive = useRef(false);
  const accumulator = useRef(0);
  const elapsed = useRef(0);
  const focused = useRef<string | null>(null);
  const gl = useThree((state) => state.gl);

  // Stand the cursor down when it leaves the canvas. R3F simply stops updating
  // `pointer` on the way out, so without this the collider stays parked wherever
  // it was last seen — holding a hole open in the cluster, and leaving the
  // violet marker sitting in the middle of the scene long after the reader has
  // scrolled away.
  useEffect(() => {
    const canvas = gl.domElement;
    const standDown = () => {
      pointerActive.current = false;
    };
    canvas.addEventListener('pointerleave', standDown);
    return () => canvas.removeEventListener('pointerleave', standDown);
  }, [gl]);

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

    // Entry: each ball swells into place, staggered by index. Driven here rather
    // than by GSAP because the mesh transform is already rewritten every frame
    // from the solver — a tween on the same property would just be overwritten.
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
      // Overshoot slightly past 1 and settle — a linear ramp reads as a fade-in
      // rather than something arriving.
      const eased = t >= 1 ? 1 : 1 - (1 - t) ** 3 * Math.cos(t * Math.PI * 0.9);
      mesh.scale.setScalar(body.radius * eased);

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
          key={ball.id}
          ref={(node) => {
            meshes.current[i] = node;
          }}
          // Starts at zero and is grown by the entry ramp above.
          scale={0}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 48, 48]} />
          {/*
            Restrained rather than showroom-glossy. The previous settings —
            near-mirror roughness, full clearcoat, heavy iridescence, and a
            bright environment — blew a white specular hotspot across the middle
            of every ball, which is exactly where the logo is. Softening the
            reflection keeps the depth cue and hands the centre back to the mark.
          */}
          <meshPhysicalMaterial
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

function Scene({ start, onFocus }: SceneProps) {
  return (
    <>
      <FitCamera />
      <ambientLight intensity={1.05} />
      <spotLight position={[14, 15, 16]} angle={0.5} penumbra={1} intensity={1.1} castShadow />
      {/* Violet kicker from behind and below, so the balls separate from the
          near-black page instead of dissolving into it at their edges. */}
      <directionalLight position={[-9, -7, -6]} intensity={0.5} color="#8b6cff" />

      <Cluster start={start} onFocus={onFocus} />

      {/*
        Environment built from Lightformers rather than a `preset`. Presets are
        fetched from a CDN at runtime — an external dependency this site does not
        otherwise have. These give the same studio sheen with nothing to download.
      */}
      <Environment resolution={256}>
        <Lightformer intensity={1.1} form="circle" scale={14} position={[0, 7, -9]} />
        <Lightformer intensity={0.9} form="ring" scale={10} position={[-8, 2, -6]} color="#c4b5fd" />
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

export default function TechBalloons({ start, onFocus }: SceneProps) {
  return (
    <Canvas
      className="stack__canvas"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 18], fov: 34, near: 1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Scene start={start} onFocus={onFocus} />
      </Suspense>
    </Canvas>
  );
}
