# Outranking Perfect Dealz — SEO strategy (Oct 2026)

Perfect Dealz is our supplier *and* a competitor on Google: they sell the same
items, cheaper, on an older domain with ~9,900 products. We won't beat them on
domain authority or price. We beat them on **relevance, uniqueness and trust**
for a small set of searches we choose.

## What their catalogue tells us (mirror: data/suppliers/perfectdealz-catalog.json)

| Their weakness | Our counter (status) |
|---|---|
| 0 of 9,877 titles mention "South Africa" or price | Every title: "<product> South Africa – R<price>" (done) |
| Supplier-style names ("3 in 1 Handheld Cordless Vacuum 120w") | Names people search ("cordless handheld vacuum", "steam pet brush") (done) |
| Same supplier photos as hundreds of other dropship stores; 1,884 image filenames carry their brand | **Own photos/video** of the real product → unique images rank in Google Images and Merchant listings (owner to do) |
| 1 photo on vacuum and hair brush | 4–5 images incl. branded benefit/how-to/compare cards (done) |
| Several near-duplicate listings (5 for the vacuum) splitting their rankings | One page per product, one intent per page (done) |
| Reviews: not visible in their product feed (their pages may use a review app — unverified, site is blocked from here) | Real reviews → star ratings in Google (code ready, needs reviews) |
| Generic 700-char descriptions ("Introducing… the ultimate…") | Specific copy + 4 FAQs per product + guides (done) |
| Single items only | **Bundles nobody else sells** (Glow-Up Kit, Pet Grooming Kit) — a unique product = no direct competitor on its name (done) |

## Where we can win (search checks, 7 Oct 2026)

- **"pet steam brush / cat steam brush South Africa"** — no SA store in results
  (UK/AU/KE listings only). Open lane → product title + guide
  /guides/do-steam-pet-brushes-work (done).
- **Gift searches** ("gifts under R500 South Africa") — results are tech
  retailers (Evetech) and Woolworths clothing. Lane: *non-tech* gifts —
  self-care, pets, home. Guide live; refresh before Black Friday and December.
- **Long-tail product + SA** ("flame diffuser south africa", "mini massage gun
  price south africa") — winnable with titles, FAQs, reviews, own photos.
- **Don't fight:** brand searches ("perfect dealz …"), broad heads
  ("massage gun"), Takealot-dominated product names.

## Owner actions, in order of impact

1. **Merge to main + deploy** (done 7 Oct; production builds after the Vercel
   limit resets). Delete the 3 duplicate Vercel projects.
2. **Google Search Console**: verify www.zehomefinds.co.za, submit
   /sitemap.xml, request indexing for the 6 products + 5 guides.
3. **Google Merchant Center** (free listings, Shopping tab): add /feed.xml,
   country South Africa. Free listings are the biggest free e-commerce traffic
   source and Perfect Dealz's products compete there too — our feed titles
   carry "South Africa" + price.
4. **Own photos**: buy one of each product (≈R900), shoot on the cream
   background + one lifestyle shot each. Replace supplier photos 1–2. Same
   session = TikTok footage (docs/tiktok-content-plan-2026-10.md).
5. **Reviews**: WhatsApp every customer 3 days after delivery:
   "Hi <name>, did your <product> arrive OK? If you're happy, could you reply
   with a 1–5 star rating and a sentence about it? It really helps a small SA
   store." Save the screenshot, then add to `reviews` in products.json
   (`{author, rating, date, body, location}`). Never invent or edit reviews.
6. **Google Business Profile** (service-area business, Johannesburg) — brand
   searches show a knowledge panel; reviews there build trust too.
7. **Links**: TikTok/Instagram/Pinterest bios; Pinterest pins per product
   (each links to the product page); ask local gift-guide bloggers to include
   the Glow-Up Kit / Pet Kit; list on SA directories (e.g. Snupit-style
   business listings) with the www URL.
8. **Monthly**: Search Console → Queries. Any query with impressions but
   position 8–20 → add it to that page's title/FAQ or write a guide for it.

## Rules

- Honest copy only: facts from the supplier listing, no health/medical claims,
  no fake reviews, timers or "was" prices.
- One page per search intent. New product → run the sa-product-research skill
  first, then title "<name people search> South Africa – R<price>".
- Always use SITE_URL (https://www.zehomefinds.co.za) for anything public.
