'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPKR, cn } from '@/lib/utils';
import ConfirmButton from './ConfirmButton';

const BLANK = {
  code: '',
  description: '',
  type: 'percent',
  value: 10,
  minSpend: 0,
  maxDiscount: 0,
  usageLimit: 0,
  expiresAt: '',
  active: true,
};

/**
 * Discount codes.
 *
 * Codes are created and toggled here, then evaluated server-side at checkout —
 * the panel never computes a discount, so what a customer is charged always
 * comes from `Coupon.evaluate` on the server.
 */
export default function CouponsManager({ initial = [] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState(BLANK);
  const [open, setOpen] = useState(initial.length === 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, expiresAt: form.expiresAt || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create the code.');
      setCoupons((prev) => [data.coupon, ...prev]);
      setForm(BLANK);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(coupon) {
    const next = !coupon.active;
    setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? { ...c, active: next } : c)));

    const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: next }),
    }).catch(() => null);

    if (!res?.ok) {
      // Roll back so the table never shows a state the database rejected.
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? { ...c, active: !next } : c)));
      setError('Could not update that code.');
    }
  }

  async function remove(id) {
    setCoupons((prev) => prev.filter((c) => c._id !== id));
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Discounts</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {coupons.filter((c) => c.active).length} active of {coupons.length}
          </p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="admin-btn admin-btn-primary">
          {open ? 'Close' : 'New code'}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      {/* ── Create ── */}
      {open && (
        <form onSubmit={create} className="admin-card p-5">
          <h2 className="text-[13px] font-medium">New discount code</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="admin-label">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
                required
                className="admin-input font-mono uppercase"
              />
            </div>

            <div>
              <label className="admin-label">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="admin-input"
              >
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
              </select>
            </div>

            <div>
              <label className="admin-label">
                {form.type === 'percent' ? 'Percent' : 'Amount (PKR)'}
              </label>
              <input
                type="number"
                min={0}
                max={form.type === 'percent' ? 100 : undefined}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
                className="admin-input font-mono"
              />
            </div>

            <div>
              <label className="admin-label">Minimum spend</label>
              <input
                type="number"
                min={0}
                value={form.minSpend}
                onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
                className="admin-input font-mono"
              />
            </div>

            {form.type === 'percent' && (
              <div>
                <label className="admin-label">Cap (0 = uncapped)</label>
                <input
                  type="number"
                  min={0}
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  className="admin-input font-mono"
                />
              </div>
            )}

            <div>
              <label className="admin-label">Usage limit (0 = unlimited)</label>
              <input
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="admin-input font-mono"
              />
            </div>

            <div>
              <label className="admin-label">Expires</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="admin-input"
              />
            </div>

            <div className="sm:col-span-2 xl:col-span-4">
              <label className="admin-label">Description (shown at checkout)</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="10% off a first order"
                className="admin-input"
              />
            </div>
          </div>

          <button type="submit" disabled={busy} className="admin-btn admin-btn-primary mt-5">
            {busy ? 'Creating…' : 'Create code'}
          </button>
        </form>
      )}

      {/* ── Table ── */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Conditions</th>
                <th className="text-right">Used</th>
                <th>Expires</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-ink-4">
                    No discount codes yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  const exhausted = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
                  return (
                    <tr key={c._id}>
                      <td>
                        <p className="font-mono font-medium">{c.code}</p>
                        {c.description && (
                          <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-ink-4">
                            {c.description}
                          </p>
                        )}
                      </td>
                      <td className="text-ink-2">
                        {c.type === 'percent' ? `${c.value}%` : formatPKR(c.value)}
                        {c.type === 'percent' && c.maxDiscount > 0 && (
                          <span className="block text-[11px] text-ink-4">
                            capped at {formatPKR(c.maxDiscount)}
                          </span>
                        )}
                      </td>
                      <td className="text-[12px] text-ink-3">
                        {c.minSpend > 0 ? `Min ${formatPKR(c.minSpend)}` : 'No minimum'}
                      </td>
                      <td className="text-right font-mono tabular-nums text-ink-2">
                        {c.usedCount}
                        {c.usageLimit > 0 && <span className="text-ink-4"> / {c.usageLimit}</span>}
                      </td>
                      <td className="whitespace-nowrap text-[12px] text-ink-3">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => toggle(c)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                            !c.active || expired || exhausted
                              ? 'border-hairline text-ink-4'
                              : 'border-emerald-500/30 text-emerald-400'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              !c.active || expired || exhausted ? 'bg-ink-4' : 'bg-emerald-400'
                            )}
                          />
                          {expired ? 'Expired' : exhausted ? 'Used up' : c.active ? 'Active' : 'Paused'}
                        </button>
                      </td>
                      <td className="text-right">
                        <ConfirmButton
                          onConfirm={() => remove(c._id)}
                          className="text-[12px] text-ink-3 hover:text-red-400"
                          confirmLabel="Sure?"
                        >
                          Delete
                        </ConfirmButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
