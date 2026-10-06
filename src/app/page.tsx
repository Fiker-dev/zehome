import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Sparkles, Truck, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import products from '@/data/products.json'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const heroProducts = products.slice(0, 3)

const WHY_US = [
  { icon: Sparkles, title: 'Only what’s trending', body: 'We test what’s going viral and only stock the finds worth the hype.' },
  { icon: Truck, title: 'Free, tracked delivery', body: 'No minimum spend. Every order is tracked from dispatch to your door, anywhere in SA.' },
  { icon: ShieldCheck, title: 'Safe checkout', body: 'Pay securely with PayFast by card or Instant EFT, with 14-day returns if it’s not for you.' },
]

const FAQ = [
  { q: 'How long does delivery take?', a: 'Each product page shows its delivery window and an estimated arrival date before you buy. Delivery is free and tracked, and we email your tracking number when your order ships.' },
  { q: 'How do I pay?', a: 'Checkout runs through PayFast, South Africa’s trusted payment gateway. You can pay by card, Instant EFT and other PayFast methods. We never see your card details.' },
  { q: 'Can I return something?', a: 'Yes. Return any unused item in its original packaging within 14 days. If something arrives damaged or faulty, WhatsApp us and we will sort it out.' },
  { q: 'How do I track my order?', a: 'You get a tracking number by email once your order is dispatched. You can also WhatsApp us on +27 71 027 8563 with your order reference.' },
]

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

      {/* ── WHY US ── */}
      <section className="bg-cream border-y border-border/60">
        <ul className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
          {WHY_US.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
              <span className="w-11 h-11 bg-warm-white flex items-center justify-center">
                <Icon size={20} strokeWidth={1.5} className="text-terracotta" aria-hidden="true" />
              </span>
              <h3 className="font-display text-charcoal" style={{ fontSize: '20px' }}>{title}</h3>
              <p className="font-body text-charcoal-light max-w-xs" style={{ fontSize: '14px', lineHeight: '1.6' }}>{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="font-display italic text-charcoal mb-8" style={{ fontSize: 'clamp(28px, 5vw, 38px)' }}>
          Good to know
        </h2>
        <div className="border-t border-border">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group border-b border-border">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-5 font-body font-medium text-charcoal" style={{ fontSize: '15px' }}>
                {q}
                <ChevronDown size={18} strokeWidth={1.5} className="flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 font-body text-charcoal-light leading-relaxed" style={{ fontSize: '14px' }}>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
