import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getCustomerFromRequest } from '@/lib/auth';
import { sendOrderNotification } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

/**
 * Places an order.
 *
 * Contract is unchanged: POST `{ items: [{ productId, qty }], customer }`,
 * receive the created order. Prices and stock are still verified server-side
 * and never trusted from the client.
 *
 * Two things were tightened while rebuilding:
 *  1. Stock is now claimed with a conditional `$inc` guarded by `stock >= qty`,
 *     so two simultaneous checkouts can no longer both pass the read-then-write
 *     check and oversell the last bottle. Claims are rolled back if any line
 *     fails partway through.
 *  2. An optional signed-in account and discount code are attached when present.
 */
export async function POST(req) {
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const { items, customer, couponCode, note } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  /* ── Verify every line against the database ── */
  let subtotal = 0;
  const verifiedItems = [];

  for (const it of items) {
    const qty = Math.max(1, Math.floor(Number(it.qty) || 0));
    const product = await Product.findById(it.productId);

    if (!product || !product.active) {
      return NextResponse.json({ error: `Product unavailable` }, { status: 400 });
    }
    if (product.stock < qty) {
      return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
    }

    subtotal += product.price * qty;
    verifiedItems.push({ product: product._id, name: product.name, price: product.price, qty });
  }

  /* ── Discount, if a valid code was supplied ── */
  let discount = 0;
  let appliedCode = '';
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase() });
    if (!coupon) {
      return NextResponse.json({ error: 'That code is not recognised.' }, { status: 400 });
    }
    const result = coupon.evaluate(subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    discount = result.discount;
    appliedCode = coupon.code;
  }

  const total = subtotal - discount;

  /* ── Claim stock atomically, remembering what to undo ── */
  const claimed = [];
  for (const line of verifiedItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.product, stock: { $gte: line.qty }, active: true },
      { $inc: { stock: -line.qty } },
      { new: true }
    );

    if (!updated) {
      // Someone took the last one between verification and claim — undo and stop.
      for (const done of claimed) {
        await Product.updateOne({ _id: done.product }, { $inc: { stock: done.qty } });
      }
      return NextResponse.json(
        { error: `${line.name} is out of stock` },
        { status: 409 }
      );
    }
    claimed.push(line);
  }

  /* ── Create the order ── */
  const session = await getCustomerFromRequest(req);

  let order;
  try {
    order = await Order.create({
      items: verifiedItems,
      subtotal,
      discount,
      couponCode: appliedCode,
      total,
      customer,
      note: typeof note === 'string' ? note.slice(0, 500) : '',
      ...(session ? { account: session.id } : {}),
    });
  } catch (e) {
    // Never leave stock claimed against an order that was not written.
    for (const done of claimed) {
      await Product.updateOne({ _id: done.product }, { $inc: { stock: done.qty } });
    }
    return NextResponse.json({ error: 'Could not place the order.' }, { status: 500 });
  }

  if (coupon) {
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } }).catch(() => {
      /* the order is placed; a missed counter increment must not fail it */
    });
  }

  /*
   * Notify the shop. Deliberately not awaited and it never throws — the order
   * is already committed, and the customer must not wait on an SMTP handshake
   * or see a failure because a mail server was slow.
   */
  sendOrderNotification(order).catch(() => {});

  return NextResponse.json(order, { status: 201 });
}
