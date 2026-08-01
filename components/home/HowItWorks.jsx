'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HOW_IT_WORKS, CONTACT } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';

/**
 * Three steps from browsing to paying.
 *
 * Cash-on-delivery is unfamiliar enough online that people hesitate — they
 * assume a card will be asked for eventually. Spelling the sequence out
 * removes the single biggest reason a first-time visitor abandons the bag.
 */
export default function HowItWorks() {
  return (
    <section
      className="border-y border-hairline/60 bg-surface py-16 md:py-24"
      aria-labelledby="how-heading"
    >
      <div className="shell-wide">
        <div className="max-w-2xl">
          <p className="eyebrow">Ordering is simple</p>
          <h2
            id="how-heading"
            className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold"
          >
            How it works
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
            No card, no account, no payment until the bottle is in your hand.
          </p>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, ease: EASE.luxe, delay: i * 0.1 }}
              className="relative border-t-2 border-[var(--accent)] pt-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[16px] font-bold text-obsidian">
                {item.step}
              </span>
              <h3 className="mt-5 font-display text-[21px] font-semibold">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{item.body}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-5">
          <Link
            href="/collection"
            className="flex min-h-[3.5rem] items-center justify-center bg-[var(--accent)] px-9 text-[15px] font-semibold uppercase tracking-[0.05em] text-obsidian transition-opacity hover:opacity-90"
          >
            Start shopping
          </Link>
          <p className="text-[15px] text-ink-3">
            Questions? WhatsApp us on{' '}
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              {CONTACT.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
