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
 *   - zero gravity; each body is sprung toward its own resting distance from the
 *     origin rather than toward the origin itself. A spring to a single point
 *     packs everything into the tightest possible clump — visually a dense blob
 *     that hides most of the logos. Springing to a shell keeps the cluster airy
 *     and layered, and it still re-forms after being scattered.
 *   - a slow swirl keeps the arrangement alive instead of dead-settling
 *   - the cursor is an immovable sphere that shoves bodies out of its way
 *   - collisions exchange momentum along the contact normal, and the tangential
 *     component induces spin so the logos tumble instead of sliding
 */

export interface SphereBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  radius: number;
  invMass: number;
  /** Distance from the origin this body is sprung toward. */
  restRadius: number;
}

export interface SolverOptions {
  /** Spring constant pulling bodies toward their rest shell. */
  attraction: number;
  /** Slow rotation about the view axis, so the cluster never looks frozen. */
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
  /** Radius of the cursor's collider. */
  pointerRadius: number;
}

export const defaultOptions: SolverOptions = {
  attraction: 2.4,
  swirl: 0.13,
  linearDamping: 1.35,
  angularDamping: 0.7,
  restitution: 0.45,
  spin: 1.5,
  upright: 2.2,
  pointerRadius: 1.5,
};

export function createBody(
  position: THREE.Vector3,
  radius: number,
  rng: () => number,
): SphereBody {
  return {
    position: position.clone(),
    // Its starting distance becomes its resting shell, so the cluster relaxes
    // back into the arrangement it was authored with.
    restRadius: position.length(),
    velocity: new THREE.Vector3(),
    // Random start orientation so the three logo repeats don't line up.
    // Yaw only: starting with an arbitrary 3D orientation would point a blank
    // pole at the camera for roughly a third of the spheres on first paint.
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, rng() * Math.PI * 2, 0),
    ),
    angularVelocity: new THREE.Vector3(
      (rng() - 0.5) * 0.08,
      (rng() - 0.5) * 0.9,
      (rng() - 0.5) * 0.08,
    ),
    radius,
    // Mass scales with volume, so bigger spheres shrug off smaller ones.
    invMass: 1 / (radius * radius * radius),
  };
}

// Scratch vectors — allocating inside the loop would churn the GC every frame.
const normal = new THREE.Vector3();
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
    pointerRadius,
  } = options;

  // Integrate forces.
  const linearDecay = Math.exp(-linearDamping * dt);
  const angularDecay = Math.exp(-angularDamping * dt);

  for (const body of bodies) {
    const distance = body.position.length();
    if (distance > 1e-4) {
      normal.copy(body.position).divideScalar(distance);
      // Spring toward the rest shell: pulls in when pushed out, pushes out when
      // squeezed in — which is what stops the cluster collapsing on itself.
      body.velocity.addScaledVector(normal, (body.restRadius - distance) * attraction * dt);

      // Swirl about the view axis, tangential to the current position.
      tangent.set(-body.position.y, body.position.x, 0);
      const tangentLength = tangent.length();
      if (tangentLength > 1e-4) {
        body.velocity.addScaledVector(tangent.divideScalar(tangentLength), swirl * dt);
      }
    }

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
