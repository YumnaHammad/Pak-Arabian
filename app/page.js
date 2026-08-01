import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import { BRAND, PITCH } from '@/lib/content/site';

import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';
import ShopCategories from '@/components/home/ShopCategories';
import SignatureCollection from '@/components/home/SignatureCollection';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import HouseStory from '@/components/home/HouseStory';
import Ingredients from '@/components/home/Ingredients';
import QuickAnswers from '@/components/home/QuickAnswers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${BRAND.legal} — Original Perfumes, Made in Pakistan`,
  description:
    'Long-lasting eau de parfum bottled by hand in Sadiqabad. Cash on delivery, nationwide delivery in 2–4 days, 14-day returns.',
  alternates: { canonical: '/' },
};

/**
 * Homepage data.
 *
 * One query, shaped in memory — the page needs the same documents three times
 * over (best sellers, category covers, counts), and three round trips for one
 * collection would be waste.
 *
 * A database that is unreachable degrades to the explanatory sections rather
 * than throwing: how ordering works and what the shop is do not depend on
 * inventory.
 */
async function getHomeData() {
  try {
    await dbConnect();
    const products = await Product.find({ active: true })
      .sort({ featured: -1, createdAt: -1 })
      .limit(40)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('[home] product query failed:', error.message);
    return [];
  }
}

export default async function HomePage({ searchParams }) {
  /* The old storefront lived at `/?category=`. Those links still resolve. */
  if (searchParams?.category || searchParams?.sort) {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    redirect(`/collection?${params.toString()}`);
  }

  const products = await getHomeData();

  const featured = products.filter((p) => p.featured);
  const bestSellers = (featured.length >= 4 ? featured : products).slice(0, 8);
  const inStock = products.filter((p) => p.stock > 0);

  const covers = products.reduce((acc, p) => {
    if (p.images?.[0] && !acc[p.category]) acc[p.category] = p.images[0];
    return acc;
  }, {});

  const counts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const heroCategory = inStock[0]?.category || products[0]?.category || 'signature';

  /* Lowest live price keeps the "from" figure honest against real inventory. */
  const priceFrom = inStock.length
    ? Math.min(...inStock.map((p) => p.price))
    : PITCH.priceFrom;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.legal,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pakarabian.example.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: '/collection?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── 1. What this is, what it costs, how to buy ── */}
      <Hero featuredCategory={heroCategory} productCount={products.length} />

      {/* ── 2. Why it is safe to order ── */}
      <TrustBar />

      {/* ── 3. Where do I start? ── */}
      <ShopCategories covers={covers} counts={counts} />

      {/* ── 4. Actual products, with prices and Add to Bag ── */}
      <SignatureCollection products={bestSellers} />

      {/* ── 5. Ordering explained end to end ── */}
      <HowItWorks />

      {/* ── 6. Proof from other customers ── */}
      <Testimonials />

      {/* ── 7. Who we are — story comes after the sale is understood ── */}
      <HouseStory image={products.find((p) => p.images?.[0])?.images?.[0] || null} />

      {/* ── 8. What goes into it ── */}
      <Ingredients />

      {/* ── 9. Last objections handled ── */}
      <QuickAnswers />

      <p className="sr-only">
        {BRAND.legal} sells original eau de parfum from {BRAND.city}, Pakistan, from{' '}
        {priceFrom} rupees, with cash on delivery nationwide.
      </p>
    </>
  );
}
