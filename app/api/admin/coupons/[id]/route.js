import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  /* Only these fields may be changed after creation — `usedCount` in
     particular must never be writable from the client. */
  const update = {};
  if (typeof body.active === 'boolean') update.active = body.active;
  if (typeof body.description === 'string') update.description = body.description.slice(0, 160);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  await dbConnect();
  const coupon = await Coupon.findByIdAndUpdate(params.id, update, { new: true });
  if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ coupon: JSON.parse(JSON.stringify(coupon)) });
}

export async function DELETE(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await dbConnect();
  await Coupon.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
