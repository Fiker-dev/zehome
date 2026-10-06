import { NextRequest, NextResponse } from 'next/server'
import products from '@/data/products.json'
import { buildPayFastParams, createOrderId } from '@/lib/payfast'
import { appendOrderRow } from '@/lib/sheets'
import { supplierOrderNote } from '@/lib/supplier'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, address, city, province, postalCode, items } = body

    if (!firstName || !lastName || !email || !phone || !address || !city || !province || !postalCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Price the order from our own product data, never from the browser
    const lines = Array.isArray(items)
      ? items.map((item: { id?: unknown; quantity?: unknown }) => ({
          product: products.find((p) => p.id === item.id && p.inStock),
          quantity: Number(item.quantity),
        }))
      : []
    const validLines = lines.filter(
      (l) => l.product && Number.isInteger(l.quantity) && l.quantity >= 1 && l.quantity <= 10
    )
    if (validLines.length === 0 || validLines.length !== lines.length) {
      return NextResponse.json({ error: 'Invalid cart' }, { status: 400 })
    }
    const amount = validLines.reduce((sum, l) => sum + l.product!.price * l.quantity, 0)
    const itemName = validLines.map((l) => `${l.product!.name} x${l.quantity}`).join(', ')

    const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
    const amountValue = amount.toFixed(2)
    const orderId = createOrderId(amountValue)
    const product = itemName.substring(0, 100)
    const returnUrl = new URL('/order-success', storeUrl)
    const cancelUrl = new URL('/api/payfast/cancel', storeUrl)
    const notifyUrl = new URL('/api/payfast/notify', storeUrl)

    returnUrl.searchParams.set('m_payment_id', orderId)
    cancelUrl.searchParams.set('orderId', orderId)

    await appendOrderRow({
      orderId,
      date: new Date().toISOString(),
      firstName: String(firstName),
      lastName: String(lastName),
      email: String(email),
      phone: String(phone),
      address: String(address),
      city: String(city),
      province: String(province),
      postalCode: String(postalCode),
      product,
      amount: amountValue,
      paymentStatus: 'Pending payment',
      dispatchStatus: 'Awaiting payment',
      reminder: supplierOrderNote(validLines.map((l) => ({ id: l.product!.id, quantity: l.quantity }))),
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
      custom_str1: String(phone),
      custom_str2: String(address),
      custom_str3: String(city),
      custom_str4: String(province),
      custom_str5: String(postalCode),
    })

    return NextResponse.json(params)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
