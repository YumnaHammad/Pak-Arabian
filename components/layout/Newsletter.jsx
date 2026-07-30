'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';
import { Eyebrow } from '@/components/ui/Primitives';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * The house letter.
 *
 * Posts to /api/newsletter, which stores the address on the Subscriber model.
 * Failure is surfaced inline — a silent success state on a form that did not
 * save is worse than no form.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');
  const reduced = usePrefersReducedMotion();

  async function onSubmit(e) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not subscribe.');
      setState('done');
      setMessage(data.message || 'You are on the list.');
      setEmail('');
    } catch (err) {
      setState('error');
      setMessage(err.message);
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden border-b border-hairline/50"
    >
      {/* Slow gold wash behind the glass panel */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={{
            background: [
              'radial-gradient(60% 80% at 20% 30%, rgba(201,162,39,0.10), transparent 70%)',
              'radial-gradient(60% 80% at 80% 70%, rgba(201,162,39,0.10), transparent 70%)',
              'radial-gradient(60% 80% at 20% 30%, rgba(201,162,39,0.10), transparent 70%)',
            ],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="shell-wide relative py-24 md:py-32">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE.luxe }}
          className="glass mx-auto max-w-4xl px-8 py-14 md:px-16 md:py-20"
        >
          <Eyebrow>The House Letter</Eyebrow>

          <h2
            id="newsletter-heading"
            className="mt-7 max-w-[18ch] font-display text-4xl font-light leading-[1.05] md:text-6xl"
          >
            First access to every new composition.
          </h2>

          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-2">
            Four to six releases a year, each in a numbered batch. Subscribers are
            written to before anything reaches the collection page — and no more
            often than that.
          </p>

          <form onSubmit={onSubmit} className="mt-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="newsletter-email"
                  className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink-4"
                >
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={state === 'sending'}
                  className="field-luxe text-lg"
                  aria-describedby="newsletter-status"
                />
              </div>

              <MagneticButton
                type="submit"
                disabled={state === 'sending'}
                className="shrink-0"
                cursorLabel="Send"
              >
                {state === 'sending' ? 'Sending' : 'Subscribe'}
              </MagneticButton>
            </div>

            <div id="newsletter-status" aria-live="polite" className="min-h-[24px]">
              <AnimatePresence mode="wait">
                {message && (
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE.luxe }}
                    className={`mt-5 font-mono text-[11px] uppercase tracking-[0.2em] ${
                      state === 'error' ? 'text-red-400' : 'text-accent'
                    }`}
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
