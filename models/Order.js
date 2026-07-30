import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    items: [ItemSchema],
    /** Payable amount. Unchanged meaning — existing orders and the admin
     *  revenue aggregate continue to read this field exactly as before. */
    total: { type: Number, required: true },
    customer: {
      name: String,
      email: String,
      address: String,
      city: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    /* ── Added fields. All optional, so historical documents remain valid. ── */

    /** Set when the shopper was signed in; guest checkout leaves it null. */
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    /** Line-item sum before any discount. */
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
