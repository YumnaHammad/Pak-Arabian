import mongoose from 'mongoose';

/**
 * Storefront account.
 *
 * Additive: the existing Order model keeps its embedded `customer` snapshot, so
 * guest checkout continues to work exactly as before. An account simply lets a
 * shopper see their history, keep addresses, and hold a wishlist.
 */
const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    name: String,
    phone: String,
    address: String,
    city: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    marketingOptIn: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

/** Never let a password hash reach a JSON response. */
CustomerSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: false });
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
