import { dbConnect } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import CouponsManager from '@/components/admin/CouponsManager';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Discounts' };

export default async function AdminCouponsPage() {
  await dbConnect();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

  return <CouponsManager initial={JSON.parse(JSON.stringify(coupons))} />;
}
