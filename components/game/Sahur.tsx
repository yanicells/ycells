"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** Target standing height in world units (feet on floor → top of body). */
const TARGET_HEIGHT = 7.2;
const MODEL_URL = "/models/sahur.glb";

/**
 * Mesh-local Z is height on this Sketchfab export (feet≈0, head≈5.85).
 * Limb swing is a fake walk cycle — the GLB has no skeleton/animations.
 * Face ≈ -Y; stride rotates limbs in the YZ plane (around local X).
 */
const LEG_MAX_Z = 1.55;
const HIP_Z = 1.42;
const LEG_CORE_RADIUS = 0.16;
const ARM_MIN_Z = 1.75;
const ARM_MAX_Z = 4.05;
const SHOULDER_Z = 3.35;
const TORSO_RADIUS = 0.68;
/** Bat / stick can hang below the arm band — catch by outer radius. */
const BAT_RADIUS = 0.92;
/**
 * Amps tuned for the elevated FRONT follow cam (depth foreshortens Y-stride).
 * Prefer lift (Z) + lateral (X) so opposite legs read in silhouette.
 */
const LEG_STRIDE_RAD = 0.95;
const LEG_LIFT = 1.05;
const LEG_LATERAL = 0.42;
const ARM_STRIDE_RAD = 1.15;
const ARM_LIFT = 0.55;
const ARM_LATERAL = 0.48;

export type SahurAnimState = {
  x: number;
  z: number;
  yaw: number;
  moveAmount: number;
  hitFlash: number;
};

type SahurProps = {
  anim: React.MutableRefObject<SahurAnimState>;
  reducedMotion?: boolean;
};

type LimbRig = {
  bind: Float32Array;
  position: THREE.BufferAttribute;
  geometry: THREE.BufferGeometry;
};

/**
 * Sketchfab GLB Sahur (Eks.Art, CC BY 4.0) — grounded, scaled, with a
 * procedural limb walk cycle (vertex deformation; asset is unrigged).
 */
export default function Sahur({ anim, reducedMotion = false }: SahurProps) {
  const root = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const limbRig = useRef<LimbRig | null>(null);
  const materials = useRef<THREE.MeshStandardMaterial[]>([]);
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const matList: THREE.MeshStandardMaterial[] = [];
    let rig: LimbRig | null = null;

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Fresh geometry so we can morph without touching the GLTF cache.
      mesh.geometry = mesh.geometry.clone();
      const geometry = mesh.geometry;
      const position = geometry.attributes.position as THREE.BufferAttribute;
      position.setUsage(THREE.DynamicDrawUsage);
      geometry.computeBoundingSphere();
      // Generous radius so swung limbs never frustum-cull mid-stride.
      if (geometry.boundingSphere) {
        geometry.boundingSphere.radius = Math.max(
          geometry.boundingSphere.radius * 1.8,
          6,
        );
      }
      if (!rig) {
        rig = {
          bind: Float32Array.from(position.array as ArrayLike<number>),
          position,
          geometry,
        };
      }

      const srcMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      const clonedMats = srcMats.map((mat) => {
        if (mat && "emissive" in mat) {
          const std = (mat as THREE.MeshStandardMaterial).clone();
          std.emissive = new THREE.Color(0x000000);
          std.envMapIntensity = Math.max(std.envMapIntensity ?? 1, 0.85);
          matList.push(std);
          return std;
        }
        return mat;
      });
      mesh.material = Array.isArray(mesh.material)
        ? (clonedMats as THREE.Material[])
        : (clonedMats[0] as THREE.Material);
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    clone.scale.setScalar(TARGET_HEIGHT / Math.max(size.y, 0.001));

    const scaled = new THREE.Box3().setFromObject(clone);
    clone.position.x = -(scaled.min.x + scaled.max.x) / 2;
    clone.position.y = -scaled.min.y;
    clone.position.z = -(scaled.min.z + scaled.max.z) / 2;

    limbRig.current = rig;
    materials.current = matList;
    return clone;
  }, [scene]);

  useFrame((_, dt) => {
    const a = anim.current;
    const motion = reducedMotion ? 0.12 : 1;
    const moving = a.moveAmount > 0.08;
    // Walk cadence punches steps; idle keeps a slow fidget pulse.
    const cadence = moving ? 12.5 + a.moveAmount * 5.5 : 3.0;
    phase.current += dt * cadence * motion;

    if (root.current) {
      root.current.position.set(a.x, 0, a.z);
      // GLB backs the camera at yaw=0; flip so the face reads front-on.
      root.current.rotation.y = a.yaw + Math.PI;
      const punch = a.hitFlash > 0 ? 1 + a.hitFlash * 0.07 : 1;
      root.current.scale.setScalar(punch);
    }

    const swing =
      Math.sin(phase.current) * (moving ? 1 : 0.32) * motion;
    const swingAbs = Math.abs(swing);
    const cosSwing = Math.cos(phase.current);
    const stepPulse = Math.sin(phase.current * 2);

    if (model.current) {
      // Whole-body sells walking even when limb depth is foreshortened.
      const bob = stepPulse * (moving ? 0.42 : 0.1) * motion;
      const stepPop = swingAbs * (moving ? 0.18 : 0.04) * motion;
      const lean = moving ? 0.12 + a.moveAmount * 0.38 * motion : 0.06 * motion;
      const hipSway = swing * (moving ? 0.34 : 0.08) * motion;
      const torsoTwist = swing * (moving ? 0.28 : 0.06) * motion;
      const hipRoll = cosSwing * (moving ? 0.14 : 0.035) * motion;
      // Idle weight-shift fidget (asymmetric so it doesn't look like a walk).
      const fidget = !moving
        ? Math.sin(phase.current * 0.65 + 0.7) * 0.06 * motion
        : 0;
      model.current.position.y = bob + stepPop;
      model.current.position.x = hipSway * 0.55 + fidget;
      // Slight vertical squash on each footfall.
      const squash = moving ? 1 - Math.max(0, stepPulse) * 0.04 * motion : 1;
      model.current.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
      model.current.rotation.x = lean;
      model.current.rotation.y = torsoTwist + fidget * 0.7;
      model.current.rotation.z = hipSway + hipRoll * 0.65 + fidget * 0.9;
    }

    const rig = limbRig.current;
    if (rig) {
      const amount = reducedMotion
        ? 0.18
        : moving
          ? Math.max(1.25, 0.85 + a.moveAmount * 0.95)
          : 0.58;
      applyLimbSwing(rig, phase.current, amount, moving);
    }

    for (const mat of materials.current) {
      if (a.hitFlash > 0) {
        mat.emissive.set("#ff8866");
        mat.emissiveIntensity = a.hitFlash * 0.85;
      } else {
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group ref={root}>
      <group ref={model}>
        <primitive object={prepared} />
      </group>
    </group>
  );
}

function applyLimbSwing(
  rig: LimbRig,
  phase: number,
  moveAmount: number,
  moving: boolean,
) {
  const { bind, position } = rig;
  const arr = position.array as Float32Array;
  // Guard against a disposed/replaced attribute after HMR or remount.
  if (!arr || arr.length !== bind.length) return;
  const amp = THREE.MathUtils.clamp(moveAmount, 0, 1.8);

  // Idle: softer legs, livelier arms so fidget reads without fake-walking.
  const legScale = moving ? 1 : 0.55;
  const armScale = moving ? 1 : 0.85;
  const legAng = LEG_STRIDE_RAD * amp * legScale;
  const liftAmp = LEG_LIFT * amp * (moving ? 1 : 0.3);
  const latAmp = LEG_LATERAL * amp * (moving ? 1 : 0.4);
  const armAng = ARM_STRIDE_RAD * amp * armScale;
  const armLift = ARM_LIFT * amp * (moving ? 1 : 0.4);
  const armLat = ARM_LATERAL * amp * (moving ? 1 : 0.5);
  const sinP = Math.sin(phase);
  const cosP = Math.cos(phase);
  // Secondary harmonic = knee crease on the swinging leg.
  const kneeKick = moving ? Math.max(0, Math.sin(phase * 2)) * 0.28 * amp : 0;

  for (let i = 0; i < bind.length; i += 3) {
    const x = bind[i];
    const y = bind[i + 1];
    const z = bind[i + 2];
    const side = x >= -0.05 ? 1 : -1;
    const radial = Math.hypot(x, y);

    let ox = x;
    let oy = y;
    let oz = z;

    // Bat hanging into the lower band — don't treat as a leg.
    const isBat =
      radial > BAT_RADIUS && z < ARM_MAX_Z && Math.abs(x) > 0.35;

    // Legs — hip pivot (YZ stride) + bold lift/lateral for front-cam read.
    if (!isBat && z < LEG_MAX_Z && radial > LEG_CORE_RADIUS && Math.abs(x) > 0.1) {
      // Soft-skin near hip; full weight on shins/feet. Three.js smoothstep is (x,min,max).
      const attach =
        1 - THREE.MathUtils.smoothstep(z, LEG_MAX_Z - 0.5, LEG_MAX_Z);
      const mask = THREE.MathUtils.smoothstep(radial, LEG_CORE_RADIUS, 0.36);
      const sideSep = THREE.MathUtils.smoothstep(Math.abs(x), 0.1, 0.26);
      const w = attach * mask * sideSep;
      const shin =
        THREE.MathUtils.smoothstep(z, 0.05, 0.85) *
        (1 - THREE.MathUtils.smoothstep(z, 0.85, 1.35));
      // Swinging leg: phase where this side advances toward -Y.
      const swingGate = Math.max(0, -cosP * side);
      const plantGate = Math.max(0, cosP * side);
      // Negative angle drives the foot toward -Y (facing direction).
      const theta =
        (-sinP * side * legAng + kneeKick * side * shin * swingGate) * w;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const dy = y;
      const dz = z - HIP_Z;
      oy = dy * c - dz * s;
      oz = HIP_Z + dy * s + dz * c;
      // Clear foot lift on the swinging leg (front-cam readable).
      const foot = 1 - THREE.MathUtils.smoothstep(z, 0.1, 1.05);
      oz += swingGate * liftAmp * w * foot;
      // Planted leg compresses slightly — sells weight transfer.
      oz -= plantGate * 0.12 * amp * w * foot;
      // Lateral step so opposite legs diverge in silhouette.
      ox = x + side * (0.16 + swingGate * latAmp) * amp * w;
    }

    // Arms + bat — counter-phase shoulder pivot with front-cam lateral read.
    const inArmBand = z > ARM_MIN_Z && z < ARM_MAX_Z && radial > TORSO_RADIUS;
    if (inArmBand || isBat) {
      const band = inArmBand
        ? THREE.MathUtils.smoothstep(z, ARM_MIN_Z, ARM_MIN_Z + 0.28)
        : THREE.MathUtils.smoothstep(radial, BAT_RADIUS, BAT_RADIUS + 0.3);
      const top =
        1 - THREE.MathUtils.smoothstep(z, ARM_MAX_Z - 0.28, ARM_MAX_Z);
      const out = THREE.MathUtils.smoothstep(
        radial,
        TORSO_RADIUS,
        TORSO_RADIUS + 0.22,
      );
      const w = Math.min(1, band * top * out * (isBat ? 1.25 : 1));
      // Counter to legs: when that leg goes forward (-Y), this arm swings back (+Y).
      const theta = sinP * side * armAng * w;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const dy = y;
      const dz = z - SHOULDER_Z;
      oy = dy * c - dz * s;
      oz = SHOULDER_Z + dy * s + dz * c;
      // Forward arm lifts + flares out; back arm tucks — bat reads in silhouette.
      const forwardGate = Math.max(0, sinP * side);
      const backGate = Math.max(0, -sinP * side);
      oz += (forwardGate * armLift - backGate * armLift * 0.35) * w;
      ox =
        x +
        side *
          (0.14 + forwardGate * armLat - backGate * armLat * 0.45) *
          amp *
          w;
      // Extra bat tip travel along swing (outer verts).
      if (isBat) {
        oy -= sinP * side * 0.55 * amp * w;
      }
    }

    arr[i] = ox;
    arr[i + 1] = oy;
    arr[i + 2] = oz;
  }

  position.needsUpdate = true;
}

useGLTF.preload(MODEL_URL);
