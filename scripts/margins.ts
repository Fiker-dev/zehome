// Margin check for every product on the site.
//
//   npm run margins                      report all products
//   npm run margins -- <cost> <delivery> suggest a price for a new product
//
// Exits non-zero when a product with known costs is priced below the rules,
// or when any product is missing its supplier costs.

import { readFileSync } from 'node:fs'
import { PRICING_RULES, orderMargin, suggestPrice, type MarginBreakdown } from '../src/lib/pricing.ts'

interface SupplierCost {
  supplier: string | null
  supplierUrl: string | null
  costPrice: number | null
  deliveryCost: number | null
}

const readJson = (path: string) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))

const fmt = (m: MarginBreakdown) =>
  `price R${m.price} − PayFast R${m.payfastFee.toFixed(2)} − supplier R${m.supplierCost} − delivery R${m.deliveryCost}` +
  ` = profit R${m.profit.toFixed(2)} (${(m.marginPct * 100).toFixed(1)}%)`

const rulesLine = `Rules: ≥ R${PRICING_RULES.minProfit} profit and ≥ ${PRICING_RULES.minMarginPct * 100}% margin per order, PayFast ${PRICING_RULES.method} fees incl. VAT`

const [costArg, deliveryArg] = process.argv.slice(2)

if (costArg) {
  const costs = { supplierCost: Number(costArg), deliveryCost: Number(deliveryArg ?? 0) }
  if (!Number.isFinite(costs.supplierCost) || !Number.isFinite(costs.deliveryCost)) {
    console.error('Usage: npm run margins -- <supplier cost> <delivery cost>')
    process.exit(2)
  }
  console.log(rulesLine)
  console.log(`Suggested: ${fmt(suggestPrice(costs))}`)
  process.exit(0)
}

const products: { id: string; name: string; price: number; hidden?: boolean }[] = readJson('../src/data/products.json')
const costs: Record<string, SupplierCost> = readJson('../src/data/supplier-costs.json')

console.log(rulesLine + '\n')
let problems = 0

for (const p of products) {
  if (p.hidden) {
    console.log(`-- ${p.name}: hidden test product (R${p.price}), not checked`)
    continue
  }
  const c = costs[p.id]
  if (c?.costPrice == null || c.deliveryCost == null) {
    console.log(`?  ${p.name}: supplier cost unknown — add it to src/data/supplier-costs.json`)
    problems++
    continue
  }
  const supplierCosts = { supplierCost: c.costPrice, deliveryCost: c.deliveryCost }
  const m = orderMargin(p.price, supplierCosts)
  if (m.passes) {
    console.log(`OK ${p.name}: ${fmt(m)}`)
  } else {
    console.log(`!! ${p.name}: ${fmt(m)}`)
    console.log(`   → raise to R${suggestPrice(supplierCosts).price} or drop the product`)
    problems++
  }
}

process.exit(problems ? 1 : 0)
