'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const cartTotal = total()

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          Your cart is empty
        </h1>
        <p className="text-charcoal-muted">
          You have not added anything yet.
        </p>
        <Link
          href="/"
          className="bg-terracotta text-warm-white px-8 py-3 rounded text-sm font-medium hover:bg-terracotta-dark transition-colors"
        >
          Shop now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-charcoal mb-10">
        Your Cart
      </h1>

      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-5 bg-warm-white rounded-lg p-4 border border-border"
          >
            <div className="relative w-24 h-24 rounded overflow-hidden bg-cream flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>

            <div className="flex flex-col flex-1 gap-1">
              <p className="font-medium text-charcoal">{item.name}</p>
              <p className="text-sm text-charcoal-light">R{item.price} each</p>

              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease"
                  className="w-7 h-7 border border-border rounded flex items-center justify-center hover:border-terracotta transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase"
                  className="w-7 h-7 border border-border rounded flex items-center justify-center hover:border-terracotta transition-colors"
                >
                  <Plus size={13} />
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove"
                  className="ml-auto text-charcoal-muted hover:text-terracotta transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="text-right text-charcoal font-medium hidden sm:block">
              R{item.price * item.quantity}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="flex flex-col gap-4 bg-warm-white rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between text-charcoal font-semibold text-lg">
            <span>Total</span>
            <span>R{cartTotal}</span>
          </div>
          <p className="text-xs text-charcoal-muted">
            Free delivery across South Africa · 3-5 business days
          </p>
          <Link
            href="/checkout"
            className="w-full bg-terracotta text-warm-white py-4 px-8 rounded text-base font-medium tracking-wide text-center hover:bg-terracotta-dark transition-colors"
          >
            Checkout — R{cartTotal}
          </Link>
          <Link
            href="/"
            className="text-center text-sm text-terracotta underline underline-offset-2"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
