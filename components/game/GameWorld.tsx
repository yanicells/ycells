"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Sahur, { type SahurAnimState } from "./Sahur";
import {
  ACCEL,
  ARENA_SIZE,
  CAMERA_POS,
  FRICTION,
  MAX_SPEED,
} from "./constants";
import { clamp, length2, normalize2, yawFromVelocity } from "./math";

export type Phase = "start" | "playing" | "dead";

export type GameHudState = {
  phase: Phase;
  score: number;
  highScore: number;
};

type Keys = Record<string, boolean>;

type Props = {
  virtualRef: React.MutableRefObject<{ x: number; y: number }>;
  onHud: (state: GameHudState) => void;
  restartRef: React.MutableRefObject<() => void>;
  reducedMotion: boolean;
};

/**
 * Movement + facing yaw + walk cycle for Sahur.
 * Obstacles/scoring land in the next commit.
 */
export default function GameWorld({
  virtualRef,
  onHud,
  restartRef,
  reducedMotion,
}: Props) {
  const keysRef = useRef<Keys>({});
  const anim = useRef<SahurAnimState>({
    x: 0,
    z: 2.2,
    yaw: 0,
    moveAmount: 0,
    hitFlash: 0,
  });
  const vel = useRef({ vx: 0, vz: 0 });
  const phaseRef = useRef<Phase>("start");
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    function resetGame(toPlaying: boolean) {
      anim.current = {
        x: 0,
        z: 2.2,
        yaw: 0,
        moveAmount: 0,
        hitFlash: 0,
      };
      vel.current = { vx: 0, vz: 0 };
      virtualRef.current = { x: 0, y: 0 };
      phaseRef.current = toPlaying ? "playing" : "start";
      onHud({ phase: phaseRef.current, score: 0, highScore: 0 });
    }

    restartRef.current = () => resetGame(true);
    resetGame(false);

    function beginOrRestart() {
      if (phaseRef.current === "start" || phaseRef.current === "dead") {
        resetGame(true);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      keysRef.current[e.code] = true;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      ) {
        e.preventDefault();
      }
      if (e.code === "Space") beginOrRestart();
      if (
        phaseRef.current === "start" &&
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        resetGame(true);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysRef.current[e.code] = false;
    }

    function onPointer() {
      if (phaseRef.current === "start" || phaseRef.current === "dead") {
        beginOrRestart();
      }
      gl.domElement.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    gl.domElement.addEventListener("pointerdown", onPointer);
    gl.domElement.tabIndex = 0;
    gl.domElement.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      gl.domElement.removeEventListener("pointerdown", onPointer);
    };
  }, [gl, onHud, restartRef, virtualRef]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.033, dtRaw);
    const a = anim.current;
    const v = vel.current;
    const margin = ARENA_SIZE - 0.7;
    const keys = keysRef.current;

    if (phaseRef.current === "playing") {
      let ix = virtualRef.current.x;
      let iz = virtualRef.current.y;
      if (keys["KeyA"] || keys["ArrowLeft"]) ix -= 1;
      if (keys["KeyD"] || keys["ArrowRight"]) ix += 1;
      if (keys["KeyW"] || keys["ArrowUp"]) iz -= 1;
      if (keys["KeyS"] || keys["ArrowDown"]) iz += 1;
      ix = clamp(ix, -1, 1);
      iz = clamp(iz, -1, 1);

      if (ix !== 0 || iz !== 0) {
        const n = normalize2(ix, iz);
        v.vx += n.x * ACCEL * dt;
        v.vz += n.z * ACCEL * dt;
      } else {
        const spd = length2(v.vx, v.vz);
        if (spd > 0) {
          const decel = Math.min(spd, FRICTION * dt);
          v.vx -= (v.vx / spd) * decel;
          v.vz -= (v.vz / spd) * decel;
        }
      }

      const spd = length2(v.vx, v.vz);
      if (spd > MAX_SPEED) {
        v.vx = (v.vx / spd) * MAX_SPEED;
        v.vz = (v.vz / spd) * MAX_SPEED;
      }

      a.x = clamp(a.x + v.vx * dt, -margin, margin);
      a.z = clamp(a.z + v.vz * dt, -margin, margin);
      a.yaw = yawFromVelocity(v.vx, v.vz, a.yaw);
      a.moveAmount = Math.min(1, length2(v.vx, v.vz) / MAX_SPEED);
    } else {
      a.moveAmount = 0;
      a.hitFlash = Math.max(0, a.hitFlash - dt * 1.8);
    }

    const camX = CAMERA_POS[0] + a.x * 0.18;
    const camZ = CAMERA_POS[2] + a.z * 0.12;
    camera.position.x += (camX - camera.position.x) * Math.min(1, dt * 3);
    camera.position.z += (camZ - camera.position.z) * Math.min(1, dt * 3);
    camera.position.y = CAMERA_POS[1];
    camera.lookAt(a.x * 0.35, 0.5, a.z * 0.35);
  });

  return <Sahur anim={anim} reducedMotion={reducedMotion} />;
}
