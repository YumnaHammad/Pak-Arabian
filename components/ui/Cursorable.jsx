'use client';
import { cloneElement, isValidElement } from 'react';
import { useUI } from '@/lib/store/ui';

/**
 * Declares what the custom cursor should become while the pointer is over its
 * child. Wraps rather than renders, so it adds no DOM node.
 *
 *   <Cursorable variant="view" label="Discover"><article … /></Cursorable>
 */
export default function Cursorable({ children, variant = 'link', label = '' }) {
  const setCursor = useUI((s) => s.setCursor);
  const resetCursor = useUI((s) => s.resetCursor);

  if (!isValidElement(children)) return children;

  return cloneElement(children, {
    onPointerEnter: (e) => {
      setCursor(variant, label);
      children.props.onPointerEnter?.(e);
    },
    onPointerLeave: (e) => {
      resetCursor();
      children.props.onPointerLeave?.(e);
    },
    // Keyboard users get the same affordance without a pointer.
    onFocus: (e) => {
      setCursor(variant, label);
      children.props.onFocus?.(e);
    },
    onBlur: (e) => {
      resetCursor();
      children.props.onBlur?.(e);
    },
  });
}
