'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { BRAND } from '@/lib/content/site';
import FlaconStage from '@/components/three/FlaconStage';
import { Eyebrow } from '@/components/ui/Primitives';
import Cursorable from '@/components/ui/Cursorable';

/**
 * The film panel.
 *
 * If a video file is supplied it plays muted, looped and inline behind a
 * letterbox with a parallax offset. No footage exists in this project yet, so
 * by default the panel stages the flacon inside the same cinema frame — the
 * composition is identical, and dropping a file into `videoSrc` swaps the
 * content without touching the layout.
 */
export default function Film({ videoSrc = null, poster = null }) {
  const section = useRef(null);
  const videoRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(true);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.16, 1, 1.16]);
  const barHeight = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], ['12%', '6%', '6%', '12%']);
  const captionY = useTransform(scrollYProgress, [0, 1], ['24%', '-24%']);

  /* Respect reduced-motion by pausing rather than removing the video. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reduced) {
      el.pause();
      setPlaying(false);
    }
  }, [reduced]);

  function toggle() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <section
      ref={section}
      className="relative h-[92vh] overflow-hidden bg-obsidian md:h-screen"
      aria-labelledby="film-heading"
    >
      {/* ── Frame content ── */}
      <motion.div className="absolute inset-0" style={reduced ? undefined : { scale }}>
        {videoSrc ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={videoSrc}
            poster={poster || undefined}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            aria-label="Pak Arabian house film"
          />
        ) : (
          <FlaconStage
            category="signature"
            label={BRAND.name.toUpperCase()}
            subtitle="MAISON NOIR"
            className="absolute inset-0"
            trackScrollOf={section}
            cameraZ={5}
            scrollRotations={2.1}
            showVapour
            showMotes
          />
        )}
      </motion.div>

      {/* ── Letterbox ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bg-obsidian"
        style={reduced ? { height: '8%' } : { height: barHeight }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-obsidian"
        style={reduced ? { height: '8%' } : { height: barHeight }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(115% 85% at 50% 50%, transparent 38%, rgba(8,8,10,0.82) 100%)',
        }}
      />

      {/* ── HUD ── */}
      <div className="absolute inset-0 flex flex-col justify-between px-6 py-[9vh] md:px-12">
        <div className="flex items-start justify-between">
          <Eyebrow numeral="VI">The House Film</Eyebrow>
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-cream/40">
            {BRAND.city} · {BRAND.founded}
          </p>
        </div>

        <motion.div
          className="max-w-3xl"
          style={reduced ? undefined : { y: captionY }}
        >
          <h2
            id="film-heading"
            className="font-display text-4xl font-normal leading-[1.04] text-cream md:text-7xl"
          >
            Eight weeks in the dark,
            <br />
            <span className="italic text-cream/70">before anything is poured.</span>
          </h2>
        </motion.div>

        <div className="flex items-end justify-between">
          <p className="max-w-[26ch] font-mono text-[12px] uppercase leading-relaxed tracking-[0.08em] text-cream/40">
            Filmed at the bench —
            <br />
            no stand-ins, no stock footage
          </p>

          {videoSrc ? (
            <Cursorable variant="link">
              <button
                onClick={toggle}
                className="flex items-center gap-3 border border-cream/20 px-5 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-cream/70 backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                aria-label={playing ? 'Pause film' : 'Play film'}
              >
                <span className="relative flex h-2 w-2">
                  {playing ? (
                    <span className="h-2 w-2 bg-current" />
                  ) : (
                    <span className="h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-current" />
                  )}
                </span>
                {playing ? 'Pause' : 'Play'}
              </button>
            </Cursorable>
          ) : (
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-cream/30">
              Real-time render
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
