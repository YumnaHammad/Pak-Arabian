'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { formatPKR, shortId, cn } from '@/lib/utils';
import PanelEmpty from './PanelEmpty';

const STATUS_TONE = {
  pending: 'text-accent border-[var(--accent)]/50',
  processing: 'text-accent border-[var(--accent)]/50',
  shipped: 'text-emerald-light border-emerald-light/50',
  delivered: 'text-emerald-light border-emerald-light/50',
  cancelled: 'text-ink-4 border-hairline',
};

/**
 * Order history.
 *
 * Matched by account *and* by the email captured at checkout, so orders placed
 * as a guest before registering still surface here.
 */
export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/orders', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => {
        if (!cancelled) setOrders(data.orders || []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-4">
        Loading orders…
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <PanelEmpty
        title="No orders yet."
        body="When you place an order it appears here, with its progress from the bench to your door."
        cta={{ href: '/collection', label: 'Browse the library' }}
      />
    );
  }

  const spend = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      {/* Summary strip */}
      <dl className="mb-12 grid grid-cols-2 gap-6 border-b border-hairline/50 pb-10 sm:grid-cols-3">
        <Stat label="Orders placed" value={orders.length} />
        <Stat label="Total with the house" value={formatPKR(spend)} />
        <Stat
          label="In transit"
          value={orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status)).length}
        />
      </dl>

      <ul className="divide-y divide-hairline/40 border-y border-hairline/50">
        {orders.map((order, i) => {
          const open = expanded === order._id;
          return (
            <motion.li
              key={order._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE.luxe, delay: Math.min(i, 6) * 0.05 }}
            >
              <button
                onClick={() => setExpanded(open ? null : order._id)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-6 py-7 text-left"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {shortId(order._id)}
                  </p>
                  <p className="mt-2.5 font-display text-xl font-light">
                    {order.items.length} {order.items.length === 1 ? 'composition' : 'compositions'}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-4">
                    {new Date(order.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <span
                    className={cn(
                      'hidden border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] sm:block',
                      STATUS_TONE[order.status] || STATUS_TONE.pending
                    )}
                  >
                    {order.status}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-ink-2">
                    {formatPKR(order.total)}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.4, ease: EASE.luxe }}
                    className="text-ink-4"
                  >
                    +
                  </motion.span>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE.luxe }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8">
                      <ul className="space-y-3 border-l border-hairline/50 pl-6">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between gap-6 text-[14px]">
                            <span className="text-ink-2">
                              {item.name}{' '}
                              <span className="text-ink-4">× {item.qty}</span>
                            </span>
                            <span className="shrink-0 font-mono tabular-nums text-ink-3">
                              {formatPKR(item.price * item.qty)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {order.discount > 0 && (
                        <p className="mt-5 pl-6 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                          {order.couponCode} — {formatPKR(order.discount)} off
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap items-center gap-6 pl-6">
                        <Link
                          href={`/order/${order._id}`}
                          className="link-draw font-mono text-[10px] uppercase tracking-[0.22em] text-accent"
                        >
                          View confirmation →
                        </Link>
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-4 sm:hidden">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">{label}</dt>
      <dd className="mt-3 font-display text-3xl font-light tabular-nums">{value}</dd>
    </div>
  );
}
