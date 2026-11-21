'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { CONTACT } from '@/lib/content/site';
import { useT, useLang } from "@/lib/i18n";
import Logo from '@/components/ui/Logo';

const SLIDES = [
  { key: 's1', img: '/uploads/mens-1.png', href: '/collection?category=men' },
  { key: 's2', img: '/uploads/mens-2.png', href: '/collection?q=attar' },
  { key: 's3', img: '/uploads/womens-1.png', href: '/collection?category=women' },
];

/**
 * Homepage banner: a teal card with rotating product slides. Plain images and
 * opacity/transform transitions only — no WebGL, no video — so it stays
 * smooth on any phone or laptop.
 */
export default function Hero() {
  const t = useT();
  const lang = useLang((st) => st.lang);
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, [reduced, i]);

  const s = SLIDES[i];

  return (
    <section className="px-3 pb-6 pt-[88px] md:px-6 md:pt-[104px]" aria-roledescription="carousel">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#083234] text-[#fbf3e2] md:rounded-[36px]">
        {/* Ground */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_75%_50%,#0f6266_0%,#0a4446_50%,#062627_100%)]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fbf3e2_1px,transparent_1px)] [background-size:20px_20px]" />
          <Logo className="absolute -bottom-16 start-[-3rem] h-[24rem] w-[19rem] text-[#fbf3e2] opacity-[0.045]" title="" />
        </div>

        <div className="grid grid-cols-1 items-center gap-8 px-6 pb-10 pt-10 md:px-14 md:py-10 lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:px-20 lg:py-[28.5px]">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d9b45a]/40 bg-[#d9b45a]/10 px-4 py-1.5 text-[12px] font-semibold tracking-[0.12em] text-[#e7c877]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e7c877]" />
              {t('hero.kicker')}
            </p>

            <div className="mt-5 min-h-[11rem] md:min-h-[10.5rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={s.key + lang}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.55, ease: EASE.luxe }}
                >
                  <h1 className="hero-title max-w-[20ch] font-display text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-[1.1]">
                    {t(`${s.key}.title`)}
                  </h1>
                  <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-[#fbf3e2]/75 md:text-[17px]">
                    {t(`${s.key}.body`)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={s.href}
                className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-full bg-[#d9b45a] px-7 text-[15px] font-semibold text-[#083234] transition-colors hover:bg-[#e7c877]"
              >
                {t('hero.shop')} <span aria-hidden className="rtl:rotate-180">→</span>
              </Link>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-full border border-[#fbf3e2]/30 px-7 text-[15px] font-semibold transition-colors hover:border-[#25d366] hover:text-[#7be39f]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z"/></svg>
                {t('hero.whatsapp')}
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[#fbf3e2]/80">
              {['hero.f1', 'hero.f2', 'hero.f3'].map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <span aria-hidden className="text-[#d9b45a]">✓</span>
                  {t(k)}
                </li>
              ))}
            </ul>

            {/* Slide dots */}
            <div className="mt-6 flex items-center gap-2">
              {SLIDES.map((sl, n) => (
                <button
                  key={sl.key}
                  type="button"
                  aria-label={`Slide ${n + 1}`}
                  aria-current={n === i}
                  onClick={() => setI(n)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${n === i ? 'w-10 bg-[#d9b45a]' : 'w-4 bg-[#fbf3e2]/30 hover:bg-[#fbf3e2]/60'}`}
                />
              ))}
            </div>
          </div>

          {/* Arch-framed product image */}
          <div className="relative order-1 mx-auto w-full max-w-[15rem] sm:max-w-[17rem] lg:order-2 lg:max-w-[17.5rem]">
            <div aria-hidden className="absolute -inset-3 rounded-t-full border border-[#d9b45a]/50 md:-inset-4" />
            <div aria-hidden className="absolute -inset-7 rounded-t-full border border-[#d9b45a]/15 md:-inset-9" />
            <div className="relative aspect-[5/6] overflow-hidden rounded-t-full bg-[#0a4446]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={s.img}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE.luxe }}
                  className="absolute inset-0"
                >
                  <Image src={s.img} alt="" fill priority={i === 0} sizes="(max-width: 1024px) 80vw, 420px" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute -bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-full bg-[#fbf3e2] px-5 py-2 text-[13px] font-semibold text-[#083234] shadow-lg">
              Pak Arabian Fragrances
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
