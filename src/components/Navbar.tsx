'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { count, openCart } = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const itemCount = mounted ? count() : 0

  return (
    <>
      <header className="sticky top-0 z-40 bg-warm-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-semibold text-charcoal tracking-wide"
          >
            Ze Home Finds
          </Link>

          <button
            onClick={openCart}
            aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            className="relative p-2 text-charcoal hover:text-terracotta transition-colors"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-warm-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <CartDrawer />
    </>
  )
}
