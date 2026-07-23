"use client";

import { useEffect, useMemo, useRef } from "react";
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
const ARM_MIN_Z = 1.9;
const ARM_MAX_Z = 3.85;
const TORSO_RADIUS = 0.72;

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
  mesh: THREE.Mesh;
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
  const { scene } = useGLTF(MODEL_URL);

  const { prepared, materials, limbRig } = useMemo(() => {
    const clone = scene.clone(true);
    let targetMesh: THREE.Mesh | null = null;

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (!targetMesh) targetMesh = mesh;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const mat of mats) {
        if (mat && "emissive" in mat) {
          const std = mat as THREE.MeshStandardMaterial;
          std.emissive = std.emissive?.clone?.() ?? new THREE.Color(0x000000);
          std.envMapIntensity = Math.max(std.envMapIntensity ?? 1, 0.85);
        }
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const height = Math.max(size.y, 0.001);
    const scale = TARGET_HEIGHT / height;
    clone.scale.setScalar(scale);

    const scaled = new THREE.Box3().setFromObject(clone);
    clone.position.x = -(scaled.min.x + scaled.max.x) / 2;
    clone.position.y = -scaled.min.y;
    clone.position.z = -(scaled.min.z + scaled.max.z) / 2;

    const matList: THREE.MeshStandardMaterial[] = [];
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const mat of mats) {
        if (mat && "emissive" in mat) {
          matList.push(mat as THREE.MeshStandardMaterial);
        }
      }
    });

    let rig: LimbRig | null = null;
    if (targetMesh) {
      const mesh = targetMesh as THREE.Mesh;
      // Own geometry copy so we can morph without mutating the cached GLTF.
      mesh.geometry = mesh.geometry.clone();
      const position = mesh.geometry.attributes
        .position as THREE.BufferAttribute;
      rig = {
        mesh,
        bind: new Float32Array(position.array as Float32Array),
        position,
      };
    }

    return { prepared: clone, materials: matList, limbRig: rig };
  }, [scene]);

  useEffect(() => {
    return () => {
      prepared.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry?.dispose?.();
      });
    };
  }, [prepared]);

  useFrame((_, dt) => {
    const a = anim.current;
    const motion = reducedMotion ? 0.12 : 1;
    const moving = a.moveAmount > 0.08;
    const cadence = moving ? 9.2 + a.moveAmount * 4.2 : 2.1;
    phase.current += dt * cadence * motion;

    if (root.current) {
      root.current.position.set(a.x, 0, a.z);
      // GLB faces -Z in yaw=0; camera sits on +Z, so flip to show the face.
      root.current.rotation.y = a.yaw + Math.PI;
      const punch = a.hitFlash > 0 ? 1 + a.hitFlash * 0.07 : 1;
      root.current.scale.setScalar(punch);
    }

    const swing =
      Math.sin(phase.current) * (moving ? 1 : 0.18) * motion;
    const swingAbs = Math.abs(swing);

    if (model.current) {
      const bob =
        Math.sin(phase.current * 2) *
        (moving ? 0.14 : 0.04) *
        motion;
      const lean = moving ? a.moveAmount * 0.16 * motion : 0;
      const sway = swing * (moving ? 0.08 : 0.02) * motion;
      model.current.position.y = bob + swingAbs * (moving ? 0.05 : 0);
      model.current.rotation.x = lean;
      model.current.rotation.z = sway;
    }

    if (limbRig) {
      applyLimbSwing(
        limbRig,
        phase.current,
        reducedMotion ? 0.08 : moving ? Math.max(0.55, a.moveAmount) : 0.16,
      );
    }

    for (const mat of materials) {
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
  const amp = THREE.MathUtils.clamp(moveAmount, 0, 1.6);
  // Face looks down -Y in mesh space; stride along Y reads as depth, so also
  // lift feet in Z and flare in X so the walk is obvious from the front camera.
  const strideAmp = 0.55 * amp;
  const liftAmp = 0.42 * amp;
  const armAmp = 0.5 * amp;

  for (let i = 0; i < bind.length; i += 3) {
    const x = bind[i];
    const y = bind[i + 1];
    const z = bind[i + 2];
    const side = x >= -0.05 ? 1 : -1;
    const radial = Math.hypot(x, y);

    let ox = x;
    let oy = y;
    let oz = z;

    // Legs + feet
    if (z < LEG_MAX_Z && radial > 0.18) {
      const t = Math.pow(1 - z / LEG_MAX_Z, 1.35);
      const stride = Math.sin(phase) * side;
      oy = y - stride * strideAmp * t;
      oz = z + Math.max(0, -Math.cos(phase) * side) * liftAmp * t;
      ox = x + side * 0.05 * amp * t;
    }

    // Arms + bat — counter-phase
    if (z > ARM_MIN_Z && z < ARM_MAX_Z && radial > TORSO_RADIUS) {
      const t = (z - ARM_MIN_Z) / (ARM_MAX_Z - ARM_MIN_Z);
      const fall = Math.sin(Math.PI * t);
      const stride = -Math.sin(phase) * side;
      oy = y - stride * armAmp * fall;
      oz = z + stride * 0.12 * amp * fall;
    }

    arr[i] = ox;
    arr[i + 1] = oy;
    arr[i + 2] = oz;
  }

  position.needsUpdate = true;
}

useGLTF.preload(MODEL_URL);
