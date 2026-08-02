'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const INTERVAL = 5500;
const SWIPE_THRESHOLD = 60;

/**
 * Sale poster carousel.
 *
 * Auto-advancing carousels are usually an accessibility problem, so this one
 * follows the rules that make them acceptable:
 *
 *  · it pauses on hover, on focus, and while the tab is hidden
 *  · it stops permanently the moment someone takes manual control
 *  · it does not auto-advance at all under `prefers-reduced-motion`
 *  · every slide is reachable by keyboard, and the live region announces moves
 *  · one slide renders as a real link; the rest are inert until shown
 *
 * With a single poster it degrades to a plain banner — no timer, no controls.
 */
export default function PosterCarousel({ posters = [] }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [surrendered, setSurrendered] = useState(false);
  const dragX = useRef(0);

  const count = posters.length;
  const many = count > 1;

  const go = useCallback(
    (next, dir) => {
      setDirection(dir);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const takeControl = useCallback(
    (next, dir) => {
      setSurrendered(true); // a deliberate action ends the automatic rotation
      go(next, dir);
    },
    [go]
  );

  /* ── Auto-advance ── */
  useEffect(() => {
    if (!many || reduced || paused || surrendered) return;

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setDirection(1);
        setIndex((i) => (i + 1) % count);
      }
    }, INTERVAL);

    return () => clearInterval(id);
  }, [many, reduced, paused, surrendered, count]);

  /* ── Keyboard ── */
  function onKeyDown(e) {
    if (!many) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      takeControl(index + 1, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      takeControl(index - 1, -1);
    }
  }

  if (!count) return null;

  const poster = posters[index];
  const hasOverlay = Boolean(poster.title || poster.subtitle || poster.ctaLabel);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Current offers"
      className="shell-wide py-10 md:py-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className="relative overflow-hidden bg-elevated">
        {/* Fixed aspect so swapping slides never shifts the page */}
        <div className="relative aspect-[16/7] w-full md:aspect-[21/7]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={poster._id || index}
              custom={direction}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.6, ease: EASE.luxe }}
              drag={many && !reduced ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragStart={(_, info) => {
                dragX.current = info.point.x;
              }}
              onDragEnd={(_, info) => {
                const moved = info.point.x - dragX.current;
                if (moved < -SWIPE_THRESHOLD) takeControl(index + 1, 1);
                else if (moved > SWIPE_THRESHOLD) takeControl(index - 1, -1);
              }}
              className="absolute inset-0"
            >
              <PosterSlide poster={poster} priority={index === 0} hasOverlay={hasOverlay} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Controls ── */}
        {many && (
          <>
            <Arrow side="left" onClick={() => takeControl(index - 1, -1)} />
            <Arrow side="right" onClick={() => takeControl(index + 1, 1)} />
          </>
        )}
      </div>

      {/* ── Dots ── */}
      {many && (
        <div className="mt-5 flex items-center justify-center gap-2.5">
          {posters.map((p, i) => (
            <button
              key={p._id || i}
              onClick={() => takeControl(i, i > index ? 1 : -1)}
              aria-label={`Go to offer ${i + 1} of ${count}`}
              aria-current={i === index}
              className={cn(
                'h-2.5 rounded-full transition-all duration-400',
                i === index
                  ? 'w-8 bg-[var(--accent)]'
                  : 'w-2.5 bg-hairline hover:bg-ink-4'
              )}
            />
          ))}
        </div>
      )}

      {/* Announce slide changes without moving focus */}
      <p aria-live="polite" className="sr-only">
        Offer {index + 1} of {count}
        {poster.title ? `: ${poster.title}` : ''}
      </p>
    </section>
  );
}

/* ── A single poster, linked when it has a destination ── */
function PosterSlide({ poster, priority, hasOverlay }) {
  const body = (
    <>
      <Image
        src={poster.image}
        alt={hasOverlay ? '' : poster.alt || poster.title || 'Current offer'}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 1200px"
        className="object-cover"
        draggable={false}
      />

      {hasOverlay && (
        <>
          {/* Only scrim when there is text to protect — artwork with its own
              baked-in copy should not be dimmed for no reason. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgb(var(--c-base) / 0.88) 0%, rgb(var(--c-base) / 0.6) 45%, transparent 80%)',
            }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[34rem] px-7 md:px-12">
              {poster.title && (
                <p className="font-display text-[clamp(1.6rem,3.6vw,2.8rem)] font-semibold leading-tight">
                  {poster.title}
                </p>
              )}
              {poster.subtitle && (
                <p className="mt-3 text-[16px] leading-relaxed text-ink-2 md:text-[17px]">
                  {poster.subtitle}
                </p>
              )}
              {poster.ctaLabel && (
                <span className="mt-6 inline-flex min-h-[3rem] items-center bg-[var(--accent)] px-7 text-[14px] font-semibold uppercase tracking-[0.05em] text-obsidian">
                  {poster.ctaLabel}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  if (poster.href) {
    return (
      <Link href={poster.href} className="relative block h-full w-full" draggable={false}>
        {body}
      </Link>
    );
  }

  return <div className="relative h-full w-full">{body}</div>;
}

function Arrow({ side, onClick }) {
  const isLeft = side === 'left';
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? 'Previous offer' : 'Next offer'}
      className={cn(
        'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-base/85 text-[18px] text-ink backdrop-blur-sm transition-colors hover:bg-[var(--accent)] hover:text-obsidian md:h-12 md:w-12',
        isLeft ? 'left-3 md:left-4' : 'right-3 md:right-4'
      )}
    >
      {isLeft ? '‹' : '›'}
    </button>
  );
}
