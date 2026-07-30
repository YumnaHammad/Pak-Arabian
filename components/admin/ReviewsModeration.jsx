'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import ConfirmButton from './ConfirmButton';

/**
 * Review moderation.
 *
 * Reviews arrive unapproved and are invisible on the storefront until someone
 * here says otherwise. Pending items sort to the top so the queue is the first
 * thing on screen.
 */
export default function ReviewsModeration({ initial = [] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => !r.approved).length,
      published: reviews.filter((r) => r.approved).length,
      all: reviews.length,
    }),
    [reviews]
  );

  const rows = reviews.filter((r) =>
    filter === 'all' ? true : filter === 'pending' ? !r.approved : r.approved
  );

  async function setApproved(review, approved) {
    setReviews((prev) => prev.map((r) => (r._id === review._id ? { ...r, approved } : r)));

    const res = await fetch(`/api/admin/reviews/${review._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    }).catch(() => null);

    if (!res?.ok) {
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, approved: !approved } : r))
      );
      setError('Could not update that review.');
      return;
    }
    router.refresh();
  }

  async function remove(id) {
    setReviews((prev) => prev.filter((r) => r._id !== id));
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Reviews</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {counts.pending} awaiting moderation · {counts.published} published
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'pending', label: 'Pending', count: counts.pending },
          { id: 'published', label: 'Published', count: counts.published },
          { id: 'all', label: 'All', count: counts.all },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[12px] transition-colors',
              filter === tab.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-hairline text-ink-2 hover:bg-elevated'
            )}
          >
            {tab.label} <span className="ml-1.5 text-ink-4">{tab.count}</span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      {/* List */}
      {rows.length === 0 ? (
        <div className="admin-card p-14 text-center text-[13px] text-ink-4">
          {filter === 'pending' ? 'Nothing waiting. The queue is clear.' : 'No reviews here.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r._id} className="admin-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[13px] text-[var(--accent)]">
                      {'★'.repeat(r.rating)}
                      <span className="text-ink-4">{'★'.repeat(5 - r.rating)}</span>
                    </span>

                    {r.product?.slug ? (
                      <Link
                        href={`/product/${r.product.slug}`}
                        target="_blank"
                        className="text-[13px] text-ink-2 hover:text-accent"
                      >
                        {r.product.name} ↗
                      </Link>
                    ) : (
                      <span className="text-[13px] text-ink-4">Product removed</span>
                    )}

                    {r.verified && (
                      <span className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-400">
                        Verified purchase
                      </span>
                    )}

                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px]',
                        r.approved
                          ? 'border-emerald-500/30 text-emerald-400'
                          : 'border-amber-500/30 text-amber-400'
                      )}
                    >
                      {r.approved ? 'Published' : 'Pending'}
                    </span>
                  </div>

                  {r.title && <p className="mt-3 text-[15px] font-medium">{r.title}</p>}
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-2">{r.body}</p>

                  <p className="mt-3 text-[11px] text-ink-4">
                    {r.name}
                    {r.location && ` · ${r.location}`} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {r.approved ? (
                    <button onClick={() => setApproved(r, false)} className="admin-btn">
                      Unpublish
                    </button>
                  ) : (
                    <button onClick={() => setApproved(r, true)} className="admin-btn admin-btn-primary">
                      Publish
                    </button>
                  )}
                  <ConfirmButton
                    onConfirm={() => remove(r._id)}
                    className="admin-btn admin-btn-danger"
                    confirmLabel="Delete?"
                  >
                    Delete
                  </ConfirmButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
