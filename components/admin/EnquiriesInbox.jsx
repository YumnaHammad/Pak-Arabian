'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import ConfirmButton from './ConfirmButton';

/** Contact-form inbox. Open enquiries sort first. */
export default function EnquiriesInbox({ initial = [] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState('open');
  const [error, setError] = useState('');

  const counts = useMemo(
    () => ({
      open: items.filter((e) => !e.handled).length,
      handled: items.filter((e) => e.handled).length,
      all: items.length,
    }),
    [items]
  );

  const rows = items.filter((e) =>
    filter === 'all' ? true : filter === 'open' ? !e.handled : e.handled
  );

  async function setHandled(item, handled) {
    setItems((prev) => prev.map((e) => (e._id === item._id ? { ...e, handled } : e)));

    const res = await fetch(`/api/admin/enquiries/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handled }),
    }).catch(() => null);

    if (!res?.ok) {
      setItems((prev) => prev.map((e) => (e._id === item._id ? { ...e, handled: !handled } : e)));
      setError('Could not update that enquiry.');
      return;
    }
    router.refresh();
  }

  async function remove(id) {
    setItems((prev) => prev.filter((e) => e._id !== id));
    await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium">Enquiries</h1>
        <p className="mt-1 text-[13px] text-ink-3">
          {counts.open} open · {counts.handled} handled
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'open', label: 'Open', count: counts.open },
          { id: 'handled', label: 'Handled', count: counts.handled },
          { id: 'all', label: 'All', count: counts.all },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[12px] transition-colors',
              filter === tab.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-hairline text-ink-2 hover:bg-elevated'
            )}
          >
            {tab.label} <span className="ml-1.5 text-ink-4">{tab.count}</span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="admin-card p-14 text-center text-[13px] text-ink-4">
          {filter === 'open' ? 'Nothing open. Inbox clear.' : 'No enquiries here.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => (
            <li key={e._id} className="admin-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[14px] font-medium">{e.name}</p>
                    <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-ink-3">
                      {e.subject}
                    </span>
                    {!e.handled && (
                      <span className="rounded-full border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-400">
                        Open
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
                    <a href={`mailto:${e.email}`} className="text-accent hover:underline">
                      {e.email}
                    </a>
                    {e.phone && (
                      <a href={`tel:${e.phone}`} className="text-ink-2 hover:text-ink">
                        {e.phone}
                      </a>
                    )}
                    <span className="text-ink-4">
                      {new Date(e.createdAt).toLocaleString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">
                    {e.message}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <a
                    href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject}`)}`}
                    className="admin-btn"
                  >
                    Reply
                  </a>
                  <button
                    onClick={() => setHandled(e, !e.handled)}
                    className={cn('admin-btn', !e.handled && 'admin-btn-primary')}
                  >
                    {e.handled ? 'Reopen' : 'Mark handled'}
                  </button>
                  <ConfirmButton
                    onConfirm={() => remove(e._id)}
                    className="admin-btn admin-btn-danger"
                    confirmLabel="Delete?"
                  >
                    Delete
                  </ConfirmButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
