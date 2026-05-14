import { NextRequest, NextResponse } from 'next/server'
import { buildPayFastParams } from '@/lib/payfast'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, amount, itemName } = body

    if (!firstName || !lastName || !email || !amount || !itemName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
    const orderId = `ORD-${Date.now()}`

    const params = buildPayFastParams({
      merchant_id: process.env.PAYFAST_MERCHANT_ID ?? '',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY ?? '',
      return_url: `${storeUrl}/order-success`,
      cancel_url: `${storeUrl}/order-cancelled`,
      notify_url: `${storeUrl}/api/payfast/notify`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: String(itemName).substring(0, 100),
    })

    return NextResponse.json(params)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
