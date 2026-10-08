import { NextRequest, NextResponse } from 'next/server'
import products from '@/data/products.json'
import { buildPayFastParams, createOrderId } from '@/lib/payfast'
import { cleanText, clientIp, rateLimited } from '@/lib/security'
import { appendOrderRow } from '@/lib/sheets'
import { cartCode, supplierOrderNote } from '@/lib/supplier'

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  try {
    // Each call writes a row to the order sheet, so slow down floods
    if (rateLimited(`params:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
    }

    const body = await req.json()
    const firstName = cleanText(body?.firstName, 50)
    const lastName = cleanText(body?.lastName, 50)
    const email = cleanText(body?.email, 100)
    const phone = cleanText(body?.phone, 20)
    const address = cleanText(body?.address, 200)
    const city = cleanText(body?.city, 60)
    const province = cleanText(body?.province, 30)
    const postalCode = cleanText(body?.postalCode, 10)
    const items: unknown = body?.items

    if (!firstName || !lastName || !email || !phone || !address || !city || !province || !postalCode) {
      return NextResponse.json({ error: 'Please fill in every field (and keep each one short).' }, { status: 400 })
    }
    const invalid =
      (!EMAIL.test(email) && 'Please enter a valid email address.') ||
      (!/^[+0-9 ()-]{9,20}$/.test(phone) && 'Please enter a valid phone number.') ||
      (!/^\d{4}$/.test(postalCode) && 'Please enter your 4-digit postal code.') ||
      (!SA_PROVINCES.includes(province) && 'Please choose your province.')
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 })
    }

    // Price the order from our own product data, never from the browser
    const lines = Array.isArray(items) && items.length <= 20
      ? items.map((item: { id?: unknown; quantity?: unknown }) => ({
          product: products.find((p) => p.id === item?.id && p.inStock),
          quantity: Number(item?.quantity),
        }))
      : []
    const validLines = lines.filter(
      (l) => l.product && Number.isInteger(l.quantity) && l.quantity >= 1 && l.quantity <= 10
    )
    if (validLines.length === 0 || validLines.length !== lines.length) {
      return NextResponse.json({ error: 'Invalid cart' }, { status: 400 })
    }
    const orderLines = validLines.map((l) => ({ id: l.product!.id, quantity: l.quantity }))
    const amount = validLines.reduce((sum, l) => sum + l.product!.price * l.quantity, 0)
    const itemName = validLines.map((l) => `${l.product!.name} x${l.quantity}`).join(', ')
    // Signed into the order ID; PayFast limits item_description to 255 chars
    const cart = cartCode(orderLines)
    if (cart.length > 255) {
      return NextResponse.json({ error: 'Too many different items in one order' }, { status: 400 })
    }

    const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
    const amountValue = amount.toFixed(2)
    const orderId = createOrderId(amountValue, cart)
    const product = itemName.substring(0, 100)
    const returnUrl = new URL('/order-success', storeUrl)
    const cancelUrl = new URL('/api/payfast/cancel', storeUrl)
    const notifyUrl = new URL('/api/payfast/notify', storeUrl)

    returnUrl.searchParams.set('m_payment_id', orderId)
    cancelUrl.searchParams.set('orderId', orderId)

    await appendOrderRow({
      orderId,
      date: new Date().toISOString(),
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      product: itemName,
      amount: amountValue,
      paymentStatus: 'Pending payment',
      dispatchStatus: 'Awaiting payment',
      reminder: supplierOrderNote(orderLines),
    })

    const params = buildPayFastParams({
      merchant_id: process.env.PAYFAST_MERCHANT_ID ?? '',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY ?? '',
      return_url: returnUrl.toString(),
      cancel_url: cancelUrl.toString(),
      notify_url: notifyUrl.toString(),
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: orderId,
      amount: amountValue,
      item_name: product,
      item_description: cart,
      custom_str1: phone,
      custom_str2: address,
      custom_str3: city,
      custom_str4: province,
      custom_str5: postalCode,
    })

    return NextResponse.json(params)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
