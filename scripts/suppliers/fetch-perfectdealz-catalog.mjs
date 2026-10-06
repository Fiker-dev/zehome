// Mirrors Perfect Dealz's public Shopify product feed into
// data/suppliers/perfectdealz-catalog.json so product research can run from
// environments where their site is blocked.
//
//   node scripts/suppliers/fetch-perfectdealz-catalog.mjs
//
// Runs in GitHub Actions (.github/workflows/fetch-supplier-catalog.yml).
// One request per second; stops at the first empty page.

import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = 'https://perfectdealz.co.za'
const out = new URL('../../data/suppliers/perfectdealz-catalog.json', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const htmlToText = (html = '') =>
  html.replace(/<(br|\/p|\/li|\/h\d)[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').replace(/\n\s*/g, '\n').trim()

const products = []
for (let page = 1; page <= 60; page++) {
  const res = await fetch(`${BASE}/products.json?limit=250&page=${page}`, {
    headers: { 'User-Agent': 'ZeHomeFinds-catalog-sync/1.0 (+https://zehomefinds.co.za)' },
  })
  if (!res.ok) throw new Error(`page ${page}: HTTP ${res.status}`)
  const { products: batch } = await res.json()
  if (!batch?.length) break

  for (const p of batch) {
    const prices = p.variants.map((v) => Number(v.price)).filter((n) => n > 0)
    products.push({
      handle: p.handle,
      url: `${BASE}/products/${p.handle}`,
      title: p.title,
      type: p.product_type,
      vendor: p.vendor,
      tags: p.tags,
      description: htmlToText(p.body_html).slice(0, 700),
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      compareAt: Number(p.variants[0]?.compare_at_price) || null,
      available: p.variants.some((v) => v.available),
      variants: p.variants.map((v) => ({ id: v.id, title: v.title, price: Number(v.price), available: v.available, grams: v.grams })),
      images: p.images.map((i) => i.src),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })
  }
  console.log(`page ${page}: ${batch.length} products (total ${products.length})`)
  await sleep(1000)
}

mkdirSync(new URL('.', out), { recursive: true })
writeFileSync(out, JSON.stringify({ fetchedAt: new Date().toISOString(), source: BASE, count: products.length, products }, null, 1) + '\n')
console.log(`Saved ${products.length} products`)
