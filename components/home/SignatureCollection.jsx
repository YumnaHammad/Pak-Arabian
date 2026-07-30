'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { Eyebrow } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';
import ProductCard from '@/components/product/ProductCard';
import Cursorable from '@/components/ui/Cursorable';

/**
 * The signature row.
 *
 * Reads featured products straight from the database — no separate curation
 * table. If nothing is flagged featured the section falls back to the newest
 * pieces rather than rendering an empty grid.
 */
export default function SignatureCollection({ products = [] }) {
  if (!products.length) return null;

  return (
    <section id="signature" className="section relative" aria-labelledby="signature-heading">
      <div className="shell-wide">
        <div className="flex flex-col justify-between gap-8 border-b border-hairline/50 pb-12 md:flex-row md:items-end">
          <div>
            <Eyebrow numeral="III">The Signature Collection</Eyebrow>
            <SplitText
              as="h2"
              id="signature-heading"
              lines={['The pieces the house', 'is measured against.']}
              className="mt-8 font-display text-display-sm font-light"
            />
          </div>

          <Cursorable variant="link">
            <Link
              href="/collection"
              className="link-draw shrink-0 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-2 hover:text-accent"
            >
              View all {products.length > 8 ? '' : ''}pieces →
            </Link>
          </Cursorable>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-16 grid grid-cols-2 gap-x-6 gap-y-16 md:gap-x-8 lg:grid-cols-4"
        >
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </motion.div>

        {/* Closing rule with a note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE.luxe }}
          className="mt-20 flex flex-col items-center gap-5 border-t border-hairline/50 pt-12 text-center"
        >
          <p className="max-w-prose text-[14px] leading-relaxed text-ink-3">
            Batches are small and numbered. When a composition sells through, it
            returns only after the next maceration completes — eight weeks at the
            earliest.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
