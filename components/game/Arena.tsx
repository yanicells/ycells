"use client";

import { ContactShadows, Environment } from "@react-three/drei";
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
  const gridStep = 4;

  return (
    <group>
      <color attach="background" args={[VOID_BG]} />
      <fog attach="fog" args={[VOID_FOG, 55, 110]} />

      <ambientLight intensity={0.78} color="#e4dcd0" />
      <hemisphereLight
        intensity={0.9}
        color="#fff8f0"
        groundColor="#343648"
      />
      <directionalLight
        castShadow
        position={[8, 16, 14]}
        intensity={3.15}
        color="#fffaf4"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-camera-left={-44}
        shadow-camera-right={44}
        shadow-camera-top={44}
        shadow-camera-bottom={-44}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-14, 10, -8]}
        intensity={0.95}
        color="#a8bcff"
      />
      {/* Face-forward fill so carved features catch light */}
      <pointLight
        position={[0, 6, 10]}
        intensity={1.35}
        color="#ffe8c8"
        distance={28}
      />
      <pointLight
        position={[0, 9, 3]}
        intensity={0.75}
        color="#f0d2a8"
        distance={52}
      />

      <Environment preset="warehouse" environmentIntensity={0.32} />

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
        <meshBasicMaterial color={RIM} transparent opacity={0.55} />
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
                  opacity={0.9}
                />
              </mesh>
              <mesh position={[t, 0, 0]}>
                <boxGeometry args={[0.028, 0.012, size]} />
                <meshBasicMaterial
                  color={FLOOR_LINE}
                  transparent
                  opacity={0.9}
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
