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
        width: "100%",
        height: "100%",
        minHeight: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid rgba(228, 200, 160, 0.24)",
          background: "#161822",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            resize={{ debounce: 0, scroll: false }}
            style={{ width: "100%", height: "100%", display: "block", outline: "none" }}
            role="img"
            aria-label="Tung Tung Tung Sahur 3D arena. Use WASD or arrow keys to move. Space to start or restart. On mobile use the on-screen D-pad."
            onCreated={({ gl, size }) => {
              gl.setClearColor("#1c1e2c");
              if (size.width > 0 && size.height > 0) {
                gl.setSize(size.width, size.height, false);
              }
            }}
          >
            <PerspectiveCamera
              makeDefault
              position={CAMERA_POS}
              fov={34}
              near={0.1}
              far={160}
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
                textShadow: "0 2px 12px rgba(0,0,0,0.65)",
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
                textShadow: "0 2px 10px rgba(0,0,0,0.55)",
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
        display: "flex",
        alignItems: danger ? "center" : "flex-end",
        justifyContent: "center",
        background: danger
          ? "rgba(20, 22, 31, 0.45)"
          : "linear-gradient(to top, rgba(20,22,31,0.72) 0%, rgba(20,22,31,0.08) 42%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 3,
        textAlign: "center",
        padding: danger ? "1rem" : "0 1rem 1.75rem",
      }}
    >
      <div>{children}</div>
    </div>
  );
}
