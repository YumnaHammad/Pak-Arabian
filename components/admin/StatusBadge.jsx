import { cn } from '@/lib/utils';

/* One source of truth for how a status looks, across every admin surface. */
const TONES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  shipped: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/25',
};

export default function StatusBadge({ status = 'pending', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize',
        TONES[status] || TONES.pending,
        className
      )}
    >
      {status}
    </span>
  );
}
