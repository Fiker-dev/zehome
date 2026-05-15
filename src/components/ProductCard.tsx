'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

interface ProductCardProps {
  id: string
  slug: string
  name: string
  price: number
  image: string
  category?: string
  trustLine?: string
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  image,
  category = 'MOOD LIGHTING',
  trustLine,
}: ProductCardProps) {
  const { addItem } = useCart()

  function handleAddToCart() {
    addItem({ id, slug, name, price, image })
  }

  return (
    <div className="group bg-white flex flex-col border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      {/* Image — 4:5 portrait, full width, no padding */}
      <Link href={`/product/${slug}`} className="relative block overflow-hidden bg-cream" style={{ aspectRatio: '4/5' }}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex flex-col gap-1">
          {/* Category label */}
          <p
            className="font-body text-terracotta uppercase font-medium tracking-[0.1em]"
            style={{ fontSize: '10px' }}
          >
            {category}
          </p>
          {/* Product name */}
          <Link href={`/product/${slug}`}>
            <h3
              className="font-display text-charcoal hover:text-terracotta transition-colors leading-snug"
              style={{ fontSize: '16px' }}
            >
              {name}
            </h3>
          </Link>
          {/* Price */}
          <p className="font-body font-medium text-charcoal" style={{ fontSize: '15px' }}>
            R{price}
          </p>
        </div>

        {trustLine && (
          <p className="font-body text-warm-gray" style={{ fontSize: '11px' }}>
            {trustLine}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full bg-terracotta hover:bg-terracotta-dark text-white font-body font-medium uppercase tracking-[0.1em] transition-colors min-h-[48px] px-6"
          style={{ fontSize: '12px' }}
        >
          Get yours now
        </button>
      </div>
    </div>
  )
}
