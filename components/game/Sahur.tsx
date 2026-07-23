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
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const g = ctx.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, "#b88962");
  g.addColorStop(0.22, "#d2b08a");
  g.addColorStop(0.48, "#e0c49c");
  g.addColorStop(0.72, "#c9a078");
  g.addColorStop(1, "#a87852");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 512);

  for (let i = 0; i < 36; i++) {
    const x = Math.random() * 128;
    ctx.strokeStyle = `rgba(80, 55, 35, ${0.06 + Math.random() * 0.14})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 8,
      170,
      x + (Math.random() - 0.5) * 10,
      340,
      x + (Math.random() - 0.5) * 6,
      512,
    );
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const y = 40 + Math.random() * 430;
    ctx.strokeStyle = `rgba(110, 80, 50, ${0.08 + Math.random() * 0.1})`;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.ellipse(64, y, 18 + Math.random() * 22, 3 + Math.random() * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

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
      // Feet rest on the floor (oversized soles)
      root.current.position.set(a.x, 0.55, a.z);
      root.current.rotation.y = a.yaw;
      const punch = a.hitFlash > 0 ? 1 + a.hitFlash * 0.07 : 1;
      root.current.scale.setScalar(punch);
    }

    const bob =
      Math.sin(phase.current * (moving ? 1 : 0.4)) *
      (moving ? 0.07 : 0.04) *
      motion;
    const lean = moving ? a.moveAmount * 0.1 * motion : 0;

    if (body.current) {
      body.current.position.y = bob;
      body.current.rotation.x = lean;
      body.current.rotation.z =
        Math.sin(phase.current * 0.5) * 0.025 * motion * (moving ? 1 : 0.35);
    }

    const swing = Math.sin(phase.current) * (moving ? 0.5 : 0.05) * motion;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.65;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.5 - 0.2;
    if (bat.current) {
      bat.current.rotation.z =
        -0.25 + Math.sin(phase.current * 0.8) * 0.07 * motion;
      bat.current.rotation.x = 0.2 + swing * 0.12;
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
    <group ref={root} scale={1.15}>
      <group ref={body}>
        {/* Tall continuous kentongan body */}
        <mesh ref={bodyMesh} castShadow receiveShadow position={[0, 2.15, 0]}>
          <cylinderGeometry args={[0.62, 0.66, 3.55, 48]} />
          <meshStandardMaterial
            map={bodyMat}
            color="#d8b892"
            roughness={0.32}
            metalness={0.08}
            envMapIntensity={0.7}
          />
        </mesh>

        {/* Domed top rim — slightly hollowed percussion look */}
        <mesh castShadow position={[0, 3.95, 0]}>
          <sphereGeometry args={[0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            map={bodyMat}
            color={WOOD}
            roughness={0.28}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 3.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52, 0.045, 12, 48]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh position={[0, 3.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 32]} />
          <meshStandardMaterial color={WOOD_DEEP} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>

        {/* Soft belly taper / mid band */}
        <mesh castShadow position={[0, 1.35, 0]}>
          <torusGeometry args={[0.64, 0.04, 10, 40]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.45} metalness={0.05} />
        </mesh>

        <Face />

        {/* Left arm — empty spindly stick */}
        <group ref={leftArm} position={[-0.68, 2.55, 0.05]}>
          <mesh castShadow rotation={[0.15, 0, 0.42]} position={[-0.08, -0.55, 0]}>
            <cylinderGeometry args={[0.038, 0.048, 1.35, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.42} metalness={0.06} />
          </mesh>
          <mesh castShadow position={[-0.38, -1.2, 0.08]}>
            <sphereGeometry args={[0.095, 12, 12]} />
            <meshStandardMaterial color={FLESH} roughness={0.62} />
          </mesh>
        </group>

        {/* Right arm — holds the bat */}
        <group ref={rightArm} position={[0.68, 2.55, 0.05]}>
          <mesh castShadow rotation={[0.2, 0, -0.38]} position={[0.08, -0.55, 0]}>
            <cylinderGeometry args={[0.038, 0.048, 1.35, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.42} metalness={0.06} />
          </mesh>
          <mesh castShadow position={[0.36, -1.2, 0.1]}>
            <sphereGeometry args={[0.095, 12, 12]} />
            <meshStandardMaterial color={FLESH} roughness={0.62} />
          </mesh>
          <group
            ref={bat}
            position={[0.42, -1.35, 0.18]}
            rotation={[0.35, -0.15, 0.55]}
          >
            <BatMesh />
          </group>
        </group>

        <group ref={leftLeg} position={[-0.22, 0.38, 0]}>
          <mesh castShadow position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.042, 0.05, 1.05, 8]} />
            <meshStandardMaterial color={WOOD_DEEP} roughness={0.48} />
          </mesh>
          <Foot side={-1} />
        </group>
        <group ref={rightLeg} position={[0.22, 0.38, 0]}>
          <mesh castShadow position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.042, 0.05, 1.05, 8]} />
            <meshStandardMaterial color={WOOD_DEEP} roughness={0.48} />
          </mesh>
          <Foot side={1} />
        </group>
      </group>
    </group>
  );
}

function Face() {
  return (
    <group position={[0, 2.95, 0.52]}>
      {/* Facial plane carved into the cylinder */}
      <mesh castShadow position={[0, -0.08, 0.02]}>
        <sphereGeometry
          args={[0.42, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]}
        />
        <meshStandardMaterial color="#d4b090" roughness={0.38} metalness={0.04} />
      </mesh>

      {/* Brow ridge */}
      <mesh position={[0, 0.2, 0.22]} scale={[1.15, 0.35, 0.55]}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.45} />
      </mesh>

      <Eye position={[-0.155, 0.08, 0.28]} />
      <Eye position={[0.155, 0.08, 0.28]} />

      {/* Human nose */}
      <group position={[0, -0.02, 0.34]} rotation={[0.25, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.055, 0.14, 4, 10]} />
          <meshStandardMaterial color={NOSE} roughness={0.42} />
        </mesh>
        <mesh position={[-0.035, -0.1, 0.02]} scale={[0.7, 0.55, 0.6]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={FLESH_SHADOW} roughness={0.5} />
        </mesh>
        <mesh position={[0.035, -0.1, 0.02]} scale={[0.7, 0.55, 0.6]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={FLESH_SHADOW} roughness={0.5} />
        </mesh>
      </group>

      {/* Closed smirk */}
      <mesh
        position={[0.04, -0.22, 0.3]}
        rotation={[1.25, 0, -0.42]}
        scale={[1.15, 0.65, 1]}
      >
        <torusGeometry args={[0.1, 0.016, 8, 20, Math.PI * 0.9]} />
        <meshStandardMaterial color={LIP} roughness={0.55} />
      </mesh>

      {/* Cheek */}
      <mesh position={[0.22, -0.12, 0.22]} scale={[0.9, 0.75, 0.7]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#c9a078" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Eye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Bulging sclera */}
      <mesh castShadow scale={[1.05, 1.15, 1.05]}>
        <sphereGeometry args={[0.135, 20, 20]} />
        <meshStandardMaterial
          color={EYE_WHITE}
          roughness={0.12}
          metalness={0.04}
        />
      </mesh>
      {/* Iris / pupil */}
      <mesh position={[0.015, -0.015, 0.11]}>
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshStandardMaterial color={PUPIL} roughness={0.35} />
      </mesh>
      {/* Specular catchlight */}
      <mesh position={[-0.04, 0.045, 0.125]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.04, 0.02, 0.13]} scale={0.55}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Foot({ side }: { side: number }) {
  return (
    <group position={[0, -0.92, 0.12]} rotation={[0.1, side * 0.15, 0]}>
      {/* Big sole */}
      <mesh castShadow position={[0, 0, 0.12]} scale={[1.15, 0.42, 1.75]}>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshStandardMaterial color={FLESH} roughness={0.68} />
      </mesh>
      {/* Heel */}
      <mesh castShadow position={[0, 0.02, -0.16]} scale={[0.95, 0.55, 0.75]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color={FLESH_SHADOW} roughness={0.72} />
      </mesh>
      {/* Toes */}
      {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
        <mesh
          key={i}
          castShadow
          position={[
            x + side * 0.02,
            0.015,
            0.38 - Math.abs(x) * 0.2,
          ]}
          scale={[0.75, 0.55, 0.95]}
        >
          <sphereGeometry args={[0.055 - Math.abs(i - 2) * 0.005, 8, 8]} />
          <meshStandardMaterial color={FLESH} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function BatMesh() {
  return (
    <group rotation={[0.15, 0, 0]}>
      {/* Handle */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.04, 0.048, 0.7, 12]} />
        <meshStandardMaterial color="#6b4f35" roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#5a412c" roughness={0.52} />
      </mesh>
      {/* Barrel — thick toward tip */}
      <mesh castShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.13, 0.065, 1.15, 16]} />
        <meshStandardMaterial
          color="#b88962"
          roughness={0.3}
          metalness={0.08}
        />
      </mesh>
      <mesh castShadow position={[0, -0.75, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshStandardMaterial color="#a87852" roughness={0.28} />
      </mesh>
    </group>
  );
}
