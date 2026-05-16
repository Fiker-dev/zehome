'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart()
  const cartTotal = total()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 z-50"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-warm-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-charcoal">
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 -mr-1 text-charcoal-muted hover:text-charcoal transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-charcoal-muted">
              <p className="text-center">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="text-terracotta text-sm underline underline-offset-2"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden bg-cream flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 gap-1">
                    <p className="font-medium text-charcoal text-sm leading-snug">
                      {item.name}
                    </p>
                    <p className="text-sm text-charcoal-light">
                      R{item.price}
                    </p>

                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-9 h-9 border border-border rounded flex items-center justify-center text-charcoal hover:border-terracotta transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-9 h-9 border border-border rounded flex items-center justify-center text-charcoal hover:border-terracotta transition-colors"
                      >
                        <Plus size={14} />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="ml-auto text-charcoal-muted hover:text-terracotta transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-border flex flex-col gap-4">
            <div className="flex items-center justify-between text-charcoal font-medium">
              <span>Total</span>
              <span>R{cartTotal}</span>
            </div>
            <p className="text-xs text-charcoal-muted">
              Free delivery across South Africa · 3-7 business days
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-charcoal hover:bg-terracotta text-white py-4 px-6 text-xs font-medium tracking-[0.14em] uppercase text-center transition-colors duration-300"
            >
              Checkout — R{cartTotal}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
