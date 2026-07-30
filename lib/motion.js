/**
 * Shared motion vocabulary.
 *
 * Every animation in the house draws from this file so the whole site moves
 * with one hand. Two rules: nothing pops (no linear/ease-out snaps), and
 * everything that enters does so from behind a mask or from below.
 */

/* ── Easings ── */
export const EASE = {
  /** Primary. Long tail, decisive start — the "expensive" curve. */
  luxe: [0.16, 1, 0.3, 1],
  /** Slightly softer, for larger travel distances. */
  silk: [0.22, 1, 0.36, 1],
  /** Symmetric — for things that leave and return (drawers, veils). */
  drape: [0.65, 0, 0.35, 1],
  /** Anticipatory, for playful micro-interactions only. */
  spring: [0.34, 1.56, 0.64, 1],
};

/* ── Spring presets (Framer Motion `type: 'spring'`) ── */
export const SPRING = {
  soft: { type: 'spring', stiffness: 120, damping: 22, mass: 0.9 },
  firm: { type: 'spring', stiffness: 260, damping: 30, mass: 0.7 },
  silk: { type: 'spring', stiffness: 80, damping: 20, mass: 1.1 },
  cursor: { type: 'spring', stiffness: 520, damping: 42, mass: 0.45 },
};

export const DUR = {
  xs: 0.35,
  sm: 0.6,
  md: 0.9,
  lg: 1.25,
  xl: 1.8,
};

/* ── Viewport defaults for scroll-triggered reveals ── */
export const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' };

/* ════════════════════════════════════════════════════════
   Variants
   ════════════════════════════════════════════════════════ */

/** Parent that staggers its children. */
export const stagger = (delayChildren = 0, staggerChildren = 0.08) => ({
  hidden: {},
  visible: {
    transition: { delayChildren, staggerChildren },
  },
});

/** The house entrance: lift from below with a soft fade. */
export const riseIn = (distance = 28, duration = DUR.md) => ({
  hidden: { opacity: 0, y: distance },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE.luxe } },
});

/** For text lines sitting inside `.mask-line` — pure transform, no fade. */
export const maskLine = (duration = DUR.lg) => ({
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration, ease: EASE.luxe } },
});

export const fadeIn = (duration = DUR.md) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration, ease: EASE.luxe } },
});

/** Scale + fade, used for imagery and cards. */
export const revealImage = (duration = DUR.xl) => ({
  hidden: { opacity: 0, scale: 1.12 },
  visible: { opacity: 1, scale: 1, transition: { duration, ease: EASE.silk } },
});

/** A curtain that wipes away to expose content beneath. */
export const curtain = (duration = DUR.lg) => ({
  hidden: { scaleY: 1 },
  visible: { scaleY: 0, transition: { duration, ease: EASE.drape } },
});

/** Side drawers. */
export const drawer = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: DUR.sm, ease: EASE.luxe } },
  exit: { x: '100%', transition: { duration: DUR.xs, ease: EASE.drape } },
};

export const scrim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.xs } },
  exit: { opacity: 0, transition: { duration: DUR.xs } },
};
