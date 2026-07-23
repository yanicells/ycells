"use client";

import { useEffect, useRef } from "react";
import { clamp, facingFromVelocity, type Facing } from "./math";
import { drawArena, drawObstacle, drawSahur } from "./draw";
import {
  hitsPlayer,
  loadHighScore,
  saveHighScore,
  spawnObstacle,
  updateObstacles,
  type Obstacle,
} from "./obstacles";

const MAX_SPEED = 260;
const ACCEL = 980;
const FRICTION = 720;
const PLAYER_W = 40;
const PLAYER_H = 70;

type Keys = Record<string, boolean>;
type Phase = "playing" | "dead";

export default function SahurGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const keys: Keys = {};
    let raf = 0;
    let last = performance.now();
    let imgReady = false;
    const img = new Image();
    img.src = "/sahur.png";
    img.onload = () => {
      imgReady = true;
    };

    let phase: Phase = "playing";
    let score = 0;
    let highScore = loadHighScore();
    let survived = 0;
    let spawnTimer = 0.6;
    let obstacles: Obstacle[] = [];
    let shake = 0;
    let hitFlash = 0;
    let distance = 0;

    const player = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      facing: "front" as Facing,
      bob: 0,
      wobble: 0,
    };

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resetGame() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      player.x = w * 0.5;
      player.y = h * 0.72;
      player.vx = 0;
      player.vy = 0;
      player.facing = "front";
      obstacles = [];
      spawnTimer = 0.8;
      survived = 0;
      score = 0;
      distance = 0;
      shake = 0;
      hitFlash = 0;
      phase = "playing";
    }

    function resize() {
      const parent = canvas!.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = Math.max(
        320,
        parent?.clientHeight || Math.floor(window.innerHeight * 0.62),
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (phase === "playing" && survived < 0.05) {
        player.x = w * 0.5;
        player.y = h * 0.72;
      }
    }

    function kill() {
      if (phase === "dead") return;
      phase = "dead";
      shake = reducedMotion ? 4 : 14;
      hitFlash = 1;
      if (score > highScore) {
        highScore = Math.floor(score);
        saveHighScore(highScore);
      }
    }

    function restart() {
      resetGame();
    }

    function onKeyDown(e: KeyboardEvent) {
      keys[e.code] = true;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      ) {
        e.preventDefault();
      }
      if (e.code === "Space" && phase === "dead") restart();
    }

    function onKeyUp(e: KeyboardEvent) {
      keys[e.code] = false;
    }

    function onPointer(e: PointerEvent) {
      if (phase === "dead") {
        e.preventDefault();
        restart();
      }
    }

    function inputAxis(): { x: number; y: number } {
      let x = 0;
      let y = 0;
      if (keys["KeyA"] || keys["ArrowLeft"]) x -= 1;
      if (keys["KeyD"] || keys["ArrowRight"]) x += 1;
      if (keys["KeyW"] || keys["ArrowUp"]) y -= 1;
      if (keys["KeyS"] || keys["ArrowDown"]) y += 1;
      return { x, y };
    }

    function drawHud(w: number) {
      ctx!.save();
      ctx!.font = "16px Share Tech Mono, monospace";
      ctx!.fillStyle = "#d4b896";
      ctx!.textAlign = "left";
      ctx!.fillText(`SCORE ${Math.floor(score)}`, 24, 36);
      ctx!.fillStyle = "#9a9590";
      ctx!.fillText(`BEST ${Math.floor(highScore)}`, 24, 56);

      if (phase === "dead") {
        ctx!.fillStyle = "rgba(5, 5, 6, 0.55)";
        ctx!.fillRect(0, 0, w, canvas!.clientHeight);
        ctx!.textAlign = "center";
        ctx!.fillStyle = "#c45c4a";
        ctx!.font = "28px Rubik Dirt, Impact, sans-serif";
        ctx!.fillText("BONKED", w / 2, canvas!.clientHeight * 0.42);
        ctx!.font = "15px Share Tech Mono, monospace";
        ctx!.fillStyle = "#e8e4df";
        ctx!.fillText(
          `survived ${Math.floor(score)} · space / tap to restart`,
          w / 2,
          canvas!.clientHeight * 0.42 + 32,
        );
      }
      ctx!.restore();
    }

    function tick(now: number) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const margin = 48;
      const groundTop = h * 0.48;
      const motionScale = reducedMotion ? 0.25 : 1;

      if (phase === "playing") {
        const input = inputAxis();
        if (input.x !== 0 || input.y !== 0) {
          const len = Math.hypot(input.x, input.y) || 1;
          player.vx += (input.x / len) * ACCEL * dt;
          player.vy += (input.y / len) * ACCEL * dt;
        } else {
          const spd = Math.hypot(player.vx, player.vy);
          if (spd > 0) {
            const decel = Math.min(spd, FRICTION * dt);
            player.vx -= (player.vx / spd) * decel;
            player.vy -= (player.vy / spd) * decel;
          }
        }

        const spd = Math.hypot(player.vx, player.vy);
        if (spd > MAX_SPEED) {
          player.vx = (player.vx / spd) * MAX_SPEED;
          player.vy = (player.vy / spd) * MAX_SPEED;
        }

        player.x = clamp(player.x + player.vx * dt, margin, w - margin);
        player.y = clamp(player.y + player.vy * dt, groundTop, h - 28);
        player.facing = facingFromVelocity(player.vx, player.vy);

        survived += dt;
        distance += spd * dt * 0.02;
        score = survived * 10 + distance;

        const difficulty = Math.min(8, survived / 8);
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          obstacles.push(spawnObstacle(w, h, difficulty));
          spawnTimer = Math.max(0.35, 1.15 - difficulty * 0.09);
        }
        obstacles = updateObstacles(obstacles, dt, w, h);

        if (
          hitsPlayer(obstacles, player.x, player.y, PLAYER_W, PLAYER_H)
        ) {
          kill();
        }

        const moving = spd > 18;
        player.bob = Math.sin(now / 220) * (moving ? 2.2 : 3.4) * motionScale;
        player.wobble = moving
          ? Math.sin(now / 90) * 1.6 * motionScale
          : Math.sin(now / 400) * 0.3 * motionScale;
      } else {
        player.bob = Math.sin(now / 500) * 1.2 * motionScale;
        player.wobble = 0;
        hitFlash = Math.max(0, hitFlash - dt * 1.8);
      }

      if (shake > 0) {
        shake = Math.max(0, shake - dt * 28);
      }
      const sx =
        shake > 0
          ? (Math.random() - 0.5) * shake * 2 * motionScale
          : 0;
      const sy =
        shake > 0
          ? (Math.random() - 0.5) * shake * 2 * motionScale
          : 0;

      drawArena(ctx!, w, h, sx, sy);

      for (const o of obstacles) {
        drawObstacle(
          ctx!,
          o.kind,
          o.x + sx,
          o.y + sy,
          o.w,
          o.h,
          Math.sin(now / 180 + o.age) * 0.5 + 0.5,
        );
      }

      if (imgReady) {
        drawSahur(
          ctx!,
          img,
          player.x + sx,
          player.y + sy,
          player.facing,
          player.bob,
          player.wobble,
          hitFlash,
        );
      } else {
        ctx!.fillStyle = "#c4a882";
        ctx!.fillRect(player.x - 20 + sx, player.y - 60 + sy, 40, 60);
      }

      drawHud(w);
      raf = requestAnimationFrame(tick);
    }

    resize();
    resetGame();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointer);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      aria-label="Tung Tung Tung Sahur arena. Use WASD or arrow keys to move. Space to restart after game over."
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        outline: "none",
        cursor: "crosshair",
        background: "#050506",
        border: "1px solid rgba(196, 168, 130, 0.18)",
      }}
    />
  );
}
