import Link from 'next/link';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyCustomerToken, CUSTOMER_COOKIE } from '@/lib/auth';
import { CONTACT, ASSURANCES } from '@/lib/content/site';
import { formatPKR, shortId } from '@/lib/utils';
import OrderConfirmation from '@/components/order/OrderConfirmation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

/**
 * Partially masks contact details.
 *
 * The confirmation page has to be reachable by a guest who has just ordered and
 * holds no session, so it cannot simply require sign-in. But an order id is a
 * guessable ObjectId, and the document carries a full name, email, phone and
 * street address. Anyone who is not the verified owner therefore sees enough to
 * recognise their own order and nothing that would be worth harvesting.
 */
function maskOrder(order) {
  const c = order.customer || {};
  const email = c.email || '';
  const [local, domain] = email.split('@');

  return {
    ...order,
    customer: {
      name: (c.name || '').split(' ')[0] || 'there',
      email:
        local && domain
          ? `${local.slice(0, 2)}${'•'.repeat(Math.max(3, local.length - 2))}@${domain}`
          : '',
      phone: c.phone ? `${'•'.repeat(Math.max(0, c.phone.length - 4))}${c.phone.slice(-4)}` : '',
      address: '',
      city: c.city || '',
    },
    _masked: true,
  };
}

export default async function OrderPage({ params }) {
  if (!mongoose.isValidObjectId(params.id)) return <NotFound />;

  await dbConnect();
  const raw = await Order.findById(params.id).lean();
  if (!raw) return <NotFound />;

  const order = JSON.parse(JSON.stringify(raw));

  /* Is the viewer the owner of this order? */
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  const session = await verifyCustomerToken(token);
  const isOwner =
    !!session &&
    (String(order.account || '') === String(session.id) ||
      (order.customer?.email || '').toLowerCase() === String(session.email).toLowerCase());

  return (
    <OrderConfirmation
      order={isOwner ? order : maskOrder(order)}
      isOwner={isOwner}
      contact={CONTACT}
      assurances={ASSURANCES}
    />
  );
}

function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center pt-32 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-8 font-display text-4xl font-light">We cannot find that order.</h1>
      <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-ink-3">
        The reference may be mistyped. If you have just ordered and cannot see it,
        message the house on {CONTACT.phone} and we will locate it.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/collection" className="btn-luxe">
          Back to the library
        </Link>
        <a href={CONTACT.whatsapp} className="btn-luxe" target="_blank" rel="noopener noreferrer">
          Message the house
        </a>
      </div>
    </div>
  );
}
