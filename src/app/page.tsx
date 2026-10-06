import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import products from '@/data/products.json'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const heroProducts = products.slice(0, 3)

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-cream overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="flex flex-col gap-5 sm:gap-6 items-center md:items-start text-center md:text-left">
            <p className="font-body text-terracotta uppercase font-medium tracking-[0.22em]" style={{ fontSize: '11px' }}>
              Viral finds, delivered
            </p>
            <h1
              className="font-display italic text-charcoal leading-[1.05]"
              style={{ fontSize: 'clamp(40px, 7vw, 60px)' }}
            >
              The finds everyone’s talking about
            </h1>
            <p className="font-body text-charcoal-light max-w-md" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Hand-picked from what’s trending on TikTok right now, with free delivery to your door across South Africa.
            </p>
            <Link
              href="#products"
              className="inline-flex items-center justify-center bg-charcoal hover:bg-terracotta text-white font-body font-medium uppercase tracking-[0.16em] transition-colors duration-300 w-full sm:w-auto px-10 min-h-[52px]"
              style={{ fontSize: '12px' }}
            >
              Shop the finds
            </Link>
          </div>

          <div className="grid grid-cols-5 grid-rows-2 gap-3 aspect-[5/4]">
            {heroProducts.map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className={`group relative overflow-hidden bg-warm-white ${i === 0 ? 'col-span-3 row-span-2' : 'col-span-2'}`}
              >
                <Image
                  src={p.images[0]}
                  alt={p.seo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={i === 0 ? '(min-width: 768px) 330px, 60vw' : '(min-width: 768px) 220px, 40vw'}
                  priority
                />
                <span
                  className="absolute left-2 bottom-2 bg-warm-white/95 text-charcoal font-body font-medium px-2.5 py-1"
                  style={{ fontSize: '12px' }}
                >
                  R{p.price}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-warm-white border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
          <ul className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-12">
            <li className="font-body text-warm-gray uppercase tracking-[0.14em] whitespace-nowrap flex-shrink-0" style={{ fontSize: '10px' }}>
              Free Delivery
            </li>
            <li className="hidden sm:block text-border flex-shrink-0" style={{ fontSize: '10px' }}>·</li>
            <li className="font-body text-warm-gray uppercase tracking-[0.14em] whitespace-nowrap flex-shrink-0" style={{ fontSize: '10px' }}>
              Tracked SA-Wide
            </li>
            <li className="hidden sm:block text-border flex-shrink-0" style={{ fontSize: '10px' }}>·</li>
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
              Trending now
            </p>
          </div>
          <h2 className="font-display italic text-charcoal leading-tight" style={{ fontSize: 'clamp(30px, 5vw, 42px)' }}>
            This week’s<br className="sm:hidden" /> best finds.
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {products.map((p) => (
            <div key={p.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <ProductCard
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                image={p.images[0]}
                trustLine={p.trustLine}
                category={p.category}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
