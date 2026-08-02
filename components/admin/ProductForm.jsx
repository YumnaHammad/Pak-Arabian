'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/content/site';
import { formatPKR, cn } from '@/lib/utils';

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Product editor.
 *
 * Identical contract to the previous form: POST `/api/products` to create,
 * PUT `/api/products/[id]` to update, uploads via `/api/upload`, and notes
 * submitted as arrays split from comma-separated input. Reorganised into
 * sections, with a live preview of how the card will read in the storefront.
 */
export default function ProductForm({ initial }) {
  const router = useRouter();
  const fileInput = useRef(null);

  const normalizeNotes = (notes) => {
    if (!notes) return { top: '', heart: '', base: '' };
    return {
      top: Array.isArray(notes.top) ? notes.top.join(', ') : notes.top || '',
      heart: Array.isArray(notes.heart) ? notes.heart.join(', ') : notes.heart || '',
      base: Array.isArray(notes.base) ? notes.base.join(', ') : notes.base || '',
    };
  };

  const [form, setForm] = useState(
    initial
      ? { ...initial, notes: normalizeNotes(initial.notes) }
      : {
          name: '', slug: '', sku: '', price: '', volumeMl: 50,
          concentration: 'Eau de Parfum', category: 'unisex', description: '',
          stock: 0, featured: false, active: true, images: [],
          notes: { top: '', heart: '', base: '' },
        }
  );

  const [previews, setPreviews] = useState(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /* Kept apart from `error` so an upload failure can be shown at the dropzone.
     The form is long enough that a banner at the top is off-screen from here,
     which reads as the picker silently ignoring the file. */
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function uploadFiles(files) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });

      /* A 401 from the middleware and a crashed route both return non-JSON,
         which would otherwise surface as an unrelated JSON parse error. */
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error ||
            (res.status === 401
              ? 'Your admin session expired — sign in again.'
              : `Upload failed (${res.status}).`)
        );
      }

      setForm((f) => ({ ...f, images: [...(f.images || []), ...data.urls] }));
      setPreviews((prev) => [...prev, ...data.urls]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  /** Copies the picked files before clearing the input: resetting `value`
   *  empties the live FileList, and without the reset choosing the same file
   *  twice fires no `change` event at all. */
  function handlePicked(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    uploadFiles(picked);
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  /** Promotes an image to first position — the first image is the cover. */
  function makeCover(idx) {
    setForm((f) => {
      const next = [...f.images];
      const [moved] = next.splice(idx, 1);
      return { ...f, images: [moved, ...next] };
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      return [moved, ...next];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const splitNotes = (value) =>
      typeof value === 'string'
        ? value.split(',').map((s) => s.trim()).filter(Boolean)
        : value;

    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      volumeMl: Number(form.volumeMl),
      stock: Number(form.stock),
      notes: {
        top: splitNotes(form.notes.top),
        heart: splitNotes(form.notes.heart),
        base: splitNotes(form.notes.base),
      },
    };

    try {
      const url = initial?._id ? `/api/products/${initial._id}` : '/api/products';
      const res = await fetch(url, {
        method: initial?._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Heading ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">
            {initial?._id ? `Edit ${initial.name}` : 'Add product'}
          </h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {initial?._id ? `SKU ${initial.sku}` : 'A new composition for the library'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="admin-btn">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="admin-btn admin-btn-primary"
          >
            {loading ? 'Saving…' : initial?._id ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* ══════════ Main column ══════════ */}
        <div className="space-y-5 xl:col-span-2">
          {/* Identity */}
          <Section title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required value={form.name} onChange={(v) => set('name', v)} />
              <Field label="SKU" required value={form.sku} onChange={(v) => set('sku', v)} mono />
              <Field
                label="Slug"
                value={form.slug}
                onChange={(v) => set('slug', v)}
                placeholder={form.name ? slugify(form.name) : 'auto from name'}
                hint="URL path"
                mono
              />
              <div>
                <label className="admin-label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="admin-input"
                >
                  {CATEGORIES.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="admin-label">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="How does it open, how does it dry down?"
                className="admin-input resize-y"
              />
            </div>
          </Section>

          {/* Composition */}
          <Section title="Composition" hint="Comma-separated. These drive the pyramid on the product page.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Top notes"
                value={form.notes.top}
                onChange={(v) => set('notes', { ...form.notes, top: v })}
                placeholder="Bergamot, Pink Pepper"
              />
              <Field
                label="Heart notes"
                value={form.notes.heart}
                onChange={(v) => set('notes', { ...form.notes, heart: v })}
                placeholder="Labdanum, Iris"
              />
              <Field
                label="Base notes"
                value={form.notes.base}
                onChange={(v) => set('notes', { ...form.notes, base: v })}
                placeholder="Amber, Vetiver"
              />
            </div>
          </Section>

          {/* Photography */}
          <Section title="Photography" hint="The first image is the cover shown in the grid.">
            {/* Outside the clickable box on purpose: nested, the synthetic
                click from `fileInput.click()` bubbles back into the box's own
                onClick handler. */}
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePicked}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                uploadFiles(Array.from(e.dataTransfer.files || []));
              }}
              onClick={() => fileInput.current?.click()}
              className={cn(
                'cursor-pointer rounded-lg border-2 border-dashed p-9 text-center transition-colors',
                dragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-hairline hover:border-[var(--accent)]/50'
              )}
            >
              {uploading ? (
                <p className="text-[13px] text-[var(--accent)]">Uploading…</p>
              ) : (
                <>
                  <p className="text-[13px] text-ink-2">Click to upload, or drop images here</p>
                  <p className="mt-1.5 text-[11px] text-ink-4">PNG, JPG or WEBP · max 4MB each · multiple allowed</p>
                </>
              )}
            </div>

            {uploadError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
                {uploadError}
              </p>
            )}

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {previews.map((url, i) => (
                  <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-hairline">
                    <Image src={url} alt={`Image ${i + 1}`} fill sizes="160px" className="object-cover" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-obsidian/75 opacity-0 transition-opacity group-hover:opacity-100">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(i)}
                          className="text-[11px] text-cream hover:text-[var(--accent)]"
                        >
                          Make cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="text-[11px] text-cream hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>

                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-medium text-obsidian">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ══════════ Side column ══════════ */}
        <div className="space-y-5">
          <Section title="Pricing & stock">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field
                label="Price (PKR)"
                required
                type="number"
                value={form.price}
                onChange={(v) => set('price', v)}
                hint={form.price ? formatPKR(form.price) : undefined}
                mono
              />
              <Field
                label="Stock"
                required
                type="number"
                value={form.stock}
                onChange={(v) => set('stock', v)}
                hint={Number(form.stock) <= 5 ? 'Low — will show a scarcity badge' : undefined}
                mono
              />
              <Field label="Volume (ml)" type="number" value={form.volumeMl} onChange={(v) => set('volumeMl', v)} mono />
              <Field label="Concentration" value={form.concentration} onChange={(v) => set('concentration', v)} />
            </div>
          </Section>

          <Section title="Visibility">
            <Toggle
              checked={form.active}
              onChange={(v) => set('active', v)}
              label="Active"
              hint="Visible in the storefront"
            />
            <div className="mt-4">
              <Toggle
                checked={form.featured}
                onChange={(v) => set('featured', v)}
                label="Featured"
                hint="Appears in the signature row on the homepage"
              />
            </div>
          </Section>

          {/* Live preview */}
          <Section title="Storefront preview">
            <div className="rounded-lg border border-hairline p-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded bg-elevated">
                {previews[0] ? (
                  <Image src={previews[0]} alt="" fill sizes="240px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] text-ink-4">
                    No cover image
                  </div>
                )}
                {Number(form.stock) === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-[9px] uppercase tracking-wider text-base">
                    Sold out
                  </span>
                )}
                {Number(form.stock) > 0 && Number(form.stock) <= 5 && (
                  <span className="absolute left-2 top-2 rounded bg-[var(--accent)] px-2 py-1 text-[9px] uppercase tracking-wider text-obsidian">
                    Only {form.stock} left
                  </span>
                )}
              </div>
              <p className="mt-3 truncate text-[15px]" style={{ fontFamily: 'var(--font-display)' }}>
                {form.name || 'Untitled composition'}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-4">
                {form.concentration} · {form.volumeMl}ml
              </p>
              <p className="mt-1.5 font-mono text-[13px] tabular-nums text-ink-2">
                {formatPKR(form.price || 0)}
              </p>
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="admin-card p-5">
      <h2 className="text-[13px] font-medium">{title}</h2>
      {hint && <p className="mt-1 text-[12px] text-ink-4">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', required, placeholder, hint, mono }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="admin-label">{label}</label>
        {hint && <span className="mb-2 text-[11px] text-ink-4">{hint}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={cn('admin-input', mono && 'font-mono')}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors',
          checked ? 'border-[var(--accent)] bg-[var(--accent)]/25' : 'border-hairline bg-elevated'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all',
            checked ? 'left-[1.15rem] bg-[var(--accent)]' : 'left-1 bg-ink-4'
          )}
        />
      </button>
      <span>
        <span className="block text-[13px]">{label}</span>
        {hint && <span className="block text-[11px] text-ink-4">{hint}</span>}
      </span>
    </label>
  );
}
