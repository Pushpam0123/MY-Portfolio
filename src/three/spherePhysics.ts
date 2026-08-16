import * as THREE from 'three';

export interface SphereBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  radius: number;
  invMass: number;

  anchor: THREE.Vector3;
}

export interface SolverOptions {
  attraction: number;

  swirl: number;

  linearDamping: number;
  angularDamping: number;

  restitution: number;

  spin: number;

  upright: number;

  facing: number;

  pointerRadius: number;

  pointerRestitution: number;

  pointerImpulse: number;

  maxSpeed: number;
}

export const defaultOptions: SolverOptions = {
  attraction: 3.1,
  swirl: 0.05,
  linearDamping: 1.25,
  angularDamping: 0.7,
  restitution: 0.4,
  spin: 1.5,
  upright: 2.2,
  facing: 1.5,
  pointerRadius: 1.7,
  pointerRestitution: 1.15,
  pointerImpulse: 0.42,
  maxSpeed: 26,
};

export function createBody(position: THREE.Vector3, radius: number, rng: () => number): SphereBody {
  return {
    position: position.clone(),

    anchor: position.clone(),
    velocity: new THREE.Vector3(),

    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * Math.PI * 2, 0)),
    angularVelocity: new THREE.Vector3(
      (rng() - 0.5) * 0.08,
      (rng() - 0.5) * 0.5,
      (rng() - 0.5) * 0.08,
    ),
    radius,

    invMass: 1 / (radius * radius * radius),
  };
}

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
    pointerRestitution,
    pointerImpulse,
    maxSpeed,
  } = options;

  const linearDecay = Math.exp(-linearDamping * dt);
  const angularDecay = Math.exp(-angularDamping * dt);

  const swirlAngle = swirl * dt;
  const swirlCos = Math.cos(swirlAngle);
  const swirlSin = Math.sin(swirlAngle);

  for (const body of bodies) {
    const { x, y } = body.anchor;
    body.anchor.x = x * swirlCos - y * swirlSin;
    body.anchor.y = x * swirlSin + y * swirlCos;

    displacement.subVectors(body.anchor, body.position);
    body.velocity.addScaledVector(displacement, attraction * dt);

    body.velocity.multiplyScalar(linearDecay);
    body.angularVelocity.multiplyScalar(angularDecay);
  }

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

      a.position.addScaledVector(normal, -overlap * (a.invMass / invMassSum) * CORRECTION);
      b.position.addScaledVector(normal, overlap * (b.invMass / invMassSum) * CORRECTION);

      relative.subVectors(b.velocity, a.velocity);
      const alongNormal = relative.dot(normal);
      if (alongNormal >= 0) continue;

      const magnitude = (-(1 + restitution) * alongNormal) / invMassSum;
      impulse.copy(normal).multiplyScalar(magnitude);
      a.velocity.addScaledVector(impulse, -a.invMass);
      b.velocity.addScaledVector(impulse, b.invMass);

      tangent.copy(relative).addScaledVector(normal, -alongNormal);
      torque.crossVectors(normal, tangent).multiplyScalar(spin * 0.05);
      a.angularVelocity.addScaledVector(torque, 1 / a.radius);
      b.angularVelocity.addScaledVector(torque, -1 / b.radius);
    }
  }

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
        body.velocity.addScaledVector(normal, -(1 + pointerRestitution) * alongNormal);
      }

      body.velocity.addScaledVector(pointerVelocity, pointerImpulse * Math.min(1.6, body.invMass));

      tangent.copy(relative).addScaledVector(normal, -alongNormal);
      torque.crossVectors(normal, tangent).multiplyScalar(spin * 0.04);
      body.angularVelocity.addScaledVector(torque, 1 / body.radius);
    }
  }

  for (const body of bodies) {
    const speed = body.velocity.length();
    if (speed > maxSpeed) body.velocity.multiplyScalar(maxSpeed / speed);

    body.position.addScaledVector(body.velocity, dt);

    const angularSpeed = body.angularVelocity.length();
    if (angularSpeed > 1e-4) {
      spinAxis.copy(body.angularVelocity).divideScalar(angularSpeed);
      spinQuat.setFromAxisAngle(spinAxis, angularSpeed * dt);
      body.quaternion.premultiply(spinQuat).normalize();
    }

    if (upright > 0) {
      uprightEuler.setFromQuaternion(body.quaternion, 'YXZ');
      uprightEuler.x = 0;
      uprightEuler.z = 0;
      uprightQuat.setFromEuler(uprightEuler);
      body.quaternion.slerp(uprightQuat, 1 - Math.exp(-upright * dt));

      body.angularVelocity.x *= 0.9;
      body.angularVelocity.z *= 0.9;
    }

    if (facing > 0) {
      uprightEuler.setFromQuaternion(body.quaternion, 'YXZ');
      uprightEuler.y = Math.round(uprightEuler.y / Math.PI) * Math.PI;
      uprightQuat.setFromEuler(uprightEuler);
      body.quaternion.slerp(uprightQuat, 1 - Math.exp(-facing * dt));
    }
  }
}

export function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
