import CheckoutFlow from '@/components/checkout/CheckoutFlow';

export const metadata = {
  title: 'Checkout',
  description: 'Complete your order — payment on delivery, despatched from Sadiqabad.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
