import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductCard from '@/components/ProductCard'
import collections from '@/data/collections.json'
import { categories, categorySlug, hoverPhoto, products } from '@/lib/catalog'
import { absoluteImageUrl } from '@/lib/images'
import { breadcrumbSchema, itemListSchema, jsonLd } from '@/lib/schema'
import { SITE_URL } from '@/lib/site'

// Indexable category pages (/collections/beauty etc.), each with its own
// keyword-targeted title, H1 and intro. /shop?category= is only a filter view.

interface Props {
  params: Promise<{ slug: string }>
}

type CollectionCopy = { h1: string; title: string; description: string; intro: string }
const copy = collections as Record<string, CollectionCopy>

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}
  const c = copy[slug]
  const title = c?.title ?? `${category.name} | Ze Home Finds`
  const description = c?.description ?? `Shop ${category.name.toLowerCase()} with free delivery across South Africa.`
  return {
    title,
    description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/collections/${slug}`,
      type: 'website',
      locale: 'en_ZA',
      images: [{ url: absoluteImageUrl(category.image, SITE_URL), width: 900, height: 900, alt: category.name }],
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()
  const c = copy[slug]
  const list = products.filter((p) => categorySlug(p.category) === slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(itemListSchema(list))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: category.name, path: `/collections/${slug}` },
          ])
        )}
      />

      <nav className="mb-6 flex items-center gap-2 font-body text-warm-gray" style={{ fontSize: '12px' }}>
        <Link href="/" className="hover:text-charcoal transition-colors">Ze Home Finds</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-charcoal">{category.name}</span>
      </nav>

      <h1 className="font-display font-semibold text-charcoal tracking-tight lowercase" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
        {c?.h1 ?? category.name}
      </h1>
      {c?.intro && (
        <p className="mt-3 max-w-2xl font-body text-charcoal-light" style={{ fontSize: '15px' }}>
          {c.intro}
        </p>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 font-body" style={{ fontSize: '13px' }}>
        <Link href="/shop" className="inline-flex items-center rounded-full border border-border px-4 min-h-[38px] whitespace-nowrap text-charcoal hover:border-charcoal">
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/collections/${cat.slug}`}
            className={`inline-flex items-center rounded-full border px-4 min-h-[38px] whitespace-nowrap transition-colors ${
              cat.slug === slug ? 'bg-charcoal border-charcoal text-white' : 'border-border text-charcoal hover:border-charcoal'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <p className="mt-4 mb-6 font-body text-warm-gray border-b border-border pb-4" style={{ fontSize: '13px' }}>
        {list.length} product{list.length !== 1 ? 's' : ''} · Free delivery across South Africa · 3–7 business days
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {list.map((p) => (
          <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.images[0]} hoverImage={hoverPhoto(p)} />
        ))}
      </div>
    </div>
  )
}
