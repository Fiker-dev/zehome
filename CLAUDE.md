# Ze Home Finds — CLAUDE.md

## Project Overview
Building a Next.js homeware e-commerce store from scratch.
Store: Ze Home Finds
Domain: zehomefinds.co.za (.com redirects to .co.za)
Positioning: general "viral finds" store (home, lifestyle, gadgets), not lamp-only.
  Tagline: "Viral finds, delivered."  Products are rotated as winners are found;
  the lamp copy below is from V1 and only applies to lamp products.
Product data: src/data/products.json (category per product). Supplier costs:
  src/data/supplier-costs.json. Run `npm run margins` before any price goes live.
Payment: PayFast (SA-native)
Hosting: Vercel (free tier)
Target market: SA local — Johannesburg and surrounding areas

## Current Status (Oct 2026) — read first
- Branch claude/affiliate-product-workflow-pc24ax (fast-forwarded into main
  on 7 Oct 2026 at the owner's request):
  PayFast ITN fix (real orders were never logged), server-side pricing +
  amount HMAC in order IDs, margin checker, mobile fixes, rebrand to
  "viral finds".
- Security review 8 Oct 2026: docs/security-review-2026-10.md. Order IDs sign
  amount + cart (item_description); BUY list comes only from the signed cart.
- PayFast: account active (merchant ID 31199311). Passphrase must be rotated
  (it was exposed in chat); keep "require signature" OFF — the checkout form
  is unsigned by design.
- Supplier: CJdropshipping (account fifiab569@gmail.com, CJ3503236). API store
  "zehomefinds.co.za" is authorised. Key goes in env var CJ_API_KEY (Vercel +
  Claude environment). API base https://developers.cjdropshipping.com/api2.0/v1
- Next (old CJ plan, superseded by Perfect Dealz below): CJ research; auto-place
  CJ order on PayFast COMPLETE ITN; update delivery promise to CJ's real SA
  transit time; replace lamp products once winners are picked.
- Vercel: 4 projects (zehome, zehomenew, zehome-yxcz, zehome-4jx2) build the
  same repo (Hobby plan, 1 concurrent build, so they queue). Every push costs
  4 of the 100 deployments/day — the limit was hit on 6 Oct. Owner asked to
  delete the three duplicates in the dashboard (only 4jx2 has the domain). zehomefinds.co.za
  resolves to production deployment dpl_8HKD5ASsur52QKMzbbi5TB8Li661, which is
  **zehome-4jx2** — that is the live project. Env vars (PayFast, CJ_API_KEY,
  GOOGLE_SHEETS_WEBHOOK_URL) belong there. Owner still to confirm in the
  dashboard before deleting the other three.
- CJ: CJMCP connector signed in via OAuth (valid 180 days).
- CJ research (6 Oct 2026, R17/USD): CJ holds no SA warehouse stock, so all
  items ship from CN. To ZA: "CJPacket Ordinary" 7-13 days for non-electric
  goods; anything with a battery/electronics is forced onto "CJPacket
  Sensitive" 13-30 days. Shipping is ~R200+ per parcel even at ~240 g, so
  retail starts around R399.
- PRODUCT RULE (owner): enter with products already selling in SA, priced and
  delivered competitively. Before adding/replacing/repricing ANY product, follow
  .claude/skills/sa-product-research/SKILL.md and show the owner the scorecard.
- Live catalogue (6 Oct 2026, see docs/product-scorecard-2026-10.md): all
  Perfect Dealz local stock, 3-7 business days, bought per order at their
  website price + R99 delivery (⚠️ confirm fee in dropshipper account).
  Launch prices (7 Oct, at/below SA market, ≥R70 profit / 15% after PayFast
  card fees): flame aroma diffuser R349, Glow-Up Kit R399 (ice roller + brush
  cleaner + scalp comb), mini massage gun R399, Pet Grooming Kit R399 (steam
  brush + hair roller + dog bottle), cordless handheld vacuum R329, hair dryer
  brush R429.
  Bundles spread one delivery fee over three cheap viral items.
  Order flow: paid PayFast ITN -> Google Sheet row whose "reminder" column
  reads "BUY -> Perfect Dealz: 1x <item> <url>; ..." (src/lib/supplier.ts);
  owner buys those items on perfectdealz.co.za with the customer's address.
  Supplier catalogue mirror: data/suppliers/perfectdealz-catalog.json (weekly
  Action). CJ products removed (dearer and slower than local). Photos are
  stored in public/images/products/ (Action copies remote images), branded
  cards via `npm run cards`, share image via `npm run og`. If a product page
  404s locally after catalogue changes, `rm -rf .next` and rebuild.
- Vercel connector works without teamId (team-scoped calls return nothing).
  Previews are behind Vercel Authentication; Claude cannot open them.

## Tech Stack
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Hosting: Vercel (free tier)
- Payment: PayFast (ITN callback)
- State: Zustand (cart)
- Fonts: next/font (Playfair Display + Inter)
- Product data: Static JSON in /data
- Database: None for V1

## Build Scope

### Pages
  /                     Hero + product above fold, single CTA
  /product/[slug]       Full product detail, images, add to cart
  /cart                 Simple cart
  /checkout             Customer details + PayFast redirect
  /order-success        Confirmation + order reference
  /order-cancelled      Cancelled/failed payment

### Components
  Navbar                Logo, cart icon, mobile hamburger
  Hero                  Full-bleed image, headline, CTA
  ProductCard           Image, name, price, add to cart
  CartDrawer            Slide-out cart panel (Zustand)
  PayFastForm           Hidden form POST to PayFast
  Footer                Minimal, trust signals, links

### API Routes
  /api/payfast/notify   ITN callback — server-side only

## Product Data (/data/products.json)
{
  "id": "sunset-projection-lamp",
  "name": "Sunset Projection Lamp",
  "slug": "sunset-projection-lamp",
  "price": 350,
  "currency": "ZAR",
  "description": "Transform any room in seconds. The Sunset Projection Lamp
    casts a warm golden-hour glow across your walls and ceiling.
    Plug in. Switch on. Done.",
  "bullets": [
    "Warm sunset + colour-shift modes",
    "360 rotatable head",
    "USB powered — no batteries needed",
    "Compact enough to take anywhere",
    "Free delivery across South Africa"
  ],
  "images": ["/images/lamp-hero.jpg", "/images/lamp-room.jpg"],
  "inStock": true,
  "deliveryDays": "3-5"
}

## PayFast Integration

### .env.local (never commit)
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=true
NEXT_PUBLIC_STORE_URL=https://zehomefinds.co.za

### Payment Flow
1. Customer fills details on /checkout
2. App builds signed PayFast form
3. Hidden form auto-submits to https://www.payfast.co.za/eng/process
4. PayFast processes payment
5. ITN hits /api/payfast/notify (verify server-side)
6. Redirect to /order-success or /order-cancelled

### Signature Function
import crypto from 'crypto'
export function generateSignature(data, passphrase = '') {
  const params = { ...data }
  if (passphrase) params.passphrase = passphrase
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
    .join('&')
  return crypto.createHash('md5').update(sorted).digest('hex')
}

### Required PayFast Fields
merchant_id, merchant_key, return_url, cancel_url, notify_url,
name_first, name_last, email_address, m_payment_id,
amount (2 decimals e.g. "350.00"), item_name, signature

## Design (Yemi) — updated 6 Oct 2026
Structure:   Shopify Dawn-style store: announcement bar, lowercase wordmark,
             full nav + mobile drawer, /shop collection with category chips
             and sort, 2/4-column product grid with hover photo + quick add,
             multi-column footer.
Look:        rhode-inspired: warm off-white #FBF9F6, soft cream tiles #F1ECE4,
             charcoal #1C1C1C, greige #8A8178, border #E7E0D6. Inter
             (headings, lowercase) + DM Sans (body). Black pill buttons.
Mobile:      First. All TikTok traffic is mobile.
Avoid:       Copying any brand's logo, photos or text; fake reviews or timers.

## Copy (Felix)
Hero H1:       "Change your whole room for R400"
Hero sub:      "Free delivery. Ships in 3-5 days across South Africa."
CTA:           "Get yours now"
Trust line:    "Delivered to your door. No hassle returns."
Checkout CTA:  "Complete my order"
Success:       "You're all set. Your lamp is on its way."
Product H1:    "Sunset Projection Lamp"
Meta title:    "Sunset Projection Lamp | Ze Home Finds"
Meta desc:     "Transform your room instantly with the Sunset Projection
                Lamp. Warm golden-hour lighting. Free delivery in SA."

## SEO (Aria) — updated 6 Oct 2026
Canonical host:    https://www.zehomefinds.co.za (apex redirects to www).
                   Always use SITE_URL from src/lib/site.ts, never the apex.
Head terms:        viral TikTok products south africa (home, /shop)
Per product:       "<product> south africa" + price in title, keywords,
                   FAQs (products.json `seo`, `keywords`, `faqs`).
Collections:       /collections/<category-slug>, copy in
                   src/data/collections.json (title, h1, intro).
Structured data:   src/lib/schema.ts — Product (price, free shipping, 14-day
                   returns), BreadcrumbList, FAQPage, ItemList, OnlineStore.
Guides:            /guides/<slug>, content in src/data/guides.json (Article
                   + FAQ schema; link products via section `products`).
Files:             /robots.txt, /sitemap.xml, /feed.xml (Google Merchant
                   Center free listings feed).
Strategy:          docs/seo-competitive-strategy-2026-10.md (how we outrank
                   Perfect Dealz). Reviews: products.json `reviews` (real
                   only) -> stars + AggregateRating schema.
Owner to do:       Search Console: submit sitemap. Merchant Center: add
                   /feed.xml as data source, enable free listings.

## DNS (Kai — domains.co.za)
zehomefinds.co.za:
  A record:     @ → 76.76.21.21
  CNAME:        www → cname.vercel-dns.com

zehomefinds.com:
  Same two records. Vercel handles 301 redirect to .co.za.

## Supplier
Perfect Dealz — Sandton, Johannesburg
WhatsApp: 064 601 3518
Delivery: R99 door-to-door, 3-5 days
Target retail: R350 (confirm wholesale with supplier)
Dropstore backup: dropstore.co.za (14-day free trial)

## TikTok Content (Leo — post while store builds)
Account: zehomefinds (1.5k followers, homeware niche)
Hook 1: "POV: R400 changed my whole room"
Hook 2: "Ze Home Finds just dropped and I'm not okay"
Hook 3: "Rating aesthetic room upgrades under R500"
Bio link: https://www.zehomefinds.co.za
Plan:     docs/tiktok-content-plan-2026-10.md (scripts per product; real
          product footage only, AI/stock for mood B-roll)

## The Bureau — Agent Roles

| Task                    | Agent   | Skill              |
|-------------------------|---------|--------------------|
| Architecture + code     | Marcus  | /plan-eng-review   |
| UI / design             | Yemi    | /plan-design-review|
| QA before launch        | Priya   | /qa                |
| Deploy + domain         | Kai     | /ship              |
| All copy                | Felix   | copywriting        |
| SEO titles + meta       | Aria    | seo-audit          |
| Checkout conversion     | Mico    | page-cro           |
| Save session end        | Sasha   | /context-save      |

## Build Order
1. Scaffold Next.js app
2. Install dependencies (zustand, tailwind already included)
3. Build layout (Navbar, Footer)
4. Build homepage (Hero + ProductCard)
5. Build product page
6. Build cart (Zustand store + CartDrawer)
7. Build checkout + PayFast form
8. Build /api/payfast/notify
9. Build success + cancelled pages
10. SEO metadata on every page (Aria)
11. QA full flow (Priya)
12. Deploy to Vercel (Kai)
13. Connect domain in Vercel dashboard (Kai)
14. Add DNS records in domains.co.za (Kai)

## Session Start
"Read CLAUDE.md. We are building Ze Home Finds.
Marcus — scope the Next.js structure and start the scaffold."

## Closing Ritual
End every session: call Sasha, run /context-save
