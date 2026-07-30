import mongoose from 'mongoose';

/**
 * Product review.
 *
 * `approved` defaults to false — reviews are moderated from the admin panel
 * before they appear on a product page. Storing `name` alongside the customer
 * ref means a review survives an account deletion without breaking the page.
 */
const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    name: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true },
    body: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* One review per account per product; guests are unconstrained. */
ReviewSchema.index(
  { product: 1, customer: 1 },
  { unique: true, partialFilterExpression: { customer: { $type: 'objectId' } } }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
