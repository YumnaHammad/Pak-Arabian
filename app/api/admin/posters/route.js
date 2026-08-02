import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import Poster from '@/models/Poster';

export const dynamic = 'force-dynamic';

const schema = z.object({
  image: z.string().trim().min(1, 'Upload an image first.'),
  title: z.string().trim().max(120).optional().default(''),
  subtitle: z.string().trim().max(200).optional().default(''),
  ctaLabel: z.string().trim().max(40).optional().default(''),
  href: z.string().trim().max(300).optional().default(''),
  alt: z.string().trim().max(200).optional().default(''),
  sortOrder: z.coerce.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export async function GET() {
  await dbConnect();
  const posters = await Poster.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json({ posters: JSON.parse(JSON.stringify(posters)) });
}

export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid poster.' },
      { status: 400 }
    );
  }

  const { startsAt, endsAt, ...rest } = parsed.data;

  if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
    return NextResponse.json({ error: 'The end date is before the start date.' }, { status: 400 });
  }

  await dbConnect();

  try {
    const poster = await Poster.create({
      ...rest,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
    });
    return NextResponse.json({ poster: JSON.parse(JSON.stringify(poster)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
