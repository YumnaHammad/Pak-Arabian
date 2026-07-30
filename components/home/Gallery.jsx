'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { CONTACT, INGREDIENTS } from '@/lib/content/site';
import { Eyebrow } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';
import Cursorable from '@/components/ui/Cursorable';
import BottleGlyph from '@/components/ui/BottleGlyph';

/* Editorial tiles fill the grid wherever photography does not yet exist —
   the mosaic stays composed instead of showing empty frames. */
const TYPE_TILES = [
  { kind: 'quote', text: 'Four thousand kilograms of petals for one kilogram of absolute.' },
  { kind: 'material', index: 1 },
  { kind: 'stat', value: '08', label: 'Weeks in the dark' },
  { kind: 'material', index: 5 },
];

/**
 * The feed.
 *
 * A masonry mosaic mixing whatever product photography exists with typographic
 * and material tiles. Every cell is the same visual family, so a house with
 * four photographs and a house with forty both look intentional.
 */
export default function Gallery({ images = [] }) {
  /* Interleave photography with editorial tiles so neither clusters. */
  const cells = [];
  const photoQueue = [...images];
  const tileQueue = [...TYPE_TILES];
  const target = Math.max(8, Math.min(12, images.length + TYPE_TILES.length));

  for (let i = 0; i < target; i++) {
    if (i % 3 === 2 && tileQueue.length) cells.push({ type: 'tile', data: tileQueue.shift() });
    else if (photoQueue.length) cells.push({ type: 'photo', data: photoQueue.shift() });
    else if (tileQueue.length) cells.push({ type: 'tile', data: tileQueue.shift() });
    else cells.push({ type: 'glyph' });
  }

  return (
    <section className="section" aria-labelledby="feed-heading">
      <div className="shell-wide">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow numeral="IX">The Feed</Eyebrow>
            <SplitText
              as="h2"
              id="feed-heading"
              lines={['From the bench,', 'and from you.']}
              className="mt-8 font-display text-display-sm font-light"
            />
          </div>

          <Cursorable variant="link">
            <a
              href={CONTACT.socials[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw shrink-0 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-2 hover:text-accent"
            >
              @azwah.enterprises ↗
            </a>
          </Cursorable>
        </div>

        {/* ── Mosaic ── */}
        <div className="mt-16 grid auto-rows-[13rem] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {cells.map((cell, i) => {
            /* A repeating rhythm of tall / wide cells breaks the grid up. */
            const tall = i % 7 === 1 || i % 7 === 4;
            const wide = i % 11 === 5;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ ...VIEWPORT, once: true }}
                transition={{ duration: 0.85, ease: EASE.luxe, delay: (i % 4) * 0.07 }}
                className={`group relative overflow-hidden bg-elevated ${
                  tall ? 'row-span-2' : ''
                } ${wide ? 'col-span-2' : ''}`}
              >
                {cell.type === 'photo' && (
                  <>
                    <Image
                      src={cell.data}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-[1.5s] ease-luxe group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-obsidian/0 transition-colors duration-700 group-hover:bg-obsidian/35" />
                    <span className="absolute bottom-4 left-4 translate-y-3 font-mono text-[9px] uppercase tracking-[0.22em] text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      Azwah — {String(i + 1).padStart(2, '0')}
                    </span>
                  </>
                )}

                {cell.type === 'tile' && <EditorialTile tile={cell.data} />}

                {cell.type === 'glyph' && (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-elevated to-veil">
                    <BottleGlyph className="h-1/2 w-auto text-ink-4 transition-transform duration-[1.4s] group-hover:scale-110" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
          Tag <span className="text-accent">#AzwahEnterprises</span> to appear here
        </p>
      </div>
    </section>
  );
}

function EditorialTile({ tile }) {
  if (tile.kind === 'quote') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface p-6 text-center">
        <p className="font-display text-lg font-light italic leading-snug text-ink-2 md:text-xl">
          “{tile.text}”
        </p>
      </div>
    );
  }

  if (tile.kind === 'stat') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-surface p-6 text-center">
        <p className="font-display text-6xl font-light text-accent">{tile.value}</p>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4">
          {tile.label}
        </p>
      </div>
    );
  }

  const ing = INGREDIENTS[tile.index] || INGREDIENTS[0];
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 transition-transform duration-[1.6s] ease-luxe group-hover:scale-110"
        style={{
          background: `radial-gradient(60% 60% at 50% 45%, ${ing.hue}cc, ${ing.hue}22 55%, transparent 78%)`,
          filter: 'blur(26px)',
        }}
      />
      <div className="grain-layer absolute inset-0 opacity-[0.06]" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <p className="font-display text-2xl font-light text-cream">{ing.name}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-cream/50">
          {ing.origin}
        </p>
      </div>
    </div>
  );
}
