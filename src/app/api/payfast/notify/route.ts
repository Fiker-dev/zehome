import { NextRequest, NextResponse } from 'next/server'
import { confirmItnWithPayFast, orderMatches, verifyItnSignature } from '@/lib/payfast'
import { clientIp } from '@/lib/security'
import { appendOrderRow } from '@/lib/sheets'
import { linesFromCartCode, supplierOrderNote } from '@/lib/supplier'

// PayFast's ITN server ranges (197.97.145.144/28 and 41.74.179.192/27). The
// old list held 8 single IPs, so ITNs from the rest of the range were refused
// and those paid orders were never logged. PayFast's validate call below is
// the stronger check; this just drops obvious junk early.
const PAYFAST_RANGES: [number, number][] = [
  [ipToInt('197.97.145.144'), 28],
  [ipToInt('41.74.179.192'), 27],
]

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return -1
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

function isPayFastIp(ip: string): boolean {
  const n = ipToInt(ip)
  return n >= 0 && PAYFAST_RANGES.some(([base, bits]) => n >>> (32 - bits) === base >>> (32 - bits))
}

function mapPaymentStatus(status = '') {
  switch (status.toUpperCase()) {
    case 'COMPLETE':
      return {
        paymentStatus: 'Paid',
        dispatchStatus: 'Awaiting dispatch',
      }
    case 'PENDING':
      return {
        paymentStatus: 'Pending via PayFast',
        dispatchStatus: 'Awaiting payment',
      }
    case 'FAILED':
      return {
        paymentStatus: 'Failed',
        dispatchStatus: 'Payment failed',
      }
    case 'CANCELLED':
      return {
        paymentStatus: 'Cancelled',
        dispatchStatus: 'Payment cancelled',
      }
    default:
      return {
        paymentStatus: status ? `PayFast status: ${status}` : 'PayFast status received',
        dispatchStatus: 'Review payment status',
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = Object.fromEntries(new URLSearchParams(body))

    // Verify source IP in production
    if (process.env.PAYFAST_SANDBOX !== 'true') {
      if (!isPayFastIp(clientIp(req))) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    // Verify signature (fields in the order PayFast sent them)
    if (!verifyItnSignature(body, process.env.PAYFAST_PASSPHRASE ?? '')) {
      return new NextResponse('Invalid signature', { status: 400 })
    }

    // Verify the notification is for this merchant
    if (params.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Confirm with PayFast's servers that they sent this notification
    const isSandbox = process.env.PAYFAST_SANDBOX === 'true'
    if (!(await confirmItnWithPayFast(body, isSandbox))) {
      return new NextResponse('PayFast did not confirm notification', { status: 400 })
    }

    const paymentStatus = params.payment_status
    const orderId = params.m_payment_id
    let mappedStatus = mapPaymentStatus(paymentStatus)

    // A customer can edit the amount and cart in the browser before they
    // reach PayFast, so only dispatch when they paid what the server charged
    // for the cart the server priced (both are signed into the order ID).
    const cart = params.item_description ?? ''
    if (
      paymentStatus?.toUpperCase() === 'COMPLETE' &&
      !orderMatches(orderId ?? '', params.amount_gross ?? '', cart)
    ) {
      mappedStatus = {
        paymentStatus: 'Paid — amount or items do not match order',
        dispatchStatus: 'DO NOT DISPATCH — check payment',
      }
    }

    await appendOrderRow({
      orderId: orderId ?? '',
      date: new Date().toISOString(),
      firstName: params.name_first ?? '',
      lastName: params.name_last ?? '',
      email: params.email_address ?? '',
      phone: params.custom_str1 ?? '',
      address: params.custom_str2 ?? '',
      city: params.custom_str3 ?? '',
      province: params.custom_str4 ?? '',
      postalCode: params.custom_str5 ?? '',
      product: params.item_name ?? '',
      amount: params.amount_gross ?? '',
      paymentStatus: mappedStatus.paymentStatus,
      dispatchStatus: mappedStatus.dispatchStatus,
      reminder: [
        params.pf_payment_id ? `PayFast ref: ${params.pf_payment_id}` : '',
        // On a good paid order, put the supplier shopping list right on the row
        mappedStatus.paymentStatus === 'Paid' ? supplierOrderNote(linesFromCartCode(cart)) : '',
      ].filter(Boolean).join(' · '),
    })

    console.log(JSON.stringify({
      event: 'payfast_itn',
      orderId,
      paymentStatus,
      amount: params.amount_gross,
      pfPaymentId: params.pf_payment_id,
      timestamp: new Date().toISOString(),
    }))

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('PayFast ITN error:', err)
    return new NextResponse('Error', { status: 500 })
  }
}
