import { dbConnect } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import Subscriber from '@/models/Subscriber';
import CustomersTable from '@/components/admin/CustomersTable';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Customers' };

/**
 * Customer list with lifetime value.
 *
 * Spend is aggregated by email rather than by account reference so guest orders
 * placed before someone registered are still credited to them.
 */
export default async function AdminCustomersPage() {
  await dbConnect();

  const [customers, spendByEmail, subscriberCount, guestAgg] = await Promise.all([
    Customer.find().select('-passwordHash').sort({ createdAt: -1 }).limit(500).lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, 'customer.email': { $ne: null } } },
      {
        $group: {
          _id: { $toLower: '$customer.email' },
          orders: { $sum: 1 },
          spend: { $sum: '$total' },
          last: { $max: '$createdAt' },
        },
      },
    ]),
    Subscriber.countDocuments({ active: true }),
    Order.aggregate([
      { $match: { account: null } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),
  ]);

  const spend = spendByEmail.reduce((acc, r) => ({ ...acc, [r._id]: r }), {});

  const rows = customers.map((c) => {
    const stats = spend[c.email?.toLowerCase()] || {};
    return {
      _id: String(c._id),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      addresses: c.addresses?.length || 0,
      wishlist: c.wishlist?.length || 0,
      marketingOptIn: !!c.marketingOptIn,
      createdAt: c.createdAt,
      lastLoginAt: c.lastLoginAt || null,
      orders: stats.orders || 0,
      spend: stats.spend || 0,
      lastOrderAt: stats.last || null,
    };
  });

  return (
    <CustomersTable
      customers={JSON.parse(JSON.stringify(rows))}
      subscriberCount={subscriberCount}
      guestOrders={guestAgg[0]?.count || 0}
    />
  );
}
