import type { Metadata } from 'next'
import { Truck, Clock, MapPin, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Delivery Info | Ze Home Finds',
  description: 'Free delivery across South Africa in 3-5 business days. We ship nationwide via courier with tracking.',
  alternates: { canonical: '/delivery' },
}

const items = [
  {
    icon: Truck,
    title: 'Free delivery on all orders',
    body: 'No minimum order. Every single order ships free to your door, anywhere in South Africa.',
  },
  {
    icon: Clock,
    title: '3–5 business days nationwide',
    body: 'Orders are dispatched within 1 business day. Delivery takes 3–5 business days depending on your area.',
  },
  {
    icon: MapPin,
    title: 'We ship everywhere in SA',
    body: 'Johannesburg, Cape Town, Durban, Pretoria — and everywhere in between. No PO boxes.',
  },
  {
    icon: Package,
    title: 'Courier tracking included',
    body: "You'll receive a tracking number via WhatsApp once your order has been dispatched.",
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
          We keep it simple — free delivery, fast dispatch, nationwide coverage.
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
          WhatsApp us and we'll get back to you within a few hours.
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
