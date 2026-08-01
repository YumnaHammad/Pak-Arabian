'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { formatPKR, cn } from '@/lib/utils';
import BottleGlyph from '@/components/ui/BottleGlyph';
import WishlistButton from '@/components/product/WishlistButton';

/**
 * The product card.
 *
 * Rewritten for clarity over theatre. Previously the price sat in small mono
 * type and "Quick add" only appeared on hover — which meant a touch device
 * never saw it at all, and a first-time visitor had no idea the grid was
 * shoppable. Now the three things a shopper needs are always on screen:
 * what it costs, whether it is in stock, and a button that buys it.
 */
export default function ProductCard({ product, index = 0, priority = false, compact = false }) {
  const reduced = usePrefersReducedMotion();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  function addToBag() {
    if (soldOut) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.7, ease: EASE.luxe, delay: (index % 4) * 0.06 }}
      /* `relative` anchors the stretched link below. */
      className="group/card relative flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-elevated">
        <div className={cn('block', compact ? 'aspect-[4/5]' : 'aspect-[3/4]')}>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-luxe group-hover/card:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-elevated to-veil">
              <BottleGlyph className="h-[50%] w-auto text-ink-4" />
            </div>
          )}
        </div>

        {/* Stock badge — always visible, plain words */}
        {(soldOut || lowStock) && (
          <span
            className={cn(
              'pointer-events-none absolute left-3 top-3 z-20 px-3 py-1.5 text-[13px] font-semibold',
              soldOut ? 'bg-ink text-base' : 'bg-[var(--accent)] text-obsidian'
            )}
          >
            {soldOut ? 'Sold out' : `Only ${product.stock} left`}
          </span>
        )}

        {/* Above the stretched link so it stays independently clickable */}
        <div className="absolute right-3 top-3 z-20">
          <WishlistButton productId={product._id} />
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-1 flex-col pt-4">
        {/*
          Stretched link: the ::after covers the whole article, so clicking
          anywhere on the card — image, price, stock line, empty space — opens
          the product. Keeping it as one anchor on the title means there is
          still exactly one correctly-labelled link for screen readers, and the
          wishlist and Add-to-bag buttons sit above it on z-20.
        */}
        <h3 className="font-display text-[19px] font-medium leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors after:absolute after:inset-0 after:z-10 after:content-[''] hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-[14px] text-ink-3">
          {product.concentration} · {product.volumeMl}ml
        </p>

        {/* Price — the single most important number on the card */}
        <p className="mt-3 text-[22px] font-semibold tabular-nums text-ink">
          {formatPKR(product.price)}
        </p>

        {/* Stock in words, not just a coloured dot */}
        <p
          className={cn(
            'mt-1.5 flex items-center gap-2 text-[14px]',
            soldOut ? 'text-ink-4' : lowStock ? 'text-accent' : 'text-emerald-light'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'h-2 w-2 rounded-full',
              soldOut ? 'bg-ink-4' : lowStock ? 'bg-[var(--accent)]' : 'bg-emerald-light'
            )}
          />
          {soldOut ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : 'In stock'}
        </p>

        {/* Buy — always visible, full width, real tap target */}
        <button
          type="button"
          onClick={addToBag}
          disabled={soldOut}
          aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to bag`}
          className={cn(
            'relative z-20 mt-4 flex min-h-[3rem] w-full items-center justify-center px-4 text-[14px] font-semibold uppercase tracking-[0.05em] transition-colors duration-300',
            soldOut
              ? 'cursor-not-allowed border border-hairline text-ink-4'
              : added
              ? 'bg-emerald-light text-obsidian'
              : 'bg-ink text-base hover:bg-[var(--accent)] hover:text-obsidian'
          )}
        >
          {soldOut ? 'Out of stock' : added ? '✓ Added to bag' : 'Add to bag'}
        </button>
      </div>
    </motion.article>
  );
}
