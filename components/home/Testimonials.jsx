'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import { Eyebrow, Rating } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';
import Cursorable from '@/components/ui/Cursorable';

/**
 * Client accounts.
 *
 * A draggable rail rather than an auto-rotating carousel — a visitor reading a
 * long quote should never have it swiped out from under them. Arrow keys and
 * the two controls move it a card at a time; the track is a real scroller so
 * touch and trackpad work natively.
 */
export default function Testimonials() {
  const rail = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function scrollByCard(direction) {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  function onScroll() {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCard(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCard(-1);
    }
  }

  return (
    <section className="section overflow-hidden" aria-labelledby="clients-heading">
      <div className="shell-wide">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow numeral="VIII">Client Accounts</Eyebrow>
            <SplitText
              as="h2"
              id="clients-heading"
              lines={['Worn, and', 'then written about.']}
              className="mt-8 font-display text-display-sm font-normal"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <RailButton onClick={() => scrollByCard(-1)} disabled={atStart} label="Previous">
              ←
            </RailButton>
            <RailButton onClick={() => scrollByCard(1)} disabled={atEnd} label="Next">
              →
            </RailButton>
          </div>
        </div>
      </div>

      {/* ── Rail ── */}
      <div
        ref={rail}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Client accounts, scrollable"
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 md:px-10"
      >
        {TESTIMONIALS.map((item, i) => (
          <motion.figure
            key={item.name}
            data-card
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ ...VIEWPORT, once: true }}
            transition={{ duration: 0.85, ease: EASE.luxe, delay: (i % 3) * 0.08 }}
            className="group relative w-[86vw] shrink-0 snap-start border border-hairline/50 bg-surface p-8 transition-colors duration-700 hover:border-[var(--accent)]/40 sm:w-[26rem] md:p-10"
          >
            {/* Quote mark */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-6 top-2 select-none font-display text-8xl font-normal leading-none text-ink opacity-[0.06]"
            >
              ”
            </span>

            <Rating value={item.rating} />

            <blockquote className="relative mt-7">
              <p className="font-display text-xl font-normal leading-relaxed text-ink-2 md:text-2xl">
                {item.quote}
              </p>
            </blockquote>

            <figcaption className="mt-9 flex items-end justify-between border-t border-hairline/40 pt-6">
              <div>
                <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink">
                  {item.name}
                </p>
                <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.07em] text-ink-4">
                  {item.location}
                </p>
              </div>
              <p className="text-right font-display text-sm italic text-accent">
                {item.product}
              </p>
            </figcaption>
          </motion.figure>
        ))}

        <div className="w-2 shrink-0" aria-hidden />
      </div>
    </section>
  );
}

function RailButton({ children, onClick, disabled, label }) {
  return (
    <Cursorable variant="link">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="flex h-11 w-11 items-center justify-center border border-hairline text-sm text-ink-2 transition-all duration-500 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-25"
      >
        {children}
      </button>
    </Cursorable>
  );
}
