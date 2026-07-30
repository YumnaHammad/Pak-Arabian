'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import FlaconStage from '@/components/three/FlaconStage';
import BottleGlyph from '@/components/ui/BottleGlyph';
import Cursorable from '@/components/ui/Cursorable';
import { cn } from '@/lib/utils';

/**
 * Product gallery with two modes.
 *
 * "Photography" shows the uploaded images with a zoom-on-hover lens; "Object"
 * hands the frame to the real-time flacon so the bottle can be turned. When a
 * product has no photography the object view becomes the default rather than
 * showing an empty frame first.
 */
export default function ProductGallery({ product }) {
  const images = product.images?.filter(Boolean) || [];
  const hasPhotos = images.length > 0;

  const [mode, setMode] = useState(hasPhotos ? 'photo' : 'object');
  const [index, setIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [lens, setLens] = useState({ x: 50, y: 50 });
  const frame = useRef(null);
  const reduced = usePrefersReducedMotion();

  function onMove(e) {
    if (reduced) return;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setLens({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="lg:sticky lg:top-28">
      {/* ── Mode switch ── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-px" role="tablist" aria-label="Gallery view">
          {hasPhotos && (
            <ModeTab active={mode === 'photo'} onClick={() => setMode('photo')}>
              Photography
            </ModeTab>
          )}
          <ModeTab active={mode === 'object'} onClick={() => setMode('object')}>
            The object
          </ModeTab>
        </div>

        {mode === 'object' && (
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
            Move to rotate
          </p>
        )}
      </div>

      {/* ── Frame ── */}
      <div
        ref={frame}
        className="relative aspect-[4/5] overflow-hidden border border-hairline/50 bg-elevated"
        onMouseMove={onMove}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
      >
        <AnimatePresence mode="wait">
          {mode === 'object' ? (
            <motion.div
              key="object"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE.luxe }}
              className="absolute inset-0"
            >
              <FlaconStage
                category={product.category}
                label={product.name}
                subtitle={product.concentration}
                className="absolute inset-0"
                cameraZ={5.4}
                scrollRotations={0.5}
                showVapour={false}
                showMotes
              />
            </motion.div>
          ) : (
            <motion.div
              key={`photo-${index}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE.luxe }}
              className="absolute inset-0"
            >
              {images[index] ? (
                <Image
                  src={images[index]}
                  alt={`${product.name} — view ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out"
                  style={
                    zooming && !reduced
                      ? { transform: 'scale(1.75)', transformOrigin: `${lens.x}% ${lens.y}%` }
                      : undefined
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BottleGlyph className="h-1/2 w-auto text-ink-4" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Frame furniture */}
        <span className="pointer-events-none absolute left-5 top-5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4">
          {product.sku}
        </span>

        {mode === 'photo' && images.length > 1 && (
          <span className="pointer-events-none absolute bottom-5 right-5 font-mono text-[9px] tabular-nums tracking-[0.2em] text-ink-4">
            {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>
        )}

        {/* Corner ticks */}
        {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-b border-l', 'right-3 bottom-3 border-b border-r'].map(
          (pos) => (
            <span
              key={pos}
              aria-hidden
              className={cn('pointer-events-none absolute h-4 w-4 border-hairline/60', pos)}
            />
          )
        )}
      </div>

      {/* ── Thumbnails ── */}
      {mode === 'photo' && images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <Cursorable key={img + i} variant="link">
              <button
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'relative aspect-square overflow-hidden border transition-colors duration-500',
                  i === index ? 'border-[var(--accent)]' : 'border-hairline/50 hover:border-hairline'
                )}
              >
                <Image src={img} alt="" fill sizes="120px" className="object-cover" />
                {i !== index && <span className="absolute inset-0 bg-base/45" />}
              </button>
            </Cursorable>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeTab({ children, active, onClick }) {
  return (
    <Cursorable variant="link">
      <button
        role="tab"
        aria-selected={active}
        onClick={onClick}
        className={cn(
          'border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] transition-colors duration-500',
          active
            ? 'border-[var(--accent)] text-accent'
            : 'border-hairline/50 text-ink-4 hover:text-ink-2'
        )}
      >
        {children}
      </button>
    </Cursorable>
  );
}
