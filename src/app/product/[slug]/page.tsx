import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import products from '@/data/products.json'
import AddToCartButton from './AddToCartButton'
import ImageGallery from './ImageGallery'
import ProductCard from '@/components/ProductCard'

interface Props {
  params: Promise<{ slug: string }>
}

const CATEGORIES: Record<string, string> = {
  'neon-flex-light-strip-3m':           'NEON STRIP',
  'led-neon-rope-light-10m':            'NEON ROPE',
  'stretchable-atmosphere-sunset-lamp': 'SUNSET LAMP',
  'star-projector-galaxy-night-light': 'STAR PROJECTOR',
  '3d-solar-projection-lamp':          'PROJECTION LAMP',
  'crystal-touch-lamp':                'TOUCH LAMP',
  '3d-moon-light-lamp-20cm':           'MOON LAMP',
  '3d-moon-lamp-humidifier':           'MOON LAMP',
}

const BADGES: Record<string, string> = {
  'stretchable-atmosphere-sunset-lamp': 'As seen on TikTok',
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) return {}

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'

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
      images: [
        {
          url: `${storeUrl}${product.images[0]}`,
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
      images: [`${storeUrl}${product.images[0]}`],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) notFound()

  const related = products
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3)

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `${storeUrl}${img}`),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'ZAR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Ze Home Finds' },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 font-body text-warm-gray" style={{ fontSize: '12px' }}>
          <Link href="/" className="hover:text-charcoal transition-colors">
            Ze Home Finds
          </Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-charcoal transition-colors">
            Mood Lighting
          </Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image gallery */}
          <ImageGallery images={product.images} alt={product.seo.alt} />

          {/* Detail */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
                {CATEGORIES[product.slug] ?? 'MOOD LIGHTING'}
              </p>
              <h1 className="font-display text-charcoal leading-snug" style={{ fontSize: '32px' }}>
                {product.seo.h1}
              </h1>
              <p className="font-body font-medium text-charcoal" style={{ fontSize: '24px' }}>
                R{product.price}
              </p>
            </div>

            <p className="font-body text-charcoal-light leading-relaxed" style={{ fontSize: '15px' }}>
              {product.description}
            </p>

            <ul className="flex flex-col gap-2">
              {product.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-charcoal-light" style={{ fontSize: '14px' }}>
                  <span className="text-terracotta mt-0.5 flex-shrink-0">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <AddToCartButton product={product} />

            <p className="font-body text-warm-gray" style={{ fontSize: '12px' }}>
              {product.trustLine}
            </p>
          </div>
        </div>
      </div>

      {/* You might also like */}
      <section className="bg-cream border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10 flex flex-col gap-2">
            <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em]" style={{ fontSize: '11px' }}>
              More from the collection
            </p>
            <h2 className="font-display text-charcoal" style={{ fontSize: '28px' }}>
              You might also like
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((p) => (
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
        </div>
      </section>
    </>
  )
}
