import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Prices are stored as plain PKR numbers throughout the DB. */
export function formatPKR(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Maps a value from one range to another, clamped to the output range. */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = clamp((value - inMin) / (inMax - inMin || 1), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** Splits a string into words, each wrapped for per-word stagger animation. */
export function toWords(text) {
  return String(text || '').split(' ').filter(Boolean);
}

/** Stable index-based key for content arrays that have no id. */
export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Order ids are long ObjectIds — surface only the human-readable tail. */
export function shortId(id) {
  return `#${String(id || '').slice(-8).toUpperCase()}`;
}
