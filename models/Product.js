import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  { top: [String], heart: [String], base: [String] },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    concentration: { type: String, default: 'Eau de Parfum' },
    price: { type: Number, required: true },
    volumeMl: { type: Number, default: 50 },
    description: { type: String, default: '' },
    notes: { type: NoteSchema, default: () => ({}) },
    images: [String],
    stock: { type: Number, default: 0 },
    sku: { type: String, required: true, unique: true },
    category: { type: String, default: 'unisex' },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
