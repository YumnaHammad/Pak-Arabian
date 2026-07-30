'use client';
import { create } from 'zustand';

/**
 * Ephemeral interface state.
 *
 * Deliberately separate from `cart-context` — the cart is business state that
 * persists to localStorage and feeds the order API. This store holds only
 * things that die on refresh: overlays, cursor intent, the intro sequence.
 */
export const useUI = create((set) => ({
  /* ── Intro / loader ── */
  introComplete: false,
  completeIntro: () => set({ introComplete: true }),

  /* ── Navigation ── */
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),

  /* ── Search overlay ── */
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),

  /* ── Cursor ──
     `variant` drives the custom cursor's shape; `label` renders inside it. */
  cursorVariant: 'default', // 'default' | 'link' | 'drag' | 'view' | 'hidden'
  cursorLabel: '',
  setCursor: (cursorVariant, cursorLabel = '') => set({ cursorVariant, cursorLabel }),
  resetCursor: () => set({ cursorVariant: 'default', cursorLabel: '' }),

  /* ── Quick view ── */
  quickView: null, // a product object, or null
  setQuickView: (quickView) => set({ quickView }),
}));
