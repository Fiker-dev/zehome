// Google Analytics 4 helpers. Nothing loads or fires until GA_ID is set in
// src/lib/site.ts AND the shopper accepts analytics cookies (POPIA).

export const CONSENT_KEY = 'zh-analytics-consent' // 'granted' | 'denied'

export interface GaItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

// Queues the event on dataLayer (gtag.js picks up queued events once it
// loads), but only for shoppers who accepted analytics cookies.
export function track(event: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(CONSENT_KEY) !== 'granted') return
  } catch {
    return
  }
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  // gtag expects an arguments object, not an array
  const gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  } as (...args: unknown[]) => void
  gtag('event', event, { currency: 'ZAR', ...params })
}

export function toGaItems(items: { id: string; name: string; price: number; quantity: number }[]): GaItem[] {
  return items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }))
}
