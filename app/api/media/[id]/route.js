import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Media from '@/models/Media';

export const runtime = 'nodejs';

/**
 * Serves an uploaded image. Public by design — these are product photographs.
 *
 * The id is minted per upload and the bytes behind it are never rewritten, so
 * the response is safe to cache immutably. `next/image` optimises this path
 * like any other same-origin image.
 */
export async function GET(_req, { params }) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    await dbConnect();
    const media = await Media.findById(id);
    if (!media) return new Response('Not found', { status: 404 });

    /* Depending on driver options this is a Buffer or a BSON Binary. */
    const raw = media.data;
    const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer ?? raw);

    return new Response(bytes, {
      headers: {
        'Content-Type': media.contentType,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Media read error:', err);
    return new Response('Not found', { status: 404 });
  }
}
