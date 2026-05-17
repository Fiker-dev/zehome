import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    PAYFAST_MERCHANT_ID:  !!process.env.PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY: !!process.env.PAYFAST_MERCHANT_KEY,
    PAYFAST_PASSPHRASE:   !!process.env.PAYFAST_PASSPHRASE,
    PAYFAST_SANDBOX:      process.env.PAYFAST_SANDBOX ?? '(not set)',
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL ?? '(not set)',
    GOOGLE_SHEETS_WEBHOOK_URL: !!process.env.GOOGLE_SHEETS_WEBHOOK_URL,
  })
}
