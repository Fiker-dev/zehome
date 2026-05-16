import type { Metadata } from 'next'
import { RotateCcw, CheckCircle, XCircle, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns Policy | Ze Home Finds',
  description: '14-day returns policy. Items must be unused and in original packaging. Defects reported within 7 working days. Compliant with the Consumer Protection Act.',
  alternates: { canonical: '/returns' },
}

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="flex flex-col gap-3 mb-14">
        <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
          Returns & Refunds
        </p>
        <h1 className="font-display text-charcoal" style={{ fontSize: '40px' }}>
          Returns policy
        </h1>
        <p className="font-body text-warm-gray" style={{ fontSize: '15px' }}>
          14 days from purchase. Items must be unused and in original packaging.
        </p>
      </div>

      {/* How it works */}
      <div className="flex flex-col gap-6 mb-14">
        <h2 className="font-display text-charcoal" style={{ fontSize: '22px' }}>How returns work</h2>

        {[
          { icon: MessageCircle, step: '1', text: 'WhatsApp us within 14 days of purchase to initiate a return. Item must be unused and in original packaging.' },
          { icon: RotateCcw,     step: '2', text: "Pack the item securely in its original packaging and we'll arrange collection or advise drop-off." },
          { icon: CheckCircle,   step: '3', text: 'Once we receive and inspect the item, your refund is processed within 7 business days. Delivery costs are not refunded on returns.' },
        ].map(({ icon: Icon, step, text }) => (
          <div key={step} className="flex gap-5 items-start border-b border-border pb-6 last:border-0 last:pb-0">
            <div className="flex-shrink-0 w-10 h-10 bg-cream flex items-center justify-center">
              <Icon size={18} className="text-terracotta" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-body text-warm-gray uppercase tracking-[0.1em]" style={{ fontSize: '10px' }}>Step {step}</p>
              <p className="font-body text-charcoal-light" style={{ fontSize: '14px', lineHeight: '1.6' }}>{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Eligible / not eligible */}
      <div className="grid sm:grid-cols-2 gap-6 mb-14">
        <div className="border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-terracotta" strokeWidth={1.5} />
            <p className="font-display text-charcoal" style={{ fontSize: '16px' }}>Eligible for return</p>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              'Item received damaged or defective',
              'Wrong item delivered',
              'Item not as described',
              'Within 14 days of purchase',
              'Unused and in original packaging',
            ].map((t) => (
              <li key={t} className="font-body text-warm-gray flex items-start gap-2" style={{ fontSize: '13px' }}>
                <span className="text-terracotta mt-0.5 flex-shrink-0">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-warm-gray" strokeWidth={1.5} />
            <p className="font-display text-charcoal" style={{ fontSize: '16px' }}>Not eligible</p>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              'More than 14 days after purchase',
              'Item has been used or opened',
              'Missing original packaging',
              'Delivery costs — not refunded on returns',
              'Change of mind after 14 days',
            ].map((t) => (
              <li key={t} className="font-body text-warm-gray flex items-start gap-2" style={{ fontSize: '13px' }}>
                <span className="flex-shrink-0 mt-0.5">×</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Defects note */}
      <div className="bg-cream border border-border p-6 mb-14 flex flex-col gap-2">
        <p className="font-display text-charcoal" style={{ fontSize: '16px' }}>Defective or damaged items</p>
        <p className="font-body text-warm-gray" style={{ fontSize: '13px', lineHeight: '1.6' }}>
          Report any defects or damage within 7 working days of receiving your order.
          For defect queries, you can also email{' '}
          <a
            href="mailto:info@perfectdealz.co.za"
            className="text-terracotta hover:text-terracotta-dark transition-colors"
          >
            info@perfectdealz.co.za
          </a>
          . Exchanges are offered for defective or damaged items.
        </p>
      </div>

      <div className="bg-cream border border-border p-8 flex flex-col gap-3">
        <p className="font-display text-charcoal" style={{ fontSize: '20px' }}>Start a return</p>
        <p className="font-body text-warm-gray" style={{ fontSize: '14px' }}>
          WhatsApp us with your order details and we&apos;ll sort it out straight away.
        </p>
        <a
          href="https://wa.me/27710278563?text=Hi%20Ze%20Home%20Finds%2C%20I%20would%20like%20to%20return%20my%20order"
          className="inline-flex items-center gap-2 font-body font-medium text-terracotta hover:text-terracotta-dark transition-colors"
          style={{ fontSize: '14px' }}
        >
          +27 71 027 8563
        </a>
      </div>
    </div>
  )
}
