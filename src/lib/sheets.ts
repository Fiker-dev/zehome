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
      body: JSON.stringify(row),
      signal: controller.signal,
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Google Sheets webhook failed: ${res.status} ${body}`)
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
