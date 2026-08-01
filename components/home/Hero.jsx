'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { BRAND, PITCH } from '@/lib/content/site';
import { formatPKR } from '@/lib/utils';
import FlaconStage from '@/components/three/FlaconStage';

/**
 * The opening frame.
 *
 * Rebuilt to answer "what is this shop?" before anything else. The previous
 * hero led with an abstract line of poetry over a rotating bottle — beautiful,
 * but a first-time visitor could not tell what was being sold, for how much, or
 * how to buy it.
 *
 * Now: a plain headline, the concrete facts (price from, longevity, delivery),
 * and obvious buttons. The flacon moves to its own column so the type never
 * competes with it for legibility.
 */
export default function Hero({ featuredCategory = 'signature', productCount = 0 }) {
  const section = useRef(null);
  const reduced = usePrefersReducedMotion();
  const introComplete = useUI((s) => s.introComplete);
  const gate = introComplete || reduced;

  const rise = (delay) => ({
    initial: { opacity: 0, y: 18 },
    animate: gate ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, ease: EASE.luxe, delay },
  });

  return (
    <section
      ref={section}
      className="relative overflow-hidden pt-28 md:pt-36"
      aria-label={`${BRAND.legal} — premium perfumes`}
    >
      <div className="shell-wide grid items-center gap-12 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-24">
        {/* ══════════ Words ══════════ */}
        <div className="order-2 lg:order-1">
          <motion.p {...rise(0.1)} className="eyebrow">
            {BRAND.legal} · Est. {BRAND.founded}
          </motion.p>

          <motion.h1
            {...rise(0.18)}
            className="mt-6 font-display text-[clamp(2.6rem,6.5vw,4.6rem)] font-semibold leading-[1.08]"
          >
            {PITCH.headline}
            <br />
            <span className="text-accent">{PITCH.headlineAccent}</span>
          </motion.h1>

          <motion.p
            {...rise(0.28)}
            className="mt-7 max-w-[46ch] text-[18px] leading-relaxed text-ink-2"
          >
            {PITCH.sub}
          </motion.p>

          {/* Hard facts, not atmosphere */}
          <motion.ul {...rise(0.36)} className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            {[
              `From ${formatPKR(PITCH.priceFrom)}`,
              '8–12 hours on skin',
              'Delivered in 2–4 days',
            ].map((fact) => (
              <li key={fact} className="flex items-center gap-2.5 text-[15px] text-ink-2">
                <span aria-hidden className="text-accent">
                  ✓
                </span>
                {fact}
              </li>
            ))}
          </motion.ul>

          {/* Actions */}
          <motion.div {...rise(0.46)} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/collection"
              className="flex min-h-[3.5rem] items-center justify-center bg-[var(--accent)] px-9 text-[15px] font-semibold uppercase tracking-[0.05em] text-obsidian transition-opacity hover:opacity-90"
            >
              Shop all fragrances
            </Link>
            <Link
              href="/collection?category=men"
              className="flex min-h-[3.5rem] items-center justify-center border border-hairline px-7 text-[15px] font-semibold uppercase tracking-[0.05em] transition-colors hover:border-accent hover:text-accent"
            >
              For Him
            </Link>
            <Link
              href="/collection?category=women"
              className="flex min-h-[3.5rem] items-center justify-center border border-hairline px-7 text-[15px] font-semibold uppercase tracking-[0.05em] transition-colors hover:border-accent hover:text-accent"
            >
              For Her
            </Link>
          </motion.div>

          <motion.p {...rise(0.56)} className="mt-6 text-[15px] text-ink-3">
            {productCount > 0 ? `${productCount} fragrances available` : 'Browse the collection'} ·
            No account needed · Pay on delivery
          </motion.p>
        </div>

        {/* ══════════ Object ══════════ */}
        <div className="relative order-1 h-[42vh] min-h-[300px] lg:order-2 lg:h-[68vh]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(58% 58% at 50% 48%, rgba(212,175,55,0.14), transparent 72%)',
            }}
          />
          <FlaconStage
            category={featuredCategory}
            label={BRAND.name.toUpperCase()}
            subtitle="EAU DE PARFUM"
            className="absolute inset-0"
            trackScrollOf={section}
            cameraZ={6}
            scrollRotations={0.5}
            showMotes
            showVapour={false}
          />
        </div>
      </div>
    </section>
  );
}
