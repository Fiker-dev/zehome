'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { categories } from '@/lib/catalog'
import CartDrawer from './CartDrawer'

const NAV = [
  { label: 'Shop all', href: '/shop' },
  ...categories.map((c) => ({ label: c.name, href: `/collections/${c.slug}` })),
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const openCart = useCart((state) => state.openCart)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] lg:grid-cols-[auto_1fr_auto] items-center gap-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden -ml-2 p-2 text-charcoal min-h-[44px] min-w-[44px] flex items-center"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <Link href="/" className="justify-self-center lg:justify-self-start font-display font-semibold text-charcoal tracking-tight lowercase" style={{ fontSize: '24px' }}>
            ze home finds
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 font-body text-charcoal-light lowercase" style={{ fontSize: '14px' }}>
            {NAV.map(({ label, href }) => (
              <Link key={href} href={href} className="hover:text-charcoal hover:underline underline-offset-4 transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={openCart}
            aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            className="justify-self-end relative -mr-2 p-2 text-charcoal min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-0.5 bg-charcoal text-white text-[10px] font-medium rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <nav className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border">
              <span className="font-display font-semibold text-charcoal" style={{ fontSize: '18px' }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto">
              {[{ label: 'Home', href: '/' }, ...NAV, { label: 'Delivery', href: '/delivery' }, { label: 'Returns', href: '/returns' }].map(({ label, href }) => (
                <li key={href} className="border-b border-border">
                  <Link href={href} onClick={() => setMenuOpen(false)} className="block px-5 py-4 font-body text-charcoal" style={{ fontSize: '16px' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <CartDrawer />
    </>
  )
}
