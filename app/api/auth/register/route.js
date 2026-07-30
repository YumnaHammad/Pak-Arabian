import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Subscriber from '@/models/Subscriber';
import { signCustomerToken, CUSTOMER_COOKIE, customerCookieOptions } from '@/lib/auth';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(200),
  marketingOptIn: z.boolean().optional().default(false),
});

export async function POST(req) {
  await dbConnect();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid details.' },
      { status: 400 }
    );
  }

  const { name, email, password, marketingOptIn } = parsed.data;

  const existing = await Customer.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { error: 'An account already exists for this email.' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let customer;
  try {
    customer = await Customer.create({ name, email, passwordHash, marketingOptIn });
  } catch (e) {
    // Unique index is the source of truth against a race on the check above.
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: 'An account already exists for this email.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Could not create the account.' }, { status: 400 });
  }

  if (marketingOptIn) {
    await Subscriber.updateOne(
      { email },
      { $set: { email, source: 'registration', active: true } },
      { upsert: true }
    ).catch(() => {
      /* the account matters more than the mailing list */
    });
  }

  const token = await signCustomerToken({
    id: customer._id.toString(),
    email: customer.email,
    name: customer.name,
  });

  const res = NextResponse.json({ customer: customer.toSafeJSON() }, { status: 201 });
  res.cookies.set(CUSTOMER_COOKIE, token, customerCookieOptions());
  return res;
}
