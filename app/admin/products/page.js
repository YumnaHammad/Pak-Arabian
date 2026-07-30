import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductsTable from '@/components/admin/ProductsTable';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Inventory' };

export default async function AdminProductsPage() {
  await dbConnect();
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  return <ProductsTable products={JSON.parse(JSON.stringify(products))} />;
}
