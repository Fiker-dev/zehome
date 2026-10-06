import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import products from '@/data/products.json'
import AddToCartButton from './AddToCartButton'
import ImageGallery from './ImageGallery'
import DeliveryEstimate from './DeliveryEstimate'
import StickyAddToCart from './StickyAddToCart'
import { ChevronDown, ShieldCheck, RotateCcw, Truck } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { categorySlug, hoverPhoto } from '@/lib/catalog'
import { absoluteImageUrl } from '@/lib/images'
import { breadcrumbSchema, faqSchema, jsonLd, productSchema } from '@/lib/schema'
import { SITE_URL } from '@/lib/site'

const TRUST_BADGES = [
  { icon: Truck, label: 'Free tracked delivery' },
  { icon: ShieldCheck, label: 'Secure PayFast checkout' },
  { icon: RotateCcw, label: '14-day returns' },
]

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) return {}

  const storeUrl = SITE_URL

  return {
    title: product.seo.title,
    description: product.seo.description,
    keywords: product.keywords,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.seo.ogTitle,
      description: product.seo.description,
      url: `${storeUrl}/product/${product.slug}`,
      type: 'website',
      locale: 'en_ZA',
      images: [
        {
          url: absoluteImageUrl(product.images[0], storeUrl),
          width: 900,
          height: 900,
          alt: product.seo.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo.ogTitle,
      description: product.seo.description,
      images: [absoluteImageUrl(product.images[0], storeUrl)],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) notFound()

  // Same category first, then the rest, so related links stay on-topic
  const related = [
    ...products.filter((p) => p.slug !== product.slug && p.category === product.category),
    ...products.filter((p) => p.slug !== product.slug && p.category !== product.category),
  ].slice(0, 4)

  const collection = { name: product.category, path: `/collections/${categorySlug(product.category)}` }
  const faqs = product.faqs ?? []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productSchema(product))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            collection,
            { name: product.name, path: `/product/${product.slug}` },
          ])
        )}
      />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(faqs))} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 font-body text-warm-gray" style={{ fontSize: '12px' }}>
          <Link href="/" className="hover:text-charcoal transition-colors">
            Ze Home Finds
          </Link>
          <span>/</span>
          <Link href={collection.path} className="hover:text-charcoal transition-colors">
            {collection.name}
          </Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Image gallery */}
          <ImageGallery images={product.images} alt={product.seo.alt} />

          {/* Detail */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
                {product.category}
              </p>
              <h1 className="font-display font-semibold text-charcoal tracking-tight leading-snug" style={{ fontSize: '30px' }}>
                {product.seo.h1}
              </h1>
              <div className="flex items-baseline gap-3">
                <p className="font-body font-medium text-charcoal" style={{ fontSize: '24px' }}>
                  R{product.price}
                </p>
                <p className="font-body text-terracotta font-medium" style={{ fontSize: '13px' }}>
                  Free delivery
                </p>
              </div>
              <p className="font-body text-charcoal-light" style={{ fontSize: '14px' }}>
                {product.trustLine}
              </p>
            </div>

            <ul className="flex flex-col gap-2">
              {product.bullets.slice(0, -1).map((b, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-charcoal-light" style={{ fontSize: '14px' }}>
                  <span className="text-terracotta mt-0.5 flex-shrink-0">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div id="main-atc">
              <AddToCartButton product={product} />
            </div>

            <ul className="grid grid-cols-3 gap-2 text-center font-body text-charcoal-light" style={{ fontSize: '11px' }}>
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-1.5 border border-border px-2 py-3">
                  <Icon size={18} strokeWidth={1.5} className="text-terracotta" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            <DeliveryEstimate deliveryDays={product.deliveryDays} />

            <div className="border-t border-border">
              {[
                { title: 'Product details', body: product.description, open: true },
                {
                  title: 'Delivery',
                  body: `Free, tracked delivery anywhere in South Africa. This find arrives in ${product.deliveryDays} from the day you order. We email your tracking number as soon as it ships.`,
                },
                {
                  title: 'Returns',
                  body: 'Changed your mind? Return it unused in its original packaging within 14 days. Arrived damaged or faulty? WhatsApp us and we will make it right.',
                  link: { href: '/returns', label: 'Read the returns policy' },
                },
                {
                  title: 'Secure payment',
                  body: 'Checkout is handled by PayFast, South Africa’s trusted payment gateway. Pay by card, Instant EFT and more. We never see your card details.',
                },
              ].map(({ title, body, open, link }) => (
                <details key={title} open={open} className="group border-b border-border">
                  <summary className="flex items-center justify-between cursor-pointer list-none py-4 font-body font-medium text-charcoal" style={{ fontSize: '14px' }}>
                    {title}
                    <ChevronDown size={16} strokeWidth={1.5} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="pb-4 font-body text-charcoal-light leading-relaxed" style={{ fontSize: '14px' }}>
                    <p>{body}</p>
                    {link && (
                      <Link href={link.href} className="inline-block mt-2 text-terracotta underline underline-offset-4">
                        {link.label}
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StickyAddToCart product={product} />

      {faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
          <h2 className="font-display font-semibold text-charcoal tracking-tight lowercase mb-4" style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>
            {product.name} — your questions
          </h2>
          <div className="border-t border-border">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group border-b border-border">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-4 font-body font-medium text-charcoal" style={{ fontSize: '15px' }}>
                  {q}
                  <ChevronDown size={16} strokeWidth={1.5} className="flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="pb-4 font-body text-charcoal-light leading-relaxed" style={{ fontSize: '14px' }}>{a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* You might also like */}
      <section className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display font-semibold text-charcoal tracking-tight lowercase mb-6" style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>
            You might also like
          </h2>
          <p className="-mt-3 mb-6 font-body text-warm-gray" style={{ fontSize: '13px' }}>
            More in{' '}
            <Link href={collection.path} className="underline underline-offset-4 hover:text-charcoal">
              {collection.name.toLowerCase()}
            </Link>{' '}
            or{' '}
            <Link href="/shop" className="underline underline-offset-4 hover:text-charcoal">
              shop all finds
            </Link>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                image={p.images[0]}
                hoverImage={hoverPhoto(p)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
