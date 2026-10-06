'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
}

// Mobile-only bar that appears once the main add-to-cart button (#main-atc)
// has scrolled out of view.
export default function StickyAddToCart({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const target = document.getElementById('main-atc')
    if (!target) return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-warm-white border-t border-border px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!visible}
    >
      <div className="flex-1 min-w-0">
        <p className="font-body text-charcoal truncate" style={{ fontSize: '13px' }}>{product.name}</p>
        <p className="font-body font-medium text-charcoal" style={{ fontSize: '15px' }}>R{product.price}</p>
      </div>
      <button
        tabIndex={visible ? 0 : -1}
        onClick={() =>
          addItem({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images[0] })
        }
        className="rounded-full bg-charcoal hover:bg-terracotta text-white font-body font-medium uppercase tracking-[0.12em] transition-colors px-5 min-h-[46px]"
        style={{ fontSize: '11px' }}
      >
        Add to cart
      </button>
    </div>
  )
}
