'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import PanelEmpty from './PanelEmpty';
import MagneticButton from '@/components/ui/MagneticButton';

const BLANK = { label: 'Home', name: '', phone: '', address: '', city: '' };

export default function AddressesPanel() {
  const { customer, refresh } = useAuth();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addresses = customer?.addresses || [];

  async function call(method, body, query = '') {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/account/addresses${query}`, {
        method,
        ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      await refresh();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    const ok = await call('POST', form);
    if (ok) {
      setForm(BLANK);
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between gap-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
          {addresses.length} saved
        </p>
        <MagneticButton onClick={() => setAdding((v) => !v)} cursorLabel="Add">
          {adding ? 'Close' : 'Add address'}
        </MagneticButton>
      </div>

      {/* ── Add form ── */}
      <AnimatePresence>
        {adding && (
          <motion.form
            onSubmit={onSave}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE.luxe }}
            className="overflow-hidden"
          >
            <div className="mb-12 border border-hairline/60 bg-surface p-8">
              <div className="grid gap-7 sm:grid-cols-2">
                <Field label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Home, Office…" />
                <Field label="Recipient" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" required />
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <div className="sm:col-span-2">
                  <Field label="Street address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
                </div>
              </div>

              {error && (
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-red-400">
                  {error}
                </p>
              )}

              <MagneticButton type="submit" variant="solid" disabled={busy} className="mt-9">
                {busy ? 'Saving…' : 'Save address'}
              </MagneticButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {addresses.length === 0 && !adding ? (
        <PanelEmpty
          title="No addresses saved."
          body="Save an address and checkout fills itself in next time."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {addresses.map((a) => (
              <motion.li
                key={a._id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: EASE.luxe }}
                className={cn(
                  'border p-7 transition-colors duration-500',
                  a.isDefault ? 'border-[var(--accent)]/60' : 'border-hairline/60'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
                    {a.label}
                  </p>
                  {a.isDefault && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink-4">
                      Default
                    </span>
                  )}
                </div>

                <address className="mt-5 space-y-1 text-[15px] not-italic leading-relaxed text-ink-2">
                  <p>{a.name}</p>
                  <p className="text-ink-3">{a.address}</p>
                  <p className="text-ink-3">{a.city}</p>
                  <p className="pt-2 font-mono text-[12px] text-ink-4">{a.phone}</p>
                </address>

                <div className="mt-7 flex items-center gap-5 border-t border-hairline/40 pt-5">
                  {!a.isDefault && (
                    <button
                      onClick={() => call('PUT', { id: a._id })}
                      disabled={busy}
                      className="link-draw font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4 hover:text-accent"
                    >
                      Make default
                    </button>
                  )}
                  <button
                    onClick={() => call('DELETE', null, `?id=${a._id}`)}
                    disabled={busy}
                    className="link-draw ml-auto font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="field-luxe text-[15px]"
      />
    </div>
  );
}
