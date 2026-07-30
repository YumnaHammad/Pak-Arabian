'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMagnetic } from '@/lib/hooks';
import { SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';
import Cursorable from '@/components/ui/Cursorable';

/**
 * A control that leans toward the pointer as it approaches, then springs back.
 *
 * The inner label counter-moves at a lower rate, which is the detail that sells
 * the physics — the surface and its contents have different mass.
 * Renders as <Link> when given `href`, otherwise <button>.
 */
export default function MagneticButton({
  children,
  href,
  variant = 'outline', // 'outline' | 'solid' | 'bare'
  strength = 0.3,
  radius = 80,
  className = '',
  cursorLabel = '',
  ...rest
}) {
  const { ref, offset, active } = useMagnetic(strength, radius);

  const base =
    variant === 'solid' ? 'btn-solid' : variant === 'bare' ? '' : 'btn-luxe';

  const content = (
    <motion.span
      className="relative flex items-center justify-center gap-3"
      animate={active ? { x: offset.x * 0.32, y: offset.y * 0.32 } : { x: 0, y: 0 }}
      transition={SPRING.soft}
    >
      {children}
    </motion.span>
  );

  const motionProps = {
    ref,
    className: cn(base, className),
    animate: active ? { x: offset.x, y: offset.y } : { x: 0, y: 0 },
    transition: SPRING.soft,
  };

  if (href) {
    return (
      <Cursorable variant="link" label={cursorLabel}>
        <motion.span {...motionProps} className={cn(base, 'inline-flex', className)}>
          <Link href={href} className="absolute inset-0 z-10" {...rest}>
            <span className="sr-only">{typeof children === 'string' ? children : 'Open'}</span>
          </Link>
          {content}
        </motion.span>
      </Cursorable>
    );
  }

  return (
    <Cursorable variant="link" label={cursorLabel}>
      <motion.button {...motionProps} {...rest}>
        {content}
      </motion.button>
    </Cursorable>
  );
}
