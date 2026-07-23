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
const ARM_MIN_Z = 1.85;
const ARM_MAX_Z = 3.95;
const SHOULDER_Z = 3.35;
const TORSO_RADIUS = 0.68;
/** Peak leg swing (rad) — bold so the cycle reads from the follow cam. */
const LEG_STRIDE_RAD = 0.72;
const LEG_LIFT = 0.55;
const ARM_STRIDE_RAD = 0.95;
const ARM_LIFT = 0.32;

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
      const position = mesh.geometry.attributes
        .position as THREE.BufferAttribute;
      if (!rig) {
        rig = {
          bind: Float32Array.from(position.array as ArrayLike<number>),
          position,
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
    const cadence = moving ? 10 + a.moveAmount * 4.5 : 2.4;
    phase.current += dt * cadence * motion;

    if (root.current) {
      root.current.position.set(a.x, 0, a.z);
      // GLB backs the camera at yaw=0; flip so the face reads front-on.
      root.current.rotation.y = a.yaw + Math.PI;
      const punch = a.hitFlash > 0 ? 1 + a.hitFlash * 0.07 : 1;
      root.current.scale.setScalar(punch);
    }

    const swing =
      Math.sin(phase.current) * (moving ? 1 : 0.28) * motion;
    const swingAbs = Math.abs(swing);
    const cosSwing = Math.cos(phase.current);

    if (model.current) {
      // Whole-body read: bob, hip sway, torso twist, forward lean.
      const bob =
        Math.sin(phase.current * 2) *
        (moving ? 0.28 : 0.06) *
        motion;
      const stepPop = swingAbs * (moving ? 0.12 : 0.02) * motion;
      const lean = moving ? a.moveAmount * 0.32 * motion : 0.04 * motion;
      const hipSway = swing * (moving ? 0.22 : 0.04) * motion;
      const torsoTwist = swing * (moving ? 0.18 : 0.03) * motion;
      const hipYaw = cosSwing * (moving ? 0.08 : 0.015) * motion;
      model.current.position.y = bob + stepPop;
      model.current.position.x = hipSway * 0.35;
      model.current.rotation.x = lean;
      model.current.rotation.y = torsoTwist;
      model.current.rotation.z = hipSway + hipYaw * 0.5;
    }

    const rig = limbRig.current;
    if (rig) {
      const amount = reducedMotion
        ? 0.14
        : moving
          ? Math.max(1.05, a.moveAmount * 1.35)
          : 0.42;
      applyLimbSwing(rig, phase.current, amount);
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

function applyLimbSwing(rig: LimbRig, phase: number, moveAmount: number) {
  const { bind, position } = rig;
  const arr = position.array as Float32Array;
  const amp = THREE.MathUtils.clamp(moveAmount, 0, 1.8);

  const legAng = LEG_STRIDE_RAD * amp;
  const liftAmp = LEG_LIFT * amp;
  const armAng = ARM_STRIDE_RAD * amp;
  const armLift = ARM_LIFT * amp;
  const sinP = Math.sin(phase);
  const cosP = Math.cos(phase);

  for (let i = 0; i < bind.length; i += 3) {
    const x = bind[i];
    const y = bind[i + 1];
    const z = bind[i + 2];
    const side = x >= -0.05 ? 1 : -1;
    const radial = Math.hypot(x, y);

    let ox = x;
    let oy = y;
    let oz = z;

    // Legs — rotate around hip in YZ so feet arc forward/back (toward -Y).
    if (z < LEG_MAX_Z && radial > LEG_CORE_RADIUS) {
      // Soft-skin near hip; full weight on shins/feet. Three.js smoothstep is (x,min,max).
      const attach =
        1 - THREE.MathUtils.smoothstep(z, LEG_MAX_Z - 0.42, LEG_MAX_Z);
      const mask = THREE.MathUtils.smoothstep(radial, LEG_CORE_RADIUS, 0.4);
      const w = attach * mask;
      // Negative angle drives the foot toward -Y (facing direction).
      const theta = -sinP * side * legAng * w;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const dy = y;
      const dz = z - HIP_Z;
      oy = dy * c - dz * s;
      oz = HIP_Z + dy * s + dz * c;
      // Planted vs swinging foot: lift the one going forward.
      const liftGate = Math.max(0, -cosP * side);
      const foot = 1 - THREE.MathUtils.smoothstep(z, 0.15, 0.95);
      oz += liftGate * liftAmp * w * foot;
      ox = x + side * 0.12 * amp * w;
    }

    // Arms + bat — counter-phase shoulder pivot (opposite of legs).
    if (z > ARM_MIN_Z && z < ARM_MAX_Z && radial > TORSO_RADIUS) {
      const band = THREE.MathUtils.smoothstep(z, ARM_MIN_Z, ARM_MIN_Z + 0.35);
      const top =
        1 - THREE.MathUtils.smoothstep(z, ARM_MAX_Z - 0.35, ARM_MAX_Z);
      const out = THREE.MathUtils.smoothstep(radial, TORSO_RADIUS, TORSO_RADIUS + 0.35);
      const w = band * top * out;
      // Counter to legs: when that leg goes forward (-Y), this arm swings back (+Y).
      const theta = sinP * side * armAng * w;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const dy = y;
      const dz = z - SHOULDER_Z;
      oy = dy * c - dz * s;
      oz = SHOULDER_Z + dy * s + dz * c;
      // Slight upward flick + outward on the forward arm for bat read.
      const forwardGate = Math.max(0, sinP * side);
      oz += forwardGate * armLift * w;
      ox = x + side * (0.1 + forwardGate * 0.14) * amp * w;
    }

    arr[i] = ox;
    arr[i + 1] = oy;
    arr[i + 2] = oz;
  }

  position.needsUpdate = true;
}

useGLTF.preload(MODEL_URL);
