'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CRAFT_CHAPTERS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import { usePrefersReducedMotion, useMediaQuery } from '@/lib/hooks';
import { Eyebrow } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';

/**
 * Six chapters of process.
 *
 * On a wide screen the section pins and the chapters travel horizontally with
 * the scroll — the timeline is literally read left to right. On narrow screens,
 * and whenever reduced-motion is set, it becomes a plain vertical list with the
 * same content and no pinning.
 */
export default function Craft() {
  const track = useRef(null);
  const reduced = usePrefersReducedMotion();
  const isWide = useMediaQuery('(min-width: 1024px)');
  const horizontal = isWide && !reduced;

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ['start start', 'end end'],
  });

  /* Travel = (number of panels - 1) screens' worth of width. */
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-76%']);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="craft"
      ref={track}
      className="relative border-y border-hairline/40"
      style={{ height: horizontal ? '420vh' : 'auto' }}
      aria-labelledby="craft-heading"
    >
      <div
        className={
          horizontal
            ? 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden'
            : 'py-24 md:py-32'
        }
      >
        {/* ── Header ── */}
        <div className="shell-wide shrink-0">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <Eyebrow numeral="V">The Method</Eyebrow>
              <SplitText
                as="h2"
                id="craft-heading"
                lines={['From harvest', 'to hand-filled.']}
                className="mt-8 font-display text-display-sm font-light"
              />
            </div>
            <p className="max-w-[34ch] text-[15px] leading-relaxed text-ink-2 md:text-right">
              Six stages. The slowest of them — maceration — is the one nobody
              can see, and the one that decides everything.
            </p>
          </div>

          {/* Progress rail (horizontal mode only) */}
          {horizontal && (
            <div className="mt-12 h-px w-full bg-hairline/60">
              <motion.div
                className="h-px origin-left bg-gold-leaf"
                style={{ scaleX: progressScale }}
              />
            </div>
          )}
        </div>

        {/* ── Chapters ── */}
        {horizontal ? (
          <div className="mt-14 overflow-hidden">
            <motion.ol style={{ x }} className="flex gap-8 pl-[max(2.5rem,calc((100vw-100rem)/2+2.5rem))]">
              {CRAFT_CHAPTERS.map((chapter, i) => (
                <ChapterPanel key={chapter.numeral} chapter={chapter} index={i} />
              ))}
              {/* Tail card so the last chapter can reach centre */}
              <li className="w-[30vw] shrink-0" aria-hidden />
            </motion.ol>
          </div>
        ) : (
          <ol className="shell-wide mt-14 space-y-px">
            {CRAFT_CHAPTERS.map((chapter, i) => (
              <motion.li
                key={chapter.numeral}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.85, ease: EASE.luxe, delay: i * 0.06 }}
                className="border-t border-hairline/40 py-9"
              >
                <div className="flex items-baseline gap-6">
                  <span className="w-8 shrink-0 font-mono text-[11px] text-accent">
                    {chapter.numeral}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                      <h3 className="font-display text-2xl font-light">{chapter.title}</h3>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                        {chapter.duration}
                      </span>
                    </div>
                    <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-ink-3">
                      {chapter.body}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function ChapterPanel({ chapter, index }) {
  return (
    <li className="group relative w-[26rem] shrink-0">
      <div className="relative h-[26rem] overflow-hidden border border-hairline/50 bg-elevated p-9 transition-colors duration-700 hover:border-[var(--accent)]/40">
        {/* Oversized numeral behind the copy */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[11rem] font-light leading-none text-ink opacity-[0.045]"
        >
          {chapter.numeral}
        </span>

        <div className="relative flex h-full flex-col">
          <span className="font-mono text-[10px] tracking-[0.24em] text-accent">
            {chapter.numeral}
          </span>

          <h3 className="mt-7 font-display text-3xl font-light">{chapter.title}</h3>

          <span className="mt-3 inline-block w-fit border border-hairline px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
            {chapter.duration}
          </span>

          <p className="mt-7 text-[14px] leading-relaxed text-ink-3">{chapter.body}</p>

          <span className="mt-auto h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-700 ease-luxe group-hover:scale-x-100" />
        </div>
      </div>
    </li>
  );
}
