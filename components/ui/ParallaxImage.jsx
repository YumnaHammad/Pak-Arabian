'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/**
 * An image that drifts against the scroll inside a fixed frame.
 *
 * The inner layer is oversized by `overscan` so the frame never shows an edge
 * at either end of the travel. `speed` is the fraction of the frame height the
 * image moves across the full scroll pass.
 */
export default function ParallaxImage({
  src,
  alt = '',
  speed = 0.16,
  overscan = 1.28,
  className = '',
  imageClassName = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  fallback = null,
  children,
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const distance = speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`-${distance}%`, `${distance}%`]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0"
        style={
          reduced
            ? undefined
            : { y, height: `${overscan * 100}%`, top: `${((1 - overscan) / 2) * 100}%` }
        }
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={cn('object-cover', imageClassName)}
          />
        ) : (
          fallback
        )}
      </motion.div>
      {children}
    </div>
  );
}
