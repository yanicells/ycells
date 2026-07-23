import { circleRectOverlapXZ } from "./math";
import { ARENA_SIZE } from "./constants";

export type ObstacleKind = "bat" | "cylinder" | "block";

export type Obstacle = {
  id: number;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  vx: number;
  vz: number;
  kind: ObstacleKind;
  age: number;
  rot: number;
};

const KINDS: ObstacleKind[] = ["bat", "cylinder", "block"];

let nextId = 1;

export function spawnObstacle(difficulty: number): Obstacle {
  const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  const edge = Math.floor(Math.random() * 4);
  const speed = 2.4 + difficulty * 0.55 + Math.random() * 1.2;
  const bound = ARENA_SIZE;

  let w = 1.7;
  let d = 0.95;
  let h = 0.8;
  if (kind === "cylinder") {
    w = 1.15 + Math.random() * 0.45;
    d = w;
    h = 2.2 + Math.random() * 0.9;
  } else if (kind === "block") {
    w = 1.4 + Math.random() * 0.85;
    d = 1.35 + Math.random() * 0.65;
    h = 1.35 + Math.random() * 0.7;
  } else {
    w = 2.2 + Math.random() * 0.7;
    d = 0.65 + Math.random() * 0.28;
    h = 0.55 + Math.random() * 0.22;
  }

  let x = 0;
  let z = 0;
  let vx = 0;
  let vz = 0;
  const targetX = (Math.random() - 0.5) * bound;
  const targetZ = (Math.random() - 0.5) * bound;

  if (edge === 0) {
    x = -bound - 1.2;
    z = (Math.random() - 0.5) * bound * 1.6;
    vx = speed;
    vz = (targetZ - z) * 0.35;
  } else if (edge === 1) {
    x = bound + 1.2;
    z = (Math.random() - 0.5) * bound * 1.6;
    vx = -speed;
    vz = (targetZ - z) * 0.35;
  } else if (edge === 2) {
    x = (Math.random() - 0.5) * bound * 1.6;
    z = -bound - 1.2;
    vx = (targetX - x) * 0.3;
    vz = speed * 0.9;
  } else {
    x = (Math.random() - 0.5) * bound * 1.6;
    z = bound + 1.2;
    vx = (targetX - x) * 0.3;
    vz = -speed * 0.75;
  }

  return {
    id: nextId++,
    x,
    z,
    w,
    d,
    h,
    vx,
    vz,
    kind,
    age: 0,
    rot: Math.random() * Math.PI * 2,
  };
}

export function updateObstacles(
  obstacles: Obstacle[],
  dt: number,
): Obstacle[] {
  const limit = ARENA_SIZE + 4;
  return obstacles
    .map((o) => ({
      ...o,
      x: o.x + o.vx * dt,
      z: o.z + o.vz * dt,
      age: o.age + dt,
      rot: o.rot + dt * (o.kind === "bat" ? 2.2 : 0.6),
    }))
    .filter(
      (o) =>
        o.x > -limit &&
        o.x < limit &&
        o.z > -limit &&
        o.z < limit &&
        o.age < 14,
    );
}

export function hitsPlayer(
  obstacles: Obstacle[],
  px: number,
  pz: number,
  radius: number,
): boolean {
  for (const o of obstacles) {
    if (circleRectOverlapXZ(px, pz, radius, o.x, o.z, o.w, o.d)) return true;
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
