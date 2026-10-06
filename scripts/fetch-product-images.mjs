// Downloads supplier (remote) product photos into public/images/products/<id>/
// and points src/data/products.json at the local copies, so the store never
// depends on the supplier's image server.
//
//   node scripts/fetch-product-images.mjs
//
// Runs in GitHub Actions (.github/workflows/fetch-product-images.yml) because
// some dev environments can't reach the CJ CDN. Safe to re-run: local images
// are left alone.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const productsPath = new URL('src/data/products.json', root)
const products = JSON.parse(readFileSync(productsPath, 'utf8'))

const extFor = (type, url) => {
  if (type?.includes('png')) return 'png'
  if (type?.includes('webp')) return 'webp'
  if (type?.includes('jpeg') || type?.includes('jpg')) return 'jpg'
  return url.match(/\.(png|webp|jpe?g)(?:$|\?)/i)?.[1].replace('jpeg', 'jpg').toLowerCase() ?? 'jpg'
}

let downloaded = 0
let failed = 0

for (const product of products) {
  const dir = new URL(`public/images/products/${product.id}/`, root)
  mkdirSync(dir, { recursive: true })
  let n = 0

  product.images = await Promise.all(
    product.images.map(async (image) => {
      if (!/^https?:\/\//.test(image)) return image
      const index = ++n
      try {
        const res = await fetch(image, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
            Referer: 'https://www.cjdropshipping.com/',
          },
        })
        const type = res.headers.get('content-type') ?? ''
        if (!res.ok || !type.startsWith('image/')) throw new Error(`${res.status} ${type}`)
        const file = `photo-${index}.${extFor(type, image)}`
        writeFileSync(new URL(file, dir), Buffer.from(await res.arrayBuffer()))
        downloaded++
        console.log(`OK ${product.id}/${file} <- ${image}`)
        return `/images/products/${product.id}/${file}`
      } catch (err) {
        failed++
        console.error(`!! ${product.id}: ${image} (${err.message}), keeping remote URL`)
        return image
      }
    })
  )
}

writeFileSync(productsPath, JSON.stringify(products, null, 2) + '\n')
console.log(`Downloaded ${downloaded}, failed ${failed}`)
process.exit(failed ? 1 : 0)
