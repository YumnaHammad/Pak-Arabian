'use client';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { CONTACT, BRAND } from '@/lib/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Boutique locator plate.
 *
 * Drawn rather than embedded. A third-party map tile would pull an external
 * script and an API key into an otherwise self-contained page, and would break
 * the palette entirely — this renders the junction, the landmark and a marker
 * in the house's own type, and hands off to a real map when someone actually
 * wants directions.
 */
export default function BoutiquePlate() {
  const reduced = usePrefersReducedMotion();
  const query = encodeURIComponent(
    `${CONTACT.address.line1}, ${CONTACT.address.line2}, ${BRAND.country}`
  );

  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-hairline/50 bg-surface">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Blocks */}
        {[
          [20, 20, 150, 100], [190, 20, 190, 100],
          [20, 140, 150, 60], [190, 140, 90, 60],
          [300, 140, 80, 60], [20, 220, 150, 60], [190, 220, 190, 60],
        ].map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x} y={y} width={w} height={h}
            className="fill-elevated"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeOpacity="0.18"
          />
        ))}

        {/* Roads */}
        <path d="M180 0 L180 300" stroke="currentColor" strokeOpacity="0.22" strokeWidth="10" />
        <path d="M0 130 L400 130" stroke="currentColor" strokeOpacity="0.22" strokeWidth="10" />
        <path d="M0 210 L400 210" stroke="currentColor" strokeOpacity="0.14" strokeWidth="6" />
        <path d="M290 130 L290 300" stroke="currentColor" strokeOpacity="0.14" strokeWidth="6" />

        {/* Road labels */}
        <text x="188" y="66" className="fill-current" opacity="0.32" style={{ fontSize: 7, fontFamily: 'monospace', letterSpacing: 1.6 }}>
          MILAAD CHOWK
        </text>
        <text x="24" y="124" className="fill-current" opacity="0.32" style={{ fontSize: 7, fontFamily: 'monospace', letterSpacing: 1.6 }}>
          NEW TOWN
        </text>

        {/* Landmark */}
        <rect x="200" y="140" width="60" height="34" className="fill-elevated" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.8" />
        <text x="230" y="161" textAnchor="middle" className="fill-current" opacity="0.4" style={{ fontSize: 6.5, fontFamily: 'monospace', letterSpacing: 1.2 }}>
          ALLIED BANK
        </text>
      </svg>

      {/* Marker */}
      <div className="absolute" style={{ left: '45%', top: '43%' }}>
        <span className="relative flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          {!reduced && (
            <motion.span
              className="absolute h-3 w-3 rounded-full bg-[var(--accent)]"
              animate={{ scale: [1, 3.2], opacity: [0.5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: EASE.luxe }}
            />
          )}
          <span className="relative h-2 w-2 rounded-full bg-[var(--accent)]" />
        </span>
        <span className="absolute left-4 top-0 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.07em] text-accent">
          {BRAND.name}
        </span>
      </div>

      {/* Footer bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-hairline/50 bg-base/80 px-5 py-3.5 backdrop-blur-sm">
        <p className="font-mono text-[12px] uppercase tracking-[0.07em] text-ink-4">
          {BRAND.city}, {BRAND.country}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[12px] uppercase tracking-[0.07em] text-accent transition-opacity hover:opacity-70"
        >
          Directions ↗
        </a>
      </div>
    </div>
  );
}
