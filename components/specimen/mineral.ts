import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  RepeatWrapping,
  RGBAFormat,
  Vector3,
} from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { fractal, noise, randomSource } from "./noise";

const UP = new Vector3(0, 1, 0);
const FRACTURES = [
  { normal: new Vector3(1, 0.18, 0.15).normalize(), distance: 0.9 },
  { normal: new Vector3(-1, 0.1, 0.1).normalize(), distance: 0.92 },
  { normal: new Vector3(-0.2, 1, 0.3).normalize(), distance: 0.79 },
  { normal: new Vector3(0.3, -1, 0.2).normalize(), distance: 0.75 },
  { normal: new Vector3(0.12, 0.28, 1).normalize(), distance: 0.8 },
  { normal: new Vector3(-0.3, 0.15, -1).normalize(), distance: 0.78 },
  { normal: new Vector3(0.8, 0.6, 0.8).normalize(), distance: 0.93 },
  { normal: new Vector3(-0.8, -0.7, 0.6).normalize(), distance: 0.82 },
  { normal: new Vector3(0.6, -0.5, -0.8).normalize(), distance: 0.88 },
];

/** A single, reusable grain map; no downloaded textures or model assets. */
function createGrain() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  const random = randomSource(370);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const grain = random();
      const layers = Math.sin((x / size) * Math.PI * 48 + Math.sin((y / size) * Math.PI * 8));
      const value = Math.floor(135 + grain * 95 + layers * 20);
      data[i] = data[i + 1] = data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.generateMipmaps = true;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function surface(direction: Vector3) {
  const { x, y, z } = direction;
  const broad = fractal(x * 2.6 + 8, y * 2.6 + 3, z * 2.6 + 5);
  const chips = noise(x * 17 + 8, y * 17, z * 17);
  let radius = 1.2;
  for (const fracture of FRACTURES) {
    const alignment = direction.dot(fracture.normal);
    if (alignment > 0) radius = Math.min(radius, fracture.distance / alignment);
  }
  radius += (broad - 0.5) * 0.15 + (chips - 0.5) * 0.045;
  return new Vector3(
    x * radius * 1.18,
    y * radius * 0.94,
    z * radius * 0.74,
  );
}

function tintGeometry(geometry: BufferGeometry, base: Color, variation: number) {
  const position = geometry.getAttribute("position");
  const colors: number[] = [];
  const color = new Color();

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const value = noise(x * 14 + 10, y * 14, z * 14);
    color.copy(base).multiplyScalar(1 - variation + value * variation * 2);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

function createMatrix() {
  const geometry = new IcosahedronGeometry(1, 34);
  const position = geometry.getAttribute("position");
  const colors: number[] = [];
  const chalk = new Color("#b2a699");
  const smoky = new Color("#393532");
  const blush = new Color("#97776e");
  const color = new Color();

  for (let i = 0; i < position.count; i++) {
    const point = surface(new Vector3().fromBufferAttribute(position, i).normalize());
    position.setXYZ(i, point.x, point.y, point.z);
    const vein = fractal(point.x * 6 + 3, point.y * 7, point.z * 6);
    const fine = noise(point.x * 47, point.y * 47, point.z * 47);
    color.copy(smoky).lerp(chalk, Math.min(1, Math.max(0, (vein - 0.25) * 2.4)));
    color.lerp(blush, Math.max(0, noise(point.x * 4, point.y * 5, point.z * 4) - 0.5));
    color.multiplyScalar(0.72 + fine * 0.43);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const smoothGeometry = mergeVertices(geometry);
  geometry.dispose();
  smoothGeometry.computeVertexNormals();
  return smoothGeometry;
}

/** Beveled hexagonal prisms with uneven, broken terminations. */
function createCrystal(radius: number, length: number, seed: number) {
  const random = randomSource(seed);
  const points: number[] = [];
  const uvs: number[] = [];
  const rings = [
    { y: -length / 2, r: radius * 0.8 },
    { y: -length * 0.43, r: radius },
    { y: length * 0.35, r: radius * 0.93 },
    { y: length / 2, r: radius * 0.65 },
  ];
  const vertices = rings.map((ring, row) =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return new Vector3(
        Math.cos(angle) * ring.r,
        ring.y + (row === 3 ? (random() - 0.5) * length * 0.12 : 0),
        Math.sin(angle) * ring.r,
      );
    }),
  );

  function triangle(a: Vector3, b: Vector3, c: Vector3) {
    for (const point of [a, b, c]) {
      points.push(point.x, point.y, point.z);
      uvs.push(point.x / radius, point.y / length);
    }
  }

  for (let row = 0; row < rings.length - 1; row++) {
    for (let i = 0; i < 6; i++) {
      const j = (i + 1) % 6;
      triangle(vertices[row][i], vertices[row + 1][i], vertices[row][j]);
      triangle(vertices[row][j], vertices[row + 1][i], vertices[row + 1][j]);
    }
  }
  for (let i = 1; i < 5; i++) {
    triangle(vertices[0][0], vertices[0][i], vertices[0][i + 1]);
    triangle(vertices[3][0], vertices[3][i + 1], vertices[3][i]);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function mergeParts(parts: BufferGeometry[]) {
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Unable to assemble the mineral geometry.");
  return geometry;
}

/** Artistic rubidium-bearing matrix with tourmaline-like inclusions, not pure Rb. */
export function createMineral() {
  const group = new Group();
  const random = randomSource(8537);
  const grain = createGrain();
  const matrixMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.87,
    bumpMap: grain,
    bumpScale: 0.035,
    flatShading: false,
  });
  const crystalMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.24,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.16,
    ior: 1.62,
    bumpMap: grain,
    bumpScale: 0.003,
  });
  const quartzMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.35,
    clearcoat: 0.55,
    ior: 1.54,
    bumpMap: grain,
    bumpScale: 0.008,
  });
  const micaMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.38,
    metalness: 0.55,
  });

  const reds: BufferGeometry[] = [];
  const quartz: BufferGeometry[] = [];
  const mica: BufferGeometry[] = [];
  const matrix = createMatrix();
  const rotation = new Quaternion();
  const transform = new Matrix4();
  const unitScale = new Vector3(1, 1, 1);
  const redColors = ["#7f1838", "#ab3d55", "#541a30", "#ba5363", "#70203b"];

  const clusters = [
    new Vector3(-0.64, 0.24, 0.76),
    new Vector3(0.32, -0.64, 0.7),
    new Vector3(-0.32, 0.86, -0.24),
    new Vector3(0.8, 0.05, -0.48),
    new Vector3(-0.2, -0.35, -0.88),
  ];

  // Inclusions emerge in seams; most of each prism remains inside the matrix.
  for (let i = 0; i < 26; i++) {
    const direction = clusters[i % clusters.length].clone().add(
      new Vector3((random() - 0.5) * 0.28, (random() - 0.5) * 0.38, (random() - 0.5) * 0.2),
    ).normalize();
    const point = surface(direction).multiplyScalar(0.91);
    const axis = new Vector3(-0.38 + random() * 0.16, 0.85, 0.12 + random() * 0.16).normalize();
    rotation.setFromUnitVectors(UP, axis);
    const radius = 0.07 + random() ** 1.4 * 0.115;
    const geometry = createCrystal(radius, 0.28 + random() * 0.58, 370 + i);
    geometry.applyMatrix4(transform.compose(point, rotation, unitScale));
    tintGeometry(geometry, new Color(redColors[i % redColors.length]), 0.22);
    reds.push(geometry);
  }

  // Small pale fracture faces break up the silhouette and give the matrix depth.
  for (let i = 0; i < 90; i++) {
    const direction = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    const point = surface(direction).multiplyScalar(0.99);
    const axis = direction.clone().add(new Vector3(-0.2, 0.5, 0)).normalize();
    rotation.setFromUnitVectors(UP, axis);
    const size = 0.025 + random() * 0.065;
    const geometry = new IcosahedronGeometry(1, 0).scale(size * 1.4, size * 0.65, size);
    geometry.applyMatrix4(transform.compose(point, rotation, unitScale));
    tintGeometry(geometry, new Color(i % 7 === 0 ? "#9f8c54" : "#b9aa98"), 0.2);
    quartz.push(geometry);
  }

  // Reflective cleavage plates are geometry, so their glints follow the lighting.
  for (let i = 0; i < 420; i++) {
    const direction = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    const point = surface(direction).multiplyScalar(1.006);
    const size = 0.015 + random() ** 2 * 0.065;
    const geometry = new BoxGeometry(size, 0.004 + random() * 0.01, size * (0.6 + random())).toNonIndexed();
    rotation.setFromUnitVectors(UP, direction);
    rotation.multiply(new Quaternion().setFromAxisAngle(UP, random() * Math.PI));
    geometry.applyMatrix4(transform.compose(point, rotation, unitScale));
    tintGeometry(geometry, new Color(i % 3 === 0 ? "#c6b397" : "#827975"), 0.2);
    mica.push(geometry);
  }

  // A few larger cleavage surfaces keep the form from reading as a smooth pebble.
  for (let i = 0; i < 12; i++) {
    const direction = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    const geometry = new CylinderGeometry(0.1 + random() * 0.08, 0.16, 0.06, 5).toNonIndexed();
    rotation.setFromUnitVectors(UP, direction);
    geometry.applyMatrix4(transform.compose(surface(direction), rotation, unitScale));
    tintGeometry(geometry, new Color("#aca092"), 0.23);
    quartz.push(geometry);
  }

  const geometries = [matrix, mergeParts(reds), mergeParts(quartz), mergeParts(mica)];
  const materials = [matrixMaterial, crystalMaterial, quartzMaterial, micaMaterial];
  geometries.forEach((geometry, i) => {
    const mesh = new Mesh(geometry, materials[i]);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  });

  const center = new Box3().setFromObject(group).getCenter(new Vector3());
  group.children.forEach((child) => child.position.sub(center));
  group.rotation.set(0.2, -0.35, -0.18);

  return {
    group,
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      grain.dispose();
    },
  };
}
