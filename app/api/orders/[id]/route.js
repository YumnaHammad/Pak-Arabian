import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  await dbConnect();
  const order = await Order.findById(params.id).lean();
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const order = await Order.findByIdAndUpdate(params.id, { status: body.status }, { new: true });
  return NextResponse.json(order);
}
