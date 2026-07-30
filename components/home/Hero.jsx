'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { BRAND } from '@/lib/content/site';
import FlaconStage from '@/components/three/FlaconStage';
import SplitText from '@/components/ui/SplitText';
import MagneticButton from '@/components/ui/MagneticButton';
import { ScrollCue } from '@/components/ui/Primitives';

/**
 * The opening frame.
 *
 * Type and object occupy the same optical centre rather than sitting in
 * columns — the headline crosses in front of the flacon, which is what makes it
 * read as a composed image instead of a hero with a picture next to it.
 *
 * Everything waits on the loader: `introComplete` gates the entrance so the
 * headline lifts as the curtains clear, not behind them.
 */
export default function Hero({ featuredCategory = 'signature' }) {
  const section = useRef(null);
  const reduced = usePrefersReducedMotion();
  const introComplete = useUI((s) => s.introComplete);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end start'],
  });

  const typeY = useTransform(scrollYProgress, [0, 1], ['0%', '-42%']);
  const typeOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const veilOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.85]);

  const gate = introComplete || reduced;

  return (
    <section
      ref={section}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
      aria-label="Introduction"
    >
      {/* ── WebGL stage ── */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { scale: stageScale }}
      >
        <FlaconStage
          category={featuredCategory}
          label={BRAND.name.toUpperCase()}
          subtitle="EAU DE PARFUM"
          className="absolute inset-0"
          trackScrollOf={section}
          cameraZ={6.4}
          scrollRotations={0.85}
          posterClassName="pt-10"
        />
      </motion.div>

      {/* Radial scrim keeps the headline legible over the brightest part of the render */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 55%, transparent 30%, rgb(var(--c-base) / 0.55) 78%, rgb(var(--c-base)) 100%)',
        }}
      />

      {/* Darkening veil as the section leaves */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-base"
        style={reduced ? undefined : { opacity: veilOpacity }}
      />

      {/* ── Type ── */}
      <motion.div
        className="shell-wide relative z-10 flex flex-col items-center text-center"
        style={reduced ? undefined : { y: typeY, opacity: typeOpacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={gate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE.luxe, delay: 0.2 }}
          className="eyebrow"
        >
          {BRAND.legal} — Est. {BRAND.founded}, {BRAND.city}
        </motion.p>

        {gate && (
          <SplitText
            as="h1"
            animate="mount"
            lines={['Where tradition', 'meets fine scent.']}
            delay={0.32}
            stagger={0.12}
            duration={1.25}
            className="mt-8 font-display text-display-md font-light"
            lineClassName="italic-accent"
          />
        )}

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={gate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE.luxe, delay: 0.85 }}
          className="mt-9 max-w-[46ch] text-[15px] leading-relaxed text-ink-2"
        >
          Premium eaux de parfum composed in small batches, from materials bought
          directly from the growers who raise them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={gate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE.luxe, delay: 1 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
        >
          <MagneticButton href="/collection" cursorLabel="Enter">
            Discover the collection
          </MagneticButton>
          <MagneticButton href="/about" variant="bare" cursorLabel="Story">
            <span className="link-draw font-mono text-[11px] uppercase tracking-[0.24em] text-ink-2">
              Watch the story
            </span>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Baseline furniture ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={gate ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 1.3 }}
        className="shell-wide relative z-10 mt-16 flex items-end justify-between pb-10"
      >
        <p className="hidden max-w-[20ch] font-mono text-[9px] uppercase leading-relaxed tracking-[0.24em] text-ink-4 md:block">
          Composed, macerated
          <br />
          and bottled by hand
        </p>

        <ScrollCue />

        <p className="hidden text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.24em] text-ink-4 md:block">
          Nationwide delivery
          <br />
          from {BRAND.city}
        </p>
      </motion.div>
    </section>
  );
}
