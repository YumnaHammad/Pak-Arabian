'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { formatPKR, shortId, cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/hooks';
import SplitText from '@/components/ui/SplitText';
import { Eyebrow } from '@/components/ui/Primitives';
import Reveal from '@/components/ui/Reveal';

const STAGES = [
  { key: 'pending', label: 'Received', note: 'Your order is with the house.' },
  { key: 'processing', label: 'Preparing', note: 'Bottles checked, wrapped and sealed.' },
  { key: 'shipped', label: 'In transit', note: 'Handed to the courier.' },
  { key: 'delivered', label: 'Delivered', note: 'With you.' },
];

/**
 * Confirmation.
 *
 * Reads as a receipt from a house rather than a transaction log: the stage
 * timeline is the same `status` enum the admin panel writes to, so what the
 * shopper sees here is exactly what the team sets on the order.
 */
export default function OrderConfirmation({ order, isOwner, contact, assurances }) {
  const reduced = usePrefersReducedMotion();
  const cancelled = order.status === 'cancelled';
  const stageIndex = STAGES.findIndex((s) => s.key === order.status);
  const activeStage = cancelled ? -1 : Math.max(0, stageIndex);

  const firstName = (order.customer?.name || '').split(' ')[0] || 'there';
  const subtotal = order.subtotal ?? order.total + (order.discount || 0);

  return (
    <div className="shell-wide pb-28 pt-32 md:pt-44">
      {/* ── Header ── */}
      <div className="border-b border-hairline/50 pb-14">
        <Eyebrow>{cancelled ? 'Order cancelled' : 'Order confirmed'}</Eyebrow>

        <SplitText
          as="h1"
          animate="mount"
          lines={[`Thank you, ${firstName}.`]}
          className="mt-8 font-display text-display-sm font-normal"
        />

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.luxe, delay: 0.4 }}
          className="mt-7 max-w-prose text-[17px] leading-relaxed text-ink-2"
        >
          {cancelled
            ? 'This order has been cancelled. Nothing has been charged.'
            : 'Your order is with the house. Everything is checked against a reference sample, wrapped in unbleached tissue and wax-sealed before it leaves Sadiqabad.'}
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-baseline gap-x-10 gap-y-4 font-mono text-[13px] uppercase tracking-[0.07em] text-ink-4"
        >
          <span>
            Reference <span className="ml-2 text-accent">{shortId(order._id)}</span>
          </span>
          <span>
            Placed{' '}
            <span className="ml-2 text-ink-2">
              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </span>
          <span>
            Total <span className="ml-2 text-ink-2">{formatPKR(order.total)}</span>
          </span>
        </motion.div>
      </div>

      <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-20">
        {/* ══════════ Left ══════════ */}
        <div className="lg:col-span-7">
          {/* Stage timeline */}
          {!cancelled && (
            <Reveal>
              <h2 className="eyebrow-muted">Progress</h2>
              <ol className="mt-8">
                {STAGES.map((stage, i) => {
                  const done = i < activeStage;
                  const current = i === activeStage;
                  return (
                    <li key={stage.key} className="flex gap-6">
                      {/* Rail */}
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'flex h-3 w-3 shrink-0 items-center justify-center rounded-full border transition-colors duration-700',
                            done || current
                              ? 'border-[var(--accent)] bg-[var(--accent)]'
                              : 'border-hairline'
                          )}
                        >
                          {current && !reduced && (
                            <motion.span
                              className="absolute h-3 w-3 rounded-full bg-[var(--accent)]"
                              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: EASE.luxe }}
                            />
                          )}
                        </span>
                        {i < STAGES.length - 1 && (
                          <span
                            className={cn(
                              'w-px flex-1 transition-colors duration-700',
                              done ? 'bg-[var(--accent)]' : 'bg-hairline'
                            )}
                          />
                        )}
                      </div>

                      <div className={cn('pb-10', i === STAGES.length - 1 && 'pb-0')}>
                        <p
                          className={cn(
                            'font-display text-xl font-normal',
                            current ? 'text-accent' : done ? 'text-ink' : 'text-ink-4'
                          )}
                        >
                          {stage.label}
                        </p>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-4">
                          {stage.note}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          )}

          {/* Items */}
          <Reveal delay={0.1} className="mt-16">
            <h2 className="eyebrow-muted">In this order</h2>
            <ul className="mt-8 divide-y divide-hairline/40 border-y border-hairline/50">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-baseline justify-between gap-6 py-5">
                  <div>
                    <p className="font-display text-xl font-normal">{item.name}</p>
                    <p className="mt-1 font-mono text-[13px] uppercase tracking-[0.06em] text-ink-4">
                      {formatPKR(item.price)} × {item.qty}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm tabular-nums text-ink-2">
                    {formatPKR(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-8 space-y-3 font-mono text-[13px] uppercase tracking-[0.06em]">
              <div className="flex justify-between">
                <dt className="text-ink-4">Subtotal</dt>
                <dd className="tabular-nums text-ink-2">{formatPKR(subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-4">
                    Discount{order.couponCode ? ` — ${order.couponCode}` : ''}
                  </dt>
                  <dd className="tabular-nums text-accent">− {formatPKR(order.discount)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-hairline/40 pt-4">
                <dt className="text-ink-2">Payable on delivery</dt>
                <dd className="font-display text-2xl font-normal tabular-nums tracking-normal">
                  {formatPKR(order.total)}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        {/* ══════════ Right ══════════ */}
        <aside className="lg:col-span-5">
          <Reveal delay={0.15}>
            <div className="border border-hairline/60 bg-surface p-8">
              <h2 className="eyebrow-muted">Delivering to</h2>
              <address className="mt-6 space-y-1 text-[17px] not-italic leading-relaxed text-ink-2">
                <p>{order.customer?.name}</p>
                {order.customer?.address && <p className="text-ink-3">{order.customer.address}</p>}
                {order.customer?.city && <p className="text-ink-3">{order.customer.city}</p>}
                {order.customer?.phone && (
                  <p className="pt-2 font-mono text-[14px] text-ink-4">{order.customer.phone}</p>
                )}
                {order.customer?.email && (
                  <p className="font-mono text-[14px] text-ink-4">{order.customer.email}</p>
                )}
              </address>

              {order._masked && (
                <p className="mt-6 border-t border-hairline/40 pt-5 text-[14px] leading-relaxed text-ink-4">
                  Details are partially hidden.{' '}
                  <Link href="/account" className="text-accent underline underline-offset-4">
                    Sign in
                  </Link>{' '}
                  with the email on this order to see it in full.
                </p>
              )}

              {order.note && (
                <div className="mt-7 border-t border-hairline/40 pt-6">
                  <p className="eyebrow-muted">Your note</p>
                  <p className="mt-3 text-[16px] leading-relaxed text-ink-3">“{order.note}”</p>
                </div>
              )}

              <div className="mt-7 border-t border-hairline/40 pt-6">
                <p className="eyebrow-muted">Payment</p>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-3">
                  Cash on delivery. {formatPKR(order.total)} is collected when the parcel
                  reaches you.
                </p>
              </div>

              <ul className="mt-7 space-y-2.5 border-t border-hairline/40 pt-6">
                {assurances.map((a) => (
                  <li
                    key={a.title}
                    className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-4"
                  >
                    <span className="mr-2 text-accent">—</span>
                    {a.title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Next steps */}
            <div className="mt-6 flex flex-col gap-3">
              {isOwner ? (
                <Link href="/account" className="btn-solid w-full">
                  Track in your account
                </Link>
              ) : (
                <Link href="/account" className="btn-luxe w-full">
                  Create an account to track
                </Link>
              )}
              <Link href="/collection" className="btn-luxe w-full">
                Continue browsing
              </Link>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-center font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4 transition-colors hover:text-accent"
              >
                Questions? WhatsApp {contact.phone}
              </a>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
