import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import { BRAND } from '@/lib/content/site';

import Hero from '@/components/home/Hero';
import Manifesto from '@/components/home/Manifesto';
import HouseStory from '@/components/home/HouseStory';
import Ingredients from '@/components/home/Ingredients';
import SignatureCollection from '@/components/home/SignatureCollection';
import FeaturedFragrance from '@/components/home/FeaturedFragrance';
import Craft from '@/components/home/Craft';
import Film from '@/components/home/Film';
import CollectionDoors from '@/components/home/CollectionDoors';
import Testimonials from '@/components/home/Testimonials';
import Gallery from '@/components/home/Gallery';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${BRAND.legal} — ${BRAND.tagline}`,
  description: BRAND.description,
  alternates: { canonical: '/' },
};

/**
 * Homepage data.
 *
 * One query, shaped in memory — the page needs the same documents four times
 * over (signature row, feature, collection covers, feed), and four round trips
 * for one collection would be waste.
 *
 * A database that is unreachable degrades to the editorial sections rather than
 * throwing: the house story, materials and method do not depend on inventory.
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
  /* The old storefront lived at `/?category=`. Those links, and anything
     bookmarked, now land on the dedicated collection page. */
  if (searchParams?.category || searchParams?.sort) {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    redirect(`/collection?${params.toString()}`);
  }

  const products = await getHomeData();

  const featured = products.filter((p) => p.featured);
  const signature = (featured.length >= 4 ? featured : products).slice(0, 8);

  /* The feature is the highest-priced piece in stock — the house's best foot. */
  const feature =
    [...products].filter((p) => p.stock > 0).sort((a, b) => b.price - a.price)[0] ||
    products[0] ||
    null;

  const covers = products.reduce((acc, p) => {
    if (p.images?.[0] && !acc[p.category]) acc[p.category] = p.images[0];
    return acc;
  }, {});

  const galleryImages = [...new Set(products.flatMap((p) => p.images || []))].slice(0, 8);

  return (
    <>
      <Hero featuredCategory={feature?.category || 'signature'} />
      <Manifesto />
      <HouseStory image={galleryImages[0] || null} />
      <Ingredients />
      <SignatureCollection products={signature} />
      <FeaturedFragrance product={feature} />
      <Craft />
      <Film />
      <CollectionDoors covers={covers} />
      <Testimonials />
      <Gallery images={galleryImages} />
    </>
  );
}
