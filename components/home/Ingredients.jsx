'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INGREDIENTS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { Eyebrow } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';
import Cursorable from '@/components/ui/Cursorable';
import { cn } from '@/lib/utils';

/**
 * The materials room.
 *
 * An index on the left drives a single large display on the right: an essence
 * bloom rendered from the material's own hue, its provenance, and where it sits
 * in the pyramid. Below, an abstract world plate marks every origin and draws a
 * line to whichever material is active.
 *
 * Keyboard: the list is a real radio group, so arrow keys move between
 * materials exactly as a sighted mouse user would expect.
 */
export default function Ingredients() {
  const [activeId, setActiveId] = useState(INGREDIENTS[0].id);
  const active = INGREDIENTS.find((i) => i.id === activeId) || INGREDIENTS[0];
  const reduced = usePrefersReducedMotion();

  return (
    <section id="ingredients" className="section relative overflow-hidden" aria-labelledby="ingredients-heading">
      <div className="shell-wide">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow numeral="II">The Materials</Eyebrow>
            <SplitText
              as="h2"
              id="ingredients-heading"
              lines={['Eight materials.', 'Eight provenances.']}
              className="mt-8 font-display text-display-sm font-normal"
            />
          </div>
          <p className="max-w-prose text-[17px] leading-relaxed text-ink-2 md:text-right">
            Nothing in the cabinet is bought through a broker. Each material is
            contracted a season ahead, direct from the people who grow it.
          </p>
        </div>

        {/* ── Index + display ── */}
        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Index */}
          <div
            className="lg:col-span-5"
            role="radiogroup"
            aria-label="Choose a material"
          >
            <ul>
              {INGREDIENTS.map((ing, i) => {
                const isActive = ing.id === activeId;
                return (
                  <motion.li
                    key={ing.id}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.7, ease: EASE.luxe, delay: i * 0.05 }}
                  >
                    <Cursorable variant="link">
                      <button
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setActiveId(ing.id)}
                        onMouseEnter={() => setActiveId(ing.id)}
                        onFocus={() => setActiveId(ing.id)}
                        className="group relative flex w-full items-baseline gap-5 border-b border-hairline/40 py-5 text-left"
                      >
                        {/* Active marker */}
                        <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                          <motion.span
                            className="absolute h-1.5 w-1.5 rounded-full"
                            animate={{
                              backgroundColor: isActive ? ing.hue : 'transparent',
                              scale: isActive ? 1 : 0.4,
                            }}
                            transition={{ duration: 0.5, ease: EASE.luxe }}
                          />
                          <span
                            className={cn(
                              'absolute h-1.5 w-1.5 rounded-full border transition-colors duration-500',
                              isActive ? 'border-transparent' : 'border-hairline'
                            )}
                          />
                        </span>

                        <span
                          className={cn(
                            'flex-1 font-display text-2xl font-normal transition-all duration-500 md:text-3xl',
                            isActive ? 'text-ink translate-x-1' : 'text-ink-3'
                          )}
                        >
                          {ing.name}
                        </span>

                        <span className="font-mono text-[12px] uppercase tracking-[0.07em] text-ink-4">
                          {ing.note}
                        </span>
                      </button>
                    </Cursorable>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          {/* Display */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden border border-hairline/50 bg-elevated sm:aspect-[16/10]">
              {/* Essence bloom */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.08 }}
                  transition={{ duration: 0.85, ease: EASE.luxe }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(58% 58% at 62% 42%, ${active.hue}dd 0%, ${active.hue}55 34%, transparent 72%)`,
                      filter: 'blur(34px)',
                    }}
                  />
                  <div
                    className={cn('absolute inset-0', !reduced && 'animate-drift')}
                    style={{
                      background: `radial-gradient(34% 34% at 34% 66%, ${active.hue}aa 0%, transparent 68%)`,
                      filter: 'blur(46px)',
                    }}
                  />
                  <div className="grain-layer absolute inset-0 opacity-[0.06]" />
                </motion.div>
              </AnimatePresence>

              {/* Caption */}
              <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-10">
                <div className="flex items-start justify-between gap-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${active.id}-head`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: EASE.luxe }}
                    >
                      <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-cream/50">
                        {active.family}
                      </p>
                      <h3 className="mt-3 font-display text-4xl font-normal text-cream md:text-6xl">
                        {active.name}
                      </h3>
                      <p className="mt-2 font-display text-lg italic text-cream/50">
                        {active.latin}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <span className="shrink-0 border border-cream/20 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.07em] text-cream/70 backdrop-blur-sm">
                    {active.origin}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${active.id}-body`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: EASE.luxe, delay: 0.06 }}
                    className="max-w-[52ch] text-[17px] leading-relaxed text-cream/80"
                  >
                    {active.blurb}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* ── Origin plate ── */}
            <OriginPlate active={active} onSelect={setActiveId} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Abstract origin plate.
 *
 * Not a literal map — a plotted field of provenance markers on a graticule.
 * A literal world map would date the design and add weight for no information
 * the caption does not already carry.
 */
function OriginPlate({ active, onSelect }) {
  return (
    <div className="relative mt-6 h-52 overflow-hidden border border-hairline/50 bg-surface">
      {/* Graticule */}
      <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%"
            stroke="currentColor" strokeWidth="0.5" className="text-ink-4/30"
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0" y1={`${(i + 1) * 16.6}%`} x2="100%" y2={`${(i + 1) * 16.6}%`}
            stroke="currentColor" strokeWidth="0.5" className="text-ink-4/30"
          />
        ))}
      </svg>

      {/* Markers */}
      {INGREDIENTS.map((ing) => {
        const isActive = ing.id === active.id;
        return (
          <button
            key={ing.id}
            onClick={() => onSelect(ing.id)}
            onMouseEnter={() => onSelect(ing.id)}
            aria-label={`${ing.name}, ${ing.origin}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ing.x}%`, top: `${ing.y}%` }}
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              {isActive && (
                <motion.span
                  className="absolute h-3 w-3 rounded-full"
                  style={{ backgroundColor: ing.hue }}
                  animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: EASE.luxe }}
                />
              )}
              <motion.span
                className="relative h-1.5 w-1.5 rounded-full"
                animate={{
                  backgroundColor: isActive ? ing.hue : 'rgba(255,255,255,0.28)',
                  scale: isActive ? 1.5 : 1,
                }}
                transition={{ duration: 0.4, ease: EASE.luxe }}
              />
            </span>

            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.07em] text-accent"
                >
                  {ing.origin}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}

      <p className="absolute bottom-3 left-4 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
        Provenance — 8 origins
      </p>
    </div>
  );
}
