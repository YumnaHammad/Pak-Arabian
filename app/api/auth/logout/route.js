import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE, customerCookieOptions } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, '', customerCookieOptions(0));
  return res;
}
