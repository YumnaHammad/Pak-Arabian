'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { INGREDIENTS } from '@/lib/content/site';
import { cn } from '@/lib/utils';

/* Match a note name to a known material so the swatch carries its real hue. */
const HUE_BY_NAME = INGREDIENTS.reduce((acc, ing) => {
  acc[ing.name.toLowerCase()] = ing.hue;
  const short = ing.name.split(' ').pop().toLowerCase();
  acc[short] = ing.hue;
  return acc;
}, {});

const TIERS = [
  { key: 'top', label: 'Top', window: 'First 10 minutes', weight: 0.34 },
  { key: 'heart', label: 'Heart', window: '20 min — 4 hours', weight: 0.66 },
  { key: 'base', label: 'Base', window: '4 hours onward', weight: 1 },
];

/**
 * The pyramid, drawn as a timeline rather than a triangle.
 *
 * A triangle says which notes are heaviest; a timeline says when you will
 * actually smell them, which is the thing a shopper is trying to find out.
 * Each tier's bar is proportioned to how long it holds.
 */
export default function NotePyramid({ notes = {}, className = '' }) {
  const [hovered, setHovered] = useState(null);
  const tiers = TIERS.map((t) => ({ ...t, items: notes?.[t.key] || [] }));
  const hasAny = tiers.some((t) => t.items.length);

  if (!hasAny) {
    return (
      <p className="font-mono text-[13px] uppercase tracking-[0.07em] text-ink-4">
        Composition not yet published
      </p>
    );
  }

  return (
    <div className={cn('space-y-9', className)}>
      {tiers.map((tier, tierIndex) => (
        <motion.div
          key={tier.key}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE.luxe, delay: tierIndex * 0.12 }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-mono text-[13px] uppercase tracking-[0.09em] text-ink">
              {tier.label}
            </h4>
            <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-4">
              {tier.window}
            </span>
          </div>

          {/* Duration bar */}
          <div className="mt-3 h-px w-full bg-hairline/60">
            <motion.div
              className="h-px bg-gold-leaf"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: tier.weight }}
              viewport={VIEWPORT}
              style={{ transformOrigin: 'left' }}
              transition={{ duration: 1.1, ease: EASE.luxe, delay: 0.2 + tierIndex * 0.12 }}
            />
          </div>

          {/* Notes */}
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {tier.items.length ? (
              tier.items.map((note, i) => {
                const hue = HUE_BY_NAME[String(note).toLowerCase()] || null;
                const id = `${tier.key}-${i}`;
                return (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT}
                    transition={{
                      duration: 0.55,
                      ease: EASE.luxe,
                      delay: 0.3 + tierIndex * 0.1 + i * 0.05,
                    }}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    className="group/note flex items-center gap-2.5 border border-hairline/60 px-3.5 py-2 transition-colors duration-500 hover:border-[var(--accent)]/60"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-transform duration-500 group-hover/note:scale-150"
                      style={{ backgroundColor: hue || 'var(--accent)' }}
                    />
                    <span className="text-[15px] text-ink-2">{note}</span>
                  </motion.li>
                );
              })
            ) : (
              <li className="text-[15px] italic text-ink-4">Not disclosed</li>
            )}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
