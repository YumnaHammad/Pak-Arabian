'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { EASE } from '@/lib/motion';
import { formatPKR, cn } from '@/lib/utils';
import { ASSURANCES } from '@/lib/content/site';
import WishlistButton from '@/components/product/WishlistButton';
import Cursorable from '@/components/ui/Cursorable';

/**
 * Purchase controls.
 *
 * Quantity is bounded by live stock, so the cart can never be loaded with more
 * than the shop holds — the server re-checks anyway, but failing at the button
 * is better than failing at checkout.
 */
export default function PurchasePanel({ product }) {
  const { addItem, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock === 0;
  const max = Math.max(1, Math.min(product.stock, 10));

  const stockLine = soldOut
    ? { label: 'Sold out — returns after the next maceration', tone: 'text-ink-4' }
    : product.stock <= 5
    ? { label: `Only ${product.stock} of this batch remain`, tone: 'text-accent' }
    : { label: 'In stock, despatched within one working day', tone: 'text-ink-3' };

  function onAdd() {
    if (soldOut) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="border-t border-hairline/50 pt-8">
      {/* ── Price ── */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
            {product.concentration} · {product.volumeMl}ml
          </p>
          <p className="mt-3 font-display text-4xl font-light tabular-nums">
            {formatPKR(product.price)}
          </p>
        </div>
        <WishlistButton productId={product._id} showLabel />
      </div>

      {/* ── Stock ── */}
      <p className={cn('mt-5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em]', stockLine.tone)}>
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            soldOut ? 'bg-ink-4' : product.stock <= 5 ? 'bg-[var(--accent)]' : 'bg-emerald-light'
          )}
        />
        {stockLine.label}
      </p>

      {/* ── Quantity + add ── */}
      <div className="mt-9 flex flex-col gap-4 sm:flex-row">
        <div className="flex shrink-0 items-center justify-between border border-hairline sm:w-36">
          <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} label="Decrease quantity">
            −
          </QtyBtn>
          <span className="font-mono text-sm tabular-nums" aria-live="polite">
            {qty}
          </span>
          <QtyBtn onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} label="Increase quantity">
            +
          </QtyBtn>
        </div>

        <Cursorable variant="link" label={soldOut ? '' : 'Add'}>
          <button
            onClick={onAdd}
            disabled={soldOut}
            className="btn-solid relative flex-1 overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={soldOut ? 'out' : added ? 'added' : 'add'}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE.luxe }}
                className="block"
              >
                {soldOut ? 'Sold out' : added ? 'Added to bag' : 'Add to bag'}
              </motion.span>
            </AnimatePresence>
          </button>
        </Cursorable>
      </div>

      {!soldOut && (
        <button
          onClick={() => {
            addItem(product, qty);
            setOpen(true);
          }}
          className="mt-4 w-full text-center font-mono text-[10px] uppercase tracking-[0.24em] text-ink-4 transition-colors hover:text-accent"
        >
          Add and review the bag →
        </button>
      )}

      {/* ── Assurances ── */}
      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline/40 pt-8">
        {ASSURANCES.map((a) => (
          <li key={a.title}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink">
              <span className="mr-2 text-accent">—</span>
              {a.title}
            </p>
            <p className="mt-1.5 pl-5 text-[12px] leading-relaxed text-ink-4">{a.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QtyBtn({ children, onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center text-ink-2 transition-colors hover:text-accent disabled:opacity-25"
    >
      {children}
    </button>
  );
}
