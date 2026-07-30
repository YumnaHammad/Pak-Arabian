'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useVelocity, useSpring, useMotionValue, useAnimationFrame } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/**
 * Continuously travelling text that also reacts to scroll velocity — it speeds
 * up and reverses with the direction of the scroll, then settles back to its
 * base drift. Two copies of the content are rendered so the loop is seamless.
 */
export default function Marquee({
  children,
  baseVelocity = -2.2,
  className = '',
  itemClassName = '',
  repeat = 4,
}) {
  const reduced = usePrefersReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 380 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], { clamp: false });
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);

    const v = velocityFactor.get();
    if (v < 0) direction.current = -1;
    else if (v > 0) direction.current = 1;

    moveBy += direction.current * moveBy * v;
    baseX.set(wrap(-50, 0, baseX.get() + moveBy));
  });

  const x = useTransform(baseX, (v) => `${v}%`);
  const copies = Array.from({ length: repeat });

  if (reduced) {
    return (
      <div className={cn('overflow-hidden whitespace-nowrap', className)}>
        <span className={itemClassName}>{children}</span>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden whitespace-nowrap', className)} aria-hidden>
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {copies.map((_, i) => (
          <span key={i} className={cn('shrink-0', itemClassName)}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/** Wraps a value into the [min, max) range — keeps the loop seamless. */
function wrap(min, max, value) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}
