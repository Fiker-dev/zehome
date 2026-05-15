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
      className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-body font-medium uppercase tracking-[0.1em] transition-colors min-h-[52px] px-8"
      style={{ fontSize: '13px' }}
    >
      Get yours now — R{product.price}
    </button>
  )
}
