'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';

/* The product lines printed on the business card. */
const LINES = [
  { label: 'Perfumes', q: 'perfume', d: 'M12 8h8v3h-8zM10 11h12a2 2 0 0 1 2 2v12a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V13a2 2 0 0 1 2-2zM14 4h4v4h-4z' },
  { label: 'Attars', q: 'attar', d: 'M16 3c-1 2-3 3-3 5v2h6V8c0-2-2-3-3-5zM12 10h8l2 5v10a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V15z' },
  { label: 'Pure Honey', q: 'honey', d: 'M11 9h10v2a7 7 0 0 1 2 5v8a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4v-8a7 7 0 0 1 2-5zM12 5h8v4h-8z' },
  { label: 'Dates & Zam Zam', q: 'dates', d: 'M16 5c5 0 8 5 8 11s-3 11-8 11-8-5-8-11 3-11 8-11zM16 9c-1 4-1 10 0 14' },
  { label: 'Gift Items', q: 'gift', d: 'M6 13h20v4H6zM8 17h16v10H8zM16 13v14M16 13c-2-5-7-5-7-2s4 2 7 2zM16 13c2-5 7-5 7-2s-4 2-7 2z' },
  { label: 'Caps & Ihram', q: 'cap', d: 'M6 20c0-6 4-10 10-10s10 4 10 10zM5 20h22v3H5z' },
];

export default function OurRange() {
  return (
    <section className="shell-wide py-20 md:py-28" aria-labelledby="range-heading">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Wholesale &amp; Retail</p>
        <h2 id="range-heading" className="mt-4 font-display text-[clamp(2rem,4.4vw,3.2rem)] font-medium leading-tight">
          Nature&rsquo;s best, <span className="italic text-accent">under one roof.</span>
        </h2>
        <p className="mt-4 text-ink-3">Original products from premium brands — for your shelf or your shop.</p>
      </div>

      <ul className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {LINES.map((l, i) => (
          <motion.li
            key={l.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE.luxe, delay: i * 0.06 }}
          >
            <Link
              href={`/collection?q=${encodeURIComponent(l.q)}`}
              className="group flex h-full flex-col items-center gap-5 rounded-2xl border border-hairline bg-surface px-4 py-8 text-center transition-all duration-500 ease-luxe hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_24px_60px_-30px_rgba(9,58,59,0.45)]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#083234] text-[#d9b45a] transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
                  <path d={l.d} />
                </svg>
              </span>
              <span className="text-[15px] font-semibold">{l.label}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
