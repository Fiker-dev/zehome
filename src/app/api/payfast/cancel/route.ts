import { NextRequest, NextResponse } from 'next/server'
import { appendOrderRow } from '@/lib/sheets'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId') ?? ''
  const redirectUrl = new URL('/order-cancelled', req.nextUrl.origin)

  if (orderId) {
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
