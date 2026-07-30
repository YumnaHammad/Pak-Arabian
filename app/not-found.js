import Link from 'next/link';
import { BRAND } from '@/lib/content/site';
import FlaconPoster from '@/components/three/FlaconPoster';

export const metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="shell-wide flex min-h-[86vh] items-center pb-24 pt-32">
      <div className="grid w-full items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Error 404</p>

          <h1 className="mt-8 font-display text-display-md font-light leading-[0.9]">
            This shelf
            <br />
            <span className="italic text-ink-3">is empty.</span>
          </h1>

          <p className="mt-9 max-w-prose text-[15px] leading-relaxed text-ink-2">
            The page you were looking for is not here. It may have been a piece
            that sold through, or a link that has gone stale.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/collection" className="btn-solid">
              Browse the library
            </Link>
            <Link href="/" className="btn-luxe">
              Return home
            </Link>
          </div>

          <p className="mt-14 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
            {BRAND.legal} — {BRAND.city}
          </p>
        </div>

        <div className="relative hidden aspect-square lg:block">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 55% at 50% 50%, rgba(201,162,39,0.13), transparent 70%)',
            }}
          />
          <FlaconPoster category="signature" className="relative p-16 opacity-45" />
        </div>
      </div>
    </div>
  );
}
