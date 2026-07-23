"use client";

import { useEffect, useRef } from "react";
import { clamp, facingFromVelocity, type Facing } from "./math";
import { drawArena, drawSahur } from "./draw";

const MAX_SPEED = 260;
const ACCEL = 980;
const FRICTION = 720;

type Keys = Record<string, boolean>;

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

    function resize() {
      const parent = canvas!.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = Math.max(320, parent?.clientHeight || Math.floor(window.innerHeight * 0.62));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      player.x = w * 0.5;
      player.y = h * 0.72;
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
    }

    function onKeyUp(e: KeyboardEvent) {
      keys[e.code] = false;
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

    function tick(now: number) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const margin = 48;
      const groundTop = h * 0.48;

      const input = inputAxis();
      if (input.x !== 0 || input.y !== 0) {
        const len = Math.hypot(input.x, input.y) || 1;
        player.vx += (input.x / len) * ACCEL * dt;
        player.vy += (input.y / len) * ACCEL * dt;
      } else {
        const speed = Math.hypot(player.vx, player.vy);
        if (speed > 0) {
          const decel = Math.min(speed, FRICTION * dt);
          player.vx -= (player.vx / speed) * decel;
          player.vy -= (player.vy / speed) * decel;
        }
      }

      const speed = Math.hypot(player.vx, player.vy);
      if (speed > MAX_SPEED) {
        player.vx = (player.vx / speed) * MAX_SPEED;
        player.vy = (player.vy / speed) * MAX_SPEED;
      }

      player.x = clamp(player.x + player.vx * dt, margin, w - margin);
      player.y = clamp(player.y + player.vy * dt, groundTop, h - 28);
      player.facing = facingFromVelocity(player.vx, player.vy);

      const moving = speed > 18;
      const motionScale = reducedMotion ? 0.25 : 1;
      player.bob = Math.sin(now / 220) * (moving ? 2.2 : 3.4) * motionScale;
      player.wobble = moving
        ? Math.sin(now / 90) * 1.6 * motionScale
        : Math.sin(now / 400) * 0.3 * motionScale;

      drawArena(ctx!, w, h, 0, 0);

      if (imgReady) {
        drawSahur(
          ctx!,
          img,
          player.x,
          player.y,
          player.facing,
          player.bob,
          player.wobble,
          0,
        );
      } else {
        ctx!.fillStyle = "#c4a882";
        ctx!.fillRect(player.x - 20, player.y - 60, 40, 60);
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      aria-label="Tung Tung Tung Sahur arena. Use WASD or arrow keys to move."
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
