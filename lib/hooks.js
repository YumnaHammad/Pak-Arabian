'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/** True when the OS asks for reduced motion. Reactive to changes. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** True on devices with a real pointer — gates cursor + hover-physics work. */
export function useHasPointer() {
  const [hasPointer, setHasPointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasPointer(mq.matches);
    const onChange = (e) => setHasPointer(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return hasPointer;
}

/** Generic media query hook. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Magnetic hover. Returns a ref plus the live offset; the consumer decides how
 * to apply it (usually a Framer `animate`). Disabled without a fine pointer or
 * under reduced-motion, where the element simply stays put.
 */
export function useMagnetic(strength = 0.35, radius = 90) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();
  const active = hasPointer && !reduced;

  useEffect(() => {
    if (!active) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    const el = ref.current;
    if (!el) return;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < rect.width / 2 + radius) {
        setOffset({ x: dx * strength, y: dy * strength });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    }
    function onLeave() {
      setOffset({ x: 0, y: 0 });
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [active, strength, radius]);

  return { ref, offset, active };
}

/**
 * Normalised pointer position (-1..1 on both axes) relative to the viewport.
 * Used to parallax hero layers and drive the 3D scene's camera drift.
 */
export function usePointerVector() {
  const vec = useRef({ x: 0, y: 0 });
  const hasPointer = useHasPointer();

  useEffect(() => {
    if (!hasPointer) return;
    function onMove(e) {
      vec.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      vec.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [hasPointer]);

  return vec;
}

/** Locks body scroll while `locked` is true (drawers, menus, modals). */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = previous;
      document.body.style.paddingRight = '';
    };
  }, [locked]);
}

/** Fires once the element has been within the viewport. */
export function useInViewOnce(options = { rootMargin: '-10% 0px' }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  return [ref, seen];
}

/** Escape-key handler for dismissible overlays. */
export function useEscape(handler, enabled = true) {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      if (e.key === 'Escape') saved.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}

/** Traps Tab focus inside a container — required for drawers and modals. */
export function useFocusTrap(active) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const previouslyFocused = document.activeElement;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function onKey(e) {
      if (e.key !== 'Tab') return;
      const nodes = Array.from(root.querySelectorAll(selector)).filter(
        (n) => n.offsetParent !== null
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Defer so the element exists after its entrance animation mounts it.
    const raf = requestAnimationFrame(() => {
      const firstNode = root.querySelector(selector);
      firstNode?.focus();
    });

    root.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('keydown', onKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [active]);

  return ref;
}

/** Debounced value — used by the search overlay. */
export function useDebounced(value, delay = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** localStorage-backed state that survives refresh (recently viewed, etc). */
export function usePersistentState(key, initial) {
  const [state, setState] = useState(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* corrupted entry — fall back to the initial value */
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next) => {
      setState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          /* quota or private mode — state still works in memory */
        }
        return value;
      });
    },
    [key]
  );

  return [state, update, hydrated];
}
