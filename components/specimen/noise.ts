/** Seeded variation keeps the specimen identical between visits and builds. */
export function randomSource(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, z: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

const smooth = (value: number) => value * value * (3 - 2 * value);
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;

/** Continuous value noise for rock contours and mineral veins. */
export function noise(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const fz = smooth(z - iz);

  return mix(
    mix(
      mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx),
      mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx),
      fy,
    ),
    mix(
      mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx),
      mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx),
      fy,
    ),
    fz,
  );
}

export function fractal(x: number, y: number, z: number) {
  return (
    noise(x, y, z) * 0.57 +
    noise(x * 2.03, y * 2.03, z * 2.03) * 0.28 +
    noise(x * 4.07, y * 4.07, z * 4.07) * 0.15
  );
}
