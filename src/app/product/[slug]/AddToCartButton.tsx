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
      className="w-full bg-terracotta text-warm-white py-4 px-8 rounded text-base font-medium tracking-wide hover:bg-terracotta-dark transition-colors"
    >
      Get yours now — R{product.price}
    </button>
  )
}
