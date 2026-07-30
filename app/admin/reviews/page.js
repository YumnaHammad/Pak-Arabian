import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import ReviewsModeration from '@/components/admin/ReviewsModeration';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Reviews' };

export default async function AdminReviewsPage() {
  await dbConnect();

  /* Populate needs the Product model registered on this connection. */
  Product.modelName;

  const reviews = await Review.find()
    .sort({ approved: 1, createdAt: -1 })
    .limit(300)
    .populate({ path: 'product', select: 'name slug' })
    .lean();

  return <ReviewsModeration initial={JSON.parse(JSON.stringify(reviews))} />;
}
