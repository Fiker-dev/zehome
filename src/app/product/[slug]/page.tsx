import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import products from '@/data/products.json'
import AddToCartButton from './AddToCartButton'

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-warm-white">
            <Image
              src={product.images[0]}
              alt={product.seo.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded overflow-hidden bg-warm-white border border-border"
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-charcoal leading-snug">
              {product.seo.h1}
            </h1>
            <p className="text-2xl text-charcoal-light font-medium mt-3">
              R{product.price}
            </p>
          </div>

          <p className="text-charcoal-light leading-relaxed">
            {product.description}
          </p>

          <ul className="flex flex-col gap-2">
            {product.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal-light">
                <span className="text-terracotta mt-0.5">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <AddToCartButton product={product} />

          <p className="text-xs text-charcoal-muted">{product.trustLine}</p>
        </div>
      </div>
    </div>
  )
}
