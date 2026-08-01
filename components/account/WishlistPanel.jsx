'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { EASE } from '@/lib/motion';
import { formatPKR } from '@/lib/utils';
import PanelEmpty from './PanelEmpty';
import BottleGlyph from '@/components/ui/BottleGlyph';
import Cursorable from '@/components/ui/Cursorable';

export default function WishlistPanel() {
  const { addItem } = useCart();
  const { remove, ids } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/account/wishlist', { cache: 'no-store' });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Keep the panel in step when a card elsewhere on the page toggles a save. */
  useEffect(() => {
    setItems((prev) => prev.filter((p) => ids.includes(p._id)));
  }, [ids]);

  async function onRemove(id) {
    setItems((prev) => prev.filter((p) => p._id !== id));
    await remove(id);
  }

  if (loading) {
    return (
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4">
        Loading wishlist…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <PanelEmpty
        title="Nothing saved."
        body="Mark a composition with the heart on any card and it will wait for you here."
        cta={{ href: '/collection', label: 'Browse the library' }}
      />
    );
  }

  return (
    <ul className="divide-y divide-hairline/40 border-y border-hairline/50">
      <AnimatePresence initial={false}>
        {items.map((p) => (
          <motion.li
            key={p._id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: EASE.luxe }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-6 py-7">
              <Link href={`/product/${p.slug}`} className="group flex flex-1 items-center gap-6">
                <div className="relative h-28 w-22 shrink-0 overflow-hidden bg-elevated" style={{ width: '5.5rem' }}>
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt="" fill sizes="88px" className="object-cover" />
                  ) : (
                    <BottleGlyph className="h-full w-full p-4 text-ink-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-display text-2xl font-normal transition-colors group-hover:text-accent">
                    {p.name}
                  </p>
                  <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-4">
                    {p.concentration} · {p.volumeMl}ml
                  </p>
                  <p className="mt-3 font-mono text-sm tabular-nums text-ink-2">
                    {formatPKR(p.price)}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <Cursorable variant="link">
                  <button
                    onClick={() => addItem(p, 1)}
                    disabled={p.stock === 0}
                    className="border border-hairline px-5 py-3 font-mono text-[13px] uppercase tracking-[0.07em] text-ink-2 transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
                  >
                    {p.stock === 0 ? 'Sold out' : 'Add to bag'}
                  </button>
                </Cursorable>
                <button
                  onClick={() => onRemove(p._id)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="font-mono text-[13px] uppercase tracking-[0.07em] text-ink-4 transition-colors hover:text-accent"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
