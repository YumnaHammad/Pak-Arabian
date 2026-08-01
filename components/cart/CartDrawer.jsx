'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useEscape, useFocusTrap } from '@/lib/hooks';
import { setScrollLocked } from '@/components/layout/SmoothScroll';
import { EASE } from '@/lib/motion';
import { formatPKR } from '@/lib/utils';
import { ASSURANCES } from '@/lib/content/site';
import Cursorable from '@/components/ui/Cursorable';
import BottleGlyph from '@/components/ui/BottleGlyph';

const FREE_SHIPPING_AT = 15000;

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, total, count } = useCart();
  const [recommended, setRecommended] = useState([]);
  const trapRef = useFocusTrap(open);

  useEscape(() => setOpen(false), open);

  /* Freeze the page beneath the drawer. */
  useEffect(() => {
    setScrollLocked(open);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      setScrollLocked(false);
    };
  }, [open]);

  /* Pull featured pieces once, the first time the drawer is opened. */
  useEffect(() => {
    if (!open || recommended.length) return;
    let cancelled = false;
    fetch('/api/products?featured=1')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setRecommended(data.slice(0, 6));
      })
      .catch(() => {
        /* recommendations are decorative — never block the cart on them */
      });
    return () => {
      cancelled = true;
    };
  }, [open, recommended.length]);

  const inCart = new Set(items.map((i) => i.productId));
  const upsells = recommended.filter((p) => !inCart.has(p._id) && p.stock > 0).slice(0, 3);
  const remaining = Math.max(0, FREE_SHIPPING_AT - total);
  const shippingProgress = Math.min(1, total / FREE_SHIPPING_AT);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[105] bg-obsidian/70 backdrop-blur-md"
            aria-hidden
          />

          <motion.aside
            key="drawer"
            ref={trapRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.72, ease: EASE.luxe }}
            className="fixed inset-y-0 right-0 z-[106] flex w-full max-w-[27rem] flex-col border-l border-hairline/60 bg-base"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            {/* ── Header ── */}
            <header className="flex shrink-0 items-center justify-between border-b border-hairline/60 px-7 py-6">
              <div>
                <p className="eyebrow-muted">Your selection</p>
                <h2 className="mt-2 font-display text-2xl font-normal">
                  The Bag
                  <span className="ml-3 font-mono text-xs tabular-nums text-accent">
                    {String(count).padStart(2, '0')}
                  </span>
                </h2>
              </div>
              <Cursorable variant="link">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close bag"
                  className="group relative flex h-10 w-10 items-center justify-center"
                >
                  <span className="absolute inset-0 rounded-full border border-transparent transition-colors duration-500 group-hover:border-hairline" />
                  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </Cursorable>
            </header>

            {/* ── Shipping meter ── */}
            {items.length > 0 && (
              <div className="shrink-0 border-b border-hairline/40 px-7 py-4">
                <p className="font-mono text-[13px] uppercase tracking-[0.07em] text-ink-3">
                  {remaining > 0 ? (
                    <>
                      <span className="text-accent">{formatPKR(remaining)}</span> from complimentary
                      delivery
                    </>
                  ) : (
                    <span className="text-accent">Complimentary delivery unlocked</span>
                  )}
                </p>
                <div className="mt-3 h-px w-full bg-hairline">
                  <motion.div
                    className="h-px bg-gold-leaf"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: shippingProgress }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: 0.9, ease: EASE.luxe }}
                  />
                </div>
              </div>
            )}

            {/* ── Items ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-7">
              {items.length === 0 ? (
                <EmptyBag onClose={() => setOpen(false)} />
              ) : (
                <ul className="divide-y divide-hairline/40">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.45, ease: EASE.luxe }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-5 py-6">
                          <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-elevated">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <BottleGlyph className="h-full w-full p-4 text-ink-4" />
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <p className="truncate font-display text-lg font-normal">{item.name}</p>
                              <p className="shrink-0 font-mono text-xs tabular-nums">
                                {formatPKR(item.price * item.qty)}
                              </p>
                            </div>
                            <p className="mt-1 font-mono text-[13px] uppercase tracking-[0.06em] text-ink-4">
                              {formatPKR(item.price)} each
                            </p>

                            <div className="mt-auto flex items-center gap-4 pt-4">
                              <div className="flex items-center border border-hairline">
                                <QtyButton
                                  onClick={() => updateQty(item.productId, item.qty - 1)}
                                  label={`Decrease quantity of ${item.name}`}
                                >
                                  −
                                </QtyButton>
                                <span className="w-8 text-center font-mono text-xs tabular-nums">
                                  {item.qty}
                                </span>
                                <QtyButton
                                  onClick={() => updateQty(item.productId, item.qty + 1)}
                                  label={`Increase quantity of ${item.name}`}
                                >
                                  +
                                </QtyButton>
                              </div>

                              <button
                                onClick={() => removeItem(item.productId)}
                                className="link-draw ml-auto font-mono text-[13px] uppercase tracking-[0.07em] text-ink-4 transition-colors hover:text-accent"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {/* ── Upsells ── */}
              {items.length > 0 && upsells.length > 0 && (
                <div className="border-t border-hairline/40 py-7">
                  <p className="eyebrow-muted">Pairs well with</p>
                  <ul className="mt-5 space-y-4">
                    {upsells.map((p) => (
                      <li key={p._id}>
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-4"
                        >
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-elevated">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" />
                            ) : (
                              <BottleGlyph className="h-full w-full p-2 text-ink-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-base transition-colors group-hover:text-accent">
                              {p.name}
                            </p>
                            <p className="font-mono text-[13px] tabular-nums text-ink-3">
                              {formatPKR(p.price)}
                            </p>
                          </div>
                          <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {items.length > 0 && (
              <footer className="shrink-0 border-t border-hairline/60 px-7 py-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-3">
                    Subtotal
                  </span>
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE.luxe }}
                    className="font-display text-2xl font-normal tabular-nums"
                  >
                    {formatPKR(total)}
                  </motion.span>
                </div>
                <p className="mt-2 text-[13px] text-ink-4">
                  Delivery calculated at checkout · Payment on delivery
                </p>

                <Cursorable variant="link" label="Checkout">
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="btn-solid mt-6 w-full"
                  >
                    Proceed to checkout
                  </Link>
                </Cursorable>

                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full text-center font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4 transition-colors hover:text-accent"
                >
                  Continue browsing
                </button>

                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hairline/40 pt-5">
                  {ASSURANCES.slice(0, 4).map((a) => (
                    <li
                      key={a.title}
                      className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-4"
                    >
                      <span className="mr-1.5 text-accent">—</span>
                      {a.title}
                    </li>
                  ))}
                </ul>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyButton({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center text-sm text-ink-2 transition-colors hover:bg-elevated hover:text-accent"
    >
      {children}
    </button>
  );
}

function EmptyBag({ onClose }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-24 text-center">
      <BottleGlyph className="h-16 w-16 text-ink-4" />
      <p className="mt-8 font-display text-2xl font-normal">Nothing selected yet.</p>
      <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink-3">
        The library holds a small number of compositions. Take your time with them.
      </p>
      <Link href="/collection" onClick={onClose} className="btn-luxe mt-10">
        Browse the library
      </Link>
    </div>
  );
}
