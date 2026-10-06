// Renders the site's social share image (public/images/og-home.jpg, 1200x630)
// from the first three products in src/data/products.json, plus the 512x512
// logo used in structured data (public/images/logo.png).
//
//   npm run og

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const root = new URL('../../', import.meta.url)
const products = JSON.parse(readFileSync(new URL('src/data/products.json', root), 'utf8')).slice(0, 3)

const require = createRequire(import.meta.url)
const globalRoot = execSync('npm root -g').toString().trim()
const { chromium } = require(require.resolve('playwright', { paths: [root.pathname, globalRoot] }))

const dataUri = (path) => {
  const ext = path.split('.').pop().replace('jpg', 'jpeg')
  return `data:image/${ext};base64,${readFileSync(new URL(`public${path}`, root)).toString('base64')}`
}
const tile = (p, cls) =>
  `<div class="${cls}" style="background-image:url('${dataUri(p.images[0])}')"><span>R${p.price}</span></div>`

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&family=DM+Sans:wght@500;700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; background: #F1ECE4; color: #1C1C1C; font-family: 'DM Sans', sans-serif;
         display: grid; grid-template-columns: 540px 1fr; gap: 40px; padding: 48px 56px; }
  .copy { display: flex; flex-direction: column; justify-content: center; gap: 22px; }
  .brand { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 32px; letter-spacing: -1px; text-transform: lowercase; }
  h1 { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 62px; line-height: 1.05; letter-spacing: -2px; text-transform: lowercase; }
  .tag { color: #8A8178; font-weight: 700; font-size: 18px; letter-spacing: 4px; text-transform: uppercase; }
  .sub { font-size: 22px; color: #4A4040; }
  .grid { display: grid; grid-template-columns: 3fr 2fr; grid-template-rows: 1fr 1fr; gap: 12px; }
  .grid div { background-size: cover; background-position: center; position: relative; }
  .big { grid-row: span 2; }
  .grid span { position: absolute; left: 10px; bottom: 10px; background: rgba(255,255,255,.95); padding: 5px 14px; border-radius: 999px; font-weight: 700; font-size: 18px; }
</style></head><body>
  <div class="copy">
    <div class="brand">Ze Home Finds</div>
    <h1>The finds everyone’s talking about</h1>
    <div class="tag">Viral finds, delivered</div>
    <div class="sub">Free delivery across South Africa · zehomefinds.co.za</div>
  </div>
  <div class="grid">${tile(products[0], 'big')}${tile(products[1], '')}${tile(products[2], '')}</div>
</body></html>`

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: new URL('public/images/og-home.jpg', root).pathname, type: 'jpeg', quality: 88 })
console.log('OK /images/og-home.jpg')

await page.setViewportSize({ width: 512, height: 512 })
await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=block" rel="stylesheet">
<style>body{margin:0;width:512px;height:512px;background:#1C1C1C;color:#FBF9F6;display:flex;align-items:center;
justify-content:center;font-family:'Inter',sans-serif;font-weight:600;font-size:300px;letter-spacing:-12px}</style>
</head><body>z</body></html>`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: new URL('public/images/logo.png', root).pathname, type: 'png' })
await browser.close()
console.log('OK /images/logo.png')
