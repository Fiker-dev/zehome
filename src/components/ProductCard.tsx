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
  hoverImage?: string
  category?: string
  trustLine?: string
  badge?: string
}

// Dawn-style product card: square image (second image on hover), title,
// price, and a quick add button.
export default function ProductCard({ id, slug, name, price, image, hoverImage, badge }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className="group flex flex-col gap-3">
      <Link href={`/product/${slug}`} className="relative block overflow-hidden bg-cream aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-opacity duration-500 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
        {badge && (
          <span className="absolute top-2 left-2 bg-charcoal text-white font-body px-2 py-0.5 rounded-full" style={{ fontSize: '11px' }}>
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-1">
        <Link href={`/product/${slug}`} className="font-body text-charcoal hover:underline underline-offset-4 leading-snug" style={{ fontSize: '14px' }}>
          {name}
        </Link>
        <p className="font-body text-charcoal" style={{ fontSize: '15px' }}>R{price}</p>
        <p className="font-body text-warm-gray" style={{ fontSize: '12px' }}>Free delivery</p>
      </div>

      <button
        onClick={() => addItem({ id, slug, name, price, image })}
        className="mt-auto w-full rounded-full border border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-body font-medium transition-colors min-h-[42px] px-3"
        style={{ fontSize: '13px' }}
      >
        Add to cart
      </button>
    </div>
  )
}
