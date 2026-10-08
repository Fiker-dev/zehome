import products from '@/data/products.json'
import supplierCosts from '@/data/supplier-costs.json'

interface SupplierInfo {
  supplier: string | null
  supplierUrl: string | null
  cjVariant?: string
  supplierVariant?: string
  // Bundles: the separate supplier items that make up one of our products
  components?: { title: string; url: string; quantity: number }[]
}

const costs = supplierCosts as Record<string, SupplierInfo>

export interface OrderLine {
  id: string
  quantity: number
}

// One line per supplier with what to buy, e.g.
// "BUY → Perfect Dealz: 2× Pet Hair Remover (Pink) https://… | CJdropshipping: 1× …"
// Stored in the order sheet so fulfilling a paid order is copy-and-click.
export function supplierOrderNote(lines: OrderLine[]): string {
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
  return 'BUY → ' + [...bySupplier].map(([s, items]) => `${s}: ${items.join('; ')}`).join(' | ')
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
