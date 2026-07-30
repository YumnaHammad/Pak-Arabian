import Link from 'next/link';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { BRAND, INGREDIENTS } from '@/lib/content/site';
import { formatPKR } from '@/lib/utils';

import ProductGallery from '@/components/product/ProductGallery';
import PurchasePanel from '@/components/product/PurchasePanel';
import NotePyramid from '@/components/product/NotePyramid';
import Reviews from '@/components/product/Reviews';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import ProductCard from '@/components/product/ProductCard';
import { Eyebrow } from '@/components/ui/Primitives';
import Reveal from '@/components/ui/Reveal';
import SplitText from '@/components/ui/SplitText';

export const dynamic = 'force-dynamic';

async function getProduct(slug) {
  await dbConnect();
  const product = await Product.findOne({ slug, active: true }).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelated(category, currentSlug) {
  await dbConnect();
  const related = await Product.find({ active: true, category, slug: { $ne: currentSlug } })
    .limit(4)
    .lean();
  return JSON.parse(JSON.stringify(related));
}

/**
 * Aggregate rating for structured data — omitted entirely when there is none.
 *
 * `productId` arrives as a string (the document was serialised for the client),
 * and the aggregation pipeline does no casting the way a query filter would —
 * it has to be an ObjectId or `$match` silently matches nothing.
 */
async function getRatingSummary(productId) {
  if (!mongoose.isValidObjectId(productId)) return null;

  try {
    await dbConnect();
    const [agg] = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), approved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return agg?.count ? { average: Number(agg.average.toFixed(2)), count: agg.count } : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug).catch(() => null);
  if (!product) return { title: 'Not found' };

  const description =
    product.description ||
    `${product.name} — ${product.concentration}, ${product.volumeMl}ml, composed by ${BRAND.legal}.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — ${BRAND.legal}`,
      description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${BRAND.legal}`,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const [related, rating] = await Promise.all([
    getRelated(product.category, product.slug),
    getRatingSummary(product._id),
  ]);

  /* Materials in this composition that the house documents in depth. */
  const allNotes = [
    ...(product.notes?.top || []),
    ...(product.notes?.heart || []),
    ...(product.notes?.base || []),
  ].map((n) => String(n).toLowerCase());

  const documented = INGREDIENTS.filter((ing) =>
    allNotes.some(
      (n) => n.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(n)
    )
  ).slice(0, 3);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images?.length ? product.images : undefined,
    brand: { '@type': 'Brand', name: BRAND.legal },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'PKR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.average,
        reviewCount: rating.count,
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Collection', item: '/collection' },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `/collection?category=${product.category}`,
      },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Masthead ── */}
      <header className="shell-wide pt-32 md:pt-44">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4">
            <li>
              <Link href="/collection" className="transition-colors hover:text-accent">
                Collection
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/collection?category=${product.category}`}
                className="capitalize transition-colors hover:text-accent"
              >
                {product.category}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink-2">{product.name}</li>
          </ol>
        </nav>

        <div className="mt-12 flex flex-col justify-between gap-6 border-b border-hairline/50 pb-12 md:flex-row md:items-end">
          <SplitText
            as="h1"
            lines={[product.name]}
            className="font-display text-display-sm font-light"
          />
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4 md:text-right">
            {product.concentration}
            <br />
            {product.volumeMl}ml · {product.sku}
          </p>
        </div>
      </header>

      {/* ── Gallery + purchase ── */}
      <section className="shell-wide mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
        <ProductGallery product={product} />

        <div className="flex flex-col">
          <Reveal>
            <Eyebrow>The composition</Eyebrow>
            <p className="mt-8 max-w-prose font-display text-2xl font-light leading-relaxed text-ink-2">
              {product.description || 'Composed in small batches at the house bench.'}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.26em] text-ink-4">
              How it unfolds
            </h2>
            <div className="mt-8">
              <NotePyramid notes={product.notes} />
            </div>
          </Reveal>

          <div className="mt-14">
            <PurchasePanel product={product} />
          </div>
        </div>
      </section>

      {/* ── Material provenance ── */}
      {documented.length > 0 && (
        <section className="section" aria-labelledby="materials-heading">
          <div className="shell-wide">
            <Eyebrow>Inside the formula</Eyebrow>
            <h2
              id="materials-heading"
              className="mt-7 max-w-2xl font-display text-display-sm font-light"
            >
              Where these materials come from.
            </h2>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {documented.map((ing, i) => (
                <Reveal key={ing.id} delay={i * 0.1}>
                  <article className="group relative h-full overflow-hidden border border-hairline/50 bg-elevated p-8">
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-60 transition-opacity duration-700 group-hover:opacity-90"
                      style={{
                        background: `radial-gradient(70% 60% at 70% 20%, ${ing.hue}66, transparent 70%)`,
                        filter: 'blur(30px)',
                      }}
                    />
                    <div className="relative">
                      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                        {ing.note} · {ing.family}
                      </p>
                      <h3 className="mt-5 font-display text-3xl font-light">{ing.name}</h3>
                      <p className="mt-1.5 font-display text-base italic text-ink-4">
                        {ing.latin}
                      </p>
                      <p className="mt-6 text-[14px] leading-relaxed text-ink-3">{ing.blurb}</p>
                      <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                        — {ing.origin}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ── */}
      <Reviews productId={product._id} productName={product.name} />

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="section border-t border-hairline/50" aria-labelledby="related-heading">
          <div className="shell-wide">
            <div className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>Composed alongside</Eyebrow>
                <h2 id="related-heading" className="mt-7 font-display text-display-sm font-light">
                  From the same shelf.
                </h2>
              </div>
              <Link
                href={`/collection?category=${product.category}`}
                className="link-draw shrink-0 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-2 hover:text-accent"
              >
                All {product.category} →
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently viewed ── */}
      <RecentlyViewed current={product} />

      {/* Screen-reader-only price restatement for context after a long page */}
      <p className="sr-only">
        {product.name} is priced at {formatPKR(product.price)}.
      </p>
    </>
  );
}
