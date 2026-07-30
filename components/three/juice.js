/**
 * Juice colours per fragrance family, keyed off `Product.category`.
 *
 * Deliberately kept in its own module with no three.js import. The SVG poster,
 * the 404 page and the account panel all need this palette but must never pull
 * the WebGL runtime into the initial bundle — importing it from `atelier.js`
 * dragged ~370 KB of three into every first load.
 */
export const JUICE = {
  men: '#5A3A1C',
  women: '#8E3A45',
  unisex: '#B0813A',
  signature: '#6B3F14',
  woody: '#4A3218',
  floral: '#C08A50',
  default: '#7A4E1C',
};

export function juiceFor(category) {
  return JUICE[category] || JUICE.default;
}
