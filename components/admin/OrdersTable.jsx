'use client';
import { useState, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPKR, shortId, cn } from '@/lib/utils';
import { toCSV, downloadCSV } from '@/lib/csv';
import StatusBadge from './StatusBadge';
import OrderStatusSelect from './OrderStatusSelect';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

/**
 * Orders table.
 *
 * The status control still writes through `PUT /api/orders/[id]` exactly as
 * before. Added around it: search across reference, name, email and phone;
 * status and period filters; an expandable line-item view so a phone enquiry
 * can be answered without leaving the page; and CSV export.
 */
export default function OrdersTable({ orders = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();

    const cutoff = (() => {
      if (period === 'all') return null;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (period === '7' ? 7 : period === '30' ? 30 : 90));
      return d;
    })();

    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false;
      if (cutoff && new Date(o.createdAt) < cutoff) return false;
      if (!term) return true;
      return (
        String(o._id).toLowerCase().includes(term) ||
        o.customer?.name?.toLowerCase().includes(term) ||
        o.customer?.email?.toLowerCase().includes(term) ||
        o.customer?.phone?.toLowerCase().includes(term) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(term))
      );
    });
  }, [orders, query, status, period]);

  const revenue = rows
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  function exportCSV() {
    const flat = rows.map((o) => ({
      reference: shortId(o._id),
      date: new Date(o.createdAt).toISOString().slice(0, 10),
      name: o.customer?.name || '',
      email: o.customer?.email || '',
      phone: o.customer?.phone || '',
      address: `${o.customer?.address || ''}, ${o.customer?.city || ''}`.replace(/^, |, $/g, ''),
      items: o.items.map((i) => `${i.name} x${i.qty}`).join(' | '),
      discount: o.discount || 0,
      total: o.total,
      status: o.status,
    }));

    const csv = toCSV(flat, [
      { key: 'reference', label: 'Reference' },
      { key: 'date', label: 'Date' },
      { key: 'name', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'items', label: 'Items' },
      { key: 'discount', label: 'Discount (PKR)' },
      { key: 'total', label: 'Total (PKR)' },
      { key: 'status', label: 'Status' },
    ]);

    downloadCSV(csv, `pakarabian-orders-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="space-y-5">
      {/* ── Heading ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Orders</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {rows.length} shown · {formatPKR(revenue)} excluding cancelled
          </p>
        </div>
        <button onClick={exportCSV} className="admin-btn">
          Export CSV
        </button>
      </div>

      {/* ── Status chips ── */}
      <div className="flex flex-wrap gap-2">
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>
          All <span className="ml-1.5 text-ink-4">{orders.length}</span>
        </Chip>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              <span className="capitalize">{s}</span>
              <span className="ml-1.5 text-ink-4">{count}</span>
            </Chip>
          );
        })}
      </div>

      {/* ── Controls ── */}
      <div className="admin-card flex flex-wrap items-center gap-3 p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reference, customer, email, phone or item…"
          className="admin-input min-w-[220px] flex-1"
          aria-label="Search orders"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="admin-input w-auto"
          aria-label="Filter by period"
        >
          <option value="all">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-8" />
                <th>Reference</th>
                <th>Customer</th>
                <th>Items</th>
                <th className="text-right">Total</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-ink-4">
                    {orders.length === 0 ? 'No orders yet.' : 'No orders match these filters.'}
                  </td>
                </tr>
              ) : (
                rows.map((o) => {
                  const open = expanded === o._id;
                  return (
                    <Fragment key={o._id}>
                      <tr className={open ? 'bg-elevated/70' : undefined}>
                        <td>
                          <button
                            onClick={() => setExpanded(open ? null : o._id)}
                            aria-expanded={open}
                            aria-label={open ? 'Hide details' : 'Show details'}
                            className={cn(
                              'text-ink-4 transition-transform hover:text-ink',
                              open && 'rotate-90 text-[var(--accent)]'
                            )}
                          >
                            ›
                          </button>
                        </td>
                        <td className="font-mono text-[12px] text-ink-2">{shortId(o._id)}</td>
                        <td>
                          <p className="max-w-[180px] truncate font-medium">
                            {o.customer?.name || '—'}
                          </p>
                          <p className="max-w-[180px] truncate text-[11px] text-ink-4">
                            {o.customer?.city}
                          </p>
                        </td>
                        <td className="text-ink-2">
                          {o.items.reduce((s, i) => s + i.qty, 0)}
                        </td>
                        <td className="text-right font-mono tabular-nums">
                          {formatPKR(o.total)}
                          {o.discount > 0 && (
                            <span className="block text-[11px] text-[var(--accent)]">
                              −{formatPKR(o.discount)}
                            </span>
                          )}
                        </td>
                        <td>
                          <OrderStatusSelect id={o._id} status={o.status} />
                        </td>
                        <td className="whitespace-nowrap text-[12px] text-ink-3">
                          {new Date(o.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })}
                        </td>
                      </tr>

                      {open && (
                        <tr className="bg-elevated/40">
                          <td colSpan={7} className="px-5 py-6">
                            <div className="grid gap-8 md:grid-cols-3">
                              <div>
                                <p className="admin-label">Contact</p>
                                <p className="text-[13px]">{o.customer?.name}</p>
                                <a
                                  href={`mailto:${o.customer?.email}`}
                                  className="block text-[13px] text-accent hover:underline"
                                >
                                  {o.customer?.email}
                                </a>
                                <a
                                  href={`tel:${o.customer?.phone}`}
                                  className="block text-[13px] text-ink-2 hover:text-ink"
                                >
                                  {o.customer?.phone}
                                </a>
                              </div>

                              <div>
                                <p className="admin-label">Delivering to</p>
                                <p className="text-[13px] leading-relaxed text-ink-2">
                                  {o.customer?.address}
                                  <br />
                                  {o.customer?.city}
                                </p>
                                {o.note && (
                                  <p className="mt-3 text-[12px] italic text-ink-4">“{o.note}”</p>
                                )}
                              </div>

                              <div>
                                <p className="admin-label">Items</p>
                                <ul className="space-y-1.5">
                                  {o.items.map((i, idx) => (
                                    <li key={idx} className="flex justify-between gap-4 text-[13px]">
                                      <span className="text-ink-2">
                                        {i.name} <span className="text-ink-4">×{i.qty}</span>
                                      </span>
                                      <span className="shrink-0 font-mono tabular-nums text-ink-3">
                                        {formatPKR(i.price * i.qty)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                {o.couponCode && (
                                  <p className="mt-3 text-[12px] text-[var(--accent)]">
                                    Code {o.couponCode} · −{formatPKR(o.discount)}
                                  </p>
                                )}
                                <Link
                                  href={`/order/${o._id}`}
                                  target="_blank"
                                  className="mt-4 inline-block text-[12px] text-accent hover:underline"
                                >
                                  Open customer view ↗
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[12px] transition-colors',
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'border-hairline text-ink-2 hover:bg-elevated'
      )}
    >
      {children}
    </button>
  );
}
