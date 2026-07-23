export type Vec2 = { x: number; y: number };
export type Facing = "front" | "back" | "left" | "right";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function facingFromVelocity(vx: number, vy: number): Facing {
  const ax = Math.abs(vx);
  const ay = Math.abs(vy);
  if (ax < 8 && ay < 8) return "front";
  if (ax >= ay) return vx < 0 ? "left" : "right";
  return vy < 0 ? "back" : "front";
}

export function length(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec2): Vec2 {
  const len = length(v);
  if (len < 1e-6) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function aabbOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
