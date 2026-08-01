'use client';
import { useState, useMemo } from 'react';
import { formatPKR, cn } from '@/lib/utils';
import { toCSV, downloadCSV } from '@/lib/csv';
import StatCard from './StatCard';

/**
 * Registered customers.
 *
 * Read-only by design: there is no reason for the panel to edit somebody's
 * account, and every field here is either theirs to change or derived from
 * their orders.
 */
export default function CustomersTable({ customers = [], subscriberCount = 0, guestOrders = 0 }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.phone?.toLowerCase().includes(term)
        )
      : customers;

    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av ?? '').localeCompare(String(bv ?? '')) * factor;
    });
  }, [customers, query, sort]);

  const totalSpend = customers.reduce((s, c) => s + c.spend, 0);
  const returning = customers.filter((c) => c.orders > 1).length;

  function applySort(key) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  }

  function exportCSV() {
    const csv = toCSV(rows, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'orders', label: 'Orders' },
      { key: 'spend', label: 'Lifetime spend (PKR)' },
      { key: 'addresses', label: 'Saved addresses' },
      { key: 'wishlist', label: 'Wishlist items' },
      { key: 'marketingOptIn', label: 'Newsletter' },
    ]);
    downloadCSV(csv, `pakarabian-customers-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Customers</h1>
          <p className="mt-1 text-[13px] text-ink-3">{customers.length} registered accounts</p>
        </div>
        <button onClick={exportCSV} className="admin-btn">
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Accounts" value={customers.length} hint={`${returning} have ordered more than once`} />
        <StatCard label="Account revenue" value={formatPKR(totalSpend)} hint="Excluding cancelled" accent />
        <StatCard label="Newsletter" value={subscriberCount} hint="Active subscribers" />
        <StatCard label="Guest orders" value={guestOrders} hint="Placed without an account" />
      </div>

      <div className="admin-card p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or phone…"
          className="admin-input"
          aria-label="Search customers"
        />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <SortableTh label="Customer" onClick={() => applySort('name')} active={sort.key === 'name'} dir={sort.dir} />
                <th>Contact</th>
                <SortableTh label="Orders" align="right" onClick={() => applySort('orders')} active={sort.key === 'orders'} dir={sort.dir} />
                <SortableTh label="Lifetime" align="right" onClick={() => applySort('spend')} active={sort.key === 'spend'} dir={sort.dir} />
                <th className="text-right">Saved</th>
                <th>Newsletter</th>
                <SortableTh label="Joined" onClick={() => applySort('createdAt')} active={sort.key === 'createdAt'} dir={sort.dir} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-ink-4">
                    {customers.length === 0
                      ? 'No registered accounts yet. Guest checkout does not create one.'
                      : 'No customers match that search.'}
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium">{c.name}</td>
                    <td>
                      <a href={`mailto:${c.email}`} className="block text-[12px] text-accent hover:underline">
                        {c.email}
                      </a>
                      {c.phone && <span className="text-[11px] text-ink-4">{c.phone}</span>}
                    </td>
                    <td className="text-right font-mono tabular-nums text-ink-2">{c.orders}</td>
                    <td className="text-right font-mono tabular-nums">
                      {c.spend > 0 ? formatPKR(c.spend) : <span className="text-ink-4">—</span>}
                    </td>
                    <td className="text-right text-[12px] text-ink-3">
                      {c.addresses} addr · {c.wishlist} saved
                    </td>
                    <td>
                      <span
                        className={cn(
                          'text-[12px]',
                          c.marketingOptIn ? 'text-emerald-400' : 'text-ink-4'
                        )}
                      >
                        {c.marketingOptIn ? 'Subscribed' : 'No'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-[12px] text-ink-3">
                      {new Date(c.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortableTh({ label, onClick, active, dir, align }) {
  return (
    <th className={align === 'right' ? 'text-right' : undefined}>
      <button onClick={onClick} className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
        {label}
        <span className={cn('text-[9px]', active ? 'text-[var(--accent)]' : 'text-ink-4')}>
          {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}
