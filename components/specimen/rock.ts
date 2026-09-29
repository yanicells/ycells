import { BufferGeometry, Color, Float32BufferAttribute, IcosahedronGeometry, Vector3 } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { fractal, noise } from "./noise";

/** Anisotropic squash applied after carving: a long, flattened hand specimen. */
export const ROCK_SCALE = new Vector3(1.22, 0.94, 0.78);

interface Face {
  normal: Vector3;
  distance: number;
  /** Two tones blended by mottling noise. */
  a: Color;
  b: Color;
  /** Share of the face stained by dark biotite / black tourmaline. */
  dark: number;
  /** Share of the face stained orange by iron oxide. */
  rust: number;
  /** Share of the face covered in white feldspar flecks. */
  frost: number;
}

const face = (
  normal: [number, number, number],
  distance: number,
  a: string,
  b: string,
  dark: number,
  rust: number,
  frost: number,
): Face => ({
  normal: new Vector3(...normal).normalize(),
  distance,
  a: new Color(a),
  b: new Color(b),
  dark,
  rust,
  frost,
});

// Cleavage and fracture planes. The big front planes are smoky quartz; the
// lower left is stained with iron oxide; the left end is dark mica.
const FACES: Face[] = [
  face([0.2, 0.3, 1], 0.82, "#4a3a2e", "#85715f", 0.5, 0.1, 0.5),
  face([1, 0.12, 0.22], 0.93, "#54422f", "#8d7a66", 0.4, 0.28, 0.45),
  face([-1, 0.05, 0.2], 0.92, "#241610", "#7a4028", 0.95, 0.5, 0.1),
  face([-0.1, 1, 0.2], 0.8, "#5c4838", "#98866f", 0.3, 0.2, 0.5),
  face([0.1, -1, 0.3], 0.76, "#7a3a20", "#c8703c", 0.5, 0.9, 0.15),
  face([-0.4, -0.5, 0.85], 0.86, "#a0441f", "#e07a3a", 0.4, 1, 0.12),
  face([0.55, -0.42, 0.72], 0.92, "#63513f", "#a8977f", 0.25, 0.3, 0.5),
  face([-0.65, 0.5, 0.55], 0.88, "#2a1a13", "#6e4429", 1, 0.3, 0.12),
  face([0.72, 0.62, 0.45], 0.9, "#4f3f31", "#877562", 0.35, 0.2, 0.4),
  face([0, 0.1, -1], 0.75, "#463629", "#7c6a58", 0.4, 0.35, 0.3),
  face([0.55, 0.2, -0.8], 0.86, "#514031", "#8a7764", 0.35, 0.3, 0.4),
  face([-0.55, -0.25, -0.8], 0.84, "#4a3628", "#a06a40", 0.55, 0.6, 0.2),
  face([0.25, -0.9, -0.4], 0.8, "#6d3620", "#b5623a", 0.4, 0.75, 0.15),
  face([-0.8, 0.7, -0.2], 0.95, "#2f2019", "#6d4a34", 0.9, 0.3, 0.15),
  face([0.4, 0.9, -0.3], 0.9, "#4d3d2f", "#85725e", 0.4, 0.25, 0.4),
  face([-0.7, -0.6, 0.4], 0.88, "#8a3f22", "#d5773f", 0.45, 0.95, 0.1),
  face([0.7, -0.65, 0.4], 0.9, "#5b493a", "#9d8c76", 0.3, 0.35, 0.4),
  face([0.85, 0.35, 0.4], 0.9, "#4e3e30", "#86735f", 0.35, 0.25, 0.45),
];

/** A recess under the smoky slab where pale matrix and green crystals sit. */
export const POCKET = new Vector3(0.5, -0.3, 0.82).normalize();
const POCKET_WIDTH = 0.4;
const POCKET_DEPTH = 0.2;
const SHARPNESS = 90;

const CHALK = new Color("#e6dfd2");
const CHALK_SHADE = new Color("#bdb2a2");
const DARK = new Color("#1f1512");
const DARK_BROWN = new Color("#43291f");
const STAIN = new Color("#c8825a");
const WHITE = new Color("#ffffff");
const RUST = new Color("#c9421c");
const DIRT = new Color("#20140f");
const PALE = new Color("#c9b9a3");

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (lo: number, hi: number, value: number) => {
  const t = clamp01((value - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
};

interface Sample {
  radius: number;
  face: Face;
  /** 0 on a fracture edge, growing toward the middle of a face. */
  gap: number;
  pocket: number;
}

/** Radius along a unit direction: the nearest of many wavy planes, minus the pocket. */
function sample(direction: Vector3): Sample {
  let best = Infinity;
  let second = Infinity;
  let index = 0;
  let blend = 0;
  FACES.forEach((candidate, i) => {
    const alignment = direction.dot(candidate.normal);
    if (alignment <= 0.02) return;
    // Slightly wavy planes read as conchoidal fracture rather than machined flats.
    const wave = (fractal(direction.x * 3 + i * 7, direction.y * 3 + 1, direction.z * 3 + i) - 0.5) * 0.1;
    const ratio = (candidate.distance + wave) / alignment;
    blend += ratio ** -SHARPNESS;
    if (ratio < best) {
      second = best;
      best = ratio;
      index = i;
    } else if (ratio < second) {
      second = ratio;
    }
  });

  const angle = Math.acos(clamp01(direction.dot(POCKET)) * 0.99999);
  const edge = angle + (noise(direction.x * 9, direction.y * 9, direction.z * 9) - 0.5) * 0.18;
  const pocket = 1 - smoothstep(POCKET_WIDTH * 0.8, POCKET_WIDTH, edge);

  const lump = (fractal(direction.x * 1.8 + 5, direction.y * 1.8, direction.z * 1.8 + 2) - 0.5) * 0.1;
  const chips = 1 - Math.abs(noise(direction.x * 16 + 8, direction.y * 16, direction.z * 16) * 2 - 1);
  const grain = noise(direction.x * 24, direction.y * 24 + 3, direction.z * 24);
  // A p-norm soft-min rounds the fracture edges a little, like a handled specimen.
  const soft = blend ** (-1 / SHARPNESS);
  const radius = soft + lump + (chips - 0.5) * 0.008 + (grain - 0.5) * 0.004 - pocket * POCKET_DEPTH;
  return { radius, face: FACES[index], gap: (second - best) / best, pocket };
}

/** A trench in the rock along a line segment, where a crystal lies half-embedded. */
export interface Groove {
  from: Vector3;
  to: Vector3;
  width: number;
  depth: number;
}

const segment = new Vector3();
const offset = new Vector3();

/** 1 on the groove's centre line, easing to 0 at `width`. */
function grooveWeight(point: Vector3, groove: Groove) {
  segment.subVectors(groove.to, groove.from);
  offset.subVectors(point, groove.from);
  const t = clamp01(offset.dot(segment) / segment.lengthSq());
  const distance = offset.sub(segment.multiplyScalar(t)).length();
  return 1 - smoothstep(groove.width * 0.5, groove.width, distance);
}

/**
 * Broad colour only: fine grain, flecks and relief are drawn per pixel in the
 * material shader, so this stays below the mesh's vertex resolution.
 * `zone` carries (frost, dark, oxide) weights for that shader.
 */
function colorize(point: Vector3, s: Sample, out: Color, zone: Vector3, trench: number, cavity: number) {
  const { x, y, z } = point;
  const mottle = smoothstep(0.3, 0.72, fractal(x * 3.6 + 1, y * 3.6 + 2, z * 3.6 + 3));
  out.copy(s.face.a).lerp(s.face.b, mottle);

  // Broad grey/brown cloudiness inside the quartz.
  const cloud = fractal(x * 7 + 20, y * 7, z * 7 + 5);
  out.multiplyScalar(0.9 + cloud * 0.24);

  // Dark biotite / tourmaline patches with ragged edges.
  const darkThreshold = 0.68 - s.face.dark * 0.2;
  const darkMask = smoothstep(darkThreshold, darkThreshold + 0.1, fractal(x * 6 + 30, y * 6 + 8, z * 6));
  out.lerp(DARK_BROWN, darkMask * 0.85);
  const black = smoothstep(0.8, 0.9, fractal(x * 8 + 3, y * 8 + 50, z * 8) + s.face.dark * 0.08);
  out.lerp(DARK, black * 0.8);

  // Iron oxide gathers in cracks and along edges, then stains outward in patches.
  const seam = 1 - smoothstep(0.004, 0.09 + s.face.rust * 0.06, s.gap);
  const patch = smoothstep(0.58 - s.face.rust * 0.22, 0.78, fractal(x * 4.5 + 11, y * 4.5 + 2, z * 4.5 + 40));
  const oxide = clamp01(seam * (0.4 + s.face.rust * 0.4) + patch * s.face.rust * s.face.rust + trench * 0.9);
  // The shader paints the rust film itself; here it only stains the surrounding stone.
  out.multiply(STAIN.clone().lerp(WHITE, 1 - clamp01(oxide) * 0.6));

  if (s.pocket > 0) {
    const chalk = CHALK_SHADE.clone().lerp(CHALK, smoothstep(0.2, 0.7, fractal(x * 6, y * 6 + 3, z * 6)));
    chalk.lerp(RUST, smoothstep(0.7, 0.9, noise(x * 10, y * 10, z * 10)) * 0.5);
    out.lerp(chalk, smoothstep(0.15, 0.6, s.pocket));
  }

  // Baked cavity occlusion: pits and cracks collect dirt; raised edges wear pale.
  out.lerp(DIRT, clamp01(cavity) * 0.4).multiplyScalar(1 - clamp01(cavity) * 0.45);
  out.lerp(PALE, clamp01(-cavity) * 0.12);

  zone.set(
    clamp01(s.face.frost * (0.5 + cloud) + s.pocket * 0.6),
    clamp01(s.face.dark * (0.4 + darkMask)),
    clamp01(oxide),
  );
}

/**
 * Signed cavity per vertex: how far the neighbourhood average sits above the
 * surface (positive in pits and cracks, negative on ridges), scaled to ~[-1, 1].
 */
function computeCavity(geometry: BufferGeometry, iterations = 20, scale = 0.03) {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const index = geometry.getIndex();
  if (!index) throw new Error("Rock geometry must be indexed.");
  const count = position.count;
  const triangles = index.array;
  const degree = new Float32Array(count);
  for (let i = 0; i < triangles.length; i++) degree[triangles[i]] += 2;

  let current = Float32Array.from(position.array);
  let next = new Float32Array(current.length);
  for (let pass = 0; pass < iterations; pass++) {
    next.fill(0);
    for (let t = 0; t < triangles.length; t += 3) {
      const a = triangles[t] * 3;
      const b = triangles[t + 1] * 3;
      const c = triangles[t + 2] * 3;
      for (let k = 0; k < 3; k++) {
        next[a + k] += current[b + k] + current[c + k];
        next[b + k] += current[a + k] + current[c + k];
        next[c + k] += current[a + k] + current[b + k];
      }
    }
    for (let i = 0; i < count; i++) {
      for (let k = 0; k < 3; k++) next[i * 3 + k] /= degree[i];
    }
    [current, next] = [next, current];
  }

  const cavity = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const dot =
      (current[i * 3] - position.getX(i)) * normal.getX(i) +
      (current[i * 3 + 1] - position.getY(i)) * normal.getY(i) +
      (current[i * 3 + 2] - position.getZ(i)) * normal.getZ(i);
    cavity[i] = Math.max(-1, Math.min(1, dot / scale));
  }
  return cavity;
}

/** Dense, welded mesh so fracture edges and broad colour hold their shape. */
export function createRock(grooves: Groove[] = [], detail = 104): BufferGeometry {
  const ico = new IcosahedronGeometry(1, detail);
  ico.deleteAttribute("normal");
  ico.deleteAttribute("uv");
  const geometry = mergeVertices(ico, 1e-4);
  ico.dispose();

  const position = geometry.getAttribute("position");
  const count = position.count;
  const samples: Sample[] = new Array(count);
  const trenches = new Float32Array(count);
  const direction = new Vector3();
  const point = new Vector3();

  for (let i = 0; i < count; i++) {
    direction.fromBufferAttribute(position, i).normalize();
    const s = sample(direction);
    point.copy(direction).multiplyScalar(s.radius).multiply(ROCK_SCALE);
    for (const groove of grooves) {
      const weight = grooveWeight(point, groove);
      trenches[i] = Math.max(trenches[i], weight);
      point.multiplyScalar(1 - weight * groove.depth);
    }
    position.setXYZ(i, point.x, point.y, point.z);
    samples[i] = s;
  }
  geometry.computeVertexNormals();

  const cavity = computeCavity(geometry);
  const colors = new Float32Array(count * 3);
  const zones = new Float32Array(count * 3);
  const color = new Color();
  const zone = new Vector3();
  for (let i = 0; i < count; i++) {
    point.fromBufferAttribute(position, i);
    colorize(point, samples[i], color, zone, trenches[i], cavity[i]);
    colors.set([color.r, color.g, color.b], i * 3);
    zone.toArray(zones, i * 3);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("zone", new Float32BufferAttribute(zones, 3));
  return geometry;
}

/** Point on the carved surface for a direction, in rock space. */
export function surfacePoint(direction: Vector3, inset = 1) {
  const unit = direction.clone().normalize();
  return unit.multiplyScalar(sample(unit).radius * inset).multiply(ROCK_SCALE);
}
