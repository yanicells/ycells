export type Vec2 = { x: number; y: number };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function length2(x: number, z: number): number {
  return Math.hypot(x, z);
}

export function normalize2(x: number, z: number): { x: number; z: number } {
  const len = length2(x, z);
  if (len < 1e-6) return { x: 0, z: 0 };
  return { x: x / len, z: z / len };
}

/** Yaw so +Z faces camera; movement on XZ. */
export function yawFromVelocity(vx: number, vz: number, fallback: number): number {
  if (Math.hypot(vx, vz) < 0.15) return fallback;
  return Math.atan2(vx, vz);
}

export function aabbOverlapXZ(
  ax: number,
  az: number,
  aw: number,
  ad: number,
  bx: number,
  bz: number,
  bw: number,
  bd: number,
): boolean {
  return (
    ax - aw / 2 < bx + bw / 2 &&
    ax + aw / 2 > bx - bw / 2 &&
    az - ad / 2 < bz + bd / 2 &&
    az + ad / 2 > bz - bd / 2
  );
}

export function circleRectOverlapXZ(
  cx: number,
  cz: number,
  radius: number,
  rx: number,
  rz: number,
  rw: number,
  rd: number,
): boolean {
  const nearestX = clamp(cx, rx - rw / 2, rx + rw / 2);
  const nearestZ = clamp(cz, rz - rd / 2, rz + rd / 2);
  const dx = cx - nearestX;
  const dz = cz - nearestZ;
  return dx * dx + dz * dz < radius * radius;
}
