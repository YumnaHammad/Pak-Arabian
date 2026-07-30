import { dbConnect } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import EnquiriesInbox from '@/components/admin/EnquiriesInbox';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Enquiries' };

export default async function AdminEnquiriesPage() {
  await dbConnect();
  const enquiries = await Enquiry.find().sort({ handled: 1, createdAt: -1 }).limit(300).lean();

  return <EnquiriesInbox initial={JSON.parse(JSON.stringify(enquiries))} />;
}
