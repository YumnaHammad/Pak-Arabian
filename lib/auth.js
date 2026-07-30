import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_change_me');

/* ════════════════════════════════════════════════
   Admin — unchanged. The admin panel, its middleware
   and /api/admin/login all keep the same contract.
   ════════════════════════════════════════════════ */

export async function signAdminToken(payload) {
  return await new SignJWT({ ...payload, scope: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    /*
     * Customer and admin tokens are signed with the same secret, so a valid
     * signature alone is not authorisation — a storefront token presented as
     * `admin_token` would otherwise verify and grant the panel. Anything
     * explicitly scoped to a customer is rejected here.
     *
     * Tokens issued before scoping existed carry no `scope` and still pass, so
     * live admin sessions are not invalidated by this change.
     */
    if (payload.scope === 'customer') return null;
    return payload;
  } catch {
    return null;
  }
}

/* ════════════════════════════════════════════════
   Customer — added for storefront accounts.
   A separate cookie and an explicit `scope` claim so a
   customer token can never be replayed against /admin.
   ════════════════════════════════════════════════ */

export const CUSTOMER_COOKIE = 'customer_token';
export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function signCustomerToken(payload) {
  return await new SignJWT({ ...payload, scope: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyCustomerToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    // Reject anything that is not explicitly a customer token.
    if (payload.scope !== 'customer') return null;
    return payload;
  } catch {
    return null;
  }
}

/** Cookie options shared by the login and logout routes. */
export function customerCookieOptions(maxAge = CUSTOMER_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

/**
 * Reads the signed-in customer from a route handler's request.
 * Returns the token payload (`{ id, email, name }`) or null.
 */
export async function getCustomerFromRequest(req) {
  const token = req.cookies?.get?.(CUSTOMER_COOKIE)?.value;
  return await verifyCustomerToken(token);
}
