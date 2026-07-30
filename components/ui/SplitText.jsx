'use client';
import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/**
 * Masked type reveal.
 *
 * Each line sits in an overflow-hidden box and lifts from beneath it — no fade,
 * pure transform, which is what makes editorial type feel printed rather than
 * animated. Pass `lines` as an array to control the break points yourself;
 * automatic wrapping cannot be masked per-line without measuring.
 *
 * Accessibility: the visible spans are aria-hidden and the plain string is
 * exposed to screen readers once, so the heading is never read letter by letter.
 */
export default function SplitText({
  lines = [],
  as: Tag = 'h2',
  className = '',
  lineClassName = '',
  delay = 0,
  stagger = 0.09,
  duration = 1.05,
  once = true,
  animate = 'inView', // 'inView' | 'mount'
  ...rest
}) {
  const reduced = usePrefersReducedMotion();
  const items = Array.isArray(lines) ? lines : [lines];
  const label = items.join(' ');

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {items.map((line, i) => (
          <span key={i} className={cn('block', lineClassName)}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  const motionProps =
    animate === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : { initial: 'hidden', whileInView: 'visible', viewport: { ...VIEWPORT, once } };

  return (
    <Tag className={className} aria-label={label} {...rest}>
      <motion.span
        aria-hidden
        className="block"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
        {...motionProps}
      >
        {items.map((line, i) => (
          <span key={i} className="mask-line">
            <motion.span
              className={cn('block', lineClassName)}
              variants={{
                hidden: { y: '112%' },
                visible: { y: '0%', transition: { duration, ease: EASE.luxe } },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/**
 * Word-level stagger — for shorter, denser passages where per-line masking
 * would read as too theatrical.
 */
export function SplitWords({
  text = '',
  as: Tag = 'p',
  className = '',
  delay = 0,
  stagger = 0.028,
  once = true,
}) {
  const reduced = usePrefersReducedMotion();
  const words = String(text).split(' ').filter(Boolean);

  if (reduced) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="visible"
        viewport={{ ...VIEWPORT, once }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: '105%', opacity: 0 },
                visible: { y: '0%', opacity: 1, transition: { duration: 0.75, ease: EASE.luxe } },
              }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
