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
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  image,
  category = 'MOOD LIGHTING',
}: ProductCardProps) {
  const { addItem } = useCart()

  function handleAddToCart() {
    addItem({ id, slug, name, price, image })
  }

  return (
    <div className="group bg-warm-white rounded-lg overflow-hidden border border-border flex flex-col">
      <Link href={`/product/${slug}`} className="relative aspect-[4/5] block overflow-hidden bg-cream">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta font-medium mb-1.5">
            {category}
          </p>
          <Link href={`/product/${slug}`}>
            <h3 className="font-display text-lg font-semibold text-charcoal hover:text-terracotta transition-colors leading-snug line-clamp-1">
              {name}
            </h3>
          </Link>
          <p className="text-charcoal-light font-medium mt-1">R{price}</p>
        </div>

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
