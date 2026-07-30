import { cn } from '@/lib/utils';

/**
 * Line-art flacon used wherever a product has no photography yet.
 *
 * Deliberately drawn rather than a generic "no image" box — an empty frame in a
 * luxury grid should still look composed.
 */
export default function BottleGlyph({ className = '', strokeWidth = 0.7 }) {
  return (
    <svg
      viewBox="0 0 48 72"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('opacity-70', className)}
      aria-hidden
    >
      {/* Stopper */}
      <path d="M19 10V5.5A1.5 1.5 0 0 1 20.5 4h7A1.5 1.5 0 0 1 29 5.5V10" />
      {/* Collar */}
      <rect x="18" y="10" width="12" height="3.4" rx="0.6" />
      {/* Neck */}
      <path d="M20.5 13.4v3.8" />
      <path d="M27.5 13.4v3.8" />
      {/* Shoulders into body */}
      <path d="M20.5 17.2 15.6 21a5 5 0 0 0-1.9 3.9V63a3 3 0 0 0 3 3h14.6a3 3 0 0 0 3-3V24.9a5 5 0 0 0-1.9-3.9l-4.9-3.8" />
      {/* Label frame */}
      <rect x="19" y="36" width="10" height="14" rx="0.4" opacity="0.55" />
      {/* Fill line */}
      <path d="M13.7 30h20.6" opacity="0.35" />
    </svg>
  );
}
