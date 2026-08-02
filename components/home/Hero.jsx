'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { BRAND, PITCH } from '@/lib/content/site';
import { formatPKR } from '@/lib/utils';
import HeroVideo from './HeroVideo';

/**
 * The opening frame.
 *
 * Answers "what is this shop?" before anything else: a plain headline, the
 * concrete facts (price from, longevity, delivery), and obvious buttons.
 *
 * The house film now carries the background. The real-time flacon used to sit
 * in a second column here — two competing focal points, and a WebGL context on
 * the highest-traffic page. With the film doing that job the canvas is gone
 * from the homepage entirely; it still runs on /about and the product gallery.
 */
export default function Hero({ productCount = 0 }) {
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
      className="relative flex min-h-[92svh] items-center overflow-hidden pt-28 md:min-h-[88svh] md:pt-32"
      aria-label={`${BRAND.legal} — premium perfumes`}
    >
      <HeroVideo className="absolute inset-0" />

      <div className="shell-wide relative w-full pb-16 md:pb-24">
        <div className="max-w-[42rem]">
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
      </div>
    </section>
  );
}
