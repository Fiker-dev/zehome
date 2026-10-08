import crypto from 'crypto'

export interface PayFastParams {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
  // Delivery address passed through PayFast custom fields
  custom_str1?: string // phone
  custom_str2?: string // street address
  custom_str3?: string // city
  custom_str4?: string // province
  custom_str5?: string // postal code
}

// PHP urlencode(), which PayFast uses when it signs: spaces become '+' and
// !'()*~ are percent-encoded (encodeURIComponent leaves those alone).
function pfEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+')
}

// ITN fields joined in the order PayFast sent them, up to the signature.
// This is both what PayFast signs and what its validate endpoint expects.
export function itnParamString(body: string): string {
  const parts: string[] = []
  for (const [key, value] of new URLSearchParams(body)) {
    if (key === 'signature') break
    parts.push(`${key}=${pfEncode(value)}`)
  }
  return parts.join('&')
}

export function verifyItnSignature(body: string, passphrase = ''): boolean {
  const signature = new URLSearchParams(body).get('signature') ?? ''
  let str = itnParamString(body)
  if (passphrase) str += `&passphrase=${pfEncode(passphrase.trim())}`
  const expected = crypto.createHash('md5').update(str).digest('hex')
  return signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// Ask PayFast to confirm the ITN really came from them.
export async function confirmItnWithPayFast(body: string, sandbox: boolean): Promise<boolean> {
  const host = sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za'
  const res = await fetch(`https://${host}/eng/query/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: itnParamString(body),
    signal: AbortSignal.timeout(10000),
  })
  return (await res.text()).trim() === 'VALID'
}

// Order IDs carry an HMAC of the amount AND the cart (item_description) the
// server priced, so the ITN can prove the customer paid that amount for those
// items, even though the PayFast form itself is unsigned and editable in the
// browser. (Signing the amount alone let a buyer pay for a cheap item and edit
// the cart to list expensive ones.) The key must be secret: the merchant key
// is sent to the browser, so it is never used.
const signingSecret = () => process.env.ORDER_SIGNING_SECRET || process.env.PAYFAST_PASSPHRASE || ''

function orderTag(orderRef: string, amount: string, cart: string): string {
  return crypto
    .createHmac('sha256', signingSecret())
    .update(`${orderRef}|${Number(amount).toFixed(2)}|${cart}`)
    .digest('hex')
    .slice(0, 16)
}

export const ORDER_ID_PATTERN = /^(ORD-\d{13})-([0-9a-f]{16})$/

export function createOrderId(amount: string, cart: string): string {
  const ref = `ORD-${Date.now()}`
  return `${ref}-${orderTag(ref, amount, cart)}`
}

export function orderMatches(orderId: string, amountPaid: string, cart: string): boolean {
  if (!signingSecret()) {
    console.error('No ORDER_SIGNING_SECRET or PAYFAST_PASSPHRASE set: cannot verify orders')
    return false
  }
  const match = ORDER_ID_PATTERN.exec(orderId)
  if (!match) return false
  const expected = orderTag(match[1], amountPaid, cart)
  return crypto.timingSafeEqual(Buffer.from(match[2]), Buffer.from(expected))
}

export function buildPayFastParams(fields: PayFastParams): Record<string, string> {
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true'

  const params: Record<string, string> = {
    merchant_id: fields.merchant_id,
    merchant_key: fields.merchant_key,
    return_url: fields.return_url,
    cancel_url: fields.cancel_url,
    notify_url: fields.notify_url,
    name_first: fields.name_first,
    name_last: fields.name_last,
    email_address: fields.email_address,
    m_payment_id: fields.m_payment_id,
    amount: fields.amount,
    item_name: fields.item_name,
    ...(fields.item_description ? { item_description: fields.item_description } : {}),
    ...(fields.custom_str1 ? { custom_str1: fields.custom_str1 } : {}),
    ...(fields.custom_str2 ? { custom_str2: fields.custom_str2 } : {}),
    ...(fields.custom_str3 ? { custom_str3: fields.custom_str3 } : {}),
    ...(fields.custom_str4 ? { custom_str4: fields.custom_str4 } : {}),
    ...(fields.custom_str5 ? { custom_str5: fields.custom_str5 } : {}),
  }

  return {
    ...params,
    _endpoint: isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process',
  }
}
