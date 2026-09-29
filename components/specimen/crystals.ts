import { BufferGeometry, Color, Float32BufferAttribute, Vector3 } from "three";
import { noise, randomSource } from "./noise";

interface CrystalOptions {
  radius: number;
  length: number;
  seed: number;
  /** Colour at the terminated end (+Y) and at the broken base (-Y). */
  top: Color;
  bottom: Color;
  /** How strongly each prism face is shaded differently from its neighbours. */
  faceContrast?: number;
}

const SIDES = 6;
const STEPS = 6;
const ROWS = 9;

/**
 * A hexagonal prism with growth striations, per-face tone, a colour gradient
 * along its length and a jagged, slightly rounded termination. Colour is baked
 * into vertices so the exported poster and the live scene stay identical.
 */
export function createCrystal({
  radius,
  length,
  seed,
  top,
  bottom,
  faceContrast = 0.36,
}: CrystalOptions) {
  const random = randomSource(seed);
  const faceTone = Array.from({ length: SIDES }, () => 1 - faceContrast / 2 + random() * faceContrast);
  const tipHeights = Array.from({ length: SIDES }, () => (random() - 0.5) * length * 0.16);
  const perimeter = SIDES * STEPS;
  const points: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const color = new Color();

  // Rows crowd toward the ends so both terminations get a smooth bevel.
  const rows = Array.from({ length: ROWS }, (_, row) => {
    const t = row / (ROWS - 1);
    const y = (t - 0.5) * length;
    const taper = t > 0.86 ? 1 - ((t - 0.86) / 0.14) ** 1.6 * 0.42 : t < 0.08 ? 0.86 + t * 1.75 : 1;
    return { t, y, taper };
  });

  const grid = rows.map((row) =>
    Array.from({ length: perimeter }, (_, i) => {
      const side = Math.floor(i / STEPS);
      const step = (i % STEPS) / STEPS;
      const a0 = (side / SIDES) * Math.PI * 2;
      const a1 = ((side + 1) / SIDES) * Math.PI * 2;
      const x = Math.cos(a0) * (1 - step) + Math.cos(a1) * step;
      const z = Math.sin(a0) * (1 - step) + Math.sin(a1) * step;
      // Fine striations run the length of the crystal; face edges are slightly worn.
      const stria = 1 - (i % 2 === 0 ? 0.018 : 0) - (i % STEPS === 0 ? 0.02 : 0) - noise(i * 1.7 + seed, row.t * 26, 0) * 0.02;
      const wobble = 1 + (noise(x * 4 + seed, row.y * 3, z * 4) - 0.5) * 0.05;
      const r = radius * row.taper * stria * wobble;
      const tip = row.t === 1 ? tipHeights[side] * (1 - step) + tipHeights[(side + 1) % SIDES] * step : 0;

      color.copy(bottom).lerp(top, Math.min(1, Math.max(0, (row.t ** 0.8) * 1.15 - 0.05)));
      const cloud = noise(row.t * 9 + seed, i * 0.4, seed * 0.3);
      // Dark growth bands cross the prism like the zoning in real tourmaline.
      const band = 0.72 + noise(row.t * 34 + seed, side * 3.1, 7) * 0.5;
      // Faces lit differently and a milky, cloudy interior read as translucent crystal.
      color.multiplyScalar(faceTone[side] * band * (0.55 + cloud * 0.4));
      return { p: new Vector3(x * r, row.y + tip, z * r), c: color.clone() };
    }),
  );

  function vertex(v: { p: Vector3; c: Color }) {
    points.push(v.p.x, v.p.y, v.p.z);
    colors.push(v.c.r, v.c.g, v.c.b);
    uvs.push(v.p.x / radius, v.p.y / length);
  }

  for (let row = 0; row < ROWS - 1; row++) {
    for (let i = 0; i < perimeter; i++) {
      const j = (i + 1) % perimeter;
      [grid[row][i], grid[row + 1][i], grid[row][j], grid[row][j], grid[row + 1][i], grid[row + 1][j]].forEach(vertex);
    }
  }
  const cap = (y: number, ring: typeof grid[number], flip: boolean, brightness: number) => {
    const center = { p: new Vector3(0, y, 0), c: ring[0].c.clone().multiplyScalar(brightness) };
    for (let i = 0; i < perimeter; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % perimeter];
      (flip ? [center, b, a] : [center, a, b]).forEach(vertex);
    }
  };
  cap(-length / 2, grid[0], false, 0.7);
  cap(length / 2, grid[ROWS - 1], true, 1.1);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}
