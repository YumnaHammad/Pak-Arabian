import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import { CATEGORIES } from '@/lib/content/site';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://azwah.example.com';

/**
 * Generated per request, never prerendered.
 *
 * As a static route this is built once — and a build that cannot reach the
 * database (or simply runs before the catalogue changes) would ship a sitemap
 * with no products in it, permanently. Crawlers hit this rarely enough that the
 * query cost is irrelevant next to being correct.
 */
export const dynamic = 'force-dynamic';

/**
 * Dynamic sitemap.
 *
 * Static routes, one entry per category door, and every active product. If the
 * database is unreachable the static routes are still emitted — a partial
 * sitemap is far better than a 500 to a crawler.
 */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: '/', priority: 1, changeFrequency: 'daily' },
    { url: '/collection', priority: 0.9, changeFrequency: 'daily' },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/terms', priority: 0.2, changeFrequency: 'yearly' },
    { url: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryRoutes = CATEGORIES.filter((c) => c.value).map((c) => ({
    url: `${SITE_URL}/collection?category=${c.value}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  let productRoutes = [];
  try {
    await dbConnect();
    const products = await Product.find({ active: true })
      .select('slug updatedAt')
      .lean();

    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[sitemap] product query failed:', error.message);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
