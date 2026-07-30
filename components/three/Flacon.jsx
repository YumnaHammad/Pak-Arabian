'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import {
  buildFlaconGeometry,
  buildLiquidGeometry,
  buildCollarGeometry,
  buildStopperGeometry,
  buildLabelTexture,
  juiceFor,
} from './atelier';

/**
 * The house flacon.
 *
 * Five parts: lathed glass, the juice inside it, a machined collar, a weighted
 * stopper, and a curved label that hugs the glass. Rotation is a blend of a
 * constant slow turn, the pointer, and scroll progress — so the object is never
 * static but never feels like it is spinning at you either.
 */
export default function Flacon({
  category = 'signature',
  label = 'AZWAH',
  subtitle = 'EAU DE PARFUM',
  quality = 'high',
  pointer,          // ref: { current: { x, y } } in -1..1
  progress,         // ref: { current: 0..1 } scroll progress
  scrollRotations = 1.15,
  scrollLift = 0,
  autoSpin = 0.16,
  ...props
}) {
  const group = useRef();
  const stopper = useRef();

  const glassGeo = useMemo(() => buildFlaconGeometry(quality === 'high' ? 128 : 64), [quality]);
  const liquidGeo = useMemo(() => buildLiquidGeometry(1.24, 0.955, quality === 'high' ? 96 : 48), [quality]);
  const collarGeo = useMemo(() => buildCollarGeometry(quality === 'high' ? 96 : 48), [quality]);
  const stopperGeo = useMemo(() => buildStopperGeometry(quality === 'high' ? 96 : 48), [quality]);
  const labelTex = useMemo(() => buildLabelTexture(label, subtitle), [label, subtitle]);
  const juice = useMemo(() => new THREE.Color(juiceFor(category)), [category]);

  // Smoothed targets so pointer jitter never reaches the mesh directly.
  const target = useRef({ ry: 0, rx: 0, y: 0 });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    const p = progress?.current ?? 0;
    const px = pointer?.current?.x ?? 0;
    const py = pointer?.current?.y ?? 0;

    // Frame-rate independent damping — identical feel at 60 and 144 Hz.
    const k = 1 - Math.pow(0.0015, delta);

    target.current.ry = t * autoSpin + p * Math.PI * 2 * scrollRotations + px * 0.42;
    target.current.rx = -py * 0.16 + Math.sin(t * 0.4) * 0.03;
    target.current.y = Math.sin(t * 0.6) * 0.045 - p * scrollLift;

    g.rotation.y += (target.current.ry - g.rotation.y) * k;
    g.rotation.x += (target.current.rx - g.rotation.x) * k;
    g.position.y += (target.current.y - g.position.y) * k;

    // The stopper lifts and turns slightly as the section scrolls past.
    if (stopper.current) {
      const lift = Math.max(0, p - 0.42) * 0.9;
      stopper.current.position.y += (2.212 + lift * 0.55 - stopper.current.position.y) * k;
      stopper.current.rotation.y += delta * (0.3 + lift * 2.4);
    }
  });

  const highGlass = quality === 'high';

  return (
    <group ref={group} {...props}>
      {/* ── Glass ── */}
      <mesh geometry={glassGeo} castShadow receiveShadow>
        {highGlass ? (
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            transmission={1}
            thickness={0.62}
            roughness={0.045}
            ior={1.52}
            chromaticAberration={0.045}
            anisotropy={0.22}
            distortion={0.12}
            distortionScale={0.28}
            temporalDistortion={0.06}
            clearcoat={1}
            clearcoatRoughness={0.04}
            attenuationDistance={1.4}
            attenuationColor="#f4ead6"
            color="#ffffff"
            background={null}
          />
        ) : (
          <meshPhysicalMaterial
            transmission={0.94}
            thickness={0.5}
            roughness={0.08}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0.06}
            color="#eef0f2"
            transparent
            opacity={0.86}
          />
        )}
      </mesh>

      {/* ── Juice ── */}
      <mesh geometry={liquidGeo}>
        <meshPhysicalMaterial
          color={juice}
          roughness={0.12}
          metalness={0}
          transmission={0.72}
          thickness={1.5}
          ior={1.38}
          attenuationColor={juice}
          attenuationDistance={0.65}
          clearcoat={0.7}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* ── Curved label, sitting just proud of the glass ── */}
      {labelTex && (
        <mesh position={[0, 0.66, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry
            args={[0.652, 0.652, 0.66, 48, 1, true, -Math.PI / 3.1, (Math.PI * 2) / 3.1]}
          />
          <meshStandardMaterial
            map={labelTex}
            transparent
            opacity={0.92}
            roughness={0.62}
            metalness={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ── Machined collar ── */}
      <mesh geometry={collarGeo} position={[0, 1.94, 0]} castShadow>
        <meshStandardMaterial color="#C9A227" metalness={1} roughness={0.22} envMapIntensity={1.5} />
      </mesh>

      {/* ── Stopper ── */}
      <mesh ref={stopper} geometry={stopperGeo} position={[0, 2.212, 0]} castShadow>
        <meshStandardMaterial color="#D8B860" metalness={1} roughness={0.16} envMapIntensity={1.8} />
      </mesh>

      {/* ── Contact shadow proxy: a dark disc that grounds the object ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <circleGeometry args={[1.05, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
      </mesh>
    </group>
  );
}
