import { aabbOverlap } from "./math";
import type { ObstacleKind } from "./draw";

export type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  kind: ObstacleKind;
  age: number;
};

const KINDS: ObstacleKind[] = ["bat", "cylinder", "block"];

export function spawnObstacle(arenaW: number, arenaH: number, difficulty: number): Obstacle {
  const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  const edge = Math.floor(Math.random() * 4);
  const speed = 70 + difficulty * 28 + Math.random() * 40;
  const groundTop = arenaH * 0.48;

  let w = 36;
  let h = 28;
  if (kind === "cylinder") {
    w = 28 + Math.random() * 10;
    h = 48 + Math.random() * 16;
  } else if (kind === "block") {
    w = 34 + Math.random() * 20;
    h = 34 + Math.random() * 16;
  } else {
    w = 44 + Math.random() * 16;
    h = 22 + Math.random() * 10;
  }

  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  const targetX = arenaW * (0.25 + Math.random() * 0.5);
  const targetY = groundTop + Math.random() * (arenaH - groundTop - 40);

  if (edge === 0) {
    // left
    x = -w - 8;
    y = groundTop + Math.random() * (arenaH - groundTop - h - 20);
    vx = speed;
    vy = (targetY - y) * 0.15;
  } else if (edge === 1) {
    // right
    x = arenaW + 8;
    y = groundTop + Math.random() * (arenaH - groundTop - h - 20);
    vx = -speed;
    vy = (targetY - y) * 0.15;
  } else if (edge === 2) {
    // top-ish mid
    x = Math.random() * (arenaW - w);
    y = groundTop - h - 10;
    vx = (targetX - x) * 0.12;
    vy = speed * 0.85;
  } else {
    // bottom
    x = Math.random() * (arenaW - w);
    y = arenaH + 8;
    vx = (targetX - x) * 0.12;
    vy = -speed * 0.7;
  }

  return { x, y, w, h, vx, vy, kind, age: 0 };
}

export function updateObstacles(
  obstacles: Obstacle[],
  dt: number,
  arenaW: number,
  arenaH: number,
): Obstacle[] {
  return obstacles
    .map((o) => ({
      ...o,
      x: o.x + o.vx * dt,
      y: o.y + o.vy * dt,
      age: o.age + dt,
    }))
    .filter(
      (o) =>
        o.x > -120 &&
        o.x < arenaW + 120 &&
        o.y > -120 &&
        o.y < arenaH + 120 &&
        o.age < 12,
    );
}

export function hitsPlayer(
  obstacles: Obstacle[],
  px: number,
  py: number,
  pw: number,
  ph: number,
): boolean {
  const ax = px - pw / 2;
  const ay = py - ph;
  for (const o of obstacles) {
    if (aabbOverlap(ax, ay, pw, ph, o.x, o.y, o.w, o.h)) return true;
  }
  return false;
}

export const HIGH_SCORE_KEY = "sahur-high-score";

export function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function saveHighScore(score: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HIGH_SCORE_KEY, String(Math.floor(score)));
}
