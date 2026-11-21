'use client';
import { CONTACT } from '@/lib/content/site';
import { useT } from '@/lib/i18n';

/** Always-visible WhatsApp chat button, bottom-right on every storefront page. */
export default function WhatsAppFloat() {
  const t = useT();
  return (
    <a
      href={`${CONTACT.whatsapp}?text=${encodeURIComponent('Assalam o Alaikum, I want to order from Pak Arabian Fragrances.')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('hero.whatsapp')}
      title={t('hero.whatsapp')}
      className="group fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-110 md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366]" />
      <svg viewBox="0 0 24 24" className="relative h-7 w-7 md:h-8 md:w-8" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.7 1c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z" />
      </svg>
    </a>
  );
}
