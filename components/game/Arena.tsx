"use client";

import { ContactShadows } from "@react-three/drei";
import { ARENA_SIZE } from "./constants";

export default function Arena() {
  const size = ARENA_SIZE * 2;
  const gridStep = 2;

  return (
    <group>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 18, 36]} />

      <ambientLight intensity={0.22} color="#b8a890" />
      <directionalLight
        castShadow
        position={[6, 14, 4]}
        intensity={1.55}
        color="#fff4e6"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight
        position={[-8, 6, -6]}
        intensity={0.55}
        color="#8ab4ff"
      />
      <pointLight position={[0, 4, 0]} intensity={0.35} color="#c4a882" distance={18} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#121214"
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>

      {/* Subtle void floor rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[ARENA_SIZE - 0.08, ARENA_SIZE, 64]} />
        <meshBasicMaterial color="#c4a882" transparent opacity={0.22} />
      </mesh>

      {/* Perspective grid lines */}
      <group position={[0, 0.01, 0]}>
        {Array.from({ length: Math.floor(size / gridStep) + 1 }, (_, i) => {
          const t = -ARENA_SIZE + i * gridStep;
          return (
            <group key={i}>
              <mesh position={[0, 0, t]}>
                <boxGeometry args={[size, 0.01, 0.02]} />
                <meshBasicMaterial color="#2a2622" transparent opacity={0.55} />
              </mesh>
              <mesh position={[t, 0, 0]}>
                <boxGeometry args={[0.02, 0.01, size]} />
                <meshBasicMaterial color="#2a2622" transparent opacity={0.55} />
              </mesh>
            </group>
          );
        })}
      </group>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.55}
        scale={size}
        blur={2.4}
        far={8}
        color="#000000"
      />
    </group>
  );
}
