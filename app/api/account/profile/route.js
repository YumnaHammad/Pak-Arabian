import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getCustomerFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(40).optional(),
  marketingOptIn: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Use at least 8 characters.').max(200).optional(),
});

export async function PUT(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid details.' },
      { status: 400 }
    );
  }

  await dbConnect();
  const customer = await Customer.findById(session.id);
  if (!customer) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { name, phone, marketingOptIn, currentPassword, newPassword } = parsed.data;

  if (name !== undefined) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (marketingOptIn !== undefined) customer.marketingOptIn = marketingOptIn;

  /* A password change always requires proof of the current one. */
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Enter your current password.' }, { status: 400 });
    }
    const ok = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
    }
    customer.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await customer.save();
  return NextResponse.json({ customer: customer.toSafeJSON() });
}
