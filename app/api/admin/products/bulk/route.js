import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

/**
 * Bulk operations on the catalogue.
 *
 * Protected by the admin gate in middleware. Actions are an explicit
 * allow-list — the client cannot name an arbitrary update.
 */
export async function POST(req) {
  const { action, ids, value } = await req.json().catch(() => ({}));

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No products selected.' }, { status: 400 });
  }

  const valid = ids.filter((id) => mongoose.isValidObjectId(id));
  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid products selected.' }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (action) {
      case 'activate':
        await Product.updateMany({ _id: { $in: valid } }, { $set: { active: true } });
        break;
      case 'deactivate':
        await Product.updateMany({ _id: { $in: valid } }, { $set: { active: false } });
        break;
      case 'feature':
        await Product.updateMany({ _id: { $in: valid } }, { $set: { featured: !!value } });
        break;
      case 'restock': {
        const amount = Math.max(0, Math.floor(Number(value) || 0));
        await Product.updateMany({ _id: { $in: valid } }, { $set: { stock: amount } });
        break;
      }
      case 'delete':
        await Product.deleteMany({ _id: { $in: valid } });
        break;
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, affected: valid.length });
}
