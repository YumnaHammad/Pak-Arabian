import mongoose from 'mongoose';
import 'dotenv/config';

const ProductSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products = [
  // Signature / Unisex collection
  {
    name: 'Noir Ambre', slug: 'noir-ambre', sku: 'MN-001', price: 8500, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'signature',
    description: 'A dark amber built on smoked labdanum, warmed by a whisper of tonka.',
    notes: { top: ['Bergamot', 'Pink Pepper'], heart: ['Labdanum', 'Iris'], base: ['Tonka Bean', 'Amber', 'Vetiver'] },
    images: [], stock: 24, featured: true, active: true,
  },
  {
    name: 'Cedre Blanc', slug: 'cedre-blanc', sku: 'MN-002', price: 7500, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'woody',
    description: 'Virginia cedar sanded smooth, softened with white musk and cashmere wood.',
    notes: { top: ['Cardamom'], heart: ['Cedarwood', 'Violet'], base: ['White Musk', 'Cashmeran'] },
    images: [], stock: 3, featured: false, active: true,
  },
  {
    name: 'Fleur de Sel', slug: 'fleur-de-sel', sku: 'MN-003', price: 8000, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'floral',
    description: 'Salted tuberose over a mineral, sea-worn base.',
    notes: { top: ['Bergamot', 'Marine Accord'], heart: ['Tuberose', 'Jasmine'], base: ['Ambergris', 'Salt'] },
    images: [], stock: 18, featured: true, active: true,
  },
  {
    name: 'Oud Majeste', slug: 'oud-majeste', sku: 'MN-004', price: 9500, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'signature',
    description: 'Royal oud from the Laos highlands, elevated with saffron and dark rose.',
    notes: { top: ['Saffron', 'Cardamom'], heart: ['Rose', 'Oud'], base: ['Sandalwood', 'Musk', 'Amber'] },
    images: [], stock: 12, featured: true, active: true,
  },
  {
    name: 'Vetiver Gris', slug: 'vetiver-gris', sku: 'MN-005', price: 7000, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'woody',
    description: 'Earthy Haitian vetiver rendered cool and smoky, with a mineral grey finish.',
    notes: { top: ['Black Pepper', 'Grapefruit'], heart: ['Vetiver', 'Iris'], base: ['Oakmoss', 'Cedarwood'] },
    images: [], stock: 9, featured: false, active: true,
  },
  {
    name: 'Iris Pale', slug: 'iris-pale', sku: 'MN-006', price: 8800, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'floral',
    description: 'Powdery orris root from Florence, softened by violet and white woods.',
    notes: { top: ['Aldehydes', 'Bergamot'], heart: ['Iris', 'Violet'], base: ['White Musk', 'Ambrette'] },
    images: [], stock: 7, featured: false, active: true,
  },
  {
    name: 'Musc Sacre', slug: 'musc-sacre', sku: 'MN-007', price: 6500, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'signature',
    description: 'A radiant skin musk, bare and luminous — the quietest scent in the collection.',
    notes: { top: ['Aldehydes'], heart: ['White Musk', 'Ambrette'], base: ['Sandalwood', 'Benzoin'] },
    images: [], stock: 30, featured: false, active: true,
  },

  // Men's collection
  {
    name: 'Bois de Fer', slug: 'bois-de-fer', sku: 'MN-M01', price: 9000, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'men',
    description: 'A bold ironwood accord, structured with smoky incense and a dry leather finish — made for the discerning man.',
    notes: { top: ['Black Pepper', 'Bergamot'], heart: ['Ironwood', 'Incense'], base: ['Leather', 'Vetiver', 'Patchouli'] },
    images: ['/uploads/mens-1.png'], stock: 20, featured: true, active: true,
  },
  {
    name: 'Acqua Nobile', slug: 'acqua-nobile', sku: 'MN-M02', price: 7800, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'men',
    description: 'Fresh Mediterranean blue — sea salt and green citrus, anchored by warm woods.',
    notes: { top: ['Lemon', 'Sea Salt', 'Grapefruit'], heart: ['Aquatic Accord', 'Neroli'], base: ['Cedarwood', 'White Musk'] },
    images: ['/uploads/mens-2.png'], stock: 15, featured: true, active: true,
  },
  {
    name: 'Amber Noir Homme', slug: 'amber-noir-homme', sku: 'MN-M03', price: 8200, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'men',
    description: 'Rich oriental amber fused with dark tobacco and a whisper of spiced rum.',
    notes: { top: ['Rum', 'Nutmeg'], heart: ['Tobacco', 'Amber'], base: ['Benzoin', 'Oakmoss', 'Vanilla'] },
    images: ['/uploads/mens-1.png'], stock: 11, featured: false, active: true,
  },

  // Women's collection
  {
    name: 'Rose Eternelle', slug: 'rose-eternelle', sku: 'MN-W01', price: 8600, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'women',
    description: 'Midnight Bulgarian rose, delicate yet enduring — a fragrance that stays long after you leave.',
    notes: { top: ['Lychee', 'Pink Pepper'], heart: ['Bulgarian Rose', 'Peony'], base: ['White Musk', 'Sandalwood'] },
    images: ['/uploads/womens-1.png'], stock: 25, featured: true, active: true,
  },
  {
    name: 'Jardin Blanc', slug: 'jardin-blanc', sku: 'MN-W02', price: 7200, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'women',
    description: 'A garden in full bloom — white jasmine and gardenia float over a clean musky base.',
    notes: { top: ['Bergamot', 'Green Leaf'], heart: ['Jasmine', 'Gardenia', 'Lily of the Valley'], base: ['Ambrette', 'Cedar'] },
    images: ['/uploads/womens-2.png'], stock: 19, featured: true, active: true,
  },
  {
    name: 'Cuir Doux', slug: 'cuir-doux', sku: 'MN-W03', price: 9200, volumeMl: 50,
    concentration: 'Eau de Parfum', category: 'women',
    description: 'Soft suede leather wrapped in warm vanilla and a whisper of powdery iris.',
    notes: { top: ['Aldehydes', 'Citrus'], heart: ['Iris', 'Suede'], base: ['Vanilla', 'Musk', 'Cashmeran'] },
    images: ['/uploads/womens-1.png'], stock: 8, featured: false, active: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('products');

  // Drop stale indexes
  try {
    const indexes = await col.indexes();
    for (const idx of indexes) {
      const key = Object.keys(idx.key || {}).join(',');
      if (key.includes('variants')) {
        console.log(`Dropping stale index: ${idx.name}`);
        await col.dropIndex(idx.name);
      }
    }
  } catch (e) {
    console.log('Index cleanup skipped:', e.message);
  }

  // Upsert by SKU
  for (const p of products) {
    await Product.findOneAndUpdate({ sku: p.sku }, { $set: p }, { upsert: true, new: true });
  }

  console.log(`✓ Seeded ${products.length} products (including men's and women's collections).`);
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
