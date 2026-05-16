'use client'

import { useCart } from '@/lib/cart'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <button
      onClick={() =>
        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0],
        })
      }
      className="w-full bg-charcoal hover:bg-terracotta text-white font-body font-medium uppercase tracking-[0.14em] transition-colors duration-300 min-h-[52px] px-8"
      style={{ fontSize: '12px' }}
    >
      Get yours now — R{product.price}
    </button>
  )
}
