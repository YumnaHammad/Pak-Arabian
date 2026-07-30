import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import { BRAND, CATEGORIES } from '@/lib/content/site';
import CollectionView from '@/components/collection/CollectionView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const category = searchParams?.category || '';
  const match = CATEGORIES.find((c) => c.value === category);
  const name = match && match.value ? match.label : 'The Library';

  return {
    title: name,
    description: match?.blurb
      ? `${match.blurb} — ${BRAND.legal} eaux de parfum, composed in small batches.`
      : BRAND.description,
    alternates: {
      canonical: category ? `/collection?category=${category}` : '/collection',
    },
  };
}

/**
 * The library.
 *
 * Sorting and filtering both happen in the database — the same query shape the
 * previous storefront used, so `?category=` and `?sort=` links continue to
 * resolve identically. The client view then handles refinement without a round
 * trip, which is what lets the grid animate between states.
 */
async function getProducts(category, sort) {
  try {
    await dbConnect();

    const filter = { active: true };
    if (category) filter.category = category;

    let sortObj = { featured: -1, createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'name') sortObj = { name: 1 };

    const products = await Product.find(filter).sort(sortObj).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('[collection] query failed:', error.message);
    return [];
  }
}

/** Counts per category, so the filter bar can show what is behind each door. */
async function getCounts() {
  try {
    await dbConnect();
    const rows = await Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const counts = rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
    counts[''] = Object.values(counts).reduce((a, b) => a + b, 0);
    return counts;
  } catch {
    return {};
  }
}

export default async function CollectionPage({ searchParams }) {
  const category = searchParams?.category || '';
  const sort = searchParams?.sort || '';

  const [products, counts] = await Promise.all([getProducts(category, sort), getCounts()]);

  return (
    <CollectionView
      products={products}
      counts={counts}
      activeCategory={category}
      activeSort={sort}
    />
  );
}
