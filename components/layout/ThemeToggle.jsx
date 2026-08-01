'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import Cursorable from '@/components/ui/Cursorable';

const KEY = 'pakarabian_theme';

/**
 * Noir (dark) is the house default. Ivoire is the light editorial mood.
 * The choice is written to `data-theme` on <html>; the inline script in the
 * root layout replays it before first paint so there is never a flash.
 */
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('noir');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'noir';
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === 'noir' ? 'ivoire' : 'noir';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — the choice simply won't persist */
    }
  }

  // Reserve the space so the header never reflows on hydration.
  if (!mounted) return <div className={`h-9 w-9 ${className}`} />;

  const isNoir = theme === 'noir';

  return (
    <Cursorable variant="link">
      <button
        onClick={toggle}
        aria-label={isNoir ? 'Switch to Ivoire (light) theme' : 'Switch to Noir (dark) theme'}
        className={`group relative flex h-9 w-9 items-center justify-center ${className}`}
      >
        <motion.span
          className="absolute inset-0 rounded-full border border-hairline/60"
          whileHover={{ scale: 1.12, borderColor: 'var(--accent)' }}
          transition={{ duration: 0.5, ease: EASE.luxe }}
        />
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative text-ink-2 transition-colors group-hover:text-accent"
          animate={{ rotate: isNoir ? 0 : 180 }}
          transition={{ duration: 0.8, ease: EASE.luxe }}
        >
          {isNoir ? (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </motion.svg>
      </button>
    </Cursorable>
  );
}
