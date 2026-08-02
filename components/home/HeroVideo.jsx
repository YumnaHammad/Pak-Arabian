'use client';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Hero background film.
 *
 * Three things a background video has to get right, all handled here:
 *
 *  1. It must autoplay, which browsers only permit when the video is muted and
 *     `playsInline` (without the latter, iOS takes it fullscreen).
 *  2. It must not play off-screen. An IntersectionObserver pauses it the moment
 *     the hero scrolls away — otherwise it decodes frames for the whole visit.
 *  3. It must never be the thing a visitor is waiting on. It sits behind a
 *     coloured ground that is painted immediately, and fades in only once the
 *     first frame is actually decodable, so a slow connection sees the brand
 *     colour rather than a black box.
 *
 * Under reduced-motion it does not play at all — the still ground stands in.
 */
export default function HeroVideo({ src = '/hero.mp4', className = '' }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    // Some browsers reject the promise if autoplay is blocked; that is fine,
    // the poster ground simply stays.
    const tryPlay = () => el.play().catch(() => {});

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? tryPlay() : el.pause()),
            { threshold: 0.05 }
          )
        : null;

    io?.observe(el);
    return () => io?.disconnect();
  }, [reduced]);

  return (
    <div className={className} aria-hidden>
      {/* Brand ground — painted instantly, and what shows if the file never loads */}
      <div className="absolute inset-0 bg-brand" />

      {!reduced && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/*
        Legibility scrim. A video background is the classic way to make a
        headline unreadable — this is a hard left-to-right ramp so the type
        column always sits on near-solid colour, plus a base fade so the
        section joins the page below it.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgb(var(--c-base)) 0%, rgb(var(--c-base) / 0.92) 34%, rgb(var(--c-base) / 0.55) 62%, rgb(var(--c-base) / 0.35) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(to top, rgb(var(--c-base)), transparent)' }}
      />
    </div>
  );
}
