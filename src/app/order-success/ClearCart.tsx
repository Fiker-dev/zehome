'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart'
import { toGaItems, track } from '@/lib/analytics'

// Runs once PayFast returns the shopper: records the purchase in Google
// Analytics (if they accepted analytics cookies) and empties the cart.
export default function ClearCart({ orderId }: { orderId?: string }) {
  const clearCart = useCart((state) => state.clearCart)
  useEffect(() => {
    const items = useCart.getState().items
    if (orderId && items.length) {
      track('purchase', {
        transaction_id: orderId,
        value: items.reduce((s, i) => s + i.price * i.quantity, 0),
        shipping: 0,
        items: toGaItems(items),
      })
    }
    clearCart()
  }, [clearCart, orderId])
  return null
}
