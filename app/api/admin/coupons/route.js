import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export const dynamic = 'force-dynamic';

const schema = z.object({
  code: z.string().trim().min(3, 'Codes need at least 3 characters.').max(32),
  description: z.string().trim().max(160).optional().default(''),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(0),
  minSpend: z.coerce.number().min(0).optional().default(0),
  maxDiscount: z.coerce.number().min(0).optional().default(0),
  usageLimit: z.coerce.number().int().min(0).optional().default(0),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
});

export async function GET() {
  await dbConnect();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ coupons: JSON.parse(JSON.stringify(coupons)) });
}

export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid discount.' },
      { status: 400 }
    );
  }

  const { expiresAt, ...rest } = parsed.data;

  if (rest.type === 'percent' && rest.value > 100) {
    return NextResponse.json({ error: 'A percentage cannot exceed 100.' }, { status: 400 });
  }

  await dbConnect();

  try {
    const coupon = await Coupon.create({
      ...rest,
      code: rest.code.toUpperCase(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    return NextResponse.json({ coupon: JSON.parse(JSON.stringify(coupon)) }, { status: 201 });
  } catch (e) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'That code already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
