'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { COLLECTION_DOORS } from '@/lib/content/site';
import { EASE, VIEWPORT } from '@/lib/motion';
import BottleGlyph from '@/components/ui/BottleGlyph';

/**
 * Shop by category.
 *
 * Replaces the four expanding "doors". Those looked striking but hid their
 * labels until hover and gave no sense of how much was behind each one — on a
 * phone they read as four dark rectangles. These are ordinary, obvious cards
 * with a name, a plain description and a count.
 */
export default function ShopCategories({ covers = {}, counts = {} }) {
  return (
    <section className="shell-wide py-16 md:py-24" aria-labelledby="shop-heading">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Shop by category</p>
          <h2 id="shop-heading" className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold">
            What are you looking for?
          </h2>
        </div>
        <Link
          href="/collection"
          className="shrink-0 text-[15px] font-semibold text-accent hover:underline"
        >
          View all fragrances →
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COLLECTION_DOORS.map((door, i) => {
          const count = counts[door.value] || 0;
          return (
            <motion.div
              key={door.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, ease: EASE.luxe, delay: i * 0.07 }}
            >
              <Link
                href={`/collection?category=${door.value}`}
                className="group block overflow-hidden border border-hairline/60 transition-colors hover:border-accent"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
                  {covers[door.value] ? (
                    <Image
                      src={covers[door.value]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BottleGlyph className="h-1/2 w-auto text-ink-4" />
                    </div>
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-45 mix-blend-multiply transition-opacity group-hover:opacity-30"
                    style={{ background: `linear-gradient(180deg, transparent, ${door.accent})` }}
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-display text-[21px] font-semibold transition-colors group-hover:text-accent">
                    {door.label}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{door.line}</p>
                  <p className="mt-4 text-[14px] font-semibold text-accent">
                    {count > 0 ? `${count} available` : 'Browse'} →
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
