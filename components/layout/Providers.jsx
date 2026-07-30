'use client';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import SmoothScroll from './SmoothScroll';
import Cursor from './Cursor';
import Grain from './Grain';
import Loader from './Loader';
import PageTransition from './PageTransition';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from './SearchOverlay';
import { ScrollProgress } from '@/components/ui/Primitives';

/**
 * Single composition point for every global layer.
 *
 * The admin panel deliberately opts out of the storefront chrome — no loader,
 * no inertial scroll, no custom cursor. An inventory tool should feel fast and
 * conventional, not cinematic.
 */
export default function Providers({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <SmoothScroll />
          <Loader />
          <Grain />
          <Cursor />
          <ScrollProgress />

          <Navbar />

          <main id="main" className="relative min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>

          <Footer />
          <CartDrawer />
          <SearchOverlay />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
