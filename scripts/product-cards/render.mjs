// Renders branded product cards (benefits / how it works / comparison) to
// public/images/products/<id>/*.jpg from scripts/product-cards/cards.json.
//
//   npm run cards                 render every product in cards.json
//   npm run cards -- <id> [...]   render only these products
//
// Needs Playwright with Chromium (`npm i -g playwright && npx playwright install chromium`).

import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const root = new URL('../../', import.meta.url)
const readJson = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'))

const require = createRequire(import.meta.url)
const globalRoot = execSync('npm root -g').toString().trim()
const { chromium } = require(require.resolve('playwright', { paths: [root.pathname, globalRoot] }))

const W = 1080
const H = 1080
const C = {
  bg: '#FDFCFA',
  cream: '#F5F0E8',
  charcoal: '#1A1A1A',
  gray: '#8A8278',
  terracotta: '#C4622D',
  border: '#E2DDD4',
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])

const check = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`

const shell = (eyebrow, body) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@400;500;700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${W}px; height: ${H}px; background: ${C.bg}; color: ${C.charcoal};
         font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; }
  .top { padding: 56px 72px 0; display: flex; justify-content: space-between; align-items: baseline; }
  .brand { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 600; letter-spacing: 0.5px; }
  .eyebrow { color: ${C.terracotta}; font-size: 22px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; }
  .main { flex: 1; padding: 0 72px; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-family: 'Playfair Display', serif; font-weight: 500; font-size: 68px; line-height: 1.05; margin-bottom: 40px; }
  .foot { background: ${C.charcoal}; color: #fff; padding: 28px 72px; display: flex; justify-content: space-between;
          font-size: 22px; letter-spacing: 1px; }
  .foot b { color: ${C.terracotta}; font-weight: 700; }
</style></head>
<body>
  <div class="top"><span class="brand">Ze Home Finds</span><span class="eyebrow">${esc(eyebrow)}</span></div>
  <div class="main">${body}</div>
  <div class="foot"><span><b>Free delivery</b> across South Africa</span><span>zehomefinds.co.za</span></div>
</body></html>`

const benefits = ({ headline, points }) => `
  <h1>${esc(headline)}</h1>
  <div style="display:flex;flex-direction:column;gap:18px">
    ${points
      .map(
        (p) => `<div style="display:flex;align-items:center;gap:30px;background:${C.cream};padding:22px 30px;border-left:6px solid ${C.terracotta}">
      <span style="flex:0 0 46px;height:46px;border-radius:50%;background:${C.terracotta};display:flex;align-items:center;justify-content:center">${check}</span>
      <span style="font-size:30px;line-height:1.3">${esc(p)}</span></div>`
      )
      .join('')}
  </div>`

const steps = ({ headline, items }) => `
  <h1>${esc(headline)}</h1>
  <div style="display:flex;flex-direction:column;gap:0">
    ${items
      .map(
        ([title, text], i) => `<div style="display:flex;gap:40px;align-items:flex-start;padding:26px 0;${i ? `border-top:2px solid ${C.border}` : ''}">
      <span style="font-family:'Playfair Display',serif;font-style:italic;font-size:88px;line-height:0.85;color:${C.terracotta};width:72px">${i + 1}</span>
      <div><div style="font-family:'Playfair Display',serif;font-size:44px;margin-bottom:8px">${esc(title)}</div>
      <div style="font-size:29px;color:${C.gray};line-height:1.35">${esc(text)}</div></div></div>`
      )
      .join('')}
  </div>`

const compare = ({ headline, left, right, rows }) => `
  <h1>${esc(headline)}</h1>
  <div style="display:grid;grid-template-columns:1fr 1fr;border:2px solid ${C.border}">
    <div style="padding:22px 28px;font-size:27px;font-weight:700;color:${C.gray};background:${C.cream}">${esc(left)}</div>
    <div style="padding:22px 28px;font-size:27px;font-weight:700;color:#fff;background:${C.terracotta}">${esc(right)}</div>
    ${rows
      .map(
        ([label, a, b]) => `
      <div style="padding:20px 28px;border-top:2px solid ${C.border};background:${C.cream}">
        <div style="font-size:19px;letter-spacing:3px;text-transform:uppercase;color:${C.gray};margin-bottom:6px">${esc(label)}</div>
        <div style="font-size:30px;color:${C.gray};text-decoration:line-through;text-decoration-thickness:2px">${esc(a)}</div></div>
      <div style="padding:20px 28px;border-top:2px solid ${C.border}">
        <div style="font-size:19px;letter-spacing:3px;text-transform:uppercase;color:${C.gray};margin-bottom:6px">${esc(label)}</div>
        <div style="font-size:30px;font-weight:700">${esc(b)}</div></div>`
      )
      .join('')}
  </div>`

const cards = readJson('scripts/product-cards/cards.json')
const productIds = new Set(readJson('src/data/products.json').map((p) => p.id))
const only = process.argv.slice(2)
const ids = only.length ? only : Object.keys(cards)

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
)
const page = await browser.newPage({ viewport: { width: W, height: H } })

for (const id of ids) {
  const card = cards[id]
  if (!card) throw new Error(`No cards for "${id}" in scripts/product-cards/cards.json`)
  if (!productIds.has(id)) console.warn(`!  ${id} is not in src/data/products.json`)

  const dir = new URL(`public/images/products/${id}/`, root)
  mkdirSync(dir, { recursive: true })

  for (const [name, body] of [
    ['benefits', benefits(card.benefits)],
    ['how-it-works', steps(card.steps)],
    ['compare', compare(card.compare)],
  ]) {
    await page.setContent(shell(card.eyebrow, body), { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const overflow = await page.evaluate(() => document.body.scrollHeight > window.innerHeight)
    if (overflow) console.warn(`!  ${id}/${name}: content taller than the card, shorten the copy`)
    await page.screenshot({ path: new URL(`${name}.jpg`, dir).pathname, type: 'jpeg', quality: 88 })
    console.log(`OK /images/products/${id}/${name}.jpg`)
  }
}

await browser.close()
