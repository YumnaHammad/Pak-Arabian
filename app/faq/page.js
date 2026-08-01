import Link from 'next/link';
import { BRAND, CONTACT, FAQ_GROUPS } from '@/lib/content/site';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { Eyebrow, Accordion } from '@/components/ui/Primitives';

export const metadata = {
  title: 'Questions',
  description: `Fragrance, delivery, returns and care — answered by ${BRAND.legal}.`,
  alternates: { canonical: '/faq' },
};

/* FAQPage structured data — every question and answer, flattened. */
const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
};

const ANCHORS = { Fragrance: 'fragrance', 'Orders & Delivery': 'orders', 'Returns & Care': 'returns' };

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ══════════ Masthead ══════════ */}
      <header className="shell-wide pt-32 md:pt-44">
        <Eyebrow>Questions</Eyebrow>
        <div className="mt-8 flex flex-col justify-between gap-8 border-b border-hairline/50 pb-14 md:flex-row md:items-end">
          <SplitText
            as="h1"
            animate="mount"
            lines={['Everything', 'worth asking.']}
            className="font-display text-display-md font-normal"
          />
          <p className="max-w-[32ch] text-[17px] leading-relaxed text-ink-2 md:text-right">
            If the answer is not here, the house replies to WhatsApp within the hour.
          </p>
        </div>
      </header>

      {/* ══════════ Groups ══════════ */}
      <div className="shell-wide grid gap-14 py-16 lg:grid-cols-12 lg:gap-20 md:py-24">
        {/* Index */}
        <nav className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start" aria-label="Question topics">
          <p className="eyebrow-muted">Topics</p>
          <ul className="mt-6 space-y-3">
            {FAQ_GROUPS.map((group) => (
              <li key={group.group}>
                <a
                  href={`#${ANCHORS[group.group]}`}
                  className="link-draw font-mono text-[13px] uppercase tracking-[0.07em] text-ink-3 transition-colors hover:text-accent"
                >
                  {group.group}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 border-t border-hairline/40 pt-8">
            <p className="eyebrow-muted">Still stuck</p>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block font-display text-xl font-normal transition-colors hover:text-accent"
            >
              {CONTACT.phone}
            </a>
            <Link
              href="/contact"
              className="link-draw mt-4 inline-block font-mono text-[13px] uppercase tracking-[0.07em] text-accent"
            >
              Write to us →
            </Link>
          </div>
        </nav>

        {/* Answers */}
        <div className="lg:col-span-8 lg:col-start-5">
          {FAQ_GROUPS.map((group, i) => (
            <Reveal key={group.group} className={i > 0 ? 'mt-20' : ''}>
              <section id={ANCHORS[group.group]} className="scroll-mt-32">
                <h2 className="font-display text-3xl font-normal md:text-4xl">{group.group}</h2>
                <div className="mt-8">
                  <Accordion items={group.items} defaultOpen={i === 0 ? 0 : -1} />
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ══════════ Close ══════════ */}
      <section className="section border-t border-hairline/40" aria-label="Next">
        <div className="shell-wide flex flex-col items-center text-center">
          <h2 className="max-w-[18ch] font-display text-display-sm font-normal">
            The best answer is an hour on skin.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/collection" className="btn-solid">
              Browse the library
            </Link>
            <Link href="/contact" className="btn-luxe">
              Visit the boutique
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
