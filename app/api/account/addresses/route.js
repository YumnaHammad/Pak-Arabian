import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getCustomerFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const addressSchema = z.object({
  label: z.string().trim().max(40).optional().default('Home'),
  name: z.string().trim().min(2, 'Enter a recipient name.').max(80),
  phone: z.string().trim().min(6, 'Enter a contact number.').max(40),
  address: z.string().trim().min(6, 'Enter a street address.').max(240),
  city: z.string().trim().min(2, 'Enter a city.').max(80),
  isDefault: z.boolean().optional().default(false),
});

async function requireCustomer(req) {
  const session = await getCustomerFromRequest(req);
  if (!session) return null;
  await dbConnect();
  return Customer.findById(session.id);
}

export async function GET(req) {
  const customer = await requireCustomer(req);
  if (!customer) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json({ addresses: JSON.parse(JSON.stringify(customer.addresses)) });
}

export async function POST(req) {
  const customer = await requireCustomer(req);
  if (!customer) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const parsed = addressSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid address.' },
      { status: 400 }
    );
  }

  const entry = parsed.data;
  // The first address saved is always the default, regardless of the flag.
  if (entry.isDefault || customer.addresses.length === 0) {
    customer.addresses.forEach((a) => {
      a.isDefault = false;
    });
    entry.isDefault = true;
  }

  customer.addresses.push(entry);
  await customer.save();

  return NextResponse.json(
    { addresses: JSON.parse(JSON.stringify(customer.addresses)) },
    { status: 201 }
  );
}

export async function DELETE(req) {
  const customer = await requireCustomer(req);
  if (!customer) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing address id.' }, { status: 400 });

  const removed = customer.addresses.id(id);
  if (!removed) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

  const wasDefault = removed.isDefault;
  customer.addresses.pull(id);

  // Never leave the account without a default.
  if (wasDefault && customer.addresses.length) customer.addresses[0].isDefault = true;

  await customer.save();
  return NextResponse.json({ addresses: JSON.parse(JSON.stringify(customer.addresses)) });
}

/** PUT — promotes an address to default. */
export async function PUT(req) {
  const customer = await requireCustomer(req);
  if (!customer) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  const target = id && customer.addresses.id(id);
  if (!target) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

  customer.addresses.forEach((a) => {
    a.isDefault = a._id.toString() === id;
  });
  await customer.save();

  return NextResponse.json({ addresses: JSON.parse(JSON.stringify(customer.addresses)) });
}
