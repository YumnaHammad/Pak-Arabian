'use client';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Film grain + a soft vignette over the entire site.
 *
 * The noise is an inline SVG turbulence filter — no image request, no bytes on
 * the wire. The `steps(1)` shift animation is what makes it read as film rather
 * than a static texture; it stops entirely under reduced-motion.
 */
export default function Grain() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[110]">
      <div
        className={`grain-layer absolute -inset-[60%] ${reduced ? '' : 'animate-grain-shift'}`}
        style={{ opacity: 'var(--grain-opacity)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 42%, rgb(var(--c-base) / 0.42) 100%)',
        }}
      />
    </div>
  );
}
