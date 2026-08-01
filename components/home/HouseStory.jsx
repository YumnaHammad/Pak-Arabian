'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HOUSE_STORY, BRAND } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import SplitText from '@/components/ui/SplitText';
import ParallaxImage from '@/components/ui/ParallaxImage';
import { Eyebrow, Counter } from '@/components/ui/Primitives';
import BottleGlyph from '@/components/ui/BottleGlyph';
import Cursorable from '@/components/ui/Cursorable';

const FIGURES = [
  { value: 8, suffix: ' wks', label: 'Minimum maceration' },
  { value: 19, suffix: '', label: 'Materials per formula' },
  { value: 6, suffix: '/yr', label: 'Releases, at most' },
];

/**
 * Editorial spread.
 *
 * A magazine grid: an asymmetric image column pinned against a three-column
 * text block, with a pull quote breaking the measure. The image sits in a
 * parallax frame so the spread has depth as it passes.
 */
export default function HouseStory({ image }) {
  return (
    <section id="house" className="section relative" aria-labelledby="house-heading">
      <div className="shell-wide grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-10">
        {/* ── Image column ── */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.2, ease: EASE.luxe }}
          >
            <ParallaxImage
              src={image}
              alt="Inside the Pak Arabian atelier"
              speed={0.12}
              className="aspect-[4/5] w-full bg-elevated"
              sizes="(max-width: 1024px) 100vw, 40vw"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-elevated to-veil">
                  <BottleGlyph className="h-1/2 w-auto text-ink-4" />
                </div>
              }
            />
            <div className="mt-5 flex items-baseline justify-between">
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
                The bench — New Town, {BRAND.city}
              </p>
              <p className="font-mono text-[12px] tabular-nums text-ink-4">01</p>
            </div>
          </motion.div>
        </div>

        {/* ── Text column ── */}
        <div className="lg:col-span-6 lg:col-start-7">
          <Eyebrow numeral="I">{HOUSE_STORY.eyebrow}</Eyebrow>

          <SplitText
            as="h2"
            id="house-heading"
            lines={['A perfumery', 'built on patience.']}
            className="mt-8 font-display text-display-sm font-normal"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 1, ease: EASE.luxe, delay: 0.15 }}
            className="mt-10 max-w-prose text-lg leading-relaxed text-ink-2"
          >
            {HOUSE_STORY.lede}
          </motion.p>

          {/* Three-column detail */}
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {HOUSE_STORY.columns.map((col, i) => (
              <motion.div
                key={col.heading}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.9, ease: EASE.luxe, delay: 0.1 * i }}
              >
                <p className="mb-4 h-px w-8 bg-[var(--accent)]" />
                <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink">
                  {col.heading}
                </h3>
                <p className="mt-4 text-[16px] leading-relaxed text-ink-3">{col.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Pull quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.1, ease: EASE.luxe }}
            className="my-16 border-l border-[var(--accent)] pl-8"
          >
            <p className="font-display text-2xl font-normal italic leading-snug md:text-3xl">
              “{HOUSE_STORY.pull}”
            </p>
            <footer className="mt-5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4">
              {HOUSE_STORY.attribution}
            </footer>
          </motion.blockquote>

          {/* Figures */}
          <div className="grid grid-cols-3 gap-6 border-y border-hairline/50 py-10">
            {FIGURES.map((fig) => (
              <div key={fig.label}>
                <p className="font-display text-4xl font-normal text-accent md:text-5xl">
                  <Counter to={fig.value} suffix={fig.suffix} />
                </p>
                <p className="mt-3 font-mono text-[12px] uppercase leading-relaxed tracking-[0.07em] text-ink-4">
                  {fig.label}
                </p>
              </div>
            ))}
          </div>

          <Cursorable variant="link">
            <Link href="/about" className="link-draw mt-12 inline-block font-mono text-[13px] uppercase tracking-[0.08em] text-accent">
              Read the full history →
            </Link>
          </Cursorable>
        </div>
      </div>
    </section>
  );
}
