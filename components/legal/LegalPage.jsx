import Link from 'next/link';
import { BRAND, CONTACT } from '@/lib/content/site';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Primitives';

/**
 * Shared layout for the legal documents.
 *
 * Long-form legal text is the one place on this site where restraint matters
 * most: a narrow measure, generous leading, a numbered index that sticks, and
 * no animation beyond a single entrance. Nobody should have to fight a
 * scroll effect to read a returns clause.
 */
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <>
      <header className="shell-wide pt-32 md:pt-44">
        <Eyebrow>Legal</Eyebrow>
        <div className="mt-8 border-b border-hairline/50 pb-14">
          <SplitText
            as="h1"
            animate="mount"
            lines={[title]}
            className="font-display text-display-sm font-light"
          />
          <p className="mt-8 max-w-prose text-[15px] leading-relaxed text-ink-2">{intro}</p>
          <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
            Last updated: {updated} · {BRAND.legal}
          </p>
        </div>
      </header>

      <div className="shell-wide grid gap-14 py-16 lg:grid-cols-12 lg:gap-20 md:py-24">
        {/* Index */}
        <nav className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start" aria-label="Sections">
          <p className="eyebrow-muted">Contents</p>
          <ol className="mt-6 space-y-3">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a
                  href={`#s-${i + 1}`}
                  className="link-draw flex gap-3 text-[13px] text-ink-3 transition-colors hover:text-accent"
                >
                  <span className="font-mono text-[10px] tabular-nums text-ink-4">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Body */}
        <div className="lg:col-span-8 lg:col-start-5">
          {sections.map((section, i) => (
            <Reveal key={section.title} as="section" delay={Math.min(i, 5) * 0.04}>
              <div id={`s-${i + 1}`} className="scroll-mt-32 border-b border-hairline/40 py-10 first:pt-0">
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-[10px] tabular-nums text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-2xl font-light md:text-3xl">{section.title}</h2>
                </div>
                <p className="mt-5 max-w-prose pl-10 text-[15px] leading-[1.85] text-ink-2">
                  {section.content}
                </p>
              </div>
            </Reveal>
          ))}

          {/* Contact */}
          <div className="mt-14 border border-hairline/60 bg-surface p-8">
            <p className="eyebrow-muted">Questions about this document</p>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-2">
              Write to{' '}
              <a
                href={`mailto:${CONTACT.email}`}
                className="link-draw break-all text-accent"
              >
                {CONTACT.email}
              </a>{' '}
              or message the house on{' '}
              <a href={CONTACT.whatsapp} className="link-draw text-accent" target="_blank" rel="noopener noreferrer">
                {CONTACT.phone}
              </a>
              .
            </p>
            <p className="mt-5 text-[13px] leading-relaxed text-ink-4">
              {CONTACT.address.line1}, {CONTACT.address.line2}, {CONTACT.address.country}.
            </p>
            <Link
              href="/contact"
              className="link-draw mt-7 inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-accent"
            >
              Contact the house →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
