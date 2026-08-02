import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Media from '@/models/Media';

export const runtime = 'nodejs';

/** Formats browsers can actually render. HEIC from an iPhone is rejected here
 *  with a readable message rather than uploading and showing a broken frame. */
const ACCEPTED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

/* A serverless request body is capped at 4.5MB on Vercel. Rejecting above 4MB
   turns a truncated-request failure into a message that says what to do. */
const MAX_BYTES = 4 * 1024 * 1024;

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files').filter((f) => f && typeof f !== 'string');

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    /* Validate everything before writing, so a bad third file does not leave
       the first two orphaned in the database. */
    for (const file of files) {
      const name = file.name || 'That file';
      if (!ACCEPTED.has(file.type)) {
        return NextResponse.json(
          { error: `${name} is not a supported image. Use JPG, PNG, WEBP, AVIF or GIF.` },
          { status: 415 }
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `${name} is ${mb(file.size)} — the limit is ${mb(MAX_BYTES)}. Resize it and try again.` },
          { status: 413 }
        );
      }
    }

    await dbConnect();

    const urls = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const doc = await Media.create({
        data: buffer,
        contentType: file.type,
        size: buffer.length,
        originalName: file.name || '',
      });
      urls.push(`/api/media/${doc._id}`);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
