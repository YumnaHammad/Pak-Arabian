import * as THREE from 'three';

/**
 * Geometry + texture atelier.
 *
 * There are no .glb assets in this project, so the flacon is modelled
 * procedurally: a lathed glass silhouette, a lathed liquid volume that stops at
 * the fill line, a machined collar, and a label rendered to a canvas at runtime.
 *
 * Everything here is pure and memoisable — build once, share across instances.
 */

/* ── The flacon silhouette, bottom-centre to top-centre ──
   x is radius, y is height. A squared apothecary shoulder that breaks into a
   narrow neck: reads as couture rather than as a generic round bottle. */
const PROFILE = [
  [0.001, 0.0],
  [0.585, 0.0],
  [0.622, 0.045],
  [0.634, 0.16],
  [0.638, 1.18],
  [0.628, 1.36],
  [0.575, 1.52],
  [0.462, 1.652],
  [0.336, 1.742],
  [0.252, 1.808],
  [0.229, 1.876],
  [0.226, 2.06],
  [0.001, 2.062],
];

export function buildFlaconGeometry(segments = 96) {
  const points = PROFILE.map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(points, segments);
  geo.computeVertexNormals();
  return geo;
}

/** The juice: the same silhouette, inset, terminated at the fill line. */
export function buildLiquidGeometry(fill = 1.28, inset = 0.965, segments = 64) {
  const pts = [];
  for (const [x, y] of PROFILE) {
    if (y > fill) break;
    pts.push(new THREE.Vector2(x * inset, y * 0.998 + 0.008));
  }
  // Cap the surface flat at the meniscus.
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector2(last.x, fill));
  pts.push(new THREE.Vector2(0.001, fill));

  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/* ── Machined collar: a stepped ring that seats the cap on the neck ── */
export function buildCollarGeometry(segments = 64) {
  const pts = [
    [0.226, 0.0],
    [0.286, 0.0],
    [0.292, 0.014],
    [0.292, 0.086],
    [0.278, 0.104],
    [0.246, 0.104],
    [0.244, 0.15],
    [0.226, 0.15],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/* ── Stopper: weighted, slightly domed ── */
export function buildStopperGeometry(segments = 64) {
  const pts = [
    [0.001, 0.0],
    [0.208, 0.0],
    [0.214, 0.02],
    [0.31, 0.05],
    [0.322, 0.09],
    [0.324, 0.34],
    [0.312, 0.40],
    [0.268, 0.438],
    [0.16, 0.462],
    [0.001, 0.468],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Label artwork, drawn to a canvas so it ships with zero image requests and can
 * be re-rendered per product name. Transparent ground; the texture is applied to
 * a curved cylinder segment that hugs the glass.
 */
export function buildLabelTexture(title = 'PAK ARABIAN', subtitle = 'EAU DE PARFUM') {
  if (typeof document === 'undefined') return null;

  const W = 1024;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, W, H);

  // Hairline frame
  ctx.strokeStyle = 'rgba(233, 220, 180, 0.62)';
  ctx.lineWidth = 3;
  ctx.strokeRect(W * 0.16, H * 0.2, W * 0.68, H * 0.6);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Rule above the wordmark
  ctx.beginPath();
  ctx.moveTo(W * 0.34, H * 0.375);
  ctx.lineTo(W * 0.66, H * 0.375);
  ctx.strokeStyle = 'rgba(233, 220, 180, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Wordmark
  const name = String(title || 'PAK ARABIAN').toUpperCase().slice(0, 16);
  const size = name.length > 10 ? 92 : name.length > 7 ? 116 : 140;
  ctx.fillStyle = 'rgba(240, 232, 208, 0.95)';
  ctx.font = `300 ${size}px Georgia, "Times New Roman", serif`;
  ctx.fillText(name, W / 2, H * 0.485);

  // Tracked subtitle
  ctx.fillStyle = 'rgba(233, 220, 180, 0.72)';
  ctx.font = '400 34px Georgia, "Times New Roman", serif';
  drawTracked(ctx, String(subtitle).toUpperCase(), W / 2, H * 0.6, 13);

  // Rule below
  ctx.beginPath();
  ctx.moveTo(W * 0.4, H * 0.665);
  ctx.lineTo(W * 0.6, H * 0.665);
  ctx.strokeStyle = 'rgba(233, 220, 180, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = 'rgba(233, 220, 180, 0.5)';
  ctx.font = '400 26px Georgia, serif';
  drawTracked(ctx, 'SADIQABAD', W / 2, H * 0.72, 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Canvas has no letter-spacing, so tracked type is drawn glyph by glyph. */
function drawTracked(ctx, text, cx, y, tracking) {
  const chars = text.split('');
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let x = cx - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + tracking;
  });
  ctx.textAlign = prevAlign;
}

/**
 * A soft radial sprite used for gold motes and the aura planes. Generated once
 * and reused — again, no image assets on the wire.
 */
export function buildGlowTexture(inner = 'rgba(233,214,160,1)', outer = 'rgba(233,214,160,0)') {
  if (typeof document === 'undefined') return null;
  const S = 128;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.28, 'rgba(233,214,160,0.55)');
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Wispy, uneven cloud used for the smoke/aura planes. */
export function buildSmokeTexture() {
  if (typeof document === 'undefined') return null;
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');

  // Layered off-centre radial blooms read as vapour rather than a clean circle.
  for (let i = 0; i < 14; i++) {
    const x = S / 2 + (Math.random() - 0.5) * S * 0.5;
    const y = S / 2 + (Math.random() - 0.5) * S * 0.5;
    const r = S * (0.14 + Math.random() * 0.3);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + Math.random() * 0.07;
    g.addColorStop(0, `rgba(226,220,205,${a})`);
    g.addColorStop(1, 'rgba(226,220,205,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }

  // Fade the frame so the plane edge is never visible.
  const vign = ctx.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S * 0.5);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, S, S);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* Re-exported for convenience inside the WebGL layer. Anything that does *not*
   render with three must import from './juice' directly — importing it from
   here would pull the entire three runtime into that bundle. */
export { JUICE, juiceFor } from './juice';
