'use client';
import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const WishlistContext = createContext(null);
const LOCAL_KEY = 'azwah_wishlist';

/**
 * Wishlist with a guest tier.
 *
 * Signed out, saves live in localStorage. On sign-in those ids are pushed to
 * the account once and the local copy is cleared, so a shopper never loses the
 * pieces they marked before registering.
 */
export function WishlistProvider({ children }) {
  const { isAuthenticated, status } = useAuth();
  const [ids, setIds] = useState([]);
  const [pending, setPending] = useState(false);
  const merged = useRef(false);

  /* ── Load ── */
  useEffect(() => {
    if (status === 'loading') return;

    if (!isAuthenticated) {
      merged.current = false;
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        setIds(raw ? JSON.parse(raw) : []);
      } catch {
        setIds([]);
      }
      return;
    }

    let cancelled = false;

    async function hydrate() {
      /* Push anything saved as a guest, once per session. */
      if (!merged.current) {
        merged.current = true;
        let local = [];
        try {
          local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
        } catch {
          local = [];
        }
        for (const id of local) {
          await fetch('/api/account/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id }),
          }).catch(() => {});
        }
        if (local.length) localStorage.removeItem(LOCAL_KEY);
      }

      const res = await fetch('/api/account/wishlist', { cache: 'no-store' }).catch(() => null);
      if (!res?.ok || cancelled) return;
      const data = await res.json();
      setIds((data.items || []).map((p) => p._id));
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, status]);

  const persistLocal = useCallback((next) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch {
      /* private mode — the list still works for this page view */
    }
  }, []);

  const has = useCallback((productId) => ids.includes(String(productId)), [ids]);

  const toggle = useCallback(
    async (productId) => {
      const id = String(productId);
      const willSave = !ids.includes(id);

      // Optimistic: the control responds immediately, then reconciles.
      const next = willSave ? [...ids, id] : ids.filter((x) => x !== id);
      setIds(next);

      if (!isAuthenticated) {
        persistLocal(next);
        return willSave;
      }

      setPending(true);
      try {
        const res = await fetch('/api/account/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        // Trust the server's answer over the optimistic guess.
        setIds((current) =>
          data.saved
            ? current.includes(id)
              ? current
              : [...current, id]
            : current.filter((x) => x !== id)
        );
        return data.saved;
      } catch {
        setIds(ids); // roll back
        return !willSave;
      } finally {
        setPending(false);
      }
    },
    [ids, isAuthenticated, persistLocal]
  );

  const remove = useCallback(
    async (productId) => {
      const id = String(productId);
      const next = ids.filter((x) => x !== id);
      setIds(next);
      if (!isAuthenticated) {
        persistLocal(next);
        return;
      }
      await fetch(`/api/account/wishlist?productId=${id}`, { method: 'DELETE' }).catch(() => {});
    },
    [ids, isAuthenticated, persistLocal]
  );

  const value = useMemo(
    () => ({ ids, count: ids.length, has, toggle, remove, pending }),
    [ids, has, toggle, remove, pending]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return { ids: [], count: 0, has: () => false, toggle: async () => false, remove: async () => {}, pending: false };
  }
  return ctx;
}
