import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getCustomerFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * A customer's own orders.
 *
 * Matches on the account reference *or* the email captured at checkout, so
 * orders placed as a guest before registering still appear once the shopper
 * signs up with the same address.
 */
export async function GET(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  await dbConnect();
  const orders = await Order.find({
    $or: [{ account: session.id }, { 'customer.email': session.email }],
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
}
