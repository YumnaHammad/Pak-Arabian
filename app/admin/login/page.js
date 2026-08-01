'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BRAND } from '@/lib/content/site';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Email or password is incorrect.');
        setBusy(false);
      }
    } catch {
      setError('Could not reach the server.');
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        {/* Mark */}
        <div className="mb-10 flex items-center gap-2.5">
          <span className="flex h-7 items-center justify-center rounded bg-[var(--accent)] px-2 text-[12px] font-bold tracking-tight text-obsidian">
            PA
          </span>
          <span className="text-[14px] font-medium">{BRAND.name} Admin</span>
        </div>

        <h1 className="text-2xl font-medium">Sign in</h1>
        <p className="mt-2 text-[13px] text-ink-3">
          Inventory, orders and client care for {BRAND.legal}.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
          <div>
            <label htmlFor="email" className="admin-label">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="admin-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="admin-label">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="admin-input"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="admin-btn admin-btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link
          href="/"
          className="mt-8 inline-block text-[12px] text-ink-4 transition-colors hover:text-ink"
        >
          ← Back to storefront
        </Link>
      </div>
    </div>
  );
}
