"use client";

import { ContactShadows } from "@react-three/drei";
import {
  ARENA_SIZE,
  FLOOR,
  FLOOR_LINE,
  RIM,
  VOID_BG,
  VOID_FOG,
} from "./constants";

export default function Arena() {
  const size = ARENA_SIZE * 2;
  const gridStep = 3;

  return (
    <group>
      <color attach="background" args={[VOID_BG]} />
      <fog attach="fog" args={[VOID_FOG, 28, 58]} />

      <ambientLight intensity={0.42} color="#c8c0b4" />
      <hemisphereLight
        intensity={0.55}
        color="#efe6d8"
        groundColor="#1a1820"
      />
      <directionalLight
        castShadow
        position={[10, 18, 6]}
        intensity={2.15}
        color="#fff6ea"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-12, 8, -8]}
        intensity={0.7}
        color="#9bb0ff"
      />
      <pointLight
        position={[0, 6, 0]}
        intensity={0.55}
        color="#e8c9a0"
        distance={32}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={FLOOR}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[ARENA_SIZE - 0.12, ARENA_SIZE, 96]} />
        <meshBasicMaterial color={RIM} transparent opacity={0.38} />
      </mesh>

      <group position={[0, 0.01, 0]}>
        {Array.from({ length: Math.floor(size / gridStep) + 1 }, (_, i) => {
          const t = -ARENA_SIZE + i * gridStep;
          return (
            <group key={i}>
              <mesh position={[0, 0, t]}>
                <boxGeometry args={[size, 0.012, 0.028]} />
                <meshBasicMaterial
                  color={FLOOR_LINE}
                  transparent
                  opacity={0.72}
                />
              </mesh>
              <mesh position={[t, 0, 0]}>
                <boxGeometry args={[0.028, 0.012, size]} />
                <meshBasicMaterial
                  color={FLOOR_LINE}
                  transparent
                  opacity={0.72}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={size}
        blur={2.8}
        far={12}
        color="#000000"
      />
    </group>
  );
}
