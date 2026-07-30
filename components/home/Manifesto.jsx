'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Marquee from '@/components/ui/Marquee';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE, VIEWPORT } from '@/lib/motion';

const WORDS = ['Oud', 'Orris', 'Labdanum', 'Vetiver', 'Saffron', 'Bergamot', 'Sandalwood', 'Rose'];

/**
 * The breath between the hero and the story.
 *
 * A travelling band of raw-material names, then a single statement whose words
 * light up individually as the section crosses the viewport — the sentence is
 * read at the pace of the scroll rather than all at once.
 */
export default function Manifesto() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  });

  const statement =
    'A fragrance should not announce you at the door. It should be the reason someone turns around after you have already passed.';
  const words = statement.split(' ');

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-hairline/40 py-24 md:py-36">
      {/* ── Travelling materials band ── */}
      <Marquee
        baseVelocity={-1.6}
        className="fade-edge-x border-b border-hairline/40 pb-10"
        itemClassName="flex items-center"
      >
        {WORDS.map((w) => (
          <span key={w} className="flex items-center">
            <span className="px-8 font-display text-5xl font-light text-ink-4 md:text-7xl">
              {w}
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
          </span>
        ))}
      </Marquee>

      {/* ── Scroll-lit statement ── */}
      <div className="shell mt-20 md:mt-28">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8 }}
          className="eyebrow mb-10"
        >
          The house position
        </motion.p>

        <p
          className="max-w-5xl font-display text-3xl font-light leading-[1.28] md:text-5xl md:leading-[1.22]"
          aria-label={statement}
        >
          {words.map((word, i) => (
            <Word
              key={i}
              word={word}
              index={i}
              total={words.length}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.9, ease: EASE.luxe, delay: 0.2 }}
          className="mt-10 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-4"
        >
          — Abdul Rafey, Founder
        </motion.p>
      </div>
    </section>
  );
}

function Word({ word, index, total, progress, reduced }) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);

  if (reduced) return <span aria-hidden>{word} </span>;

  return (
    <motion.span aria-hidden style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}
