import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Poster from '@/models/Poster';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  /* Explicit allow-list — the client cannot name an arbitrary field. */
  const update = {};
  if (typeof body.active === 'boolean') update.active = body.active;
  if (typeof body.sortOrder === 'number') update.sortOrder = body.sortOrder;
  if (typeof body.title === 'string') update.title = body.title.slice(0, 120);
  if (typeof body.subtitle === 'string') update.subtitle = body.subtitle.slice(0, 200);
  if (typeof body.ctaLabel === 'string') update.ctaLabel = body.ctaLabel.slice(0, 40);
  if (typeof body.href === 'string') update.href = body.href.slice(0, 300);
  if (typeof body.alt === 'string') update.alt = body.alt.slice(0, 200);
  if ('startsAt' in body) update.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  if ('endsAt' in body) update.endsAt = body.endsAt ? new Date(body.endsAt) : null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  await dbConnect();
  const poster = await Poster.findByIdAndUpdate(params.id, update, { new: true });
  if (!poster) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ poster: JSON.parse(JSON.stringify(poster)) });
}

export async function DELETE(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await dbConnect();
  await Poster.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
