'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { CONTACT } from '@/lib/content/site';
import MagneticButton from '@/components/ui/MagneticButton';
import { cn } from '@/lib/utils';

const SUBJECTS = ['General', 'An order', 'A fragrance', 'Wholesale', 'Something else'];

/**
 * Enquiry form.
 *
 * Posts to `/api/contact`, which writes an Enquiry document. The previous form
 * resolved a timer and showed a success state without sending anything; this
 * one either saves or tells the visitor to use WhatsApp instead.
 */
export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [state, setState] = useState('idle');
  const [note, setNote] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setState('sending');
    setNote('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send the message.');
      setState('done');
      setNote(data.message);
    } catch (err) {
      setState('error');
      setNote(err.message);
    }
  }

  if (state === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE.luxe }}
        className="border border-[var(--accent)]/40 bg-surface p-10"
      >
        <p className="eyebrow">Received</p>
        <p className="mt-6 font-display text-3xl font-normal">Thank you, {form.name.split(' ')[0]}.</p>
        <p className="mt-4 max-w-prose text-[17px] leading-relaxed text-ink-2">{note}</p>
        <button
          onClick={() => {
            setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
            setState('idle');
            setNote('');
          }}
          className="link-draw mt-8 font-mono text-[13px] uppercase tracking-[0.08em] text-accent"
        >
          Send another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" required />
        <Field label="Phone (optional)" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />

        <div>
          <label htmlFor="subject" className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
            Regarding
          </label>
          <select
            id="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="field-luxe cursor-pointer text-[17px]"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-base text-ink">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <label htmlFor="message" className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          required
          minLength={10}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us what you need."
          className="field-luxe resize-none text-[17px]"
        />
      </div>

      <AnimatePresence>
        {state === 'error' && note && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-7 border border-red-500/40 bg-red-500/5 px-5 py-3.5 font-mono text-[13px] uppercase tracking-[0.06em] text-red-400"
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-10 flex flex-wrap items-center gap-8">
        <MagneticButton type="submit" variant="solid" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </MagneticButton>
        <p className="max-w-[30ch] text-[14px] leading-relaxed text-ink-4">
          Prefer to talk? WhatsApp{' '}
          <a href={CONTACT.whatsapp} className="text-accent underline underline-offset-4">
            {CONTACT.phone}
          </a>
        </p>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', required, autoComplete }) {
  return (
    <div>
      <label className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className={cn('field-luxe text-[17px]')}
      />
    </div>
  );
}
