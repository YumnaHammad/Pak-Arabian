import { BRAND, CONTACT } from '@/lib/content/site';
import LegalPage from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Terms & Conditions',
  description: `Terms and conditions for ${BRAND.legal}.`,
  alternates: { canonical: '/terms' },
};

/*
 * Clause substance is carried over from the previous document. The trading
 * entity, contact address and returns window have been corrected to match the
 * business as it actually operates — the earlier copy named a different house
 * and an email that does not exist.
 */
const SECTIONS = [
  {
    title: 'General',
    content: `By accessing this website and placing an order you accept and agree to be bound by these terms. ${BRAND.legal} reserves the right to amend them at any time; the version published here at the moment of your order is the version that applies to it.`,
  },
  {
    title: 'Products & pricing',
    content:
      'All prices are listed in Pakistani Rupees and are inclusive of applicable taxes. Prices, product descriptions, photography and availability may change without prior notice. Because compositions are produced in small batches, a piece may be unavailable between macerations.',
  },
  {
    title: 'Orders & payment',
    content:
      'An order is confirmed when it appears on your confirmation page and carries a reference. Payment is collected on delivery. We reserve the right to cancel an order where stock is unavailable, where the delivery details cannot be verified, or where the order appears fraudulent.',
  },
  {
    title: 'Shipping',
    content: `Orders leave ${BRAND.city} within one working day. Delivery is typically two to four working days nationwide and next-day within Punjab for orders placed before noon. Delivery costs are confirmed at despatch.`,
  },
  {
    title: 'Returns & refunds',
    content: `Sealed, unopened bottles may be returned within fourteen days of delivery. Because fragrance is applied to skin, opened bottles cannot be accepted unless the product is faulty. Breakage in transit is replaced at no cost when reported within forty-eight hours. To begin a return, write to ${CONTACT.email} or message ${CONTACT.phone}.`,
  },
  {
    title: 'Intellectual property',
    content: `All content on this website — text, photography, artwork, the wordmark and the fragrance formulations themselves — is the intellectual property of ${BRAND.legal} and may not be reproduced without written permission.`,
  },
  {
    title: 'Limitation of liability',
    content: `${BRAND.legal} is not liable for indirect, incidental or consequential damages arising from the use of its products or this website. Liability is limited to the purchase price of the product in question. Nothing in these terms limits liability where it cannot lawfully be limited.`,
  },
  {
    title: 'Governing law',
    content:
      'These terms are governed by the laws of Pakistan, and any dispute arising under them is subject to the jurisdiction of the Pakistani courts.',
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="July 2026"
      intro={`These terms govern your use of this website and any order placed with ${BRAND.legal}. Please read them before ordering.`}
      sections={SECTIONS}
    />
  );
}
