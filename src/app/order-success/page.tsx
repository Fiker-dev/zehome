import Link from 'next/link'
import type { Metadata } from 'next'
import ClearCart from './ClearCart'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: 'noindex',
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ pf_payment_id?: string; m_payment_id?: string }>
}) {
  const { m_payment_id } = await searchParams

  return (
    <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
      <ClearCart />

      <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-3xl">
        ✓
      </div>

      <h1 className="font-display text-3xl font-semibold text-charcoal">
        Order confirmed
      </h1>

      <p className="text-charcoal-light leading-relaxed text-lg">
        You&apos;re all set. Your lamp is on its way.
      </p>

      <div className="bg-warm-white border border-border rounded-lg p-5 w-full text-left text-sm text-charcoal-light space-y-1">
        {m_payment_id && (
          <p className="font-medium text-charcoal">Order ref: {m_payment_id}</p>
        )}
        <p>Free delivery across South Africa</p>
        <p>Estimated arrival: 3-5 business days</p>
        <p>Any questions? WhatsApp us on +27 71 027 8563</p>
      </div>

      <Link
        href="/"
        className="bg-terracotta text-warm-white px-8 py-3 rounded text-sm font-medium hover:bg-terracotta-dark transition-colors"
      >
        Back to shop
      </Link>
    </div>
  )
}
