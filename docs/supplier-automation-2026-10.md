# Automating supplier orders (Oct 2026)

## Now: one-click buy (human pays)
Every paid order emails fikerzabate16@gmail.com with a "BUY NOW" link:
`https://perfectdealz.co.za/cart/<variant>:<qty>,…?checkout[shipping_address]…`
It opens Perfect Dealz checkout with the exact items and (where Shopify honours
the prefill) the customer's delivery address. Owner checks the address and pays.
Nothing is bought without the owner seeing it.

## Why not fully automatic yet
Perfect Dealz is a retail Shopify store with no reseller ordering API. A bot
filling their checkout would need the owner's card stored on a server
(security + PCI risk), breaks whenever their site changes, and may breach
their terms. Software should not spend the owner's money unattended.

## Path to hands-off (needs the supplier)
Ask Perfect Dealz (WhatsApp 064 601 3518) — message to send:

> Hi Perfect Dealz, I run Ze Home Finds (zehomefinds.co.za) and order your
> products for my customers, shipped to them directly. To streamline this:
> 1. Can dropshippers place orders by email/API (we send item + customer
>    address automatically), and pay weekly/monthly or from a prepaid balance?
> 2. Do you ship unbranded (no Perfect Dealz invoice/flyers in the parcel)?
> 3. What is your delivery fee per parcel for dropship orders, and does it
>    change for 2+ items?
> 4. Are there dropship/bulk prices for these items: steam pet brush, lint
>    roller, dog water bottle, S40 ice roller, makeup brush cleaner, scalp
>    comb, flame diffuser, mini massage gun, 3-in-1 vacuum, hair dryer brush,
>    mushroom salt lamp?
> Thank you!

If they accept email orders on account: the Apps Script can email the order
straight to them (cc owner) on payment — fully automatic, owner notified.
Alternatives with real APIs: CJdropshipping (wallet payment, CN shipping),
Dropstore (dropstore.co.za, SA stock) — both can auto-place orders on the
PayFast "COMPLETE" notification.
