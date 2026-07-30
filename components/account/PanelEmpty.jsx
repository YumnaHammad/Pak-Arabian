import Link from 'next/link';
import BottleGlyph from '@/components/ui/BottleGlyph';

/** Shared empty state for the account panels. */
export default function PanelEmpty({ title, body, cta }) {
  return (
    <div className="flex flex-col items-start border-y border-hairline/50 py-20">
      <BottleGlyph className="h-14 w-14 text-ink-4" />
      <p className="mt-8 font-display text-3xl font-light">{title}</p>
      <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-3">{body}</p>
      {cta && (
        <Link href={cta.href} className="btn-luxe mt-10">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
