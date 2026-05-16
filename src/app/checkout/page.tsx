'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import PayFastForm from '@/components/PayFastForm'

interface FormState {
  firstName: string
  lastName: string
  email: string
}

export default function CheckoutPage() {
  const { items, total } = useCart()
  const cartTotal = total()

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [payFastParams, setPayFastParams] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          Nothing to checkout
        </h1>
        <Link
          href="/"
          className="bg-terracotta text-warm-white px-8 py-3 rounded text-sm font-medium hover:bg-terracotta-dark transition-colors"
        >
          Shop now
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/payfast/params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          amount: cartTotal,
          itemName: items.map((i) => `${i.name} x${i.quantity}`).join(', '),
        }),
      })

      if (!res.ok) throw new Error('Could not build payment. Try again.')

      const data = await res.json()
      setPayFastParams(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-border rounded px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:border-terracotta transition-colors bg-warm-white'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-charcoal mb-8">
        Checkout
      </h1>

      {/* Order summary */}
      <div className="bg-warm-white rounded-lg border border-border p-5 mb-8">
        <h2 className="font-medium text-charcoal mb-3 text-sm uppercase tracking-wider">
          Order summary
        </h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-charcoal-light py-1">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>R{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold text-charcoal border-t border-border mt-3 pt-3">
          <span>Total</span>
          <span>R{cartTotal}</span>
        </div>
        <p className="text-xs text-charcoal-muted mt-2">
          Free delivery · 3-7 business days
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h2 className="font-medium text-charcoal text-sm uppercase tracking-wider">
          Your details
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm text-charcoal-light">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={inputClass}
              placeholder="Lerato"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="text-sm text-charcoal-light">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={inputClass}
              placeholder="Dlamini"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm text-charcoal-light">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
            placeholder="lerato@email.com"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terracotta text-warm-white py-4 px-8 rounded text-base font-medium tracking-wide hover:bg-terracotta-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Preparing payment…' : 'Complete my order'}
        </button>

        <p className="text-xs text-charcoal-muted text-center">
          You will be redirected to PayFast to complete your payment securely.
        </p>
      </form>

      {/* Auto-submit hidden PayFast form when params are ready */}
      {payFastParams && (
        <PayFastForm params={payFastParams} autoSubmit />
      )}
    </div>
  )
}
