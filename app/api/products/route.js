import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const featured = searchParams.get('featured');

  const filter = { active: true };
  if (category) filter.category = category;
  if (featured) filter.featured = true;
  if (q) filter.name = { $regex: q, $options: 'i' };

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(products);
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  try {
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
