import { cn } from '@/lib/utils';

/** KPI tile. `accent` promotes the headline figure to the house gold. */
export default function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className="admin-card p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">{label}</p>
      <p
        className={cn(
          'mt-3 text-2xl font-medium tabular-nums',
          accent ? 'text-[var(--accent)]' : 'text-ink'
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] text-ink-4">{hint}</p>}
    </div>
  );
}
