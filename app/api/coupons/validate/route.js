import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

/**
 * Previews a discount code against the current cart.
 *
 * The subtotal is recomputed from the database rather than trusted from the
 * client, so the preview can never disagree with what the order route will
 * charge. This endpoint does not redeem anything — redemption happens once,
 * inside the order transaction.
 */
export async function POST(req) {
  const { code, items } = await req.json().catch(() => ({}));

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Enter a code.' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your bag is empty.' }, { status: 400 });
  }

  await dbConnect();

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) {
    return NextResponse.json({ error: 'That code is not recognised.' }, { status: 404 });
  }

  let subtotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId).select('price active').lean();
    if (!product || !product.active) continue;
    subtotal += product.price * Math.max(1, Number(item.qty) || 1);
  }

  const result = coupon.evaluate(subtotal);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  return NextResponse.json({
    code: coupon.code,
    description: coupon.description,
    discount: result.discount,
    subtotal,
    total: subtotal - result.discount,
  });
}
