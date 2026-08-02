import { NextResponse } from 'next/server';
import { verifyAdminToken, verifyCustomerToken, CUSTOMER_COOKIE } from '@/lib/auth';

/**
 * Two independent gates.
 *
 * Admin — unchanged behaviour: page requests redirect to the login screen,
 * API requests get a 401.
 *
 * Account — added. The `/api/account/*` handlers each verify the session
 * themselves; this is a second gate in front of them so an unauthenticated
 * request never reaches a database call.
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  /* ── Admin ── */
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi =
    (pathname.startsWith('/api/admin') && !pathname.endsWith('/login')) ||
    /* Uploads write to the database, so they belong behind the same gate.
       Reads of the stored bytes stay public — they are product photographs. */
    pathname.startsWith('/api/upload');

  if (isAdminPath || isAdminApi) {
    const token = req.cookies.get('admin_token')?.value;
    const valid = token && (await verifyAdminToken(token));
    if (!valid) {
      if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  /* ── Customer account API ── */
  if (pathname.startsWith('/api/account')) {
    const token = req.cookies.get(CUSTOMER_COOKIE)?.value;
    const valid = token && (await verifyCustomerToken(token));
    if (!valid) {
      return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/account/:path*', '/api/upload'],
};
