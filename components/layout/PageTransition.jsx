'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Route choreography.
 *
 * App Router unmounts the old tree before Framer can play an exit, so rather
 * than fighting that we run a veil that sweeps across on every path change and
 * lift the incoming page underneath it. The effect reads as one continuous
 * move, and it never blocks interaction for longer than the sweep.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const [sweeping, setSweeping] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    setSweeping(true);
    const t = setTimeout(() => setSweeping(false), 620);
    return () => clearTimeout(t);
  }, [pathname, reduced]);

  if (reduced) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        {sweeping && (
          <motion.div
            key={`veil-${pathname}`}
            className="pointer-events-none fixed inset-0 z-[130] origin-bottom bg-obsidian"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1, originY: 1 }}
            exit={{ scaleY: 0, originY: 0 }}
            transition={{ duration: 0.62, ease: EASE.drape }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gold-leaf" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: EASE.luxe, delay: first.current ? 0 : 0.28 }}
      >
        {children}
      </motion.div>
    </>
  );
}
