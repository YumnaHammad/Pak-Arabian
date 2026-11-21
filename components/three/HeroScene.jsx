'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Lightformer,
  Float,
  Sparkles,
  RoundedBox,
} from '@react-three/drei';

/**
 * Hero centrepiece: a glass attar flacon with an onion-dome cap — the same
 * arch that crowns the logo — circled by a gold ring and drifting motes.
 * Lighting is built from Lightformers so no HDR file is fetched.
 */

const GOLD = '#d9b45a';

function Dome() {
  /* Onion dome profile, revolved — echoes the arch in the mark. */
  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = t * 1.25;
      const r = 0.42 * Math.sin(Math.PI * Math.pow(t, 0.72)) * (1 - 0.15 * t) + 0.12 * (1 - t);
      pts.push(new THREE.Vector2(Math.max(r, 0.001), y));
    }
    return new THREE.LatheGeometry(pts, 32);
  }, []);
  return (
    <mesh geometry={geo} position={[0, 1.42, 0]} castShadow>
      <meshStandardMaterial color={GOLD} metalness={1} roughness={0.22} />
    </mesh>
  );
}

function Flacon({ pointer }) {
  const group = useRef();
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const p = pointer.current;
    g.rotation.y += dt * 0.35;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.y * 0.18, 3, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, p.x * 0.25, 3, dt);
  });

  return (
    <group ref={group}>
      {/* Glass body */}
      <RoundedBox args={[1.5, 1.9, 0.8]} radius={0.18} smoothness={3} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#fff8ea"
          metalness={0}
          roughness={0.05}
          transparent
          opacity={0.28}
          clearcoat={1}
          envMapIntensity={1.4}
        />
      </RoundedBox>
      {/* Liquid */}
      <RoundedBox args={[1.24, 1.3, 0.56]} radius={0.12} smoothness={4} position={[0, -0.22, 0]}>
        <meshStandardMaterial
          color="#c98b2b"
          roughness={0.2}
          emissive="#5a3208"
          emissiveIntensity={0.25}
        />
      </RoundedBox>
      {/* Collar */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.32, 48]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.05, 16, 64]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.18} />
      </mesh>
      <Dome />
      {/* Finial */}
      <mesh position={[0, 2.78, 0]}>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.15} />
      </mesh>
    </group>
  );
}

function Rings() {
  const a = useRef();
  const b = useRef();
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.18;
    if (b.current) b.current.rotation.z -= dt * 0.12;
  });
  return (
    <group position={[0, 0.6, 0]}>
      <mesh ref={a} rotation={[Math.PI / 2.35, 0, 0]}>
        <torusGeometry args={[1.9, 0.012, 16, 160]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
      </mesh>
      <mesh ref={b} rotation={[Math.PI / 1.85, 0.4, 0]}>
        <torusGeometry args={[2.2, 0.006, 16, 160]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ pointer, active = true }) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.9, 8], fov: 34 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.35} />
      <spotLight position={[4, 6, 4]} angle={0.4} penumbra={1} intensity={60} color="#fff1d0" />
      <pointLight position={[-3, 1, 2]} intensity={12} color="#ffd38a" />

      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
        <group position={[0, -0.55, 0]} scale={1.05}>
          <Flacon pointer={pointer} />
        </group>
      </Float>
      <Rings />
      <Sparkles count={30} scale={[6, 5, 4]} size={3} speed={0.35} color="#f0d58c" opacity={0.85} />


      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -6]} scale={[10, 3, 1]} color="#fff4dc" />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#ffe2a8" />
        <Lightformer form="rect" intensity={2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#9fd8d0" />
        <Lightformer form="ring" intensity={4} position={[0, 2, 5]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
