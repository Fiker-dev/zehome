import { NextRequest, NextResponse } from 'next/server'
import { clientIp, ipBucket, rateLimited } from '@/lib/security'

// "Track my order" in the chat helper. The customer gives their order number
// (full, or its last 6+ characters) and the phone number used at checkout; the
// Apps Script behind GOOGLE_SHEETS_WEBHOOK_URL only answers when both match,
// and only with a customer-facing stage (never the sheet's internal notes).

const STAGES = ['unpaid', 'preparing', 'shipped', 'cancelled', 'checking'] as const
type Stage = (typeof STAGES)[number]

export async function POST(req: NextRequest) {
  // Best-effort brake on guessing (per instance; a Vercel Firewall rule is the hard limit)
  if (rateLimited(`lookup:${ipBucket(clientIp(req))}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many tries. Please wait a few minutes or WhatsApp us.' }, { status: 429 })
  }

  let body: { ref?: unknown; phone?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const ref = String(body.ref ?? '').trim()
  const phone = String(body.phone ?? '').replace(/\D/g, '')
  if (!/^[A-Za-z0-9-]{6,60}$/.test(ref) || phone.length < 9 || phone.length > 15) {
    return NextResponse.json(
      { error: 'Please enter your order number (or its last 6 characters) and the phone number you used at checkout.' },
      { status: 400 }
    )
  }

  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET
  if (!url || !secret) {
    return NextResponse.json({ error: 'Order lookup is not available right now. Please WhatsApp us.' }, { status: 503 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, action: 'lookup', ref, phone }),
      signal: controller.signal,
      cache: 'no-store',
    })
    const reply = (await res.json()) as {
      ok?: boolean
      found?: boolean
      order?: { ref?: string; date?: string; product?: string; amount?: string; stage?: string; tracking?: string }
    }
    if (!reply.ok) throw new Error('lookup refused')
    if (!reply.found || !reply.order) return NextResponse.json({ found: false })
    const o = reply.order
    const stage: Stage = STAGES.includes(o.stage as Stage) ? (o.stage as Stage) : 'checking'
    return NextResponse.json({
      found: true,
      order: {
        // Masked: the full ID is what the public cancel link accepts
        ref: `…${String(o.ref ?? '').slice(-6)}`,
        date: String(o.date ?? '').slice(0, 10),
        product: String(o.product ?? '').slice(0, 300),
        amount: String(o.amount ?? '').slice(0, 12),
        stage,
        tracking: stage === 'shipped' ? String(o.tracking ?? '').slice(0, 80) : '',
      },
    })
  } catch (err) {
    console.error('Order lookup failed:', err)
    return NextResponse.json({ error: 'We could not check your order just now. Please WhatsApp us.' }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
