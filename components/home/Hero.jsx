'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { BRAND, PITCH } from '@/lib/content/site';
import Logo from '@/components/ui/Logo';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

const RANGE = ['Perfumes', 'Attars', 'Honey', 'Dates & Zam Zam', 'Gift Items', 'Caps & Ihram'];

/**
 * Opening frame: always on the brand teal (it is the identity, not the
 * theme), copy on the left, a live 3D flacon on the right.
 */
export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const introComplete = useUI((s) => s.introComplete);
  const gate = introComplete || reduced;
  const pointer = useRef({ x: 0, y: 0 });
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    if (reduced) return;
    try {
      const c = document.createElement('canvas');
      setWebgl(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setWebgl(false);
    }
    const move = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduced]);

  const rise = (delay) => ({
    initial: { opacity: 0, y: 22 },
    animate: gate ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, ease: EASE.luxe, delay },
  });

  return (
    <section
      className="relative isolate overflow-hidden bg-[#083234] text-[#fbf3e2]"
      aria-label={`${BRAND.name} Fragrances`}
    >
      {/* Ground: deep teal with a warm glow behind the flacon */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_72%_45%,#0f6266_0%,#0a4446_45%,#062627_100%)]" />
        <div className="absolute right-[8%] top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-[#d9b45a]/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fbf3e2_1px,transparent_1px)] [background-size:22px_22px]" />
        {/* Faint mark as watermark */}
        <Logo className="absolute -left-24 bottom-[-6rem] h-[34rem] w-[26rem] text-[#fbf3e2] opacity-[0.04]" title="" />
      </div>

      <div className="shell-wide grid min-h-[100svh] items-center gap-6 pb-14 pt-28 md:pt-32 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Copy */}
        <div className="relative z-10 max-w-[38rem]">
          <motion.p {...rise(0.1)} className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#d9b45a]">
            <span className="h-px w-10 bg-[#d9b45a]" />
            {BRAND.name} Fragrances · {BRAND.city}
          </motion.p>

          <motion.h1
            {...rise(0.2)}
            className="mt-7 font-display text-[clamp(2.7rem,6.2vw,5.2rem)] font-medium leading-[1.02] tracking-[-0.02em]"
          >
            {PITCH.headline}{' '}
            <span className="italic text-[#d9b45a]">{PITCH.headlineAccent}</span>
          </motion.h1>

          <motion.p {...rise(0.3)} className="mt-7 max-w-[44ch] text-[17px] leading-relaxed text-[#fbf3e2]/75">
            {PITCH.sub}
          </motion.p>

          <motion.div {...rise(0.4)} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/collection"
              className="group inline-flex min-h-[3.5rem] items-center gap-3 rounded-full bg-[#d9b45a] px-8 text-[14px] font-semibold uppercase tracking-[0.08em] text-[#083234] shadow-[0_18px_50px_-18px_rgba(217,180,90,0.8)] transition-transform hover:-translate-y-0.5"
            >
              Shop the collection
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[3.5rem] items-center rounded-full border border-[#fbf3e2]/30 px-8 text-[14px] font-semibold uppercase tracking-[0.08em] transition-colors hover:border-[#d9b45a] hover:text-[#d9b45a]"
            >
              Wholesale enquiry
            </Link>
          </motion.div>

          <motion.ul {...rise(0.5)} className="mt-12 flex flex-wrap gap-2">
            {RANGE.map((r) => (
              <li
                key={r}
                className="rounded-full border border-[#fbf3e2]/15 bg-[#fbf3e2]/[0.04] px-3.5 py-1.5 text-[12.5px] text-[#fbf3e2]/80"
              >
                {r}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* 3D */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={gate ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.4, ease: EASE.luxe, delay: 0.25 }}
          className="relative order-first h-[46svh] min-h-[320px] lg:order-none lg:h-[78svh]"
        >
          {/* Arch frame from the mark */}
          <svg aria-hidden viewBox="0 0 200 300" className="absolute left-1/2 top-1/2 h-[92%] -translate-x-1/2 -translate-y-1/2 text-[#d9b45a]/30" fill="none" stroke="currentColor" strokeWidth="0.6">
            <path d="M20 300 V120 C20 70 70 40 100 6 C130 40 180 70 180 120 V300" />
            <path d="M36 300 V126 C36 84 76 58 100 26 C124 58 164 84 164 126 V300" opacity="0.5" />
          </svg>
          {webgl ? (
            <HeroScene pointer={pointer} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Logo className="h-[70%] w-[60%] text-[#fbf3e2]" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#fbf3e2]/50 md:flex">
        Scroll
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-[#d9b45a] to-transparent" />
      </div>
    </section>
  );
}
