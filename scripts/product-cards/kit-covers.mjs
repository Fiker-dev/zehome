// Renders a 1080x1080 cover for each bundle (public/images/products/<id>/cover.jpg)
// showing every item in the box, from the supplier photos listed below. Used as
// the first image so a kit never looks like a single product.
//
//   npm run kit-covers

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const root = new URL('../../', import.meta.url)
const require = createRequire(import.meta.url)
const globalRoot = execSync('npm root -g').toString().trim()
const { chromium } = require(require.resolve('playwright', { paths: [root.pathname, globalRoot] }))

const KITS = {
  'glow-up-kit': {
    title: 'the glow-up kit',
    items: [
      ['photo-2.jpg', 'Cooling ice roller (1, colour varies)'],
      ['photo-4.jpg', 'Electric brush cleaner'],
      ['photo-5.jpg', 'Scalp comb (1, colour varies)'],
    ],
  },
  'pet-grooming-kit': {
    title: 'the pet grooming kit',
    items: [
      ['photo-1.jpg', 'Steam pet brush'],
      ['photo-3.jpg', 'Reusable pet hair roller'],
      ['photo-6.jpg', 'Dog water bottle + bowl'],
    ],
  },
}

const dataUri = (path) => {
  const ext = path.split('.').pop().replace('jpg', 'jpeg')
  return `data:image/${ext};base64,${readFileSync(new URL(`public${path}`, root)).toString('base64')}`
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } })

for (const [id, kit] of Object.entries(KITS)) {
  const tile = ([file, label], cls) => `
    <figure class="${cls}"><div class="img" style="background-image:url('${dataUri(`/images/products/${id}/${file}`)}')"></div>
    <figcaption>${label}</figcaption></figure>`
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600&family=DM+Sans:wght@500;700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1080px; background: #F1ECE4; color: #1C1C1C; font-family: 'DM Sans', sans-serif;
         padding: 56px; display: flex; flex-direction: column; gap: 28px; }
  header { display: flex; justify-content: space-between; align-items: baseline; }
  h1 { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 54px; letter-spacing: -2px; }
  .pill { background: #1C1C1C; color: #FBF9F6; border-radius: 999px; padding: 10px 22px; font-weight: 700; font-size: 22px; letter-spacing: 1px; }
  .grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; }
  figure { background: #fff; display: flex; flex-direction: column; overflow: hidden; }
  .big { grid-row: span 2; }
  .img { flex: 1; background-size: contain; background-repeat: no-repeat; background-position: center; margin: 16px; }
  figcaption { padding: 14px 18px; border-top: 1px solid #E7E0D6; font-weight: 700; font-size: 24px; }
  .n { color: #8A8178; margin-right: 8px; }
</style></head><body>
  <header><h1>${kit.title}</h1><span class="pill">3 PIECES</span></header>
  <div class="grid">${tile(kit.items[0], 'big')}${tile(kit.items[1], '')}${tile(kit.items[2], '')}</div>
</body></html>`.replace(/<figcaption>/g, () => `<figcaption><span class="n"></span>`), { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    document.querySelectorAll('.n').forEach((el, i) => (el.textContent = `${i + 1}.`))
  })
  await page.evaluate(() => document.fonts.ready)
  const out = new URL(`public/images/products/${id}/cover.jpg`, root).pathname
  await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
  console.log(`OK /images/products/${id}/cover.jpg`)
}
await browser.close()
