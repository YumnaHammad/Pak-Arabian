'use client';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

/**
 * The shoppable row.
 *
 * Reads featured products straight from the database — no separate curation
 * table. If nothing is flagged featured the section falls back to the newest
 * pieces rather than rendering an empty grid.
 *
 * Headed in plain words ("Best sellers", "Shop now") rather than house
 * language: this is the section that has to convert, and "The pieces the house
 * is measured against" told a first-time visitor nothing about what to do next.
 */
export default function SignatureCollection({ products = [], title = 'Best sellers', eyebrow = 'Shop now' }) {
  if (!products.length) return null;

  return (
    <section id="shop" className="shell-wide py-16 md:py-24" aria-labelledby="shop-row-heading">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2
            id="shop-row-heading"
            className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold"
          >
            {title}
          </h2>
          <p className="mt-3 text-[16px] text-ink-2">
            Every price includes delivery quotes at checkout. Pay when it arrives.
          </p>
        </div>

        <Link
          href="/collection"
          className="shrink-0 text-[15px] font-semibold text-accent hover:underline"
        >
          View all fragrances →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-6 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} priority={i < 4} />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          href="/collection"
          className="flex min-h-[3.5rem] items-center justify-center border border-hairline px-10 text-[15px] font-semibold uppercase tracking-[0.05em] transition-colors hover:border-accent hover:text-accent"
        >
          See the full collection
        </Link>
      </div>
    </section>
  );
}
