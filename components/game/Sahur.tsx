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
 */
const LEG_MAX_Z = 1.55;
const ARM_MIN_Z = 1.85;
const ARM_MAX_Z = 3.95;
const TORSO_RADIUS = 0.68;

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
      Math.sin(phase.current) * (moving ? 1 : 0.22) * motion;
    const swingAbs = Math.abs(swing);

    if (model.current) {
      const bob =
        Math.sin(phase.current * 2) *
        (moving ? 0.16 : 0.05) *
        motion;
      const lean = moving ? a.moveAmount * 0.18 * motion : 0;
      const sway = swing * (moving ? 0.1 : 0.025) * motion;
      model.current.position.y = bob + swingAbs * (moving ? 0.06 : 0);
      model.current.rotation.x = lean;
      model.current.rotation.z = sway;
    }

    const rig = limbRig.current;
    if (rig) {
      const amount = reducedMotion
        ? 0.12
        : moving
          ? Math.max(0.85, a.moveAmount * 1.15)
          : 0.35;
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
  const strideAmp = 0.95 * amp;
  const liftAmp = 0.75 * amp;
  const armAmp = 0.85 * amp;

  for (let i = 0; i < bind.length; i += 3) {
    const x = bind[i];
    const y = bind[i + 1];
    const z = bind[i + 2];
    const side = x >= -0.05 ? 1 : -1;
    const radial = Math.hypot(x, y);

    let ox = x;
    let oy = y;
    let oz = z;

    // Legs + feet — stride in Y, lift in Z (visible from front camera)
    if (z < LEG_MAX_Z && radial > 0.16) {
      const t = Math.pow(1 - z / LEG_MAX_Z, 1.25);
      const stride = Math.sin(phase) * side;
      oy = y - stride * strideAmp * t;
      oz = z + Math.max(0, -Math.cos(phase) * side) * liftAmp * t;
      ox = x + side * 0.08 * amp * t;
    }

    // Arms + bat — counter-phase
    if (z > ARM_MIN_Z && z < ARM_MAX_Z && radial > TORSO_RADIUS) {
      const t = (z - ARM_MIN_Z) / (ARM_MAX_Z - ARM_MIN_Z);
      const fall = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
      const stride = -Math.sin(phase) * side;
      oy = y - stride * armAmp * fall;
      oz = z + stride * 0.2 * amp * fall;
      ox = x + side * 0.04 * amp * fall;
    }

    arr[i] = ox;
    arr[i + 1] = oy;
    arr[i + 2] = oz;
  }

  position.needsUpdate = true;
}

useGLTF.preload(MODEL_URL);
