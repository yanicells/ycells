import {
  Box3,
  BufferGeometry,
  Color,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  Quaternion,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createCrystal } from "./crystals";
import { createRock, Groove, surfacePoint } from "./rock";
import { createRockMaterial } from "./rockMaterial";

const UP = new Vector3(0, 1, 0);

interface CrystalSpec {
  /** Where on the rock surface the crystal is rooted. */
  at: [number, number, number];
  /** Growth direction of the terminated end. */
  axis: [number, number, number];
  radius: number;
  length: number;
  top: string;
  bottom: string;
  /** 1 leaves the centre on the surface; lower values bury more of the crystal. */
  inset?: number;
  /** Carve a trench for the crystal to lie in. */
  groove?: boolean;
}

// Rubellite (pink-red tourmaline) is the star; olive-green crystals sit in the pocket.
const RUBELLITE: CrystalSpec[] = [
  { at: [-0.42, -0.02, 0.9], axis: [-0.5, 0.86, 0.1], radius: 0.125, length: 0.95, top: "#d8244f", bottom: "#33101f", inset: 0.86, groove: true },
  { at: [-0.32, -0.52, 0.8], axis: [-0.4, 0.7, 0.5], radius: 0.13, length: 0.36, top: "#e0386a", bottom: "#8c2048", inset: 0.9 },
  { at: [-0.5, -0.4, 0.72], axis: [-0.7, 0.4, 0.6], radius: 0.06, length: 0.3, top: "#d63a52", bottom: "#7a1c38", inset: 0.92 },
  { at: [-0.62, -0.28, 0.66], axis: [-0.3, 0.5, 0.8], radius: 0.05, length: 0.26, top: "#e0503a", bottom: "#8f2a22", inset: 0.9 },
  { at: [-0.2, -0.62, 0.75], axis: [0.2, 0.6, 0.7], radius: 0.055, length: 0.3, top: "#d8305a", bottom: "#701c3a", inset: 0.88 },
  { at: [-0.05, -0.7, 0.72], axis: [0.5, 0.5, 0.7], radius: 0.045, length: 0.28, top: "#e0405e", bottom: "#7a2040", inset: 0.88 },
  { at: [-0.7, -0.05, 0.6], axis: [-0.5, 0.6, 0.6], radius: 0.05, length: 0.3, top: "#dc3a48", bottom: "#7c1e2c", inset: 0.9 },
  { at: [0.12, 0.92, 0.3], axis: [0.75, 0.35, 0.3], radius: 0.06, length: 0.55, top: "#d0284e", bottom: "#5a1028", inset: 0.86 },
  { at: [0.72, 0.62, -0.05], axis: [0.5, 0.5, 0.4], radius: 0.05, length: 0.4, top: "#c22b50", bottom: "#701436", inset: 0.88 },
  { at: [0.96, -0.1, 0.2], axis: [0.7, 0.2, 0.5], radius: 0.05, length: 0.3, top: "#dd4a72", bottom: "#8a2a4c", inset: 0.9 },
  { at: [0.52, -0.18, 0.85], axis: [0.1, 0.9, 0.3], radius: 0.07, length: 0.4, top: "#8a2444", bottom: "#33101f", inset: 0.88 },
  { at: [0.4, -0.5, 0.75], axis: [0.3, 0.7, 0.5], radius: 0.05, length: 0.3, top: "#c83452", bottom: "#5c1830", inset: 0.9 },
];

const GREEN: CrystalSpec[] = [
  { at: [0.26, -0.28, 0.9], axis: [0.2, 0.6, 0.7], radius: 0.125, length: 0.28, top: "#c9cf50", bottom: "#7d9030", inset: 0.93 },
  { at: [0.64, -0.24, 0.72], axis: [-0.1, 0.5, 0.8], radius: 0.12, length: 0.26, top: "#cdd04a", bottom: "#899a2c", inset: 0.93 },
  { at: [-0.55, 0.5, 0.6], axis: [-0.4, 0.5, 0.7], radius: 0.09, length: 0.2, top: "#a9ad40", bottom: "#6f7a2a", inset: 0.95 },
];

/** Trenches along the crystals that should look embedded rather than stuck on. */
function crystalGrooves(specs: CrystalSpec[]): Groove[] {
  return specs
    .filter((spec) => spec.groove)
    .map((spec) => {
      const axis = new Vector3(...spec.axis).normalize();
      const center = surfacePoint(new Vector3(...spec.at), spec.inset ?? 1);
      const half = axis.multiplyScalar(spec.length / 2);
      return {
        from: center.clone().sub(half),
        to: center.clone().add(half),
        width: spec.radius * 3.2,
        depth: 0.13,
      };
    });
}

function buildCrystals(specs: CrystalSpec[], seed: number) {
  const parts: BufferGeometry[] = [];
  const rotation = new Quaternion();
  const transform = new Matrix4();
  const unit = new Vector3(1, 1, 1);

  specs.forEach((spec, i) => {
    const geometry = createCrystal({
      radius: spec.radius,
      length: spec.length,
      seed: seed + i * 17,
      top: new Color(spec.top),
      bottom: new Color(spec.bottom),
    });
    const point = surfacePoint(new Vector3(...spec.at), spec.inset ?? 1);
    rotation.setFromUnitVectors(UP, new Vector3(...spec.axis).normalize());
    geometry.applyMatrix4(transform.compose(point, rotation, unit));
    parts.push(geometry);
  });
  return parts;
}

function mergeParts(parts: BufferGeometry[]) {
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Unable to assemble the mineral geometry.");
  return geometry;
}

/** Artistic rubidium-bearing specimen (lepidolite / rubellite pegmatite), not pure Rb. */
export function createMineral() {
  const group = new Group();

  const rockMaterial = createRockMaterial();
  // Transmission lets light pass through and tint, so the prisms read as gem, not plastic.
  const crystalMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.05,
    transmission: 0.55,
    thickness: 0.3,
    ior: 1.62,
    attenuationColor: new Color("#8a0c30"),
    attenuationDistance: 0.45,
    // A faint inner glow stands in for light scattering inside the crystal.
    emissive: new Color("#4a0616"),
    emissiveIntensity: 0.7,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  const greenMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.28,
    transmission: 0.3,
    thickness: 0.2,
    ior: 1.6,
    attenuationColor: new Color("#8b9a1c"),
    attenuationDistance: 0.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  });

  const geometries = [
    createRock(crystalGrooves(RUBELLITE)),
    mergeParts(buildCrystals(RUBELLITE, 370)),
    mergeParts(buildCrystals(GREEN, 910)),
  ];
  const materials = [rockMaterial, crystalMaterial, greenMaterial];
  geometries.forEach((geometry, i) => {
    const mesh = new Mesh(geometry, materials[i]);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  });

  const center = new Box3().setFromObject(group).getCenter(new Vector3());
  group.children.forEach((child) => child.position.sub(center));
  group.rotation.set(0.24, -0.26, 0.26);
  group.updateMatrixWorld(true);
  // Centre again after rotating so the specimen sits in the middle of the frame.
  group.position.sub(new Box3().setFromObject(group).getCenter(new Vector3()));
  group.updateMatrixWorld(true);

  // Fit the actual vertices, not the empty corners of a rotated bounding box.
  const vertex = new Vector3();
  let radius = 0;
  geometries.forEach((geometry, i) => {
    const position = geometry.getAttribute("position");
    for (let j = 0; j < position.count; j++) {
      vertex.fromBufferAttribute(position, j).applyMatrix4(group.children[i].matrixWorld);
      radius = Math.max(radius, vertex.length());
    }
  });

  return {
    group,
    // The block is elongated; a tight sphere fit keeps it filling the frame.
    radius: radius * 0.95,
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
