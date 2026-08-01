'use client';
import Link from 'next/link';
import { QUICK_ANSWERS, CONTACT } from '@/lib/content/site';
import { Accordion } from '@/components/ui/Primitives';

/**
 * The four questions that stop a sale.
 *
 * Payment, delivery time, how long the scent lasts, and what happens if they
 * do not like it. Answering these on the homepage means nobody has to go
 * hunting through the FAQ before they feel safe ordering.
 */
export default function QuickAnswers() {
  return (
    <section className="shell-wide py-16 md:py-24" aria-labelledby="answers-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="eyebrow">Before you order</p>
          <h2
            id="answers-heading"
            className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold"
          >
            Common questions
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
            Still unsure about something? Message the shop directly — we answer
            within the hour.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[3rem] items-center border border-hairline px-5 text-[14px] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              WhatsApp {CONTACT.phone}
            </a>
            <Link
              href="/faq"
              className="flex min-h-[3rem] items-center px-1 text-[14px] font-semibold text-accent hover:underline"
            >
              All questions →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Accordion items={QUICK_ANSWERS} defaultOpen={0} />
        </div>
      </div>
    </section>
  );
}
