import { google } from 'googleapis'

export interface OrderRow {
  orderId: string
  date: string
  name: string
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
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const sheetId = process.env.GOOGLE_SHEET_ID

  if (!clientEmail || !privateKey || !sheetId) {
    console.warn('Google Sheets env vars not set — skipping sheet log')
    return
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Orders!A:L',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.orderId,
        row.date,
        row.name,
        row.email,
        row.phone,
        row.address,
        row.city,
        row.province,
        row.postalCode,
        row.product,
        row.amount,
        row.status,
      ]],
    },
  })
}
