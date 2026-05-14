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
  trustLine?: string
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  image,
  trustLine,
}: ProductCardProps) {
  const { addItem } = useCart()

  function handleAddToCart() {
    addItem({ id, slug, name, price, image })
  }

  return (
    <div className="group bg-warm-white rounded-lg overflow-hidden border border-border flex flex-col">
      <Link href={`/product/${slug}`} className="relative aspect-square block overflow-hidden bg-cream">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <Link href={`/product/${slug}`}>
            <h3 className="font-display text-lg font-semibold text-charcoal hover:text-terracotta transition-colors">
              {name}
            </h3>
          </Link>
          <p className="text-charcoal-light font-medium mt-1">R{price}</p>
        </div>

        {trustLine && (
          <p className="text-xs text-charcoal-muted">{trustLine}</p>
        )}

        <button
          onClick={handleAddToCart}
          className="mt-auto w-full bg-terracotta text-warm-white py-3 px-6 rounded text-sm font-medium tracking-wide hover:bg-terracotta-dark transition-colors"
        >
          Get yours now
        </button>
      </div>
    </div>
  )
}
