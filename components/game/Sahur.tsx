"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WOOD = "#d2b08a";
const WOOD_MID = "#c49a72";
const WOOD_DARK = "#9a7352";
const WOOD_DEEP = "#6e5238";
const FLESH = "#d8a878";
const FLESH_SHADOW = "#b88860";
const EYE_WHITE = "#f7f4ee";
const PUPIL = "#1a1210";
const LIP = "#6a4a3a";
const NOSE = "#c9a078";

export type SahurAnimState = {
  x: number;
  z: number;
  yaw: number;
  moveAmount: number;
  hitFlash: number;
};

type SahurProps = {
  anim: React.MutableRefObject<SahurAnimState>;
  reducedMotion?: boolean;
};

function makeWoodGrainTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#a87852");
  g.addColorStop(0.18, "#c49a72");
  g.addColorStop(0.4, "#e2c8a4");
  g.addColorStop(0.55, "#f0d8b4");
  g.addColorStop(0.72, "#d2b08a");
  g.addColorStop(0.9, "#b88962");
  g.addColorStop(1, "#9a7352");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 512);

  for (let i = 0; i < 48; i++) {
    const x = Math.random() * 256;
    ctx.strokeStyle = `rgba(70, 48, 28, ${0.05 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 10,
      170,
      x + (Math.random() - 0.5) * 14,
      340,
      x + (Math.random() - 0.5) * 8,
      512,
    );
    ctx.stroke();
  }

  for (let i = 0; i < 12; i++) {
    const y = 30 + Math.random() * 450;
    ctx.strokeStyle = `rgba(100, 72, 45, ${0.07 + Math.random() * 0.1})`;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.ellipse(128, y, 28 + Math.random() * 40, 3 + Math.random() * 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Soft polish highlight band
  const shine = ctx.createLinearGradient(0, 0, 256, 0);
  shine.addColorStop(0, "rgba(255,240,210,0)");
  shine.addColorStop(0.45, "rgba(255,245,220,0.12)");
  shine.addColorStop(0.55, "rgba(255,245,220,0.12)");
  shine.addColorStop(1, "rgba(255,240,210,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 256, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * Procedural Tung Tung Tung Sahur — tall kentongan body, bulging face,
 * spindly limbs, oversized feet, wooden bat. Built to match the meme ref.
 */
export default function Sahur({ anim, reducedMotion = false }: SahurProps) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const bat = useRef<THREE.Group>(null);
  const bodyMesh = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  const bodyMat = useMemo(() => makeWoodGrainTexture(), []);

  useFrame((_, dt) => {
    const a = anim.current;
    const motion = reducedMotion ? 0.15 : 1;
    const moving = a.moveAmount > 0.08;
    phase.current += dt * (moving ? 8.5 + a.moveAmount * 3.5 : 2) * motion;

    if (root.current) {
      // Feet rest on the floor (oversized soles) — scaled body sits higher
      root.current.position.set(a.x, 1.48, a.z);
      root.current.rotation.y = a.yaw;
      const punch = a.hitFlash > 0 ? 1 + a.hitFlash * 0.07 : 1;
      root.current.scale.setScalar(1.85 * punch);
    }

    const bob =
      Math.sin(phase.current * (moving ? 1 : 0.4)) *
      (moving ? 0.09 : 0.035) *
      motion;
    const lean = moving ? a.moveAmount * 0.12 * motion : 0;

    if (body.current) {
      body.current.position.y = bob;
      body.current.rotation.x = lean;
      body.current.rotation.z =
        Math.sin(phase.current * 0.5) * 0.025 * motion * (moving ? 1 : 0.35);
    }

    const swing = Math.sin(phase.current) * (moving ? 0.55 : 0.06) * motion;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.45 - 0.25;
    if (bat.current) {
      bat.current.rotation.z =
        0.78 + Math.sin(phase.current * 0.8) * 0.05 * motion;
      bat.current.rotation.x = 1.15 + swing * 0.08;
    }

    if (bodyMesh.current) {
      const mat = bodyMesh.current.material as THREE.MeshStandardMaterial;
      if (a.hitFlash > 0) {
        mat.emissive.set("#ff8866");
        mat.emissiveIntensity = a.hitFlash * 0.85;
      } else {
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group ref={root} scale={1.85}>
      <group ref={body}>
        {/* Tall continuous kentongan body (~65% of figure height) */}
        <mesh ref={bodyMesh} castShadow receiveShadow position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.62, 0.7, 4.05, 48]} />
          <meshStandardMaterial
            map={bodyMat}
            color="#e8d0aa"
            roughness={0.22}
            metalness={0.08}
            envMapIntensity={1.05}
          />
        </mesh>

        {/* Flat-topped kentongan rim with subtle hollow */}
        <mesh castShadow position={[0, 4.45, 0]}>
          <cylinderGeometry args={[0.68, 0.62, 0.14, 48]} />
          <meshStandardMaterial
            map={bodyMat}
            color={WOOD}
            roughness={0.26}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 4.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.05, 12, 48]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.38} metalness={0.06} />
        </mesh>
        <mesh position={[0, 4.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.54, 36]} />
          <meshStandardMaterial color={WOOD_DEEP} roughness={0.78} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 4.48, 0]}>
          <cylinderGeometry args={[0.38, 0.42, 0.08, 28]} />
          <meshStandardMaterial color="#5a4030" roughness={0.85} />
        </mesh>

        {/* Soft belly taper / mid band */}
        <mesh castShadow position={[0, 1.45, 0]}>
          <torusGeometry args={[0.7, 0.042, 10, 40]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.45} metalness={0.05} />
        </mesh>
        {/* Upper wrap band — reads from sides */}
        <mesh castShadow position={[0, 3.7, 0]}>
          <torusGeometry args={[0.64, 0.032, 10, 40]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.4} metalness={0.06} />
        </mesh>
        {/* Lower wrap band */}
        <mesh castShadow position={[0, 0.55, 0]}>
          <torusGeometry args={[0.72, 0.035, 10, 40]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.48} metalness={0.05} />
        </mesh>

        {/* Kentongan back slit — silhouette from behind */}
        <mesh castShadow position={[0, 2.4, -0.64]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.12, 3.1, 0.14]} />
          <meshStandardMaterial color={WOOD_DEEP} roughness={0.7} metalness={0.02} />
        </mesh>
        <mesh position={[0, 2.4, -0.68]}>
          <boxGeometry args={[0.06, 2.9, 0.08]} />
          <meshStandardMaterial color="#4a3424" roughness={0.85} />
        </mesh>
        {/* Side ridges so the cylinder reads in profile */}
        <mesh castShadow position={[-0.68, 2.4, 0]} rotation={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.03, 0.03, 3.7, 8]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.35} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0.68, 2.4, 0]} rotation={[0, 0, -0.04]}>
          <cylinderGeometry args={[0.03, 0.03, 3.7, 8]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.35} metalness={0.08} />
        </mesh>

        <Face />

        {/* Left arm — shoulder stub anchored into cylinder side */}
        <group ref={leftArm} position={[-0.62, 2.85, 0.08]}>
          <mesh castShadow position={[0.08, 0.02, 0]} scale={[1.2, 1.1, 1.1]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial color={WOOD_MID} roughness={0.4} />
          </mesh>
          <mesh castShadow rotation={[0.2, 0, 0.55]} position={[-0.12, -0.35, 0.02]}>
            <cylinderGeometry args={[0.028, 0.038, 0.75, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.42} metalness={0.06} />
          </mesh>
          <mesh castShadow position={[-0.32, -0.72, 0.06]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color={WOOD_MID} roughness={0.45} />
          </mesh>
          <mesh castShadow rotation={[0.4, 0, 0.4]} position={[-0.42, -1.05, 0.1]}>
            <cylinderGeometry args={[0.022, 0.03, 0.72, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.44} metalness={0.05} />
          </mesh>
          <mesh castShadow position={[-0.55, -1.4, 0.14]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color={FLESH} roughness={0.62} />
          </mesh>
        </group>

        {/* Right arm — shoulder stub + bat grip */}
        <group ref={rightArm} position={[0.62, 2.85, 0.08]}>
          <mesh castShadow position={[-0.08, 0.02, 0]} scale={[1.2, 1.1, 1.1]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial color={WOOD_MID} roughness={0.4} />
          </mesh>
          <mesh castShadow rotation={[0.25, 0, -0.5]} position={[0.12, -0.35, 0.02]}>
            <cylinderGeometry args={[0.028, 0.038, 0.75, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.42} metalness={0.06} />
          </mesh>
          <mesh castShadow position={[0.32, -0.72, 0.06]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color={WOOD_MID} roughness={0.45} />
          </mesh>
          <mesh castShadow rotation={[0.55, 0, -0.35]} position={[0.42, -1.05, 0.12]}>
            <cylinderGeometry args={[0.022, 0.03, 0.72, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.44} metalness={0.05} />
          </mesh>
          <mesh castShadow position={[0.55, -1.4, 0.18]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color={FLESH} roughness={0.62} />
          </mesh>
          {/* Fingers wrapping bat handle */}
          <mesh castShadow position={[0.58, -1.48, 0.26]} rotation={[0.5, 0.1, 0.15]}>
            <capsuleGeometry args={[0.016, 0.1, 2, 6]} />
            <meshStandardMaterial color={FLESH} roughness={0.65} />
          </mesh>
          <mesh castShadow position={[0.62, -1.46, 0.22]} rotation={[0.3, 0, 0.45]}>
            <capsuleGeometry args={[0.015, 0.09, 2, 6]} />
            <meshStandardMaterial color={FLESH} roughness={0.65} />
          </mesh>
          <mesh castShadow position={[0.64, -1.44, 0.18]} rotation={[0.15, 0, 0.7]}>
            <capsuleGeometry args={[0.014, 0.08, 2, 6]} />
            <meshStandardMaterial color={FLESH} roughness={0.65} />
          </mesh>
          <mesh castShadow position={[0.52, -1.5, 0.28]} rotation={[0.8, -0.2, -0.3]}>
            <capsuleGeometry args={[0.016, 0.07, 2, 6]} />
            <meshStandardMaterial color={FLESH} roughness={0.65} />
          </mesh>
          <group
            ref={bat}
            position={[0.6, -1.55, 0.24]}
            rotation={[1.15, -0.3, 0.78]}
          >
            <BatMesh />
          </group>
        </group>

        <group ref={leftLeg} position={[-0.24, 0.4, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.026, 0.03, 0.52, 8]} />
            <meshStandardMaterial color={WOOD_DEEP} roughness={0.48} />
          </mesh>
          <mesh castShadow position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.45} />
          </mesh>
          <mesh castShadow position={[0, -0.78, 0]}>
            <cylinderGeometry args={[0.022, 0.028, 0.52, 8]} />
            <meshStandardMaterial color={WOOD_DEEP} roughness={0.5} />
          </mesh>
          <Foot side={-1} />
        </group>
        <group ref={rightLeg} position={[0.24, 0.4, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.026, 0.03, 0.52, 8]} />
            <meshStandardMaterial color={WOOD_DEEP} roughness={0.48} />
          </mesh>
          <mesh castShadow position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.45} />
          </mesh>
          <mesh castShadow position={[0, -0.78, 0]}>
            <cylinderGeometry args={[0.022, 0.028, 0.52, 8]} />
            <meshStandardMaterial color={WOOD_DEEP} roughness={0.5} />
          </mesh>
          <Foot side={1} />
        </group>
      </group>
    </group>
  );
}

function Face() {
  return (
    <group position={[0, 3.4, 0.48]}>
      {/* Soft facial mound — flush with cylinder, slight forward carve */}
      <mesh castShadow position={[0, -0.02, 0.08]} scale={[1.2, 1.35, 0.85]}>
        <sphereGeometry
          args={[0.5, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.72]}
        />
        <meshStandardMaterial color="#ddc09a" roughness={0.32} metalness={0.03} />
      </mesh>

      {/* Recessed eye sockets — darker inset so sclera sits inside wood */}
      <mesh position={[-0.2, 0.14, 0.28]} scale={[1.15, 1.05, 0.7]}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#8a6848" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.14, 0.28]} scale={[1.15, 1.05, 0.7]}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#8a6848" roughness={0.7} />
      </mesh>
      <mesh position={[-0.2, 0.14, 0.32]} scale={[0.95, 0.85, 0.45]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#6a4e38" roughness={0.78} />
      </mesh>
      <mesh position={[0.2, 0.14, 0.32]} scale={[0.95, 0.85, 0.45]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#6a4e38" roughness={0.78} />
      </mesh>

      {/* Heavy brow ridge spanning both sockets */}
      <mesh castShadow position={[0, 0.38, 0.38]} scale={[1.85, 0.38, 0.75]}>
        <sphereGeometry args={[0.25, 20, 14]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[-0.2, 0.36, 0.45]} scale={[0.8, 0.4, 0.6]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0.2, 0.36, 0.45]} scale={[0.8, 0.4, 0.6]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.42} />
      </mesh>
      {/* Glabella / frown between brows */}
      <mesh position={[0, 0.3, 0.48]} scale={[0.55, 0.45, 0.5]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.48} />
      </mesh>

      <Eye position={[-0.2, 0.12, 0.4]} />
      <Eye position={[0.2, 0.12, 0.4]} />

      {/* Human nose — bridge, bulb tip, nostrils protruding from wood */}
      <group position={[0, -0.02, 0.48]} rotation={[0.28, 0, 0]}>
        <mesh castShadow position={[0, 0.12, 0.02]} scale={[0.9, 1.15, 1.1]}>
          <capsuleGeometry args={[0.07, 0.2, 4, 14]} />
          <meshStandardMaterial color={NOSE} roughness={0.36} />
        </mesh>
        <mesh castShadow position={[0, -0.02, 0.1]} scale={[1.35, 0.95, 1.25]}>
          <sphereGeometry args={[0.1, 16, 14]} />
          <meshStandardMaterial color="#c49872" roughness={0.38} />
        </mesh>
        <mesh castShadow position={[0, -0.08, 0.14]} scale={[1.1, 0.7, 0.9]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#b88860" roughness={0.42} />
        </mesh>
        <mesh position={[-0.055, -0.1, 0.12]} scale={[0.7, 0.55, 0.7]} rotation={[0.3, 0.4, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={FLESH_SHADOW} roughness={0.55} />
        </mesh>
        <mesh position={[0.055, -0.1, 0.12]} scale={[0.7, 0.55, 0.7]} rotation={[0.3, -0.4, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={FLESH_SHADOW} roughness={0.55} />
        </mesh>
        {/* Nostril holes */}
        <mesh position={[-0.04, -0.11, 0.155]} scale={[0.55, 0.4, 0.35]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#4a3020" roughness={0.9} />
        </mesh>
        <mesh position={[0.04, -0.11, 0.155]} scale={[0.55, 0.4, 0.35]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#4a3020" roughness={0.9} />
        </mesh>
      </group>
      {/* Wide thin-lipped Mona Lisa smirk — upper + lower lip meshes */}
      <group position={[0.04, -0.38, 0.46]} rotation={[0.15, 0.08, -0.18]}>
        {/* Upper lip curve */}
        <mesh
          castShadow
          position={[0.02, 0.02, 0.02]}
          rotation={[1.35, 0.05, -0.35]}
          scale={[1.65, 0.55, 0.9]}
        >
          <torusGeometry args={[0.16, 0.022, 8, 32, Math.PI * 0.85]} />
          <meshStandardMaterial color={LIP} roughness={0.5} />
        </mesh>
        {/* Lower lip — slightly fuller */}
        <mesh
          castShadow
          position={[0.02, -0.035, 0.03]}
          rotation={[1.55, 0.05, -0.32]}
          scale={[1.55, 0.7, 0.95]}
        >
          <torusGeometry args={[0.145, 0.028, 8, 28, Math.PI * 0.8]} />
          <meshStandardMaterial color="#7a5545" roughness={0.52} />
        </mesh>
        {/* Lip corner dimples */}
        <mesh position={[-0.12, -0.01, 0.04]} scale={[0.6, 0.45, 0.5]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#a07058" roughness={0.55} />
        </mesh>
        <mesh position={[0.18, -0.04, 0.02]} scale={[0.55, 0.4, 0.45]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#a07058" roughness={0.55} />
        </mesh>
      </group>

      {/* Cheeks + jaw so the face reads human from 3/4 view */}
      <mesh castShadow position={[0.36, -0.12, 0.3]} scale={[1.2, 1.0, 0.9]}>
        <sphereGeometry args={[0.14, 14, 12]} />
        <meshStandardMaterial color="#d4ac88" roughness={0.44} />
      </mesh>
      <mesh castShadow position={[-0.34, -0.1, 0.28]} scale={[1.1, 0.9, 0.85]}>
        <sphereGeometry args={[0.125, 14, 12]} />
        <meshStandardMaterial color="#d4ac88" roughness={0.44} />
      </mesh>
      <mesh castShadow position={[0.28, -0.42, 0.22]} scale={[1.1, 0.7, 0.85]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#c9a078" roughness={0.48} />
      </mesh>
      <mesh castShadow position={[-0.26, -0.4, 0.2]} scale={[1.0, 0.65, 0.8]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#c9a078" roughness={0.48} />
      </mesh>
      {/* Chin / jaw tip */}
      <mesh castShadow position={[0.02, -0.55, 0.32]} scale={[1.15, 0.7, 0.9]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial color="#d0a880" roughness={0.46} />
      </mesh>
      {/* Temples / side planes for 3/4 silhouette */}
      <mesh castShadow position={[0.42, 0.08, 0.12]} scale={[0.7, 1.1, 0.8]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#c49a72" roughness={0.42} />
      </mesh>
      <mesh castShadow position={[-0.42, 0.08, 0.12]} scale={[0.7, 1.1, 0.8]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#c49a72" roughness={0.42} />
      </mesh>
    </group>
  );
}

function Eye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Bulging sclera seated in socket — large but not floating orbs */}
      <mesh castShadow scale={[1.05, 1.15, 1.1]} position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.155, 28, 28]} />
        <meshStandardMaterial
          color={EYE_WHITE}
          roughness={0.1}
          metalness={0.02}
        />
      </mesh>

      {/* Upper eyelid — wraps over top of sclera so eye is attached */}
      <mesh
        castShadow
        position={[0, 0.1, 0.08]}
        rotation={[0.55, 0, 0]}
        scale={[1.15, 0.55, 0.85]}
      >
        <sphereGeometry
          args={[0.14, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]}
        />
        <meshStandardMaterial color="#c9a078" roughness={0.42} />
      </mesh>
      {/* Lower eyelid */}
      <mesh
        castShadow
        position={[0, -0.09, 0.1]}
        rotation={[-0.65, 0, 0]}
        scale={[1.05, 0.45, 0.7]}
      >
        <sphereGeometry
          args={[0.12, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]}
        />
        <meshStandardMaterial color="#c09070" roughness={0.48} />
      </mesh>

      {/* Iris + pupil — intense forward stare */}
      <mesh position={[0.01, -0.01, 0.13]} scale={[1, 1.05, 0.55]}>
        <sphereGeometry args={[0.072, 16, 16]} />
        <meshStandardMaterial color="#2a221c" roughness={0.4} />
      </mesh>
      <mesh position={[0.012, -0.012, 0.155]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={PUPIL} roughness={0.22} />
      </mesh>
      <mesh position={[-0.035, 0.035, 0.175]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.035, 0.005, 0.18]} scale={0.5}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Foot({ side }: { side: number }) {
  const toeXs = [-0.2, -0.1, 0, 0.1, 0.2];
  return (
    <group position={[0, -1.1, 0.12]} rotation={[0.08, side * 0.12, 0]}>
      {/* Elongated human sole — heel to ball */}
      <mesh castShadow position={[0, 0.02, 0.08]} scale={[1.05, 0.35, 1.85]}>
        <capsuleGeometry args={[0.22, 0.35, 4, 12]} />
        <meshStandardMaterial color={FLESH} roughness={0.64} />
      </mesh>
      {/* Heel */}
      <mesh castShadow position={[0, 0.04, -0.28]} scale={[1.05, 0.7, 0.95]}>
        <sphereGeometry args={[0.16, 14, 12]} />
        <meshStandardMaterial color={FLESH_SHADOW} roughness={0.7} />
      </mesh>
      {/* Arch / midfoot */}
      <mesh castShadow position={[0, 0.06, 0.02]} scale={[0.85, 0.55, 1.1]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={FLESH} roughness={0.62} />
      </mesh>
      {/* Ball of foot */}
      <mesh castShadow position={[0, 0.03, 0.38]} scale={[1.25, 0.45, 0.85]}>
        <sphereGeometry args={[0.16, 14, 12]} />
        <meshStandardMaterial color={FLESH} roughness={0.64} />
      </mesh>
      {/* Ankle */}
      <mesh castShadow position={[0, 0.16, -0.08]} scale={[0.85, 0.85, 0.9]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color={FLESH} roughness={0.6} />
      </mesh>
      {/* Five graduated toes pointing forward */}
      {toeXs.map((x, i) => {
        const mid = 2;
        const dist = Math.abs(i - mid);
        const len = 0.14 - dist * 0.018;
        const rad = 0.048 - dist * 0.006;
        return (
          <mesh
            key={i}
            castShadow
            position={[
              x + side * 0.02,
              0.035,
              0.58 + (mid - dist) * 0.02,
            ]}
            rotation={[0.15, 0, 0]}
            scale={[0.9, 0.7, 1.35]}
          >
            <capsuleGeometry args={[rad, len, 3, 8]} />
            <meshStandardMaterial color={FLESH} roughness={0.66} />
          </mesh>
        );
      })}
    </group>
  );
}

function BatMesh() {
  return (
    <group rotation={[0.1, 0, 0]}>
      {/* Handle — gripped near top */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.042, 0.052, 0.95, 12]} />
        <meshStandardMaterial color="#6b4f35" roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#5a412c" roughness={0.52} />
      </mesh>
      {/* Transition into barrel */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.09, 0.05, 0.28, 14]} />
        <meshStandardMaterial color="#8a6540" roughness={0.36} metalness={0.06} />
      </mesh>
      {/* Long barrel — thick tip tapering toward handle */}
      <mesh castShadow position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.2, 0.085, 1.55, 20]} />
        <meshStandardMaterial
          color="#c49a72"
          roughness={0.26}
          metalness={0.1}
        />
      </mesh>
      <mesh castShadow position={[0, -1.25, 0]}>
        <sphereGeometry args={[0.2, 18, 14]} />
        <meshStandardMaterial color="#b88962" roughness={0.24} metalness={0.08} />
      </mesh>
    </group>
  );
}
