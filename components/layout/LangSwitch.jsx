'use client';
import { useEffect, useRef, useState } from 'react';
import { LANGS, useLang, useT } from '@/lib/i18n';

/** Compact language picker for the header. */
export default function LangSwitch({ className = '' }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={t('nav.language')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-hairline px-3 text-[13px] font-semibold transition-colors hover:border-accent"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
        </svg>
        {current.short}
      </button>
      {open && (
        <ul className="absolute end-0 top-12 z-[120] min-w-[10rem] overflow-hidden rounded-xl border border-hairline bg-base py-1 text-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-start text-[14px] hover:bg-surface ${l.code === lang ? 'font-semibold text-accent' : ''}`}
              >
                {l.label}
                {l.code === lang && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
