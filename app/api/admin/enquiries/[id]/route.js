import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

/** PUT — mark an enquiry handled or reopen it. */
export async function PUT(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { handled } = await req.json().catch(() => ({}));
  if (typeof handled !== 'boolean') {
    return NextResponse.json({ error: 'Expected a handled state.' }, { status: 400 });
  }

  await dbConnect();
  const enquiry = await Enquiry.findByIdAndUpdate(params.id, { handled }, { new: true });
  if (!enquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ enquiry: JSON.parse(JSON.stringify(enquiry)) });
}

export async function DELETE(req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await dbConnect();
  await Enquiry.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
