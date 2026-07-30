import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import { getCustomerFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function unauthorised() {
  return NextResponse.json({ error: 'Sign in to use your wishlist.' }, { status: 401 });
}

/** GET — the saved products, populated for rendering. */
export async function GET(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return unauthorised();

  await dbConnect();
  const customer = await Customer.findById(session.id)
    .populate({ path: 'wishlist', match: { active: true } })
    .lean();

  const items = (customer?.wishlist || []).filter(Boolean);
  return NextResponse.json({ items: JSON.parse(JSON.stringify(items)) });
}

/** POST — toggles a product in the wishlist; returns the new state. */
export async function POST(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return unauthorised();

  const { productId } = await req.json().catch(() => ({}));
  if (!mongoose.isValidObjectId(productId)) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  }

  await dbConnect();

  const exists = await Product.exists({ _id: productId });
  if (!exists) return NextResponse.json({ error: 'Unknown product.' }, { status: 404 });

  const customer = await Customer.findById(session.id).select('wishlist');
  if (!customer) return unauthorised();

  const has = customer.wishlist.some((id) => id.toString() === productId);

  await Customer.updateOne(
    { _id: session.id },
    has ? { $pull: { wishlist: productId } } : { $addToSet: { wishlist: productId } }
  );

  return NextResponse.json({ saved: !has });
}

/** DELETE — removes one product, or clears the list when no id is given. */
export async function DELETE(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return unauthorised();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  await dbConnect();

  if (productId) {
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
    }
    await Customer.updateOne({ _id: session.id }, { $pull: { wishlist: productId } });
  } else {
    await Customer.updateOne({ _id: session.id }, { $set: { wishlist: [] } });
  }

  return NextResponse.json({ ok: true });
}
