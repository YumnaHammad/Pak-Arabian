'use client';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { BRAND, CONTACT } from '@/lib/content/site';
import { useT } from '@/lib/i18n';

const SHOP = [
  { k: 'r.perfumes', href: '/collection?q=perfume' },
  { k: 'r.attars', href: '/collection?q=attar' },
  { k: 'r.honey', href: '/collection?q=honey' },
  { k: 'r.dates', href: '/collection?q=dates' },
  { k: 'r.gift', href: '/collection?q=gift' },
  { k: 'r.caps', href: '/collection?q=cap' },
  { k: 'f.all', href: '/collection' },
];

const HELP = [
  { k: 'nav.about', href: '/about' },
  { k: 'nav.contact', href: '/contact' },
  { k: 'nav.faq', href: '/faq' },
  { k: 'f.returns', href: '/faq#returns' },
  { k: 'f.account', href: '/account' },
];

const SOCIAL = {
  Facebook: 'M14 8h3V4h-3c-2.8 0-4 1.8-4 4.2V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.2-.6.6-.6z',
  Instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-2.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z',
  TikTok: 'M16 3c.4 2.4 1.9 4 4.5 4.2v3.3c-1.7 0-3.2-.5-4.5-1.4V15a6 6 0 1 1-6-6v3.4a2.6 2.6 0 1 0 2.6 2.6V3z',
  WhatsApp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.7 1c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z',
};

/**
 * Footer: always on the brand teal, with the mark large and centred — the
 * same composition as the back of the business card.
 */
export default function Footer() {
  const t = useT();
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapsQuery)}`;

  return (
    <footer className="relative isolate mt-10 overflow-hidden bg-[#083234] text-[#fbf3e2]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,#0f6266_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#fbf3e2_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* ── Mark ── */}
      <div className="shell-wide flex flex-col items-center pb-14 pt-20 text-center md:pt-24">
        <Link href="/" aria-label={BRAND.legal} className="transition-transform duration-500 hover:scale-[1.03]">
          <Logo className="h-52 w-[168px] text-[#fbf3e2] md:h-64 md:w-[206px]" />
        </Link>
        <div className="mt-8 flex w-full max-w-xl items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d9b45a]" />
          <span className="h-2 w-2 rotate-45 bg-[#d9b45a]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d9b45a]" />
        </div>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#fbf3e2]/80">{t('f.tag')}</p>

        <ul className="mt-8 flex gap-3">
          {CONTACT.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#fbf3e2]/20 text-[#fbf3e2]/85 transition-all hover:-translate-y-0.5 hover:border-[#d9b45a] hover:bg-[#d9b45a] hover:text-[#083234]"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d={SOCIAL[s.label]} fillRule="evenodd" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Columns ── */}
      <div className="shell-wide grid grid-cols-2 gap-x-8 gap-y-12 border-t border-[#fbf3e2]/10 py-14 lg:grid-cols-4">
        <FooterList title={t('f.shop')} items={SHOP} t={t} />
        <FooterList title={t('f.help')} items={HELP} t={t} />

        <div className="col-span-2 sm:col-span-1">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#d9b45a]">{t('f.visit')}</p>
          <address className="mt-5 text-[15px] not-italic leading-relaxed text-[#fbf3e2]/80">
            {t('f.addr1')}
            <br />
            {t('f.addr2')}
          </address>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#fbf3e2]/20 px-4 py-2 text-[14px] font-semibold transition-colors hover:border-[#d9b45a] hover:text-[#d9b45a]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" /></svg>
            {t('f.dir')}
          </a>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#d9b45a]">{t('f.call')}</p>
          <ul className="mt-5 space-y-4">
            {CONTACT.people.map((p) => (
              <li key={p.phone}>
                <p className="text-[14px] text-[#fbf3e2]/65">{p.name}</p>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-2 text-[17px] font-semibold tabular-nums transition-colors hover:text-[#d9b45a]" dir="ltr">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#25d366]" fill="currentColor" aria-hidden><path d={SOCIAL.WhatsApp} /></svg>
                  {p.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Legal ── */}
      <div className="border-t border-[#fbf3e2]/10">
        <div className="shell-wide flex flex-col items-center justify-between gap-3 py-6 text-[13px] text-[#fbf3e2]/55 md:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.legal}. {t('f.rights')}</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#d9b45a]">{t('f.terms')}</Link>
            <Link href="/privacy" className="hover:text-[#d9b45a]">{t('f.privacy')}</Link>
            <a href="https://www.pakarabian.pk" className="hover:text-[#d9b45a]" dir="ltr">www.pakarabian.pk</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items, t }) {
  return (
    <nav aria-label={title}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#d9b45a]">{title}</p>
      <ul className="mt-5 space-y-3">
        {items.map((l) => (
          <li key={l.href + l.k}>
            <Link href={l.href} className="text-[15px] text-[#fbf3e2]/80 transition-colors hover:text-[#d9b45a]">
              {t(l.k)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
