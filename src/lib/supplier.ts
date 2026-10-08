import products from '@/data/products.json'
import supplierCosts from '@/data/supplier-costs.json'

interface SupplierInfo {
  supplier: string | null
  supplierUrl: string | null
  cjVariant?: string
  supplierVariant?: string
  variantId?: number // supplier's Shopify variant, for one-click cart links
  // Bundles: the separate supplier items that make up one of our products
  components?: { title: string; url: string; quantity: number; variantId?: number }[]
}

// Suppliers on Shopify: a cart permalink opens their checkout with our items
// in the cart (and, where Shopify allows, the customer's delivery address).
const SHOPIFY_STORES: Record<string, string> = {
  'Perfect Dealz': 'https://perfectdealz.co.za',
}

export interface ShipTo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

const costs = supplierCosts as Record<string, SupplierInfo>

export interface OrderLine {
  id: string
  quantity: number
}

// One link per Shopify supplier that opens checkout with every item for this
// order already in the cart: https://store/cart/<variant>:<qty>,…?checkout[…]
export function supplierCartLinks(lines: OrderLine[], shipTo?: ShipTo): { supplier: string; url: string }[] {
  const bySupplier = new Map<string, Map<number, number>>()
  const incomplete = new Set<string>()
  for (const { id, quantity } of lines) {
    const info = costs[id]
    const supplier = info?.supplier ?? ''
    if (!SHOPIFY_STORES[supplier]) continue
    const parts = info.components?.length
      ? info.components.map((c) => ({ variantId: c.variantId, qty: quantity * c.quantity }))
      : [{ variantId: info.variantId, qty: quantity }]
    const cart = bySupplier.get(supplier) ?? new Map<number, number>()
    for (const { variantId, qty } of parts) {
      if (!variantId) incomplete.add(supplier)
      else cart.set(variantId, (cart.get(variantId) ?? 0) + qty)
    }
    bySupplier.set(supplier, cart)
  }
  return [...bySupplier]
    .filter(([supplier, cart]) => cart.size > 0 && !incomplete.has(supplier))
    .map(([supplier, cart]) => {
      const items = [...cart].map(([variant, qty]) => `${variant}:${qty}`).join(',')
      const q = new URLSearchParams()
      if (shipTo) {
        q.set('checkout[email]', shipTo.email)
        q.set('checkout[shipping_address][first_name]', shipTo.firstName)
        q.set('checkout[shipping_address][last_name]', shipTo.lastName)
        q.set('checkout[shipping_address][address1]', shipTo.address)
        q.set('checkout[shipping_address][city]', shipTo.city)
        q.set('checkout[shipping_address][province]', shipTo.province)
        q.set('checkout[shipping_address][zip]', shipTo.postalCode)
        q.set('checkout[shipping_address][country]', 'South Africa')
        q.set('checkout[shipping_address][phone]', shipTo.phone)
      }
      const query = q.toString()
      return { supplier, url: `${SHOPIFY_STORES[supplier]}/cart/${items}${query ? `?${query}` : ''}` }
    })
}

// One line per supplier with what to buy, e.g.
// "BUY → Perfect Dealz: 2× Pet Hair Remover (Pink) https://… | CJdropshipping: 1× …"
// followed by a one-click cart link per Shopify supplier. Stored in the order
// sheet and emailed, so fulfilling a paid order is click, check, pay.
export function supplierOrderNote(lines: OrderLine[], shipTo?: ShipTo): string {
  const bySupplier = new Map<string, string[]>()
  for (const { id, quantity } of lines) {
    const product = products.find((p) => p.id === id)
    const info = costs[id]
    const supplier = info?.supplier ?? 'Unknown supplier'
    const variant = info?.supplierVariant ?? info?.cjVariant
    const items = info?.components?.length
      ? info.components.map((c) => `${quantity * c.quantity}× ${c.title} ${c.url} [for ${product?.name ?? id}]`)
      : [`${quantity}× ${product?.name ?? id}${variant ? ` (${variant})` : ''} ${info?.supplierUrl ?? ''}`.trim()]
    bySupplier.set(supplier, [...(bySupplier.get(supplier) ?? []), ...items])
  }
  const carts = supplierCartLinks(lines, shipTo).map((c) => `1-CLICK CART → ${c.supplier}: ${c.url}`)
  return ['BUY → ' + [...bySupplier].map(([s, items]) => `${s}: ${items.join('; ')}`).join(' | '), ...carts].join(' | ')
}

// Compact cart sent to PayFast as item_description ("id*qty,id*qty") and
// signed into the order ID, so the paid notification says exactly what to buy.
export function cartCode(lines: OrderLine[]): string {
  return lines.map((l) => `${l.id}*${l.quantity}`).join(',')
}

export function linesFromCartCode(code: string): OrderLine[] {
  return code
    .split(',')
    .map((part) => /^([a-z0-9-]+)\*(\d{1,2})$/.exec(part.trim()))
    .filter((m): m is RegExpExecArray => m !== null && products.some((p) => p.id === m[1]))
    .map((m) => ({ id: m[1], quantity: Number(m[2]) }))
}
