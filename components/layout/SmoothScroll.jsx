'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Lenis-driven inertial scrolling.
 *
 * Exposed on `window.__lenis` so overlays (cart drawer, menu, quick view) can
 * stop and start it without prop-drilling a ref through the tree.
 * Under reduced-motion we never instantiate it — the browser's native scroll
 * is the correct, accessible behaviour.
 */
export default function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out: fast pickup, long glide, no rubber band.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have momentum; layering ours fights the OS.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    window.__lenis = lenis;

    let frame;
    function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    // Let in-page anchors route through Lenis so they glide rather than jump.
    function onAnchorClick(e) {
      const anchor = e.target.closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    }
    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduced]);

  // Every navigation starts at the top, instantly — never mid-glide.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/** Pause/resume inertial scrolling — used whenever an overlay opens. */
export function setScrollLocked(locked) {
  if (typeof window === 'undefined') return;
  if (locked) window.__lenis?.stop();
  else window.__lenis?.start();
}
