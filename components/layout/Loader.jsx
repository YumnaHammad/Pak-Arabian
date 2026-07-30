'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { BRAND } from '@/lib/content/site';

const SESSION_KEY = 'azwah_intro_seen';

/**
 * The house overture.
 *
 * Plays on the homepage only, once per browser session. Two reasons it is not
 * global: someone arriving on a product page from search wants the product, not
 * a title sequence — and holding paint for two seconds there would wreck both
 * the experience and the Largest Contentful Paint on the pages that carry the
 * most search traffic. Everywhere else the intro is marked complete immediately
 * so the header still animates in.
 */
export default function Loader() {
  const completeIntro = useUI((s) => s.completeIntro);
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [decided, setDecided] = useState(false);

  /* Decide whether to play at all, before first paint of the sequence. */
  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    const isHome = pathname === '/';

    if (seen || reduced || !isHome) {
      // Landing anywhere else counts as having seen it, so navigating home
      // afterwards does not suddenly interrupt the visit with a title card.
      if (!isHome) sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(false);
      completeIntro();
    }
    setDecided(true);
    // Deliberately runs once — a client-side navigation must never replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Ease the counter toward 100 — decelerating, never linear. */
  useEffect(() => {
    if (!visible || !decided) return;
    let raf;
    const start = performance.now();
    const DURATION = 2100;

    function tick(now) {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        sessionStorage.setItem(SESSION_KEY, '1');
        // Hold on 100 for a beat before the curtains move.
        setTimeout(() => {
          setVisible(false);
          completeIntro();
        }, 420);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, decided, completeIntro]);

  /* Freeze scrolling underneath while the overture plays. */
  useEffect(() => {
    if (!decided) return;
    if (visible) {
      document.body.style.overflow = 'hidden';
      window.__lenis?.stop();
    } else {
      document.body.style.overflow = '';
      window.__lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible, decided]);

  if (!decided) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="overture"
          className="fixed inset-0 z-[150] flex items-center justify-center"
          exit={{ transition: { staggerChildren: 0.07 } }}
          role="status"
          aria-live="polite"
          aria-label="Loading Azwah Enterprises"
        >
          {/* Four curtain panels — they lift in sequence on exit */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-full flex-1 bg-obsidian"
                initial={{ y: 0 }}
                exit={{
                  y: '-100%',
                  transition: { duration: 1.05, ease: EASE.luxe, delay: i * 0.075 },
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative z-10 flex w-full max-w-md flex-col items-center px-8"
            exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE.luxe } }}
          >
            {/* Wordmark */}
            <div className="mask-line">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.1, ease: EASE.luxe, delay: 0.15 }}
                className="font-display text-6xl font-light tracking-tight text-cream md:text-7xl"
              >
                {BRAND.name}
                <span className="foil align-super text-2xl">{BRAND.mark}</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.6 }}
              className="mt-4 font-mono text-[9px] uppercase tracking-[0.42em] text-cream/40"
            >
              Est. {BRAND.founded} — {BRAND.city}
            </motion.p>

            {/* Drawing hairline */}
            <div className="relative mt-12 h-px w-full overflow-hidden bg-cream/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gold-leaf"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <div className="mt-4 flex w-full items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-cream/35">
              <span>Composing</span>
              <span className="tabular-nums text-gold">
                {String(progress).padStart(3, '0')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
