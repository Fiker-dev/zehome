import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Sparkles, Truck, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import ProductCard from '@/components/ProductCard'
import { categories, hoverPhoto, products } from '@/lib/catalog'

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
  { q: 'How long does delivery take?', a: 'Orders ship from local stock in Johannesburg and arrive in 3–7 business days. Each product page shows an estimated arrival date before you buy. Delivery is free and tracked, and we email your tracking number when your order ships.' },
  { q: 'How do I pay?', a: 'Checkout runs through PayFast, South Africa’s trusted payment gateway. You can pay by card, Instant EFT and other PayFast methods. We never see your card details.' },
  { q: 'Can I return something?', a: 'Yes. Return any unused item in its original packaging within 14 days. If something arrives damaged or faulty, WhatsApp us and we will sort it out.' },
  { q: 'How do I track my order?', a: 'You get a tracking number by email once your order is dispatched. You can also WhatsApp us on +27 71 027 8563 with your order reference.' },
]

const sectionTitle = 'font-display font-semibold text-charcoal tracking-tight lowercase'

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="flex flex-col gap-5 items-center md:items-start text-center md:text-left">
            <p className="font-body text-warm-gray uppercase font-medium tracking-[0.18em]" style={{ fontSize: '12px' }}>
              Viral finds, delivered
            </p>
            <h1 className={`${sectionTitle} leading-[1.05]`} style={{ fontSize: 'clamp(38px, 6.5vw, 58px)' }}>
              The finds everyone’s talking about
            </h1>
            <p className="font-body text-charcoal-light max-w-md" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Hand-picked from what’s trending on TikTok right now, with free delivery to your door across South Africa.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-charcoal hover:bg-terracotta-dark text-white font-body font-medium transition-colors w-full sm:w-auto px-10 min-h-[50px] rounded-full"
              style={{ fontSize: '15px' }}
            >
              Shop all finds
            </Link>
          </div>

          <div className="grid grid-cols-5 grid-rows-2 gap-3 aspect-[5/4]">
            {heroProducts.map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className={`group relative overflow-hidden bg-cream ${i === 0 ? 'col-span-3 row-span-2' : 'col-span-2'}`}
              >
                <Image
                  src={p.images[0]}
                  alt={p.seo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={i === 0 ? '(min-width: 768px) 360px, 60vw' : '(min-width: 768px) 240px, 40vw'}
                  priority
                />
                <span className="absolute left-2 bottom-2 bg-white text-charcoal font-body font-medium px-2.5 py-1 rounded-full" style={{ fontSize: '12px' }}>
                  R{p.price}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <h2 className={sectionTitle} style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>Shop by category</h2>
        <div className="mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group flex-shrink-0 w-[42%] sm:w-auto flex flex-col gap-2">
              <span className="relative block aspect-square overflow-hidden bg-cream">
                <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 42vw, 16vw" />
              </span>
              <span className="font-body text-charcoal group-hover:underline underline-offset-4" style={{ fontSize: '14px' }}>
                {c.name} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRENDING NOW ── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className={sectionTitle} style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>Trending now</h2>
          <Link href="/shop" className="font-body text-charcoal underline underline-offset-4 whitespace-nowrap" style={{ fontSize: '14px' }}>
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {products.map((p) => (
            <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.images[0]} hoverImage={hoverPhoto(p)} />
          ))}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="bg-cream">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
          {WHY_US.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col items-center text-center gap-3">
              <Icon size={28} strokeWidth={1.25} className="text-charcoal" aria-hidden="true" />
              <h3 className="font-display font-semibold text-charcoal" style={{ fontSize: '17px' }}>{title}</h3>
              <p className="font-body text-charcoal-light max-w-xs" style={{ fontSize: '14px', lineHeight: '1.6' }}>{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className={`${sectionTitle} text-center mb-8`} style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>
          Frequently asked questions
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
