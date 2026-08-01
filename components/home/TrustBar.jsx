'use client';
import { motion } from 'framer-motion';
import { VALUE_PROPS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';

/**
 * The reassurance band, directly under the hero.
 *
 * This is the first thing a cautious shopper looks for: can I trust this, how
 * do I pay, when does it arrive. Deliberately plain — icons, four short
 * headings, one line of detail each. No animation beyond a single entrance.
 */
export default function TrustBar() {
  return (
    <section
      aria-label="Why buy from us"
      className="border-y border-hairline/60 bg-surface"
    >
      <ul className="shell-wide grid gap-x-8 gap-y-9 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-12">
        {VALUE_PROPS.map((prop, i) => (
          <motion.li
            key={prop.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: EASE.luxe, delay: i * 0.07 }}
            className="flex gap-4"
          >
            <Icon name={prop.icon} />
            <div>
              <p className="text-[16px] font-semibold leading-snug">{prop.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{prop.body}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Icon({ name }) {
  const paths = {
    wallet: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M16 12h3" />
      </>
    ),
    truck: (
      <>
        <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" />
        <circle cx="6.5" cy="18" r="1.8" />
        <circle cx="17.5" cy="18" r="1.8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.2 2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7.5 3v6c0 4.6-3.2 7.9-7.5 9-4.3-1.1-7.5-4.4-7.5-9V6z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </>
    ),
  };

  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/35 text-accent"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[name] || paths.shield}
      </svg>
    </span>
  );
}
