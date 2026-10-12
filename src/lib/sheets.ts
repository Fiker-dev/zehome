import { sheetSafe } from './security'

export interface OrderRow {
  orderId: string
  date: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  product: string
  amount: string
  paymentStatus: string
  dispatchStatus: string
  reminder: string
}

interface AppendOrderRowOptions {
  throwOnError?: boolean
  timeoutMs?: number
}

export async function appendOrderRow(
  row: OrderRow,
  options: AppendOrderRowOptions = {}
): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    const err = new Error('GOOGLE_SHEETS_WEBHOOK_URL is not set - skipping order log')
    if (options.throwOnError) {
      throw err
    }
    console.warn(err.message)
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000)

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Neutralise spreadsheet formulas in customer-supplied text
      body: JSON.stringify({
        ...Object.fromEntries(
          // reminder carries the supplier cart link (with delivery address), so allow more
          Object.entries(row).map(([k, v]) => [k, sheetSafe(String(v).slice(0, k === 'reminder' ? 2500 : 500))])
        ),
        // Shared secret checked by the Apps Script (Script property WEBHOOK_SECRET),
        // so only the store can add rows or trigger "New paid order" emails.
        // Never written to the sheet.
        ...(process.env.GOOGLE_SHEETS_WEBHOOK_SECRET ? { secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET } : {}),
      }),
      signal: controller.signal,
    })

    const body = await res.text()
    if (!res.ok) {
      throw new Error(`Google Sheets webhook failed: ${res.status} ${body}`)
    }
    // Apps Script always answers 200; a refusal comes back as {"ok":false,"error":...}
    let reply: { ok?: boolean; error?: string } | null = null
    try {
      reply = JSON.parse(body)
    } catch {
      // Non-JSON (e.g. an HTML error page): treat as failure below
    }
    if (!reply || reply.ok !== true) {
      throw new Error(`Google Sheets webhook refused the row: ${reply?.error ?? 'unexpected response'}`)
    }
  } catch (err) {
    if (options.throwOnError) {
      throw err
    }
    console.error('Google Sheets order log failed:', err)
  } finally {
    clearTimeout(timeout)
  }
}
