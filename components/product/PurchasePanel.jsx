'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPKR, cn } from '@/lib/utils';
import { VALUE_PROPS, CONTACT } from '@/lib/content/site';
import WishlistButton from '@/components/product/WishlistButton';

/**
 * Purchase controls.
 *
 * The decision point of the whole site, so nothing here is subtle: the price is
 * the largest thing on the panel, stock is stated in words, and the buy button
 * is full-width with a real tap target. Quantity is bounded by live stock — the
 * server re-checks anyway, but failing at the button beats failing at checkout.
 */
export default function PurchasePanel({ product }) {
  const { addItem, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const max = Math.max(1, Math.min(product.stock, 10));

  function onAdd(openBag = false) {
    if (soldOut) return;
    addItem(product, qty);
    if (openBag) {
      setOpen(true);
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="border-t border-hairline/60 pt-8">
      {/* ── Price ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[36px] font-semibold leading-none tabular-nums md:text-[42px]">
            {formatPKR(product.price)}
          </p>
          <p className="mt-2.5 text-[15px] text-ink-3">
            {product.concentration} · {product.volumeMl}ml · Price includes tax
          </p>
        </div>
        <WishlistButton productId={product._id} showLabel />
      </div>

      {/* ── Stock, in plain words ── */}
      <p
        className={cn(
          'mt-6 flex items-center gap-2.5 text-[16px] font-semibold',
          soldOut ? 'text-ink-4' : lowStock ? 'text-accent' : 'text-emerald-light'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            soldOut ? 'bg-ink-4' : lowStock ? 'bg-[var(--accent)]' : 'bg-emerald-light'
          )}
        />
        {soldOut
          ? 'Out of stock'
          : lowStock
          ? `Hurry — only ${product.stock} left`
          : `In stock (${product.stock} available)`}
      </p>

      {!soldOut && (
        <p className="mt-2 text-[15px] text-ink-3">
          Order today and it leaves Sadiqabad within one working day.
        </p>
      )}

      {/* ── Quantity ── */}
      {!soldOut && (
        <div className="mt-8 flex items-center gap-4">
          <span className="text-[15px] font-semibold">Quantity</span>
          <div className="flex items-center border border-hairline">
            <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} label="Decrease quantity">
              −
            </QtyBtn>
            <span className="w-12 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">
              {qty}
            </span>
            <QtyBtn onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} label="Increase quantity">
              +
            </QtyBtn>
          </div>
          {qty > 1 && (
            <span className="text-[15px] text-ink-2">
              Total <strong className="tabular-nums">{formatPKR(product.price * qty)}</strong>
            </span>
          )}
        </div>
      )}

      {/* ── Buy ── */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => onAdd(false)}
          disabled={soldOut}
          className={cn(
            'flex min-h-[3.75rem] w-full items-center justify-center px-6 text-[16px] font-semibold uppercase tracking-[0.05em] transition-colors duration-300',
            soldOut
              ? 'cursor-not-allowed border border-hairline text-ink-4'
              : added
              ? 'bg-emerald-light text-obsidian'
              : 'bg-[var(--accent)] text-obsidian hover:opacity-90'
          )}
        >
          {soldOut ? 'Out of stock' : added ? '✓ Added to your bag' : 'Add to bag'}
        </button>

        {!soldOut && (
          <button
            onClick={() => onAdd(true)}
            className="flex min-h-[3.5rem] w-full items-center justify-center border border-hairline px-6 text-[15px] font-semibold uppercase tracking-[0.05em] transition-colors hover:border-accent hover:text-accent"
          >
            Buy now — go to bag
          </button>
        )}

        {soldOut && (
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[3.5rem] w-full items-center justify-center border border-hairline px-6 text-[15px] font-semibold uppercase tracking-[0.05em] transition-colors hover:border-accent hover:text-accent"
          >
            Ask when it is back
          </a>
        )}
      </div>

      <p className="mt-4 text-center text-[15px] text-ink-3">
        You pay <strong className="text-ink">nothing now</strong> — cash on delivery.
      </p>

      {/* ── Reassurance ── */}
      <ul className="mt-8 grid gap-4 border-t border-hairline/50 pt-7 sm:grid-cols-2">
        {VALUE_PROPS.map((v) => (
          <li key={v.title} className="flex gap-2.5">
            <span aria-hidden className="mt-0.5 shrink-0 text-accent">
              ✓
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-snug">{v.title}</span>
              <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-3">{v.body}</span>
            </span>
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
      className="flex h-14 w-14 items-center justify-center text-[20px] text-ink-2 transition-colors hover:text-accent disabled:opacity-25"
    >
      {children}
    </button>
  );
}
