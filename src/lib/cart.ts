'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import products from '@/data/products.json'
import { track } from '@/lib/analytics'

export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        track('add_to_cart', { value: item.price, items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: 1 }] })
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          }))
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
            isOpen: true,
          }))
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'ze-home-cart-v2',
      partialize: (state) => ({ items: state.items }),
      // A saved cart can outlive the catalogue: drop items we no longer sell
      // (checkout would reject them) and refresh name, price and image.
      merge: (persisted, current) => ({
        ...current,
        items: syncWithCatalogue((persisted as Partial<CartStore>)?.items),
      }),
    }
  )
)

function syncWithCatalogue(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return []
  return items.flatMap((item: Partial<CartItem>) => {
    const product = products.find((p) => p.id === item?.id && p.inStock)
    const quantity = Math.min(10, Math.max(1, Math.floor(Number(item?.quantity)) || 1))
    if (!product) return []
    return [{
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
    }]
  })
}
