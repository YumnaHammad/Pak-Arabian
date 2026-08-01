'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/content/site';
import { cn } from '@/lib/utils';

const NAV = [
  {
    group: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: 'grid' }],
  },
  {
    group: 'Catalogue',
    items: [
      { href: '/admin/products', label: 'Inventory', icon: 'box' },
      { href: '/admin/products/new', label: 'Add product', icon: 'plus' },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: 'receipt' },
      { href: '/admin/coupons', label: 'Discounts', icon: 'tag' },
      { href: '/admin/customers', label: 'Customers', icon: 'users' },
    ],
  },
  {
    group: 'Inbox',
    items: [
      { href: '/admin/reviews', label: 'Reviews', icon: 'star' },
      { href: '/admin/enquiries', label: 'Enquiries', icon: 'mail' },
    ],
  },
];

/**
 * Admin chrome.
 *
 * Deliberately conventional: a fixed sidebar, a breadcrumb bar, dense tables.
 * The storefront's cursor, inertial scroll and page transitions are all absent
 * here — someone updating stock at the counter wants the click to land where
 * they pointed, immediately.
 */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNav, setMobileNav] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  /* The login screen renders standalone — no sidebar to sign in from. */
  if (pathname === '/admin/login') {
    return <div className="admin-root">{children}</div>;
  }

  async function logout() {
    setSigningOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const crumb =
    NAV.flatMap((g) => g.items).find((i) => i.href === pathname)?.label ||
    (pathname.includes('/edit') ? 'Edit product' : 'Admin');

  return (
    <div className="admin-root flex min-h-screen">
      {/* ══════════ Sidebar ══════════ */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r bg-surface transition-transform duration-200 lg:translate-x-0',
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: 'rgb(var(--c-line) / 0.7)' }}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b px-5" style={{ borderColor: 'rgb(var(--c-line) / 0.7)' }}>
          <span className="flex h-6 items-center justify-center rounded bg-[var(--accent)] px-1.5 text-[11px] font-bold tracking-tight text-obsidian">
            PA
          </span>
          <span className="text-[13px] font-medium">{BRAND.name} Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin sections">
          {NAV.map((group) => (
            <div key={group.group} className="mb-6">
              <p className="mb-2 px-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-4">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                          active
                            ? 'bg-elevated text-ink'
                            : 'text-ink-2 hover:bg-elevated/60 hover:text-ink'
                        )}
                      >
                        <Icon
                          name={item.icon}
                          className={active ? 'text-[var(--accent)]' : 'text-ink-4 group-hover:text-ink-2'}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t p-3" style={{ borderColor: 'rgb(var(--c-line) / 0.7)' }}>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-elevated/60 hover:text-ink"
          >
            <Icon name="external" className="text-ink-4" />
            View storefront
          </Link>
          <button
            onClick={logout}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-elevated/60 hover:text-ink disabled:opacity-50"
          >
            <Icon name="exit" className="text-ink-4" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Scrim behind the mobile drawer */}
      <AnimatePresence>
        {mobileNav && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-obsidian/70 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ══════════ Content ══════════ */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bg-base/85 px-5 backdrop-blur-xl"
          style={{ borderColor: 'rgb(var(--c-line) / 0.7)' }}
        >
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
            className="lg:hidden"
          >
            <Icon name="menu" className="text-ink-2" />
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px]">
            <span className="text-ink-4">Admin</span>
            <span className="text-ink-4">/</span>
            <span className="text-ink">{crumb}</span>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-[11px] text-ink-4 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-light" />
              Live
            </span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

/* ── Icon set — inline so the panel ships no icon dependency ── */
function Icon({ name, className = '' }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    box: <><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    receipt: <><path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    tag: <><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></>,
    star: <><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1z" /></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></>,
    exit: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  };

  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0 transition-colors', className)}
      aria-hidden
    >
      {paths[name] || paths.grid}
    </svg>
  );
}
