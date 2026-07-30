import AccountShell from '@/components/account/AccountShell';

export const metadata = {
  title: 'Your account',
  description: 'Orders, wishlist, addresses and profile.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountShell />;
}
