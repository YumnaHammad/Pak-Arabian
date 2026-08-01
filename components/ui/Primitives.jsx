'use client';
import { useRef, useState, useId } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/* ══════════════════════════════════════════════
   Eyebrow — the small tracked label above headings
   ══════════════════════════════════════════════ */
export function Eyebrow({ children, numeral, muted = false, className = '' }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {numeral && (
        <span className="font-mono text-[13px] tabular-nums tracking-[0.1em] text-ink-4">
          {numeral}
        </span>
      )}
      <span className={muted ? 'eyebrow-muted' : 'eyebrow'}>{children}</span>
      <span className="h-px w-12 bg-hairline/70" />
    </div>
  );
}

/* ══════════════════════════════════════════════
   Section heading pairing
   ══════════════════════════════════════════════ */
export function SectionHeading({ eyebrow, numeral, title, lede, align = 'left', className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {eyebrow && <Eyebrow numeral={numeral}>{eyebrow}</Eyebrow>}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE.luxe }}
          className="max-w-3xl font-display text-display-sm font-normal"
        >
          {title}
        </motion.h2>
      )}
      {lede && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE.luxe, delay: 0.12 }}
          className="max-w-prose text-[17px] leading-relaxed text-ink-2"
        >
          {lede}
        </motion.p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Scroll progress — a gold hairline at the top of the viewport
   ══════════════════════════════════════════════ */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[125] h-px origin-left bg-gold-leaf"
    />
  );
}

/* ══════════════════════════════════════════════
   Rating — five hairline strokes, filled to the score
   ══════════════════════════════════════════════ */
export function Rating({ value = 5, className = '' }) {
  const rounded = Math.round(value);
  return (
    <div className={cn('flex items-center gap-1.5', className)} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            'h-px w-5 transition-colors',
            i < rounded ? 'bg-[var(--accent)]' : 'bg-hairline'
          )}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Accordion — used by FAQ and the product detail panels
   ══════════════════════════════════════════════ */
export function Accordion({ items = [], className = '', defaultOpen = -1 }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('divide-y divide-hairline/60 border-y border-hairline/60', className)}>
      {items.map((item, i) => (
        <AccordionRow
          key={item.q ?? i}
          index={i}
          question={item.q}
          answer={item.a}
          isOpen={open === i}
          onToggle={() => setOpen(open === i ? -1 : i)}
        />
      ))}
    </div>
  );
}

function AccordionRow({ index, question, answer, isOpen, onToggle }) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <div>
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-8 py-7 text-left"
        >
          <span className="flex items-start gap-6">
            <span className="mt-1 font-mono text-[13px] tabular-nums text-ink-4">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-display text-xl font-normal leading-snug transition-colors group-hover:text-accent md:text-2xl">
              {question}
            </span>
          </span>
          <span className="relative mt-2 h-3 w-3 shrink-0">
            <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current transition-colors group-hover:bg-[var(--accent)]" />
            <motion.span
              className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current group-hover:bg-[var(--accent)]"
              animate={{ scaleY: isOpen ? 0 : 1 }}
              transition={{ duration: 0.4, ease: EASE.luxe }}
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE.luxe }}
            className="overflow-hidden"
          >
            <p className="max-w-prose pb-8 pl-12 text-[17px] leading-relaxed text-ink-2">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Counter — a number that counts up when scrolled into view
   ══════════════════════════════════════════════ */
export function Counter({ to = 0, suffix = '', duration = 1.8, className = '' }) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? to : 0);
  const started = useRef(false);

  function run() {
    if (started.current || reduced) return;
    started.current = true;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / (duration * 1000), 1);
      setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  return (
    <motion.span
      className={cn('tabular-nums', className)}
      onViewportEnter={run}
      viewport={{ once: true, margin: '-10%' }}
    >
      {display.toLocaleString('en-PK')}
      {suffix}
    </motion.span>
  );
}

/* ══════════════════════════════════════════════
   Vertical scroll cue
   ══════════════════════════════════════════════ */
export function ScrollCue({ label = 'Scroll', className = '' }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} aria-hidden>
      <span className="writing-vertical font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <span className="relative h-16 w-px overflow-hidden bg-hairline">
        {!reduced && (
          <motion.span
            className="absolute inset-x-0 top-0 h-6 bg-[var(--accent)]"
            animate={{ y: ['-100%', '280%'] }}
            transition={{ duration: 2.2, ease: EASE.drape, repeat: Infinity }}
          />
        )}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Tilt — hover physics for cards
   ══════════════════════════════════════════════ */
export function Tilt({ children, max = 7, scale = 1.015, className = '' }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState({ rx: 0, ry: 0 });

  function onMove(e) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * max * 2, ry: px * max * 2 });
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setT({ rx: 0, ry: 0 })}
      animate={{ rotateX: t.rx, rotateY: t.ry, scale: t.rx || t.ry ? scale : 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={cn('perspective-far', className)}
    >
      {children}
    </motion.div>
  );
}
