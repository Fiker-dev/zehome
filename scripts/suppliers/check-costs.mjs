// Compares src/data/supplier-costs.json with the freshly mirrored Perfect Dealz
// catalogue. Exits 1 (failing the weekly Action, which emails the owner) when a
// product we sell changed price or went out of stock, so prices and margins
// are fixed before a customer orders something we can't buy at our cost.
//
//   node scripts/suppliers/check-costs.mjs

import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'))
const catalogue = new Map(read('data/suppliers/perfectdealz-catalog.json').products.map((p) => [p.url, p]))
const costs = read('src/data/supplier-costs.json')

const problems = []
for (const [id, entry] of Object.entries(costs)) {
  if (entry.supplier !== 'Perfect Dealz') continue
  const urls = entry.components?.length ? entry.components.flatMap((c) => Array(c.quantity).fill(c.url)) : [entry.supplierUrl]
  // One-click cart links use the supplier's variant IDs; flag any that vanished
  const variants = entry.components?.length ? entry.components.map((c) => [c.url, c.variantId]) : [[entry.supplierUrl, entry.variantId]]
  for (const [url, variantId] of variants) {
    const item = catalogue.get(url)
    if (!variantId) problems.push(`${id}: no variantId for ${url} — 1-click cart link disabled`)
    else if (item && !item.variants.some((v) => v.id === variantId)) problems.push(`${id}: variant ${variantId} no longer exists at ${url} — update variantId`)
  }
  let now = 0
  for (const url of urls) {
    const item = catalogue.get(url)
    if (!item) problems.push(`${id}: ${url} no longer listed`)
    else {
      if (!item.available) problems.push(`${id}: ${item.title} is OUT OF STOCK`)
      now += item.minPrice
    }
  }
  if (now && now !== entry.costPrice) problems.push(`${id}: cost was R${entry.costPrice}, now R${now} — update supplier-costs.json and run npm run margins`)
}

if (problems.length) {
  console.error(problems.map((p) => `::error::${p}`).join('\n'))
  process.exit(1)
}
console.log(`All ${Object.keys(costs).length} products: supplier prices and stock unchanged`)
