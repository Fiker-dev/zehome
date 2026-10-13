import { NextRequest, NextResponse } from 'next/server'

// "Track my order" in the chat helper. The customer gives their order number
// (full, or its last 6+ characters) and the phone number used at checkout; the
// Apps Script behind GOOGLE_SHEETS_WEBHOOK_URL only answers when both match,
// and only with a customer-facing stage (never the sheet's internal notes).

const STAGES = ['unpaid', 'preparing', 'shipped', 'cancelled', 'checking'] as const
type Stage = (typeof STAGES)[number]

// Best-effort brake on guessing (per server instance)
const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_TRIES = 10

function tooMany(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_TRIES
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (tooMany(ip)) {
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
        ref: String(o.ref ?? '').slice(0, 60),
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
