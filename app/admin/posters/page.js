import { dbConnect } from '@/lib/mongodb';
import Poster from '@/models/Poster';
import PostersManager from '@/components/admin/PostersManager';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sale posters' };

export default async function AdminPostersPage() {
  await dbConnect();
  const posters = await Poster.find().sort({ sortOrder: 1, createdAt: -1 }).lean();

  return <PostersManager initial={JSON.parse(JSON.stringify(posters))} />;
}
