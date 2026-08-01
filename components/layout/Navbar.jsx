'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/store/ui';
import { useScrollLock, useEscape } from '@/lib/hooks';
import { EASE } from '@/lib/motion';
import { BRAND, COLLECTION_DOORS, CATEGORIES } from '@/lib/content/site';
import ThemeToggle from './ThemeToggle';
import Cursorable from '@/components/ui/Cursorable';
import { cn } from '@/lib/utils';

/**
 * Primary navigation.
 *
 * Named for what a customer is looking for, not for how the house thinks about
 * itself. "Collections / The House" gave a first-time visitor no route to the
 * two things they actually want — men's and women's fragrances — so those are
 * now top-level, and the shop link says "Shop".
 */
const PRIMARY = [
  { label: 'Shop', href: '/collection', mega: true },
  { label: 'For Him', href: '/collection?category=men' },
  { label: 'For Her', href: '/collection?category=women' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

export default function Navbar() {
  const pathname = usePathname();

  /*
   * "For Him"/"For Her" differ from "Shop" only by query string. `useSearchParams`
   * would read it directly, but calling it here — in the root layout — opts every
   * static page in the app into dynamic rendering. Reading `location.search` after
   * mount costs one render and keeps the pages static.
   */
  const [searchKey, setSearchKey] = useState('');
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    setSearchKey(cat ? `?category=${cat}` : '');
  }, [pathname]);
  const { count, setOpen: setCartOpen } = useCart();
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const introComplete = useUI((s) => s.introComplete);

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const megaTimer = useRef(null);

  const { scrollY } = useScroll();

  /* Hide on the way down, reveal on the way up — never hide near the top. */
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (menuOpen || mega) return;
    setHidden(y > previous && y > 220);
  });

  /* Close everything on navigation. */
  useEffect(() => {
    setMenuOpen(false);
    setMega(false);
  }, [pathname, setMenuOpen]);

  useScrollLock(menuOpen);
  useEscape(() => {
    setMenuOpen(false);
    setMega(false);
  }, menuOpen || mega);

  useEffect(() => {
    if (menuOpen) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [menuOpen]);

  function openMega() {
    clearTimeout(megaTimer.current);
    setMega(true);
  }
  function closeMega() {
    clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMega(false), 140);
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: introComplete ? (hidden ? -100 : 0) : -100 }}
        transition={{ duration: 0.7, ease: EASE.luxe }}
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-colors duration-700',
          scrolled || mega ? 'glass' : 'bg-transparent'
        )}
        onMouseLeave={closeMega}
      >
        <nav
          aria-label="Primary"
          className="shell-wide flex h-[72px] items-center justify-between gap-8 md:h-[86px]"
        >
          {/* ── Wordmark ── */}
          <Cursorable variant="link">
            <Link href="/" className="group relative shrink-0" aria-label={`${BRAND.legal} home`}>
              <span className="font-display text-2xl font-normal tracking-tight md:text-[27px]">
                {BRAND.name}
                <span className="text-accent align-super text-xs">{BRAND.mark}</span>
              </span>
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-[var(--accent)] transition-transform duration-700 ease-luxe group-hover:origin-left group-hover:scale-x-100" />
            </Link>
          </Cursorable>

          {/* ── Desktop links ── */}
          <ul className="hidden items-center gap-7 lg:flex xl:gap-9">
            {PRIMARY.map((item) => {
              const active =
                item.href === pathname ||
                (item.href.startsWith('/collection?') && `${pathname}${searchKey}` === item.href);
              return (
                <li key={item.href} onMouseEnter={item.mega ? openMega : closeMega}>
                  <Cursorable variant="link">
                    <Link
                      href={item.href}
                      className={cn(
                        'link-draw whitespace-nowrap text-[15px] font-semibold transition-colors',
                        active ? 'text-accent' : 'text-ink-2 hover:text-ink'
                      )}
                      aria-expanded={item.mega ? mega : undefined}
                    >
                      {item.label}
                    </Link>
                  </Cursorable>
                </li>
              );
            })}
          </ul>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1 md:gap-3">
            <IconAction label="Search" onClick={() => setSearchOpen(true)}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </IconAction>

            <Link href="/account" className="hidden md:block">
              <IconAction label="Account" as="span">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </IconAction>
            </Link>

            <ThemeToggle className="hidden md:flex" />

            {/* Cart */}
            <Cursorable variant="link">
              <button
                onClick={() => setCartOpen(true)}
                aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
                className="group relative flex h-9 items-center gap-2.5 pl-3 pr-1"
              >
                <span className="font-mono text-[13px] uppercase tracking-[0.09em] text-ink-2 transition-colors group-hover:text-accent">
                  Bag
                </span>
                <span className="relative flex h-6 min-w-6 items-center justify-center rounded-full border border-hairline px-1.5 font-mono text-[13px] tabular-nums transition-colors group-hover:border-accent group-hover:text-accent">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={count}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE.luxe }}
                    >
                      {count}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
            </Cursorable>

            {/* Burger */}
            <Cursorable variant="link">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="relative ml-1 flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
              >
                <motion.span
                  className="block h-px w-5 bg-current"
                  animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 3 : 0 }}
                  transition={{ duration: 0.4, ease: EASE.luxe }}
                />
                <motion.span
                  className="block h-px w-5 bg-current"
                  animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -3 : 0 }}
                  transition={{ duration: 0.4, ease: EASE.luxe }}
                />
              </button>
            </Cursorable>
          </div>
        </nav>

        {/* ── Mega menu ── */}
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE.luxe }}
              className="hidden overflow-hidden border-t border-hairline/50 lg:block"
              onMouseEnter={openMega}
            >
              <div className="shell-wide grid grid-cols-12 gap-10 py-14">
                <div className="col-span-3">
                  <p className="eyebrow-muted">The Library</p>
                  <p className="mt-6 max-w-[24ch] font-display text-2xl font-normal leading-snug">
                    Four doors into the same house.
                  </p>
                </div>

                <ul className="col-span-6 grid grid-cols-2 gap-x-10 gap-y-1">
                  {COLLECTION_DOORS.map((door, i) => (
                    <motion.li
                      key={door.value}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: EASE.luxe, delay: 0.06 * i }}
                    >
                      <Cursorable variant="link">
                        <Link
                          href={`/collection?category=${door.value}`}
                          className="group flex items-baseline gap-4 border-b border-hairline/40 py-5"
                        >
                          <span className="font-mono text-[13px] text-ink-4">{door.numeral}</span>
                          <span className="flex-1">
                            <span className="block font-display text-xl font-normal transition-colors group-hover:text-accent">
                              {door.label}
                            </span>
                            <span className="mt-1 block text-[14px] text-ink-3">{door.line}</span>
                          </span>
                          <span className="translate-x-0 text-accent opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">
                            →
                          </span>
                        </Link>
                      </Cursorable>
                    </motion.li>
                  ))}
                </ul>

                <div className="col-span-3">
                  <p className="eyebrow-muted">By Family</p>
                  <ul className="mt-6 space-y-3">
                    {CATEGORIES.filter((c) => ['woody', 'floral', ''].includes(c.value)).map((c) => (
                      <li key={c.value || 'all'}>
                        <Cursorable variant="link">
                          <Link
                            href={c.value ? `/collection?category=${c.value}` : '/collection'}
                            className="link-draw text-sm text-ink-2 transition-colors hover:text-accent"
                          >
                            {c.value ? c.label : 'View everything'}
                          </Link>
                        </Cursorable>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Mobile / tablet full-screen menu ── */}
      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} pathname={pathname} />}
      </AnimatePresence>
    </>
  );
}

/* ── Small circular icon control ── */
function IconAction({ children, label, onClick, as: Tag = 'button' }) {
  return (
    <Cursorable variant="link">
      <Tag
        onClick={onClick}
        aria-label={label}
        className="group relative flex h-9 w-9 items-center justify-center"
        {...(Tag === 'button' ? { type: 'button' } : {})}
      >
        <span className="absolute inset-0 scale-90 rounded-full border border-transparent transition-all duration-500 ease-luxe group-hover:scale-100 group-hover:border-hairline" />
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative text-ink-2 transition-colors group-hover:text-accent"
        >
          {children}
        </svg>
      </Tag>
    </Cursorable>
  );
}

/* ── Full-screen mobile navigation ── */
function MobileMenu({ onClose, pathname }) {
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collection' },
    ...COLLECTION_DOORS.map((d) => ({
      label: d.label,
      href: `/collection?category=${d.value}`,
      sub: true,
    })),
    { label: 'The House', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Account', href: '/account' },
  ];

  return (
    <motion.div
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.75, ease: EASE.drape }}
      className="fixed inset-0 z-[95] flex flex-col bg-base lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="h-[72px] shrink-0" />

      <nav className="flex-1 overflow-y-auto px-6 pb-10">
        <ul>
          {links.map((link, i) => (
            <li key={link.href + link.label} className="overflow-hidden">
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE.luxe, delay: 0.14 + i * 0.045 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-baseline justify-between border-b border-hairline/40 py-4',
                    link.sub ? 'pl-6' : ''
                  )}
                >
                  <span
                    className={cn(
                      'font-display font-normal',
                      link.sub ? 'text-xl text-ink-2' : 'text-3xl',
                      pathname === link.href && 'text-accent'
                    )}
                  >
                    {link.label}
                  </span>
                  <span className="font-mono text-[13px] text-ink-4">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </Link>
              </motion.div>
            </li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-12 flex items-center justify-between"
        >
          <div>
            <p className="eyebrow-muted">Theme</p>
            <div className="mt-3">
              <ThemeToggle />
            </div>
          </div>
          <div className="text-right">
            <p className="eyebrow-muted">Enquiries</p>
            <a
              href="tel:+923101272021"
              className="mt-3 block font-mono text-sm text-ink-2 hover:text-accent"
            >
              0310-1272021
            </a>
          </div>
        </motion.div>
      </nav>
    </motion.div>
  );
}
