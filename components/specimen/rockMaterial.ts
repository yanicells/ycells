import { MeshStandardMaterial } from "three";

const NOISE = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vZone;

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x),
          mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x),
          mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }

  // Cellular noise: x = distance to the nearest jittered point, y = to the second nearest,
  // z = the nearest cell's random id. Each cell is one mineral grain.
  vec3 cells(vec3 x) {
    vec3 base = floor(x);
    vec3 local = fract(x);
    float first = 8.0;
    float second = 8.0;
    float id = 0.0;
    for (int k = -1; k <= 1; k++) {
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec3 cell = vec3(float(i), float(j), float(k));
          vec3 delta = cell + hash33(base + cell) - local;
          float d = dot(delta, delta);
          if (d < first) {
            second = first;
            first = d;
            id = hash13(base + cell + 7.7);
          } else if (d < second) {
            second = d;
          }
        }
      }
    }
    return vec3(sqrt(first), sqrt(second), id);
  }

  float fbm(vec3 p) {
    float sum = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += amplitude * vnoise(p);
      p = p * 2.03 + vec3(11.7, 3.1, 7.3);
      amplitude *= 0.5;
    }
    return sum;
  }

  // Mikkelsen's screen-space bump: perturb the normal from a height derivative.
  vec3 bumpNormal(vec3 surfacePosition, vec3 surfaceNormal, vec2 dHdxy, float faceDirection) {
    vec3 sigmaX = dFdx(surfacePosition);
    vec3 sigmaY = dFdy(surfacePosition);
    vec3 r1 = cross(sigmaY, surfaceNormal);
    vec3 r2 = cross(surfaceNormal, sigmaX);
    float det = dot(sigmaX, r1) * faceDirection;
    vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
    return normalize(abs(det) * surfaceNormal - grad);
  }
`;

// Per-pixel grain in object space: no UVs, no texture seams, detail at any zoom.
const ALBEDO = /* glsl */ `
  float grain = fbm(vObj * 46.0);
  float micro = vnoise(vObj * 150.0);
  vec3 g1 = cells(vObj * 84.0);
  vec3 g2 = cells(vObj * 34.0 + 9.0);
  float boundary = smoothstep(0.0, 0.1, g1.y - g1.x);

  // Polycrystalline mosaic: every grain has its own tone, with dim boundaries between.
  float tone = mix(0.74, 1.3, g1.z) * mix(0.8, 1.24, g2.z);
  diffuseColor.rgb *= tone * (0.78 + 0.22 * boundary) * (0.75 + grain * 0.5);

  float paleGrain = step(1.0 - (0.08 + 0.5 * vZone.x), fract(g1.z * 5.31));
  float darkGrain = step(1.0 - (0.03 + 0.34 * vZone.y), fract(g1.z * 9.17));
  float sparkle = step(0.965, fract(g1.z * 3.71)) * (1.0 - smoothstep(0.1, 0.22, g1.x));
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.8, 0.7), paleGrain * 0.4);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.06, 0.04, 0.03), darkGrain * 0.85);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.92, 0.85), sparkle * 0.85);

  // Iron oxide film: a ragged edge, sugary grains from deep red-brown to bright orange.
  float oxideMask = smoothstep(0.42, 0.7, vZone.z + (grain - 0.5) * 0.85 + (g1.z - 0.5) * 0.3);
  vec3 rustTone = mix(vec3(0.2, 0.035, 0.02), vec3(0.86, 0.26, 0.07), pow(g1.z, 0.9) * (0.55 + 0.7 * micro));
  diffuseColor.rgb = mix(diffuseColor.rgb, rustTone, oxideMask * 0.94);
`;

const ROUGHNESS = /* glsl */ `
  // Quartz is waxy, rust is dull, and cleavage flecks flash like tiny mirrors.
  roughnessFactor = mix(0.5, 0.95, clamp(g1.z * 0.6 + oxideMask * 0.5, 0.0, 1.0)) * (0.85 + micro * 0.3);
  roughnessFactor = mix(roughnessFactor, 0.14, sparkle * 0.8);
`;

const METALNESS = /* glsl */ `
  metalnessFactor = sparkle * 0.3;
`;

const NORMAL = /* glsl */ `
  float relief = -g1.x * 0.5 + fbm(vObj * 34.0) * 0.5 - g2.x * 0.3 + vnoise(vObj * 190.0) * 0.1;
  vec2 dh = vec2(dFdx(relief), dFdy(relief)) * 0.011;
  normal = bumpNormal(-vViewPosition, normal, dh, faceDirection);
`;

/** Rock body: vertex colour for broad tone, shader for everything finer. */
export function createRockMaterial() {
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0,
  });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 zone;\nvarying vec3 vObj;\nvarying vec3 vZone;",
      )
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;\nvZone = zone;");

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${ALBEDO}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${ROUGHNESS}`)
      .replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>\n${METALNESS}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${NORMAL}`);
  };

  return material;
}
