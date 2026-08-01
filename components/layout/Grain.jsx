'use client';
import { usePrefersReducedMotion, useHasPointer } from '@/lib/hooks';

/**
 * Film grain + a soft vignette over the entire site.
 *
 * The noise is an inline SVG turbulence filter — no image request, no bytes on
 * the wire. The `steps(1)` shift animation is what makes it read as film rather
 * than a static texture; it stops entirely under reduced-motion.
 */
export default function Grain() {
  const reduced = usePrefersReducedMotion();
  const hasPointer = useHasPointer();

  /* Animating it repaints a full-viewport layer several times a second. Worth
     it on desktop, pure battery drain on a phone nobody is studying it on. */
  const animate = !reduced && hasPointer;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[110]">
      <div
        className={`grain-layer absolute -inset-[30%] ${animate ? 'animate-grain-shift' : ''}`}
        style={{ opacity: 'var(--grain-opacity)', willChange: animate ? 'transform' : 'auto' }}
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
