# Pak Arabian Enterprises® — Fragrance House

An immersive storefront and inventory panel for a small-batch perfume house in
Sadiqabad. Next.js 14 App Router, MongoDB, real-time WebGL.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, JavaScript |
| Styling | Tailwind CSS with a CSS-variable token system |
| Data | MongoDB via Mongoose |
| Motion | Framer Motion, Lenis (inertial scroll) |
| 3D | three.js, React Three Fiber, Drei |
| State | React Context (cart, auth, wishlist) + Zustand (ephemeral UI) |
| Charts | Recharts (admin only) |
| Validation | Zod on every write route |

## Setup

1. `npm install`
2. Create `.env`:
   ```
   MONGODB_URI=...          # Atlas or local connection string
   JWT_SECRET=...           # long random string
   ADMIN_EMAIL=...          # admin panel login
   ADMIN_PASSWORD=...
   NEXT_PUBLIC_SITE_URL=... # used for canonical URLs, OG tags and the sitemap
   ```
3. `npm run seed` — optional sample catalogue
4. `npm run dev` → http://localhost:3000
5. Admin → http://localhost:3000/admin/login

## Architecture

Feature-based folders. Nothing is grouped by file type.

```
app/
  (storefront)      /  /collection  /product/[slug]  /about  /contact  /faq
  account/          customer dashboard (client-gated)
  checkout/  order/ purchase flow
  admin/            inventory panel — its own always-dark scope
  api/              REST handlers, unchanged contracts
components/
  layout/           chrome: navbar, footer, loader, cursor, grain, transitions
  three/            WebGL flacon, atmosphere, and the SVG fallback poster
  home/             the homepage sections, one file each
  product/ collection/ cart/ checkout/ order/ account/ admin/ contact/ legal/
  ui/               primitives shared across features
lib/
  content/site.js   editorial copy — narrative, not inventory
  motion.js         the single motion vocabulary (easings, springs, variants)
  hooks.js          reduced-motion, pointer, focus trap, scroll lock, …
  store/ui.js       Zustand: overlays, cursor intent, intro state
  *-context.jsx     cart, auth, wishlist
models/             Product, Order + Customer, Review, Coupon, Subscriber, Enquiry
```

### Design system

Two moods, both luxury: **Noir** (dark, default) and **Ivoire** (light). Colour,
type and spacing are CSS variables in `app/globals.css`, so a theme switch is
one attribute on `<html>`. An inline script replays the stored choice before
first paint, so there is no flash.

The admin panel opts out entirely via `.admin-root`, which redeclares the
palette and is always dark. It also skips the loader, inertial scroll, custom
cursor and page transitions — a tool should feel immediate, not cinematic.

### The 3D layer

There are no `.glb` assets. The flacon is modelled procedurally in
`components/three/atelier.js`: a lathed glass silhouette, a lathed liquid volume
that stops at the fill line, a machined collar and stopper, and a label drawn to
a canvas at runtime. Lighting comes from emissive `Lightformer` planes rather
than a fetched HDR, so the scene makes no network requests.

`FlaconStage` decides what a device gets: full fidelity, reduced fidelity, or
`FlaconPoster` — a composed SVG flacon shown under reduced-motion, without
WebGL, or on very constrained hardware. The layout is identical either way.

**Bundle discipline:** the WebGL scene is `dynamic(..., { ssr: false })`, and the
juice palette lives in `components/three/juice.js` with no three.js import.
Importing it from `atelier.js` pulled ~370 KB of three into every first load.

### Motion

Everything draws from `lib/motion.js` — one easing set, one spring set, one
viewport threshold. Nothing pops: content enters from behind a mask or from
below. `prefers-reduced-motion` is honoured at three levels — CSS collapses all
transitions, every animated component checks the hook, and the loader, page
transitions and pinned scroll sections do not run at all.

## What was preserved

Every existing contract still holds:

- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`
- `GET/POST /api/orders`, `GET/PUT /api/orders/[id]`
- `POST /api/admin/login|logout`, `POST /api/upload`
- The `Product` and `Order` schemas — `Order` gained optional fields only
- Admin JWT cookie auth and its middleware gate
- Cart shape in localStorage (`mn_cart`)
- `/?category=` and `/?sort=` links redirect to `/collection` with the same params

## What was added

**Backend** — `Customer` (accounts, addresses, wishlist), `Review` (moderated),
`Coupon`, `Subscriber`, `Enquiry`, plus routes under `/api/auth`, `/api/account`,
`/api/reviews`, `/api/coupons`, `/api/contact`, `/api/newsletter`.

**Admin** — dashboard with revenue chart and attention queue; inventory with
search, sort, filters, bulk actions and CSV export; orders with expandable
detail and export; discounts, customers, review moderation and an enquiry inbox.

## Correctness changes

Four things were fixed rather than carried forward:

1. **Overselling.** Stock was read, checked, then decremented in a separate
   write. Two simultaneous checkouts could both pass the check and drive stock
   negative. Claims now use a conditional `$inc` guarded by `stock >= qty`, and
   roll back if any line fails. Covered by a concurrency test.
2. **Privilege escalation.** `verifyAdminToken` accepted any token signed with
   `JWT_SECRET` — including a customer token replayed as `admin_token`. Tokens
   now carry a scope and customer-scoped tokens are rejected.
3. **Order page data exposure.** `/order/[id]` returned full name, email, phone
   and street address to anyone with the id. Non-owners now see a masked view;
   signing in with the order's email reveals it in full.
4. **The contact form did not send anything.** It resolved a timer and showed
   success. It now writes an `Enquiry`, readable in the admin inbox.

Legal pages named a different house and an email that did not exist; the clause
substance is unchanged but the entity, contact details and returns window now
match the business. **These are not legal advice — have them reviewed.**

## Notes

- Pages read from MongoDB directly in server components; the homepage and
  collection degrade to editorial content if the database is unreachable rather
  than returning a 500.
- Payment is cash on delivery, as before. No payment provider is integrated.
- `/api/upload` stores images in MongoDB and serves them from `/api/media/[id]`.
  It used to write into `public/uploads`, which threw `EROFS` on Vercel — the
  serverless filesystem is read-only. The files already committed under
  `public/uploads` are static assets and still resolve; only new uploads go to
  the database. Uploading requires an admin session and is capped at 4MB per
  file, under Vercel's 4.5MB request body limit.
- Atlas' free tier is 512MB shared with the catalogue. If photography outgrows
  it, point `/api/upload` at Vercel Blob or Cloudinary — `images` is just a list
  of URLs, so existing records keep resolving and nothing needs migrating.
