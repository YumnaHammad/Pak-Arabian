import Link from 'next/link';
import { BRAND, CONTACT, FAQ_GROUPS } from '@/lib/content/site';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { Eyebrow, Accordion } from '@/components/ui/Primitives';
import ContactForm from '@/components/contact/ContactForm';
import BoutiquePlate from '@/components/contact/BoutiquePlate';

export const metadata = {
  title: 'Contact',
  description: `Reach ${BRAND.legal} — the boutique in ${BRAND.city}, by phone, WhatsApp or email.`,
  alternates: { canonical: '/contact' },
};

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact ${BRAND.legal}`,
  mainEntity: {
    '@type': 'Organization',
    name: BRAND.legal,
    telephone: '+923101272021',
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.line1,
      addressLocality: BRAND.city,
      addressCountry: 'PK',
    },
  },
};

export default function ContactPage() {
  const quickFaq = FAQ_GROUPS.find((g) => g.group === 'Orders & Delivery')?.items.slice(0, 3) || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ══════════ Masthead ══════════ */}
      <header className="shell-wide pt-32 md:pt-44">
        <Eyebrow>Client Care</Eyebrow>
        <div className="mt-8 flex flex-col justify-between gap-8 border-b border-hairline/50 pb-14 md:flex-row md:items-end">
          <SplitText
            as="h1"
            animate="mount"
            lines={['Talk to', 'the house.']}
            className="font-display text-display-md font-light"
          />
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-ink-2 md:text-right">
            Written enquiries are answered within one working day. For anything
            urgent, WhatsApp is fastest.
          </p>
        </div>
      </header>

      {/* ══════════ Channels ══════════ */}
      <section className="shell-wide mt-16" aria-label="Ways to reach us">
        <div className="grid gap-px sm:grid-cols-3">
          {[
            {
              label: 'WhatsApp',
              value: CONTACT.phone,
              href: CONTACT.whatsapp,
              note: 'Fastest — usually within the hour',
              external: true,
            },
            {
              label: 'Telephone',
              value: CONTACT.phone,
              href: CONTACT.phoneHref,
              note: 'Six days a week, 11:00 — 21:00',
            },
            {
              label: 'Email',
              value: CONTACT.email,
              href: `mailto:${CONTACT.email}`,
              note: 'Replies within one working day',
            },
          ].map((channel, i) => (
            <Reveal key={channel.label} delay={i * 0.08}>
              <a
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex h-full flex-col border border-hairline/50 p-8 transition-colors duration-700 hover:border-[var(--accent)]/50"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                  {channel.label}
                </p>
                <p className="mt-6 break-all font-display text-2xl font-light transition-colors group-hover:text-accent">
                  {channel.value}
                </p>
                <p className="mt-auto pt-6 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-4">
                  {channel.note}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ Form + boutique ══════════ */}
      <section className="section" aria-labelledby="write-heading">
        <div className="shell-wide grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <Eyebrow numeral="I">Write to us</Eyebrow>
            <h2 id="write-heading" className="mt-8 font-display text-display-sm font-light">
              Send a note.
            </h2>
            <div className="mt-12">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:col-span-5">
            <Eyebrow numeral="II">The Boutique</Eyebrow>

            <div className="mt-8">
              <BoutiquePlate />
            </div>

            <address className="mt-8 space-y-1 text-[15px] not-italic leading-relaxed text-ink-2">
              <p>{CONTACT.address.line1}</p>
              <p>{CONTACT.address.line2}</p>
              <p className="text-ink-3">{CONTACT.address.country}</p>
            </address>

            <dl className="mt-10 space-y-4 border-t border-hairline/40 pt-8">
              {CONTACT.hours.map((row) => (
                <div key={row.days} className="flex items-baseline justify-between gap-6">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
                    {row.days}
                  </dt>
                  <dd className="font-mono text-[11px] tabular-nums text-ink-2">{row.time}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 border-t border-hairline/40 pt-8">
              <p className="eyebrow-muted">Follow</p>
              <ul className="mt-5 flex flex-wrap gap-3">
                {CONTACT.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center border border-hairline px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 transition-colors hover:border-accent hover:text-accent"
                    >
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ══════════ Quick answers ══════════ */}
      <section className="section border-t border-hairline/40" aria-labelledby="quick-heading">
        <div className="shell-wide grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4">
            <Eyebrow numeral="III">Before you write</Eyebrow>
            <h2 id="quick-heading" className="mt-8 font-display text-display-sm font-light">
              Asked most often.
            </h2>
            <Link
              href="/faq"
              className="link-draw mt-10 inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-accent"
            >
              Read every answer →
            </Link>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion items={quickFaq} defaultOpen={0} />
          </div>
        </div>
      </section>
    </>
  );
}
