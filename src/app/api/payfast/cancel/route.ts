import { NextRequest, NextResponse } from 'next/server'
import { ORDER_ID_PATTERN } from '@/lib/payfast'
import { clientIp, rateLimited } from '@/lib/security'
import { appendOrderRow } from '@/lib/sheets'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId') ?? ''
  const redirectUrl = new URL('/order-cancelled', req.nextUrl.origin)

  // Only log real-looking order IDs (anyone can call this URL), and not floods
  if (ORDER_ID_PATTERN.test(orderId) && !rateLimited(`cancel:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    redirectUrl.searchParams.set('orderId', orderId)

    await appendOrderRow({
      orderId,
      date: new Date().toISOString(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      product: '',
      amount: '',
      paymentStatus: 'Cancelled before payment',
      dispatchStatus: 'Payment cancelled',
      reminder: 'Buyer returned from PayFast cancel URL',
    })
  }

  return NextResponse.redirect(redirectUrl)
}
