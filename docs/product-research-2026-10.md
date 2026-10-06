# CJ product research — 6 Oct 2026

Read-only research via the CJMCP connector. Nothing was created on CJ.

- Exchange rate used: **R17.00 / US$1** (market ~R16.56–16.65 on 6 Oct 2026, plus buffer for card FX fees).
- Prices from `npm run margins -- <supplierCostZAR> <deliveryCostZAR>` (≥ R100 profit and ≥ 25% margin after PayFast card fees incl. VAT).
- Store offers free delivery, so CJ shipping to ZA = delivery cost.

## Shipping constraints (CN → ZA)

- CJ has **no South African warehouse stock**; everything ships from China.
- Non-electric goods: **CJPacket Ordinary, 7–13 days**.
- Anything with a battery/electronics is classed sensitive: **CJPacket Sensitive, 13–30 days**.
- Even ~240 g parcels cost ~R200+ to ship, so the lowest viable retail is ~R399.

## Shortlist

### Pass all rules (margin, ≤ ~R600, ≤ ~20 days)

| Product | CJ pid | Variant (vid) | Photo | CJ cost | Shipping / days | Retail | Profit |
|---|---|---|---|---|---|---|---|
| Self-cleaning pet hair remover, 2-pack | 1368888013161107456 | 2511270813161605700 | [img](https://oss-cf.cjdropshipping.com/product/2025/11/27/08/be18cd13-7816-40b9-ba7d-bddf39f683bd.jpg) | $2.94 (R50) | $11.92 (R203) / 7–13 | R399 | R129 (32%) |
| 780 ml gradient tumbler with straw | 2503060706181622300 | 2503060706181622700 (pink) | [img](https://oss-cf.cjdropshipping.com/product/2025/04/28/06/d5205ceb-631d-48d0-bfef-10423e85e5aa.jpg) | $5.01 (R85) | $21.41 (R364) / 7–13 | R649* | R174 (27%) |

\* Slightly above the R600 ceiling.

### Pass margin, but 13–30 days (battery/electronic)

| Product | CJ pid | Variant (vid) | Photo | CJ cost | Shipping / days | Retail | Profit |
|---|---|---|---|---|---|---|---|
| Crystal water-ripple lamp, RGB + remote | 1654760771563294720 | 1654760771756232704 | [img](https://oss-cf.cjdropshipping.com/product/2024/03/18/03/cfb63bd0-f491-482b-a9c6-c210315842f9.jpg) | $4.70 (R80) | $13.01 (R221) / 13–30 | R449 | R129 (29%) |
| RGB flame aroma diffuser | 1578948189683077120 | 1578948189708242945 (black) | [img](https://cf.cjdropshipping.com/9ee598c7-39e0-412a-9b92-3bc5bc85417c.jpg) | $6.33 (R108) | $16.20 (R275) / 13–30 | R549 | R143 (26%) |
| Motion-sensor magnetic light, walnut 2-pack | 842B5DB4-E59C-42FC-BEAB-01893C169776 | 1726437239644758016 | [img](https://cf.cjdropshipping.com/7e0677c5-b808-4c2a-8cef-4acbe67f3b15.jpg) | $4.14 (R70) | $17.07 (R290) / 13–30 | R549 | R166 (30%) |

### Dropped

- Vegetable chopper (1374636151603859456): 880 g, needs R799.
- Galaxy projector (1628625788713054208): needs R899.
- Portable blender, neck fans, moon lamp with wireless charging: electronic (13–30 days), not priced.

## Open decisions for the owner

1. Which products to add to `src/data/products.json`.
2. Whether to accept 13–30-day delivery for electronic items.
3. Tumbler at R649, or skip it.
4. Site delivery promise must change from "3–5 days" to ~10–16 business days (fast line) or 2–4 weeks (electronic).
