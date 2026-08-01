'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keeps the dashboard current without a manual reload.
 *
 * Orders arrive while the panel is open on a counter screen, so a static
 * server render goes stale within minutes. This re-fetches the server
 * components on an interval — and pauses while the tab is hidden, so a panel
 * left open overnight is not polling the database until morning.
 */
export default function AutoRefresh({ seconds = 45 }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);

    // Catch up immediately when the operator comes back to the tab.
    const onVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router, seconds]);

  return null;
}
