'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE, SPRING } from '@/lib/motion';
import { formatPKR, cn } from '@/lib/utils';
import Cursorable from '@/components/ui/Cursorable';
import BottleGlyph from '@/components/ui/BottleGlyph';
import WishlistButton from '@/components/product/WishlistButton';

/**
 * The library card.
 *
 * Hover does four things from one pointer position: the frame tilts in 3D, a
 * specular sheet sweeps the glass, the image drifts counter to the tilt, and
 * the quick-add rises. Under reduced-motion none of it runs.
 *
 * Structure note: the product link is a *stretched* link — an anchor on the
 * title whose ::after covers the whole card. Wrapping the card in an anchor
 * would nest the wishlist and quick-add buttons inside it, which is invalid
 * HTML and makes the card unusable with a keyboard or screen reader. This way
 * there is exactly one link and two real buttons, each independently focusable.
 */
export default function ProductCard({ product, index = 0, priority = false, compact = false }) {
  const reduced = usePrefersReducedMotion();
  const { addItem } = useCart();
  const frame = useRef(null);
  const [added, setAdded] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), SPRING.soft);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), SPRING.soft);
  const imageX = useSpring(useTransform(mx, [0, 1], ['3%', '-3%']), SPRING.soft);
  const imageY = useSpring(useTransform(my, [0, 1], ['3%', '-3%']), SPRING.soft);
  const sheenX = useTransform(mx, [0, 1], ['-30%', '130%']);

  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  function onPointerMove(e) {
    if (reduced) return;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function onPointerLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  function quickAdd() {
    if (soldOut) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.95, ease: EASE.luxe, delay: (index % 4) * 0.09 }}
      className="group/card relative"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* ── Frame ── */}
      <motion.div
        ref={frame}
        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
        className={cn(
          'relative overflow-hidden bg-elevated',
          compact ? 'aspect-[4/5]' : 'aspect-[3/4]'
        )}
      >
        <motion.div
          className="absolute -inset-[4%]"
          style={reduced ? undefined : { x: imageX, y: imageY }}
        >
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[1.4s] ease-luxe group-hover/card:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-elevated to-veil">
              <BottleGlyph className="h-[52%] w-auto text-ink-4" />
            </div>
          )}
        </motion.div>

        {/* Specular sweep */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
            style={{
              left: sheenX,
              background:
                'linear-gradient(100deg, transparent, rgba(255,255,255,0.14), transparent)',
            }}
          />
        )}

        {/* Scrim + hairline */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-obsidian/75 to-transparent opacity-0 transition-opacity duration-700 group-hover/card:opacity-100" />
        <span className="pointer-events-none absolute inset-0 border border-[var(--accent)] opacity-0 transition-opacity duration-700 group-hover/card:opacity-40" />

        {/* Status */}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
          {soldOut && <Chip tone="solid">Sold out</Chip>}
          {lowStock && <Chip tone="gold">Only {product.stock} left</Chip>}
          {product.featured && !soldOut && !lowStock && <Chip tone="outline">Signature</Chip>}
        </div>

        {/* Wishlist — above the stretched link */}
        <div className="absolute right-3 top-3 z-20">
          <WishlistButton productId={product._id} />
        </div>

        {/* Quick add — above the stretched link */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 z-20 translate-y-3 opacity-0 transition-all duration-500 ease-luxe focus-within:translate-y-0 focus-within:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <Cursorable variant="link" label="Add">
              <button
                type="button"
                onClick={quickAdd}
                className="glass flex w-full items-center justify-center gap-2 py-3.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cream transition-colors hover:bg-[var(--accent)] hover:text-obsidian"
                aria-label={`Add ${product.name} to bag`}
              >
                {added ? 'Added to bag' : 'Quick add'}
              </button>
            </Cursorable>
          </div>
        )}
      </motion.div>

      {/* ── Caption ── */}
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-light leading-tight">
            <Cursorable variant="view" label="Discover">
              {/*
                The ::after here is what makes the whole card clickable while
                keeping this the single, correctly-labelled link.
              */}
              <Link
                href={`/product/${product.slug}`}
                className="transition-colors duration-500 after:absolute after:inset-0 after:z-10 after:content-[''] group-hover/card:text-accent"
              >
                {product.name}
              </Link>
            </Cursorable>
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
            {product.concentration} · {product.volumeMl}ml
          </p>
        </div>
        <p className="shrink-0 font-mono text-sm tabular-nums text-ink-2">
          {formatPKR(product.price)}
        </p>
      </div>
    </motion.article>
  );
}

function Chip({ children, tone = 'outline' }) {
  const tones = {
    solid: 'bg-ink text-base',
    gold: 'bg-[var(--accent)] text-obsidian',
    outline: 'border border-[var(--accent)] text-[var(--accent)] bg-obsidian/40 backdrop-blur-sm',
  };
  return (
    <span
      className={cn(
        'px-2.5 py-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.18em]',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
