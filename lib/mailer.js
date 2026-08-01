import nodemailer from 'nodemailer';
import { BRAND, CONTACT } from '@/lib/content/site';
import { formatPKR, shortId } from '@/lib/utils';

/**
 * Order notifications.
 *
 * Configured entirely by environment. If SMTP is not set up the send is a
 * no-op that logs once — an order must never fail because a mail server is
 * unreachable, and the order itself is already safely in the database.
 *
 *   SMTP_HOST      smtp.gmail.com
 *   SMTP_PORT      465
 *   SMTP_USER      the mailbox that sends
 *   SMTP_PASS      an app password, NOT the account password
 *   SMTP_FROM      optional display sender
 *   ORDER_NOTIFY_TO  where alerts land — defaults to the house email
 */
let transporter = null;
let warned = false;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warned) {
      warned = true;
      console.warn(
        '[mail] SMTP is not configured — order notifications are disabled. ' +
          'Set SMTP_HOST, SMTP_USER and SMTP_PASS to enable them.'
      );
    }
    return null;
  }

  if (!transporter) {
    const port = Number(SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 is implicit TLS; 587 upgrades via STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

/**
 * Alerts the shop that an order has been placed.
 *
 * Deliberately never throws — the caller awaits nothing and a failure here must
 * not surface to the customer, who has already successfully ordered.
 */
export async function sendOrderNotification(order) {
  try {
    const mail = getTransporter();
    if (!mail) return { sent: false, reason: 'not-configured' };

    const to = process.env.ORDER_NOTIFY_TO || CONTACT.email;
    const from = process.env.SMTP_FROM || `${BRAND.legal} <${process.env.SMTP_USER}>`;
    const ref = shortId(order._id);
    const c = order.customer || {};

    const lines = order.items
      .map(
        (i) =>
          `<tr>
             <td style="padding:8px 0;border-bottom:1px solid #e5e5e5">${escapeHtml(i.name)} × ${i.qty}</td>
             <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right">${formatPKR(
               i.price * i.qty
             )}</td>
           </tr>`
      )
      .join('');

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;color:#14201e">
        <div style="background:#1d4a45;color:#f5f1e3;padding:22px 24px">
          <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.75">
            ${escapeHtml(BRAND.legal)}
          </p>
          <h1 style="margin:8px 0 0;font-size:22px">New order ${escapeHtml(ref)}</h1>
        </div>

        <div style="padding:24px">
          <p style="font-size:26px;font-weight:700;margin:0 0 4px">${formatPKR(order.total)}</p>
          <p style="margin:0 0 20px;color:#4c5a58">Cash on delivery</p>

          <h2 style="font-size:15px;margin:0 0 8px">Customer</h2>
          <p style="margin:0 0 4px"><strong>${escapeHtml(c.name)}</strong></p>
          <p style="margin:0 0 4px">
            <a href="tel:${escapeHtml(c.phone)}" style="color:#8a6a16">${escapeHtml(c.phone)}</a>
          </p>
          <p style="margin:0 0 4px">
            <a href="mailto:${escapeHtml(c.email)}" style="color:#8a6a16">${escapeHtml(c.email)}</a>
          </p>
          <p style="margin:0 0 20px;color:#4c5a58">
            ${escapeHtml(c.address)}<br/>${escapeHtml(c.city)}
          </p>

          ${order.note ? `<p style="margin:0 0 20px;color:#4c5a58"><em>Note: ${escapeHtml(order.note)}</em></p>` : ''}

          <h2 style="font-size:15px;margin:0 0 8px">Items</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">${lines}</table>

          ${
            order.discount > 0
              ? `<p style="margin:12px 0 0;text-align:right;color:#8a6a16">
                   Discount ${escapeHtml(order.couponCode)} − ${formatPKR(order.discount)}
                 </p>`
              : ''
          }
          <p style="margin:12px 0 0;text-align:right;font-size:18px;font-weight:700">
            Total ${formatPKR(order.total)}
          </p>
        </div>
      </div>`;

    const text =
      `New order ${ref} — ${formatPKR(order.total)} (cash on delivery)\n\n` +
      `${c.name}\n${c.phone}\n${c.email}\n${c.address}, ${c.city}\n\n` +
      order.items.map((i) => `${i.name} x${i.qty} — ${formatPKR(i.price * i.qty)}`).join('\n') +
      `\n\nTotal: ${formatPKR(order.total)}`;

    await mail.sendMail({
      from,
      to,
      replyTo: c.email || undefined,
      subject: `New order ${ref} — ${formatPKR(order.total)}`,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error('[mail] order notification failed:', error.message);
    return { sent: false, reason: error.message };
  }
}
