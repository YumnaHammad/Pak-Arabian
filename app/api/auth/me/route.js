import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getCustomerFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return NextResponse.json({ customer: null });

  await dbConnect();
  const customer = await Customer.findById(session.id).select('-passwordHash').lean();
  if (!customer) return NextResponse.json({ customer: null });

  return NextResponse.json({ customer: JSON.parse(JSON.stringify(customer)) });
}
