import { NextRequest, NextResponse } from 'next/server'
import { generateSignature } from '@/lib/payfast'

const PAYFAST_IPS = [
  '197.97.145.144',
  '197.97.145.145',
  '197.97.145.146',
  '197.97.145.147',
  '41.74.179.194',
  '41.74.179.195',
  '41.74.179.196',
  '41.74.179.197',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = Object.fromEntries(new URLSearchParams(body))

    // Verify source IP in production
    if (process.env.PAYFAST_SANDBOX !== 'true') {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? ''
      if (!PAYFAST_IPS.includes(ip)) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    // Verify signature
    const { signature, ...rest } = params
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
    const expected = generateSignature(rest, passphrase)

    if (expected !== signature) {
      return new NextResponse('Invalid signature', { status: 400 })
    }

    // Verify the notification is for this merchant
    if (params.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const paymentStatus = params.payment_status
    const orderId = params.m_payment_id

    if (paymentStatus === 'COMPLETE') {
      console.log(JSON.stringify({
        event: 'order_complete',
        orderId,
        amount: params.amount,
        pfPaymentId: params.pf_payment_id,
        timestamp: new Date().toISOString(),
      }))
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('PayFast ITN error:', err)
    return new NextResponse('Error', { status: 500 })
  }
}
