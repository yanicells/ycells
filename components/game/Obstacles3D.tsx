"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Obstacle, ObstacleKind } from "./obstacles";

type Props = {
  obstaclesRef: React.MutableRefObject<Obstacle[]>;
};

function makeObstacleMesh(kind: ObstacleKind, w: number, d: number, h: number): THREE.Group {
  const g = new THREE.Group();
  const woodDark = new THREE.MeshStandardMaterial({
    color: "#2a2420",
    roughness: 0.55,
    metalness: 0.05,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: "#5a4634",
    roughness: 0.5,
  });
  const cylMat = new THREE.MeshStandardMaterial({
    color: "#1a1612",
    roughness: 0.7,
    metalness: 0.1,
  });
  const blockMat = new THREE.MeshStandardMaterial({
    color: "#12100e",
    roughness: 0.85,
    metalness: 0.05,
    emissive: "#3a1814",
    emissiveIntensity: 0.25,
  });

  if (kind === "bat") {
    const len = Math.max(w, d);
    const rad = Math.min(w, d) * 0.22;
    const barrel = new THREE.Mesh(
      new THREE.CapsuleGeometry(rad, len * 0.7, 6, 10),
      woodDark,
    );
    barrel.castShadow = true;
    barrel.rotation.z = Math.PI / 2;
    g.add(barrel);
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, len * 0.35, 8),
      handleMat,
    );
    handle.castShadow = true;
    handle.position.x = len * 0.25;
    handle.rotation.z = Math.PI / 2;
    g.add(handle);
  } else if (kind === "cylinder") {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.5, w * 0.5, h, 16),
      cylMat,
    );
    mesh.castShadow = true;
    g.add(mesh);
  } else {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blockMat);
    mesh.castShadow = true;
    g.add(mesh);
  }

  return g;
}

/** Imperative 3D obstacles synced from the mutable game list. */
export default function Obstacles3D({ obstaclesRef }: Props) {
  const root = useRef<THREE.Group>(null);
  const nodes = useRef<Map<number, THREE.Group>>(new Map());

  useEffect(() => {
    const map = nodes.current;
    return () => {
      for (const node of map.values()) {
        node.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m.dispose();
          }
        });
      }
      map.clear();
    };
  }, []);

  useFrame(() => {
    const parent = root.current;
    if (!parent) return;
    const list = obstaclesRef.current;
    const alive = new Set(list.map((o) => o.id));

    for (const [id, node] of nodes.current) {
      if (!alive.has(id)) {
        parent.remove(node);
        node.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m.dispose();
          }
        });
        nodes.current.delete(id);
      }
    }

    for (const o of list) {
      let node = nodes.current.get(o.id);
      if (!node) {
        node = makeObstacleMesh(o.kind, o.w, o.d, o.h);
        nodes.current.set(o.id, node);
        parent.add(node);
      }
      node.position.set(o.x, o.h * 0.5, o.z);
      node.rotation.y = o.rot;
      if (o.kind === "bat") {
        node.rotation.z = Math.sin(o.age * 3) * 0.3;
        node.rotation.x = Math.cos(o.age * 2.1) * 0.15;
      } else {
        node.rotation.z = 0;
        node.rotation.x = 0;
      }
    }
  });

  return <group ref={root} />;
}
