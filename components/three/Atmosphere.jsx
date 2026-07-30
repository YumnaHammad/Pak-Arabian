'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildGlowTexture, buildSmokeTexture } from './atelier';

/**
 * Gold motes.
 *
 * A single Points cloud with an additive sprite — one draw call for the whole
 * field. Each mote carries its own rise speed and sway phase in an attribute
 * buffer, so the drift never looks synchronised.
 */
export function Motes({ count = 260, radius = 5.5, height = 8, speed = 1 }) {
  const points = useRef();
  const sprite = useMemo(() => buildGlowTexture(), []);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3); // rise, phase, sway

    for (let i = 0; i < count; i++) {
      // Distribute in a cylinder, biased outward so the centre stays readable.
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.28 + Math.sqrt(Math.random()) * 0.72);
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      seeds[i * 3] = 0.08 + Math.random() * 0.22;
      seeds[i * 3 + 1] = Math.random() * Math.PI * 2;
      seeds[i * 3 + 2] = 0.1 + Math.random() * 0.35;
    }
    return { positions, seeds };
  }, [count, radius, height]);

  useFrame((state, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const pos = geo.attributes.position.array;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05); // guard against tab-restore jumps

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3 + 1] += seeds[i3] * speed * d;
      pos[i3] += Math.sin(t * 0.4 + seeds[i3 + 1]) * seeds[i3 + 2] * d;

      if (pos[i3 + 1] > height / 2) pos[i3 + 1] = -height / 2;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.075}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.75}
        color="#E9D6A0"
      />
    </points>
  );
}

/**
 * Vapour.
 *
 * Camera-facing planes carrying a generated cloud texture, each rotating and
 * rising at its own rate. Cheaper than volumetrics by orders of magnitude and,
 * at this opacity, indistinguishable from it.
 */
export function Vapour({ count = 7, spread = 2.6, opacity = 0.5 }) {
  const group = useRef();
  const texture = useMemo(() => buildSmokeTexture(), []);

  const planes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * spread,
          -0.4 + Math.random() * 2.6,
          -0.8 - Math.random() * 1.6,
        ],
        scale: 2.4 + Math.random() * 2.8,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.06,
        rise: 0.03 + Math.random() * 0.06,
        seed: i * 1.7,
      })),
    [count, spread]
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);

    g.children.forEach((child, i) => {
      const p = planes[i];
      child.rotation.z += p.spin * d;
      child.position.y += p.rise * d;
      child.position.x += Math.sin(t * 0.18 + p.seed) * 0.04 * d;
      // Recycle before the plane leaves the frame.
      if (child.position.y > 3.4) child.position.y = -0.9;
      child.material.opacity =
        opacity * (0.55 + 0.45 * Math.sin(t * 0.35 + p.seed));
    });
  });

  if (!texture) return null;

  return (
    <group ref={group}>
      {planes.map((p, i) => (
        <mesh key={i} position={p.position} rotation={[0, 0, p.rotation]} scale={p.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color="#C6BFA8"
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Studio lighting rig.
 *
 * Built from Lightformer-style emissive planes fed into drei's Environment by
 * the caller, plus these direct lights for the specular highlights that make
 * the metal read as metal. No HDR file is fetched — everything is in-scene.
 */
export function Rig({ intensity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} />
      {/* Key: high and slightly front-left */}
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.6 * intensity}
        color="#FFF4E0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-bias={-0.0004}
      />
      {/* Fill: cool, opposite side, keeps the shadow side from going black */}
      <directionalLight position={[-6, 3, -4]} intensity={0.85 * intensity} color="#9FB4C8" />
      {/* Rim: behind and low, draws the gold edge on the collar */}
      <spotLight
        position={[-2.5, 4.5, -6]}
        angle={0.7}
        penumbra={1}
        intensity={4 * intensity}
        color="#C9A227"
        distance={22}
      />
      {/* Bounce off the imaginary table */}
      <pointLight position={[0, -1.6, 2.2]} intensity={1.1 * intensity} color="#E9D6A0" distance={9} />
    </>
  );
}
