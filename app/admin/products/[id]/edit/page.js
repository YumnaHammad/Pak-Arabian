import { notFound } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }) {
  await dbConnect();
  const product = await Product.findById(params.id).lean();
  if (!product) notFound();

  const initial = JSON.parse(JSON.stringify(product));
  initial.notes = {
    top: (initial.notes?.top || []).join(', '),
    heart: (initial.notes?.heart || []).join(', '),
    base: (initial.notes?.base || []).join(', '),
  };

  return <ProductForm initial={initial} />;
}
