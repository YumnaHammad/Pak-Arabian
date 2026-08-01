'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPKR, cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/content/site';
import ConfirmButton from './ConfirmButton';
import { toCSV, downloadCSV } from '@/lib/csv';

const COLUMNS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price', sortable: true, align: 'right' },
  { key: 'stock', label: 'Stock', sortable: true, align: 'right' },
  { key: 'active', label: 'Status', sortable: true },
];

/**
 * Inventory table.
 *
 * Every capability the previous page had — list, edit, delete — plus search,
 * column sorting, status filtering, multi-select with bulk actions, and CSV
 * export. Filtering happens in memory: the whole catalogue is a few dozen
 * documents, and a round trip per keystroke would be slower than the filter.
 */
export default function ProductsTable({ products = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (status === 'active' && !p.active) return false;
      if (status === 'hidden' && p.active) return false;
      if (status === 'low' && !(p.stock <= 5)) return false;
      if (status === 'out' && p.stock !== 0) return false;
      if (!term) return true;
      return (
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.slug?.toLowerCase().includes(term)
      );
    });

    const { key, dir } = sort;
    const factor = dir === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      if (typeof av === 'boolean') return (Number(av) - Number(bv)) * factor;
      return String(av ?? '').localeCompare(String(bv ?? '')) * factor;
    });
  }, [products, query, category, status, sort]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r._id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r._id)));
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function applySort(key) {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc',
    }));
  }

  async function bulk(action, value) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: [...selected], value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteOne(id) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete the product.');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function exportCSV() {
    const csv = toCSV(rows, [
      { key: 'name', label: 'Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'slug', label: 'Slug' },
      { key: 'category', label: 'Category' },
      { key: 'concentration', label: 'Concentration' },
      { key: 'volumeMl', label: 'Volume (ml)' },
      { key: 'price', label: 'Price (PKR)' },
      { key: 'stock', label: 'Stock' },
      { key: 'featured', label: 'Featured' },
      { key: 'active', label: 'Active' },
    ]);
    downloadCSV(csv, `pakarabian-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="space-y-5">
      {/* ── Heading ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Inventory</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {rows.length} of {products.length} products
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="admin-btn">
            Export CSV
          </button>
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            Add product
          </Link>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="admin-card flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, SKU or slug…"
            className="admin-input pl-9"
            aria-label="Search products"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="admin-input w-auto"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.filter((c) => c.value).map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="admin-input w-auto"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
          <option value="low">Low stock (≤5)</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {/* ── Bulk bar ── */}
      {selected.size > 0 && (
        <div className="admin-card flex flex-wrap items-center gap-2.5 border-[var(--accent)]/35 p-3">
          <span className="mr-2 text-[13px] text-ink-2">
            {selected.size} selected
          </span>
          <button onClick={() => bulk('activate')} disabled={busy} className="admin-btn">
            Activate
          </button>
          <button onClick={() => bulk('deactivate')} disabled={busy} className="admin-btn">
            Hide
          </button>
          <button onClick={() => bulk('feature', true)} disabled={busy} className="admin-btn">
            Feature
          </button>
          <button onClick={() => bulk('feature', false)} disabled={busy} className="admin-btn">
            Unfeature
          </button>
          <ConfirmButton
            onConfirm={() => bulk('delete')}
            disabled={busy}
            className="admin-btn admin-btn-danger"
            confirmLabel={`Delete ${selected.size}?`}
          >
            Delete
          </ConfirmButton>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[12px] text-ink-4 hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      {/* ── Table ── */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all products"
                    className="accent-[var(--accent)]"
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className={col.align === 'right' ? 'text-right' : undefined}>
                    {col.sortable ? (
                      <button
                        onClick={() => applySort(col.key)}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                      >
                        {col.label}
                        <span className={cn('text-[9px]', sort.key === col.key ? 'text-[var(--accent)]' : 'text-ink-4')}>
                          {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="py-14 text-center text-ink-4">
                    {products.length === 0
                      ? 'No products yet. Add the first one.'
                      : 'No products match these filters.'}
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p._id} className={selected.has(p._id) ? 'bg-elevated/70' : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(p._id)}
                        onChange={() => toggleOne(p._id)}
                        aria-label={`Select ${p.name}`}
                        className="accent-[var(--accent)]"
                      />
                    </td>

                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-elevated">
                          {p.images?.[0] && (
                            <Image src={p.images[0]} alt="" fill sizes="32px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="truncate text-[11px] text-ink-4">
                            {p.concentration} · {p.volumeMl}ml
                            {p.featured && <span className="ml-2 text-[var(--accent)]">Featured</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="font-mono text-[12px] text-ink-3">{p.sku}</td>
                    <td className="capitalize text-ink-2">{p.category}</td>
                    <td className="text-right font-mono tabular-nums">{formatPKR(p.price)}</td>
                    <td className="text-right">
                      <span
                        className={cn(
                          'font-mono tabular-nums',
                          p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-[var(--accent)]' : 'text-ink-2'
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-[12px]',
                          p.active ? 'text-emerald-400' : 'text-ink-4'
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', p.active ? 'bg-emerald-400' : 'bg-ink-4')} />
                        {p.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="text-[12px] text-ink-3 hover:text-ink"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="text-[12px] text-accent hover:underline"
                        >
                          Edit
                        </Link>
                        <ConfirmButton
                          onConfirm={() => deleteOne(p._id)}
                          disabled={busy}
                          className="text-[12px] text-ink-3 hover:text-red-400"
                          confirmLabel="Sure?"
                        >
                          Delete
                        </ConfirmButton>
                      </div>
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
