'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { EASE } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';

export default function ProfilePanel() {
  const { customer, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', marketingOptIn: false });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!customer) return;
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      marketingOptIn: !!customer.marketingOptIn,
    });
  }, [customer]);

  async function save(payload, successNote) {
    setState('saving');
    setMessage('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save.');
      await refresh();
      setState('done');
      setMessage(successNote);
      setTimeout(() => setState('idle'), 3000);
      return true;
    } catch (err) {
      setState('error');
      setMessage(err.message);
      return false;
    }
  }

  async function onDetails(e) {
    e.preventDefault();
    await save(form, 'Details updated.');
  }

  async function onPassword(e) {
    e.preventDefault();
    const ok = await save(passwords, 'Password changed.');
    if (ok) setPasswords({ currentPassword: '', newPassword: '' });
  }

  return (
    <div className="max-w-xl space-y-16">
      {/* ── Details ── */}
      <form onSubmit={onDetails}>
        <h2 className="eyebrow-muted">Your details</h2>

        <div className="mt-8 space-y-7">
          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />

          <div>
            <label className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
              Email
            </label>
            <p className="field-luxe cursor-not-allowed text-[17px] text-ink-4">
              {customer?.email}
            </p>
            <p className="mt-2 text-[14px] text-ink-4">
              The email on an account cannot be changed here — message the house if you need it moved.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3.5 pt-2">
            <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-hairline">
              <input
                type="checkbox"
                checked={form.marketingOptIn}
                onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
                className="sr-only"
              />
              <motion.span
                className="h-2 w-2 bg-[var(--accent)]"
                animate={{ scale: form.marketingOptIn ? 1 : 0 }}
                transition={{ duration: 0.3, ease: EASE.luxe }}
              />
            </span>
            <span className="text-[15px] leading-relaxed text-ink-3">
              Write to me when a new composition is released.
            </span>
          </label>
        </div>

        <MagneticButton type="submit" disabled={state === 'saving'} className="mt-9">
          {state === 'saving' ? 'Saving…' : 'Save details'}
        </MagneticButton>
      </form>

      {/* ── Password ── */}
      <form onSubmit={onPassword} className="border-t border-hairline/50 pt-16">
        <h2 className="eyebrow-muted">Password</h2>

        <div className="mt-8 space-y-7">
          <Field
            label="Current password"
            type="password"
            value={passwords.currentPassword}
            onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
            autoComplete="current-password"
            required
          />
          <Field
            label="New password"
            type="password"
            value={passwords.newPassword}
            onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
            autoComplete="new-password"
            hint="At least 8 characters"
            required
          />
        </div>

        <MagneticButton type="submit" disabled={state === 'saving'} className="mt-9">
          Change password
        </MagneticButton>
      </form>

      {/* ── Status ── */}
      <div aria-live="polite" className="min-h-[24px]">
        <AnimatePresence mode="wait">
          {message && (
            <motion.p
              key={message}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`font-mono text-[13px] uppercase tracking-[0.07em] ${
                state === 'error' ? 'text-red-400' : 'text-accent'
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, hint, autoComplete }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
          {label}
        </label>
        {hint && <span className="font-mono text-[12px] text-ink-4">{hint}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={type === 'password' ? 8 : undefined}
        className="field-luxe text-[17px]"
      />
    </div>
  );
}
