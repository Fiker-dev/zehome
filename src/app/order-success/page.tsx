import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Received',
  robots: 'noindex',
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ pf_payment_id?: string; m_payment_id?: string }>
}) {
  const { pf_payment_id, m_payment_id } = await searchParams
  const hasPaymentReference = Boolean(pf_payment_id || m_payment_id)

  return (
    <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-3xl">
        {hasPaymentReference ? '✓' : '!'}
      </div>

      <h1 className="font-display text-3xl font-semibold text-charcoal">
        {hasPaymentReference ? 'Payment received' : 'Payment not found'}
      </h1>

      <p className="text-charcoal-light leading-relaxed text-lg">
        {hasPaymentReference
          ? 'PayFast has returned you to the store. We are checking the payment notification before dispatch.'
          : 'We could not find payment details for this visit. If you were not redirected from PayFast, your order has not been confirmed.'}
      </p>

      <div className="bg-warm-white border border-border rounded-lg p-5 w-full text-left text-sm text-charcoal-light space-y-1">
        {m_payment_id && (
          <p className="font-medium text-charcoal">Order ref: {m_payment_id}</p>
        )}
        {pf_payment_id && (
          <p className="font-medium text-charcoal">PayFast ref: {pf_payment_id}</p>
        )}
        <p>Free delivery across South Africa</p>
        <p>Estimated arrival: 3-7 business days</p>
        <a
          href="https://wa.me/27710278563?text=Hi%20Ze%20Home%20Finds%2C%20I%20have%20a%20question%20about%20my%20order."
          className="text-terracotta hover:text-terracotta-dark transition-colors"
        >
          Questions about your order? WhatsApp us — we&apos;ll get back to you as soon as we can.
        </a>
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
