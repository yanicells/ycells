/**
 * Serialize the procedural Three specimen for the offline Blender renderer.
 *
 * This intentionally exports only mesh data (not a browser renderer or a
 * texture image). The matrix is Three's column-major matrixWorld; the Python
 * renderer converts it to Blender's row-major Matrix representation.
 *
 * Usage:
 *   bun scripts/export-specimen.ts --output /tmp/ycells-specimen.json
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Color, Material, Mesh, Scene } from "three";
import { createMineral } from "../components/specimen/mineral";

type NumberAttribute = {
  itemSize: number;
  normalized: boolean;
  array: number[];
};

type ExportedMaterial = {
  name: string;
  type: string;
  color: [number, number, number];
  vertexColors: boolean;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  ior: number;
  bumpScale: number;
  flatShading: boolean;
};

type ExportedMesh = {
  name: string;
  matrixWorld: number[];
  attributes: Record<string, NumberAttribute>;
  index: number[] | null;
  material: ExportedMaterial;
};

function numbers(attribute: { array: ArrayLike<number> }): number[] {
  return Array.from(attribute.array, Number);
}

function attribute(
  geometry: Mesh["geometry"],
  name: string,
): NumberAttribute | undefined {
  const value = geometry.getAttribute(name);
  if (!value) return undefined;
  return {
    itemSize: value.itemSize,
    normalized: value.normalized,
    array: numbers(value),
  };
}

function materialData(material: Material): ExportedMaterial {
  const candidate = material as Material & {
    color?: Color;
    vertexColors?: boolean;
    roughness?: number;
    metalness?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    ior?: number;
    bumpScale?: number;
    flatShading?: boolean;
  };
  const color = candidate.color ?? new Color(0xffffff);
  return {
    name: material.name || material.type,
    type: material.type,
    color: [color.r, color.g, color.b],
    vertexColors: Boolean(candidate.vertexColors),
    roughness: candidate.roughness ?? 0.5,
    metalness: candidate.metalness ?? 0,
    clearcoat: candidate.clearcoat ?? 0,
    clearcoatRoughness: candidate.clearcoatRoughness ?? 0.03,
    ior: candidate.ior ?? 1.5,
    bumpScale: candidate.bumpScale ?? 0,
    flatShading: Boolean(candidate.flatShading),
  };
}

function parseOutput() {
  const args = process.argv.slice(2);
  const index = args.indexOf("--output");
  return index >= 0 && args[index + 1]
    ? resolve(args[index + 1])
    : `/tmp/ycells-specimen-${process.pid}.json`;
}

const output = parseOutput();
const mineral = createMineral();
const scene = new Scene();
scene.add(mineral.group);
scene.updateMatrixWorld(true);

const meshes: ExportedMesh[] = [];
mineral.group.traverse((object) => {
  if (!(object instanceof Mesh)) return;
  const position = attribute(object.geometry, "position");
  if (!position) return;
  const attributes: Record<string, NumberAttribute> = { position };
  for (const name of ["normal", "color", "uv"]) {
    const value = attribute(object.geometry, name);
    if (value) attributes[name] = value;
  }
  const indexArray = object.geometry.index?.array;
  meshes.push({
    name: object.name || `mesh-${meshes.length}`,
    matrixWorld: object.matrixWorld.toArray(),
    attributes,
    index: indexArray ? Array.from(indexArray, Number) : null,
    material: materialData(Array.isArray(object.material) ? object.material[0] : object.material),
  });
});

const payload = {
  version: 1,
  coordinateSystem: "three-numeric-coordinates-camera-local-y-up",
  camera: {
    position: [0, 0, 0],
    target: [0, 0, 0],
    fov: 32,
  },
  meshes,
};

payload.camera.position = [0, 0, (mineral.radius * 1.16) / Math.sin((32 * Math.PI) / 360)];

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(payload));
mineral.dispose();
console.log(JSON.stringify({ output, meshes: meshes.length }));
