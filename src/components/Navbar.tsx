'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const itemCount = useCart((state) => state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  ))
  const openCart = useCart((state) => state.openCart)

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo + tagline */}
          <Link href="/" className="flex flex-col items-start gap-0.5">
            <span
              className="font-display font-medium text-charcoal leading-none"
              style={{ fontSize: 'clamp(20px, 5vw, 28px)', letterSpacing: '0.02em' }}
            >
              Ze Home Finds
            </span>
            <span
              className="hidden sm:block font-body text-warm-gray uppercase tracking-[0.12em]"
              style={{ fontSize: '12px' }}
            >
              Mood lighting, delivered.
            </span>
          </Link>

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            className="relative p-2 text-charcoal hover:text-terracotta transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-terracotta text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
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
