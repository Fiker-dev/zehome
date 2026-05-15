import Image from 'next/image'
import Link from 'next/link'
import { Truck, Clock, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import products from '@/data/products.json'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  const hero = products[0]

  return (
    <>
      {/* Hero */}
      <section className="bg-cream">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-charcoal leading-tight">
              Change your whole room for R400
            </h1>
            <p className="text-charcoal-light text-lg leading-relaxed">
              Free delivery. Ships in 3-5 days across South Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/product/${hero.slug}`}
                className="inline-flex items-center justify-center bg-terracotta text-warm-white px-8 py-4 rounded text-base font-medium tracking-wide hover:bg-terracotta-dark transition-colors"
              >
                Get yours now
              </Link>
            </div>
            <p className="text-sm text-charcoal-muted">{hero.trustLine}</p>
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden bg-warm-white order-first md:order-last">
            <Image
              src={hero.images[0]}
              alt={hero.seo.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-warm-white border-y border-border py-5">
        <div className="max-w-6xl mx-auto px-4">
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-12">
            <li className="flex items-center gap-2.5 text-sm text-charcoal">
              <Truck size={16} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span>Free Delivery</span>
            </li>
            <li className="hidden sm:block text-border">·</li>
            <li className="flex items-center gap-2.5 text-sm text-charcoal">
              <Clock size={16} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span>3-5 Days SA</span>
            </li>
            <li className="hidden sm:block text-border">·</li>
            <li className="flex items-center gap-2.5 text-sm text-charcoal">
              <ShieldCheck size={16} className="text-terracotta flex-shrink-0" strokeWidth={1.5} />
              <span>Secure Checkout</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Collection hero */}
      <section className="relative w-full overflow-hidden bg-charcoal" style={{ minHeight: '360px' }}>
        <Image
          src="/images/lamp-lifestyle.jpg"
          alt="Warm projection lamp glow in a room"
          fill
          className="object-cover opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/40 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 flex flex-col justify-center" style={{ minHeight: '360px' }}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-medium mb-4">
            The Collection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-warm-white leading-tight max-w-lg">
            Transform your space tonight
          </h2>
          <p className="text-warm-white/70 mt-4 text-base max-w-sm">
            Three lamps. One for every mood and every room.
          </p>
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              image={p.images[0]}
            />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-warm-white border-y border-border py-10">
        <div className="max-w-6xl mx-auto px-4">
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-charcoal-light text-center">
            <li className="flex flex-col items-center gap-1">
              <span className="font-display text-charcoal text-base font-semibold">Free delivery</span>
              <span>Across South Africa</span>
            </li>
            <li className="hidden sm:block text-border">|</li>
            <li className="flex flex-col items-center gap-1">
              <span className="font-display text-charcoal text-base font-semibold">3-5 days</span>
              <span>Door-to-door delivery</span>
            </li>
            <li className="hidden sm:block text-border">|</li>
            <li className="flex flex-col items-center gap-1">
              <span className="font-display text-charcoal text-base font-semibold">No hassle</span>
              <span>Easy returns</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
