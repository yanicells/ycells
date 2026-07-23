"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Arena from "./Arena";
import { CAMERA_POS, CAMERA_TARGET } from "./constants";

function LookAt({ target }: { target: [number, number, number] }) {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

/**
 * Minimal R3F shell: void arena + dramatic lighting.
 * Gameplay / Sahur mesh land in follow-up commits.
 */
export default function SahurGame() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 280,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 280,
          border: "1px solid rgba(196, 168, 130, 0.18)",
          background: "#050506",
          overflow: "hidden",
        }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
          style={{ width: "100%", height: "100%", outline: "none" }}
          tabIndex={0}
          role="img"
          aria-label="Tung Tung Tung Sahur 3D arena. Use WASD or arrow keys to move. Space to start or restart. On mobile use the on-screen D-pad."
        >
          <PerspectiveCamera
            makeDefault
            position={CAMERA_POS}
            fov={42}
            near={0.1}
            far={80}
          />
          <LookAt target={CAMERA_TARGET} />
          <Arena />
          {/* Placeholder spawn marker until procedural Sahur lands */}
          <mesh position={[0, 0.05, 2.5]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
            <meshStandardMaterial color="#c4a882" roughness={0.4} />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
}
