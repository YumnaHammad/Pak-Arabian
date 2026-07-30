'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const TONES = {
  pending: 'border-amber-500/30 text-amber-400',
  processing: 'border-blue-500/30 text-blue-400',
  shipped: 'border-violet-500/30 text-violet-400',
  delivered: 'border-emerald-500/30 text-emerald-400',
  cancelled: 'border-red-500/30 text-red-400',
};

/**
 * Inline status control.
 *
 * Writes through `PUT /api/orders/[id]` with `{ status }` — the same contract
 * the previous select used. Optimistic locally, reverted if the write fails,
 * so a dropped connection cannot leave the table showing a status the database
 * never accepted.
 */
export default function OrderStatusSelect({ id, status: initial }) {
  const router = useRouter();
  const [status, setStatus] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onChange(e) {
    const next = e.target.value;
    const previous = status;

    setStatus(next);
    setSaving(true);
    setFailed(false);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setStatus(previous);
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={onChange}
        disabled={saving}
        aria-label="Order status"
        className={cn(
          'cursor-pointer appearance-none rounded-full border bg-transparent py-1 pl-3 pr-7 text-[12px] capitalize outline-none transition-opacity',
          TONES[status] || TONES.pending,
          saving && 'opacity-50'
        )}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="bg-elevated capitalize text-ink">
            {s}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] opacity-60"
      >
        ▾
      </span>
      {failed && (
        <span role="alert" className="absolute left-0 top-full mt-1 whitespace-nowrap text-[10px] text-red-400">
          Save failed
        </span>
      )}
    </div>
  );
}
