'use client';
import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { useHasPointer, usePrefersReducedMotion } from '@/lib/hooks';
import { SPRING } from '@/lib/motion';

/**
 * Two-part cursor: a fast gold dot that tracks precisely, and a lagging ring
 * that carries the state (link / view / drag) and an optional label.
 *
 * Only mounts on fine-pointer, motion-tolerant devices. Everywhere else the
 * native cursor is untouched — the class that hides it is never applied.
 */
export default function Cursor() {
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();
  const variant = useUI((s) => s.cursorVariant);
  const label = useUI((s) => s.cursorLabel);
  const active = hasPointer && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, SPRING.cursor);
  const ringY = useSpring(y, SPRING.cursor);

  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add('has-custom-cursor');
    return () => document.documentElement.classList.remove('has-custom-cursor');
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function onMove(e) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [active, x, y]);

  // Reset state on navigation or when the pointer leaves the window entirely.
  useEffect(() => {
    if (!active) return;
    const reset = () => useUI.getState().resetCursor();
    window.addEventListener('blur', reset);
    document.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('blur', reset);
      document.removeEventListener('mouseleave', reset);
    };
  }, [active]);

  if (!active) return null;

  const ringSize =
    variant === 'view' || variant === 'drag' ? 92 : variant === 'link' ? 56 : 34;
  const showDot = variant !== 'view' && variant !== 'drag';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120] hidden md:block">
      {/* Precise dot */}
      <motion.div
        className="fixed left-0 top-0 rounded-full bg-[var(--accent)]"
        style={{ x, y, width: 5, height: 5, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: showDot && variant !== 'hidden' ? 1 : 0, scale: showDot ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      {/* Trailing ring */}
      <motion.div
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-[var(--accent)]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: variant === 'hidden' ? 0 : 1,
          backgroundColor:
            variant === 'view' || variant === 'drag'
              ? 'rgba(201,162,39,0.92)'
              : 'rgba(201,162,39,0)',
          borderColor:
            variant === 'link' ? 'rgba(201,162,39,0.9)' : 'rgba(201,162,39,0.35)',
        }}
        transition={SPRING.firm}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="select-none whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-obsidian"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
