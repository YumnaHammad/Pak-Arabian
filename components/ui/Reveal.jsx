'use client';
import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * The house scroll reveal. Everything that enters the viewport does so through
 * this component so the whole site shares one entrance curve and one threshold.
 *
 * `as` lets it stand in for any element without adding a wrapper div.
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 26,
  duration = 0.9,
  once = true,
  className = '',
  ...rest
}) {
  const reduced = usePrefersReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration, ease: EASE.luxe, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Staggers direct children that are themselves `RevealItem`s. */
export function RevealGroup({
  children,
  as = 'div',
  stagger = 0.09,
  delay = 0,
  className = '',
  once = true,
  ...rest
}) {
  const reduced = usePrefersReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, once }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({ children, as = 'div', y = 28, duration = 0.9, className = '', ...rest }) {
  const reduced = usePrefersReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: EASE.luxe } },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
