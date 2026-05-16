import Image from 'next/image'
import Link from 'next/link'
import { Truck, Clock, ShieldCheck, ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'
import products from '@/data/products.json'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const ORDER = [
  'neon-flex-light-strip-3m',
  'stretchable-atmosphere-sunset-lamp',
  'star-projector-galaxy-night-light',
  '3d-solar-projection-lamp',
  'crystal-touch-lamp',
  '3d-moon-light-lamp-20cm',
  '3d-moon-lamp-humidifier',
  'led-neon-rope-light-10m',
]

const CATEGORIES: Record<string, string> = {
  'neon-flex-light-strip-3m':            'NEON STRIP',
  'led-neon-rope-light-10m':             'NEON ROPE',
  'stretchable-atmosphere-sunset-lamp':  'SUNSET LAMP',
  'star-projector-galaxy-night-light':  'STAR PROJECTOR',
  '3d-solar-projection-lamp':           'PROJECTION LAMP',
  'crystal-touch-lamp':                 'TOUCH LAMP',
  '3d-moon-light-lamp-20cm':            'MOON LAMP',
  '3d-moon-lamp-humidifier':            'MOON LAMP',
}

const BADGES: Record<string, string> = {
  'stretchable-atmosphere-sunset-lamp': 'As seen on TikTok',
}

export default function HomePage() {
  const sorted = ORDER
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as typeof products

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-charcoal flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: '70vh' }}>
        <Image
          src="/images/lamp-lifestyle-hero.jpg"
          alt="Warm mood lighting in a South African home"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-6">
          <h1
            className="font-display italic text-white leading-tight"
            style={{ fontSize: 'clamp(48px, 8vw, 64px)' }}
          >
            Transform your space tonight
          </h1>
          <p className="font-body text-white max-w-md" style={{ fontSize: '16px', opacity: 0.8 }}>
            Mood lighting delivered to your door in 3-7 business days across South Africa
          </p>
          <Link
            href="#products"
            className="inline-flex items-center justify-center bg-terracotta hover:bg-terracotta-dark text-white font-body font-medium uppercase tracking-[0.1em] transition-colors w-full sm:w-auto px-10 min-h-[48px]"
            style={{ fontSize: '13px' }}
          >
            Shop the collection
          </Link>
          <p className="font-body italic text-warm-gray" style={{ fontSize: '11px' }}>
            Join 200+ SA homes already transformed
          </p>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white opacity-50 animate-bounce">
          <ChevronDown size={20} strokeWidth={1.5} />
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-cream border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-14">
            <li className="flex items-center gap-2.5">
              <Truck size={15} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span className="font-body text-warm-gray uppercase tracking-[0.08em]" style={{ fontSize: '12px' }}>
                Free Delivery on all orders
              </span>
            </li>
            <li className="hidden sm:block text-border text-xs">·</li>
            <li className="flex items-center gap-2.5">
              <Clock size={15} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span className="font-body text-warm-gray uppercase tracking-[0.08em]" style={{ fontSize: '12px' }}>
                Ships in 3-7 business days SA-wide
              </span>
            </li>
            <li className="hidden sm:block text-border text-xs">·</li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck size={15} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span className="font-body text-warm-gray uppercase tracking-[0.08em]" style={{ fontSize: '12px' }}>
                Secure checkout via PayFast
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12 flex flex-col gap-3">
          <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
            The Collection
          </p>
          <h2 className="font-display text-charcoal" style={{ fontSize: '36px' }}>
            Set the mood. Change the room.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              image={p.images[0]}
              trustLine={p.trustLine}
              category={CATEGORIES[p.slug]}
              badge={BADGES[p.slug]}
            />
          ))}
        </div>
      </section>
    </>
  )
}
