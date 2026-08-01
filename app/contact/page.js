import Link from 'next/link';
import { BRAND, CONTACT, QUICK_ANSWERS } from '@/lib/content/site';
import Reveal from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Primitives';
import ContactForm from '@/components/contact/ContactForm';
import BoutiquePlate from '@/components/contact/BoutiquePlate';

export const metadata = {
  title: 'Contact',
  description: `Reach ${BRAND.legal} — the shop at ${CONTACT.address.line1}, ${CONTACT.address.line2}. Call or WhatsApp ${CONTACT.phone}.`,
  alternates: { canonical: '/contact' },
};

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT.mapsQuery
)}`;

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: BRAND.legal,
  telephone: '+923101272021',
  email: CONTACT.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
    addressLocality: BRAND.city,
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  founder: { '@type': 'Person', name: BRAND.owner, jobTitle: BRAND.ownerTitle },
  openingHours: ['Mo-Sa 11:00-21:00', 'Su 15:00-21:00'],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ══════════ Masthead ══════════ */}
      <header className="shell-wide pt-28 md:pt-36">
        <p className="eyebrow">Contact us</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-tight">
          Talk to the shop
        </h1>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-ink-2">
          Call, WhatsApp or walk in. {BRAND.owner} and the team answer messages
          personally, usually within the hour.
        </p>
      </header>

      {/* ══════════ The three ways to reach us ══════════ */}
      <section className="shell-wide mt-12" aria-label="Ways to contact us">
        <div className="grid gap-4 md:grid-cols-3">
          <ContactCard
            label="WhatsApp"
            value={CONTACT.phone}
            href={CONTACT.whatsapp}
            note="Fastest — replies within the hour"
            external
            primary
            icon={
              <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />
            }
          />
          <ContactCard
            label="Call us"
            value={CONTACT.phone}
            href={CONTACT.phoneHref}
            note="Six days a week, 11am — 9pm"
            icon={
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
            }
          />
          <ContactCard
            label="Email"
            value={CONTACT.email}
            href={`mailto:${CONTACT.email}`}
            note="Replies within one working day"
            icon={
              <>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </>
            }
          />
        </div>
      </section>

      {/* ══════════ Visit + owner ══════════ */}
      <section className="shell-wide py-16 md:py-24" aria-labelledby="visit-heading">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Visit the shop</p>
            <h2
              id="visit-heading"
              className="mt-4 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold"
            >
              Come and try them on skin
            </h2>
            <p className="mt-4 max-w-prose text-[17px] leading-relaxed text-ink-2">
              An hour on your own wrist tells you more than any description here.
              Walk in any day except Sunday morning.
            </p>

            {/* Address */}
            <div className="mt-9 border-t border-hairline/60 pt-7">
              <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                Address
              </p>
              <address className="mt-3 text-[19px] not-italic leading-relaxed">
                {CONTACT.address.line1}
                <br />
                {CONTACT.address.line2}
                <br />
                <span className="text-ink-2">{CONTACT.address.country}</span>
              </address>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[3rem] items-center border border-hairline px-6 text-[15px] font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                Get directions ↗
              </a>
            </div>

            {/* Hours */}
            <div className="mt-9 border-t border-hairline/60 pt-7">
              <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                Opening hours
              </p>
              <dl className="mt-4 space-y-3">
                {CONTACT.hours.map((row) => (
                  <div key={row.days} className="flex items-baseline justify-between gap-6">
                    <dt className="text-[16px] text-ink-2">{row.days}</dt>
                    <dd className="text-[16px] font-semibold tabular-nums">{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Owner — straight off the business card */}
            <div className="mt-9 border-t border-hairline/60 pt-7">
              <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                Who you are dealing with
              </p>
              <p className="mt-3 font-display text-[26px] font-semibold">{BRAND.owner}</p>
              <p className="mt-1 text-[16px] text-accent">{BRAND.ownerTitle}</p>
              <p className="mt-3 max-w-prose text-[16px] leading-relaxed text-ink-2">
                {BRAND.legal} — {BRAND.promise}.
              </p>
            </div>

            {/* Socials */}
            <div className="mt-9 border-t border-hairline/60 pt-7">
              <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                Follow us
              </p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {CONTACT.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[3rem] items-center border border-hairline px-5 text-[15px] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Map plate */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <BoutiquePlate />
            <p className="mt-4 text-[15px] leading-relaxed text-ink-3">
              We are on Milaad Chowk, directly beside Allied Bank in New Town.
              Parking is available on the street outside.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ Message form ══════════ */}
      <section
        className="border-y border-hairline/60 bg-surface py-16 md:py-24"
        aria-labelledby="write-heading"
      >
        <div className="shell-wide grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow">Send a message</p>
            <h2
              id="write-heading"
              className="mt-4 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold"
            >
              Prefer to write?
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
              Fill this in and we will reply by email within one working day. For
              anything about an existing order, include your order reference.
            </p>
          </div>

          <div className="lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ══════════ Quick answers ══════════ */}
      <section className="shell-wide py-16 md:py-24" aria-labelledby="cq-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow">Before you ask</p>
            <h2
              id="cq-heading"
              className="mt-4 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold"
            >
              Common questions
            </h2>
            <Link
              href="/faq"
              className="mt-6 inline-block text-[15px] font-semibold text-accent hover:underline"
            >
              Read every answer →
            </Link>
          </div>
          <div className="lg:col-span-8">
            <Reveal>
              <Accordion items={QUICK_ANSWERS} defaultOpen={0} />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── One way to reach the shop ── */
function ContactCard({ label, value, href, note, icon, external, primary }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group flex h-full flex-col border p-6 transition-colors ${
        primary
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20'
          : 'border-hairline/60 hover:border-accent'
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent)]/40 text-accent">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {icon}
        </svg>
      </span>

      <p className="mt-5 text-[14px] font-semibold uppercase tracking-[0.08em] text-ink-3">
        {label}
      </p>
      <p className="mt-2 break-all text-[19px] font-semibold transition-colors group-hover:text-accent">
        {value}
      </p>
      <p className="mt-auto pt-4 text-[14px] text-ink-3">{note}</p>
    </a>
  );
}
