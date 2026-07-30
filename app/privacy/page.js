import { BRAND, CONTACT } from '@/lib/content/site';
import LegalPage from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  description: `How ${BRAND.legal} handles your personal information.`,
  alternates: { canonical: '/privacy' },
};

/*
 * Updated to describe what the site actually stores now that accounts,
 * wishlists, reviews and enquiries exist — a policy that under-describes the
 * data held is worse than no policy.
 */
const SECTIONS = [
  {
    title: 'What we collect',
    content:
      'When you place an order we collect your name, email address, telephone number and delivery address. If you open an account we also hold your saved addresses, your wishlist and your order history. If you write a review or send an enquiry, we keep what you wrote. Your cart and recently-viewed list stay on your own device and are never sent to us.',
  },
  {
    title: 'How we use it',
    content:
      'To prepare and deliver your orders, to answer your enquiries, and — only if you asked for it — to write to you when a new composition is released. We do not sell your personal data, and we do not share it for advertising.',
  },
  {
    title: 'Passwords',
    content:
      'Account passwords are stored only as a one-way hash. Nobody at the house can read your password, and it cannot be recovered from our records — only reset.',
  },
  {
    title: 'Security',
    content:
      'We apply standard security measures to protect the information we hold, including hashed credentials and signed, http-only session cookies. No transmission over the internet is ever entirely secure, and we cannot guarantee absolute security.',
  },
  {
    title: 'Cookies',
    content:
      'We set a session cookie when you sign in, and store your theme preference and cart on your device. We do not run third-party advertising or cross-site tracking cookies. Disabling cookies will sign you out and clear your saved preferences.',
  },
  {
    title: 'Third parties',
    content:
      'Courier services receive the name, address and telephone number needed to deliver your parcel, and nothing else. Our database is hosted by a third-party provider under their own security terms.',
  },
  {
    title: 'Your rights',
    content: `You may ask to see, correct or delete the personal information we hold about you. Write to ${CONTACT.email} and we will respond within seven working days.`,
  },
  {
    title: 'Retention',
    content:
      'Order records are retained for five years for accounting purposes. Account details are kept until you ask us to delete them. Enquiries are kept for two years.',
  },
  {
    title: 'Changes',
    content:
      'This policy may be updated from time to time. Changes are published on this page with a revised date; continued use of the site after a change constitutes acceptance of it.',
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 2026"
      intro={`What ${BRAND.legal} collects, why it is collected, and what you can ask us to do with it.`}
      sections={SECTIONS}
    />
  );
}
