import * as THREE from 'three';

/**
 * A minimal impulse-based solver for a bag of spheres.
 *
 * Written by hand rather than pulled from a physics engine because every body
 * in this scene is a sphere: there is no arbitrary geometry, no joints, no
 * stacking, no friction cones. Rapier solves all of that and costs ~865 kB
 * gzipped (its WASM ships base64-inlined), which is several times the weight of
 * the entire rest of this site. Sphere-sphere resolution is about sixty lines
 * and behaves identically for this use case.
 *
 * Model:
 *   - zero gravity; each body is sprung toward its own anchor — the spot in the
 *     authored layout it started from — rather than toward the origin. A spring
 *     to a single shared point packs everything into the tightest possible
 *     clump, a dense blob that hides most of the logos. Springing to a shell of
 *     the right radius avoids that but does not fix an *angle*, so a cursor
 *     sweep slides bodies sideways along the shell and they never come back:
 *     the cluster keeps its silhouette while accumulating permanent holes.
 *     Per-body anchors keep the layout airy and make recovery exact.
 *   - the whole anchor field turns slowly, so the arrangement stays alive
 *     instead of dead-settling, and every body still has a slot to return to
 *   - the cursor is an immovable sphere that shoves bodies out of its way
 *   - collisions exchange momentum along the contact normal, and the tangential
 *     component induces spin so the logos tumble instead of sliding
 *   - orientation is then steered back toward camera-facing, so a knock spins a
 *     ball but does not leave it parked showing a blank patch
 */

export interface SphereBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  radius: number;
  invMass: number;
  /** The spot in the authored layout this body is sprung toward. */
  anchor: THREE.Vector3;
}

export interface SolverOptions {
  /** Spring constant pulling bodies toward their anchor. */
  attraction: number;
  /**
   * Radians per second the anchor field turns about the view axis.
   *
   * Rotating the anchors rather than nudging the bodies keeps the cluster
   * gently in motion without ever putting the target out of reach — a force
   * applied straight to the bodies would be permanently fighting the spring and
   * leave every ball resting slightly off its slot.
   */
  swirl: number;
  /** Velocity retained per second (exponential decay). */
  linearDamping: number;
  angularDamping: number;
  /** Collision bounciness, 0–1. */
  restitution: number;
  /** How strongly glancing contacts convert into spin. */
  spin: number;
  /**
   * Rate at which a body rights itself toward spinning about the vertical axis.
   *
   * The logos are laid around each texture's equator, so a sphere tumbling
   * freely spends much of its time showing a blank pole. Damping the tilt keeps
   * the marks facing the camera while still allowing lively collisions.
   */
  upright: number;
  /**
   * Rate at which a body's yaw settles back to pointing a logo at the camera.
   *
   * The texture carries the mark twice, half a turn apart, so the target yaw is
   * the nearest multiple of π. Without this the balls come to rest at whatever
   * arbitrary angle the last collision left them at, and roughly half the
   * cluster shows the blank gap between marks — which defeats the point of a
   * section whose whole job is to be scannable. Keeping it a spring rather than
   * a hard snap means a knock still visibly spins the ball; it just recovers.
   */
  facing: number;
  /** Radius of the cursor's collider. */
  pointerRadius: number;
}

export const defaultOptions: SolverOptions = {
  attraction: 2.4,
  swirl: 0.05,
  linearDamping: 1.35,
  angularDamping: 0.7,
  restitution: 0.45,
  spin: 1.5,
  upright: 2.2,
  facing: 1.5,
  pointerRadius: 1.5,
};

export function createBody(
  position: THREE.Vector3,
  radius: number,
  rng: () => number,
): SphereBody {
  return {
    position: position.clone(),
    // Its starting spot becomes its anchor, so however hard the cluster is
    // scattered it relaxes back into exactly the arrangement it was authored
    // with rather than into some equally-valid but hole-ridden rearrangement.
    anchor: position.clone(),
    velocity: new THREE.Vector3(),
    // Random start yaw, which the `facing` spring then unwinds — the cluster
    // visibly turns to face the reader over the first second instead of simply
    // being correct from frame one. Yaw only: an arbitrary 3D start orientation
    // would point a blank pole at the camera on first paint.
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, rng() * Math.PI * 2, 0),
    ),
    angularVelocity: new THREE.Vector3(
      (rng() - 0.5) * 0.08,
      (rng() - 0.5) * 0.5,
      (rng() - 0.5) * 0.08,
    ),
    radius,
    // Mass scales with volume, so bigger spheres shrug off smaller ones.
    invMass: 1 / (radius * radius * radius),
  };
}

// Scratch vectors — allocating inside the loop would churn the GC every frame.
const normal = new THREE.Vector3();
const displacement = new THREE.Vector3();
const relative = new THREE.Vector3();
const impulse = new THREE.Vector3();
const tangent = new THREE.Vector3();
const torque = new THREE.Vector3();
const spinAxis = new THREE.Vector3();
const spinQuat = new THREE.Quaternion();
const uprightEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const uprightQuat = new THREE.Quaternion();

/** Positional slop correction factor; below 1 to avoid jitter at rest. */
const CORRECTION = 0.72;

export function stepSolver(
  bodies: SphereBody[],
  pointer: THREE.Vector3 | null,
  pointerVelocity: THREE.Vector3,
  dt: number,
  options: SolverOptions = defaultOptions,
) {
  const {
    attraction,
    swirl,
    linearDamping,
    angularDamping,
    restitution,
    spin,
    upright,
    facing,
    pointerRadius,
  } = options;

  // Integrate forces.
  const linearDecay = Math.exp(-linearDamping * dt);
  const angularDecay = Math.exp(-angularDamping * dt);

  // Turn the anchor field one step about the view axis before anything is
  // sprung toward it, so the whole layout drifts as a piece.
  const swirlAngle = swirl * dt;
  const swirlCos = Math.cos(swirlAngle);
  const swirlSin = Math.sin(swirlAngle);

  for (const body of bodies) {
    const { x, y } = body.anchor;
    body.anchor.x = x * swirlCos - y * swirlSin;
    body.anchor.y = x * swirlSin + y * swirlCos;

    // Spring toward the anchor. Underdamped on purpose — a scattered cluster
    // swings back past its slot and settles, which reads as elastic rather
    // than as everything being dragged home on a rail.
    displacement.subVectors(body.anchor, body.position);
    body.velocity.addScaledVector(displacement, attraction * dt);

    body.velocity.multiplyScalar(linearDecay);
    body.angularVelocity.multiplyScalar(angularDecay);
  }

  // Resolve pairwise contacts. With ~17 bodies this is 136 checks — far cheaper
  // than the broad-phase structure that would be needed to avoid it.
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const a = bodies[i];
      const b = bodies[j];

      normal.subVectors(b.position, a.position);
      const distance = normal.length();
      const minDistance = a.radius + b.radius;
      if (distance >= minDistance || distance === 0) continue;

      normal.divideScalar(distance);
      const overlap = minDistance - distance;
      const invMassSum = a.invMass + b.invMass;

      // Push apart, weighted by mass.
      a.position.addScaledVector(normal, (-overlap * (a.invMass / invMassSum)) * CORRECTION);
      b.position.addScaledVector(normal, (overlap * (b.invMass / invMassSum)) * CORRECTION);

      relative.subVectors(b.velocity, a.velocity);
      const alongNormal = relative.dot(normal);
      if (alongNormal >= 0) continue; // already separating

      const magnitude = (-(1 + restitution) * alongNormal) / invMassSum;
      impulse.copy(normal).multiplyScalar(magnitude);
      a.velocity.addScaledVector(impulse, -a.invMass);
      b.velocity.addScaledVector(impulse, b.invMass);

      // Glancing contact → spin.
      tangent.copy(relative).addScaledVector(normal, -alongNormal);
      torque.crossVectors(normal, tangent).multiplyScalar(spin * 0.05);
      a.angularVelocity.addScaledVector(torque, 1 / a.radius);
      b.angularVelocity.addScaledVector(torque, -1 / b.radius);
    }
  }

  // The cursor: infinite mass, so it never gets pushed back.
  if (pointer) {
    for (const body of bodies) {
      normal.subVectors(body.position, pointer);
      const distance = normal.length();
      const minDistance = pointerRadius + body.radius;
      if (distance >= minDistance || distance === 0) continue;

      normal.divideScalar(distance);
      body.position.addScaledVector(normal, minDistance - distance);

      relative.subVectors(body.velocity, pointerVelocity);
      const alongNormal = relative.dot(normal);
      if (alongNormal < 0) {
        body.velocity.addScaledVector(normal, -(1 + restitution) * alongNormal);
      }

      tangent.copy(relative).addScaledVector(normal, -alongNormal);
      torque.crossVectors(normal, tangent).multiplyScalar(spin * 0.04);
      body.angularVelocity.addScaledVector(torque, 1 / body.radius);
    }
  }

  // Integrate position and orientation.
  for (const body of bodies) {
    body.position.addScaledVector(body.velocity, dt);

    const angularSpeed = body.angularVelocity.length();
    if (angularSpeed > 1e-4) {
      spinAxis.copy(body.angularVelocity).divideScalar(angularSpeed);
      spinQuat.setFromAxisAngle(spinAxis, angularSpeed * dt);
      body.quaternion.premultiply(spinQuat).normalize();
    }

    // Bleed off tilt so the sphere keeps rotating about its vertical axis,
    // holding the logo band toward the camera.
    if (upright > 0) {
      uprightEuler.setFromQuaternion(body.quaternion, 'YXZ');
      uprightEuler.x = 0;
      uprightEuler.z = 0;
      uprightQuat.setFromEuler(uprightEuler);
      body.quaternion.slerp(uprightQuat, 1 - Math.exp(-upright * dt));

      body.angularVelocity.x *= 0.9;
      body.angularVelocity.z *= 0.9;
    }

    // Then steer the remaining yaw to the nearest of the texture's two marks.
    //
    // SphereGeometry's default phiStart puts u = 0.25 at the camera-facing point
    // when yaw is zero, and the second mark sits half a turn away at u = 0.75 —
    // so any multiple of π presents a logo, and the nearest one is never more
    // than a half-turn of correction away.
    if (facing > 0) {
      uprightEuler.setFromQuaternion(body.quaternion, 'YXZ');
      uprightEuler.y = Math.round(uprightEuler.y / Math.PI) * Math.PI;
      uprightQuat.setFromEuler(uprightEuler);
      body.quaternion.slerp(uprightQuat, 1 - Math.exp(-facing * dt));
    }
  }
}

/**
 * Deterministic RNG so the cluster's starting arrangement is identical on every
 * load — a portfolio that looks different in each screenshot is harder to trust.
 */
export function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
