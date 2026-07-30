'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePrefersReducedMotion, useHasPointer } from '@/lib/hooks';
import FlaconPoster from './FlaconPoster';

/* The WebGL bundle never reaches the server render and never blocks first paint. */
const FlaconScene = dynamic(() => import('./FlaconScene'), {
  ssr: false,
  loading: () => null,
});

/**
 * Decides whether this device should get real-time 3D at all, and at what
 * fidelity — then feeds the scene live pointer and scroll values.
 *
 * The poster is not a degraded experience; it is a composed SVG flacon that
 * stands on its own. Anyone on reduced-motion, without WebGL, or on a weak
 * device gets that instead, and nothing about the layout shifts.
 */
export default function FlaconStage({
  category = 'signature',
  label = 'AZWAH',
  subtitle = 'EAU DE PARFUM',
  className = '',
  sceneClassName = 'absolute inset-0',
  cameraZ = 6.2,
  scrollRotations = 1.15,
  trackScrollOf,          // optional ref to the section that drives progress
  showVapour = true,
  showMotes = true,
  posterClassName = '',
}) {
  const reduced = usePrefersReducedMotion();
  const hasPointer = useHasPointer();
  const [mode, setMode] = useState('pending'); // 'pending' | 'webgl' | 'poster'
  const [quality, setQuality] = useState('high');

  const pointer = useRef({ x: 0, y: 0 });
  const progress = useRef(0);
  const host = useRef(null);

  /* ── Capability check ── */
  useEffect(() => {
    if (reduced) {
      setMode('poster');
      return;
    }

    let supported = false;
    try {
      const canvas = document.createElement('canvas');
      supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
      );
    } catch {
      supported = false;
    }

    if (!supported) {
      setMode('poster');
      return;
    }

    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 768;

    // Very constrained devices get the poster; mid devices get reduced fidelity.
    if (cores <= 2 || memory <= 2) {
      setMode('poster');
      return;
    }
    setQuality(coarse || narrow || cores <= 4 ? 'low' : 'high');
    setMode('webgl');
  }, [reduced]);

  /* ── Pointer ── */
  useEffect(() => {
    if (mode !== 'webgl' || !hasPointer) return;
    function onMove(e) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mode, hasPointer]);

  /* ── Scroll progress across the driving section ── */
  useEffect(() => {
    if (mode !== 'webgl') return;
    const el = trackScrollOf?.current || host.current;
    if (!el) return;

    let frame;
    function measure() {
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const travelled = window.innerHeight - rect.top;
      progress.current = Math.min(Math.max(travelled / total, 0), 1);
      frame = requestAnimationFrame(measure);
    }
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [mode, trackScrollOf]);

  return (
    <div ref={host} className={className}>
      {mode === 'webgl' ? (
        <FlaconScene
          category={category}
          label={label}
          subtitle={subtitle}
          pointer={pointer}
          progress={progress}
          quality={quality}
          cameraZ={cameraZ}
          scrollRotations={scrollRotations}
          showVapour={showVapour}
          showMotes={showMotes}
          className={sceneClassName}
        />
      ) : mode === 'poster' ? (
        <FlaconPoster category={category} className={posterClassName} />
      ) : null}
    </div>
  );
}
