'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useWishlist } from '@/lib/wishlist-context';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import Cursorable from '@/components/ui/Cursorable';

/**
 * Save-to-wishlist control.
 *
 * A guest is not blocked with a wall — the intent is remembered locally and
 * replayed against the API the moment they sign in, so nothing is lost.
 */
export default function WishlistButton({ productId, className = '', showLabel = false }) {
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();
  const { has, toggle, pending } = useWishlist();
  const [nudge, setNudge] = useState(false);

  const saved = has(productId);

  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(false), 2600);
    return () => clearTimeout(t);
  }, [nudge]);

  async function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (status === 'loading') return;

    if (!isAuthenticated) {
      toggle(productId); // stored locally, synced on sign-in
      setNudge(true);
      return;
    }
    await toggle(productId);
  }

  return (
    <div className={cn('relative', className)}>
      <Cursorable variant="link">
        <button
          onClick={onClick}
          disabled={pending}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={cn(
            'group/wish flex h-9 items-center justify-center gap-2 rounded-full border px-2.5 backdrop-blur-sm transition-colors duration-500',
            saved
              ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
              : 'border-transparent bg-obsidian/30 text-cream/70 hover:border-hairline hover:text-[var(--accent)]',
            showLabel && 'px-4'
          )}
        >
          <motion.svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={saved ? { scale: [1, 1.28, 1] } : { scale: 1 }}
            transition={{ duration: 0.45, ease: EASE.luxe }}
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.8 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
          </motion.svg>
          {showLabel && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              {saved ? 'Saved' : 'Save'}
            </span>
          )}
        </button>
      </Cursorable>

      {/* Sign-in nudge */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE.luxe }}
            className="glass absolute right-0 top-11 z-20 w-52 p-3.5 text-left"
          >
            <p className="text-[11px] leading-relaxed text-ink-2">
              Saved on this device.{' '}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/account');
                }}
                className="text-accent underline underline-offset-2"
              >
                Sign in
              </button>{' '}
              to keep it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
