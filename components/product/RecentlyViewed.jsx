'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePersistentState } from '@/lib/hooks';
import { EASE, VIEWPORT } from '@/lib/motion';
import { formatPKR } from '@/lib/utils';
import { Eyebrow } from '@/components/ui/Primitives';
import BottleGlyph from '@/components/ui/BottleGlyph';
import Cursorable from '@/components/ui/Cursorable';

const KEY = 'pakarabian_recent';
const LIMIT = 6;

/**
 * Recently viewed.
 *
 * Records the current product on mount, then renders the rest of the history.
 * Kept entirely on the device — a browsing trail is not something the house
 * needs on its servers.
 */
export default function RecentlyViewed({ current }) {
  const [history, setHistory, hydrated] = usePersistentState(KEY, []);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    if (!hydrated || recorded || !current?._id) return;
    setRecorded(true);

    const entry = {
      _id: current._id,
      slug: current.slug,
      name: current.name,
      price: current.price,
      image: current.images?.[0] || null,
      concentration: current.concentration,
      volumeMl: current.volumeMl,
    };

    setHistory((prev) => [entry, ...prev.filter((p) => p._id !== entry._id)].slice(0, LIMIT + 1));
  }, [hydrated, recorded, current, setHistory]);

  const others = history.filter((p) => p._id !== current?._id).slice(0, LIMIT);
  if (!hydrated || others.length === 0) return null;

  return (
    <section className="section border-t border-hairline/50" aria-labelledby="recent-heading">
      <div className="shell-wide">
        <Eyebrow>Recently viewed</Eyebrow>
        <h2 id="recent-heading" className="sr-only">
          Recently viewed fragrances
        </h2>

        <ul className="no-scrollbar mt-10 flex gap-6 overflow-x-auto pb-2">
          {others.map((p, i) => (
            <motion.li
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE.luxe, delay: i * 0.05 }}
              className="w-40 shrink-0 sm:w-48"
            >
              <Cursorable variant="view" label="Open">
                <Link href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-elevated">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="192px"
                        className="object-cover transition-transform duration-[1.3s] ease-luxe group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BottleGlyph className="h-1/2 w-auto text-ink-4" />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 truncate font-display text-base font-normal transition-colors group-hover:text-accent">
                    {p.name}
                  </p>
                  <p className="font-mono text-[13px] tabular-nums text-ink-4">
                    {formatPKR(p.price)}
                  </p>
                </Link>
              </Cursorable>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
