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
  status: string
}

export async function appendOrderRow(row: OrderRow): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('GOOGLE_SHEETS_WEBHOOK_URL is not set - skipping order log')
    return
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Google Sheets webhook failed: ${res.status} ${body}`)
    }
  } catch (err) {
    console.error('Google Sheets order log failed:', err)
  }
}
