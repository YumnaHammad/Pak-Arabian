import mongoose from 'mongoose';

/**
 * Promotional poster for the homepage carousel.
 *
 * Sales are time-boxed by nature, so a poster carries its own window: set
 * `startsAt`/`endsAt` and an Eid or launch banner appears and retires on its
 * own without anyone remembering to switch it off.
 */
const PosterSchema = new mongoose.Schema(
  {
    /** Uploaded via /api/upload — a path under /uploads, or any absolute URL. */
    image: { type: String, required: true },
    /** Optional overlay copy. A poster that already has text baked into the
     *  artwork should leave these empty. */
    title: { type: String, default: '', trim: true },
    subtitle: { type: String, default: '', trim: true },
    ctaLabel: { type: String, default: '', trim: true },
    href: { type: String, default: '', trim: true },
    /** Describes the artwork for screen readers when there is no overlay copy. */
    alt: { type: String, default: '', trim: true },

    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

/** True when the poster should be on screen right now. */
PosterSchema.methods.isLive = function isLive(now = new Date()) {
  if (!this.active) return false;
  if (this.startsAt && now < this.startsAt) return false;
  if (this.endsAt && now > this.endsAt) return false;
  return true;
};

/** The same rule as a query, for the storefront read. */
PosterSchema.statics.liveFilter = function liveFilter(now = new Date()) {
  return {
    active: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
    ],
  };
};

export default mongoose.models.Poster || mongoose.model('Poster', PosterSchema);
