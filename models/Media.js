import mongoose from 'mongoose';

/**
 * An uploaded image, stored as bytes in MongoDB and served by
 * `/api/media/[id]`.
 *
 * Why the database and not the disk: the previous `/api/upload` wrote into
 * `public/uploads`, which works locally but throws `EROFS` on Vercel — the
 * serverless filesystem is read-only, and anything written to /tmp would
 * vanish with the invocation and never be served as a static asset. Atlas is
 * already provisioned, so this needs no second storage service.
 *
 * The tradeoff is capacity: Atlas' free tier is 512MB shared with the
 * catalogue. If the shop outgrows that, move `/api/upload` to Vercel Blob or
 * Cloudinary — `images` on a product is just a list of URLs, so old records
 * keep resolving and nothing has to be migrated.
 */
const MediaSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    /** Kept only so the admin can recognise a file later; never used in a path. */
    originalName: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
