import Image from 'next/image'
import Link from 'next/link'
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

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-terracotta font-medium mb-2">
              The collection
            </p>
            <h2 className="font-display text-3xl font-semibold text-charcoal">
              Light that changes everything
            </h2>
          </div>
          <p className="text-sm text-charcoal-muted max-w-xs sm:text-right">
            Three lamps. One for every mood and every room.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              image={p.images[0]}
              trustLine={p.trustLine}
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
