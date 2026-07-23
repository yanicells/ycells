"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WOOD = "#c4a882";
const WOOD_DARK = "#8a6f52";
const WOOD_DEEP = "#6b5340";
const FLESH = "#d4a574";
const FLESH_SHADOW = "#b88962";
const EYE_WHITE = "#f5f2ea";
const PUPIL = "#1a1210";
const LIP = "#5c4034";

type SahurProps = {
  position?: [number, number, number];
  /** radians yaw — 0 faces +Z toward camera */
  yaw?: number;
  /** 0 idle … 1 full walk */
  moveAmount?: number;
  reducedMotion?: boolean;
  hitFlash?: number;
};

function woodMat(color = WOOD, gloss = 0.28) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={gloss}
      metalness={0.08}
      envMapIntensity={0.6}
    />
  );
}

function makeWoodGrainTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, "#b8956e");
  g.addColorStop(0.35, "#c9ad88");
  g.addColorStop(0.55, "#d4b896");
  g.addColorStop(0.8, "#b8956e");
  g.addColorStop(1, "#a07d5c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 64;
    ctx.strokeStyle = `rgba(90, 70, 48, ${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.6 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, 256);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Procedural Tung Tung Tung Sahur — cursed cylinder with stick limbs + bat. */
export default function Sahur({
  position = [0, 0, 0],
  yaw = 0,
  moveAmount = 0,
  reducedMotion = false,
  hitFlash = 0,
}: SahurProps) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const bat = useRef<THREE.Group>(null);
  const phase = useRef(0);

  const bodyMat = useMemo(() => makeWoodGrainTexture(), []);

  useFrame((_, dt) => {
    const motion = reducedMotion ? 0.15 : 1;
    const moving = moveAmount > 0.08;
    phase.current += dt * (moving ? 9 + moveAmount * 4 : 2.2) * motion;

    const bob =
      Math.sin(phase.current * (moving ? 1 : 0.45)) *
      (moving ? 0.06 : 0.035) *
      motion;
    const lean = moving ? moveAmount * 0.12 * motion : 0;

    if (body.current) {
      body.current.position.y = bob;
      body.current.rotation.x = lean;
      body.current.rotation.z =
        Math.sin(phase.current * 0.5) * 0.03 * motion * (moving ? 1 : 0.4);
    }

    const swing = Math.sin(phase.current) * (moving ? 0.55 : 0.06) * motion;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.55 - 0.25;
    if (bat.current) {
      bat.current.rotation.z = -0.35 + Math.sin(phase.current * 0.85) * 0.08 * motion;
      bat.current.rotation.x = 0.15 + swing * 0.15;
    }

    if (root.current && hitFlash > 0) {
      // brief flash handled via emissive on materials through scale punch
      const punch = 1 + hitFlash * 0.08;
      root.current.scale.setScalar(punch);
    } else if (root.current) {
      root.current.scale.setScalar(1);
    }
  });

  const flashEmissive = hitFlash > 0 ? "#ff8866" : "#000000";
  const flashIntensity = hitFlash * 0.85;

  return (
    <group ref={root} position={position} rotation={[0, yaw, 0]}>
      <group ref={body}>
        {/* Tall glossy wooden cylinder body */}
        <mesh castShadow position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.42, 0.44, 2.15, 32]} />
          <meshStandardMaterial
            map={bodyMat}
            color="#d2b48c"
            roughness={0.28}
            metalness={0.1}
            emissive={flashEmissive}
            emissiveIntensity={flashIntensity}
          />
        </mesh>

        {/* Top dome cap */}
        <mesh castShadow position={[0, 2.42, 0]}>
          <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={WOOD}
            roughness={0.25}
            metalness={0.1}
            emissive={flashEmissive}
            emissiveIntensity={flashIntensity}
          />
        </mesh>

        <Face />

        {/* Left arm (thin stick) — holds bat */}
        <group ref={leftArm} position={[-0.48, 1.55, 0]}>
          <mesh castShadow rotation={[0, 0, 0.35]} position={[-0.05, -0.35, 0]}>
            <cylinderGeometry args={[0.045, 0.05, 0.95, 8]} />
            {woodMat(WOOD_DARK, 0.4)}
          </mesh>
          {/* Hand */}
          <mesh castShadow position={[-0.22, -0.82, 0.05]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={FLESH} roughness={0.65} />
          </mesh>
          {/* Baseball bat */}
          <group
            ref={bat}
            position={[-0.28, -0.95, 0.12]}
            rotation={[0.2, 0.4, -0.55]}
          >
            <BatMesh />
          </group>
        </group>

        {/* Right arm */}
        <group ref={rightArm} position={[0.48, 1.55, 0]}>
          <mesh castShadow rotation={[0, 0, -0.28]} position={[0.05, -0.35, 0]}>
            <cylinderGeometry args={[0.045, 0.05, 0.95, 8]} />
            {woodMat(WOOD_DARK, 0.4)}
          </mesh>
          <mesh castShadow position={[0.2, -0.82, 0.02]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshStandardMaterial color={FLESH} roughness={0.65} />
          </mesh>
        </group>

        {/* Legs */}
        <group ref={leftLeg} position={[-0.16, 0.28, 0]}>
          <mesh castShadow position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.05, 0.055, 0.7, 8]} />
            {woodMat(WOOD_DEEP, 0.45)}
          </mesh>
          <Foot side={-1} />
        </group>
        <group ref={rightLeg} position={[0.16, 0.28, 0]}>
          <mesh castShadow position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.05, 0.055, 0.7, 8]} />
            {woodMat(WOOD_DEEP, 0.45)}
          </mesh>
          <Foot side={1} />
        </group>
      </group>
    </group>
  );
}

function Face() {
  // Face sits on the upper front of the cylinder (+Z)
  return (
    <group position={[0, 1.85, 0.38]}>
      {/* Soft face plate bulge */}
      <mesh castShadow position={[0, -0.05, 0.02]}>
        <sphereGeometry args={[0.28, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial
          color="#c9ae8c"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Bulging eyes */}
      <Eye position={[-0.12, 0.08, 0.18]} />
      <Eye position={[0.12, 0.08, 0.18]} />

      {/* Nose ridge */}
      <mesh castShadow position={[0, -0.02, 0.26]} rotation={[0.35, 0, 0]}>
        <capsuleGeometry args={[0.045, 0.1, 4, 8]} />
        <meshStandardMaterial color="#b8956e" roughness={0.4} />
      </mesh>

      {/* Uncanny smirk — curved torus segment */}
      <mesh
        position={[0.02, -0.16, 0.24]}
        rotation={[1.35, 0, -0.35]}
        scale={[1.05, 0.7, 1]}
      >
        <torusGeometry args={[0.09, 0.018, 8, 16, Math.PI * 0.85]} />
        <meshStandardMaterial color={LIP} roughness={0.55} />
      </mesh>

      {/* Tiny cheek dimple */}
      <mesh position={[0.16, -0.1, 0.2]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#a88868" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Eye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.095, 16, 16]} />
        <meshStandardMaterial
          color={EYE_WHITE}
          roughness={0.15}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0.01, -0.01, 0.075]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={PUPIL} roughness={0.4} />
      </mesh>
      {/* Tiny specular highlight */}
      <mesh position={[-0.03, 0.035, 0.085]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Foot({ side }: { side: number }) {
  return (
    <group position={[0, -0.62, 0.08]} rotation={[0.08, side * 0.12, 0]}>
      {/* Oversized bare foot pad */}
      <mesh castShadow position={[0, 0, 0.08]} scale={[1.05, 0.45, 1.55]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color={FLESH} roughness={0.7} />
      </mesh>
      {/* Heel */}
      <mesh castShadow position={[0, 0.01, -0.12]} scale={[0.9, 0.5, 0.7]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color={FLESH_SHADOW} roughness={0.75} />
      </mesh>
      {/* Toes */}
      {[-0.08, -0.04, 0, 0.04, 0.08].map((x, i) => (
        <mesh
          key={i}
          castShadow
          position={[x * side * 0.15 + x, 0.01, 0.28 - Math.abs(x) * 0.15]}
          scale={[0.7, 0.55, 0.9]}
        >
          <sphereGeometry args={[0.045 - Math.abs(i - 2) * 0.004, 8, 8]} />
          <meshStandardMaterial color={FLESH} roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function BatMesh() {
  return (
    <group>
      {/* Handle */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.55, 10]} />
        <meshStandardMaterial color="#6b4f35" roughness={0.45} />
      </mesh>
      {/* Knob */}
      <mesh castShadow position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#5a412c" roughness={0.5} />
      </mesh>
      {/* Barrel */}
      <mesh castShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.09, 0.055, 0.85, 14]} />
        <meshStandardMaterial
          color="#a67c52"
          roughness={0.32}
          metalness={0.08}
        />
      </mesh>
      {/* Barrel tip */}
      <mesh castShadow position={[0, -0.68, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#9a724c" roughness={0.3} />
      </mesh>
    </group>
  );
}
