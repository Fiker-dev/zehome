import type { Metadata } from 'next'
import { Truck, Clock, MapPin, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Delivery Info | Ze Home Finds',
  description: 'Free, tracked delivery on all orders across South Africa. The delivery time for each find is shown on its product page.',
  alternates: { canonical: '/delivery' },
}

const items = [
  {
    icon: Truck,
    title: 'Free delivery on every order',
    body: 'No minimum spend. No hidden fees. What you see at checkout is what you pay.',
  },
  {
    icon: Clock,
    title: 'Delivery time shown on every product',
    body: 'Our finds ship from our international supplier and arrive in 8–33 days, depending on the item. The exact window and an estimated arrival date are on each product page before you buy, and we email tracking once your order is dispatched.',
  },
  {
    icon: MapPin,
    title: 'We deliver across South Africa',
    body: 'Johannesburg, Cape Town, Durban, Pretoria and all surrounding areas. No PO boxes.',
  },
  {
    icon: Package,
    title: 'Door-to-door, tracked',
    body: 'Every order is tracked from dispatch to your door, so you always know where it is.',
  },
]

export default function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="flex flex-col gap-3 mb-14">
        <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
          Shipping
        </p>
        <h1 className="font-display text-charcoal" style={{ fontSize: '40px' }}>
          Delivery info
        </h1>
        <p className="font-body text-warm-gray" style={{ fontSize: '15px' }}>
          Free delivery. Fast dispatch. Nationwide coverage.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-5 border-b border-border pb-8 last:border-0 last:pb-0">
            <div className="flex-shrink-0 w-10 h-10 bg-cream flex items-center justify-center">
              <Icon size={18} className="text-terracotta" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-charcoal" style={{ fontSize: '18px' }}>{title}</p>
              <p className="font-body text-warm-gray" style={{ fontSize: '14px', lineHeight: '1.6' }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 bg-cream border border-border p-8 flex flex-col gap-3">
        <p className="font-display text-charcoal" style={{ fontSize: '20px' }}>Questions about your order?</p>
        <p className="font-body text-warm-gray" style={{ fontSize: '14px' }}>
          WhatsApp us and we&apos;ll get back to you as soon as we can.
        </p>
        <a
          href="https://wa.me/27710278563?text=Hi%20Ze%20Home%20Finds%2C%20I%20have%20a%20question%20about%20delivery"
          className="inline-flex items-center gap-2 font-body font-medium text-terracotta hover:text-terracotta-dark transition-colors"
          style={{ fontSize: '14px' }}
        >
          +27 71 027 8563
        </a>
      </div>
    </div>
  )
}
