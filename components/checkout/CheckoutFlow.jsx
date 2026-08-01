'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { EASE } from '@/lib/motion';
import { formatPKR, cn } from '@/lib/utils';
import { ASSURANCES, CONTACT } from '@/lib/content/site';
import MagneticButton from '@/components/ui/MagneticButton';
import { Eyebrow } from '@/components/ui/Primitives';
import BottleGlyph from '@/components/ui/BottleGlyph';
import SplitText from '@/components/ui/SplitText';

const STEPS = [
  { id: 'details', label: 'Your details' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'review', label: 'Review' },
];

const REQUIRED = {
  details: ['name', 'email', 'phone'],
  delivery: ['address', 'city'],
};

/**
 * Three-step checkout.
 *
 * The request the house API receives is unchanged — `{ items, customer }` with
 * an optional `couponCode`. Steps exist only to break a long form into
 * digestible passes; nothing is submitted until the final confirmation.
 */
export default function CheckoutFlow() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { customer, isAuthenticated } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', note: '' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [failure, setFailure] = useState('');

  /* Coupon */
  const [codeInput, setCodeInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  /* Prefill from the signed-in account and its default address. */
  useEffect(() => {
    if (!customer) return;
    const preferred =
      customer.addresses?.find((a) => a.isDefault) || customer.addresses?.[0] || null;

    setForm((f) => ({
      ...f,
      name: f.name || preferred?.name || customer.name || '',
      email: f.email || customer.email || '',
      phone: f.phone || preferred?.phone || customer.phone || '',
      address: f.address || preferred?.address || '',
      city: f.city || preferred?.city || '',
    }));
  }, [customer]);

  const discount = coupon?.discount || 0;
  const payable = Math.max(0, total - discount);

  const stepValid = useMemo(() => {
    const fields = REQUIRED[STEPS[step].id] || [];
    return fields.every((f) => {
      const value = form[f]?.trim();
      if (!value) return false;
      if (f === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (f === 'phone') return value.replace(/\D/g, '').length >= 7;
      return value.length >= 2;
    });
  }, [step, form]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function next() {
    if (!stepValid) {
      const fields = REQUIRED[STEPS[step].id] || [];
      const nextErrors = {};
      fields.forEach((f) => {
        if (!form[f]?.trim()) nextErrors[f] = 'Required';
      });
      setErrors(nextErrors);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function applyCode(e) {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setCheckingCode(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeInput,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'That code is not recognised.');
      setCoupon(data);
      setCodeInput('');
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message);
    } finally {
      setCheckingCode(false);
    }
  }

  async function placeOrder() {
    setPlacing(true);
    setFailure('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          customer: {
            name: form.name,
            email: form.email,
            address: form.address,
            city: form.city,
            phone: form.phone,
          },
          note: form.note,
          ...(coupon ? { couponCode: coupon.code } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      clearCart();
      router.push(`/order/${data._id}`);
    } catch (err) {
      setFailure(err.message);
      setPlacing(false);
    }
  }

  /* ── Empty bag ── */
  if (items.length === 0) {
    return (
      <div className="shell flex min-h-[70vh] flex-col items-center justify-center pt-32 text-center">
        <BottleGlyph className="h-20 w-20 text-ink-4" />
        <h1 className="mt-10 font-display text-4xl font-normal">Your bag is empty.</h1>
        <p className="mt-4 max-w-[36ch] text-[17px] leading-relaxed text-ink-3">
          Nothing to check out yet. The library is a short walk away.
        </p>
        <Link href="/collection" className="btn-luxe mt-10">
          Browse the library
        </Link>
      </div>
    );
  }

  return (
    <div className="shell-wide pb-28 pt-32 md:pt-44">
      <Eyebrow>Checkout</Eyebrow>
      <SplitText
        as="h1"
        lines={['Almost yours.']}
        className="mt-8 font-display text-display-sm font-normal"
      />

      <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-20">
        {/* ══════════ Form column ══════════ */}
        <div className="lg:col-span-7">
          {/* Progress */}
          <ol className="flex items-center gap-3" aria-label="Checkout progress">
            {STEPS.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={s.id} className="flex flex-1 items-center gap-3">
                  <button
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    aria-current={current ? 'step' : undefined}
                    className={cn(
                      'flex flex-1 flex-col gap-2.5 text-left transition-opacity',
                      i > step && 'cursor-default opacity-40'
                    )}
                  >
                    <span className="relative h-px w-full bg-hairline">
                      <motion.span
                        className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                        initial={false}
                        animate={{ width: done || current ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: EASE.luxe }}
                      />
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[12px] uppercase tracking-[0.07em]',
                        current ? 'text-accent' : done ? 'text-ink-2' : 'text-ink-4'
                      )}
                    >
                      {String(i + 1).padStart(2, '0')} — {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Sign-in nudge */}
          {!isAuthenticated && step === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 border border-hairline/60 bg-surface px-6 py-4 text-[15px] leading-relaxed text-ink-3"
            >
              Checking out as a guest.{' '}
              <Link href="/account" className="text-accent underline underline-offset-4">
                Sign in
              </Link>{' '}
              to save this address and track the order.
            </motion.p>
          )}

          {/* Steps */}
          <div className="mt-12 min-h-[24rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={STEPS[step].id}
                initial={{ opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -26 }}
                transition={{ duration: 0.45, ease: EASE.luxe }}
              >
                {step === 0 && (
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Field label="Full name" value={form.name} onChange={(v) => set('name', v)} error={errors.name} autoComplete="name" />
                    <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} type="tel" autoComplete="tel" />
                    <div className="sm:col-span-2">
                      <Field label="Email" value={form.email} onChange={(v) => set('email', v)} error={errors.email} type="email" autoComplete="email" />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-8">
                    {/* Saved addresses */}
                    {isAuthenticated && customer?.addresses?.length > 0 && (
                      <div>
                        <p className="eyebrow-muted">Saved addresses</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {customer.addresses.map((a) => (
                            <button
                              key={a._id}
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  address: a.address,
                                  city: a.city,
                                  phone: a.phone || f.phone,
                                  name: a.name || f.name,
                                }))
                              }
                              className={cn(
                                'border p-4 text-left transition-colors duration-500',
                                form.address === a.address
                                  ? 'border-[var(--accent)]'
                                  : 'border-hairline/60 hover:border-hairline'
                              )}
                            >
                              <p className="font-mono text-[12px] uppercase tracking-[0.07em] text-accent">
                                {a.label}
                              </p>
                              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                                {a.address}, {a.city}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Field label="Street address" value={form.address} onChange={(v) => set('address', v)} error={errors.address} autoComplete="street-address" />
                    <Field label="City" value={form.city} onChange={(v) => set('city', v)} error={errors.city} autoComplete="address-level2" />

                    <div>
                      <label className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
                        Delivery note (optional)
                      </label>
                      <textarea
                        rows={3}
                        value={form.note}
                        onChange={(e) => set('note', e.target.value)}
                        placeholder="Landmarks, gate codes, preferred delivery window…"
                        className="field-luxe resize-none text-[17px]"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10">
                    <Summary title="Contact" onEdit={() => setStep(0)}>
                      <p>{form.name}</p>
                      <p className="text-ink-3">{form.email}</p>
                      <p className="text-ink-3">{form.phone}</p>
                    </Summary>

                    <Summary title="Delivering to" onEdit={() => setStep(1)}>
                      <p>{form.address}</p>
                      <p className="text-ink-3">{form.city}</p>
                      {form.note && <p className="mt-2 text-ink-4">“{form.note}”</p>}
                    </Summary>

                    <Summary title="Payment">
                      <p>Cash on delivery</p>
                      <p className="text-ink-3">
                        Payment is collected when the parcel reaches you. Nothing is charged now.
                      </p>
                    </Summary>

                    {failure && (
                      <p className="border border-red-500/40 bg-red-500/5 px-5 py-4 font-mono text-[13px] uppercase tracking-[0.06em] text-red-400">
                        {failure}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-hairline/50 pt-10">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="link-draw font-mono text-[13px] uppercase tracking-[0.08em] text-ink-4 hover:text-accent"
              >
                ← Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <MagneticButton onClick={next} className="ml-auto" cursorLabel="Next">
                Continue
              </MagneticButton>
            ) : (
              <MagneticButton
                onClick={placeOrder}
                disabled={placing}
                variant="solid"
                className="ml-auto"
                cursorLabel="Place"
              >
                {placing ? 'Placing order…' : `Place order — ${formatPKR(payable)}`}
              </MagneticButton>
            )}
          </div>
        </div>

        {/* ══════════ Summary column ══════════ */}
        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="border border-hairline/60 bg-surface p-8">
            <p className="eyebrow-muted">Order summary</p>

            <ul className="mt-8 divide-y divide-hairline/40">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-5 py-5">
                  <div className="relative h-24 w-18 shrink-0 overflow-hidden bg-elevated" style={{ width: '4.5rem' }}>
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />
                    ) : (
                      <BottleGlyph className="h-full w-full p-3 text-ink-4" />
                    )}
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center bg-obsidian/80 px-1 font-mono text-[12px] tabular-nums text-cream">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="truncate font-display text-lg font-normal">{item.name}</p>
                    <p className="mt-1 font-mono text-[13px] tabular-nums text-ink-4">
                      {formatPKR(item.price)} each
                    </p>
                  </div>
                  <p className="shrink-0 self-center font-mono text-sm tabular-nums">
                    {formatPKR(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Coupon */}
            <div className="mt-6 border-t border-hairline/40 pt-6">
              {coupon ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[13px] uppercase tracking-[0.07em] text-accent">
                      {coupon.code} applied
                    </p>
                    {coupon.description && (
                      <p className="mt-1 text-[14px] text-ink-4">{coupon.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setCoupon(null)}
                    className="font-mono text-[13px] uppercase tracking-[0.07em] text-ink-4 hover:text-accent"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCode} className="flex items-end gap-3">
                  <div className="flex-1">
                    <label htmlFor="coupon" className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
                      Discount code
                    </label>
                    <input
                      id="coupon"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="—"
                      className="field-luxe pt-3 font-mono text-sm uppercase tracking-[0.05em]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={checkingCode || !codeInput.trim()}
                    className="shrink-0 border border-hairline px-5 py-3 font-mono text-[13px] uppercase tracking-[0.07em] text-ink-2 transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
                  >
                    {checkingCode ? '…' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="mt-3 font-mono text-[13px] uppercase tracking-[0.06em] text-red-400">
                  {couponError}
                </p>
              )}
            </div>

            {/* Totals */}
            <dl className="mt-6 space-y-3 border-t border-hairline/40 pt-6 font-mono text-[13px] uppercase tracking-[0.06em]">
              <Row label="Subtotal" value={formatPKR(total)} />
              {discount > 0 && (
                <Row label="Discount" value={`− ${formatPKR(discount)}`} accent />
              )}
              <Row label="Delivery" value="Calculated on despatch" muted />
              <div className="flex items-baseline justify-between border-t border-hairline/40 pt-4">
                <dt className="text-ink-2">Total</dt>
                <dd className="font-display text-2xl font-normal tabular-nums tracking-normal">
                  {formatPKR(payable)}
                </dd>
              </div>
            </dl>

            {/* Assurances */}
            <ul className="mt-8 space-y-2.5 border-t border-hairline/40 pt-6">
              {ASSURANCES.map((a) => (
                <li key={a.title} className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-4">
                  <span className="mr-2 text-accent">—</span>
                  {a.title}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[14px] leading-relaxed text-ink-4">
              Questions before you order? WhatsApp the house on{' '}
              <a href={CONTACT.whatsapp} className="text-accent underline underline-offset-4">
                {CONTACT.phone}
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent, muted }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-4">{label}</dt>
      <dd className={cn('tabular-nums', accent ? 'text-accent' : muted ? 'text-ink-4' : 'text-ink-2')}>
        {value}
      </dd>
    </div>
  );
}

function Field({ label, value, onChange, error, type = 'text', autoComplete }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">
          {label}
        </label>
        {error && (
          <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-red-400">
            {error}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={cn('field-luxe text-[17px]', error && 'border-b-red-400/60')}
      />
    </div>
  );
}

function Summary({ title, children, onEdit }) {
  return (
    <div className="border-b border-hairline/40 pb-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-4">{title}</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="link-draw font-mono text-[12px] uppercase tracking-[0.07em] text-ink-4 hover:text-accent"
          >
            Edit
          </button>
        )}
      </div>
      <div className="mt-4 space-y-1 text-[17px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}
