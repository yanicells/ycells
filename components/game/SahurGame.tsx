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
  const [hud, setHud] = useState<GameHudState>({
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
  }, []);

  const onDir = useCallback((axis: "x" | "y", value: number) => {
    virtualRef.current[axis] = value;
  }, []);

  const onRestart = useCallback(() => {
    restartRef.current();
  }, []);

  const phase: Phase = hud.phase;

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

        {/* Score HUD */}
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            top: 16,
            left: 18,
            pointerEvents: "none",
            fontFamily: "var(--font-hud)",
            fontSize: 16,
            lineHeight: 1.35,
            zIndex: 2,
          }}
        >
          <div style={{ color: "var(--score)" }}>
            SCORE {Math.floor(hud.score)}
          </div>
          <div style={{ color: "var(--ash-muted)", fontSize: 14 }}>
            BEST {Math.floor(hud.highScore)}
          </div>
        </div>

        {phase === "start" && (
          <Overlay>
            <p
              style={{
                margin: 0,
                color: "var(--score)",
                fontFamily: "var(--font-hud)",
                fontSize: 18,
              }}
            >
              WASD to move · survive the bats
            </p>
            <p
              style={{
                margin: "0.75rem 0 0",
                color: "var(--ash-muted)",
                fontFamily: "var(--font-hud)",
                fontSize: 13,
              }}
            >
              space / tap to start
            </p>
          </Overlay>
        )}

        {phase === "dead" && (
          <Overlay danger>
            <p
              style={{
                margin: 0,
                color: "var(--danger)",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 5vw, 2rem)",
                letterSpacing: "0.06em",
              }}
            >
              BONKED
            </p>
            <p
              style={{
                margin: "0.85rem 0 0",
                color: "var(--ash)",
                fontFamily: "var(--font-hud)",
                fontSize: 15,
              }}
            >
              survived {Math.floor(hud.score)} · space / tap to restart
            </p>
          </Overlay>
        )}
      </div>
      <MobileControls
        onDir={onDir}
        onRestart={onRestart}
        dead={phase === "dead"}
      />
    </div>
  );
}

function Overlay({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: danger
          ? "rgba(5, 5, 6, 0.55)"
          : "rgba(5, 5, 6, 0.48)",
        pointerEvents: "none",
        zIndex: 3,
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <div>{children}</div>
    </div>
  );
}
