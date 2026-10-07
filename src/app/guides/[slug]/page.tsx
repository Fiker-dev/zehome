import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductCard from '@/components/ProductCard'
import { hoverPhoto, products } from '@/lib/catalog'
import { allGuides } from '@/lib/guides'
import { absoluteImageUrl } from '@/lib/images'
import { breadcrumbSchema, faqSchema, jsonLd } from '@/lib/schema'
import { SITE_NAME, SITE_URL } from '@/lib/site'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allGuides.map((g) => ({ slug: g.slug }))
}

export const dynamicParams = false

const productsIn = (ids: string[] = []) =>
  ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined)

const firstImage = (slug: string) => {
  const guide = allGuides.find((g) => g.slug === slug)
  const p = productsIn(guide?.sections.flatMap((s) => s.products ?? []))[0]
  return p ? absoluteImageUrl(p.images[0], SITE_URL) : `${SITE_URL}/images/og-home.jpg`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = allGuides.find((g) => g.slug === slug)
  if (!guide) return {}
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: guide.h1,
      description: guide.description,
      url: `${SITE_URL}/guides/${slug}`,
      type: 'article',
      locale: 'en_ZA',
      publishedTime: guide.published,
      images: [{ url: firstImage(slug) }],
    },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = allGuides.find((g) => g.slug === slug)
  if (!guide) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.published,
    image: [firstImage(slug)],
    mainEntityOfPage: `${SITE_URL}/guides/${slug}`,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
  const others = allGuides.filter((g) => g.slug !== slug)

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleSchema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: guide.h1, path: `/guides/${slug}` },
          ])
        )}
      />
      {guide.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(guide.faqs))} />}

      <nav className="mb-6 flex items-center gap-2 font-body text-warm-gray" style={{ fontSize: '12px' }}>
        <Link href="/" className="hover:text-charcoal transition-colors">Ze Home Finds</Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-charcoal transition-colors">Guides</Link>
      </nav>

      <h1 className="font-display font-semibold text-charcoal tracking-tight leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
        {guide.h1}
      </h1>
      <p className="mt-2 font-body text-warm-gray" style={{ fontSize: '12px' }}>
        Updated{' '}
        {new Date(guide.published).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <p className="mt-5 font-body text-charcoal-light leading-relaxed" style={{ fontSize: '16px' }}>{guide.intro}</p>

      {guide.sections.map((s) => {
        const featured = productsIn(s.products)
        return (
          <section key={s.h2} className="mt-10">
            <h2 className="font-display font-semibold text-charcoal tracking-tight" style={{ fontSize: '22px' }}>{s.h2}</h2>
            {s.body.map((para, i) => (
              <p key={i} className="mt-3 font-body text-charcoal-light leading-relaxed" style={{ fontSize: '15px' }}>{para}</p>
            ))}
            {featured.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 max-w-md">
                {featured.map((p) => (
                  <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.images[0]} hoverImage={hoverPhoto(p)} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {guide.faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display font-semibold text-charcoal tracking-tight lowercase mb-3" style={{ fontSize: '22px' }}>quick answers</h2>
          <dl className="border-t border-border">
            {guide.faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-border py-4">
                <dt className="font-body font-medium text-charcoal" style={{ fontSize: '15px' }}>{q}</dt>
                <dd className="mt-1 font-body text-charcoal-light leading-relaxed" style={{ fontSize: '14px' }}>{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <aside className="mt-12 bg-cream px-5 py-6">
        <p className="font-display font-semibold text-charcoal lowercase" style={{ fontSize: '18px' }}>more guides</p>
        <ul className="mt-3 flex flex-col gap-2 font-body" style={{ fontSize: '14px' }}>
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="text-charcoal underline underline-offset-4 hover:text-terracotta-dark">{g.h1}</Link>
            </li>
          ))}
          <li>
            <Link href="/shop" className="text-charcoal underline underline-offset-4 hover:text-terracotta-dark">shop all finds</Link>
          </li>
        </ul>
      </aside>
    </article>
  )
}
