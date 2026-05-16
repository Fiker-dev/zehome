import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
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
            className="inline-flex items-center justify-center border border-white/70 text-white hover:bg-white hover:text-charcoal font-body font-medium uppercase tracking-[0.16em] transition-all duration-300 w-full sm:w-auto px-10 min-h-[50px]"
            style={{ fontSize: '12px' }}
          >
            Shop the collection
          </Link>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white opacity-50 animate-bounce">
          <ChevronDown size={20} strokeWidth={1.5} />
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-cream border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
          <ul className="flex flex-row items-center justify-center gap-5 sm:gap-12 overflow-x-auto">
            <li className="font-body text-warm-gray uppercase tracking-[0.14em] whitespace-nowrap flex-shrink-0" style={{ fontSize: '10px' }}>
              Free Delivery
            </li>
            <li className="text-border flex-shrink-0" style={{ fontSize: '10px' }}>·</li>
            <li className="font-body text-warm-gray uppercase tracking-[0.14em] whitespace-nowrap flex-shrink-0" style={{ fontSize: '10px' }}>
              3–7 Days SA-Wide
            </li>
            <li className="text-border flex-shrink-0" style={{ fontSize: '10px' }}>·</li>
            <li className="font-body text-warm-gray uppercase tracking-[0.14em] whitespace-nowrap flex-shrink-0" style={{ fontSize: '10px' }}>
              Secure Checkout
            </li>
          </ul>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-10 sm:mb-14 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1 max-w-[40px]" />
            <p className="font-body text-terracotta uppercase font-medium tracking-[0.22em]" style={{ fontSize: '10px' }}>
              The Collection
            </p>
          </div>
          <h2 className="font-display italic text-charcoal leading-tight" style={{ fontSize: 'clamp(30px, 5vw, 42px)' }}>
            Set the mood.<br className="sm:hidden" /> Change the room.
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
