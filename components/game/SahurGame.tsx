"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Arena from "./Arena";
import GameWorld, { type GameHudState, type Phase } from "./GameWorld";
import MobileControls from "./MobileControls";
import { CAMERA_POS } from "./constants";

export default function SahurGame() {
  const virtualRef = useRef({ x: 0, y: 0 });
  const restartRef = useRef<() => void>(() => {});
  const [phaseUi, setPhaseUi] = useState<Phase>("start");
  const [, setHud] = useState<GameHudState>({
    phase: "start",
    score: 0,
    highScore: 0,
  });

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const onHud = useCallback((state: GameHudState) => {
    setHud(state);
    setPhaseUi(state.phase);
  }, []);

  const onDir = useCallback((axis: "x" | "y", value: number) => {
    virtualRef.current[axis] = value;
  }, []);

  const onRestart = useCallback(() => {
    restartRef.current();
  }, []);

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
          position: "relative",
        }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
          style={{ width: "100%", height: "100%", outline: "none" }}
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
          <Arena />
          <GameWorld
            virtualRef={virtualRef}
            onHud={onHud}
            restartRef={restartRef}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>
      <MobileControls
        onDir={onDir}
        onRestart={onRestart}
        dead={phaseUi === "dead"}
      />
    </div>
  );
}
