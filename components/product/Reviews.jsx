'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { EASE, VIEWPORT } from '@/lib/motion';
import { Eyebrow, Rating } from '@/components/ui/Primitives';
import MagneticButton from '@/components/ui/MagneticButton';
import { cn } from '@/lib/utils';

/**
 * Reviews for a single product.
 *
 * Reads and writes `/api/reviews`. Submissions are held for moderation, and the
 * form says so plainly rather than implying the review is live — a shopper who
 * cannot find their own review five minutes later loses trust in all of them.
 */
export default function Reviews({ productId, productName }) {
  const { customer, isAuthenticated } = useAuth();
  const [data, setData] = useState({ reviews: [], average: null, count: 0 });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setData({ reviews: [], average: null, count: 0 });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section id="reviews" className="section border-t border-hairline/50" aria-labelledby="reviews-heading">
      <div className="shell-wide grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* ── Summary ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Client Accounts</Eyebrow>
          <h2 id="reviews-heading" className="mt-7 font-display text-4xl font-light">
            What it does
            <br />
            on skin.
          </h2>

          {data.count > 0 ? (
            <div className="mt-10">
              <div className="flex items-baseline gap-4">
                <p className="font-display text-6xl font-light tabular-nums text-accent">
                  {data.average?.toFixed(1)}
                </p>
                <div>
                  <Rating value={data.average || 0} />
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                    {data.count} {data.count === 1 ? 'account' : 'accounts'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-10 max-w-[32ch] text-[14px] leading-relaxed text-ink-3">
              No accounts published for this composition yet. If you have worn
              it, the house would like to hear how it behaved.
            </p>
          )}

          <MagneticButton
            onClick={() => setFormOpen((v) => !v)}
            className="mt-10"
            cursorLabel="Write"
          >
            {formOpen ? 'Close' : 'Write an account'}
          </MagneticButton>
        </div>

        {/* ── List + form ── */}
        <div className="lg:col-span-7 lg:col-start-6">
          <AnimatePresence>
            {formOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE.luxe }}
                className="overflow-hidden"
              >
                <ReviewForm
                  productId={productId}
                  productName={productName}
                  defaultName={customer?.name || ''}
                  isAuthenticated={isAuthenticated}
                  onDone={() => {
                    setFormOpen(false);
                    load();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-4">
              Loading accounts…
            </p>
          ) : data.reviews.length === 0 ? (
            <p className="border-t border-hairline/50 pt-10 font-display text-xl font-light text-ink-3">
              Be the first to write about {productName}.
            </p>
          ) : (
            <ul className="divide-y divide-hairline/40 border-t border-hairline/50">
              {data.reviews.map((review, i) => (
                <motion.li
                  key={review._id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.8, ease: EASE.luxe, delay: (i % 4) * 0.06 }}
                  className="py-9"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Rating value={review.rating} />
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                      {new Date(review.createdAt).toLocaleDateString('en-PK', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {review.title && (
                    <h3 className="mt-5 font-display text-2xl font-light">{review.title}</h3>
                  )}

                  <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink-2">
                    {review.body}
                  </p>

                  <p className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                    <span className="text-ink-3">{review.name}</span>
                    {review.location && <span>· {review.location}</span>}
                    {review.verified && (
                      <span className="border border-[var(--accent)]/50 px-2 py-1 text-accent">
                        Verified purchase
                      </span>
                    )}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({ productId, productName, defaultName, isAuthenticated, onDone }) {
  const [form, setForm] = useState({
    rating: 5,
    title: '',
    body: '',
    name: defaultName,
    location: '',
  });
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setState('sending');
    setMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save your account.');
      setState('done');
      setMessage(data.message);
      setTimeout(onDone, 2600);
    } catch (err) {
      setState('error');
      setMessage(err.message);
    }
  }

  if (state === 'done') {
    return (
      <div className="mb-12 border border-[var(--accent)]/40 bg-surface p-8">
        <p className="font-display text-2xl font-light text-accent">Thank you.</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mb-14 border border-hairline/60 bg-surface p-8">
      <p className="eyebrow-muted">Writing about {productName}</p>

      {/* Rating */}
      <fieldset className="mt-7">
        <legend className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
          Rating
        </legend>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, rating: n })}
              aria-label={`${n} out of 5`}
              aria-pressed={form.rating === n}
              className={cn(
                'h-10 w-10 border font-mono text-xs transition-colors duration-400',
                form.rating >= n
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-accent'
                  : 'border-hairline text-ink-4 hover:border-hairline'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        {!isAuthenticated && (
          <Field
            label="Your name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
        )}
        <Field
          label="City (optional)"
          value={form.location}
          onChange={(v) => setForm({ ...form, location: v })}
        />
      </div>

      <div className="mt-7">
        <Field
          label="Headline (optional)"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
        />
      </div>

      <div className="mt-7">
        <label className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
          Your account
        </label>
        <textarea
          required
          rows={5}
          minLength={10}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="How did it wear? How long did it hold?"
          className="field-luxe resize-none text-[15px]"
        />
      </div>

      {message && state === 'error' && (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-red-400">
          {message}
        </p>
      )}

      <div className="mt-9 flex flex-wrap items-center gap-6">
        <MagneticButton type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending' : 'Submit account'}
        </MagneticButton>
        <p className="max-w-[34ch] text-[12px] leading-relaxed text-ink-4">
          Accounts are read by the house before they are published.
        </p>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
        {label}
      </label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-luxe text-[15px]"
      />
    </div>
  );
}
