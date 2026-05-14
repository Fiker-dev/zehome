import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Cancelled',
  robots: 'noindex',
}

export default function OrderCancelledPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-charcoal-muted/10 flex items-center justify-center text-charcoal-muted text-3xl">
        ×
      </div>

      <h1 className="font-display text-3xl font-semibold text-charcoal">
        Payment cancelled
      </h1>

      <p className="text-charcoal-light leading-relaxed">
        Your payment was not completed. Your cart has been saved — you can try
        again whenever you are ready.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/checkout"
          className="bg-terracotta text-warm-white px-8 py-3 rounded text-sm font-medium hover:bg-terracotta-dark transition-colors"
        >
          Try again
        </Link>
        <Link
          href="/"
          className="border border-border text-charcoal px-8 py-3 rounded text-sm font-medium hover:border-charcoal-light transition-colors"
        >
          Back to shop
        </Link>
      </div>
    </div>
  )
}
