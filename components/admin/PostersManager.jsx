'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import ConfirmButton from './ConfirmButton';

const BLANK = {
  image: '',
  title: '',
  subtitle: '',
  ctaLabel: 'Shop now',
  href: '/collection',
  alt: '',
  startsAt: '',
  endsAt: '',
  active: true,
};

/** Live / Scheduled / Expired / Paused, computed the same way the site does. */
function statusOf(p) {
  const now = new Date();
  if (!p.active) return { label: 'Paused', tone: 'border-hairline text-ink-4' };
  if (p.startsAt && now < new Date(p.startsAt))
    return { label: 'Scheduled', tone: 'border-blue-500/40 text-blue-400' };
  if (p.endsAt && now > new Date(p.endsAt))
    return { label: 'Expired', tone: 'border-red-500/40 text-red-400' };
  return { label: 'Live', tone: 'border-emerald-500/40 text-emerald-400' };
}

export default function PostersManager({ initial = [] }) {
  const router = useRouter();
  const [posters, setPosters] = useState(initial);
  const [form, setForm] = useState(BLANK);
  const [open, setOpen] = useState(initial.length === 0);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  async function upload(files) {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('files', files[0]);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });

      /* A 401 from the middleware and a crashed route both return non-JSON. */
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error ||
            (res.status === 401
              ? 'Your admin session expired — sign in again.'
              : `Upload failed (${res.status}).`)
        );
      }

      setForm((f) => ({ ...f, image: data.urls[0] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  /** Copies the picked file before clearing the input: resetting `value`
   *  empties the live FileList, and without the reset choosing the same file
   *  twice fires no `change` event at all. */
  function handlePicked(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    upload(picked);
  }

  async function create(e) {
    e.preventDefault();
    if (!form.image) {
      setError('Upload a poster image first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/posters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sortOrder: posters.length,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the poster.');
      setPosters((prev) => [...prev, data.poster]);
      setForm(BLANK);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id, update) {
    setPosters((prev) => prev.map((p) => (p._id === id ? { ...p, ...update } : p)));
    const res = await fetch(`/api/admin/posters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    }).catch(() => null);

    if (!res?.ok) {
      setError('Could not update that poster.');
      router.refresh();
      return;
    }
    router.refresh();
  }

  async function remove(id) {
    setPosters((prev) => prev.filter((p) => p._id !== id));
    await fetch(`/api/admin/posters/${id}`, { method: 'DELETE' }).catch(() => {});
    router.refresh();
  }

  /* Reordering swaps sortOrder with the neighbour, then persists both. */
  async function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= posters.length) return;

    const next = [...posters];
    [next[index], next[target]] = [next[target], next[index]];
    setPosters(next);

    await Promise.all(
      next.map((p, i) =>
        fetch(`/api/admin/posters/${p._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: i }),
        }).catch(() => {})
      )
    );
    router.refresh();
  }

  const liveCount = posters.filter((p) => statusOf(p).label === 'Live').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Sale posters</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {liveCount} showing on the homepage · {posters.length} total
          </p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="admin-btn admin-btn-primary">
          {open ? 'Close' : 'New poster'}
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
          <h2 className="text-[13px] font-medium">New poster</h2>
          <p className="mt-1 text-[12px] text-ink-4">
            Landscape artwork works best — roughly 1600×600. Leave the text
            fields empty if your image already has the wording on it.
          </p>

          {/* Upload */}
          <div className="mt-5">
            <label className="admin-label">Poster image</label>
            {/* Outside the clickable box on purpose: nested, the synthetic
                click from `fileInput.click()` bubbles back into the box's own
                onClick handler. */}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePicked}
            />

            <div
              onClick={() => fileInput.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-hairline p-6 text-center transition-colors hover:border-[var(--accent)]/50"
            >
              {uploading ? (
                <p className="text-[13px] text-[var(--accent)]">Uploading…</p>
              ) : form.image ? (
                <div className="relative mx-auto aspect-[21/7] w-full max-w-xl overflow-hidden rounded">
                  <Image src={form.image} alt="" fill sizes="600px" className="object-cover" />
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-ink-2">Click to upload the poster</p>
                  <p className="mt-1.5 text-[11px] text-ink-4">PNG, JPG or WEBP · max 4MB</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Headline (optional)" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Eid Sale — 20% off" />
            <Field label="Sub-line (optional)" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="On every fragrance until Sunday" />
            <Field label="Button label" value={form.ctaLabel} onChange={(v) => setForm({ ...form, ctaLabel: v })} placeholder="Shop now" />
            <Field label="Links to" value={form.href} onChange={(v) => setForm({ ...form, href: v })} placeholder="/collection" />
            <Field label="Starts (optional)" type="date" value={form.startsAt} onChange={(v) => setForm({ ...form, startsAt: v })} />
            <Field label="Ends (optional)" type="date" value={form.endsAt} onChange={(v) => setForm({ ...form, endsAt: v })} />
            <div className="sm:col-span-2">
              <Field
                label="Image description (for screen readers)"
                value={form.alt}
                onChange={(v) => setForm({ ...form, alt: v })}
                placeholder="Eid sale banner showing three bottles"
              />
            </div>
          </div>

          <button type="submit" disabled={busy || uploading} className="admin-btn admin-btn-primary mt-5">
            {busy ? 'Saving…' : 'Add poster'}
          </button>
        </form>
      )}

      {/* ── List ── */}
      {posters.length === 0 ? (
        <div className="admin-card p-14 text-center text-[13px] text-ink-4">
          No posters yet. The homepage carousel stays hidden until you add one.
        </div>
      ) : (
        <ul className="space-y-3">
          {posters.map((p, i) => {
            const status = statusOf(p);
            return (
              <li key={p._id} className="admin-card flex flex-wrap items-center gap-5 p-4">
                <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded bg-elevated">
                  <Image src={p.image} alt="" fill sizes="160px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px]', status.tone)}>
                      {status.label}
                    </span>
                    <span className="text-[12px] text-ink-4">Position {i + 1}</span>
                  </div>
                  <p className="mt-2 text-[14px] font-medium">
                    {p.title || <span className="text-ink-4">No headline — artwork only</span>}
                  </p>
                  {p.subtitle && <p className="mt-0.5 text-[12px] text-ink-3">{p.subtitle}</p>}
                  <p className="mt-1.5 text-[11px] text-ink-4">
                    {p.href || 'Not clickable'}
                    {p.startsAt && ` · from ${new Date(p.startsAt).toLocaleDateString('en-PK')}`}
                    {p.endsAt && ` · until ${new Date(p.endsAt).toLocaleDateString('en-PK')}`}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="admin-btn px-3" aria-label="Move up">
                    ↑
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === posters.length - 1} className="admin-btn px-3" aria-label="Move down">
                    ↓
                  </button>
                  <button onClick={() => patch(p._id, { active: !p.active })} className="admin-btn">
                    {p.active ? 'Pause' : 'Activate'}
                  </button>
                  <ConfirmButton
                    onConfirm={() => remove(p._id)}
                    className="admin-btn admin-btn-danger"
                    confirmLabel="Delete?"
                  >
                    Delete
                  </ConfirmButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input"
      />
    </div>
  );
}
