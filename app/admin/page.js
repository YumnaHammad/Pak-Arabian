import Link from 'next/link';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Review from '@/models/Review';
import Enquiry from '@/models/Enquiry';
import { formatPKR, shortId } from '@/lib/utils';
import StatCard from '@/components/admin/StatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import StatusBadge from '@/components/admin/StatusBadge';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Dashboard' };

const DAYS = 14;

/**
 * Dashboard data.
 *
 * Every figure the previous overview showed is still here — product count,
 * low stock, order count and total revenue — computed the same way, so the
 * numbers the team is used to have not moved. Everything else is added around
 * them.
 */
async function getDashboard() {
  await dbConnect();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));

  const [
    productCount,
    lowStock,
    orderCount,
    revenueAgg,
    customerCount,
    pendingReviews,
    openEnquiries,
    dailyAgg,
    statusAgg,
    recentOrders,
    lowStockItems,
    topProducts,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: { $lte: 5 }, active: true }),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    Customer.countDocuments(),
    Review.countDocuments({ approved: false }),
    Enquiry.countDocuments({ handled: false }),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
    Product.find({ stock: { $lte: 5 }, active: true }).sort({ stock: 1 }).limit(6).lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          units: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  /* Fill the gaps — a day with no orders must still plot as zero. */
  const byDay = dailyAgg.reduce((acc, r) => ({ ...acc, [r._id]: r }), {});
  const series = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      label: d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
      revenue: byDay[key]?.revenue || 0,
      orders: byDay[key]?.orders || 0,
    };
  });

  const periodRevenue = series.reduce((s, d) => s + d.revenue, 0);
  const periodOrders = series.reduce((s, d) => s + d.orders, 0);

  return {
    productCount,
    lowStock,
    orderCount,
    revenue: revenueAgg[0]?.total || 0,
    customerCount,
    pendingReviews,
    openEnquiries,
    series,
    periodRevenue,
    periodOrders,
    statuses: statusAgg.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    lowStockItems: JSON.parse(JSON.stringify(lowStockItems)),
    topProducts,
  };
}

export default async function AdminDashboard() {
  let data;
  try {
    data = await getDashboard();
  } catch (error) {
    return (
      <div className="admin-card p-8">
        <h1 className="text-lg font-medium">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-ink-2">
          Could not reach the database. Check <code className="text-accent">MONGODB_URI</code>.
        </p>
        <p className="mt-4 font-mono text-xs text-ink-4">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Heading ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            Last {DAYS} days · {formatPKR(data.periodRevenue)} across {data.periodOrders} orders
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          Add product
        </Link>
      </div>

      {/* ── Attention strip ── */}
      {(data.lowStock > 0 || data.pendingReviews > 0 || data.openEnquiries > 0) && (
        <div className="flex flex-wrap gap-3">
          {data.lowStock > 0 && (
            <Alert href="/admin/products" tone="warn">
              {data.lowStock} {data.lowStock === 1 ? 'product is' : 'products are'} low on stock
            </Alert>
          )}
          {data.pendingReviews > 0 && (
            <Alert href="/admin/reviews" tone="info">
              {data.pendingReviews} {data.pendingReviews === 1 ? 'review awaits' : 'reviews await'} moderation
            </Alert>
          )}
          {data.openEnquiries > 0 && (
            <Alert href="/admin/enquiries" tone="info">
              {data.openEnquiries} unanswered {data.openEnquiries === 1 ? 'enquiry' : 'enquiries'}
            </Alert>
          )}
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatPKR(data.revenue)} hint="All time, all orders" accent />
        <StatCard label="Orders" value={data.orderCount} hint={`${data.statuses.pending || 0} awaiting action`} />
        <StatCard label="Products" value={data.productCount} hint={`${data.lowStock} low on stock`} />
        <StatCard label="Customers" value={data.customerCount} hint="Registered accounts" />
      </div>

      {/* ── Chart + status ── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="admin-card p-5 xl:col-span-2">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[13px] font-medium">Revenue</h2>
            <span className="text-[11px] text-ink-4">Last {DAYS} days</span>
          </div>
          <RevenueChart data={data.series} />
        </div>

        <div className="admin-card p-5">
          <h2 className="mb-5 text-[13px] font-medium">Order status</h2>
          <ul className="space-y-3.5">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
              const count = data.statuses[status] || 0;
              const pct = data.orderCount ? (count / data.orderCount) * 100 : 0;
              return (
                <li key={status}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <StatusBadge status={status} />
                    <span className="font-mono text-[12px] tabular-nums text-ink-2">{count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-elevated">
                    <div
                      className="h-1 rounded-full bg-[var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Tables ── */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Recent orders */}
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-[13px] font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="text-[12px] text-accent hover:underline">
              View all
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="px-5 pb-5 text-[13px] text-ink-4">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td className="font-mono text-[12px] text-ink-3">{shortId(o._id)}</td>
                      <td className="max-w-[160px] truncate">{o.customer?.name || '—'}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="text-right font-mono tabular-nums">{formatPKR(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-[13px] font-medium">Needs restocking</h2>
            <Link href="/admin/products" className="text-[12px] text-accent hover:underline">
              Inventory
            </Link>
          </div>
          {data.lowStockItems.length === 0 ? (
            <p className="px-5 pb-5 text-[13px] text-ink-4">Every active product is well stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th className="text-right">Stock</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockItems.map((p) => (
                    <tr key={p._id}>
                      <td className="max-w-[180px] truncate">{p.name}</td>
                      <td className="font-mono text-[12px] text-ink-3">{p.sku}</td>
                      <td className="text-right">
                        <span
                          className={`font-mono tabular-nums ${
                            p.stock === 0 ? 'text-red-400' : 'text-[var(--accent)]'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="text-[12px] text-accent hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Top sellers ── */}
      {data.topProducts.length > 0 && (
        <div className="admin-card overflow-hidden">
          <h2 className="px-5 py-4 text-[13px] font-medium">Best selling</h2>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">Revenue</th>
                  <th className="w-1/3">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => {
                  const top = data.topProducts[0].revenue || 1;
                  return (
                    <tr key={p._id}>
                      <td>{p._id}</td>
                      <td className="text-right font-mono tabular-nums text-ink-2">{p.units}</td>
                      <td className="text-right font-mono tabular-nums">{formatPKR(p.revenue)}</td>
                      <td>
                        <div className="h-1 rounded-full bg-elevated">
                          <div
                            className="h-1 rounded-full bg-[var(--accent)]"
                            style={{ width: `${(p.revenue / top) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Alert({ children, href, tone }) {
  const tones = {
    warn: 'border-[var(--accent)]/40 text-[var(--accent)]',
    info: 'border-hairline text-ink-2',
  };
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[13px] transition-colors hover:bg-elevated ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
      <span className="text-ink-4">→</span>
    </Link>
  );
}
