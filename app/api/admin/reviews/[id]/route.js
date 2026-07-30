import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

/** PUT — approve or unapprove a review. */
export async function PUT(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { approved } = await req.json().catch(() => ({}));
  if (typeof approved !== 'boolean') {
    return NextResponse.json({ error: 'Expected an approval state.' }, { status: 400 });
  }

  await dbConnect();
  const review = await Review.findByIdAndUpdate(params.id, { approved }, { new: true });
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ review: JSON.parse(JSON.stringify(review)) });
}

export async function DELETE(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await dbConnect();
  await Review.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
