"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** Target standing height in world units (feet on floor → top of body). */
const TARGET_HEIGHT = 7.2;
const MODEL_URL = "/models/sahur.glb";

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

/**
 * Sketchfab GLB Sahur (Eks.Art, CC BY 4.0) — positioned, scaled, and
 * lightly animated to match the arena movement API.
 */
export default function Sahur({ anim, reducedMotion = false }: SahurProps) {
  const root = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
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

    // Measure after Sketchfab node transforms, then normalize height.
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const height = Math.max(size.y, 0.001);
    const scale = TARGET_HEIGHT / height;
    clone.scale.setScalar(scale);

    const scaled = new THREE.Box3().setFromObject(clone);
    // Sit soles on y=0; center X/Z on the pivot for turning.
    clone.position.x = -(scaled.min.x + scaled.max.x) / 2;
    clone.position.y = -scaled.min.y;
    clone.position.z = -(scaled.min.z + scaled.max.z) / 2;

    return clone;
  }, [scene]);

  const materials = useMemo(() => {
    const list: THREE.MeshStandardMaterial[] = [];
    prepared.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const mat of mats) {
        if (mat && "emissive" in mat) {
          list.push(mat as THREE.MeshStandardMaterial);
        }
      }
    });
    return list;
  }, [prepared]);

  useEffect(() => {
    return () => {
      prepared.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose?.();
        }
      });
    };
  }, [prepared]);

  useFrame((_, dt) => {
    const a = anim.current;
    const motion = reducedMotion ? 0.15 : 1;
    const moving = a.moveAmount > 0.08;
    phase.current += dt * (moving ? 8.5 + a.moveAmount * 3.5 : 2) * motion;

    if (root.current) {
      root.current.position.set(a.x, 0, a.z);
      root.current.rotation.y = a.yaw;
      const punch = a.hitFlash > 0 ? 1 + a.hitFlash * 0.07 : 1;
      root.current.scale.setScalar(punch);
    }

    if (model.current) {
      const bob =
        Math.sin(phase.current * (moving ? 1 : 0.4)) *
        (moving ? 0.08 : 0.03) *
        motion;
      const lean = moving ? a.moveAmount * 0.1 * motion : 0;
      model.current.position.y = bob;
      model.current.rotation.x = lean;
      model.current.rotation.z =
        Math.sin(phase.current * 0.5) * 0.02 * motion * (moving ? 1 : 0.35);
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

useGLTF.preload(MODEL_URL);
