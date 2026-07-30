'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/content/site';
import SplitText from '@/components/ui/SplitText';
import MagneticButton from '@/components/ui/MagneticButton';
import { Eyebrow } from '@/components/ui/Primitives';
import FlaconPoster from '@/components/three/FlaconPoster';

/**
 * Sign in / register.
 *
 * One panel, two modes — a separate route for each would double the chrome for
 * a form with three fields. The heading, copy and submit label all shift with
 * the mode so it never reads as the wrong form.
 */
export default function AuthGate() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', marketingOptIn: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (isRegister) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          marketingOptIn: form.marketingOptIn,
        });
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="shell-wide grid min-h-[70vh] items-center gap-16 pb-28 pt-32 lg:grid-cols-2 lg:gap-24 md:pt-44">
      {/* ── Form ── */}
      <div className="order-2 lg:order-1">
        <Eyebrow>{isRegister ? 'Open an account' : 'Welcome back'}</Eyebrow>

        <SplitText
          key={mode}
          as="h1"
          animate="mount"
          lines={isRegister ? ['Join the house.'] : ['Sign in.']}
          className="mt-8 font-display text-display-sm font-light"
        />

        <p className="mt-7 max-w-prose text-[15px] leading-relaxed text-ink-2">
          {isRegister
            ? 'An account keeps your wishlist, your addresses and every order you have placed with the house in one place.'
            : 'Your orders, wishlist and saved addresses are waiting.'}
        </p>

        <form onSubmit={onSubmit} className="mt-12 max-w-md">
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: EASE.luxe }}
                className="overflow-hidden"
              >
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  autoComplete="name"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-7">
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              autoComplete="email"
              required
            />
          </div>

          <div className="mt-7">
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              hint={isRegister ? 'At least 8 characters' : undefined}
              required
            />
          </div>

          {isRegister && (
            <label className="mt-8 flex cursor-pointer items-start gap-3.5">
              <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-hairline">
                <input
                  type="checkbox"
                  checked={form.marketingOptIn}
                  onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
                  className="peer sr-only"
                />
                <motion.span
                  className="h-2 w-2 bg-[var(--accent)]"
                  animate={{ scale: form.marketingOptIn ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE.luxe }}
                />
              </span>
              <span className="text-[13px] leading-relaxed text-ink-3">
                Write to me when a new composition is released. Four to six times a year,
                never more.
              </span>
            </label>
          )}

          {error && (
            <p
              role="alert"
              className="mt-7 border border-red-500/40 bg-red-500/5 px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-red-400"
            >
              {error}
            </p>
          )}

          <MagneticButton type="submit" variant="solid" disabled={busy} className="mt-10 w-full">
            {busy ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}
          </MagneticButton>

          <p className="mt-8 text-[13px] text-ink-3">
            {isRegister ? 'Already have an account?' : 'No account yet?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? 'signin' : 'register');
                setError('');
              }}
              className="link-draw text-accent"
            >
              {isRegister ? 'Sign in' : 'Open one'}
            </button>
          </p>
        </form>
      </div>

      {/* ── Object ── */}
      <div className="order-1 hidden lg:order-2 lg:block">
        <div className="relative aspect-[4/5] overflow-hidden border border-hairline/50 bg-elevated">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 45%, rgba(201,162,39,0.16), transparent 70%)',
            }}
          />
          <FlaconPoster category="signature" className="relative p-12" />
          <p className="absolute bottom-7 left-7 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
            {BRAND.legal} — {BRAND.city}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', autoComplete, required, hint }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
          {label}
        </label>
        {hint && <span className="font-mono text-[9px] text-ink-4">{hint}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={type === 'password' ? 8 : undefined}
        className={cn('field-luxe text-[16px]')}
      />
    </div>
  );
}
