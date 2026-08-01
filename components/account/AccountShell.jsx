'use client';
import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import AuthGate from './AuthGate';
import OrdersPanel from './OrdersPanel';
import WishlistPanel from './WishlistPanel';
import AddressesPanel from './AddressesPanel';
import ProfilePanel from './ProfilePanel';
import { Eyebrow } from '@/components/ui/Primitives';
import SplitText from '@/components/ui/SplitText';
import Cursorable from '@/components/ui/Cursorable';

const TABS = [
  { id: 'orders', label: 'Orders', Panel: OrdersPanel },
  { id: 'wishlist', label: 'Wishlist', Panel: WishlistPanel },
  { id: 'addresses', label: 'Addresses', Panel: AddressesPanel },
  { id: 'profile', label: 'Profile', Panel: ProfilePanel },
];

/**
 * Account dashboard.
 *
 * Gates on the session and renders the sign-in panel in place rather than
 * redirecting — a redirect here loses whatever the shopper was doing, and the
 * account route is the only place the form is needed.
 */
export default function AccountShell() {
  const { customer, status, logout } = useAuth();
  const [tab, setTab] = useState('orders');

  if (status === 'loading') {
    return (
      <div className="shell flex min-h-[70vh] items-center justify-center pt-32">
        <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4">
          Opening your account…
        </p>
      </div>
    );
  }

  if (status !== 'authenticated') return <AuthGate />;

  const ActivePanel = TABS.find((t) => t.id === tab)?.Panel || OrdersPanel;
  const firstName = (customer?.name || '').split(' ')[0];

  return (
    <div className="shell-wide pb-28 pt-32 md:pt-44">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-8 border-b border-hairline/50 pb-12 md:flex-row md:items-end">
        <div>
          <Eyebrow>Your account</Eyebrow>
          <SplitText
            as="h1"
            animate="mount"
            lines={[`Good to see you, ${firstName}.`]}
            className="mt-8 font-display text-display-sm font-normal"
          />
          <p className="mt-5 font-mono text-[13px] uppercase tracking-[0.07em] text-ink-4">
            {customer?.email}
          </p>
        </div>

        <Cursorable variant="link">
          <button
            onClick={logout}
            className="link-draw shrink-0 self-start font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4 transition-colors hover:text-accent md:self-end"
          >
            Sign out
          </button>
        </Cursorable>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ── Navigation ── */}
        <nav className="lg:col-span-3" aria-label="Account sections">
          <LayoutGroup id="account-tabs">
            <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 lg:flex-col lg:gap-0 lg:overflow-visible">
              {TABS.map((t) => {
                const active = t.id === tab;
                return (
                  <li key={t.id}>
                    <Cursorable variant="link">
                      <button
                        onClick={() => setTab(t.id)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative w-full whitespace-nowrap px-4 py-3.5 text-left font-mono text-[13px] uppercase tracking-[0.08em] transition-colors duration-500 lg:border-b lg:border-hairline/40',
                          active ? 'text-accent' : 'text-ink-3 hover:text-ink'
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="account-marker"
                            className="absolute inset-y-0 left-0 w-px bg-[var(--accent)] max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:h-px max-lg:w-full"
                            transition={{ duration: 0.5, ease: EASE.luxe }}
                          />
                        )}
                        <span className="relative">{t.label}</span>
                      </button>
                    </Cursorable>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>

        {/* ── Panel ── */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE.luxe }}
            >
              <ActivePanel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
