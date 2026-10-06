import Link from 'next/link'
import type { Metadata } from 'next'
import ProductCard from '@/components/ProductCard'
import { categories, categorySlug, hoverPhoto, products } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Shop all finds | Ze Home Finds',
  description: 'Every viral find we stock, from pet care to beauty and home. Free delivery across South Africa.',
  alternates: { canonical: '/shop' },
}

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
]

interface Props {
  searchParams: Promise<{ category?: string; sort?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const { category, sort = 'featured' } = await searchParams
  const active = categories.find((c) => c.slug === category)

  const list = products.filter((p) => !active || categorySlug(p.category) === active.slug)
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)

  const href = (params: { category?: string; sort?: string }) => {
    const q = new URLSearchParams()
    if (params.category) q.set('category', params.category)
    if (params.sort && params.sort !== 'featured') q.set('sort', params.sort)
    const s = q.toString()
    return s ? `/shop?${s}` : '/shop'
  }

  const chip = (selected: boolean) =>
    `inline-flex items-center rounded-full border px-4 min-h-[38px] whitespace-nowrap transition-colors ${
      selected ? 'bg-charcoal border-charcoal text-white' : 'border-border text-charcoal hover:border-charcoal'
    }`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-display font-semibold text-charcoal tracking-tight lowercase" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
        {active ? active.name : 'Shop all'}
      </h1>

      {/* Filters */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 font-body" style={{ fontSize: '13px' }}>
        <Link href={href({ sort })} className={chip(!active)}>All</Link>
        {categories.map((c) => (
          <Link key={c.slug} href={href({ category: c.slug, sort })} className={chip(active?.slug === c.slug)}>
            {c.name}
          </Link>
        ))}
      </div>

      {/* Count + sort */}
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-body text-warm-gray border-b border-border pb-4" style={{ fontSize: '13px' }}>
        <span>{list.length} product{list.length !== 1 ? 's' : ''}</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="hidden sm:inline">Sort by:</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={href({ category: active?.slug, sort: s.value })}
              className={sort === s.value ? 'text-charcoal underline underline-offset-4' : 'hover:text-charcoal'}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {list.map((p) => (
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
  )
}
