import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z.string().trim().max(40).optional().default(''),
  subject: z.string().trim().max(80).optional().default('General'),
  message: z.string().trim().min(10, 'Tell us a little more.').max(4000),
});

export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Please check the form.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    await Enquiry.create(parsed.data);
  } catch {
    return NextResponse.json(
      { error: 'Could not send the message. Please WhatsApp us instead.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, message: 'Message received — the house replies within one working day.' },
    { status: 201 }
  );
}
