---
name: sa-product-research
description: Find and validate winning products for Ze Home Finds in the South African market. Use before adding, replacing or repricing any product, whenever the owner asks for "winning", "viral" or "trending" products, or when judging whether the current catalogue can win. Requires proof the product already sells in SA, a local supplier we can buy from per order, competitive delivery, and profit after PayFast fees.
---

# SA product research — how Ze Home Finds picks products

Owner's rules (Oct 2026):
- **Enter with products that are already selling in South Africa.** Global
  "TikTok viral" alone is not enough.
- **No paid ads.** Growth comes from the owner's own TikTok content, so profit
  only has to clear the margin rule after PayFast fees.
- **Buy per order, local first.** Default supplier is **Perfect Dealz**
  (Johannesburg) via their dropshipping programme: we pay only after our
  customer pays, they ship to the customer from local stock in 2-7 business
  days. Cost = their website price (dropship tiers 5-12% off are a bonus, not
  assumed) + their delivery fee. CJ (China) is the fallback for items no SA
  supplier carries. Never add a product to
`src/data/products.json` without completing every step below and showing the
owner the scorecard.

## Step 1 — Demand signals (need A and B)

A. **Trending now.** The product type appears on current (this year) TikTok
   viral / TikTok Shop best-seller lists. Use WebSearch, mode "extended",
   e.g. `viral TikTok products <month> <year> <category>`.
B. **Already selling in SA.** Search `"<product> price South Africa"` and
   `"<product> takealot"` (WebSearch, standard). PriceCheck results show which SA
   stores sell it and at what price. Evidence = at least one SA retailer
   (Takealot, Perfect Dealz, Clicks, Crazy Store, Makro, Superbalist, local
   Shopify stores) listing the same item. Record every price found.
C. Supporting (not sufficient alone): CJ `listedNum` (how many dropshippers list
   it). Note: Takealot, PriceCheck, Perfect Dealz, CJ and most retailer sites are
   blocked for direct fetch from the Claude environment; use WebSearch results.

No B → not a launch product. It can only go in as a clearly-labelled test, with
the owner's OK.

## Step 2 — Landed cost

**Perfect Dealz (default).** Their catalogue is mirrored in
`data/suppliers/perfectdealz-catalog.json` by the "Fetch supplier catalogue"
GitHub Action (their site is blocked from the Claude environment; GitHub
isn't). Re-run it by pushing a change to
`scripts/suppliers/fetch-perfectdealz-catalog.mjs` or from the Actions tab.
Cost = catalogue price + delivery fee (⚠️ R99 per order from CLAUDE.md until
confirmed in the dropshipper account). Delivery to customer: 2-7 business days
→ show "3-7 business days".

**CJ (fallback, only if no SA supplier).**

CJ connector rules: one call per second (calls in parallel fail with QPS errors).
`search_products` → `get_product_variants` (pick the exact variant we will sell,
note weight) → `calculate_freight` with `endCountryCode: ZA`.

- Non-electric goods: "CJPacket Ordinary", 7–13 days → show "8-16 days".
- Anything with a battery/electronics: "CJPacket Sensitive", 13–30 days →
  show "15-33 days".
- CJ holds no stock in SA (checked Oct 2026). Re-check with
  `search_products(isWarehouse=true, countryCode=ZA)`.
- Convert at the current USD/ZAR rate + ~R0.40 buffer for card FX; state it.

## Step 3 — Price position (the step that kills most products)

Compare our required price (Step 4) with the SA prices from Step 1B:

| Our price vs SA median | Our delivery vs local | Verdict |
|---|---|---|
| ≤ median | any | ✅ can win |
| ≤ 1.2× median | product clearly better (bundle, variant locals don't have) | 🟡 test |
| > 1.2× median | slower | ❌ drop — or source locally (see below) |

If SA retailers deliver in 3–5 days and we take 15–33, we must be cheaper, not
dearer. When a product is proven in SA but CJ can't compete, the answer is a
**local supplier** (Perfect Dealz, Johannesburg — dropship/wholesale, 3–5 day
delivery, see CLAUDE.md), not a lower margin.

## Step 4 — Profit after PayFast

`npm run margins -- <supplierCostZAR> <deliveryCostZAR>` gives the lowest price
clearing R100 profit + 25% margin after PayFast card fees incl. VAT. No ad
allowance: the owner grows on organic content. If the owner ever starts paid
ads, re-run with `<deliveryCostZAR + 150>` (⚠️ ~R150 cost per sale).

## Step 5 — Scorecard (show the owner before adding anything)

Score 1–5 each; launch needs ≥ 24/35 and no 1s.

| Dimension | 5 = | 1 = |
|---|---|---|
| Trending now (1A) | on several current lists | not on any |
| Selling in SA (1B) | several SA stores, reviews | none found |
| Price vs SA market (3) | cheaper than median | > 1.5× median |
| (with a per-order supplier we always sit above the supplier's own retail price; judge against the wider SA market, and prefer items where our markup is ≤ ~1.6× because our buyers come from content, not price comparison) | | |
| Delivery vs SA market | local stock, 2-7 days | 30+ days vs 3-day locals |
| Profit (4) | passes with ≥ R150 profit | fails the margin rule |
| Content / demo angle | instant visual "before/after" | hard to show on video |
| Risk (returns, fragility, compliance) | sturdy, no plug, no claims | mains plug (SA sockets), fragile, health claims |

Mains-powered items from CN come with non-SA plugs — avoid unless the supplier
ships an SA plug. Avoid medical/health claims in copy.

## Step 6 — Adding a product (only after the owner approves)

1. Add the product to `src/data/products.json` (exact variant, honest copy —
   only facts from the supplier listing, `deliveryDays` "3-7 business days"
   for Perfect Dealz) and to `src/data/supplier-costs.json`: `supplier`,
   `supplierUrl`, `costPrice`, `deliveryCost`, plus `components` (title, url,
   quantity) for a bundle or `cjPid/cjVid/cjVariant` for CJ. These drive the
   "BUY →" shopping list on each paid order. `npm run margins` must exit 0.
2. Put the supplier's image URLs in `images` and push; the "Fetch product
   images" GitHub Action copies them into
   `public/images/products/<id>/`. Pull, then **look at every photo**: drop any
   showing colours/variants we don't sell, foreign-language text or another
   store's watermark.
3. Add card copy to `scripts/product-cards/cards.json`, run `npm run cards`;
   insert the three card paths after the first photo.
4. Build, run the full QA (all product pages, shop filters, cart, PayFast
   sandbox hand-off), confirm the Vercel build is READY, then report.

## Output format

Start with the verdict, then the scorecard table, then prices found (with
source links), then next actions. Mark estimates with ⚠️. Say plainly when a
product should be dropped.

_Scoring dimensions adapted from nexscope-ai/ecommerce-skills
(dropshipping-product-research, MIT licence)._
