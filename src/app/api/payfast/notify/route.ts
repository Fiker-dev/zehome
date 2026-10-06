import { NextRequest, NextResponse } from 'next/server'
import { confirmItnWithPayFast, orderAmountMatches, verifyItnSignature } from '@/lib/payfast'
import { appendOrderRow } from '@/lib/sheets'
import { linesFromItemName, supplierOrderNote } from '@/lib/supplier'

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
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? ''
      if (!PAYFAST_IPS.includes(ip)) {
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

    // A customer can edit the amount in the browser before it reaches
    // PayFast, so only dispatch when they paid what the server charged.
    if (
      paymentStatus?.toUpperCase() === 'COMPLETE' &&
      !orderAmountMatches(orderId ?? '', params.amount_gross ?? '')
    ) {
      mappedStatus = {
        paymentStatus: 'Paid — amount does not match order',
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
        mappedStatus.paymentStatus === 'Paid' ? supplierOrderNote(linesFromItemName(params.item_name ?? '')) : '',
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
