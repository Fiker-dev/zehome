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

// Recover order lines from PayFast's item_name ("Name x2, Other name x1").
// Used on the paid notification, which doesn't carry our structured cart.
export function linesFromItemName(itemName: string): OrderLine[] {
  const lines: OrderLine[] = []
  for (const product of products) {
    const match = itemName.match(new RegExp(`${product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} x(\\d+)`))
    if (match) lines.push({ id: product.id, quantity: Number(match[1]) })
  }
  return lines
}
