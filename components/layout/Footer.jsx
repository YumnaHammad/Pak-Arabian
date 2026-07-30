'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BRAND, CONTACT, COLLECTION_DOORS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import Newsletter from './Newsletter';
import Cursorable from '@/components/ui/Cursorable';
import { usePrefersReducedMotion } from '@/lib/hooks';

const COLUMNS = [
  {
    heading: 'The Library',
    links: [
      ...COLLECTION_DOORS.map((d) => ({ label: d.label, href: `/collection?category=${d.value}` })),
      { label: 'Woody', href: '/collection?category=woody' },
      { label: 'Floral', href: '/collection?category=floral' },
      { label: 'View everything', href: '/collection' },
    ],
  },
  {
    heading: 'The House',
    links: [
      { label: 'Our story', href: '/about' },
      { label: 'Craftsmanship', href: '/about#craft' },
      { label: 'Ingredients', href: '/#ingredients' },
      { label: 'Journal', href: '/about#chronology' },
    ],
  },
  {
    heading: 'Client Care',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Your account', href: '/account' },
      { label: 'Order status', href: '/account' },
      { label: 'Shipping & returns', href: '/faq#returns' },
    ],
  },
];

export default function Footer() {
  const reduced = usePrefersReducedMotion();

  return (
    <footer className="relative overflow-hidden border-t border-hairline/50 bg-surface">
      {/* Newsletter sits above the footer proper */}
      <Newsletter />

      <div className="shell-wide grid grid-cols-2 gap-x-8 gap-y-14 py-20 md:grid-cols-12 md:py-24">
        {/* ── Brand block ── */}
        <div className="col-span-2 md:col-span-4">
          <p className="font-display text-3xl font-light">
            {BRAND.name}
            <span className="text-accent align-super text-sm">{BRAND.mark}</span>
          </p>
          <p className="eyebrow-muted mt-2">Enterprises — Est. {BRAND.founded}</p>
          <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-ink-2">
            {BRAND.description}
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {CONTACT.socials.map((s) => (
              <li key={s.label}>
                <Cursorable variant="link">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-10 items-center border border-hairline px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 transition-colors hover:border-accent hover:text-accent"
                  >
                    {s.label}
                    <span className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">↗</span>
                  </a>
                </Cursorable>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Link columns ── */}
        {COLUMNS.map((col) => (
          <nav key={col.heading} className="md:col-span-2" aria-label={col.heading}>
            <p className="eyebrow-muted">{col.heading}</p>
            <ul className="mt-6 space-y-3">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Cursorable variant="link">
                    <Link
                      href={link.href}
                      className="link-draw text-sm text-ink-2 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </Cursorable>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* ── Boutique ── */}
        <div className="col-span-2 md:col-span-2">
          <p className="eyebrow-muted">The Boutique</p>
          <address className="mt-6 space-y-5 text-sm not-italic text-ink-2">
            <div>
              <p className="leading-relaxed">
                {CONTACT.address.line1}
                <br />
                {CONTACT.address.line2}
                <br />
                <span className="text-ink-3">{CONTACT.address.country}</span>
              </p>
            </div>
            <div>
              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
                Telephone
              </p>
              <a href={CONTACT.phoneHref} className="link-draw hover:text-accent">
                {CONTACT.phone}
              </a>
            </div>
            <div>
              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
                Email
              </p>
              <a href={`mailto:${CONTACT.email}`} className="link-draw break-all hover:text-accent">
                {CONTACT.email}
              </a>
            </div>
          </address>
        </div>
      </div>

      {/* ── Oversized wordmark ── */}
      <div className="shell-wide pb-8">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 40 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.4, ease: EASE.luxe }}
          aria-hidden
          className="select-none whitespace-nowrap text-center font-display text-[19vw] font-light leading-[0.78] tracking-tighter text-ink opacity-[0.055]"
        >
          {BRAND.name.toUpperCase()}
        </motion.p>
      </div>

      {/* ── Legal bar ── */}
      <div className="border-t border-hairline/50">
        <div className="shell-wide flex flex-col gap-4 py-7 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.legal}
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
            <Link href="/terms" className="transition-colors hover:text-accent">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-accent">
              Privacy
            </Link>
            <span>
              {BRAND.owner} — {BRAND.ownerTitle}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
