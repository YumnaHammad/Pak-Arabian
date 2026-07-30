import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import OrdersTable from '@/components/admin/OrdersTable';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Orders' };

export default async function AdminOrdersPage() {
  await dbConnect();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(500).lean();

  return <OrdersTable orders={JSON.parse(JSON.stringify(orders))} />;
}
