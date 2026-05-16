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
  '3d-solar-projection-lamp',
  'star-projector-galaxy-night-light',
  '3d-moon-light-lamp-20cm',
  '3d-moon-lamp-humidifier',
]

const CATEGORIES: Record<string, string> = {
  'star-projector-galaxy-night-light':  'STAR PROJECTOR',
  '3d-solar-projection-lamp':           'PROJECTION LAMP',
  '3d-moon-light-lamp-20cm':            'COLOUR MOON LAMP',
  '3d-moon-lamp-humidifier':            'MOON LAMP + HUMIDIFIER',
}

const BADGES: Record<string, string> = {}

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
          quality={85}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center flex flex-col items-center gap-5 sm:gap-6">
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
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white opacity-50 animate-bounce">
          <ChevronDown size={20} strokeWidth={1.5} />
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-cream border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <ul className="flex flex-row items-center justify-center gap-4 sm:gap-14 overflow-x-auto">
            <li className="flex items-center gap-2 flex-shrink-0">
              <Truck size={13} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span className="font-body text-warm-gray uppercase tracking-[0.08em] whitespace-nowrap" style={{ fontSize: '11px' }}>
                Free Delivery
              </span>
            </li>
            <li className="text-border text-xs flex-shrink-0">·</li>
            <li className="flex items-center gap-2 flex-shrink-0">
              <Clock size={13} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span className="font-body text-warm-gray uppercase tracking-[0.08em] whitespace-nowrap" style={{ fontSize: '11px' }}>
                3-7 days SA-wide
              </span>
            </li>
            <li className="text-border text-xs flex-shrink-0">·</li>
            <li className="flex items-center gap-2 flex-shrink-0">
              <ShieldCheck size={13} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span className="font-body text-warm-gray uppercase tracking-[0.08em] whitespace-nowrap" style={{ fontSize: '11px' }}>
                Secure checkout
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-12 flex flex-col gap-3">
          <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
            The Collection
          </p>
          <h2 className="font-display text-charcoal" style={{ fontSize: '36px' }}>
            Set the mood. Change the room.
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {sorted.map((p) => (
            <div key={p.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <ProductCard
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                image={p.images[0]}
                trustLine={p.trustLine}
                category={CATEGORIES[p.slug]}
                badge={BADGES[p.slug]}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
