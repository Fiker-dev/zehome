# Product photo workflow

How each product's gallery is built, and how to add lifestyle photos that sell.

## What a gallery should contain

High-converting stores use the same mix on every product page:

1. **Real product photo first.** It's the image on the shop grid and in social shares.
2. **Benefits card:** a hook headline plus 3-4 short benefits.
3. **How it works:** 3 numbered steps.
4. **Comparison:** "the old way vs this", the old way struck through.
5. **Lifestyle photos:** the real product in a real-looking room (see below).
6. Remaining supplier photos (other angles, close-ups).

Never use an AI image that *invents* the product. Text-to-image tools draw a
look-alike, not the item CJ ships, which misleads buyers and causes returns.
Every product image must show the actual product.

## Branded cards (2-4): `npm run cards`

Cards are rendered from `scripts/product-cards/cards.json` into
`public/images/products/<product-id>/{benefits,how-it-works,compare}.jpg`
(1080x1080, square to match the product gallery).

```bash
npm i -g playwright && npx playwright install chromium   # once
npm run cards                                           # all products
npm run cards -- flame-aroma-diffuser                   # one product
```

To add a product: add an entry to `cards.json` under its product id (copy an
existing one), run `npm run cards`, then add the three paths to the product's
`images` array in `src/data/products.json`, right after the first photo.
The script warns if copy is too long for the card. Only state facts that the
CJ listing confirms.

## Lifestyle photos (5): real product, new scene

Needs a computer with an NVIDIA GPU (8 GB+ VRAM), or a rented GPU on
RunPod/Vast.ai (roughly R5-R15 an hour).

1. **Download the supplier photo** from the CJ product page (link in
   `src/data/supplier-costs.json`). Pick the clearest shot of the exact variant
   we sell.
2. **Cut out the product** with [rembg](https://github.com/danielgatis/rembg)
   (runs on CPU):
   ```bash
   pip install "rembg[cli]"
   rembg i supplier.jpg product.png
   ```
3. **Place and relight it in a scene** with
   [IC-Light](https://github.com/lllyasviel/IC-Light), inside
   [ComfyUI](https://github.com/comfyanonymous/ComfyUI) (node workflow) or
   IC-Light's own Gradio app. Give it the cut-out plus a scene prompt, e.g.
   *"on a light oak bedside table, warm evening light, cream linen bedding,
   soft focus background, interior photography"*. IC-Light keeps the product's
   shape and colours and relights it to match the scene.
4. **Check it against the supplier photo**: same shape, colour, size and parts.
   Reject any output that changes the product.
5. Save as `public/images/products/<product-id>/lifestyle-1.jpg` (square,
   1080x1080 or larger) and add it to the product's `images` after the cards.

Scene style for Ze Home Finds: warm natural light, cream/oak/linen tones,
terracotta accents, no clutter, no blue tones, no stock-photo people.

Check each model's licence before commercial use. Some IC-Light and
background-removal model weights are non-commercial. rembg's default `u2net`
model is MIT-licensed.
