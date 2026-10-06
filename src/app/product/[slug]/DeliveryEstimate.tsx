'use client'

import { useSyncExternalStore } from 'react'
import { Truck } from 'lucide-react'

const noopSubscribe = () => () => {}
const todayKey = () => new Date().toDateString()

const fmt = (d: Date) =>
  d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })

// "8-16 days" -> "Order today, arrives Tue 14 Oct – Wed 22 Oct". Computed in the
// browser so the dates are never stale from the static build.
export default function DeliveryEstimate({ deliveryDays }: { deliveryDays: string }) {
  const today = useSyncExternalStore(noopSubscribe, todayKey, () => null)
  const match = deliveryDays.match(/(\d+)\s*[-–]\s*(\d+)/)

  let text = `Free delivery — arrives in ${deliveryDays}`
  if (today && match) {
    const from = new Date(today)
    const to = new Date(today)
    from.setDate(from.getDate() + Number(match[1]))
    to.setDate(to.getDate() + Number(match[2]))
    text = `Order today, arrives ${fmt(from)} – ${fmt(to)}`
  }

  return (
    <div className="flex items-start gap-3 bg-cream px-4 py-3 font-body text-charcoal" style={{ fontSize: '13px' }}>
      <Truck size={18} strokeWidth={1.5} className="text-terracotta flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="font-medium">{text}</p>
        <p className="text-warm-gray">Free, tracked delivery anywhere in South Africa</p>
      </div>
    </div>
  )
}
