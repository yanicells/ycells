"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Sahur, { type SahurAnimState } from "./Sahur";
import Obstacles3D from "./Obstacles3D";
import {
  ACCEL,
  ARENA_SIZE,
  CAMERA_POS,
  FRICTION,
  MAX_SPEED,
  PLAYER_RADIUS,
} from "./constants";
import { clamp, length2, normalize2, yawFromVelocity } from "./math";
import {
  hitsPlayer,
  loadHighScore,
  saveHighScore,
  spawnObstacle,
  updateObstacles,
  type Obstacle,
} from "./obstacles";

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
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef({ survived: 0, distance: 0, score: 0, high: 0 });
  const spawnTimer = useRef(0.8);
  const shake = useRef(0);
  const hudTick = useRef(0);
  const getGl = useThree((s) => s.gl);

  useEffect(() => {
    scoreRef.current.high = loadHighScore();
    const canvas = getGl.domElement;

    function resetGame(toPlaying: boolean) {
      anim.current = {
        x: 0,
        z: 2.2,
        yaw: 0,
        moveAmount: 0,
        hitFlash: 0,
      };
      vel.current = { vx: 0, vz: 0 };
      obstaclesRef.current = [];
      spawnTimer.current = 0.8;
      scoreRef.current.survived = 0;
      scoreRef.current.distance = 0;
      scoreRef.current.score = 0;
      shake.current = 0;
      virtualRef.current = { x: 0, y: 0 };
      phaseRef.current = toPlaying ? "playing" : "start";
      onHud({
        phase: phaseRef.current,
        score: 0,
        highScore: scoreRef.current.high,
      });
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
      canvas.focus();
    }

    canvas.setAttribute("tabindex", "0");
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointer);
    canvas.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, [getGl, onHud, restartRef, virtualRef]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.033, dtRaw);
    const a = anim.current;
    const v = vel.current;
    const margin = ARENA_SIZE - 1.1;
    const keys = keysRef.current;
    const motionScale = reducedMotion ? 0.2 : 1;
    const { camera } = state;

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

      let spd = length2(v.vx, v.vz);
      if (spd > MAX_SPEED) {
        v.vx = (v.vx / spd) * MAX_SPEED;
        v.vz = (v.vz / spd) * MAX_SPEED;
        spd = MAX_SPEED;
      }

      a.x = clamp(a.x + v.vx * dt, -margin, margin);
      a.z = clamp(a.z + v.vz * dt, -margin, margin);
      a.yaw = yawFromVelocity(v.vx, v.vz, a.yaw);
      a.moveAmount = Math.min(1, spd / MAX_SPEED);

      scoreRef.current.survived += dt;
      scoreRef.current.distance += spd * dt * 0.35;
      scoreRef.current.score =
        scoreRef.current.survived * 10 + scoreRef.current.distance;

      const difficulty = Math.min(8, scoreRef.current.survived / 8);
      spawnTimer.current -= dt;
      if (spawnTimer.current <= 0) {
        obstaclesRef.current.push(spawnObstacle(difficulty));
        spawnTimer.current = Math.max(0.35, 1.15 - difficulty * 0.09);
      }
      obstaclesRef.current = updateObstacles(obstaclesRef.current, dt);

      if (hitsPlayer(obstaclesRef.current, a.x, a.z, PLAYER_RADIUS)) {
        phaseRef.current = "dead";
        shake.current = reducedMotion ? 0.08 : 0.35;
        a.hitFlash = 1;
        if (scoreRef.current.score > scoreRef.current.high) {
          scoreRef.current.high = Math.floor(scoreRef.current.score);
          saveHighScore(scoreRef.current.high);
        }
        onHud({
          phase: "dead",
          score: scoreRef.current.score,
          highScore: scoreRef.current.high,
        });
      }
    } else {
      a.moveAmount = 0;
      a.hitFlash = Math.max(0, a.hitFlash - dt * 1.8);
    }

    if (shake.current > 0) {
      shake.current = Math.max(0, shake.current - dt * 1.4);
    }

    const sx =
      shake.current > 0
        ? (Math.random() - 0.5) * shake.current * 2 * motionScale
        : 0;
    const sz =
      shake.current > 0
        ? (Math.random() - 0.5) * shake.current * 2 * motionScale
        : 0;

    const camX = CAMERA_POS[0] + a.x * 0.28 + sx;
    const camZ = CAMERA_POS[2] + a.z * 0.22 + sz;
    camera.position.x += (camX - camera.position.x) * Math.min(1, dt * 2.6);
    camera.position.z += (camZ - camera.position.z) * Math.min(1, dt * 2.6);
    camera.position.y = CAMERA_POS[1] + a.moveAmount * 0.4;
    camera.lookAt(a.x * 0.5, 3.2, a.z * 0.5);

    hudTick.current += dt;
    if (phaseRef.current === "playing" && hudTick.current > 0.1) {
      hudTick.current = 0;
      onHud({
        phase: "playing",
        score: scoreRef.current.score,
        highScore: scoreRef.current.high,
      });
    }
  });

  return (
    <>
      <Sahur anim={anim} reducedMotion={reducedMotion} />
      <Obstacles3D obstaclesRef={obstaclesRef} />
    </>
  );
}
