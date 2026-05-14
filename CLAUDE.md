# Ze Home Finds — CLAUDE.md

## Project Overview
Building a Next.js homeware e-commerce store from scratch.
Store: Ze Home Finds
Domain: zehomefinds.co.za (.com redirects to .co.za)
Product: Sunset Projection Lamp (single product V1)
Payment: PayFast (SA-native)
Hosting: Vercel (free tier)
Target market: SA local — Johannesburg and surrounding areas

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

## Design (Yemi)
Palette:     Warm white #FDFCFA, cream #F5F0E8, charcoal #1A1A1A,
             terracotta accent #C4622D
Typography:  Playfair Display (headings), Inter (body)
Feel:        Premium boutique. Not a dropship store.
Mobile:      First. All TikTok traffic is mobile.
Images:      Full-bleed hero. Lifestyle over product shots.
Avoid:       Blue CTA buttons, generic gradients, stock aesthetics.

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

## SEO (Aria)
Primary keyword:   sunset projection lamp south africa
Secondary:         room transformation lamp, aesthetic room lighting SA
URL:               /product/sunset-projection-lamp
OG image:          /images/og-lamp.jpg (1200x630)
Alt text:          "Sunset projection lamp casting warm golden glow on wall"
Canonical:         https://zehomefinds.co.za

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
Bio link: https://zehomefinds.co.za

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
