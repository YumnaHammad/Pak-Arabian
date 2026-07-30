import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { signCustomerToken, CUSTOMER_COOKIE, customerCookieOptions } from '@/lib/auth';

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
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
    return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const customer = await Customer.findOne({ email });

  /*
   * Always run a comparison, even when no account matched, so the response
   * time does not reveal whether the email is registered.
   */
  const hash = customer?.passwordHash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduu';
  const valid = await bcrypt.compare(password, hash);

  if (!customer || !valid) {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }

  customer.lastLoginAt = new Date();
  await customer.save();

  const token = await signCustomerToken({
    id: customer._id.toString(),
    email: customer.email,
    name: customer.name,
  });

  const res = NextResponse.json({ customer: customer.toSafeJSON() });
  res.cookies.set(CUSTOMER_COOKIE, token, customerCookieOptions());
  return res;
}
