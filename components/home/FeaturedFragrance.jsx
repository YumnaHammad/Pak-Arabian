'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { formatPKR } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/hooks';
import FlaconStage from '@/components/three/FlaconStage';
import { Eyebrow } from '@/components/ui/Primitives';
import MagneticButton from '@/components/ui/MagneticButton';
import BottleGlyph from '@/components/ui/BottleGlyph';

/**
 * The feature.
 *
 * A tall scroll track with a pinned stage: the flacon holds still in the
 * viewport and turns with the scroll while the copy beside it advances through
 * three chapters — the composition, its pyramid, and the object itself.
 *
 * Falls back to a single static panel under reduced-motion, where pinning and
 * chapter-switching would be disorienting rather than cinematic.
 */
export default function FeaturedFragrance({ product }) {
  const track = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [chapter, setChapter] = useState(0);

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = p < 0.36 ? 0 : p < 0.7 ? 1 : 2;
    setChapter((current) => (current === next ? current : next));
  });

  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-4%']);

  if (!product) return null;

  const notes = product.notes || {};
  const chapters = [
    {
      eyebrow: 'The composition',
      title: product.name,
      body:
        product.description ||
        'A composition built on directly-sourced materials and a full eight-week maceration.',
    },
    {
      eyebrow: 'The pyramid',
      title: 'How it unfolds',
      body:
        'Top notes clear within ten minutes. The heart holds for the next several hours. What remains on fabric the following morning is the base.',
      pyramid: true,
    },
    {
      eyebrow: 'The object',
      title: 'Hand-filled, wax-sealed',
      body: `${product.volumeMl}ml of ${(product.concentration || 'eau de parfum').toLowerCase()}, filled and crimped one bottle at a time, weighed against a reference sample before the collar goes on.`,
    },
  ];

  const current = chapters[chapter];

  return (
    <section
      ref={track}
      className="relative"
      style={{ height: reduced ? 'auto' : '320vh' }}
      aria-labelledby="feature-heading"
    >
      <div
        className={
          reduced
            ? 'relative overflow-hidden py-24'
            : 'sticky top-0 flex h-screen items-center overflow-hidden'
        }
      >
        {/* Ambient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 28% 50%, rgba(201,162,39,0.09), transparent 70%)',
          }}
        />

        <div className="shell-wide relative grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── Stage ── */}
          <div className="relative order-2 h-[46vh] lg:order-1 lg:h-[76vh]">
            <FlaconStage
              category={product.category}
              label={product.name}
              subtitle={product.concentration}
              className="absolute inset-0"
              trackScrollOf={track}
              cameraZ={5.6}
              scrollRotations={1.6}
              showVapour
              showMotes={false}
            />

            {/* Exploded-view callouts, revealed on the last chapter */}
            <AnimatePresence>
              {chapter === 2 && !reduced && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE.luxe }}
                  className="pointer-events-none absolute inset-0 hidden lg:block"
                >
                  <Callout top="18%" left="62%" label="Weighted stopper" detail="Solid brass, gold-plated" />
                  <Callout top="34%" left="24%" label="Machined collar" detail="Crimped by hand" />
                  <Callout top="62%" left="66%" label="Applied label" detail="Cotton stock, letterpressed" />
                  <Callout top="82%" left="26%" label="Base glass" detail="4mm, hand-polished" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Copy ── */}
          <motion.div
            className="order-1 lg:order-2"
            style={reduced ? undefined : { y: copyY }}
          >
            <Eyebrow numeral="IV">The Feature</Eyebrow>

            <div className="relative mt-8 min-h-[19rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: EASE.luxe }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                    {current.eyebrow}
                  </p>
                  <h2
                    id="feature-heading"
                    className="mt-5 font-display text-4xl font-light leading-[1.06] md:text-6xl"
                  >
                    {current.title}
                  </h2>
                  <p className="mt-7 max-w-prose text-[15px] leading-relaxed text-ink-2">
                    {current.body}
                  </p>

                  {current.pyramid && (
                    <dl className="mt-10 space-y-5">
                      {[
                        { label: 'Top', items: notes.top },
                        { label: 'Heart', items: notes.heart },
                        { label: 'Base', items: notes.base },
                      ].map((row, i) => (
                        <motion.div
                          key={row.label}
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, ease: EASE.luxe, delay: 0.1 * i }}
                          className="flex items-baseline gap-6 border-b border-hairline/40 pb-4"
                        >
                          <dt className="w-14 shrink-0 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
                            {row.label}
                          </dt>
                          <dd className="font-display text-lg font-light text-ink-2">
                            {row.items?.length ? row.items.join(' · ') : '—'}
                          </dd>
                        </motion.div>
                      ))}
                    </dl>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Chapter markers */}
            {!reduced && (
              <div className="mt-8 flex items-center gap-3" aria-hidden>
                {chapters.map((_, i) => (
                  <span
                    key={i}
                    className={`h-px transition-all duration-500 ${
                      i === chapter ? 'w-12 bg-[var(--accent)]' : 'w-6 bg-hairline'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Purchase */}
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
                  {product.concentration} · {product.volumeMl}ml
                </p>
                <p className="mt-2 font-display text-3xl font-light tabular-nums">
                  {formatPKR(product.price)}
                </p>
              </div>
              <MagneticButton href={`/product/${product.slug}`} cursorLabel="Open">
                Explore this piece
              </MagneticButton>
            </div>

            {/* Thumbnail, when photography exists */}
            {product.images?.[0] && (
              <Link
                href={`/product/${product.slug}`}
                className="mt-10 hidden items-center gap-4 lg:flex"
              >
                <div className="relative h-20 w-16 overflow-hidden bg-elevated">
                  <Image src={product.images[0]} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
                  View photography →
                </span>
              </Link>
            )}
            {!product.images?.[0] && (
              <div className="mt-10 hidden items-center gap-4 lg:flex">
                <BottleGlyph className="h-14 w-auto text-ink-4" />
                <span className="max-w-[22ch] font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-ink-4">
                  Photography in production
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Callout({ top, left, label, detail }) {
  return (
    <div className="absolute" style={{ top, left }}>
      <span className="flex items-center gap-3">
        <span className="h-px w-10 bg-[var(--accent)]/60" />
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-[var(--accent)]" />
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[var(--accent)]" />
        </span>
      </span>
      <span className="mt-2 block pl-[52px] font-mono text-[9px] uppercase tracking-[0.2em] text-cream/80">
        {label}
      </span>
      <span className="block pl-[52px] font-mono text-[8px] uppercase tracking-[0.18em] text-cream/40">
        {detail}
      </span>
    </div>
  );
}
