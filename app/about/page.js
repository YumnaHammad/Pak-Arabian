import Link from 'next/link';
import { BRAND, HOUSE_STORY, CHRONOLOGY, VALUES, CRAFT_CHAPTERS, CONTACT } from '@/lib/content/site';
import SplitText from '@/components/ui/SplitText';
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { Eyebrow, Counter } from '@/components/ui/Primitives';
import Marquee from '@/components/ui/Marquee';
import FlaconStage from '@/components/three/FlaconStage';

export const metadata = {
  title: 'The House',
  description: `${BRAND.legal} — founded ${BRAND.founded} in ${BRAND.city}. Small-batch eaux de parfum composed from directly-sourced materials.`,
  alternates: { canonical: '/about' },
};

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `About ${BRAND.legal}`,
  description: BRAND.description,
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ══════════ Masthead ══════════ */}
      <header className="relative flex min-h-[86vh] items-center overflow-hidden pt-28">
        <FlaconStage
          category="signature"
          label={BRAND.name.toUpperCase()}
          className="absolute inset-0 opacity-70"
          cameraZ={7}
          scrollRotations={0.6}
          showMotes
          showVapour
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 70% at 50% 50%, transparent 20%, rgb(var(--c-base) / 0.75) 75%, rgb(var(--c-base)) 100%)',
          }}
        />

        <div className="shell-wide relative">
          <Eyebrow>The House</Eyebrow>
          <SplitText
            as="h1"
            animate="mount"
            lines={['One room.', 'Four formulas.', 'No hurry.']}
            delay={0.15}
            className="mt-8 font-display text-display-lg font-light"
          />
          <p className="mt-10 max-w-prose text-lg leading-relaxed text-ink-2">
            {HOUSE_STORY.lede}
          </p>
        </div>
      </header>

      {/* ══════════ Founder ══════════ */}
      <section className="section" aria-labelledby="founder-heading">
        <div className="shell-wide grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow numeral="I">The Founder</Eyebrow>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <SplitText
              as="h2"
              id="founder-heading"
              lines={['Abdul Rafey']}
              className="font-display text-display-sm font-light"
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              {BRAND.ownerTitle}
            </p>

            <blockquote className="mt-12 border-l border-[var(--accent)] pl-8">
              <p className="font-display text-2xl font-light italic leading-snug md:text-4xl">
                “{HOUSE_STORY.pull}”
              </p>
            </blockquote>

            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {HOUSE_STORY.columns.map((col) => (
                <Reveal key={col.heading}>
                  <p className="mb-4 h-px w-8 bg-[var(--accent)]" />
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.24em]">
                    {col.heading}
                  </h3>
                  <p className="mt-4 text-[14px] leading-relaxed text-ink-3">{col.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ Marquee ══════════ */}
      <div className="border-y border-hairline/40 py-12">
        <Marquee baseVelocity={-1.4} className="fade-edge-x">
          <span className="flex items-center">
            <span className="px-10 font-display text-6xl font-light text-ink-4 md:text-8xl">
              Small batch
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="px-10 font-display text-6xl font-light text-ink-4 md:text-8xl">
              Directly sourced
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="px-10 font-display text-6xl font-light text-ink-4 md:text-8xl">
              Bottled by hand
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
        </Marquee>
      </div>

      {/* ══════════ Chronology ══════════ */}
      <section id="chronology" className="section" aria-labelledby="chronology-heading">
        <div className="shell-wide">
          <Eyebrow numeral="II">Chronology</Eyebrow>
          <SplitText
            as="h2"
            id="chronology-heading"
            lines={['Seven years,', 'six formulas at a time.']}
            className="mt-8 font-display text-display-sm font-light"
          />

          <ol className="mt-20">
            {CHRONOLOGY.map((entry, i) => (
              <Reveal key={entry.year} as="li" delay={i * 0.06}>
                <div className="grid gap-6 border-t border-hairline/40 py-10 md:grid-cols-12 md:gap-10">
                  <p className="font-display text-4xl font-light text-accent md:col-span-2 md:text-5xl">
                    {entry.year}
                  </p>
                  <h3 className="font-display text-2xl font-light md:col-span-4">
                    {entry.title}
                  </h3>
                  <p className="max-w-prose text-[15px] leading-relaxed text-ink-3 md:col-span-6">
                    {entry.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════ Values ══════════ */}
      <section className="section border-y border-hairline/40 bg-surface" aria-labelledby="values-heading">
        <div className="shell-wide">
          <Eyebrow numeral="III">What we hold to</Eyebrow>
          <SplitText
            as="h2"
            id="values-heading"
            lines={['Four positions', 'we do not trade away.']}
            className="mt-8 font-display text-display-sm font-light"
          />

          <RevealGroup as="ul" className="mt-16 grid gap-px sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <RevealItem
                as="li"
                key={v.title}
                className="border border-hairline/50 bg-base p-9"
              >
                <p className="font-mono text-[10px] tabular-nums tracking-[0.24em] text-accent">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-6 font-display text-2xl font-light">{v.title}</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-3">{v.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══════════ Craft ══════════ */}
      <section id="craft" className="section" aria-labelledby="craft-heading">
        <div className="shell-wide">
          <Eyebrow numeral="IV">The Method</Eyebrow>
          <SplitText
            as="h2"
            id="craft-heading"
            lines={['Six stages,', 'none of them rushed.']}
            className="mt-8 font-display text-display-sm font-light"
          />

          <div className="mt-16 grid gap-px md:grid-cols-2 lg:grid-cols-3">
            {CRAFT_CHAPTERS.map((chapter, i) => (
              <Reveal key={chapter.numeral} delay={(i % 3) * 0.08}>
                <article className="h-full border border-hairline/50 p-8">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] tracking-[0.24em] text-accent">
                      {chapter.numeral}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                      {chapter.duration}
                    </span>
                  </div>
                  <h3 className="mt-7 font-display text-2xl font-light">{chapter.title}</h3>
                  <p className="mt-4 text-[14px] leading-relaxed text-ink-3">{chapter.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ Figures ══════════ */}
      <section className="section border-t border-hairline/40" aria-label="The house in figures">
        <div className="shell-wide grid grid-cols-2 gap-10 md:grid-cols-4">
          {[
            { value: 2019, label: 'Founded', raw: true },
            { value: 8, suffix: ' wks', label: 'Minimum maceration' },
            { value: 8, label: 'Origins sourced direct' },
            { value: 6, suffix: '/yr', label: 'Releases, at most' },
          ].map((fig) => (
            <Reveal key={fig.label}>
              <p className="font-display text-5xl font-light text-accent md:text-6xl">
                {fig.raw ? fig.value : <Counter to={fig.value} suffix={fig.suffix || ''} />}
              </p>
              <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-ink-4">
                {fig.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ Close ══════════ */}
      <section className="section" aria-label="Visit">
        <div className="shell-wide flex flex-col items-center border-y border-hairline/50 py-24 text-center">
          <Eyebrow>Come and smell them</Eyebrow>
          <h2 className="mt-8 max-w-[16ch] font-display text-display-sm font-light">
            The counter is open six days a week.
          </h2>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-2">
            {CONTACT.address.line1}, {CONTACT.address.line2}. Bring your wrist —
            an hour on skin tells you more than any description here.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/collection" className="btn-solid">
              Browse the library
            </Link>
            <Link href="/contact" className="btn-luxe">
              Find the boutique
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
