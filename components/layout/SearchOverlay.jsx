'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/lib/store/ui';
import { useDebounced, useEscape, useFocusTrap } from '@/lib/hooks';
import { setScrollLocked } from './SmoothScroll';
import { EASE } from '@/lib/motion';
import { formatPKR } from '@/lib/utils';
import { CATEGORIES } from '@/lib/content/site';
import BottleGlyph from '@/components/ui/BottleGlyph';

/**
 * Full-bleed search.
 *
 * Queries the existing `/api/products?q=` route — no new index, no new service.
 * Opens on the header control and on ⌘K / Ctrl-K.
 */
export default function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounced(query, 300);
  const trapRef = useFocusTrap(open);

  useEscape(() => setOpen(false), open);

  /* ⌘K anywhere on the storefront */
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!useUI.getState().searchOpen);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    setScrollLocked(open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) {
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
      setScrollLocked(false);
    };
  }, [open]);

  useEffect(() => {
    const term = debounced.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    fetch(`/api/products?q=${encodeURIComponent(term)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        setResults(Array.isArray(data) ? data.slice(0, 8) : []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const term = debounced.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={trapRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE.luxe }}
          className="fixed inset-0 z-[115] bg-base/95 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Search the library"
        >
          <div className="shell flex h-full flex-col pt-28 md:pt-36">
            {/* ── Input ── */}
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: EASE.luxe, delay: 0.08 }}
              className="shrink-0 border-b border-hairline pb-5"
            >
              <label htmlFor="search-field" className="eyebrow-muted">
                Search the library
              </label>
              <div className="mt-4 flex items-center gap-5">
                <input
                  id="search-field"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Oud, rose, vetiver…"
                  className="w-full bg-transparent font-display text-3xl font-normal outline-none placeholder:text-ink-4 md:text-5xl"
                  autoComplete="off"
                />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="shrink-0 font-mono text-[13px] uppercase tracking-[0.07em] text-ink-3 transition-colors hover:text-accent"
                >
                  Esc
                </button>
              </div>
            </motion.div>

            {/* ── Results ── */}
            <div className="flex-1 overflow-y-auto py-10">
              {term.length < 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="eyebrow-muted">Browse instead</p>
                  <ul className="mt-7 flex flex-wrap gap-3">
                    {CATEGORIES.filter((c) => c.value).map((c) => (
                      <li key={c.value}>
                        <Link
                          href={`/collection?category=${c.value}`}
                          onClick={() => setOpen(false)}
                          className="inline-block border border-hairline px-5 py-3 font-mono text-[13px] uppercase tracking-[0.07em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : loading ? (
                <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-3">
                  Searching…
                </p>
              ) : results.length === 0 ? (
                <div>
                  <p className="font-display text-2xl font-normal">
                    Nothing in the library matches “{term}”.
                  </p>
                  <Link
                    href="/collection"
                    onClick={() => setOpen(false)}
                    className="btn-luxe mt-8"
                  >
                    View everything
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-hairline/40">
                  {results.map((p, i) => (
                    <motion.li
                      key={p._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE.luxe, delay: i * 0.04 }}
                    >
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-6 py-5"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-elevated">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                          ) : (
                            <BottleGlyph className="h-full w-full p-3 text-ink-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-xl font-normal transition-colors group-hover:text-accent md:text-2xl">
                            {p.name}
                          </p>
                          <p className="mt-1 font-mono text-[13px] uppercase tracking-[0.06em] text-ink-4">
                            {p.category} · {p.concentration} · {p.volumeMl}ml
                          </p>
                        </div>
                        <p className="shrink-0 font-mono text-sm tabular-nums text-ink-2">
                          {formatPKR(p.price)}
                        </p>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
