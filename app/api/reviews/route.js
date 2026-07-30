import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { getCustomerFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  productId: z.string().refine((v) => mongoose.isValidObjectId(v), 'Unknown product.'),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(''),
  body: z.string().trim().min(10, 'Tell us a little more.').max(2000),
  name: z.string().trim().min(2).max(80).optional(),
  location: z.string().trim().max(80).optional().default(''),
});

/** GET /api/reviews?productId=… — approved reviews plus an aggregate. */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId || !mongoose.isValidObjectId(productId)) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  }

  await dbConnect();

  const [reviews, agg] = await Promise.all([
    Review.find({ product: productId, approved: true }).sort({ createdAt: -1 }).limit(50).lean(),
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), approved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  return NextResponse.json({
    reviews: JSON.parse(JSON.stringify(reviews)),
    average: agg[0]?.average ? Number(agg[0].average.toFixed(2)) : null,
    count: agg[0]?.count || 0,
  });
}

/** POST — submits a review. Held for moderation before it appears. */
export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid review.' },
      { status: 400 }
    );
  }

  const session = await getCustomerFromRequest(req);
  const { productId, rating, title, body, name, location } = parsed.data;

  const author = session?.name || name;
  if (!author) {
    return NextResponse.json({ error: 'Enter your name.' }, { status: 400 });
  }

  await dbConnect();

  /* Mark the review verified when this account has actually bought the piece. */
  let verified = false;
  if (session) {
    const purchased = await Order.exists({
      $or: [{ account: session.id }, { 'customer.email': session.email }],
      'items.product': productId,
    });
    verified = !!purchased;
  }

  try {
    await Review.create({
      product: productId,
      customer: session?.id,
      name: author,
      location,
      rating,
      title,
      body,
      verified,
      approved: false,
    });
  } catch (e) {
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: 'You have already reviewed this fragrance.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Could not save your review.' }, { status: 400 });
  }

  return NextResponse.json(
    { ok: true, message: 'Thank you — your review will appear once reviewed by the house.' },
    { status: 201 }
  );
}
