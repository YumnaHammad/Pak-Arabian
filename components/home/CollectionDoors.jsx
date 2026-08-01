'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { COLLECTION_DOORS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { Eyebrow } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';
import Cursorable from '@/components/ui/Cursorable';
import BottleGlyph from '@/components/ui/BottleGlyph';

/**
 * Four doors.
 *
 * Horizontal panels that expand on hover — the active door takes the space and
 * the others compress, so the section is one continuous frame rather than four
 * separate cards. Collapses to a stacked list on narrow screens where the
 * expansion has nowhere to go.
 */
export default function CollectionDoors({ covers = {} }) {
  const [active, setActive] = useState(null);
  const reduced = usePrefersReducedMotion();

  return (
    <section id="collections" className="section" aria-labelledby="doors-heading">
      <div className="shell-wide">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow numeral="VII">The Collections</Eyebrow>
            <SplitText
              as="h2"
              id="doors-heading"
              lines={['Four doors into', 'the same house.']}
              className="mt-8 font-display text-display-sm font-normal"
            />
          </div>
          <p className="max-w-[32ch] text-[17px] leading-relaxed text-ink-2 md:text-right">
            The divisions are a convenience, not a rule. Wear whichever one
            smells like you.
          </p>
        </div>
      </div>

      {/* ── Doors ── */}
      <div className="mt-16 flex flex-col gap-px md:h-[68vh] md:flex-row">
        {COLLECTION_DOORS.map((door, i) => {
          const isActive = active === door.value;
          const isDimmed = active !== null && !isActive;
          const cover = covers[door.value];

          return (
            <motion.div
              key={door.value}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.9, ease: EASE.luxe, delay: i * 0.08 }}
              animate={
                reduced
                  ? {}
                  : { flexGrow: isActive ? 2.4 : isDimmed ? 0.72 : 1 }
              }
              style={{ flexGrow: 1, flexBasis: 0 }}
              onMouseEnter={() => setActive(door.value)}
              onMouseLeave={() => setActive(null)}
              className="group relative min-h-[15rem] overflow-hidden border-y border-hairline/40 md:min-h-0 md:border-y-0"
            >
              <Cursorable variant="view" label="Enter">
                <Link
                  href={`/collection?category=${door.value}`}
                  className="relative block h-full w-full"
                  onFocus={() => setActive(door.value)}
                  onBlur={() => setActive(null)}
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-elevated">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover transition-transform duration-[1.6s] ease-luxe group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BottleGlyph className="h-1/3 w-auto text-ink-4 transition-transform duration-[1.6s] ease-luxe group-hover:scale-110" />
                      </div>
                    )}
                  </div>

                  {/* Colour wash keyed to the collection */}
                  <div
                    aria-hidden
                    className="absolute inset-0 mix-blend-multiply transition-opacity duration-700"
                    style={{
                      background: `linear-gradient(180deg, transparent 20%, ${door.accent} 140%)`,
                      opacity: isActive ? 0.92 : 0.72,
                    }}
                  />
                  <div className="absolute inset-0 bg-obsidian/45 transition-opacity duration-700 group-hover:bg-obsidian/25" />

                  {/* Content */}
                  <div className="relative flex h-full flex-col justify-end p-7 md:p-8">
                    <span className="font-mono text-[13px] tracking-[0.1em] text-cream/45">
                      {door.numeral}
                    </span>

                    <h3 className="mt-4 font-display text-3xl font-normal text-cream md:text-4xl">
                      {door.label}
                    </h3>

                    <AnimatePresence>
                      {(isActive || reduced) && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.5, ease: EASE.luxe }}
                          className="overflow-hidden text-[16px] leading-relaxed text-cream/70"
                        >
                          <span className="mt-3 block">{door.line}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <span className="mt-6 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-cream/60">
                      <span className="h-px w-8 bg-cream/40 transition-all duration-700 group-hover:w-14 group-hover:bg-[var(--accent)]" />
                      Enter
                    </span>
                  </div>
                </Link>
              </Cursorable>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
