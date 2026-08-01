'use client';
import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import Flacon from './Flacon';
import { Motes, Vapour, Rig } from './Atmosphere';
import { useThemeBaseColor } from '@/lib/hooks';

/**
 * The WebGL stage.
 *
 * Rendering is gated on visibility — `frameloop` drops to "never" the moment
 * the canvas leaves the viewport, which is what keeps a 3D homepage from
 * costing battery for the whole scroll. Quality steps down automatically on
 * coarse pointers and low core counts.
 */
export default function FlaconScene({
  category = 'signature',
  label = 'PAK ARABIAN',
  subtitle = 'EAU DE PARFUM',
  pointer,
  progress,
  quality = 'high',
  showVapour = true,
  showMotes = true,
  cameraZ = 6.2,
  scrollRotations = 1.15,
  className = '',
  onReady,
}) {
  const wrapper = useRef(null);
  const [visible, setVisible] = useState(true);
  // Fog has to match the page behind the canvas, or the flacon's far edges
  // pick up a haze the surrounding background does not have.
  const fogColor = useThemeBaseColor();

  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '160px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const high = quality === 'high';

  return (
    <div ref={wrapper} className={className}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={high ? [1, 1.5] : [1, 1]}
        shadows={high}
        gl={{
          antialias: high,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        camera={{ position: [0, 1.05, cameraZ], fov: 34, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05;
          onReady?.();
        }}
      >
        <Suspense fallback={null}>
          {/* Depth falloff — replaces an expensive DOF pass */}
          <fog attach="fog" args={[fogColor, 8, 19]} />

          <Rig intensity={high ? 1 : 0.9} />

          {/*
            Environment built from emissive planes rather than a fetched HDR.
            These are what the glass and gold actually reflect — the long thin
            formers read as softbox strips in the highlights.
          */}
          <Environment resolution={high ? 256 : 128} frames={1}>
            <Lightformer
              form="rect"
              intensity={5}
              color="#FFF6E4"
              position={[0, 5, -6]}
              scale={[12, 6, 1]}
            />
            <Lightformer
              form="rect"
              intensity={3}
              color="#C9A227"
              position={[-6, 2, 2]}
              rotation={[0, Math.PI / 2, 0]}
              scale={[10, 4, 1]}
            />
            <Lightformer
              form="rect"
              intensity={2.2}
              color="#7FA0C0"
              position={[6, 1.5, 1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[10, 3, 1]}
            />
            <Lightformer
              form="circle"
              intensity={4}
              color="#FFFFFF"
              position={[0, 6, 2]}
              scale={[4, 4, 1]}
            />
            <Lightformer
              form="ring"
              intensity={2}
              color="#E9DCB4"
              position={[0, 0, -5]}
              scale={[8, 8, 1]}
            />
          </Environment>

          <group position={[0, -1.05, 0]}>
            <Flacon
              category={category}
              label={label}
              subtitle={subtitle}
              quality={quality}
              pointer={pointer}
              progress={progress}
              scrollRotations={scrollRotations}
            />

            {high && (
              <ContactShadows
                position={[0, 0.001, 0]}
                opacity={0.62}
                scale={7}
                blur={2.6}
                far={3.2}
                resolution={256}
                frames={40}
                color="#000000"
              />
            )}
          </group>

          {showVapour && <Vapour count={high ? 4 : 2} opacity={high ? 0.5 : 0.34} />}
          {showMotes && <Motes count={high ? 120 : 60} />}

          <AdaptiveDpr pixelated={false} />
          <AdaptiveEvents />
        </Suspense>
      </Canvas>
    </div>
  );
}
