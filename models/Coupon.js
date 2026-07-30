import mongoose from 'mongoose';

/**
 * Discount code.
 *
 * Validation and redemption both happen server-side in the orders route — the
 * client is only ever told the resulting amount, never trusted to compute it.
 */
const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 }, // 0 = uncapped
    usageLimit: { type: Number, default: 0 },  // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    startsAt: Date,
    expiresAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Returns `{ ok, reason, discount }` for a given subtotal.
 * Kept on the model so the checkout preview and the order route cannot drift.
 */
CouponSchema.methods.evaluate = function evaluate(subtotal) {
  const now = new Date();

  if (!this.active) return { ok: false, reason: 'This code is no longer active.' };
  if (this.startsAt && now < this.startsAt) return { ok: false, reason: 'This code is not active yet.' };
  if (this.expiresAt && now > this.expiresAt) return { ok: false, reason: 'This code has expired.' };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return { ok: false, reason: 'This code has reached its limit.' };
  }
  if (subtotal < this.minSpend) {
    return {
      ok: false,
      reason: `Spend Rs. ${this.minSpend.toLocaleString('en-PK')} to use this code.`,
    };
  }

  let discount =
    this.type === 'percent' ? Math.round((subtotal * this.value) / 100) : this.value;

  if (this.maxDiscount > 0) discount = Math.min(discount, this.maxDiscount);
  discount = Math.min(discount, subtotal);

  return { ok: true, discount };
};

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
