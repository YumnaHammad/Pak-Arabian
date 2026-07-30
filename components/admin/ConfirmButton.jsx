'use client';
import { useState, useEffect, useRef } from 'react';

/**
 * Two-press confirmation.
 *
 * Replaces `window.confirm` — a native dialog blocks the thread, cannot be
 * styled, and reads as a browser warning rather than a considered choice. The
 * armed state reverts after a few seconds so a stray click never leaves a
 * destructive button primed.
 */
export default function ConfirmButton({
  children,
  onConfirm,
  confirmLabel = 'Confirm?',
  className = '',
  disabled = false,
  timeout = 3500,
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!armed) {
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), timeout);
      return;
    }

    clearTimeout(timer.current);
    setArmed(false);
    onConfirm();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onBlur={() => {
        clearTimeout(timer.current);
        setArmed(false);
      }}
      disabled={disabled}
      className={className}
      aria-live="polite"
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
