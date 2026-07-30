import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  source: z.string().trim().max(40).optional().default('footer'),
});

export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Enter a valid email address.' },
      { status: 400 }
    );
  }

  const { email, source } = parsed.data;
  await dbConnect();

  /*
   * Upsert rather than insert: re-subscribing an existing address should be a
   * success, not a duplicate-key error the visitor has to interpret.
   */
  await Subscriber.updateOne(
    { email },
    { $set: { email, active: true }, $setOnInsert: { source } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true, message: 'You are on the list.' }, { status: 201 });
}
