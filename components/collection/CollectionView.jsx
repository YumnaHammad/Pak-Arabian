'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { CATEGORIES } from '@/lib/content/site';
import { EASE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn, formatPKR } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import SplitText from '@/components/ui/SplitText';
import { Eyebrow } from '@/components/ui/Primitives';
import Cursorable from '@/components/ui/Cursorable';

const SORTS = [
  { label: 'Curated', value: '' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price — low', value: 'price-asc' },
  { label: 'Price — high', value: 'price-desc' },
  { label: 'A — Z', value: 'name' },
];

const PAGE = 8;

/**
 * The library view.
 *
 * Category and sort are URL state — shareable, and identical to the contract
 * the previous storefront used. Everything else (price band, in-stock, the
 * progressive reveal) is local, because it refines a result rather than
 * defining one.
 */
export default function CollectionView({ products = [], counts = {}, activeCategory = '', activeSort = '' }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  const [visible, setVisible] = useState(PAGE);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinel = useRef(null);

  /* Price ceiling for the band control. */
  const priceCeiling = useMemo(
    () => (products.length ? Math.max(...products.map((p) => p.price)) : 0),
    [products]
  );

  useEffect(() => {
    setMaxPrice(null);
    setVisible(PAGE);
  }, [activeCategory, activeSort]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (inStockOnly && p.stock === 0) return false;
      if (maxPrice != null && p.price > maxPrice) return false;
      return true;
    });
  }, [products, inStockOnly, maxPrice]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  /* Progressive reveal as the sentinel enters view. */
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible((v) => v + PAGE);
      },
      { rootMargin: '400px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, filtered.length]);

  const setParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams();
      const next = { category: activeCategory, sort: activeSort, [key]: value };
      Object.entries(next).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, activeCategory, activeSort]
  );

  const activeMeta = CATEGORIES.find((c) => c.value === activeCategory) || CATEGORIES[0];
  const refined = inStockOnly || maxPrice != null;

  return (
    <>
      {/* ── Masthead ── */}
      <header className="shell-wide pt-32 md:pt-44">
        <Eyebrow>The Library</Eyebrow>

        <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SplitText
            key={activeCategory}
            as="h1"
            lines={activeCategory ? [activeMeta.label] : ['Every composition', 'in the house.']}
            className="font-display text-display-md font-light"
          />
          <p className="max-w-[30ch] text-[15px] leading-relaxed text-ink-2 md:text-right">
            {activeMeta.blurb}
          </p>
        </div>
      </header>

      {/* ── Filter bar ── */}
      <div className="sticky top-[72px] z-[60] mt-14 border-y border-hairline/50 bg-base/85 backdrop-blur-xl md:top-[86px]">
        <div className="shell-wide flex items-center justify-between gap-6 py-4">
          {/* Categories */}
          <LayoutGroup id="cat">
            <ul className="no-scrollbar -mx-1 flex flex-1 gap-1 overflow-x-auto px-1">
              {CATEGORIES.map((cat) => {
                const isActive = cat.value === activeCategory;
                const count = counts[cat.value];
                return (
                  <li key={cat.value || 'all'}>
                    <Cursorable variant="link">
                      <button
                        onClick={() => setParam('category', cat.value)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'relative whitespace-nowrap px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-500',
                          isActive ? 'text-obsidian' : 'text-ink-3 hover:text-ink'
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="cat-pill"
                            className="absolute inset-0 bg-[var(--accent)]"
                            transition={{ duration: 0.5, ease: EASE.luxe }}
                          />
                        )}
                        <span className="relative">
                          {cat.label}
                          {count != null && (
                            <span className={cn('ml-2 tabular-nums', isActive ? 'opacity-60' : 'text-ink-4')}>
                              {count}
                            </span>
                          )}
                        </span>
                      </button>
                    </Cursorable>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          {/* Refine + sort */}
          <div className="flex shrink-0 items-center gap-2">
            <Cursorable variant="link">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className={cn(
                  'flex items-center gap-2 border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-500',
                  refined || filtersOpen
                    ? 'border-[var(--accent)] text-accent'
                    : 'border-hairline text-ink-3 hover:text-ink'
                )}
              >
                Refine
                {refined && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
              </button>
            </Cursorable>

            <div className="relative hidden sm:block">
              <label htmlFor="sort" className="sr-only">
                Sort
              </label>
              <select
                id="sort"
                value={activeSort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="cursor-pointer appearance-none border border-hairline bg-transparent py-2.5 pl-4 pr-9 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 outline-none transition-colors hover:text-ink"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-base text-ink">
                    {s.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-ink-4">
                ▾
              </span>
            </div>
          </div>
        </div>

        {/* ── Refine drawer ── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE.luxe }}
              className="overflow-hidden border-t border-hairline/40"
            >
              <div className="shell-wide flex flex-col gap-8 py-8 sm:flex-row sm:items-end">
                {/* Availability */}
                <div>
                  <p className="eyebrow-muted">Availability</p>
                  <button
                    onClick={() => setInStockOnly((v) => !v)}
                    role="switch"
                    aria-checked={inStockOnly}
                    className="mt-4 flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        'relative h-5 w-9 border transition-colors duration-500',
                        inStockOnly ? 'border-[var(--accent)]' : 'border-hairline'
                      )}
                    >
                      <motion.span
                        className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2"
                        animate={{
                          left: inStockOnly ? 'calc(100% - 0.875rem)' : '0.25rem',
                          backgroundColor: inStockOnly ? 'var(--accent)' : 'rgb(var(--c-line))',
                        }}
                        transition={{ duration: 0.4, ease: EASE.luxe }}
                      />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                      In stock only
                    </span>
                  </button>
                </div>

                {/* Price band */}
                {priceCeiling > 0 && (
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="eyebrow-muted">Up to</p>
                      <p className="font-mono text-[10px] tabular-nums text-accent">
                        {formatPKR(maxPrice ?? priceCeiling)}
                      </p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={priceCeiling}
                      step={500}
                      value={maxPrice ?? priceCeiling}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      aria-label="Maximum price"
                      className="mt-4 h-1 w-full cursor-pointer appearance-none bg-hairline accent-[var(--accent)]"
                    />
                  </div>
                )}

                {refined && (
                  <button
                    onClick={() => {
                      setInStockOnly(false);
                      setMaxPrice(null);
                    }}
                    className="link-draw shrink-0 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4 hover:text-accent sm:self-end"
                  >
                    Clear refinements
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Grid ── */}
      <section className="shell-wide py-16 md:py-24" aria-label="Fragrances">
        <p className="mb-12 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
          {filtered.length} {filtered.length === 1 ? 'composition' : 'compositions'}
          {refined && ' after refinement'}
        </p>

        {filtered.length === 0 ? (
          <div className="border-y border-hairline/50 py-28 text-center">
            <p className="font-display text-3xl font-light">Nothing here yet.</p>
            <p className="mx-auto mt-4 max-w-[38ch] text-[15px] leading-relaxed text-ink-3">
              {refined
                ? 'No composition matches these refinements. Try widening the price band.'
                : 'This shelf is between batches. The next maceration completes in a few weeks.'}
            </p>
            {refined && (
              <button
                onClick={() => {
                  setInStockOnly(false);
                  setMaxPrice(null);
                }}
                className="btn-luxe mt-10"
              >
                Clear refinements
              </button>
            )}
          </div>
        ) : (
          <>
            <motion.div
              layout={!reduced}
              className="grid grid-cols-2 gap-x-6 gap-y-16 md:gap-x-8 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {shown.map((product, i) => (
                  <motion.div
                    key={product._id}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: EASE.luxe }}
                  >
                    <ProductCard product={product} index={i} priority={i < 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Progressive reveal */}
            {hasMore && (
              <div ref={sentinel} className="mt-20 flex flex-col items-center gap-6">
                <span className="h-px w-24 animate-shimmer bg-gold-leaf" />
                <button
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="btn-luxe"
                >
                  Show more ({filtered.length - visible})
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
